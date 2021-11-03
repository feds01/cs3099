import Axios, { AxiosRequestConfig } from 'axios';

export const AXIOS_INSTANCE = Axios.create({
    baseURL: 'http://localhost:5000',
    headers: {
        'Access-Control-Allow-Headers': 'Authorization, x-refresh-token',
        'content-type': 'application/json',
    },
});

AXIOS_INSTANCE.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');

    return {
        ...config,
        headers: token
            ? {
                  ...config.headers,
                  Authorization: `Bearer ${token}`,
                  ...(refreshToken && { 'x-refresh-token': refreshToken }),
              }
            : config.headers,
    };
});

// Since the server might send back refreshed tokens after each request, we should
// check this and set them as our new tokens in this case.
AXIOS_INSTANCE.interceptors.response.use((response) => {
    return response;
});

export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
    const source = Axios.CancelToken.source();
    const promise = AXIOS_INSTANCE({ ...config, cancelToken: source.token }).then(({ data }) => data) as Promise<T>;

    (promise as { cancel?: unknown } & Promise<T>).cancel = () => {
        source.cancel('Query was cancelled by React Query');
    };

    return promise;
};
