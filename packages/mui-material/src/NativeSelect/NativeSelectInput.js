'use client';
import * as React from 'react';
import clsx from 'clsx';
import composeClasses from '@mui/utils/composeClasses';
import nativeSelectClasses, { getNativeSelectUtilityClasses } from './nativeSelectClasses';
import { styled } from '../zero-styled';
import rootShouldForwardProp from '../styles/rootShouldForwardProp';
import ArrowDropDownIcon from '../internal/svg-icons/ArrowDropDown';

const useUtilityClasses = (ownerState) => {
  const { classes, disabled, multiple, open, error } = ownerState;

  const slots = {
    select: ['select', disabled && 'disabled', multiple && 'multiple', error && 'error'],
    icon: ['icon', open && 'iconOpen', disabled && 'disabled'],
  };

  return composeClasses(slots, getNativeSelectUtilityClasses, classes);
};

export const StyledSelectSelect = styled('select', {
  name: 'MuiNativeSelect',
})(({ theme }) => ({
  // Reset
  MozAppearance: 'none',
  // Reset
  WebkitAppearance: 'none',
  // When interacting quickly, the text can end up selected.
  // Native select can't be selected either.
  userSelect: 'none',
  // Reset
  borderRadius: 0,
  cursor: 'pointer',
  '&:focus': {
    // Reset Chrome style
    borderRadius: 0,
  },
  [`&.${nativeSelectClasses.disabled}`]: {
    cursor: 'default',
  },
  '&[multiple]': {
    height: 'auto',
  },
  '&:not([multiple]) option, &:not([multiple]) optgroup': {
    backgroundColor: (theme.vars || theme).palette.background.paper,
  },
  '&&&': {
    paddingRight: 24,
    minWidth: 16,
  },
}));

const NativeSelectSelect = styled(StyledSelectSelect, {
  name: 'MuiNativeSelect',
  slot: 'Select',
  shouldForwardProp: rootShouldForwardProp,
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      styles.select,
      styles[ownerState.variant],
      ownerState.error && styles.error,
      { [`&.${nativeSelectClasses.multiple}`]: styles.multiple },
    ];
  },
})({});

export const StyledSelectIcon = styled('svg', {
  name: 'MuiNativeSelect',
})(({ theme }) => ({
  // We use a position absolute over a flexbox in order to forward the pointer events
  // to the input and to support wrapping tags..
  position: 'absolute',
  right: 0,
  // Center vertically, height is 1em
  top: 'calc(50% - .5em)',
  // Don't block pointer events on the select under the icon.
  pointerEvents: 'none',
  color: (theme.vars || theme).palette.action.active,
  [`&.${nativeSelectClasses.disabled}`]: {
    color: (theme.vars || theme).palette.action.disabled,
  },
  variants: [
    {
      props: ({ ownerState }) => ownerState.open,
      style: {
        transform: 'rotate(180deg)',
      },
    },
  ],
}));

const NativeSelectIcon = styled(StyledSelectIcon, {
  name: 'MuiNativeSelect',
  slot: 'Icon',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;
    return [
      styles.icon,
      ownerState.open && styles.iconOpen,
    ];
  },
})({});

/**
 * @ignore - internal component.
 */
const NativeSelectInput = React.forwardRef(function NativeSelectInput(props, ref) {
  const {
    className,
    disabled,
    error,
    ...other
  } = props;

  const ownerState = {
    ...props,
    disabled,
    error,
  };

  const classes = useUtilityClasses(ownerState);
  return (
    <React.Fragment>
      <NativeSelectSelect
        ownerState={ownerState}
        className={clsx(classes.select, className)}
        disabled={disabled}
        ref={ref}
        {...other}
      />
      {props.multiple ? null : (
        <NativeSelectIcon as={ArrowDropDownIcon} ownerState={ownerState} className={classes.icon} />
      )}
    </React.Fragment>
  );
});

export default NativeSelectInput;
