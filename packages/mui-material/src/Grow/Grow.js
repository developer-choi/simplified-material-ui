'use client';
import * as React from 'react';
import useTimeout from '@mui/utils/useTimeout';
import getReactElementRef from '@mui/utils/getReactElementRef';
import { Transition } from 'react-transition-group';
import { useTheme } from '../zero-styled';
import { getTransitionProps, reflow } from '../transitions/utils';
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

/*
 TODO v6: remove
 Conditionally apply a workaround for the CSS transition bug in Safari 15.4 / WebKit browsers.
 */
const isWebKit154 =
  typeof navigator !== 'undefined' &&
  /^((?!chrome|android).)*(safari|mobile)/i.test(navigator.userAgent) &&
  /(os |version\/)15(.|_)4/i.test(navigator.userAgent);

/**
 * The Grow transition is used by the [Tooltip](/material-ui/react-tooltip/) and
 * [Popover](/material-ui/react-popover/) components.
 * It uses [react-transition-group](https://github.com/reactjs/react-transition-group) internally.
 */
const Grow = React.forwardRef(function Grow(props, ref) {
  const {
    addEndListener,
    appear = true,
    children,
    easing,
    in: inProp,
    style,
    timeout = 'auto',
    ...other
  } = props;
  const timer = useTimeout();
  const autoTimeout = React.useRef();
  const theme = useTheme();

  const nodeRef = React.useRef(null);
  const handleRef = useForkRef(nodeRef, getReactElementRef(children), ref);

  const handleEnter = (maybeIsAppearing) => {
    const node = nodeRef.current;

    const {
      duration: transitionDuration,
      delay,
      easing: transitionTimingFunction,
    } = getTransitionProps(
      { style, timeout, easing },
      {
        mode: 'enter',
      },
    );

    let duration;
    if (timeout === 'auto') {
      duration = theme.transitions.getAutoHeightDuration(node.clientHeight);
      autoTimeout.current = duration;
    } else {
      duration = transitionDuration;
    }

    node.style.transition = [
      theme.transitions.create('opacity', {
        duration,
        delay,
      }),
      theme.transitions.create('transform', {
        duration: isWebKit154 ? duration : duration * 0.666,
        delay,
        easing: transitionTimingFunction,
      }),
    ].join(',');
  };

  const handleExit = () => {
    const node = nodeRef.current;

    const {
      duration: transitionDuration,
      delay,
      easing: transitionTimingFunction,
    } = getTransitionProps(
      { style, timeout, easing },
      {
        mode: 'exit',
      },
    );

    let duration;
    if (timeout === 'auto') {
      duration = theme.transitions.getAutoHeightDuration(node.clientHeight);
      autoTimeout.current = duration;
    } else {
      duration = transitionDuration;
    }

    node.style.transition = [
      theme.transitions.create('opacity', {
        duration,
        delay,
      }),
      theme.transitions.create('transform', {
        duration: isWebKit154 ? duration : duration * 0.666,
        delay: isWebKit154 ? delay : delay || duration * 0.333,
        easing: transitionTimingFunction,
      }),
    ].join(',');

    node.style.opacity = 0;
    node.style.transform = getScale(0.75);
  };

  const handleAddEndListener = (next) => {
    if (timeout === 'auto') {
      timer.start(autoTimeout.current || 0, next);
    }
    if (addEndListener) {
      // Old call signature before `react-transition-group` implemented `nodeRef`
      addEndListener(nodeRef.current, next);
    }
  };

  return (
    <Transition
      appear={appear}
      in={inProp}
      nodeRef={nodeRef}
      onEnter={handleEnter}
      onExit={handleExit}
      addEndListener={handleAddEndListener}
      timeout={timeout === 'auto' ? null : timeout}
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
            ...style,
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
