import { z, ZodError } from 'zod';
import qs from 'query-string';
import FileType from 'file-type/browser';
import fetch, { FetchError } from 'node-fetch';
import { promises as fs } from 'fs';
import Logger from '../common/logger';
import { joinPathsRaw } from './resources';
import { config } from '../server';

const RawResponseSchema = z.union([
    z.object({ status: z.literal('error'), message: z.string() }),
    z.object({ status: z.literal('ok') }).passthrough(),
]);

type RequestMethod = 'post' | 'get' | 'patch' | 'put' | 'delete';

type ServiceResponse<T> =
    | {
          status: 'error';
          type: 'fetch' | 'service' | 'unknown';
          errors?: ZodError | string;
      }
    | {
          status: 'ok';
          data: T;
      };

function buildUrl(baseUrl: string, endpoint: string, query?: Record<string, string>): string {
    const url = new URL(endpoint, baseUrl);

    const endpointUri = qs.stringifyUrl({
        url: url.toString(),
        ...(typeof query !== 'undefined' && { query }),
    });

    return endpointUri;
}

/**
 * Function to attempt to download an octet stream from a given service.
 *
 * @param baseUrl
 * @param endpoint
 * @param additional
 *
 * @returns the file path to where it was saved.
 */
export async function downloadOctetStream(
    baseUrl: string,
    endpoint: string,
    additional: {
        query?: Record<string, string>;
        method?: RequestMethod;
        headers: Record<string, string>;
    },
): Promise<ServiceResponse<string>> {
    const url = buildUrl(baseUrl, endpoint, additional?.query);
    Logger.info(`Attempting to download stream at: ${url}`);

    try {
        const rawResponse = await fetch(url, {
            headers: additional.headers,
            ...(typeof additional?.method !== 'undefined' && { method: additional.method }),
        });

        if (rawResponse.status !== 200) {
            Logger.warn(
                `Failed to download the stream from the external service. Body responded with ${rawResponse.body}`,
            );
            return {
                status: 'error',
                type: 'service',
                errors: "Couldn't download the file due to non ok status code.",
            };
        }

        // get the blob from the response
        const blob = await rawResponse.arrayBuffer();

        // determine if this blob is a simple file type or an application/json
        const meta = await FileType.fromBuffer(blob);

        if (!meta) {
            Logger.warn('Failed to deduce mime-type from downloaded stream.');

            return {
                status: 'error',
                type: 'service',
                errors: "Couldn't compute mime-type from data.",
            };
        }

        if (meta.mime !== 'application/zip' && !meta.mime.startsWith('text')) {
            Logger.warn(
                "The mime-type from downloaded stream isn't an `application/zip` or `text/*`.",
            );
            return {
                status: 'error',
                type: 'service',
                errors: new ZodError([
                    {
                        code: 'custom',
                        path: [],
                        message: `Expected mime-type to be application/zip or plaintext, but received ${meta.mime}`,
                    },
                ]),
            };
        }

        const tmpFilePath = joinPathsRaw(
            config.tempFolder,
            `publication-${new Date().getTime()}.zip`,
        );

        try {
            Logger.info(`Attempting to save file at: ${tmpFilePath}`);

            // @@Wrapping: We should move this function into it's own wrapper!
            await fs.appendFile(tmpFilePath, Buffer.from(blob));

            return { status: 'ok', data: tmpFilePath };
        } catch (e: unknown) {
            Logger.warn('Failed to save file.');
            return { status: 'error', type: 'fetch' };
        }
    } catch (e: unknown) {
        if (e instanceof FetchError) {
            Logger.warn(
                `Failed to fetch: ${url.toString()}, code: ${e.code ?? 'unknown'}, reason: ${
                    e.message
                }`,
            );
            return { status: 'error', type: 'fetch' };
        }

        Logger.warn(`Service request failed with: ${e}`);
        return { status: 'error', type: 'unknown' };
    }
}

/**
 *
 * @param baseUrl
 * @param endpoint
 * @param additional
 */
export async function makeRequest<I, O>(
    baseUrl: string,
    endpoint: string,
    schema: z.Schema<O, z.ZodTypeDef, I>,
    additional?: {
        query?: Record<string, string>;
        method?: RequestMethod;
        headers?: Record<string, string>;
    },
): Promise<ServiceResponse<O>> {
    const url = buildUrl(baseUrl, endpoint, additional?.query);
    Logger.info(`Attempting to request external service at: ${url}`);

    try {
        const rawResponse = await fetch(url, {
            ...(typeof additional?.headers !== 'undefined' && { headers: additional.headers }),
            ...(typeof additional?.method !== 'undefined' && { method: additional.method }),
        });

        const json: unknown = await rawResponse.json();
        const validation = RawResponseSchema.safeParse(json);

        if (!validation.success) {
            Logger.warn(`Service replied with an invalid format:\n${validation.error}`);
            return { status: 'error', type: 'service', errors: validation.error };
        }

        const response = validation.data;

        if (response.status === 'error') {
            Logger.warn(
                `Failed to make external response to: ${url.toString()}. 
                 Service responded with: ${response.message}`,
            );
            return { status: 'error', type: 'service' };
        }

        const { status: _, ...rest } = response;

        // Now let's validate the object with the provided schema
        const bodyValidation = schema.safeParse(rest);

        if (bodyValidation.success) {
            return { status: 'ok', data: bodyValidation.data };
        }
        Logger.warn('Service replied with an invalid format');
        return { status: 'error', type: 'service', errors: bodyValidation.error };
    } catch (e: unknown) {
        if (e instanceof FetchError) {
            Logger.warn(
                `Failed to fetch: ${url.toString()}, code: ${e.code ?? 'unknown'}, reason: ${
                    e.message
                }`,
            );
            return { status: 'error', type: 'fetch' };
        }

        // Logger.warn(`Service request failed with: ${e}`);
        return { status: 'error', type: 'unknown' };
    }
}
