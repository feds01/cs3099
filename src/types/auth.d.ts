export interface RegisteredUserTokenPayload {
    id: string;
    name: string;
    email: string;
}

export interface Token<T extends RegisteredUserTokenPayload> {
    data: T;
    exp: number;
    alg: string;
}

declare global {
    namespace Express {
        export interface Request {
            token?: Token;
        }
    }
}
