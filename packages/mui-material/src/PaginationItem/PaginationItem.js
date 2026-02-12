'use client';
import * as React from 'react';
import clsx from 'clsx';
import composeClasses from '@mui/utils/composeClasses';
import { useRtl } from '@mui/system/RtlProvider';
import paginationItemClasses, { getPaginationItemUtilityClass } from './paginationItemClasses';
import ButtonBase from '../../../form/ButtonBase';
import capitalize from '../utils/capitalize';
import createSimplePaletteValueFilter from '../utils/createSimplePaletteValueFilter';
import FirstPageIcon from '../internal/svg-icons/FirstPage';
import LastPageIcon from '../internal/svg-icons/LastPage';
import NavigateBeforeIcon from '../internal/svg-icons/NavigateBefore';
import NavigateNextIcon from '../internal/svg-icons/NavigateNext';
import useSlot from '../utils/useSlot';
import { styled } from '../zero-styled';
import memoTheme from '../utils/memoTheme';
import { useDefaultProps } from '../DefaultPropsProvider';

const overridesResolver = (props, styles) => {
  const { ownerState } = props;

  return [
    styles.root,
    styles[ownerState.variant],
    styles[`size${capitalize(ownerState.size)}`],
    ownerState.variant === 'text' && styles[`text${capitalize(ownerState.color)}`],
    ownerState.variant === 'outlined' && styles[`outlined${capitalize(ownerState.color)}`],
    ownerState.shape === 'rounded' && styles.rounded,
    ownerState.type === 'page' && styles.page,
    (ownerState.type === 'start-ellipsis' || ownerState.type === 'end-ellipsis') && styles.ellipsis,
    (ownerState.type === 'previous' || ownerState.type === 'next') && styles.previousNext,
    (ownerState.type === 'first' || ownerState.type === 'last') && styles.firstLast,
  ];
};

const useUtilityClasses = (ownerState) => {
  const { classes, color, disabled, selected, size, shape, type, variant } = ownerState;

  const slots = {
    root: [
      'root',
      `size${capitalize(size)}`,
      variant,
      shape,
      color !== 'standard' && `color${capitalize(color)}`,
      color !== 'standard' && `${variant}${capitalize(color)}`,
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
    variants: [
      {
        props: { size: 'small' },
        style: {
          minWidth: 26,
          borderRadius: 26 / 2,
          margin: '0 1px',
          padding: '0 4px',
        },
      },
      {
        props: { size: 'large' },
        style: {
          minWidth: 40,
          borderRadius: 40 / 2,
          padding: '0 10px',
          fontSize: theme.typography.pxToRem(15),
        },
      },
    ],
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
    variants: [
      {
        props: { size: 'small' },
        style: {
          minWidth: 26,
          height: 26,
          borderRadius: 26 / 2,
          margin: '0 1px',
          padding: '0 4px',
        },
      },
      {
        props: { size: 'large' },
        style: {
          minWidth: 40,
          height: 40,
          borderRadius: 40 / 2,
          padding: '0 10px',
          fontSize: theme.typography.pxToRem(15),
        },
      },
      {
        props: { shape: 'rounded' },
        style: {
          borderRadius: (theme.vars || theme).shape.borderRadius,
        },
      },
      {
        props: { variant: 'outlined' },
        style: {
          border: theme.vars
            ? `1px solid ${theme.alpha(theme.vars.palette.common.onBackground, 0.23)}`
            : `1px solid ${
                theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)'
              }`,
          [`&.${paginationItemClasses.selected}`]: {
            [`&.${paginationItemClasses.disabled}`]: {
              borderColor: (theme.vars || theme).palette.action.disabledBackground,
              color: (theme.vars || theme).palette.action.disabled,
            },
          },
        },
      },
      {
        props: { variant: 'text' },
        style: {
          [`&.${paginationItemClasses.selected}`]: {
            [`&.${paginationItemClasses.disabled}`]: {
              color: (theme.vars || theme).palette.action.disabled,
            },
          },
        },
      },
      ...Object.entries(theme.palette)
        .filter(createSimplePaletteValueFilter(['dark', 'contrastText']))
        .map(([color]) => ({
          props: { variant: 'text', color },
          style: {
            [`&.${paginationItemClasses.selected}`]: {
              color: (theme.vars || theme).palette[color].contrastText,
              backgroundColor: (theme.vars || theme).palette[color].main,
              '&:hover': {
                backgroundColor: (theme.vars || theme).palette[color].dark,
                // Reset on touch devices, it doesn't add specificity
                '@media (hover: none)': {
                  backgroundColor: (theme.vars || theme).palette[color].main,
                },
              },
              [`&.${paginationItemClasses.focusVisible}`]: {
                backgroundColor: (theme.vars || theme).palette[color].dark,
              },
              [`&.${paginationItemClasses.disabled}`]: {
                color: (theme.vars || theme).palette.action.disabled,
              },
            },
          },
        })),
      ...Object.entries(theme.palette)
        .filter(createSimplePaletteValueFilter(['light']))
        .map(([color]) => ({
          props: { variant: 'outlined', color },
          style: {
            [`&.${paginationItemClasses.selected}`]: {
              color: (theme.vars || theme).palette[color].main,
              border: `1px solid ${theme.alpha((theme.vars || theme).palette[color].main, 0.5)}`,
              backgroundColor: theme.alpha(
                (theme.vars || theme).palette[color].main,
                (theme.vars || theme).palette.action.activatedOpacity,
              ),
              '&:hover': {
                backgroundColor: theme.alpha(
                  (theme.vars || theme).palette[color].main,
                  `${(theme.vars || theme).palette.action.activatedOpacity} + ${(theme.vars || theme).palette.action.focusOpacity}`,
                ),
                // Reset on touch devices, it doesn't add specificity
                '@media (hover: none)': {
                  backgroundColor: 'transparent',
                },
              },
              [`&.${paginationItemClasses.focusVisible}`]: {
                backgroundColor: theme.alpha(
                  (theme.vars || theme).palette[color].main,
                  `${(theme.vars || theme).palette.action.activatedOpacity} + ${(theme.vars || theme).palette.action.focusOpacity}`,
                ),
              },
            },
          },
        })),
    ],
  })),
);

