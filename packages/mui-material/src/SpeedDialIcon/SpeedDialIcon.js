'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import composeClasses from '@mui/utils/composeClasses';
import { styled } from '../zero-styled';
import memoTheme from '../utils/memoTheme';
import { useDefaultProps } from '../DefaultPropsProvider';
import AddIcon from '../internal/svg-icons/Add';
import speedDialIconClasses, { getSpeedDialIconUtilityClass } from './speedDialIconClasses';

const useUtilityClasses = (ownerState) => {
  const { classes, open } = ownerState;

  const slots = {
    root: ['root'],
    icon: ['icon', open && 'iconOpen'],
  };

  return composeClasses(slots, getSpeedDialIconUtilityClass, classes);
};

const SpeedDialIconRoot = styled('span', {
  name: 'MuiSpeedDialIcon',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      { [`& .${speedDialIconClasses.icon}`]: styles.icon },
      { [`& .${speedDialIconClasses.icon}`]: ownerState.open && styles.iconOpen },
      styles.root,
    ];
  },
})(
  memoTheme(({ theme }) => ({
    height: 24,
    [`& .${speedDialIconClasses.icon}`]: {
      transition: theme.transitions.create(['transform', 'opacity'], {
        duration: theme.transitions.duration.short,
      }),
    },
    variants: [
      {
        props: ({ ownerState }) => ownerState.open,
        style: {
          [`& .${speedDialIconClasses.icon}`]: {
            transform: 'rotate(45deg)',
          },
        },
      },
    ],
  })),
);

const SpeedDialIcon = React.forwardRef(function SpeedDialIcon(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuiSpeedDialIcon' });
  const { className, icon: iconProp, open, ...other } = props;

  const ownerState = props;
  const classes = useUtilityClasses(ownerState);

  function formatIcon(icon, newClassName) {
    if (React.isValidElement(icon)) {
      return React.cloneElement(icon, { className: newClassName });
    }

    return icon;
  }

  return (
    <SpeedDialIconRoot
      className={clsx(classes.root, className)}
      ref={ref}
      ownerState={ownerState}
      {...other}
    >
      {iconProp ? formatIcon(iconProp, classes.icon) : <AddIcon className={classes.icon} />}
    </SpeedDialIconRoot>
  );
});

SpeedDialIcon.propTypes /* remove-proptypes */ = {
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
   * The icon to display.
   */
  icon: PropTypes.node,
  /**
   * @ignore
   * If `true`, the component is shown.
   */
  open: PropTypes.bool,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
};

SpeedDialIcon.muiName = 'SpeedDialIcon';

export default SpeedDialIcon;
