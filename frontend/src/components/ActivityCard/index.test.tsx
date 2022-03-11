import ActivityCard from '.';
import { ActivityReference } from '../../lib/api/models';
import { mockPublication } from '../../test-utils/mocks/publication';
import { mockUser } from '../../test-utils/mocks/user';
import renderWithWrapper from '../../test-utils/render';

describe('ActivityCard tests', () => {
    it('renders message with no references', () => {
        const mockedMessage = 'This is an activity';
        const { getByText } = renderWithWrapper(<ActivityCard message={mockedMessage} references={[]} />);

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

        const { getByText } = renderWithWrapper(<ActivityCard message={mockedMessage} references={mockedReferences} />);

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

        const { getByText } = renderWithWrapper(<ActivityCard message={mockedMessage} references={mockedReferences} />);

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
        const mockedUser = mockUser({ username: 'primary' });

        const mockedMessage = 'did something <0>';
        const mockedReferences: ActivityReference[] = [
            {
                type: 'user',
                document: mockedUser,
            },
        ];

        const { asFragment } = renderWithWrapper(
            <ActivityCard message={mockedMessage} references={mockedReferences} />,
        );
        expect(asFragment()).toMatchSnapshot();
    });
});
