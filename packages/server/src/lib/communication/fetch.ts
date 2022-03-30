import FileType from 'file-type/browser';
import { promises as fs } from 'fs';
import fetch, { FetchError } from 'node-fetch';
import qs from 'query-string';
import { z } from 'zod';

import Logger from '../../common/logger';
import { config } from '../../server';
import { ResponseErrorSummary, transformZodErrorIntoResponseError } from '../../transformers/error';
import { joinPathsRaw } from '../../utils/resources';

/** Generic zod schema that's used to validate general API responses from external services. */
const RawResponseSchema = z.union([
    z.object({ status: z.literal('error'), message: z.string() }),
    z.object({ status: z.literal('ok') }).passthrough(),
]);

/** Methods that are valid HTTP fetch specifiers */
type RequestMethod = 'post' | 'get' | 'patch' | 'put' | 'delete';

/** The response type that makeRequest and friends return */
type ServiceResponse<T> =
    | {
          status: 'error';
          type: 'fetch' | 'service' | 'unknown';
          errors: ResponseErrorSummary;
      }
    | {
          status: 'ok';
          response: T;
      };

/**
 *
 * @param baseUrl - The base service endpoint to make a request to.
 * @param endpoint - The endpoint that's used to make the request to
 * @param query - If the URL should contain query parameters
 *
 * @returns The constructed URL
 */
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
 * @param baseUrl - The base service endpoint to make a request to.
 * @param endpoint - The endpoint that's used to make the request to
 * @param additional - Any additional parameters that the request should accept; any headers, query
 * and which 'method' the request should use to make a call.
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
    const url = buildUrl(baseUrl, endpoint, additional.query);
    Logger.info(`Attempting to download stream at: ${url}`);

    try {
        const rawResponse = await fetch(url, {
            headers: additional.headers,
            ...(typeof additional.method !== 'undefined' && { method: additional.method }),
        });

        if (rawResponse.status !== 200) {
            Logger.warn('Failed to download the stream from the external service.');
            return {
                status: 'error',
                type: 'service',
                errors: {
                    resource: { message: "Couldn't download the file due to non ok status code." },
                },
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
                errors: { resource: { message: "Couldn't compute mime-type from data." } },
            };
        }

        if (meta.mime !== 'application/zip') {
            Logger.warn("The mime-type from downloaded stream isn't an `application/zip`.");
            return {
                status: 'error',
                type: 'service',
                errors: {
                    resource: {
                        message: `Expected mime-type to be application/zip or plaintext, but received ${meta.mime}`,
                    },
                },
            };
        }

        const tmpFilePath = joinPathsRaw(config.tempFolder, `item-${new Date().getTime()}.zip`);

        try {
            Logger.info(`Attempting to save file at: ${tmpFilePath}`);
            await fs.writeFile(tmpFilePath, Buffer.from(blob));

            return { status: 'ok', response: tmpFilePath };
        } catch (e: unknown) {
            if (e instanceof Error) {
                if (typeof e.stack !== 'undefined') {
                    Logger.warn(`Failed to save file:\n${e.stack}`);
                } else {
                    Logger.warn(`Failed to save file:${e.message}`);
                }
            }

            return { status: 'error', type: 'service', errors: {} };
        }
    } catch (e: unknown) {
        if (e instanceof FetchError) {
            Logger.warn(
                `Failed to fetch: ${url.toString()}, code: ${e.code ?? 'unknown'}, reason: ${
                    e.message
                }`,
            );

            return {
                status: 'error',
                type: 'fetch',
                errors: {
                    resource: {
                        message: `Fetch external service failed with: '${e.message}'`,
                    },
                },
            };
        }

        if (e instanceof Error) {
            Logger.warn(`Service request failed with: ${e.message}`);
        }

        return { status: 'error', type: 'unknown', errors: {} };
    }
}

/**
 * Function to make a request to a given URL with additionally specified parameters.
 * The function validates that the request returns a valid HTTP status code, the
 * response matches the provided @param schema and that the request does not timeout.
 * This is a safe wrapper around request making and full validation of responses.
 *
 * @param baseUrl - The base service endpoint to make a request to.
 * @param endpoint - The endpoint that's used to make the request to
 * @param schema - A @see z.Schema that is used to validate the response.
 * @param additional - Any additional parameters that the request should accept; any headers, query
 * and which 'method' the request should use to make a call.
 *
 * @returns Validated response body from the request if it is successful, error object if not.
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
            timeout: 30000, // 30 seconds
        });

        const json: unknown = await rawResponse.json();
        const validation = RawResponseSchema.safeParse(json);

        if (!validation.success) {
            Logger.warn(
                `Service replied with an invalid format:\n${JSON.stringify(validation.error)}`,
            );
            return {
                status: 'error',
                type: 'service',
                errors: transformZodErrorIntoResponseError(validation.error),
            };
        }

        const response = validation.data;

        if (response.status === 'error') {
            Logger.warn(
                `Failed to make external response to: ${url.toString()}. 
                 Service responded with: ${response.message}`,
            );
            return {
                status: 'error',
                type: 'service',
                errors: {
                    resource: {
                        message: "Couldn't download response due to non ok status code.",
                    },
                },
            };
        }

        // Now let's validate the object with the provided schema
        const bodyValidation = schema.safeParse(json);

        if (bodyValidation.success) {
            return { status: 'ok', response: bodyValidation.data };
        }

        Logger.warn('Service replied with an invalid format');
        return {
            status: 'error',
            type: 'service',
            errors: transformZodErrorIntoResponseError(bodyValidation.error),
        };
    } catch (e: unknown) {
        if (e instanceof FetchError) {
            Logger.warn(
                `Failed to fetch: ${url.toString()}, code: ${e.code ?? 'unknown'}, reason: ${
                    e.message
                }`,
            );
            return {
                status: 'error',
                type: 'fetch',
                errors: {
                    resource: {
                        message: `Fetch external service failed with: '${e.message}'`,
                    },
                },
            };
        }

        // Logger.warn(`Service request failed with: ${e}`);
        return { status: 'error', type: 'unknown', errors: {} };
    }
}
