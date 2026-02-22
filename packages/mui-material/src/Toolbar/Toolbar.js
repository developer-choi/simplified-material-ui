'use client';
import * as React from 'react';

const Toolbar = React.forwardRef(function Toolbar(props, ref) {
  const {
    className,
    disableGutters = false,
    variant = 'regular',
    style,
    ...other
  } = props;

  return (
    <div
      className={className}
      ref={ref}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        ...(!disableGutters && { paddingLeft: 16, paddingRight: 16 }),
        ...(variant === 'dense' && { minHeight: 48 }),
        ...(variant === 'regular' && { minHeight: 56 }),
        ...style,
      }}
      {...other}
    />
  );
});

export default Toolbar;
