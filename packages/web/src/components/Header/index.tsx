import { useAuth } from '../../contexts/auth';
import ProfileMenu from '../ProfileMenu';
import SearchBar from '../SearchBar';
import UserAvatar from '../UserAvatar';
import LogoImage from './../../static/images/logos/logo.png';
import { MdOutlineExpandMore } from 'react-icons/md';
import MuiAppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import { styled, useTheme } from '@mui/material/styles';
import React, { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import NotificationWidget from '../NotificationWidget';
import { useMediaQuery } from '@mui/material';

const AppBar = styled(MuiAppBar)(({ theme }) => ({
    zIndex: theme.zIndex.drawer + 1,
}));

export default function Header(): ReactElement {
    const auth = useAuth();
    const theme = useTheme();
    const showName = useMediaQuery(theme.breakpoints.up('md'));
    const [anchor, setAnchor] = React.useState<null | HTMLElement>(null);

    return (
        <AppBar
            sx={{
                position: 'fixed',
                backgroundColor: '#f0f0f0',
                boxShadow: '0 1px 0 0 #dbdbdb',
            }}
        >
            <Toolbar sx={{ justifyContent: 'space-between', height: '64px' }}>
                <Link to="/" aria-label="home">
                    <img src={LogoImage} height={48} alt="Avatar" />
                </Link>
                <Box sx={{ flexGrow: 1, pl: 1, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <SearchBar />
                </Box>
                <div>
                    <NotificationWidget />
                    <Button
                        endIcon={<MdOutlineExpandMore />}
                        onClick={(ev) => setAnchor(ev.currentTarget)}
                        variant="text"
                        color={'secondary'}
                        aria-label="open menu"
                        sx={{
                            textDecoration: 'none',
                            color: (t) => t.palette.text.primary,
                        }}
                    >
                        <UserAvatar
                            {...auth.session}
                            {...(showName
                                ? { userLink: false, displayName: true, position: 'right' }
                                : { displayName: false })}
                        />
                    </Button>
                </div>
                <ProfileMenu
                    isMenuOpen={anchor !== null}
                    menuId={'account-dropdown-menu'}
                    anchor={anchor}
                    setAnchor={setAnchor}
                />
            </Toolbar>
        </AppBar>
    );
}
