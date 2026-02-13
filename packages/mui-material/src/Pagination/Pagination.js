'use client';
import * as React from 'react';
import clsx from 'clsx';
import composeClasses from '@mui/utils/composeClasses';
import { getPaginationUtilityClass } from './paginationClasses';
import usePagination from '../usePagination';
import PaginationItem from '../PaginationItem';
import { styled } from '../zero-styled';
import { useDefaultProps } from '../DefaultPropsProvider';

const useUtilityClasses = (ownerState) => {
  const { classes, variant } = ownerState;

  const slots = {
    root: ['root', variant],
    ul: ['ul'],
  };

  return composeClasses(slots, getPaginationUtilityClass, classes);
};

const PaginationRoot = styled('nav', {
  name: 'MuiPagination',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [styles.root, styles[ownerState.variant]];
  },
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
  const props = useDefaultProps({ props: inProps, name: 'MuiPagination' });
  const {
    boundaryCount = 1,
    className,
    color = 'standard',
    count = 1,
    defaultPage = 1,
    disabled = false,
    getItemAriaLabel = defaultGetAriaLabel,
    hideNextButton = false,
    hidePrevButton = false,
    onChange,
    page,
    renderItem = (item) => <PaginationItem {...item} />,
    shape = 'circular',
    showFirstButton = false,
    showLastButton = false,
    siblingCount = 1,
    size = 'medium',
    variant = 'text',
    ...other
  } = props;

  const { items } = usePagination({ ...props, componentName: 'Pagination' });

  const ownerState = {
    ...props,
    boundaryCount,
    color,
    count,
    defaultPage,
    disabled,
    getItemAriaLabel,
    hideNextButton,
    hidePrevButton,
    renderItem,
    shape,
    showFirstButton,
    showLastButton,
    siblingCount,
    size,
    variant,
  };

  const classes = useUtilityClasses(ownerState);

  return (
    <PaginationRoot
      aria-label="pagination navigation"
      className={clsx(classes.root, className)}
      ownerState={ownerState}
      ref={ref}
      {...other}
    >
      <PaginationUl className={classes.ul} ownerState={ownerState}>
        {items.map((item, index) => (
          <li key={index}>
            {renderItem({
              ...item,
              color,
              'aria-label': getItemAriaLabel(item.type, item.page, item.selected),
              shape,
              size,
              variant,
            })}
          </li>
        ))}
      </PaginationUl>
    </PaginationRoot>
  );
});

export default Pagination;
