import TreeView from '@mui/lab/TreeView';
import Collapse from '@mui/material/Collapse';
import { alpha, styled } from '@mui/material/styles';
import { useSpring, animated } from 'react-spring';
import { TransitionProps } from '@mui/material/transitions';
import { ReactElement, useState, useEffect } from 'react';
import TreeItem, { TreeItemProps, treeItemClasses } from '@mui/lab/TreeItem';
import { RiFolderOpenFill, RiFolderFill, RiFileFill } from 'react-icons/ri';
import { getExtension, IconMap } from '../../lib/utils/file';

type FileEntry = { type: 'file'; name: string };
type DirEntry = { type: 'directory'; name: string; entries: (FileEntry | DirEntry)[] };

const rootEntry: DirEntry = { type: 'directory', name: 'root', entries: [] };

/**
 *
 * @param tree
 * @param components
 * @returns
 */
function insertEntry(tree: DirEntry, components: string[]) {
    if (components.length === 0) return;
    if (components.length === 1) {
        tree.entries.push({ type: 'file', name: components[0] });
        return;
    }

    const subTree = tree.entries.find((x) => x.type === 'directory' && x.name === components[0]);

    if (typeof subTree === 'undefined') {
        const rootEntry: DirEntry = { type: 'directory', name: components[0], entries: [] };

        insertEntry(rootEntry, components.slice(1));
        tree.entries.push(rootEntry);
        return;
    }

    insertEntry(subTree as DirEntry, components.slice(1));
}

/**
 *
 * @param data
 * @returns
 */
function convertIntoTree(data: string[]): DirEntry {
    const rootEntry: DirEntry = { type: 'directory', name: 'root', entries: [] };

    data.forEach((entry) => {
        const components = entry.split('/').filter((x) => x !== '');
        insertEntry(rootEntry, components);
    });

    return rootEntry;
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
    prefix: string;
}

function Node({ item, prefix }: NodeProps): ReactElement {
    const base = `${prefix}/${item.name}`;

    if (item.type === 'directory') {
        return (
            <StyledTreeItem nodeId={base} label={item.name}>
                {item.entries.map((entry) => {
                    return <Node key={`${base}/${entry.name}`} item={entry} prefix={base} />;
                })}
            </StyledTreeItem>
        );
    }

    // Use the icon service to attempt to get an icon...
    const extension = getExtension(item.name);
    const Icon = extension !== null && extension in IconMap ? IconMap[extension] : undefined;

    return <StyledTreeItem {...(typeof Icon !== 'undefined' && { icon: <Icon/>})} nodeId={base} label={item.name} />;
}

export default function CustomizedTreeView({ paths }: Props): ReactElement {
    const [entries, setEntries] = useState<DirEntry>(rootEntry);

    useEffect(() => {
        setEntries(convertIntoTree(paths));
    }, [paths]);

    return (
        <TreeView
            aria-label="customized"
            defaultExpanded={['1']}
            defaultCollapseIcon={<RiFolderOpenFill />}
            defaultExpandIcon={<RiFolderFill />}
            defaultEndIcon={<RiFileFill />}
            sx={{ height: 264, flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
        >
          {
            entries.entries.map((item) => {
              return <Node key={item.name} item={item} prefix={entries.name} />
            })
          }
        </TreeView>
    );
}
