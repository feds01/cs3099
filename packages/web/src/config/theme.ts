import { createTheme } from '@mui/material';

// The application theme
const Theme = createTheme({
    palette: {
        primary: {
            main: '#0076FF',
        },
        secondary: {
            main: '#37123C',
        },
        text: {
            primary: '#303035',
            secondary: '#303035',
        },
    },
    typography: {
        fontSize: 12,
        fontFamily: [
            'Noto Sans',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(','),
        button: {
            textTransform: 'none',
        },
    },
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 900,
            lg: 1200,
            xl: 1536,
        },
    },

    components: {
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    background: '#fff !important',
                },
            },
        },
        MuiTimelineItem: {
            styleOverrides: {
                root: {
                    '&:before': {
                        display: 'none',
                    },
                },
            },
        },
        MuiButton: {
            defaultProps: {
                disableRipple: true,
                disableElevation: true,
                variant: 'contained',
                size: 'small',
                sx: {
                    fontWeight: 'bold',
                },
            },
        },
    },
});

export default Theme;
