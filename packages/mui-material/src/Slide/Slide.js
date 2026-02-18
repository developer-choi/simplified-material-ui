'use client';
import * as React from 'react';
import { Transition } from 'react-transition-group';
import getReactElementRef from '@mui/utils/getReactElementRef';
import debounce from '../utils/debounce';
import useForkRef from '../utils/useForkRef';
import { reflow } from '../transitions/utils';
// Translate the node so it can't be seen on the screen.
// Later, we're going to translate the node back to its original location with `none`.
function getTranslateValue(direction, node) {
  const rect = node.getBoundingClientRect();
  let transform;

  if (node.fakeTransform) {
    transform = node.fakeTransform;
  } else {
    const computedStyle = window.getComputedStyle(node);
    transform =
      computedStyle.getPropertyValue('-webkit-transform') ||
      computedStyle.getPropertyValue('transform');
  }

  let offsetX = 0;
  let offsetY = 0;

  if (transform && transform !== 'none' && typeof transform === 'string') {
    const transformValues = transform.split('(')[1].split(')')[0].split(',');
    offsetX = parseInt(transformValues[4], 10);
    offsetY = parseInt(transformValues[5], 10);
  }

  if (direction === 'left') {
    return `translateX(${window.innerWidth + offsetX - rect.left}px)`;
  }

  if (direction === 'right') {
    return `translateX(-${rect.left + rect.width - offsetX}px)`;
  }

  if (direction === 'up') {
    return `translateY(${window.innerHeight + offsetY - rect.top}px)`;
  }

  // direction === 'down'
  return `translateY(-${rect.top + rect.height - offsetY}px)`;
}

export function setTranslateValue(direction, node) {
  const transform = getTranslateValue(direction, node);

  if (transform) {
    node.style.webkitTransform = transform;
    node.style.transform = transform;
  }
}

/**
 * The Slide transition is used by the [Drawer](/material-ui/react-drawer/) component.
 * It uses [react-transition-group](https://github.com/reactjs/react-transition-group) internally.
 */
const Slide = React.forwardRef(function Slide(props, ref) {
  const timeout = { enter: 225, exit: 195 };

  const {
    children,
    direction = 'down',
    in: inProp,
    ...other
  } = props;

  const childrenRef = React.useRef(null);
  const handleRef = useForkRef(getReactElementRef(children), childrenRef, ref);

  const handleEnter = () => {
    const node = childrenRef.current;
    setTranslateValue(direction, node);
    reflow(node);
  };

  const handleEntering = () => {
    const node = childrenRef.current;
    node.style.webkitTransition = `transform ${timeout.enter}ms cubic-bezier(0, 0, 0.2, 1) 0ms`;
    node.style.transition = `transform ${timeout.enter}ms cubic-bezier(0, 0, 0.2, 1) 0ms`;
    node.style.webkitTransform = 'none';
    node.style.transform = 'none';
  };

  const handleExit = () => {
    const node = childrenRef.current;
    node.style.webkitTransition = `transform ${timeout.exit}ms cubic-bezier(0.4, 0, 0.6, 1) 0ms`;
    node.style.transition = `transform ${timeout.exit}ms cubic-bezier(0.4, 0, 0.6, 1) 0ms`;

    setTranslateValue(direction, node);
  };

  const handleExited = () => {
    const node = childrenRef.current;
    // No need for transitions when the component is hidden
    node.style.webkitTransition = '';
    node.style.transition = '';
  };

  const updatePosition = React.useCallback(() => {
    if (childrenRef.current) {
      setTranslateValue(direction, childrenRef.current);
    }
  }, [direction]);

  React.useEffect(() => {
    // Skip configuration where the position is screen size invariant.
    if (inProp || direction === 'down' || direction === 'right') {
      return undefined;
    }

    const handleResize = debounce(() => {
      if (childrenRef.current) {
        setTranslateValue(direction, childrenRef.current);
      }
    });

    window.addEventListener('resize', handleResize);
    return () => {
      handleResize.clear();
      window.removeEventListener('resize', handleResize);
    };
  }, [direction, inProp]);

  React.useEffect(() => {
    if (!inProp) {
      // We need to update the position of the drawer when the direction change and
      // when it's hidden.
      updatePosition();
    }
  }, [inProp, updatePosition]);

  return (
    <Transition
      nodeRef={childrenRef}
      onEnter={handleEnter}
      onEntering={handleEntering}
      onExit={handleExit}
      onExited={handleExited}
      appear
      in={inProp}
      timeout={timeout}
      {...other}
    >
      {/* Ensure "ownerState" is not forwarded to the child DOM element when a direct HTML element is used. This avoids unexpected behavior since "ownerState" is intended for internal styling, component props and not as a DOM attribute. */}
      {(state, { ownerState, ...restChildProps }) => {
        return React.cloneElement(children, {
          ref: handleRef,
          style: {
            visibility: state === 'exited' && !inProp ? 'hidden' : undefined,
            ...children.props.style,
          },
          ...restChildProps,
        });
      }}
    </Transition>
  );
});

export default Slide;
