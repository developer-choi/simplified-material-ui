'use client';
import * as React from 'react';
import { Transition } from 'react-transition-group';
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

function Slide(props) {
  const timeout = { enter: 225, exit: 195 };

  const {
    children,
    direction = 'down',
    in: inProp,
    ...other
  } = props;

  const nodeRef = React.useRef(null);

  const handleEnter = () => {
    const node = nodeRef.current;
    setTranslateValue(direction, node);
    reflow(node);
  };

  const handleEntering = () => {
    const node = nodeRef.current;
    node.style.webkitTransition = `transform ${timeout.enter}ms cubic-bezier(0, 0, 0.2, 1) 0ms`;
    node.style.transition = `transform ${timeout.enter}ms cubic-bezier(0, 0, 0.2, 1) 0ms`;
    node.style.webkitTransform = 'none';
    node.style.transform = 'none';
  };

  const handleExit = () => {
    const node = nodeRef.current;
    node.style.webkitTransition = `transform ${timeout.exit}ms cubic-bezier(0.4, 0, 0.6, 1) 0ms`;
    node.style.transition = `transform ${timeout.exit}ms cubic-bezier(0.4, 0, 0.6, 1) 0ms`;

    setTranslateValue(direction, node);
  };

  const handleExited = () => {
    const node = nodeRef.current;
    // No need for transitions when the component is hidden
    node.style.webkitTransition = '';
    node.style.transition = '';
  };

  const updatePosition = React.useCallback(() => {
    if (nodeRef.current) {
      setTranslateValue(direction, nodeRef.current);
    }
  }, [direction]);

  React.useEffect(() => {
    // Skip configuration where the position is screen size invariant.
    if (inProp || direction === 'down' || direction === 'right') {
      return undefined;
    }

    const handleResize = () => {
      if (nodeRef.current) {
        setTranslateValue(direction, nodeRef.current);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
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
      nodeRef={nodeRef}
      onEnter={handleEnter}
      onEntering={handleEntering}
      onExit={handleExit}
      onExited={handleExited}
      appear
      in={inProp}
      timeout={timeout}
      {...other}
    >
      {(state) => {
        return React.cloneElement(children, {
          ref: nodeRef,
          style: {
            visibility: state === 'exited' && !inProp ? 'hidden' : undefined,
            ...children.props.style,
          },
        });
      }}
    </Transition>
  );
}

export default Slide;
