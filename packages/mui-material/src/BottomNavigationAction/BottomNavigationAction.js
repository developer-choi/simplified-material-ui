'use client';
import * as React from 'react';

const BottomNavigationAction = React.forwardRef(function BottomNavigationAction(
  {
    icon,
    label,
    onChange,
    onClick,
    // eslint-disable-next-line react/prop-types -- private, always overridden by BottomNavigation
    selected,
    showLabel,
    value,
    ...other
  },
  ref,
) {
  const handleChange = (event) => {
    if (onChange) {
      onChange(event, value);
    }

    if (onClick) {
      onClick(event);
    }
  };

  // Determine padding based on showLabel and selected states
  const paddingTop = !showLabel && !selected ? (!label ? 0 : 14) : 6;

  return (
    <button
      ref={ref}
      onClick={handleChange}
      style={{
        padding: `${paddingTop}px 12px 8px`,
        minWidth: 80,
        maxWidth: 168,
        color: selected ? '#1976d2' : 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        flexDirection: 'column',
        flex: '1',
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        alignItems: 'center',
      }}
      {...other}
    >
      {icon}
      <span
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: selected ? 14 : 12,
          opacity: showLabel || selected ? 1 : 0,
        }}
      >
        {label}
      </span>
    </button>
  );
});

export default BottomNavigationAction;
