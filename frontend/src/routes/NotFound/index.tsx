import Box from '@mui/material/Box';
import { ReactElement } from 'react';
import Typography from '@mui/material/Typography';
import VoidImage from "../../static/images/void.svg";

export default function NotFound(): ReactElement {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'row',
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Box>
                <Typography variant={'h3'}>404: Not Found</Typography>
                <Typography variant={'body1'}>Return to the homepage or contact us.</Typography>
            </Box>
            <img src={VoidImage} width={128} height={128} alt='void' />
        </Box>
    );
}
