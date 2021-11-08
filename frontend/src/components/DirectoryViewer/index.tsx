import { Box, Link, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import React, { ReactElement } from 'react';
import { formatDistance } from 'date-fns';
import { RiFolderFill } from 'react-icons/ri';
import { SiTypescript } from 'react-icons/si';
import { DirectoryResponseData } from '../../lib/api/models';

type Props = DirectoryResponseData & { basePath: string; filename: string };

// File Icons: https://react-icons.github.io/react-icons/icons?name=si
export default function DirectoryViewer({ entries, basePath, filename }: Props): ReactElement {
    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell width={'80%'}>Filename</TableCell>
                        <TableCell align={"right"} width={'20%'}>Last modified</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {entries.map((entry) => {
                        const fullPath = `${basePath}/tree/${filename}/${entry.filename}`.replace(/([^:]\/)\/+/g, '$1');

                        return (
                            <TableRow key={fullPath}>
                                <TableCell sx={{display: 'flex', flexDirection: 'row'}}>
                                    <Box sx={{ mr: 1 }}>
                                        {entry.type === 'directory' ? <RiFolderFill /> : <SiTypescript />}
                                    </Box>
                                    <Link href={fullPath}>{entry.filename}</Link>
                                </TableCell>
                                <TableCell align={"right"} width={'20%'}>
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