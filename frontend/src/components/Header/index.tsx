import { useAuth } from '../../hooks/auth';
import ProfileMenu from '../ProfileMenu';
import UserAvatar from '../UserAvatar';
import LogoImage from './../../static/images/logos/logo.png';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import MuiAppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import React, { ReactElement } from 'react';
import { Link } from 'react-router-dom';

const AppBar = styled(MuiAppBar)(({ theme }) => ({
    zIndex: theme.zIndex.drawer + 1,
}));

interface Props {
    title?: string;
}

export default function Header({ title }: Props): ReactElement {
    const auth = useAuth();
    const [anchor, setAnchor] = React.useState<null | HTMLElement>(null);

    return (
        <AppBar
            sx={{
                position: 'fixed',
                backgroundColor: '#f0f0f0',
                boxShadow: '0 1px 0 0 #dbdbdb',
            }}
        >
            <Toolbar sx={{ ...(!title && { justifyContent: 'space-between' }) }}>
                <Link to='/' aria-label="home">
                    <img src={LogoImage} height={48} alt="Avatar" />
                </Link>
                {title && (
                    <Typography variant="h6" component="div" sx={{ color: 'text.primary', flexGrow: 1 }}>
                        {title}
                    </Typography>
                )}
                <div>
                    <Button
                        endIcon={<ExpandMoreOutlinedIcon />}
                        onClick={(ev) => setAnchor(ev.currentTarget)}
                        variant="text"
                        color={'secondary'}
                        aria-label="open menu"
                        sx={{
                            textDecoration: 'none',
                            color: (t) => t.palette.text.primary,
                        }}
                    >
                        <UserAvatar {...auth.session} displayName position="right" />
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
