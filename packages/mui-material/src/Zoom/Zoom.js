'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import { Transition } from 'react-transition-group';
import elementAcceptingRef from '@mui/utils/elementAcceptingRef';

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

Zoom.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * Add a custom transition end trigger. Called with the transitioning DOM
   * node and a done callback. Allows for more fine grained transition end
   * logic. Note: Timeouts are still used as a fallback if provided.
   */
  addEndListener: PropTypes.func,
  /**
   * Perform the enter transition when it first mounts if `in` is also `true`.
   * Set this to `false` to disable this behavior.
   * @default true
   */
  appear: PropTypes.bool,
  /**
   * A single child content element.
   */
  children: elementAcceptingRef.isRequired,
  /**
   * The transition timing function.
   * You may specify a single easing or a object containing enter and exit values.
   */
  easing: PropTypes.oneOfType([
    PropTypes.shape({
      enter: PropTypes.string,
      exit: PropTypes.string,
    }),
    PropTypes.string,
  ]),
  /**
   * If `true`, the component will transition in.
   */
  in: PropTypes.bool,
  /**
   * @ignore
   */
  onEnter: PropTypes.func,
  /**
   * @ignore
   */
  onEntered: PropTypes.func,
  /**
   * @ignore
   */
  onEntering: PropTypes.func,
  /**
   * @ignore
   */
  onExit: PropTypes.func,
  /**
   * @ignore
   */
  onExited: PropTypes.func,
  /**
   * @ignore
   */
  onExiting: PropTypes.func,
  /**
   * @ignore
   */
  style: PropTypes.object,
  /**
   * The duration for the transition, in milliseconds.
   * You may specify a single timeout for all transitions, or individually with an object.
   * @default {
   *   enter: theme.transitions.duration.enteringScreen,
   *   exit: theme.transitions.duration.leavingScreen,
   * }
   */
  timeout: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape({
      appear: PropTypes.number,
      enter: PropTypes.number,
      exit: PropTypes.number,
    }),
  ]),
};

export default Zoom;
