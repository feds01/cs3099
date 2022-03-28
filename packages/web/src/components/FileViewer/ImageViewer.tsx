import Box from '@mui/material/Box';
import { useState } from 'react';
import { Loader } from '../Loader';

type ImageViewerProps = {
    filename: string;
    downloadUri: string;
};

export default function ImageViewer({ downloadUri, filename }: ImageViewerProps) {
    const [loaded, setLoaded] = useState<boolean>(false);

    return (
        <>
            {!loaded && (
                <Box sx={{ p: 2, margin: '0 auto' }}>
                    <Loader loading color="dimgray" />
                </Box>
            )}
            <img
                style={{
                    maxHeight: '50%',
                    maxWidth: '50%',
                    padding: '16px',
                    margin: '0 auto',
                }}
                src={downloadUri}
                crossOrigin="anonymous"
                onError={() => setLoaded(true)}
                onLoad={() => setLoaded(true)}
                alt={filename}
            />
        </>
    );
}
