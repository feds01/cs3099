import { ContentState } from '../types/requests';
import Upload from '../static/images/upload.svg';
import ErrorBanner from '../components/ErrorBanner';
import React, { ReactElement, useEffect, useState } from 'react';
import { Box, Button, LinearProgress, Typography } from '@mui/material';
import { transformMutationIntoContentState} from '../wrappers/react-query';
import { usePostResourceUploadPublicationId } from '../lib/api/resources/resources';
import { ApiErrorResponse, ApiSuccessResponse, Publication } from '../lib/api/models';
interface Props {
    publication: Publication;
    refetchData: () => void;
}

export default function UploadAttachment({ publication, refetchData }: Props): ReactElement {
    const [showLoader, setShowLoader] = useState<boolean>(false);
    const [upload, setUpload] = useState<ContentState<ApiSuccessResponse, ApiErrorResponse>>({ state: 'loading' });
    const uploadFileQuery = usePostResourceUploadPublicationId();

    const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        setShowLoader(true);

        try {
            const file = event.target.files[0];
            await uploadFileQuery.mutateAsync({ id: publication.id, data: { file } });

            setShowLoader(false);
        } catch (e: unknown) {
            console.log(e);
            setUpload({ state: 'error', error: {status: 'error', message: "Couldn't read file."} });
            setShowLoader(false);
        }
    };

    useEffect(() => {
        setUpload(transformMutationIntoContentState(uploadFileQuery));

        if (!uploadFileQuery.isError && uploadFileQuery.data) {
            refetchData();
        }
    }, [uploadFileQuery.isError, uploadFileQuery.isSuccess]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            {showLoader ? (
                <LinearProgress />
            ) : (
                <>
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
                        <Button
                            variant="contained"
                            sx={{ fontWeight: 'bold' }}
                            size={'small'}
                            color="primary"
                            component="span"
                        >
                            Choose file
                        </Button>
                    </Box>
                    {upload.state === 'error' && <ErrorBanner message={upload.error.message} />}
                </>
            )}
        </Box>
    );
}
