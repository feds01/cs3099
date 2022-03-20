import PublicationCard from '.';
import { mockPublication } from '../../test-utils/mocks/publication';
import renderWithWrapper from '../../test-utils/render';

describe('PublicationCard tests', () => {
    it('renders publication', () => {
        const mockedPublication = mockPublication();
        const { getByText } = renderWithWrapper(<PublicationCard publication={mockedPublication} />);

        expect(getByText(new RegExp(`${mockedPublication.name}`, 'im'))).toBeInTheDocument();
    });
});
