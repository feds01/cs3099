import UserCard from '.';
import { mockUser } from '../../test-utils/mocks/user';
import renderWithWrapper from '../../test-utils/render';

describe('UserCard tests', () => {
    it('renders user', () => {
        const mockedUser = mockUser();
        const { getByText } = renderWithWrapper(<UserCard user={mockedUser} />);

        expect(getByText(`@${mockedUser.username}`)).toBeInTheDocument();
    });
});
