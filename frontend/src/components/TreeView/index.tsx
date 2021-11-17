import TreeView from '@mui/lab/TreeView';
import Collapse from '@mui/material/Collapse';
import { alpha, styled } from '@mui/material/styles';
import { useSpring, animated } from 'react-spring';
import { TransitionProps } from '@mui/material/transitions';
import { ReactElement, useState, useEffect } from 'react';
import TreeItem, { TreeItemProps, treeItemClasses } from '@mui/lab/TreeItem';
import { RiFolderOpenFill, RiFolderFill, RiFileFill } from 'react-icons/ri';
import { getExtension, IconMap } from '../../lib/utils/file';

type FileEntry = { type: 'file'; name: string; id: string };
type DirEntry = { type: 'directory'; name: string; entries: (FileEntry | DirEntry)[]; id: string };

const rootEntry: DirEntry = { type: 'directory', name: '', entries: [], id: "" };

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
    const rootEntry: DirEntry = { type: 'directory', name: '', entries: [], id: "" };

    data.forEach((entry) => {
        const components = entry.split('/').filter((x) => x !== '');


        if (components.length === 0) return;
        insertEntry(rootEntry, components, "");
    });

    return rootEntry;
}

function findDirectories(tree: DirEntry): string[] {
    let paths: string[] = [];

    tree.entries.forEach((entry) => {
        if (entry.type === "directory") {
            paths = [...paths, entry.id, ...findDirectories(entry)];
        }
    })

    return paths;
}

interface Props {
    paths: string[];
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
    toggleExpanded: (nodeId: string) => void;
}

function Node({ item, toggleExpanded }: NodeProps): ReactElement {
    const id = item.id.toString();

    if (item.type === 'directory') {
        return (
            <StyledTreeItem nodeId={id} label={item.name} onClick={() => toggleExpanded(id)}>
                {item.entries.map((entry) => {
                    return <Node key={entry.id} toggleExpanded={toggleExpanded} item={entry} />;
                })}
            </StyledTreeItem>
        );
    }

    // Use the icon service to attempt to get an icon...
    const extension = getExtension(item.name);
    const Icon = extension !== null && extension in IconMap ? IconMap[extension] : undefined;

    return <StyledTreeItem {...(typeof Icon !== 'undefined' && { icon: <Icon /> })} nodeId={id} label={item.name} />;
}

export default function CustomizedTreeView({ paths }: Props): ReactElement {
    const [entries, setEntries] = useState<DirEntry>(rootEntry);
    const [expanded, setExpanded] = useState<string[]>([]);

    const toggleExpanded = (id: string) => {
        if (expanded.find(nodeId => nodeId === id)) {
            setExpanded(expanded.filter(nodeId => nodeId !== id))
        } else {
            setExpanded([...expanded, id])
        }
    }

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
            defaultEndIcon={<RiFileFill />}
            sx={{ height: 264, flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
        >
            {entries.entries.map((item) => {
                return <Node key={item.name} toggleExpanded={toggleExpanded} item={item} />;
            })}
        </TreeView>
    );
}
