import { Review } from '../../lib/api/models';
import { getGetReviewIdMock } from '../../lib/api/reviews/reviews.msw';

/**
 * Function use to create a mocked review object. The function also
 * accepts a base DTO (Data Transfer Object) which will be used to
 * override some of the generated fields by the mock so that they
 * can be guaranteed to be the same every mock generation.
 *
 * @param baseDto - Base Data Transfer Object that's used to override generated fields.
 * @returns a mocked user DTO
 */
export function mockReview(baseDto?: Partial<Comment>): Comment {
    const mockedReview = getGetReviewIdMock().review;

    return { ...mockedReview, ...baseDto };
}