const PaginationItemPageIcon = styled('div', {
  name: 'MuiPaginationItem',
  slot: 'Icon',
})(
  memoTheme(({ theme }) => ({
    fontSize: theme.typography.pxToRem(20),
    margin: '0 -8px',
    variants: [
      {
        props: { size: 'small' },
        style: {
          fontSize: theme.typography.pxToRem(18),
        },
      },
      {
        props: { size: 'large' },
        style: {
          fontSize: theme.typography.pxToRem(22),
        },
      },
    ],
  })),
);

const PaginationItem = React.forwardRef(function PaginationItem(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuiPaginationItem' });
  const {
    className,
    color = 'standard',
    component,
    components = {},
    disabled = false,
    page,
    selected = false,
    shape = 'circular',
    size = 'medium',
    slots = {},
    slotProps = {},
    type = 'page',
    variant = 'text',
    ...other
  } = props;

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

  const externalForwardedProps = {
    slots: {
      previous: slots.previous ?? components.previous,
      next: slots.next ?? components.next,
      first: slots.first ?? components.first,
      last: slots.last ?? components.last,
    },
    slotProps,
  };

  const [PreviousSlot, previousSlotProps] = useSlot('previous', {
    elementType: NavigateBeforeIcon,
    externalForwardedProps,
    ownerState,
  });

  const [NextSlot, nextSlotProps] = useSlot('next', {
    elementType: NavigateNextIcon,
    externalForwardedProps,
    ownerState,
  });

  const [FirstSlot, firstSlotProps] = useSlot('first', {
    elementType: FirstPageIcon,
    externalForwardedProps,
    ownerState,
  });

  const [LastSlot, lastSlotProps] = useSlot('last', {
    elementType: LastPageIcon,
    externalForwardedProps,
    ownerState,
  });

  const rtlAwareType = isRtl
    ? {
        previous: 'next',
        next: 'previous',
        first: 'last',
        last: 'first',
      }[type]
    : type;

  const IconSlot = {
    previous: PreviousSlot,
    next: NextSlot,
    first: FirstSlot,
    last: LastSlot,
  }[rtlAwareType];

  const iconSlotProps = {
    previous: previousSlotProps,
    next: nextSlotProps,
    first: firstSlotProps,
    last: lastSlotProps,
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
      {IconSlot ? (
        <PaginationItemPageIcon {...iconSlotProps} className={classes.icon} as={IconSlot} />
      ) : null}
    </PaginationItemPage>
  );
});


export default PaginationItem;
