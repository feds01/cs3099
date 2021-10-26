import { Link } from 'react-router-dom';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { useAuth, useDispatchAuth } from '../../hooks/auth';

export interface IProfileMenu {
    anchor: HTMLElement | null;
    isMenuOpen: boolean;
    setAnchor: (element: HTMLElement | null) => void;
    menuId: string;
}

export default function ProfileMenu({ menuId, anchor, setAnchor, isMenuOpen }: IProfileMenu) {
    const auth = useAuth();
    const authDispatcher = useDispatchAuth();

    return (
        <Menu
            id={menuId}
            anchorEl={anchor}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={isMenuOpen}
            onClose={() => setAnchor(null)}
        >
            <MenuItem>
                <Link to={`/profile/${auth.session.username}`}>
                    <Typography sx={{ fontWeight: 'bold' }}>Profile</Typography>
                </Link>
            </MenuItem>
            <MenuItem>
                <Link to="/account">
                    <Typography sx={{ fontWeight: 'bold' }}>Edit Account</Typography>
                </Link>
            </MenuItem>
            <MenuItem
                onClick={() => {
                    authDispatcher({ type: 'logout' });
                }}
            >
                <Typography sx={{ fontWeight: 'bold' }}>Sign out</Typography>
            </MenuItem>
        </Menu>
    );
}
