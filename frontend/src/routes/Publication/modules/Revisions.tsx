import ErrorBanner from '../../../components/ErrorBanner';
import MarkdownRenderer from '../../../components/MarkdownRenderer';
import SkeletonList from '../../../components/SkeletonList';
import UserLink from '../../../components/UserLink';
import DeletePublicationForm from '../../../forms/DeletePublicationForm';
import { useAuth } from '../../../contexts/auth';
import { usePublicationDispatch, usePublicationState } from '../../../contexts/publication';
import { ApiErrorResponse, GetPublicationUsernameNameRevisions200, Publication, User } from '../../../lib/api/models';
import { useGetPublicationUsernameNameRevisions } from '../../../lib/api/publications/publications';
import { computeUserPermission } from '../../../lib/utils/roles';
import { ContentState } from '../../../types/requests';
import { transformQueryIntoContentState } from '../../../wrappers/react-query';
import Timeline from '@mui/lab/Timeline';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import { Box, Button, Chip, Divider, Typography } from '@mui/material';
import { formatDistance } from 'date-fns';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import RevisePublicationForm from '../../../forms/RevisePublicationForm';

interface RevisionProps {
    item: Publication;
    session: User;
    refetchRevisions: () => Promise<unknown>;
}

function Revision({ item, session, refetchRevisions }: RevisionProps) {
    const permission = computeUserPermission(item.owner.id, session);
    const { refetch } = usePublicationDispatch();

    return (
        <TimelineItem key={item.id}>
            <TimelineSeparator>
                <TimelineDot />
                <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Box>
                        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <Link to={`/${item.owner.username}/${item.name}/${item.revision}`}>
                                <Typography
                                    sx={{
                                        fontWeight: 'bold',
                                        '&:hover': { color: (t) => t.palette.primary.main },
                                    }}
                                    variant="h5"
                                >
                                    {item.title}
                                </Typography>
                            </Link>
                            <Chip size={'small'} sx={{ ml: 1 }} label={item.revision} variant="outlined" />
                        </Box>
                        <Typography>
                            by <UserLink user={item.owner} />{' '}
                            {formatDistance(item.createdAt, new Date(), { addSuffix: true })}
                        </Typography>
                    </Box>
                    {permission.delete && (
                        <DeletePublicationForm
                            publication={item}
                            onCompletion={async () => {
                                await refetchRevisions();
                                refetch();
                            }}
                        />
                    )}
                </Box>
                <Divider />
                <Box sx={{ pt: 1 }}>
                    {item.changelog ? (
                        <MarkdownRenderer contents={item.changelog} />
                    ) : (
                        <Typography sx={{ fontStyle: 'italic' }}>Author hasn't provided a changelog.</Typography>
                    )}
                </Box>
            </TimelineContent>
        </TimelineItem>
    );
}

export default function Revisions() {
    const {
        publication: { owner, name },
        permission,
    } = usePublicationState();
    const { session } = useAuth();

    const revisionQuery = useGetPublicationUsernameNameRevisions(owner.username, name);
    const [revisionsResult, setRevisionsResult] = useState<
        ContentState<GetPublicationUsernameNameRevisions200, ApiErrorResponse>
    >({
        state: 'loading',
    });

    useEffect(() => {
        setRevisionsResult(transformQueryIntoContentState(revisionQuery));
    }, [revisionQuery.isLoading, revisionQuery.isError, revisionQuery.data]);

    const [revisePublicationDialogOpen, setRevisePublicationDialogOpen] = useState(false);

    switch (revisionsResult.state) {
        case 'loading':
            return <SkeletonList rows={4} />;
        case 'error':
            return <ErrorBanner message={revisionsResult.error.message} />;
        case 'ok': {
            const { revisions } = revisionsResult.data;

            return (
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Typography variant="h4">Revision history</Typography>
                        {permission.delete && (
                            <Box>
                                <Button onClick={() => setRevisePublicationDialogOpen(true)}>Revise</Button>
                            </Box>
                        )}
                    </Box>
                    <Divider />
                    <Box sx={{ width: '100%' }}>
                        <Timeline>
                            {revisions.map((item) => {
                                return (
                                    <Revision
                                        key={item.id}
                                        session={session}
                                        item={item}
                                        refetchRevisions={revisionQuery.refetch}
                                    />
                                );
                            })}
                        </Timeline>
                    </Box>
                    <RevisePublicationForm
                        isOpen={revisePublicationDialogOpen}
                        onClose={() => setRevisePublicationDialogOpen(false)}
                        onCompletion={revisionQuery.refetch}
                    />
                </Box>
            );
        }
    }
}
