import UserLink from '.';
import { mockUser } from '../../test-utils/mocks/user';
import renderWithWrapper from '../../test-utils/render';

describe('UserLink tests', () => {
    it('renders UserLink', () => {
        const mockedUser = mockUser();
        const { getByText } = renderWithWrapper(<UserLink user={mockedUser} />);

        expect(getByText(`@${mockedUser.username}`)).toBeInTheDocument();
    });
});
