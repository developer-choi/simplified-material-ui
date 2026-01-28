'use client';
import * as React from 'react';

const MenuItem = React.forwardRef(function MenuItem(props, ref) {
  const {
    className,
    disabled,
    children,
    style,
    ...other
  } = props;

  const baseStyle = {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'relative',
    textDecoration: 'none',
    minHeight: 48,
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 16,
    paddingRight: 16,
    boxSizing: 'border-box',
    whiteSpace: 'nowrap',
    fontSize: '1rem',
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '0.00938em',
    backgroundColor: selected ? '#e3f2fd' : 'transparent',
    opacity: disabled ? 0.38 : 1,
    ...style,
  };

  return (
    <li
      ref={ref}
      className={className}
      style={baseStyle}
      role="menuitem"
      {...other}
    >
      {children}
    </li>
  );
});

export default MenuItem;
