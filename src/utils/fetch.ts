import { z } from 'zod';
import qs from 'query-string';
import fetch, { FetchError } from 'node-fetch';
import Logger from '../common/logger';

const RawResponseSchema = z.union([
    z.object({ status: z.literal('error'), message: z.string() }),
    z.object({ status: z.literal('ok') }).passthrough(),
]);

type ServiceResponse<T> =
    | {
          status: 'error';
          type: 'fetch' | 'service' | 'unknown';
      }
    | {
          status: 'ok';
          data: T;
      };

export async function makeRequest<I, O>(
    baseUrl: string,
    endpoint: string,
    schema: z.Schema<O, z.ZodTypeDef, I>,
    additional?: { query?: Record<string, string>; headers?: Record<string, string> },
): Promise<ServiceResponse<O>> {
    const url = new URL(endpoint, baseUrl);

    const endpointUri = qs.stringifyUrl({
        url: url.toString(),
        ...(typeof additional?.query !== 'undefined' && { query: additional.query }),
    });

    // TODO: assert here that the baseUrl is a valid supergroup url.
    Logger.info(`Attempting to request external service at: ${url.toString()}`);

    try {
        const rawResponse = await fetch(endpointUri, {
            ...(typeof additional?.headers !== 'undefined' && { headers: additional.headers }),
        });

        const json = await rawResponse.json();

        const validation = RawResponseSchema.safeParse(json);

        if (!validation.success) {
            Logger.warn('Service replied with an invalid format');
            return { status: 'error', type: 'service' };
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
        return { status: 'error', type: 'service' };
    } catch (e: unknown) {
        if (e instanceof FetchError) {
            Logger.warn(`Failed to fetch: ${url.toString()}`);
            return { status: 'error', type: 'fetch' };
        }

        return { status: 'error', type: 'unknown' };
    }
}
