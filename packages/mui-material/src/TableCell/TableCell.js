'use client';
import * as React from 'react';
import TableContext from '../Table/TableContext';
import Tablelvl2Context from '../Table/Tablelvl2Context';

/**
 * The component renders a `<th>` element when the parent context is a header
 * or otherwise a `<td>` element.
 */
const TableCell = React.forwardRef(function TableCell(props, ref) {
  const {
    align = 'inherit',
    className,
    padding: paddingProp,
    scope: scopeProp,
    size: sizeProp,
    sortDirection,
    style,
    variant: variantProp,
    ...other
  } = props;

  const table = React.useContext(TableContext);
  const tablelvl2 = React.useContext(Tablelvl2Context);

  const isHeadCell = tablelvl2 && tablelvl2.variant === 'head';
  const Component = isHeadCell ? 'th' : 'td';

  let scope = scopeProp;
  if (Component === 'td') {
    scope = undefined;
  } else if (!scope && isHeadCell) {
    scope = 'col';
  }

  const variant = variantProp || (tablelvl2 && tablelvl2.variant);
  const padding = paddingProp || (table && table.padding ? table.padding : 'normal');
  const size = sizeProp || (table && table.size ? table.size : 'medium');
  const stickyHeader = variant === 'head' && table && table.stickyHeader;

  let ariaSort = null;
  if (sortDirection) {
    ariaSort = sortDirection === 'asc' ? 'ascending' : 'descending';
  }

  return (
    <Component
      ref={ref}
      className={className}
      aria-sort={ariaSort}
      scope={scope}
      style={{
        display: 'table-cell',
        verticalAlign: 'inherit',
        borderBottom: '1px solid rgba(224, 224, 224, 1)',
        textAlign: 'left',
        padding: size === 'small' ? '6px 16px' : '16px',
        fontSize: '0.875rem',
        lineHeight: 1.43,
        fontWeight: 400,
        ...(variant === 'head' && {
          color: 'rgba(0,0,0,0.87)',
          fontWeight: 500,
          lineHeight: '1.5rem',
        }),
        ...(variant === 'body' && {
          color: 'rgba(0,0,0,0.87)',
        }),
        ...(variant === 'footer' && {
          color: 'rgba(0,0,0,0.6)',
          fontSize: '0.75rem',
          lineHeight: '1.3125rem',
        }),
        ...(padding === 'checkbox' && {
          width: 48,
          padding: '0 0 0 4px',
        }),
        ...(padding === 'none' && {
          padding: 0,
        }),
        ...(align === 'center' && { textAlign: 'center' }),
        ...(align === 'right' && { textAlign: 'right', flexDirection: 'row-reverse' }),
        ...(align === 'justify' && { textAlign: 'justify' }),
        ...(stickyHeader && {
          position: 'sticky',
          top: 0,
          zIndex: 2,
          backgroundColor: '#ffffff',
        }),
        ...style,
      }}
      {...other}
    />
  );
});

export default TableCell;
