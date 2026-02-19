'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import AddIcon from '../internal/svg-icons/Add';

const SpeedDialIcon = React.forwardRef(function SpeedDialIcon(props, ref) {
  const { className, icon: iconProp, open, ...other } = props;

  const iconStyle = {
    transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
  };

  const iconElement = iconProp
    ? React.isValidElement(iconProp)
      ? React.cloneElement(iconProp, { style: { ...iconStyle, ...iconProp.props.style } })
      : iconProp
    : <AddIcon style={iconStyle} />;

  return (
    <span ref={ref} style={{ height: 24 }} className={className} {...other}>
      {iconElement}
    </span>
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
};

SpeedDialIcon.muiName = 'SpeedDialIcon';

export default SpeedDialIcon;
