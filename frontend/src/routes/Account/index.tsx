import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { useAuth } from '../../hooks/auth';
import PageLayout from '../../components/PageLayout';
import UserAvatar from '../../components/UserAvatar';
import { AccountUpdateForm } from '../../forms/UpdateAccountForm';

export default function Account() {
    const { session } = useAuth();

    return (
        <PageLayout sidebar={false}>
            <Box sx={{ p: 3, wordBreak: 'break-word' }}>
                <Typography variant={'h4'}>User Settings</Typography>
                <Divider />
                <Grid container spacing={2}>
                    <Grid item xs={12} md={5}>
                        <Typography variant={'h5'} sx={{ fontWeight: 'bold' }}>
                            User Avatar
                        </Typography>
                        <Typography variant={'body1'}>
                            You can change your avatar here or remove the current avatar.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={7}>
                        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                            <UserAvatar {...session} size={80} displayName={false} />
                            <Box sx={{ marginLeft: 2, flex: 1 }}>
                                <Typography variant={'h6'} sx={{ fontWeight: 'bold' }}>
                                    Upload new avatar
                                </Typography>
                                <Box>
                                    <Button variant="outlined" sx={{ marginRight: 1 }} component="label">
                                        Choose file...
                                        <input type="file" hidden />
                                    </Button>
                                    No file chosen.
                                </Box>
                                <Box sx={{ paddingBottom: 1 }}>
                                    <Typography variant={'caption'} sx={{ fontWeight: 'bold' }}>
                                        Maximum upload allowed is 300Kb.
                                    </Typography>
                                </Box>
                                <Button variant="outlined" size="small" color="error">
                                    Remove avatar
                                </Button>
                            </Box>
                        </Box>
                    </Grid>
                    <Divider />
                    <Grid item xs={12}>
                        <AccountUpdateForm session={session} />
                    </Grid>
                </Grid>
            </Box>
        </PageLayout>
    );
}
