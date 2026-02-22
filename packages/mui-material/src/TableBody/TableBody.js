'use client';
import * as React from 'react';
import Tablelvl2Context from '../Table/Tablelvl2Context';

const tablelvl2 = { variant: 'body' };

const TableBody = React.forwardRef(function TableBody(props, ref) {
  const { className, style, ...other } = props;

  return (
    <Tablelvl2Context.Provider value={tablelvl2}>
      <tbody
        ref={ref}
        className={className}
        style={{ display: 'table-row-group', ...style }}
        {...other}
      />
    </Tablelvl2Context.Provider>
  );
});

export default TableBody;
