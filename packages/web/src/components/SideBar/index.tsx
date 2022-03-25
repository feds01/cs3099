import { ReactElement, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import { Button, Tooltip } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { MdReviews, MdSearch } from 'react-icons/md';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { styled, Theme, CSSObject } from '@mui/material/styles';

import { TiHome } from 'react-icons/ti';
import { BsJournalArrowUp, BsJournalCode } from 'react-icons/bs';

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
    { title: 'Publications', icon: BsJournalCode, href: '/publications' },
    { title: 'Reviews', icon: MdReviews, href: '/reviews' },
    { title: 'Explore', icon: MdSearch, href: '/explore' },
    { title: 'Create publication', icon: BsJournalArrowUp, href: '/publication/create' },
];

export default function Sidebar(): ReactElement {
    const [open, setOpen] = useState<boolean>(false);
    const location = useLocation();

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
                    width: '41px',
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
                                ...(location.pathname === entry.href && {
                                    background: '#F4F6F9 0% 0% no-repeat padding-box',
                                }),
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
                    <Button color="inherit" startIcon={<MdChevronLeft />} onClick={() => setOpen(!open)}>
                        Collapse
                    </Button>
                ) : (
                    <IconButton color="inherit" onClick={() => setOpen(!open)}>
                        <MdChevronRight color="inherit" />
                    </IconButton>
                )}
            </Box>
        </SidebarContainer>
    );
}
