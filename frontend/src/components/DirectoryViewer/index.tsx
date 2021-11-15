import {Link} from "react-router-dom";
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import React, { ReactElement } from 'react';
import { formatDistance } from 'date-fns';
import { RiFolderFill, RiFileFill } from 'react-icons/ri';
import * as LangIcons from 'react-icons/si';
import TableContainer from '@mui/material/TableContainer';
import { DirectoryResponseData } from '../../lib/api/models';
import { IconType } from "react-icons/lib";
import { Box, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

type Props = DirectoryResponseData & { basePath: string; filename: string };

// @@Cleanup: we should find a more dynamic way of doing this...
const IconMap: {[index: string]: IconType } = {
    "c": LangIcons.SiC,
    "hs": LangIcons.SiHaskell,
    "js": LangIcons.SiJavascript,
    "java": LangIcons.SiJava,
    "md": LangIcons.SiMarkdown,
    "ts": LangIcons.SiTypescript,
    "py": LangIcons.SiPython,
    "r": LangIcons.SiR,
    "rs": LangIcons.SiRust,
    "v": LangIcons.SiV,
    "json": LangIcons.SiJson,
}

// File Icons: https://react-icons.github.io/react-icons/icons?name=si
export default function DirectoryViewer({ entries, basePath, filename }: Props): ReactElement {
    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell width={'80%'}>Filename</TableCell>
                        <TableCell align={'right'} width={'20%'}>
                            Last modified
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {entries.map((entry) => {
                        const fullPath = `${basePath}/tree/${filename}/${entry.filename}`.replace(/([^:]\/)\/+/g, '$1');

                        // compute the extension of the filename, if it an extension
                        const components = entry.filename.split(".");
                        let Icon: IconType = entry.type === "directory" ? RiFolderFill : RiFileFill;

                        if (entry.type === "file" && components.length > 1) {
                            const extension = components[components.length - 1];
                            console.log(extension);

                            if (Object.keys(IconMap).find(t => t === extension)) {
                                Icon = IconMap[extension] as unknown as IconType;
                            }
                        }

                        return (
                            <TableRow key={fullPath}>
                                <TableCell sx={{ display: 'flex', flexDirection: 'row' }}>
                                    <Box sx={{ mr: 1 }}>
                                        <Icon size={16}/>
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
