import ActivityCard from '.';
import { ActivityKind, ActivityReference, ActivityType } from '../../lib/api/models';
import { mockActivity } from '../../test-utils/mocks/activity';
import { mockPublication } from '../../test-utils/mocks/publication';
import { mockUser } from '../../test-utils/mocks/user';
import renderWithWrapper from '../../test-utils/render';

describe('ActivityCard tests', () => {
    it('renders message with no references', () => {
        const mockedMessage = 'This is an activity';
        const mockedActivity = mockActivity({ message: mockedMessage, references: [] });
        const { getByText } = renderWithWrapper(<ActivityCard activity={mockedActivity} />);

        // Ensure that the message in the file is rendered...
        expect(getByText(mockedMessage)).toBeInTheDocument();
    });

    it('renders message with single reference', () => {
        const mockedUser = mockUser();
        const mockedMessage = '<0> did something';
        const mockedReferences: ActivityReference[] = [
            {
                type: 'user',
                document: mockedUser,
            },
        ];
        const mockedActivity = mockActivity({ message: mockedMessage, references: mockedReferences });

        const { getByText } = renderWithWrapper(<ActivityCard activity={mockedActivity} />);

        // Ensure that the message in the file is rendered...
        expect(getByText(`@${mockedUser.username}`)).toBeInTheDocument();
    });

    it('renders message with multiple references', () => {
        const mockedUser = mockUser();
        const mockedPublication = mockPublication();

        const mockedMessage = '<0> and <1> did something';
        const mockedReferences: ActivityReference[] = [
            {
                type: 'user',
                document: mockedUser,
            },
            {
                type: 'publication',
                document: mockedPublication,
            },
        ];
        const mockedActivity = mockActivity({ message: mockedMessage, references: mockedReferences });

        const { getByText } = renderWithWrapper(<ActivityCard activity={mockedActivity} />);

        // Ensure that the message in the file is rendered...
        expect(getByText(`@${mockedUser.username}`)).toBeInTheDocument();
        expect(getByText(new RegExp(`${mockedPublication.name}`, 'im'))).toBeInTheDocument();
    });

    /**
     * This is a snapshot test example. It will render the component into HTML and
     * then compare to what is saved from the disk
     */
    it('renders message with reference at the end', () => {
        // We have to get a mocked user and then redefine
        const mockedUser = mockUser({ username: 'primary', name: 'Primary', profilePictureUrl: undefined });

        const mockedMessage = 'did something <0>';
        const mockedReferences: ActivityReference[] = [
            {
                type: 'user',
                document: mockedUser,
            },
        ];
        const mockedActivity = mockActivity({
            type: ActivityType.user,
            kind: ActivityKind.create,
            message: mockedMessage,
            owner: mockedUser,
            references: mockedReferences,
        });

        const { asFragment } = renderWithWrapper(<ActivityCard activity={mockedActivity} />);
        expect(asFragment()).toMatchSnapshot();
    });
});
