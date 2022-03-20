import ReviewCard from '.';
import { mockReview } from '../../test-utils/mocks/review';
import renderWithWrapper from '../../test-utils/render';

jest.mock('../../contexts/auth');

describe('ReviewCard tests', () => {
    it('renders review with owner', () => {
        const mockedReview = mockReview();
        const { getByText } = renderWithWrapper(<ReviewCard review={mockedReview} />);

        expect(getByText(`@${mockedReview.owner.username}`)).toBeInTheDocument();
    });
});
