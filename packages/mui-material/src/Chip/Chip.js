'use client';
import * as React from 'react';
import CancelIcon from '../internal/svg-icons/Cancel';
import ButtonBase from '../ButtonBase';

function isDeleteKeyboardEvent(keyboardEvent) {
  return keyboardEvent.key === 'Backspace' || keyboardEvent.key === 'Delete';
}

const Chip = React.forwardRef(function Chip(props, ref) {
  const {
    avatar: avatarProp,
    className,
    icon: iconProp,
    label,
    onClick,
    onDelete,
    style,
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
  const Component = clickable || onDelete ? ButtonBase : 'div';

  let deleteIcon = null;
  if (onDelete) {
    const deleteIconStyle = {
      WebkitTapHighlightColor: 'transparent',
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: 22,
      cursor: 'pointer',
      margin: '0 5px 0 -6px',
    };
    deleteIcon = <CancelIcon onClick={handleDeleteIconClick} style={deleteIconStyle} />;
  }

  let avatar = null;
  if (avatarProp && React.isValidElement(avatarProp)) {
    const avatarStyle = {
      marginLeft: 5,
      marginRight: -6,
      width: 24,
      height: 24,
      color: '#fff',
      fontSize: '0.75rem',
    };
    avatar = React.cloneElement(avatarProp, {
      style: { ...avatarStyle, ...avatarProp.props.style },
    });
  }

  let icon = null;
  if (iconProp && React.isValidElement(iconProp)) {
    const iconStyle = {
      marginLeft: 5,
      marginRight: -6,
      color: 'inherit',
    };
    icon = React.cloneElement(iconProp, {
      style: { ...iconStyle, ...iconProp.props.style },
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

  const rootStyle = {
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
    cursor: clickable ? 'pointer' : 'unset',
    outline: 0,
    textDecoration: 'none',
    border: 0,
    padding: 0,
    verticalAlign: 'middle',
    boxSizing: 'border-box',
    userSelect: clickable ? 'none' : 'auto',
    WebkitTapHighlightColor: clickable ? 'transparent' : 'auto',
    ...style,
  };

  const labelStyle = {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingLeft: 12,
    paddingRight: 12,
    whiteSpace: 'nowrap',
  };

  const componentProps = {
    ref,
    className,
    style: rootStyle,
    onClick,
    onKeyDown: handleKeyDown,
    onKeyUp: handleKeyUp,
    ...other,
  };

  if (Component === ButtonBase) {
    componentProps.component = 'div';
    if (onDelete) {
      componentProps.disableRipple = true;
    }
  }

  return (
    <Component {...componentProps}>
      {avatar || icon}
      <span style={labelStyle}>{label}</span>
      {deleteIcon}
    </Component>
  );
});

export default Chip;
