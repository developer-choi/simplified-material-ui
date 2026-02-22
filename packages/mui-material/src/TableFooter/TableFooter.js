'use client';
import * as React from 'react';
import Tablelvl2Context from '../../../data-display/Table/Tablelvl2Context';

const tablelvl2 = { variant: 'footer' };

const TableFooter = React.forwardRef(function TableFooter(props, ref) {
  const { className, style, ...other } = props;

  return (
    <Tablelvl2Context.Provider value={tablelvl2}>
      <tfoot
        ref={ref}
        className={className}
        style={{ display: 'table-footer-group', ...style }}
        {...other}
      />
    </Tablelvl2Context.Provider>
  );
});

export default TableFooter;
