'use client';
import * as React from 'react';

const FirstPageIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"
    style={{ display: 'block', width: '1em', height: '1em', fill: 'currentColor' }}>
    <path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z" />
  </svg>
);

const LastPageIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"
    style={{ display: 'block', width: '1em', height: '1em', fill: 'currentColor' }}>
    <path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z" />
  </svg>
);

const KeyboardArrowLeft = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"
    style={{ display: 'block', width: '1em', height: '1em', fill: 'currentColor' }}>
    <path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z" />
  </svg>
);

const KeyboardArrowRight = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"
    style={{ display: 'block', width: '1em', height: '1em', fill: 'currentColor' }}>
    <path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z" />
  </svg>
);

const TablePaginationActions = React.forwardRef(function TablePaginationActions(props, ref) {
  const {
    className,
    count,
    disabled = false,
    getItemAriaLabel,
    onPageChange,
    page,
    rowsPerPage,
    showFirstButton,
    showLastButton,
    style,
    ...other
  } = props;

  const handleFirstPageButtonClick = (event) => onPageChange(event, 0);
  const handleBackButtonClick = (event) => onPageChange(event, page - 1);
  const handleNextButtonClick = (event) => onPageChange(event, page + 1);
  const handleLastPageButtonClick = (event) =>
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));

  const lastPage = Math.ceil(count / rowsPerPage) - 1;

  const btnStyle = {
    background: 'none',
    border: 'none',
    padding: 8,
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    cursor: 'pointer',
  };

  return (
    <div ref={ref} className={className} style={style} {...other}>
      {showFirstButton && (
        <button
          onClick={handleFirstPageButtonClick}
          disabled={disabled || page === 0}
          aria-label={getItemAriaLabel('first', page)}
          title={getItemAriaLabel('first', page)}
          style={btnStyle}
        >
          <FirstPageIcon />
        </button>
      )}
      <button
        onClick={handleBackButtonClick}
        disabled={disabled || page === 0}
        aria-label={getItemAriaLabel('previous', page)}
        title={getItemAriaLabel('previous', page)}
        style={btnStyle}
      >
        <KeyboardArrowLeft />
      </button>
      <button
        onClick={handleNextButtonClick}
        disabled={disabled || (count !== -1 ? page >= lastPage : false)}
        aria-label={getItemAriaLabel('next', page)}
        title={getItemAriaLabel('next', page)}
        style={btnStyle}
      >
        <KeyboardArrowRight />
      </button>
      {showLastButton && (
        <button
          onClick={handleLastPageButtonClick}
          disabled={disabled || page >= lastPage}
          aria-label={getItemAriaLabel('last', page)}
          title={getItemAriaLabel('last', page)}
          style={btnStyle}
        >
          <LastPageIcon />
        </button>
      )}
    </div>
  );
});

export default TablePaginationActions;
