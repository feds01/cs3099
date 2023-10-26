import { VerifiedAuthState } from '../auth';
import { mockUser } from '../../test-utils/mocks/user';

/** Simple mock to imitate that a user has logged in */
export const useAuth = (): VerifiedAuthState => {
    return { session: mockUser(), isLoggedIn: true, token: 'token', refreshToken: 'token' };
};

export const useAuthRaw = (): VerifiedAuthState => {
    return { session: mockUser(), isLoggedIn: true, token: 'token', refreshToken: 'token' };
};

/** Simple mock to capture calls to authentication dispatch */
export const useDispatchAuth = jest.fn();
