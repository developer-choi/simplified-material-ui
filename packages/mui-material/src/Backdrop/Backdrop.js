'use client';
import * as React from 'react';

const Backdrop = React.forwardRef(function Backdrop(props, ref) {
  const {
    children,
    open,
    style,
    ...other
  } = props;

  if (!open) {
    return null;
  }

  return (
    <div
      ref={ref}
      aria-hidden="true"
      {...other}
      style={{
        position: 'fixed',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        right: 0,
        bottom: 0,
        top: 0,
        left: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
    >
      {children}
    </div>
  );
});

export default Backdrop;
