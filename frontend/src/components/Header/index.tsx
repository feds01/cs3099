import React, { ReactElement } from 'react';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import MuiAppBar from '@mui/material/AppBar';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { styled } from '@mui/material/styles';
import ProfileMenu from '../ProfileMenu';
import UserAvatar from '../UserAvatar';
import { useAuth } from '../../hooks/auth';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import LogoImage from './../../static/images/logos/logo.png';

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
                position: 'relative',
                backgroundColor: '#f0f0f0',
                boxShadow: '0 1px 0 0 #dbdbdb',
            }}
        >
            <Toolbar sx={{ ...(!title && { justifyContent: 'space-between' }) }}>
                <Link
                    href={'/'}
                    aria-label="home"
                    sx={{
                        mr: 1,
                    }}
                >
                    <img src={LogoImage} height={48} alt="Iamus" />
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
