import Theme from '../config/theme';
import { ThemeProvider } from '@mui/material';
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react-markdown/lib/react-markdown';
import { MemoryRouter } from 'react-router-dom';

/**
 * Helper function for tests that use the rendering function. This will wrap whatever is sent
 * to render wrapped in a ThemeProvider so that inner components can rely on 'useStyles()' and
 * other @mui functions.
 *
 * @param component
 * @param options
 * @returns
 */
export default function renderWithWrapper(component: ReactElement, options?: RenderOptions) {
    const Wrapper: React.ComponentType = ({ children }) => (
        <ThemeProvider theme={Theme}>
            <MemoryRouter>{children}</MemoryRouter>
        </ThemeProvider>
    );

    return render(component, { wrapper: Wrapper, ...options });
}
