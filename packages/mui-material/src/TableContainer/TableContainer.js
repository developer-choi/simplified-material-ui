'use client';
import * as React from 'react';

const TableContainer = React.forwardRef(function TableContainer(props, ref) {
  const { className, style, ...other } = props;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        width: '100%',
        overflowX: 'auto',
        ...style,
      }}
      {...other}
    />
  );
});

export default TableContainer;
