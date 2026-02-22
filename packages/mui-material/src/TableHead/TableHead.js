'use client';
import * as React from 'react';
import Tablelvl2Context from '../Table/Tablelvl2Context';

const tablelvl2 = { variant: 'head' };

const TableHead = React.forwardRef(function TableHead(props, ref) {
  const { className, style, ...other } = props;

  return (
    <Tablelvl2Context.Provider value={tablelvl2}>
      <thead
        ref={ref}
        className={className}
        style={{ display: 'table-header-group', ...style }}
        {...other}
      />
    </Tablelvl2Context.Provider>
  );
});

export default TableHead;
