import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { MdOutlineKeyboardArrowDown, MdFileDownload, MdImportExport } from 'react-icons/md';
import { usePublicationState } from '../../../contexts/publication';
import ExportDialog from '../../../forms/ExportPublicationForm';
import { useState } from 'react';

const StyledMenu = styled((props: MenuProps) => (
    <Menu
        elevation={0}
        anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
        }}
        transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
        }}
        {...props}
    />
))(({ theme }) => ({
    '& .MuiPaper-root': {
        borderRadius: 6,
        marginTop: theme.spacing(1),
        minWidth: 180,
        color: theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
        boxShadow:
            'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
        '& .MuiMenu-list': {
            padding: '4px 0',
        },
        '& .MuiMenuItem-root': {
            '& .MuiSvgIcon-root': {
                fontSize: 18,
                color: theme.palette.text.secondary,
                marginRight: theme.spacing(1.5),
            },
            '&:active': {
                backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
            },
        },
    },
}));

export default function ExportDropdown() {
    const { publication } = usePublicationState();

    //setting constants for the export dialog
    const [exportDialogOpen, setExportDialogOpen] = useState(false);

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            <Button
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                variant="contained"
                disableElevation
                onClick={handleClick}
                endIcon={<MdOutlineKeyboardArrowDown />}
            >
                Export
            </Button>
            <StyledMenu anchorEl={anchorEl} open={open} onClose={handleClose}>
                <MenuItem disableRipple>
                    <a
                        href={`${process.env.REACT_APP_API_URI}/publication-by-id/${publication.id}/zip`}
                        download={`${publication.name}.zip`}
                    >
                        <MdFileDownload style={{ marginRight: 8 }} />
                        Download
                    </a>
                </MenuItem>
                <MenuItem onClick={() => setExportDialogOpen(true)} disableRipple>
                    <MdImportExport style={{ marginRight: 8 }} />
                    Export
                </MenuItem>
            </StyledMenu>
            <ExportDialog
                username={publication.owner.username}
                name={publication.name}
                revision={publication.revision}
                open={exportDialogOpen}
                onClose={() => setExportDialogOpen(false)}
            />
        </div>
    );
}
