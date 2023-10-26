import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import PageLayout from '../../components/PageLayout';
import NotificationImage from '../../static/images/notifications.svg';
import { useNotificationState } from '../../contexts/notification';
import NotificationFeed from '../../views/NotificationFeed';

export default function NotificationsPage() {
    const { userNotifications } = useNotificationState();

    return (
        <PageLayout>
            <Container>
                <Box sx={{ pt: 2, pb: 2 }}>
                    <Typography variant={'h3'}>Notifications</Typography>
                    <Divider />
                    <Box>
                        {userNotifications.length === 0 ? (
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    width: '100%',
                                    pt: 2,
                                }}
                            >
                                <img src={NotificationImage} height={384} width={384} alt={'nothing'} />
                                <Typography variant="h4">All caught up!</Typography>
                            </Box>
                        ) : (
                            <NotificationFeed notifications={userNotifications} />
                        )}
                    </Box>
                </Box>
            </Container>
        </PageLayout>
    );
}
