'use client';
// @inheritedComponent Tooltip
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import composeClasses from '@mui/utils/composeClasses';
import { emphasize } from '@mui/system/colorManipulator';
import { styled } from '../zero-styled';
import memoTheme from '../utils/memoTheme';
import { useDefaultProps } from '../DefaultPropsProvider';
import Fab from '../../../form/Fab';
import Tooltip from '../../../data-display/Tooltip';
import capitalize from '../utils/capitalize';
import speedDialActionClasses, { getSpeedDialActionUtilityClass } from './speedDialActionClasses';

const useUtilityClasses = (ownerState) => {
  const { open, tooltipPlacement, classes } = ownerState;

  const slots = {
    fab: ['fab', !open && 'fabClosed'],
  };

  return composeClasses(slots, getSpeedDialActionUtilityClass, classes);
};

const SpeedDialActionFab = styled(Fab, {
  name: 'MuiSpeedDialAction',
  slot: 'Fab',
  skipVariantsResolver: false,
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [styles.fab, !ownerState.open && styles.fabClosed];
  },
})(
  memoTheme(({ theme }) => ({
    margin: 8,
    color: (theme.vars || theme).palette.text.secondary,
    backgroundColor: (theme.vars || theme).palette.background.paper,
    '&:hover': {
      backgroundColor: theme.vars
        ? theme.vars.palette.SpeedDialAction.fabHoverBg
        : emphasize(theme.palette.background.paper, 0.15),
    },
    transition: `${theme.transitions.create('transform', {
      duration: theme.transitions.duration.shorter,
    })}, opacity 0.8s`,
    opacity: 1,
    variants: [
      {
        props: ({ ownerState }) => !ownerState.open,
        style: {
          opacity: 0,
          transform: 'scale(0)',
        },
      },
    ],
  })),
);

const SpeedDialAction = React.forwardRef(function SpeedDialAction(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuiSpeedDialAction' });
  const {
    className,
    delay = 0,
    icon,
    id,
    open,
    tooltipPlacement = 'left',
    tooltipTitle,
    ...other
  } = props;

  const ownerState = { ...props, tooltipPlacement };
  const classes = useUtilityClasses(ownerState);

  const transitionStyle = { transitionDelay: `${delay}ms` };

  const fab = (
    <SpeedDialActionFab
      className={clsx(classes.fab, className)}
      style={transitionStyle}
      tabIndex={-1}
      role="menuitem"
      size="small"
      ownerState={ownerState}
    >
      {icon}
    </SpeedDialActionFab>
  );

  return (
    <Tooltip
      id={id}
      ref={ref}
      title={tooltipTitle}
      placement={tooltipPlacement}
      {...other}
    >
      {fab}
    </Tooltip>
  );
});

SpeedDialAction.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * Adds a transition delay, to allow a series of SpeedDialActions to be animated.
   * @default 0
   */
  delay: PropTypes.number,
  /**
   * The icon to display in the SpeedDial Fab.
   */
  icon: PropTypes.node,
  /**
   * This prop is used to help implement the accessibility logic.
   * If you don't provide this prop. It falls back to a randomly generated id.
   */
  id: PropTypes.string,
  /**
   * If `true`, the component is shown.
   */
  open: PropTypes.bool,
  /**
   * Placement of the tooltip.
   * @default 'left'
   * @deprecated Use `slotProps.tooltip.placement` instead. This prop will be removed in a future major release. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  tooltipPlacement: PropTypes.oneOf([
    'auto-end',
    'auto-start',
    'auto',
    'bottom-end',
    'bottom-start',
    'bottom',
    'left-end',
    'left-start',
    'left',
    'right-end',
    'right-start',
    'right',
    'top-end',
    'top-start',
    'top',
  ]),
  /**
   * Label to display in the tooltip.
   * @deprecated Use `slotProps.tooltip.title` instead. This prop will be removed in a future major release. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  tooltipTitle: PropTypes.node,
};

export default SpeedDialAction;
