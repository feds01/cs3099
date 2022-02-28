import { ApiErrorResponse, GetPublication200 } from '../../lib/api/models';
import { useGetPublication } from '../../lib/api/publications/publications';
import { ContentState } from '../../types/requests';
import { transformQueryIntoContentState } from '../../wrappers/react-query';
import ErrorBanner from '../ErrorBanner';
import PublicationList from '../PublicationList';
import SkeletonList from '../SkeletonList';
import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';
import { useEffect, useState } from 'react';

type PaginatedListProps = {
    take: number;
};

export default function PaginatedList({ take }: PaginatedListProps) {
    const [page, setPage] = useState(0);

    const publicationQuery = useGetPublication({ skip: page * take, take });
    const [queryResponse, setQueryResponse] = useState<ContentState<GetPublication200, ApiErrorResponse>>({
        state: 'loading',
    });

    useEffect(() => {
        setQueryResponse(transformQueryIntoContentState(publicationQuery));
    }, [publicationQuery.isLoading, publicationQuery.isError]);

    useEffect(() => {
        publicationQuery.refetch();
    }, [page]);

    switch (queryResponse.state) {
        case 'loading':
            return <SkeletonList rows={4} />;
        case 'error':
            return <ErrorBanner message={queryResponse.error.message} />;
        case 'ok':
            const { total, publications, take } = queryResponse.data;

            return (
                <Box>
                    <PublicationList publications={publications} />
                    <Box sx={{ pt: 2, display: 'flex', justifyContent: 'center' }}>
                        <Pagination
                            count={Math.ceil(total / take)}
                            page={page + 1}
                            onChange={(event, newPage) => setPage(newPage)}
                            variant="outlined"
                            shape="rounded"
                        />
                    </Box>
                </Box>
            );
    }
}
