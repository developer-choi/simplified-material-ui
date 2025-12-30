'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import CancelIcon from '../internal/svg-icons/Cancel';
import unsupportedProp from '../utils/unsupportedProp';
import ButtonBase from '../ButtonBase';
import { styled } from '../zero-styled';
import chipClasses from './chipClasses';

const ChipRoot = styled('div', {
  name: 'MuiChip',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;
    const { color, iconColor, clickable, onDelete, size, variant } = ownerState;

    return [
      { [`& .${chipClasses.avatar}`]: styles.avatar },
      { [`& .${chipClasses.avatar}`]: styles[`avatar${capitalize(size)}`] },
      { [`& .${chipClasses.avatar}`]: styles[`avatarColor${capitalize(color)}`] },
      { [`& .${chipClasses.icon}`]: styles.icon },
      { [`& .${chipClasses.icon}`]: styles[`icon${capitalize(size)}`] },
      { [`& .${chipClasses.icon}`]: styles[`iconColor${capitalize(iconColor)}`] },
      { [`& .${chipClasses.deleteIcon}`]: styles.deleteIcon },
      { [`& .${chipClasses.deleteIcon}`]: styles[`deleteIcon${capitalize(size)}`] },
      { [`& .${chipClasses.deleteIcon}`]: styles[`deleteIconColor${capitalize(color)}`] },
      {
        [`& .${chipClasses.deleteIcon}`]:
          styles[`deleteIcon${capitalize(variant)}Color${capitalize(color)}`],
      },
      styles.root,
      styles[`size${capitalize(size)}`],
      styles[`color${capitalize(color)}`],
      clickable && styles.clickable,
      clickable && color !== 'default' && styles[`clickableColor${capitalize(color)}`],
      onDelete && styles.deletable,
      onDelete && color !== 'default' && styles[`deletableColor${capitalize(color)}`],
      styles[variant],
      styles[`${variant}${capitalize(color)}`],
    ];
  },
)({
  maxWidth: '100%',
  fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
  fontSize: '0.8125rem',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 32,
  lineHeight: 1.5,
  backgroundColor: '#1976d2',
  color: '#fff',
  borderRadius: 16,
  whiteSpace: 'nowrap',
  cursor: 'unset',
  outline: 0,
  textDecoration: 'none',
  border: 0,
  padding: 0,
  verticalAlign: 'middle',
  boxSizing: 'border-box',
  [`& .${chipClasses.avatar}`]: {
    marginLeft: 5,
    marginRight: -6,
    width: 24,
    height: 24,
    color: '#fff',
    fontSize: '0.75rem',
  },
  [`& .${chipClasses.avatarColorPrimary}`]: {
    color: '#fff',
    backgroundColor: '#1565c0',
  },
  [`& .${chipClasses.icon}`]: {
    marginLeft: 5,
    marginRight: -6,
    color: 'inherit',
  },
  [`& .${chipClasses.deleteIcon}`]: {
    WebkitTapHighlightColor: 'transparent',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 22,
    cursor: 'pointer',
    margin: '0 5px 0 -6px',
    '&:hover, &:active': {
      color: '#fff',
    },
  },
  variants: [
    {
      props: { onDelete: true },
      style: {
        [`&.${chipClasses.focusVisible}`]: {
          background: '#1565c0',
        },
      },
    },
    {
      props: { clickable: true },
      style: {
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: '#1565c0',
        },
        [`&.${chipClasses.focusVisible}`]: {
          backgroundColor: '#1565c0',
        },
        '&:active': {
          boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
        },
      },
    },
  ],
});

const ChipLabel = styled('span', {
  name: 'MuiChip',
  slot: 'Label',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;
    const { size } = ownerState;

    return [styles.label, styles[`label${capitalize(size)}`]];
  },
})({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  paddingLeft: 12,
  paddingRight: 12,
  whiteSpace: 'nowrap',
});

function isDeleteKeyboardEvent(keyboardEvent) {
  return keyboardEvent.key === 'Backspace' || keyboardEvent.key === 'Delete';
}

/**
 * Chips represent complex entities in small blocks, such as a contact.
 */
const Chip = React.forwardRef(function Chip(props, ref) {
  const {
    avatar: avatarProp,
    className,
    icon: iconProp,
    label,
    onClick,
    onDelete,
    ...other
  } = props;

  const handleDeleteIconClick = (event) => {
    // Stop the event from bubbling up to the `Chip`
    event.stopPropagation();
    if (onDelete) {
      onDelete(event);
    }
  };

  const handleKeyDown = (event) => {
    // Ignore events from children of `Chip`.
    if (event.currentTarget === event.target && isDeleteKeyboardEvent(event)) {
      // Will be handled in keyUp, otherwise some browsers
      // might init surfaces
      event.preventDefault();
    }
  };

  const handleKeyUp = (event) => {
    // Ignore events from children of `Chip`.
    if (event.currentTarget === event.target) {
      if (onDelete && isDeleteKeyboardEvent(event)) {
        onDelete(event);
      }
    }
  };

  const clickable = !!onClick;

  const component = clickable || onDelete ? ButtonBase : 'div';

  const ownerState = {
    ...props,
    component,
    size: 'medium',
    color: 'primary',
    iconColor: 'primary',
    onDelete: !!onDelete,
    clickable,
    variant: 'filled',
  };

  const moreProps =
    component === ButtonBase
      ? {
          component: 'div',
          ...(onDelete && { disableRipple: true }),
        }
      : {};

  let deleteIcon = null;
  if (onDelete) {
    deleteIcon = <CancelIcon onClick={handleDeleteIconClick} />;
  }

  let avatar = null;
  if (avatarProp && React.isValidElement(avatarProp)) {
    avatar = React.cloneElement(avatarProp, {
      className: avatarProp.props.className,
    });
  }

  let icon = null;
  if (iconProp && React.isValidElement(iconProp)) {
    icon = React.cloneElement(iconProp, {
      className: iconProp.props.className,
    });
  }

  if (process.env.NODE_ENV !== 'production') {
    if (avatar && icon) {
      console.error(
        'MUI: The Chip component can not handle the avatar ' +
          'and the icon prop at the same time. Pick one.',
      );
    }
  }

  return (
    <ChipRoot
      as={component}
      ref={ref}
      className={className}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      ownerState={ownerState}
      {...moreProps}
      {...other}
    >
      {avatar || icon}
      <ChipLabel ownerState={ownerState}>
        {label}
      </ChipLabel>
      {deleteIcon}
    </ChipRoot>
  );
});

Chip.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The Avatar element to display.
   */
  avatar: PropTypes.element,
  /**
   * This prop isn't supported.
   * Use the `component` prop if you need to change the children structure.
   */
  children: unsupportedProp,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * Icon element.
   */
  icon: PropTypes.element,
  /**
   * The content of the component.
   */
  label: PropTypes.node,
  /**
   * @ignore
   */
  onClick: PropTypes.func,
  /**
   * Callback fired when the delete icon is clicked.
   * If set, the delete icon will be shown.
   */
  onDelete: PropTypes.func,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
};

export default Chip;
