import ErrorBanner from '../components/ErrorBanner';
import { ApiErrorResponse, ApiSuccessResponse, Publication } from '../lib/api/models';
import { usePostResourceUploadPublicationId } from '../lib/api/resources/resources';
import Upload from '../static/images/upload.svg';
import { ContentState } from '../types/requests';
import { transformMutationIntoContentState } from '../wrappers/react-query';
import { Box, Typography } from '@mui/material';
import React, { ReactElement, useEffect, useState } from 'react';
import LoadingButton from '@mui/lab/LoadingButton';

interface Props {
    publication: Publication;
    refetchData: () => void;
}

export default function UploadAttachment({ publication, refetchData }: Props): ReactElement {
    const [upload, setUpload] = useState<ContentState<ApiSuccessResponse, ApiErrorResponse>>({ state: 'loading' });
    const uploadFileQuery = usePostResourceUploadPublicationId();

    const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        try {
            const file = event.target.files[0];
            await uploadFileQuery.mutateAsync({ id: publication.id, data: { file } });
        } catch (e: unknown) {
            setUpload({ state: 'error', error: { status: 'error', message: "Couldn't read file." } });
        }
    };

    useEffect(() => {
        setUpload(transformMutationIntoContentState(uploadFileQuery));
    }, [uploadFileQuery.isError, uploadFileQuery.isSuccess]);

    useEffect(() => {
        if (upload.state === 'ok') {
            refetchData();
        }
    }, [upload]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <img src={Upload} width={128} height={128} alt="upload" />
            <Typography variant={'h4'} sx={{ paddingInlineStart: 1 }}>
                Upload publication
            </Typography>

            <input
                style={{ display: 'none' }}
                accept={'application/zip, text/plain'}
                onChange={handleChange}
                id="contained-button-file"
                type="file"
            />
            <Box component={'label'} sx={{ pt: 1, pb: 1 }} htmlFor="contained-button-file">
                <LoadingButton
                    variant="contained"
                    sx={{ fontWeight: 'bold' }}
                    size={'small'}
                    loading={uploadFileQuery.isLoading}
                    color="primary"
                    component="span"
                >
                    Choose file...
                </LoadingButton>
            </Box>
            {upload.state === 'error' && <ErrorBanner message={upload.error.message} />}
        </Box>
    );
}
