import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import React, { ReactElement } from 'react';

interface Props {
    drawerWidth: number;
}

export default function Sidebar({ drawerWidth }: Props): ReactElement {
    return (
        <Drawer
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                },
            }}
            variant="permanent"
            anchor="left"
        >
            <Toolbar />
            <Divider />
           Sidebar
        </Drawer>
    );
}
