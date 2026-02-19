'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { styled } from '../zero-styled';
import AddIcon from '../internal/svg-icons/Add';
import speedDialIconClasses from './speedDialIconClasses';

const SpeedDialIconRoot = styled('span', {
  name: 'MuiSpeedDialIcon',
  slot: 'Root',
})({
  height: 24,
  [`& .${speedDialIconClasses.icon}`]: {
    transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1), opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)',
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
});

const SpeedDialIcon = React.forwardRef(function SpeedDialIcon(props, ref) {
  const { className, icon: iconProp, open, ...other } = props;

  const ownerState = props;

  function formatIcon(icon, newClassName) {
    if (React.isValidElement(icon)) {
      return React.cloneElement(icon, { className: newClassName });
    }

    return icon;
  }

  const iconClassName = clsx(speedDialIconClasses.icon, open && speedDialIconClasses.iconOpen);

  return (
    <SpeedDialIconRoot
      className={clsx(speedDialIconClasses.root, className)}
      ref={ref}
      ownerState={ownerState}
      {...other}
    >
      {iconProp ? formatIcon(iconProp, iconClassName) : <AddIcon className={iconClassName} />}
    </SpeedDialIconRoot>
  );
});

SpeedDialIcon.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
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
