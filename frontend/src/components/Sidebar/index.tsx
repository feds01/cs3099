import { ReactElement, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import PersonIcon from '@mui/icons-material/Person';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { styled, Theme, CSSObject } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { Button, Link } from '@mui/material';

const drawerWidth = 180;

const openedMixin = (theme: Theme, drawerWidth: number): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(5)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(5)} + 1px)`,
    },
});

interface SidebarProps {
    open: boolean;
}

const SidebarContainer = styled('div', { shouldForwardProp: (prop) => prop !== 'open' })<SidebarProps>(
    ({ theme, open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        background: '#fff',
        height: '100%',
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
            ...openedMixin(theme, drawerWidth),
        }),
        ...(!open && {
            ...closedMixin(theme),
        }),
    }),
);

const menuMap = [
    { title: 'Profile', icon: PersonIcon, href: '/' },
    { title: 'Publications', icon: FileUploadIcon, href: '/' },
    { title: 'Reviews', icon: RateReviewIcon, href: '/' },
];

export default function Sidebar(): ReactElement {
    const [open, setOpen] = useState<boolean>(false);

    return (
        <SidebarContainer open={open}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#f0f0f0',
                    justifyContent: 'space-between',
                    flex: 1,
                    height: '100%',
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    {menuMap.map((entry) => (
                        <Button key={entry.title} variant="text" color="inherit">
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'left',
                                    flex: 1,
                                    color: 'rgba(0, 0, 0, 0.54)',
                                }}
                            >
                                <Link href={entry.href}>
                                    <entry.icon color="inherit" sx={{ marginRight: open ? 1 : 0 }} />
                                    {open && <Box sx={{ fontWeight: 'bold' }}>{entry.title}</Box>}
                                </Link>
                            </Box>
                        </Button>
                    ))}
                </Box>
                {open ? (
                    <Button color="inherit" startIcon={<ChevronLeftIcon />} onClick={() => setOpen(!open)}>
                        Collapse
                    </Button>
                ) : (
                    <IconButton color="inherit" onClick={() => setOpen(!open)}>
                        <ChevronRightIcon color="inherit" />
                    </IconButton>
                )}
            </Box>
        </SidebarContainer>
    );
}
