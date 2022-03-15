import { Review } from "../../lib/api/models";
import { getGetReviewIdMock } from "../../lib/api/reviews/reviews.msw";

export function mockReview(baseDto?: Partial<Review>): Review {
    const mockedReview = getGetReviewIdMock().review;

    return { ...mockedReview, ...baseDto };
}
