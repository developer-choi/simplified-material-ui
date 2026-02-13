'use client';
import * as React from 'react';
import paginationItemClasses from './paginationItemClasses';
import ButtonBase from '../../form/ButtonBase';
import FirstPageIcon from '@mui/material/internal/svg-icons/FirstPage';
import LastPageIcon from '@mui/material/internal/svg-icons/LastPage';
import NavigateBeforeIcon from '@mui/material/internal/svg-icons/NavigateBefore';
import NavigateNextIcon from '@mui/material/internal/svg-icons/NavigateNext';
import { styled } from '@mui/material/zero-styled';

const PaginationItemEllipsis = styled('div', {
  name: 'MuiPaginationItem',
  slot: 'Root',
})({
  fontSize: '0.875rem',
  fontWeight: 400,
  lineHeight: 1.43,
  borderRadius: 32 / 2,
  textAlign: 'center',
  boxSizing: 'border-box',
  minWidth: 32,
  padding: '0 6px',
  margin: '0 3px',
  color: 'rgba(0, 0, 0, 0.87)',
  height: 'auto',
  [`&.${paginationItemClasses.disabled}`]: {
    opacity: 0.38,
  },
});

const PaginationItemPage = styled(ButtonBase, {
  name: 'MuiPaginationItem',
  slot: 'Root',
})({
  fontSize: '0.875rem',
  fontWeight: 400,
  lineHeight: 1.43,
  borderRadius: 32 / 2,
  textAlign: 'center',
  boxSizing: 'border-box',
  minWidth: 32,
  height: 32,
  padding: '0 6px',
  margin: '0 3px',
  color: 'rgba(0, 0, 0, 0.87)',
  [`&.${paginationItemClasses.focusVisible}`]: {
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  [`&.${paginationItemClasses.disabled}`]: {
    opacity: 0.38,
  },
  transition: 'color 250ms, background-color 250ms',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    // Reset on touch devices, it doesn't add specificity
    '@media (hover: none)': {
      backgroundColor: 'transparent',
    },
  },
  [`&.${paginationItemClasses.selected}`]: {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.12)',
      // Reset on touch devices, it doesn't add specificity
      '@media (hover: none)': {
        backgroundColor: 'rgba(0, 0, 0, 0.08)',
      },
    },
    [`&.${paginationItemClasses.focusVisible}`]: {
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    [`&.${paginationItemClasses.disabled}`]: {
      opacity: 1,
      color: 'rgba(0, 0, 0, 0.26)',
      backgroundColor: 'rgba(0, 0, 0, 0.08)',
    },
  },
});

const PaginationItemPageIcon = styled('div', {
  name: 'MuiPaginationItem',
  slot: 'Icon',
})({
  fontSize: '1.25rem',
  margin: '0 -8px',
});

const PaginationItem = React.forwardRef(function PaginationItem(inProps, ref) {
  const {
    className,
    component,
    disabled = false,
    page,
    selected = false,
    type = 'page',
    ...other
  } = inProps;

  const size = 'medium';
  const shape = 'circular';
  const color = 'standard';
  const variant = 'text';

  const ownerState = {
    ...inProps,
    color,
    disabled,
    selected,
    shape,
    size,
    type,
    variant,
  };

  const IconComponent = {
    previous: NavigateBeforeIcon,
    next: NavigateNextIcon,
    first: FirstPageIcon,
    last: LastPageIcon,
  }[type];

  return type === 'start-ellipsis' || type === 'end-ellipsis' ? (
    <PaginationItemEllipsis
      ref={ref}
      ownerState={ownerState}
      className={className}
    >
      …
    </PaginationItemEllipsis>
  ) : (
    <PaginationItemPage
      ref={ref}
      ownerState={ownerState}
      component={component}
      disabled={disabled}
      className={className}
      {...other}
    >
      {type === 'page' && page}
      {IconComponent ? (
        <PaginationItemPageIcon as={IconComponent} />
      ) : null}
    </PaginationItemPage>
  );
});


export default PaginationItem;
