import { ReactElement, useState } from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import { Button, Tooltip } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { styled, Theme, CSSObject } from '@mui/material/styles';

import { TiHome } from 'react-icons/ti';
import { RiContactsBookUploadLine } from 'react-icons/ri';

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
        borderRight: 1,
        borderColor: 'divider',
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
    { title: 'Home', icon: TiHome, href: '/' },
    { title: 'Create publication', icon: RiContactsBookUploadLine, href: '/publication/create' },
    { title: 'Explore', icon: SearchIcon, href: '/explore' },
];

export default function Sidebar(): ReactElement {
    const [open, setOpen] = useState<boolean>(false);

    // @@Bug: The sidebar isn't opening properly.
    return (
        <SidebarContainer open={open}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'fixed',
                    justifyContent: 'space-between',
                    flex: 1,
                    height: '100%',
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    {menuMap.map((entry) => (
                        <Box
                            key={entry.title}
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: open ? 'left' : 'center',
                                pt: 1,
                                pb: 1,
                                flex: 1,
                            }}
                        >
                            <Tooltip
                                title={entry.title}
                                placement={'right-end'}
                                disableHoverListener={open}
                                disableTouchListener={open}
                                arrow
                            >
                                <Link to={entry.href}>
                                    <entry.icon color="inherit" size={18} style={{ marginRight: open ? 1 : 0 }} />
                                    {open && (
                                        <Box sx={{ fontWeight: 'bold', background: 'inherit' }}>{entry.title}</Box>
                                    )}
                                </Link>
                            </Tooltip>
                        </Box>
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
