'use client';
import * as React from 'react';
import AddIcon from '@mui/material/internal/svg-icons/Add';

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

SpeedDialIcon.muiName = 'SpeedDialIcon';

export default SpeedDialIcon;
