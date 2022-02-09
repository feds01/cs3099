import { ContentState } from '../types/requests';
import Upload from '../static/images/upload.svg';
import { Publication } from '../lib/api/models';
import ErrorBanner from '../components/ErrorBanner';
import React, { ReactElement, useEffect, useState } from 'react';
import { Box, Button, LinearProgress, Typography } from '@mui/material';
import { usePostResourceUploadPublicationId } from '../lib/api/resources/resources';

interface Props {
    publication: Publication;
    refetchData: () => void;
}

export default function UploadAttachment({ publication, refetchData }: Props): ReactElement {
    const [showLoader, setShowLoader] = useState<boolean>(false);
    const [upload, setUpload] = useState<ContentState<string, any>>({ state: 'loading' });
    const uploadFileQuery = usePostResourceUploadPublicationId();

    const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        setShowLoader(true);

        try {
            const file = event.target.files[0];
            await uploadFileQuery.mutateAsync({ id: publication.id, data: { file } });
        } catch (e) {
            setUpload({ state: 'error', error: new Error("Couldn't read file.") });
            setShowLoader(false);
        }
    };

    useEffect(() => {
        if (!uploadFileQuery.isError && uploadFileQuery.data) {
            refetchData();
        }
    }, [uploadFileQuery]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            {showLoader ? (
                <LinearProgress />
            ) : (
                <>
                    <img src={Upload} width={128} height={128} alt="upload" />
                    <Typography variant={'h4'} sx={{ m: 1 }}>
                        Upload publication
                    </Typography>

                    <input
                        style={{ display: 'none' }}
                        accept={'application/zip, text/plain'}
                        onChange={handleChange}
                        id="contained-button-file"
                        type="file"
                    />
                    <label htmlFor="contained-button-file">
                        <Button
                            variant="contained"
                            sx={{ fontWeight: 'bold', pb: 1 }}
                            size={'small'}
                            color="primary"
                            component="span"
                        >
                            Choose file
                        </Button>
                    </label>
                    {upload.state === 'error' && <ErrorBanner message={'Failed to read file'} />}
                </>
            )}
        </Box>
    );
}
