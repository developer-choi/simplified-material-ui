'use client';
import * as React from 'react';

const AppBar = React.forwardRef(function AppBar(props, ref) {
  const {
    className,
    color = 'primary',
    position = 'fixed',
    style,
    ...other
  } = props;

  const positionStyles = {
    position: position,
    ...(position === 'fixed' || position === 'absolute' || position === 'sticky'
      ? {
          zIndex: 1100,
          top: 0,
          left: 'auto',
          right: 0,
        }
      : {}),
  };

  return (
    <header
      ref={ref}
      className={
        position === 'fixed'
          ? className
            ? `mui-fixed ${className}`
            : 'mui-fixed'
          : className
      }
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        boxSizing: 'border-box',
        flexShrink: 0,
        backgroundColor: '#1976d2',
        color: '#fff',
        boxShadow:
          '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
        ...positionStyles,
        ...style,
      }}
      {...other}
    />
  );
});

export default AppBar;
