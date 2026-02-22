'use client';
import * as React from 'react';

const TableRow = React.forwardRef(function TableRow(props, ref) {
  const {
    className,
    selected = false,
    style,
    ...other
  } = props;

  return (
    <tr
      ref={ref}
      className={className}
      style={{
        color: 'inherit',
        display: 'table-row',
        verticalAlign: 'middle',
        outline: 0,
        ...(selected && { backgroundColor: 'rgba(25, 118, 210, 0.08)' }),
        ...style,
      }}
      {...other}
    />
  );
});

export default TableRow;
