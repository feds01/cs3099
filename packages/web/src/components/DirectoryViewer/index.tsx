import { Link } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import FileIcon from '../FileIcon';
import { ReactElement } from 'react';
import { formatDistance } from 'date-fns';
import { getExtension } from '../../lib/utils/file';
import TableContainer from '@mui/material/TableContainer';
import { DirectoryResponse } from '../../lib/api/models';
import { Box, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

type DirectoryViewerProps = DirectoryResponse & { basePath: string; filename: string };

export default function DirectoryViewer({ entries, basePath, filename }: DirectoryViewerProps): ReactElement {
    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }} width={'80%'}>
                            Filename
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align={'right'} width={'20%'}>
                            Last modified
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {entries.map((entry) => {
                        const parts = [...filename.split('/'), entry.filename].map((part) => encodeURIComponent(part));
                        const fullPath = `${basePath}/tree/${parts.join('/')}`.replace(/([^:]\/)\/+/g, '$1');

                        return (
                            <TableRow key={fullPath}>
                                <TableCell sx={{ display: 'flex', flexDirection: 'row' }}>
                                    <Box sx={{ mr: 1 }}>
                                        <FileIcon
                                            type={entry.type}
                                            open={false}
                                            extension={getExtension(entry.filename) ?? ''}
                                        />
                                    </Box>
                                    <Link to={fullPath}>{entry.filename}</Link>
                                </TableCell>
                                <TableCell align={'right'} width={'20%'}>
                                    {formatDistance(entry.updatedAt, new Date(), { addSuffix: true })}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
