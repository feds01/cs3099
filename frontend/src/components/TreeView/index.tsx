import React, {ReactElement} from 'react';
import TreeView from '@mui/lab/TreeView';
import Collapse from '@mui/material/Collapse';
import { alpha, styled } from '@mui/material/styles';
import { useSpring, animated } from 'react-spring';
import { TransitionProps } from '@mui/material/transitions';
import TreeItem, { TreeItemProps, treeItemClasses } from '@mui/lab/TreeItem';
import { RiFolderOpenFill, RiFolderFill, RiFileFill } from 'react-icons/ri';

interface Props {
    paths: string[]
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




export default function CustomizedTreeView(props: Props): ReactElement {
    return (
      <TreeView
        aria-label="customized"
        defaultExpanded={['1']}
        defaultCollapseIcon={<RiFolderOpenFill />}
        defaultExpandIcon={<RiFolderFill />}
        defaultEndIcon={<RiFileFill />}
        sx={{ height: 264, flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
      >
        <StyledTreeItem nodeId="1" label="Main">
          <StyledTreeItem nodeId="2" label="Hello" />
          <StyledTreeItem nodeId="3" label="Subtree with children">
            <StyledTreeItem nodeId="6" label="Hello" />
            <StyledTreeItem nodeId="7" label="Sub-subtree with children">
              <StyledTreeItem nodeId="9" label="Child 1" />
              <StyledTreeItem nodeId="10" label="Child 2" />
              <StyledTreeItem nodeId="11" label="Child 3" />
            </StyledTreeItem>
            <StyledTreeItem nodeId="8" label="Hello" />
          </StyledTreeItem>
          <StyledTreeItem nodeId="4" label="World" />
          <StyledTreeItem nodeId="5" label="Something something" />
        </StyledTreeItem>
      </TreeView>
    );
  }
