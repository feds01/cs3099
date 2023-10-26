import { default as MuiTooltip, TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';

const Tooltip = styled(({ className, ...props }: TooltipProps) => (
    <MuiTooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: theme.palette.background.paper,
        maxWidth: 275,
        color: 'inherit',
        border: '1px solid divider',
        paddingTop: theme.spacing(1),
    },
    [`& .${tooltipClasses.arrow}`]: {
        '&:before': {
            border: '1px solid divider',
        },
        color: theme.palette.common.white,
    },
}));

export default Tooltip;
