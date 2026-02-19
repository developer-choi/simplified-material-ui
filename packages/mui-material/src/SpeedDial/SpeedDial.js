'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import composeClasses from '@mui/utils/composeClasses';
import { styled, useTheme } from '../zero-styled';
import memoTheme from '../utils/memoTheme';
import { useDefaultProps } from '../DefaultPropsProvider';
import Zoom from '../Zoom';
import Fab from '../../../form/Fab';
import speedDialClasses, { getSpeedDialUtilityClass } from './speedDialClasses';

const useUtilityClasses = (ownerState) => {
  const { classes, open } = ownerState;

  const slots = {
    root: ['root', 'directionUp'],
    fab: ['fab'],
    actions: ['actions', !open && 'actionsClosed'],
  };

  return composeClasses(slots, getSpeedDialUtilityClass, classes);
};

const SpeedDialRoot = styled('div', {
  name: 'MuiSpeedDial',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    return [styles.root, styles.directionUp];
  },
})(
  memoTheme(({ theme }) => ({
    zIndex: (theme.vars || theme).zIndex.speedDial,
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
    flexDirection: 'column-reverse',
    [`& .${speedDialClasses.actions}`]: {
      flexDirection: 'column-reverse',
      marginBottom: -32,
      paddingBottom: 48,
    },
  })),
);

const SpeedDialFab = styled(Fab, {
  name: 'MuiSpeedDial',
  slot: 'Fab',
})({
  pointerEvents: 'auto',
});

const SpeedDialActions = styled('div', {
  name: 'MuiSpeedDial',
  slot: 'Actions',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [styles.actions, !ownerState.open && styles.actionsClosed];
  },
})({
  display: 'flex',
  pointerEvents: 'auto',
  variants: [
    {
      props: ({ ownerState }) => !ownerState.open,
      style: {
        transition: 'top 0s linear 0.2s',
        pointerEvents: 'none',
      },
    },
  ],
});

const SpeedDial = React.forwardRef(function SpeedDial(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuiSpeedDial' });
  const theme = useTheme();
  const defaultTransitionDuration = {
    enter: theme.transitions.duration.enteringScreen,
    exit: theme.transitions.duration.leavingScreen,
  };

  const {
    ariaLabel,
    children: childrenProp,
    className,
    hidden = false,
    icon,
    onClose,
    onOpen,
    transitionDuration = defaultTransitionDuration,
    ...other
  } = props;

  const [open, setOpenState] = React.useState(false);

  const ownerState = { ...props, open };
  const classes = useUtilityClasses(ownerState);

  const timerRef = React.useRef();
  const fabRef = React.useRef(null);

  React.useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setOpenState(false);
      fabRef.current?.focus();

      if (onClose) {
        onClose(event, 'escapeKeyDown');
      }
    }
  };

  const handleClose = (event) => {
    clearTimeout(timerRef.current);
    if (event.type === 'blur') {
      timerRef.current = setTimeout(() => {
        setOpenState(false);
        if (onClose) {
          onClose(event, 'blur');
        }
      }, 0);
    } else {
      setOpenState(false);
      if (onClose) {
        onClose(event, 'mouseLeave');
      }
    }
  };

  const handleClick = (event) => {
    clearTimeout(timerRef.current);

    if (open) {
      setOpenState(false);
      if (onClose) {
        onClose(event, 'toggle');
      }
    } else {
      setOpenState(true);
      if (onOpen) {
        onOpen(event, 'toggle');
      }
    }
  };

  const handleOpen = (event) => {
    clearTimeout(timerRef.current);

    if (!open) {
      timerRef.current = setTimeout(() => {
        setOpenState(true);
        if (onOpen) {
          const eventMap = {
            focus: 'focus',
            mouseenter: 'mouseEnter',
          };

          onOpen(event, eventMap[event.type]);
        }
      }, 0);
    }
  };

  // Filter the label for valid id characters.
  const id = ariaLabel.replace(/^[^a-z]+|[^\w:.-]+/gi, '');

  const allItems = React.Children.toArray(childrenProp).filter(React.isValidElement);

  const children = allItems.map((child, index) => {
    return React.cloneElement(child, {
      delay: 30 * (open ? index : allItems.length - index),
      open,
      id: `${id}-action-${index}`,
    });
  });

  return (
    <SpeedDialRoot
      ref={ref}
      className={clsx(classes.root, className)}
      role="presentation"
      onKeyDown={handleKeyDown}
      onBlur={handleClose}
      onFocus={handleOpen}
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
      ownerState={ownerState}
      {...other}
    >
      <Zoom in={!hidden} timeout={transitionDuration} unmountOnExit>
        <SpeedDialFab
          color="primary"
          aria-label={ariaLabel}
          aria-haspopup="true"
          aria-expanded={open}
          aria-controls={`${id}-actions`}
          onClick={handleClick}
          className={classes.fab}
          ref={fabRef}
          ownerState={ownerState}
        >
          {React.isValidElement(icon)
            ? React.cloneElement(icon, { open })
            : icon}
        </SpeedDialFab>
      </Zoom>
      <SpeedDialActions
        id={`${id}-actions`}
        role="menu"
        className={clsx(classes.actions, { [classes.actionsClosed]: !open })}
        ownerState={ownerState}
      >
        {children}
      </SpeedDialActions>
    </SpeedDialRoot>
  );
});

