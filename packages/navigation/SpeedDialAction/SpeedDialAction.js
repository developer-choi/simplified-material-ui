'use client';
import * as React from 'react';
import Fab from '../../form/Fab';
import Tooltip from '../../data-display/Tooltip';

const SpeedDialAction = React.forwardRef(function SpeedDialAction(props, ref) {
  const {
    className,
    delay = 0,
    icon,
    id,
    open,
    tooltipTitle,
    ...other
  } = props;

  const fabStyle = {
    margin: 8,
    color: 'rgba(0, 0, 0, 0.6)',
    backgroundColor: '#fff',
    transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s',
    transitionDelay: `${delay}ms`,
    opacity: open ? 1 : 0,
    transform: open ? 'scale(1)' : 'scale(0)',
  };

  return (
    <Tooltip
      id={id}
      ref={ref}
      title={tooltipTitle}
      placement="left"
      {...other}
    >
      <Fab
        className={className}
        style={fabStyle}
        tabIndex={-1}
        role="menuitem"
        size="small"
      >
        {icon}
      </Fab>
    </Tooltip>
  );
});

export default SpeedDialAction;
