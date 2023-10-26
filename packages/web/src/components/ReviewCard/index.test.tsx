import ReviewCard from '.';
import { ReviewStatus } from '../../lib/api/models';
import { mockPublication } from '../../test-utils/mocks/publication';
import { mockReview } from '../../test-utils/mocks/review';
import { mockUser } from '../../test-utils/mocks/user';
import renderWithWrapper from '../../test-utils/render';

jest.mock('../../contexts/auth');

describe('ReviewCard tests', () => {
    it('renders review with owner', () => {
        const mockedUser = mockUser({ username: 'user1' });
        const mockedReview = mockReview({
            status: ReviewStatus.completed,
            id: '123',
            publication: mockPublication({
                owner: mockedUser,
                name: 'test-publication',
                revision: 'test-revision',
            }),
            owner: mockedUser,
        });

        const { getByText } = renderWithWrapper(<ReviewCard review={mockedReview} />);

        expect(getByText(`@${mockedReview.owner.username}`)).toBeInTheDocument();
    });
});
