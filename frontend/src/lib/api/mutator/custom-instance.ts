import Axios, { AxiosRequestConfig } from 'axios';

export const AXIOS_INSTANCE = Axios.create({
    baseURL: 'http://localhost:5000',
    headers: {
        'Access-Control-Allow-Headers': '*',
        'content-type': 'application/json',
    },
});

export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
    const source = Axios.CancelToken.source();
    const promise = AXIOS_INSTANCE({ ...config, cancelToken: source.token }).then(({ data }) => data) as Promise<T>;

    (promise as { cancel?: unknown } & Promise<T>).cancel = () => {
        source.cancel('Query was cancelled by React Query');
    };

    return promise;
};
