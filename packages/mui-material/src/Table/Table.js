'use client';
import * as React from 'react';
import TableContext from './TableContext';

const Table = React.forwardRef(function Table(props, ref) {
  const {
    className,
    padding = 'normal',
    size = 'medium',
    stickyHeader = false,
    style,
    ...other
  } = props;

  const table = React.useMemo(
    () => ({ padding, size, stickyHeader }),
    [padding, size, stickyHeader],
  );

  return (
    <TableContext.Provider value={table}>
      <table
        ref={ref}
        className={className}
        style={{
          display: 'table',
          width: '100%',
          borderCollapse: stickyHeader ? 'separate' : 'collapse',
          borderSpacing: 0,
          ...style,
        }}
        {...other}
      />
    </TableContext.Provider>
  );
});

export default Table;
