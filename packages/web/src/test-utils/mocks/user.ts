import { User } from '../../lib/api/models';
import { getGetUserUsernameMock } from '../../lib/api/users/users.msw';

/**
 * Function use to create a mocked user object. The function also
 * accepts a base DTO (Data Transfer Object) which will be used to
 * override some of the generated fields by the mock so that they
 * can be guaranteed to be the same every mock generation.
 *
 * @param baseDto - Base Data Transfer Object that's used to override generated fields.
 * @returns a mocked user DTO
 */
export function mockUser(baseDto?: Partial<User>): User {
    const mockedUser = getGetUserUsernameMock().user;

    return { ...mockedUser, ...baseDto };
}
