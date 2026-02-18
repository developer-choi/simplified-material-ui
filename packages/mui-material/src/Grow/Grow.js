'use client';
import * as React from 'react';
import getReactElementRef from '@mui/utils/getReactElementRef';
import { Transition } from 'react-transition-group';
import useForkRef from '../utils/useForkRef';

function getScale(value) {
  return `scale(${value}, ${value ** 2})`;
}

const styles = {
  entering: {
    opacity: 1,
    transform: getScale(1),
  },
  entered: {
    opacity: 1,
    transform: 'none',
  },
};

/**
 * The Grow transition is used by the [Tooltip](/material-ui/react-tooltip/) and
 * [Popover](/material-ui/react-popover/) components.
 * It uses [react-transition-group](https://github.com/reactjs/react-transition-group) internally.
 */
const Grow = React.forwardRef(function Grow(props, ref) {
  const {
    children,
    in: inProp,
    ...other
  } = props;
  const timeout = 300;

  const nodeRef = React.useRef(null);
  const handleRef = useForkRef(nodeRef, getReactElementRef(children), ref);

  const handleEnter = () => {
    const node = nodeRef.current;
    node.style.transition = 'opacity 300ms ease-in-out, transform 200ms ease-in-out';
  };

  const handleExit = () => {
    const node = nodeRef.current;
    node.style.transition = 'opacity 300ms ease-in-out, transform 200ms ease-in-out 100ms';

    node.style.opacity = 0;
    node.style.transform = getScale(0.75);
  };

  return (
    <Transition
      appear
      in={inProp}
      nodeRef={nodeRef}
      onEnter={handleEnter}
      onExit={handleExit}
      timeout={timeout}
      {...other}
    >
      {/* Ensure "ownerState" is not forwarded to the child DOM element when a direct HTML element is used. This avoids unexpected behavior since "ownerState" is intended for internal styling, component props and not as a DOM attribute. */}
      {(state, { ownerState, ...restChildProps }) => {
        return React.cloneElement(children, {
          style: {
            opacity: 0,
            transform: getScale(0.75),
            visibility: state === 'exited' && !inProp ? 'hidden' : undefined,
            ...styles[state],
            ...children.props.style,
          },
          ref: handleRef,
          ...restChildProps,
        });
      }}
    </Transition>
  );
});

export default Grow;
