import PageLayout from '.';
import renderWithWrapper from '../../test-utils/render';

jest.mock('../../contexts/auth');

describe('PageLayout tests', () => {
    it('Renders simple paragraph', () => {
        const text = "Rendered text";

        const { getByText } = renderWithWrapper(
            <PageLayout sidebar={true} drawerWidth={240}>
                <p>{text}</p>
            </PageLayout>,
        );

        expect(getByText(text)).toBeInTheDocument();
    });
});
