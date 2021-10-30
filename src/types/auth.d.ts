import * as _jwt from 'jsonwebtoken';

declare module 'jsonwebtoken' {
    export interface JwtPayload {
        data: {
            id: string;
            username: string;
            email: string;
        };
    }
}
