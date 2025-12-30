'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import composeClasses from '@mui/utils/composeClasses';
import CancelIcon from '../internal/svg-icons/Cancel';
import unsupportedProp from '../utils/unsupportedProp';
import capitalize from '../utils/capitalize';
import ButtonBase from '../ButtonBase';
import { styled } from '../zero-styled';
import memoTheme from '../utils/memoTheme';
import { useDefaultProps } from '../DefaultPropsProvider';
import chipClasses, { getChipUtilityClass } from './chipClasses';

const useUtilityClasses = (ownerState) => {
  const { classes, disabled, size, color, iconColor, onDelete, clickable, variant } = ownerState;

  const slots = {
    root: [
      'root',
      variant,
      disabled && 'disabled',
      `size${capitalize(size)}`,
      `color${capitalize(color)}`,
      clickable && 'clickable',
      clickable && `clickableColor${capitalize(color)}`,
      onDelete && 'deletable',
      onDelete && `deletableColor${capitalize(color)}`,
      `${variant}${capitalize(color)}`,
    ],
    label: ['label', `label${capitalize(size)}`],
    avatar: ['avatar', `avatar${capitalize(size)}`, `avatarColor${capitalize(color)}`],
    icon: ['icon', `icon${capitalize(size)}`, `iconColor${capitalize(iconColor)}`],
    deleteIcon: [
      'deleteIcon',
      `deleteIcon${capitalize(size)}`,
      `deleteIconColor${capitalize(color)}`,
      `deleteIcon${capitalize(variant)}Color${capitalize(color)}`,
    ],
  };

  return composeClasses(slots, getChipUtilityClass, classes);
};

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
})(
  memoTheme(({ theme }) => {
    const textColor =
      theme.palette.mode === 'light' ? theme.palette.grey[700] : theme.palette.grey[300];
    return {
      maxWidth: '100%',
      fontFamily: theme.typography.fontFamily,
      fontSize: theme.typography.pxToRem(13),
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: 32,
      lineHeight: 1.5,
      color: (theme.vars || theme).palette.text.primary,
      backgroundColor: (theme.vars || theme).palette.action.selected,
      borderRadius: 32 / 2,
      whiteSpace: 'nowrap',
      transition: theme.transitions.create(['background-color', 'box-shadow']),
      // reset cursor explicitly in case ButtonBase is used
      cursor: 'unset',
      // We disable the focus ring for mouse, touch and keyboard users.
      outline: 0,
      textDecoration: 'none',
      border: 0, // Remove `button` border
      padding: 0, // Remove `button` padding
      verticalAlign: 'middle',
      boxSizing: 'border-box',
      [`&.${chipClasses.disabled}`]: {
        opacity: (theme.vars || theme).palette.action.disabledOpacity,
        pointerEvents: 'none',
      },
      [`& .${chipClasses.avatar}`]: {
        marginLeft: 5,
        marginRight: -6,
        width: 24,
        height: 24,
        color: theme.vars ? theme.vars.palette.Chip.defaultAvatarColor : textColor,
        fontSize: theme.typography.pxToRem(12),
      },
      [`& .${chipClasses.avatarColorPrimary}`]: {
        color: (theme.vars || theme).palette.primary.contrastText,
        backgroundColor: (theme.vars || theme).palette.primary.dark,
      },
      [`& .${chipClasses.avatarSmall}`]: {
        marginLeft: 4,
        marginRight: -4,
        width: 18,
        height: 18,
        fontSize: theme.typography.pxToRem(10),
      },
      [`& .${chipClasses.icon}`]: {
        marginLeft: 5,
        marginRight: -6,
      },
      [`& .${chipClasses.deleteIcon}`]: {
        WebkitTapHighlightColor: 'transparent',
        color: theme.alpha((theme.vars || theme).palette.text.primary, 0.26),
        fontSize: 22,
        cursor: 'pointer',
        margin: '0 5px 0 -6px',
        '&:hover': {
          color: theme.alpha((theme.vars || theme).palette.text.primary, 0.4),
        },
      },
      backgroundColor: (theme.vars || theme).palette.primary.main,
      color: (theme.vars || theme).palette.primary.contrastText,
      [`& .${chipClasses.icon}`]: {
        color: 'inherit',
      },
      [`& .${chipClasses.deleteIcon}`]: {
        color: theme.alpha((theme.vars || theme).palette.primary.contrastText, 0.7),
        '&:hover, &:active': {
          color: (theme.vars || theme).palette.primary.contrastText,
        },
      },
      variants: [
        {
          props: { onDelete: true },
          style: {
            [`&.${chipClasses.focusVisible}`]: {
              background: (theme.vars || theme).palette.primary.dark,
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
              backgroundColor: (theme.vars || theme).palette.primary.dark,
            },
            [`&.${chipClasses.focusVisible}`]: {
              backgroundColor: (theme.vars || theme).palette.primary.dark,
            },
            '&:active': {
              boxShadow: (theme.vars || theme).shadows[1],
            },
          },
        },
      ],
    };
  }),
);

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
const Chip = React.forwardRef(function Chip(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuiChip' });
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

  const classes = useUtilityClasses(ownerState);

  const moreProps =
    component === ButtonBase
      ? {
          component: 'div',
          focusVisibleClassName: classes.focusVisible,
          ...(onDelete && { disableRipple: true }),
        }
      : {};

  let deleteIcon = null;
  if (onDelete) {
    deleteIcon = <CancelIcon className={classes.deleteIcon} onClick={handleDeleteIconClick} />;
  }

  let avatar = null;
  if (avatarProp && React.isValidElement(avatarProp)) {
    avatar = React.cloneElement(avatarProp, {
      className: clsx(classes.avatar, avatarProp.props.className),
    });
  }

  let icon = null;
  if (iconProp && React.isValidElement(iconProp)) {
    icon = React.cloneElement(iconProp, {
      className: clsx(classes.icon, iconProp.props.className),
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
      className={clsx(classes.root, className)}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      ownerState={ownerState}
      {...moreProps}
      {...other}
    >
      {avatar || icon}
      <ChipLabel className={classes.label} ownerState={ownerState}>
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
