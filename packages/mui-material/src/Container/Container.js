'use client';
import * as React from 'react';
import clsx from 'clsx';

const Container = React.forwardRef(function Container(props, ref) {
  const {
    children,
    className,
    style,
    ...other
  } = props;

  const rootStyle = {
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    boxSizing: 'border-box',
    paddingLeft: '16px',
    paddingRight: '16px',
    maxWidth: '1200px',
    ...style,
  };

  return (
    <div
      ref={ref}
      className={clsx('MuiContainer-root', className)}
      style={rootStyle}
      {...other}
    >
      {children}
    </div>
  );
});

export default Container;
