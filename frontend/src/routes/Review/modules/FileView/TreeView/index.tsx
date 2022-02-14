import { useReviewState } from '../../../../../hooks/review';
import { getExtension, IconMap } from '../../../../../lib/utils/file';
import TreeItem, { TreeItemProps, treeItemClasses } from '@mui/lab/TreeItem';
import TreeView from '@mui/lab/TreeView';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import { alpha, styled } from '@mui/material/styles';
import { TransitionProps } from '@mui/material/transitions';
import { ReactElement, useState, useEffect } from 'react';
import { BiMessageAltAdd } from 'react-icons/bi';
import { RiFolderOpenFill, RiFolderFill, RiFileFill } from 'react-icons/ri';
import { useSpring, animated } from 'react-spring';

type FileEntry = { type: 'file'; name: string; id: string };
type DirEntry = { type: 'directory'; name: string; entries: (FileEntry | DirEntry)[]; id: string };

const rootEntry: DirEntry = { type: 'directory', name: '', entries: [], id: '' };

/**
 *
 * @param tree
 * @param components
 * @returns
 */
function insertEntry(tree: DirEntry, components: string[], base: string) {
    if (components.length === 0) return;

    const nextBase = `${base}/${components[0]}`;
    if (components.length === 1) {
        tree.entries.push({ type: 'file', name: components[0], id: nextBase });
        return;
    }

    const subTree = tree.entries.find((x) => x.type === 'directory' && x.name === components[0]);

    if (typeof subTree === 'undefined') {
        const rootEntry: DirEntry = { type: 'directory', name: components[0], entries: [], id: nextBase };

        insertEntry(rootEntry, components.slice(1), nextBase);
        tree.entries.push(rootEntry);
        return;
    }

    insertEntry(subTree as DirEntry, components.slice(1), nextBase);
}

/**
 *
 * @param data
 * @returns
 */
function convertIntoTree(data: string[]): DirEntry {
    const rootEntry: DirEntry = { type: 'directory', name: '', entries: [], id: '' };

    data.forEach((entry) => {
        const components = entry.split('/').filter((x) => x !== '');

        if (components.length === 0) return;
        insertEntry(rootEntry, components, '');
    });

    return rootEntry;
}

function findDirectories(tree: DirEntry): string[] {
    let paths: string[] = [];

    tree.entries.forEach((entry) => {
        if (entry.type === 'directory') {
            paths = [...paths, entry.id, ...findDirectories(entry)];
        }
    });

    return paths;
}

function TransitionComponent(props: TransitionProps) {
    const style = useSpring({
        from: {
            opacity: 0,
            transform: 'translate3d(20px,0,0)',
        },
        to: {
            opacity: props.in ? 1 : 0,
            transform: `translate3d(${props.in ? 0 : 20}px,0,0)`,
        },
    });

    return (
        <animated.div style={style}>
            <Collapse {...props} />
        </animated.div>
    );
}

const StyledTreeItem = styled((props: TreeItemProps) => (
    <TreeItem {...props} TransitionComponent={TransitionComponent} />
))(({ theme }) => ({
    [`& .${treeItemClasses.iconContainer}`]: {
        '& .close': {
            opacity: 0.3,
        },
    },
    [`& .${treeItemClasses.group}`]: {
        marginLeft: 15,
        paddingLeft: 18,
        borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
    },
}));

interface NodeProps {
    item: FileEntry | DirEntry;
    commentMap: Map<string, number>;
    toggleExpanded: (nodeId: string) => void;
}

function Node({ item, toggleExpanded, commentMap }: NodeProps): ReactElement {
    const id = item.id.toString();

    if (item.type === 'directory') {
        return (
            <StyledTreeItem nodeId={id} label={item.name} onClick={() => toggleExpanded(id)}>
                {item.entries.map((entry) => {
                    return <Node key={entry.id} commentMap={commentMap} toggleExpanded={toggleExpanded} item={entry} />;
                })}
            </StyledTreeItem>
        );
    }

    // check how many comments this file has
    const commentCount = commentMap.get(item.id);

    // Use the icon service to attempt to get an icon...
    const extension = getExtension(item.name);
    const Icon = extension !== null && extension in IconMap ? IconMap[extension] : undefined;

    return (
        <StyledTreeItem
            {...(typeof Icon !== 'undefined' && { icon: <Icon /> })}
            nodeId={id}
            label={
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                    }}
                >
                    {item.name}
                    {typeof commentCount !== 'undefined' && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {commentCount} <BiMessageAltAdd />
                        </Box>
                    )}
                </Box>
            }
        />
    );
}

interface CustomizedTreeViewProps {
    paths: string[];
}

export default function CustomizedTreeView({ paths }: CustomizedTreeViewProps): ReactElement {
    const { comments } = useReviewState();
    const [entries, setEntries] = useState<DirEntry>(rootEntry);
    const [commentMap, setCommentMap] = useState<Map<string, number>>(new Map());
    const [expanded, setExpanded] = useState<string[]>([]);

    const toggleExpanded = (id: string) => {
        if (expanded.find((nodeId) => nodeId === id)) {
            setExpanded(expanded.filter((nodeId) => nodeId !== id));
        } else {
            setExpanded([...expanded, id]);
        }
    };

    // Update the comment map when any new comments are added to the review
    useEffect(() => {
        let newCommentMap = new Map();

        for (const comment of comments) {
            const filename = '/' + comment.filename;

            if (newCommentMap.has(filename)) {
                newCommentMap.set(filename, newCommentMap.get(filename) + 1);
            } else {
                newCommentMap.set(filename, 1);
            }
        }

        setCommentMap(newCommentMap);
    }, [comments]);

    useEffect(() => {
        const newEntries = convertIntoTree(paths);
        setEntries(newEntries);
        setExpanded(findDirectories(newEntries));
    }, [paths]);

    return (
        <TreeView
            aria-label="customized"
            expanded={expanded}
            defaultCollapseIcon={<RiFolderOpenFill />}
            defaultExpandIcon={<RiFolderFill />}
            onNodeSelect={(_: React.SyntheticEvent, id: string) => {
                let index = paths.indexOf(id.substring(1, id.length));

                if (index !== -1) {
                    document.getElementById(`file-${index}`)?.scrollIntoView();
                }
            }}
            defaultEndIcon={<RiFileFill />}
            sx={{ pt: 1, background: '#fff', height: '100%', overflowY: 'scroll', overflowX: 'scroll' }}
        >
            {entries.entries.map((item) => {
                return <Node key={item.name} commentMap={commentMap} toggleExpanded={toggleExpanded} item={item} />;
            })}
        </TreeView>
    );
}