SpeedDial.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The aria-label of the button element.
   * Also used to provide the `id` for the `SpeedDial` element and its children.
   */
  ariaLabel: PropTypes.string.isRequired,
  /**
   * SpeedDialActions to display when the SpeedDial is `open`.
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
   * The direction the actions open relative to the floating action button.
   * @default 'up'
   */
  direction: PropTypes.oneOf(['down', 'left', 'right', 'up']),
  /**
   * Props applied to the [`Fab`](https://mui.com/material-ui/api/fab/) element.
   * @default {}
   */
  FabProps: PropTypes.object,
  /**
   * If `true`, the SpeedDial is hidden.
   * @default false
   */
  hidden: PropTypes.bool,
  /**
   * The icon to display in the SpeedDial Fab. The `SpeedDialIcon` component
   * provides a default Icon with animation.
   */
  icon: PropTypes.node,
  /**
   * @ignore
   */
  onBlur: PropTypes.func,
  /**
   * Callback fired when the component requests to be closed.
   *
   * @param {object} event The event source of the callback.
   * @param {string} reason Can be: `"toggle"`, `"blur"`, `"mouseLeave"`, `"escapeKeyDown"`.
   */
  onClose: PropTypes.func,
  /**
   * @ignore
   */
  onFocus: PropTypes.func,
  /**
   * @ignore
   */
  onKeyDown: PropTypes.func,
  /**
   * @ignore
   */
  onMouseEnter: PropTypes.func,
  /**
   * @ignore
   */
  onMouseLeave: PropTypes.func,
  /**
   * Callback fired when the component requests to be open.
   *
   * @param {object} event The event source of the callback.
   * @param {string} reason Can be: `"toggle"`, `"focus"`, `"mouseEnter"`.
   */
  onOpen: PropTypes.func,
  /**
   * If `true`, the component is shown.
   */
  open: PropTypes.bool,
  /**
   * The icon to display in the SpeedDial Fab when the SpeedDial is open.
   */
  openIcon: PropTypes.node,
  /**
   * The props used for each slot inside.
   * @default {}
   */
  slotProps: PropTypes.shape({
    root: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    transition: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  }),
  /**
   * The components used for each slot inside.
   * @default {}
   */
  slots: PropTypes.shape({
    root: PropTypes.elementType,
    transition: PropTypes.elementType,
  }),
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  /**
   * The component used for the transition.
   * [Follow this guide](https://mui.com/material-ui/transitions/#transitioncomponent-prop) to learn more about the requirements for this component.
   * @default Zoom
   * * @deprecated Use `slots.transition` instead. This prop will be removed in a future major release. [How to migrate](/material-ui/migration/migrating-from-deprecated-apis/)
   */
  TransitionComponent: PropTypes.elementType,
  /**
   * The duration for the transition, in milliseconds.
   * You may specify a single timeout for all transitions, or individually with an object.
   * @default {
   *   enter: theme.transitions.duration.enteringScreen,
   *   exit: theme.transitions.duration.leavingScreen,
   * }
   */
  transitionDuration: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape({
      appear: PropTypes.number,
      enter: PropTypes.number,
      exit: PropTypes.number,
    }),
  ]),
  /**
   * Props applied to the transition element.
   * By default, the element is based on this [`Transition`](https://reactcommunity.org/react-transition-group/transition/) component.
   * @deprecated Use `slotProps.transition` instead. This prop will be removed in a future major release. [How to migrate](/material-ui/migration/migrating-from-deprecated-apis/)
   */
  TransitionProps: PropTypes.object,
};

export default SpeedDial;
