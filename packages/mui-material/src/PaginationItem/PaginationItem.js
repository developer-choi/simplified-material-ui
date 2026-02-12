'use client';
import * as React from 'react';
import clsx from 'clsx';
import composeClasses from '@mui/utils/composeClasses';
import { useRtl } from '@mui/system/RtlProvider';
import paginationItemClasses, { getPaginationItemUtilityClass } from './paginationItemClasses';
import ButtonBase from '../../../form/ButtonBase';
import capitalize from '../utils/capitalize';
import FirstPageIcon from '../internal/svg-icons/FirstPage';
import LastPageIcon from '../internal/svg-icons/LastPage';
import NavigateBeforeIcon from '../internal/svg-icons/NavigateBefore';
import NavigateNextIcon from '../internal/svg-icons/NavigateNext';
import { styled } from '../zero-styled';
import memoTheme from '../utils/memoTheme';
import { useDefaultProps } from '../DefaultPropsProvider';

const overridesResolver = (props, styles) => {
  const { ownerState } = props;

  return [
    styles.root,
    styles[`size${capitalize(ownerState.size)}`],
    ownerState.type === 'page' && styles.page,
    (ownerState.type === 'start-ellipsis' || ownerState.type === 'end-ellipsis') && styles.ellipsis,
    (ownerState.type === 'previous' || ownerState.type === 'next') && styles.previousNext,
    (ownerState.type === 'first' || ownerState.type === 'last') && styles.firstLast,
  ];
};

const useUtilityClasses = (ownerState) => {
  const { classes, disabled, selected, size, type } = ownerState;

  const slots = {
    root: [
      'root',
      `size${capitalize(size)}`,
      disabled && 'disabled',
      selected && 'selected',
      {
        page: 'page',
        first: 'firstLast',
        last: 'firstLast',
        'start-ellipsis': 'ellipsis',
        'end-ellipsis': 'ellipsis',
        previous: 'previousNext',
        next: 'previousNext',
      }[type],
    ],
    icon: ['icon'],
  };

  return composeClasses(slots, getPaginationItemUtilityClass, classes);
};

const PaginationItemEllipsis = styled('div', {
  name: 'MuiPaginationItem',
  slot: 'Root',
  overridesResolver,
})(
  memoTheme(({ theme }) => ({
    ...theme.typography.body2,
    borderRadius: 32 / 2,
    textAlign: 'center',
    boxSizing: 'border-box',
    minWidth: 32,
    padding: '0 6px',
    margin: '0 3px',
    color: (theme.vars || theme).palette.text.primary,
    height: 'auto',
    [`&.${paginationItemClasses.disabled}`]: {
      opacity: (theme.vars || theme).palette.action.disabledOpacity,
    },
  })),
);

const PaginationItemPage = styled(ButtonBase, {
  name: 'MuiPaginationItem',
  slot: 'Root',
  overridesResolver,
})(
  memoTheme(({ theme }) => ({
    ...theme.typography.body2,
    borderRadius: 32 / 2,
    textAlign: 'center',
    boxSizing: 'border-box',
    minWidth: 32,
    height: 32,
    padding: '0 6px',
    margin: '0 3px',
    color: (theme.vars || theme).palette.text.primary,
    [`&.${paginationItemClasses.focusVisible}`]: {
      backgroundColor: (theme.vars || theme).palette.action.focus,
    },
    [`&.${paginationItemClasses.disabled}`]: {
      opacity: (theme.vars || theme).palette.action.disabledOpacity,
    },
    transition: theme.transitions.create(['color', 'background-color'], {
      duration: theme.transitions.duration.short,
    }),
    '&:hover': {
      backgroundColor: (theme.vars || theme).palette.action.hover,
      // Reset on touch devices, it doesn't add specificity
      '@media (hover: none)': {
        backgroundColor: 'transparent',
      },
    },
    [`&.${paginationItemClasses.selected}`]: {
      backgroundColor: (theme.vars || theme).palette.action.selected,
      '&:hover': {
        backgroundColor: theme.alpha(
          (theme.vars || theme).palette.action.selected,
          `${(theme.vars || theme).palette.action.selectedOpacity} + ${(theme.vars || theme).palette.action.hoverOpacity}`,
        ),
        // Reset on touch devices, it doesn't add specificity
        '@media (hover: none)': {
          backgroundColor: (theme.vars || theme).palette.action.selected,
        },
      },
      [`&.${paginationItemClasses.focusVisible}`]: {
        backgroundColor: theme.alpha(
          (theme.vars || theme).palette.action.selected,
          `${(theme.vars || theme).palette.action.selectedOpacity} + ${(theme.vars || theme).palette.action.focusOpacity}`,
        ),
      },
      [`&.${paginationItemClasses.disabled}`]: {
        opacity: 1,
        color: (theme.vars || theme).palette.action.disabled,
        backgroundColor: (theme.vars || theme).palette.action.selected,
      },
    },
    variants: [],
  })),
);

const PaginationItemPageIcon = styled('div', {
  name: 'MuiPaginationItem',
  slot: 'Icon',
})(
  memoTheme(({ theme }) => ({
    fontSize: theme.typography.pxToRem(20),
    margin: '0 -8px',
  })),
);

const PaginationItem = React.forwardRef(function PaginationItem(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuiPaginationItem' });
  const {
    className,
    component,
    disabled = false,
    page,
    selected = false,
    type = 'page',
    ...other
  } = props;

  const size = 'medium';
  const shape = 'circular';
  const color = 'standard';
  const variant = 'text';

  const ownerState = {
    ...props,
    color,
    disabled,
    selected,
    shape,
    size,
    type,
    variant,
  };

  const isRtl = useRtl();
  const classes = useUtilityClasses(ownerState);

  const rtlAwareType = isRtl
    ? {
        previous: 'next',
        next: 'previous',
        first: 'last',
        last: 'first',
      }[type]
    : type;

  const IconComponent = {
    previous: NavigateBeforeIcon,
    next: NavigateNextIcon,
    first: FirstPageIcon,
    last: LastPageIcon,
  }[rtlAwareType];

  return type === 'start-ellipsis' || type === 'end-ellipsis' ? (
    <PaginationItemEllipsis
      ref={ref}
      ownerState={ownerState}
      className={clsx(classes.root, className)}
    >
      …
    </PaginationItemEllipsis>
  ) : (
    <PaginationItemPage
      ref={ref}
      ownerState={ownerState}
      component={component}
      disabled={disabled}
      className={clsx(classes.root, className)}
      {...other}
    >
      {type === 'page' && page}
      {IconComponent ? (
        <PaginationItemPageIcon className={classes.icon} as={IconComponent} />
      ) : null}
    </PaginationItemPage>
  );
});


export default PaginationItem;
