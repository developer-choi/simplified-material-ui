'use client';
import * as React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Transition } from 'react-transition-group';
import composeClasses from '@mui/utils/composeClasses';
import { styled, useTheme } from '../zero-styled';
import memoTheme from '../utils/memoTheme';
import { useDefaultProps } from '../DefaultPropsProvider';
import { duration } from '../styles/createTransitions';
import { getTransitionProps } from '../transitions/utils';
import { useForkRef } from '../utils';
import { getCollapseUtilityClass } from './collapseClasses';

const useUtilityClasses = (ownerState) => {
  const { orientation, classes } = ownerState;

  const slots = {
    root: ['root', `${orientation}`],
    entered: ['entered'],
    hidden: ['hidden'],
    wrapper: ['wrapper', `${orientation}`],
    wrapperInner: ['wrapperInner', `${orientation}`],
  };

  return composeClasses(slots, getCollapseUtilityClass, classes);
};

const CollapseRoot = styled('div', {
  name: 'MuiCollapse',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      styles.root,
      styles[ownerState.orientation],
      ownerState.state === 'entered' && styles.entered,
      ownerState.state === 'exited' &&
        !ownerState.in &&
        ownerState.collapsedSize === '0px' &&
        styles.hidden,
    ];
  },
})(
  memoTheme(({ theme }) => ({
    height: 0,
    overflow: 'hidden',
    transition: theme.transitions.create('height'),
    variants: [
      {
        props: {
          orientation: 'horizontal',
        },
        style: {
          height: 'auto',
          width: 0,
          transition: theme.transitions.create('width'),
        },
      },
      {
        props: {
          state: 'entered',
        },
        style: {
          height: 'auto',
          overflow: 'visible',
        },
      },
      {
        props: {
          state: 'entered',
          orientation: 'horizontal',
        },
        style: {
          width: 'auto',
        },
      },
      {
        props: ({ ownerState }) =>
          ownerState.state === 'exited' && !ownerState.in && ownerState.collapsedSize === '0px',
        style: {
          visibility: 'hidden',
        },
      },
    ],
  })),
);

const CollapseWrapper = styled('div', {
  name: 'MuiCollapse',
  slot: 'Wrapper',
})({
  // Hack to get children with a negative margin to not falsify the height computation.
  display: 'flex',
  width: '100%',
  variants: [
    {
      props: {
        orientation: 'horizontal',
      },
      style: {
        width: 'auto',
        height: '100%',
      },
    },
  ],
});

const CollapseWrapperInner = styled('div', {
  name: 'MuiCollapse',
  slot: 'WrapperInner',
})({
  width: '100%',
  variants: [
    {
      props: {
        orientation: 'horizontal',
      },
      style: {
        width: 'auto',
        height: '100%',
      },
    },
  ],
});

/**
 * The Collapse transition is used by the
 * [Vertical Stepper](/material-ui/react-stepper/#vertical-stepper) StepContent component.
 * It uses [react-transition-group](https://github.com/reactjs/react-transition-group) internally.
 */
const Collapse = React.forwardRef(function Collapse(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuiCollapse' });
  const {
    children,
    className,
    collapsedSize: collapsedSizeProp = '0px',
    in: inProp,
    orientation = 'vertical',
    style,
    timeout = duration.standard,
    // eslint-disable-next-line react/prop-types
    TransitionComponent = Transition,
    ...other
  } = props;

  const ownerState = {
    ...props,
    orientation,
    collapsedSize: collapsedSizeProp,
  };

  const classes = useUtilityClasses(ownerState);

  const theme = useTheme();
  const wrapperRef = React.useRef(null);
  const collapsedSize =
    typeof collapsedSizeProp === 'number' ? `${collapsedSizeProp}px` : collapsedSizeProp;
  const isHorizontal = orientation === 'horizontal';
  const size = isHorizontal ? 'width' : 'height';

  const nodeRef = React.useRef(null);
  const handleRef = useForkRef(ref, nodeRef);

  const getWrapperSize = () =>
    wrapperRef.current ? wrapperRef.current[isHorizontal ? 'clientWidth' : 'clientHeight'] : 0;

  const handleEnter = (node, isAppearing) => {
    if (wrapperRef.current && isHorizontal) {
      // Set absolute position to get the size of collapsed content
      wrapperRef.current.style.position = 'absolute';
    }
    node.style[size] = collapsedSize;
  };

  const handleEntering = (node, isAppearing) => {
    const wrapperSize = getWrapperSize();

    if (wrapperRef.current && isHorizontal) {
      // After the size is read reset the position back to default
      wrapperRef.current.style.position = '';
    }

    const { duration: transitionDuration } = getTransitionProps(
      { style, timeout },
      {
        mode: 'enter',
      },
    );

    node.style.transitionDuration =
      typeof transitionDuration === 'string' ? transitionDuration : `${transitionDuration}ms`;

    node.style[size] = `${wrapperSize}px`;
    node.style.transitionTimingFunction = 'ease-in-out';
  };

  const handleEntered = (node, isAppearing) => {
    node.style[size] = 'auto';
  };

  const handleExit = (node) => {
    node.style[size] = `${getWrapperSize()}px`;
  };

  const handleExited = () => {};

  const handleExiting = (node) => {
    const wrapperSize = getWrapperSize();
    const { duration: transitionDuration } = getTransitionProps(
      { style, timeout },
      {
        mode: 'exit',
      },
    );

    node.style.transitionDuration =
      typeof transitionDuration === 'string' ? transitionDuration : `${transitionDuration}ms`;

    node.style[size] = collapsedSize;
    node.style.transitionTimingFunction = 'ease-in-out';
  };

  const handleAddEndListener = () => {};


  return (
    <TransitionComponent
      in={inProp}
      onEnter={handleEnter}
      onEntered={handleEntered}
      onEntering={handleEntering}
      onExit={handleExit}
      onExited={handleExited}
      onExiting={handleExiting}
      addEndListener={handleAddEndListener}
      nodeRef={nodeRef}
      timeout={timeout}
      {...other}
    >
      {/* Destructure child props to prevent the component's "ownerState" from being overridden by incomingOwnerState. */}
      {(state, { ownerState: incomingOwnerState, ...restChildProps }) => {
        const stateOwnerState = { ...ownerState, state };
        return (
          <CollapseRoot
            ref={handleRef}
            className={clsx(classes.root, className, {
              [classes.entered]: state === 'entered',
              [classes.hidden]: state === 'exited' && !inProp && collapsedSize === '0px',
            })}
            style={{
              [isHorizontal ? 'minWidth' : 'minHeight']: collapsedSize,
              ...style,
            }}
            ownerState={stateOwnerState}
            {...restChildProps}
          >
            <CollapseWrapper ref={wrapperRef} className={classes.wrapper} ownerState={stateOwnerState}>
              <CollapseWrapperInner className={classes.wrapperInner} ownerState={stateOwnerState}>
                {children}
              </CollapseWrapperInner>
            </CollapseWrapper>
          </CollapseRoot>
        );
      }}
    </TransitionComponent>
  );
});

Collapse.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The content node to be collapsed.
   */
  children: PropTypes.node,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * The width (horizontal) or height (vertical) of the container when collapsed.
   * @default '0px'
   */
  collapsedSize: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /**
   * If `true`, the component will transition in.
   */
  in: PropTypes.bool,
  /**
   * The transition orientation.
   * @default 'vertical'
   */
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  /**
   * @ignore
   */
  style: PropTypes.object,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  /**
   * The duration for the transition, in milliseconds.
   * You may specify a single timeout for all transitions, or individually with an object.
   * @default duration.standard
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

export default Collapse;
