import ErrorBanner from '.';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import renderWithWrapper from '../../test-utils/render';

describe('ErrorBanner tests', () => {
    it('Renders error message', () => {
        const text = 'Rendered error message';

        const { getByText } = renderWithWrapper(<ErrorBanner message={text} />);

        expect(getByText(text)).toBeInTheDocument();
    });
});
