import fetch, { FetchError } from "node-fetch";
import Logger from "../common/logger";


type ServiceRawResponse = {
    status: "error",
    message: string;
} | {
    status: "ok"
    [key: string]: unknown,
}

type ServiceResponse<T> = {
    status: "error",
    type: "fetch" | "service" | "unknown"
} | {
    status: "ok"
    data: T
}

export async function makeRequest<T>(baseUrl: string, endpoint: string): Promise<ServiceResponse<T>> {
    const url = new URL(endpoint, baseUrl);

    // TODO: assert here that the baseUrl is a valid supergroup url.
    Logger.info(`Attempting to request external service at: ${url.toString()}`)

    try {
        const rawResponse = await fetch(url.toString());
        const response = await rawResponse.json() as ServiceRawResponse;

        if (response.status === "error") {
            Logger.warn(`Failed to make external response to: ${url.toString()}. Service responded with: ${response.message}`)
            return {status: "error", type: "service"}
    
        } else if (response.status === "ok") {
            const {status, ...rest} = response;
    
            return {status: "ok", data: rest as unknown as T};
        } else {
            Logger.warn(`Service replied with an invalid format`);
            return {status: "error", type: "service"};
        }
    } catch (e) {
        if (e instanceof FetchError) {
            Logger.warn(`Failed to fetch: ${url.toString()}`);
            return {status: "error", type: "fetch"}
        }

        return {status: "error", type: "unknown"};
    }
}
