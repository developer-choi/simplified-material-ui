'use client';
import * as React from 'react';
import clsx from 'clsx';

const Fab = React.forwardRef(function Fab(props, ref) {
  const { children, className, style, ...other } = props;

  const rootStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    boxSizing: 'border-box',
    backgroundColor: '#1976d2',
    color: '#fff',
    boxShadow: '0px 3px 5px -1px rgba(0,0,0,0.2), 0px 6px 10px 0px rgba(0,0,0,0.14), 0px 1px 18px 0px rgba(0,0,0,0.12)',
    padding: 0,
    minWidth: 0,
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    zIndex: 1050,
    ...style,
  };

  return (
    <button ref={ref} className={clsx('MuiFab-root', className)} style={rootStyle} {...other}>
      {children}
    </button>
  );
});

export default Fab;
