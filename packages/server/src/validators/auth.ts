import { z } from 'zod';

/** Basic JWT format schema */
export const IJwtSchema = z
    .string()
    .regex(/^([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_\-+/=]*)/, 'Invalid JSON Web Token.');

/**
 * This schema is used to validate headers that might have a JWT token stored in them in
 * the form of `Bearer <token>`. This function will attempt to validate this using a regex
 * and then transform it into just extracting the token and remove the 'Bearer ' prefix.
 */
export const IAuthHeaderSchema = z
    .string()
    .regex(
        /^Bearer ([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_\-+/=]*)/,
        'Invalid Authorization header format. Expecting `Bearer <token>`',
    )
    .transform((x) => {
        const [_, token] = x.split(' ');

        if (typeof token === 'undefined') {
            throw Error('Invalid schema for JWT');
        }

        return token;
    });
