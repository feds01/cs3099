import ErrorBanner from '.';
import renderWithWrapper from '../../test-utils/render';

describe('ErrorBanner tests', () => {
    it('Renders error message', () => {
        const text = 'Rendered error message';

        const { getByText } = renderWithWrapper(<ErrorBanner message={text} />);

        expect(getByText(text)).toBeInTheDocument();
    });
});
