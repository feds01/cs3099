import UserAvatar from '.';
import { mockUser } from '../../test-utils/mocks/user';
import renderWithWrapper from '../../test-utils/render';

describe('UserAvatar tests', () => {
    it('renders UserAvatar', () => {
        const mockedUser = mockUser({
            id: '123',
            email: 'someone@email.com',
            role: 'default',
            createdAt: 0,
        });
        const text = 'this is a children of UserAvatar';

        const { getByText } = renderWithWrapper(
            <UserAvatar {...mockedUser}>
                <p>{text}</p>
            </UserAvatar>,
        );

        expect(getByText(text)).toBeInTheDocument();
    });
});
