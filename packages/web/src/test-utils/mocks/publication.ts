import { Publication } from '../../lib/api/models';
import { getGetPublicationUsernameNameMock } from '../../lib/api/publications/publications.msw';

/**
 * Function use to create a mocked publication object. The function also
 * accepts a base DTO (Data Transfer Object) which will be used to
 * override some of the generated fields by the mock so that they
 * can be guaranteed to be the same every mock generation.
 *
 * @param baseDto - Base Data Transfer Object that's used to override generated fields.
 * @returns a mocked publication DTO
 */
export function mockPublication(baseDto?: Partial<Publication>): Publication {
    const mockedUser = getGetPublicationUsernameNameMock().publication;

    return { ...mockedUser, ...baseDto };
}
