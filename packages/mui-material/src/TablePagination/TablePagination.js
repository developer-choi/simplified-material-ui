'use client';
import * as React from 'react';
import TableCell from '../TableCell';
import TablePaginationActions from '../TablePaginationActions';

function defaultLabelDisplayedRows({ from, to, count }) {
  return `${from}–${to} of ${count !== -1 ? count : `more than ${to}`}`;
}

function defaultGetAriaLabel(type) {
  return `Go to ${type} page`;
}

const TablePagination = React.forwardRef(function TablePagination(props, ref) {
  const {
    colSpan: colSpanProp,
    count,
    disabled = false,
    getItemAriaLabel = defaultGetAriaLabel,
    labelDisplayedRows = defaultLabelDisplayedRows,
    labelRowsPerPage = 'Rows per page:',
    onPageChange,
    onRowsPerPageChange,
    page,
    rowsPerPage,
    rowsPerPageOptions = [10, 25, 50, 100],
    showFirstButton = false,
    showLastButton = false,
    ...other
  } = props;

  const colSpan = colSpanProp || 1000;
  const selectId = React.useId();
  const labelId = React.useId();

  const getLabelDisplayedRowsTo = () => {
    if (count === -1) {
      return (page + 1) * rowsPerPage;
    }
    return rowsPerPage === -1 ? count : Math.min(count, (page + 1) * rowsPerPage);
  };

  const body2 = { fontSize: '0.875rem', lineHeight: 1.43, fontWeight: 400 };

  return (
    <TableCell
      ref={ref}
      colSpan={colSpan}
      style={{ overflow: 'auto', color: 'rgba(0,0,0,0.87)', fontSize: '0.875rem', padding: 0 }}
      {...other}
    >
      <div
        style={{ display: 'flex', alignItems: 'center', minHeight: 52, paddingRight: 2 }}
      >
        <div style={{ flex: '1 1 100%' }} />
        {rowsPerPageOptions.length > 1 && (
          <p id={labelId} style={{ ...body2, flexShrink: 0, margin: 0 }}>
            {labelRowsPerPage}
          </p>
        )}
        {rowsPerPageOptions.length > 1 && (
          <select
            id={selectId}
            aria-labelledby={labelId}
            value={rowsPerPage}
            onChange={onRowsPerPageChange}
            disabled={disabled}
            style={{ color: 'inherit', fontSize: 'inherit', flexShrink: 0, marginRight: 32, marginLeft: 8 }}
          >
            {rowsPerPageOptions.map((option) => (
              <option
                key={option.label ?? option}
                value={option.value ?? option}
              >
                {option.label ?? option}
              </option>
            ))}
          </select>
        )}
        <p style={{ ...body2, flexShrink: 0, margin: 0 }}>
          {labelDisplayedRows({
            from: count === 0 ? 0 : page * rowsPerPage + 1,
            to: getLabelDisplayedRowsTo(),
            count: count === -1 ? -1 : count,
            page,
          })}
        </p>
        <TablePaginationActions
          count={count}
          onPageChange={onPageChange}
          page={page}
          rowsPerPage={rowsPerPage}
          showFirstButton={showFirstButton}
          showLastButton={showLastButton}
          getItemAriaLabel={getItemAriaLabel}
          disabled={disabled}
          style={{ flexShrink: 0, marginLeft: 20 }}
        />
      </div>
    </TableCell>
  );
});

export default TablePagination;
