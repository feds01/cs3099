import CommentCard from '.';
import { getReviewsMSW } from '../../lib/api/reviews/reviews.msw';
import { mockComment } from '../../test-utils/mocks/comment';
import renderWithWrapper from '../../test-utils/render';
import { format } from 'date-fns';

jest.mock('../../contexts/auth');

getReviewsMSW();

describe('CommentCard tests', () => {
    it('renders comment', () => {
        const mockedComment = mockComment({ edited: false });
        const { getByText, queryByText } = renderWithWrapper(<CommentCard comment={mockedComment} />);

        expect(getByText(`${mockedComment.contents}`)).toBeInTheDocument();
        expect(getByText(`@${mockedComment.author.username}`)).toBeInTheDocument();
        expect(queryByText('edited')).not.toBeInTheDocument();

        expect(getByText(new RegExp(`${format(mockedComment.updatedAt, 'do MMM')}`, 'im'))).toBeInTheDocument();
    });
});
