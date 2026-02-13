'use client';
import * as React from 'react';

const Box = React.forwardRef(function Box(props, ref) {
  const { className, children, ...other } = props;

  return (
    <div ref={ref} className={className} {...other}>
      {children}
    </div>
  );
});

export default Box;
