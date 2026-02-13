'use client';
import * as React from 'react';
import usePagination from '@mui/material/usePagination';
import PaginationItem from '../PaginationItem';
import { styled } from '@mui/material/zero-styled';

const PaginationRoot = styled('nav', {
  name: 'MuiPagination',
  slot: 'Root',
})({});

const PaginationUl = styled('ul', {
  name: 'MuiPagination',
  slot: 'Ul',
})({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  padding: 0,
  margin: 0,
  listStyle: 'none',
});

function defaultGetAriaLabel(type, page, selected) {
  if (type === 'page') {
    return `${selected ? '' : 'Go to '}page ${page}`;
  }
  return `Go to ${type} page`;
}

const Pagination = React.forwardRef(function Pagination(inProps, ref) {
  const {
    boundaryCount = 1,
    className,
    count = 1,
    defaultPage = 1,
    disabled = false,
    getItemAriaLabel = defaultGetAriaLabel,
    hideNextButton = false,
    hidePrevButton = false,
    onChange,
    page,
    showFirstButton = false,
    showLastButton = false,
    siblingCount = 1,
    ...other
  } = inProps;

  const { items } = usePagination({ ...inProps, componentName: 'Pagination' });

  const ownerState = {
    ...inProps,
    boundaryCount,
    count,
    defaultPage,
    disabled,
    getItemAriaLabel,
    hideNextButton,
    hidePrevButton,
    showFirstButton,
    showLastButton,
    siblingCount,
  };

  return (
    <PaginationRoot
      aria-label="pagination navigation"
      className={className}
      ownerState={ownerState}
      ref={ref}
      {...other}
    >
      <PaginationUl ownerState={ownerState}>
        {items.map((item, index) => (
          <li key={index}>
            <PaginationItem
              {...item}
              aria-label={getItemAriaLabel(item.type, item.page, item.selected)}
            />
          </li>
        ))}
      </PaginationUl>
    </PaginationRoot>
  );
});

export default Pagination;
