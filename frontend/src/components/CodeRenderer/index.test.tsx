import CodeRenderer from '.';
import { mockPublication } from '../../test-utils/mocks/publication';
import { mockUser } from '../../test-utils/mocks/user';
import { getGetReviewIdMock } from '../../lib/api/reviews/reviews.msw';
import renderWithWrapper from '../../test-utils/render';

describe('CodeRenderer tests', () => {
  it('ill figure out what this test does later', () => {
      const mockedReview = getGetReviewIdMock().review;
      const { getByText } = renderWithWrapper(<CodeRenderer
        contents={""}
        filename={""}
        lineNumbers={true}
        lineOffset={5}
        language={"typescript"}
        review={mockedReview}/>);

  })  
})