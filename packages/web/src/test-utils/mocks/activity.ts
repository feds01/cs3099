import { Activity } from '../../lib/api/models';
import { getGetActivityIdMock } from '../../lib/api/activity/activity.msw';

/**
 * Function use to create a mocked activity object. The function also
 * accepts a base DTO (Data Transfer Object) which will be used to
 * override some of the generated fields by the mock so that they
 * can be guaranteed to be the same every mock generation. This function
 * does not generate references
 *
 * @param baseDto - Base Data Transfer Object that's used to override generated fields.
 * @returns a mocked user DTO
 */
export function mockActivity(baseDto?: Partial<Activity>): Activity {
    const { references, ...mockedActivity } = getGetActivityIdMock().activity;

    return { ...mockedActivity, references: [], ...baseDto };
}
