'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import { Transition } from 'react-transition-group';
import elementAcceptingRef from '@mui/utils/elementAcceptingRef';
import getReactElementRef from '@mui/utils/getReactElementRef';
import { reflow, getTransitionProps } from '../transitions/utils';
import useForkRef from '../utils/useForkRef';

const styles = {
  entering: {
    opacity: 1,
  },
  entered: {
    opacity: 1,
  },
};

/**
 * The Fade transition is used by the [Modal](/material-ui/react-modal/) component.
 * It uses [react-transition-group](https://github.com/reactjs/react-transition-group) internally.
 */
const Fade = React.forwardRef(function Fade(props, ref) {
  const {
    children,
    in: inProp,
    style,
    ...other
  } = props;

  const enableStrictModeCompat = true;
  const nodeRef = React.useRef(null);
  const handleRef = useForkRef(nodeRef, getReactElementRef(children), ref);

  const handleEnter = (node, isAppearing) => {
    reflow(node); // So the animation always start from the start.

    const transitionProps = getTransitionProps(
      { style, timeout: 225 },
      {
        mode: 'enter',
      },
    );

    const duration = transitionProps.duration || 225;
    const easing = transitionProps.easing || 'cubic-bezier(0.4, 0, 0.2, 1)';
    const delay = transitionProps.delay || 0;
    const transition = `opacity ${duration}ms ${easing} ${delay}ms`;

    node.style.webkitTransition = transition;
    node.style.transition = transition;
  };

  const handleExit = (node) => {
    const transitionProps = getTransitionProps(
      { style, timeout: 195 },
      {
        mode: 'exit',
      },
    );

    const duration = transitionProps.duration || 195;
    const easing = transitionProps.easing || 'cubic-bezier(0.4, 0, 0.2, 1)';
    const delay = transitionProps.delay || 0;
    const transition = `opacity ${duration}ms ${easing} ${delay}ms`;

    node.style.webkitTransition = transition;
    node.style.transition = transition;
  };

  return (
    <Transition
      appear={true}
      in={inProp}
      nodeRef={enableStrictModeCompat ? nodeRef : undefined}
      onEnter={handleEnter}
      onExit={handleExit}
      timeout={{ enter: 225, exit: 195 }}
      {...other}
    >
      {/* Ensure "ownerState" is not forwarded to the child DOM element when a direct HTML element is used. This avoids unexpected behavior since "ownerState" is intended for internal styling, component props and not as a DOM attribute. */}
      {(state, { ownerState, ...restChildProps }) => {
        return React.cloneElement(children, {
          style: {
            opacity: 0,
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

Fade.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * A single child content element.
   */
  children: elementAcceptingRef.isRequired,
  /**
   * If `true`, the component will transition in.
   */
  in: PropTypes.bool,
  /**
   * @ignore
   */
  style: PropTypes.object,
};

export default Fade;
