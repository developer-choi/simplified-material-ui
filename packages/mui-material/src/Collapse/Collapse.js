'use client';
import * as React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import composeClasses from '@mui/utils/composeClasses';
import { styled } from '../zero-styled';
import { duration } from '../styles/createTransitions';
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
  const {
    children,
    className,
    in: inProp,
    style,
    timeout = duration.standard,
    ...other
  } = inProps;

  const ownerState = {
    ...inProps,
    orientation: 'vertical',
    collapsedSize: '0px',
  };

  const classes = useUtilityClasses(ownerState);

  const wrapperRef = React.useRef(null);
  const [wrapperHeight, setWrapperHeight] = React.useState(0);
  const [isEntered, setIsEntered] = React.useState(inProp);

  React.useEffect(() => {
    if (wrapperRef.current) {
      setWrapperHeight(wrapperRef.current.clientHeight);
    }
  }, [children]);

  React.useEffect(() => {
    if (inProp) {
      setIsEntered(true);
    } else {
      const timer = setTimeout(() => setIsEntered(false), timeout);
      return () => clearTimeout(timer);
    }
  }, [inProp, timeout]);

  const stateOwnerState = { ...ownerState, state: isEntered ? 'entered' : 'exited' };

  return (
    <CollapseRoot
      ref={ref}
      className={clsx(classes.root, className, {
        [classes.entered]: isEntered,
        [classes.hidden]: !isEntered && !inProp,
      })}
      style={{
        minHeight: '0px',
        height: inProp ? wrapperHeight : 0,
        transition: `height ${timeout}ms ease-in-out`,
        overflow: 'hidden',
        ...style,
      }}
      ownerState={stateOwnerState}
      {...other}
    >
      <CollapseWrapper ref={wrapperRef} className={classes.wrapper} ownerState={stateOwnerState}>
        <CollapseWrapperInner className={classes.wrapperInner} ownerState={stateOwnerState}>
          {children}
        </CollapseWrapperInner>
      </CollapseWrapper>
    </CollapseRoot>
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
   * If `true`, the component will transition in.
   */
  in: PropTypes.bool,
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
