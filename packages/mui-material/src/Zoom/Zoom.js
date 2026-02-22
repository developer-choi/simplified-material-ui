'use client';
import * as React from 'react';
import { Transition } from 'react-transition-group';

const styles = {
  entering: {
    transform: 'none',
  },
  entered: {
    transform: 'none',
  },
};

/**
 * The Zoom transition can be used for the floating variant of the
 * [Button](/material-ui/react-floating-action-button/#animation) component.
 * It uses [react-transition-group](https://github.com/reactjs/react-transition-group) internally.
 */
const Zoom = React.forwardRef(function Zoom(props, ref) {
  const {
    children,
    in: inProp,
    style,
    ...other
  } = props;

  const nodeRef = React.useRef(null);

  const handleEnter = () => {
    const node = nodeRef.current;

    node.scrollTop; // So the animation always start from the start.

    const duration = style?.transitionDuration || 225;
    const easing = style?.transitionTimingFunction || 'cubic-bezier(0.4, 0, 0.2, 1)';
    const delay = style?.transitionDelay || 0;

    node.style.webkitTransition = `transform ${duration}ms ${easing} ${delay}ms`;
    node.style.transition = `transform ${duration}ms ${easing} ${delay}ms`;
  };

  const handleExit = () => {
    const node = nodeRef.current;

    const duration = style?.transitionDuration || 195;
    const easing = style?.transitionTimingFunction || 'cubic-bezier(0.4, 0, 0.2, 1)';
    const delay = style?.transitionDelay || 0;

    node.style.webkitTransition = `transform ${duration}ms ${easing} ${delay}ms`;
    node.style.transition = `transform ${duration}ms ${easing} ${delay}ms`;
  };

  return (
    <Transition
      appear={true}
      in={inProp}
      nodeRef={nodeRef}
      onEnter={handleEnter}
      onExit={handleExit}
      timeout={{ enter: 225, exit: 195 }}
      {...other}
    >
      {/* Ensure "ownerState" is not forwarded to the child DOM element when a direct HTML element is used. This avoids unexpected behavior since "ownerState" is intended for internal styling, component props and not as a DOM attribute. */}
      {(state, { ownerState, ...restChildProps }) => {
        return React.cloneElement(children, {
          style: {
            transform: 'scale(0)',
            visibility: state === 'exited' && !inProp ? 'hidden' : undefined,
            ...styles[state],
            ...style,
            ...children.props.style,
          },
          ref: nodeRef,
          ...restChildProps,
        });
      }}
    </Transition>
  );
});

export default Zoom;
