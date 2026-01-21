'use client';
import * as React from 'react';
import clsx from 'clsx';
import isFocusVisible from '@mui/utils/isFocusVisible';
import useForkRef from '@mui/material/utils/useForkRef';
import useEventCallback from '@mui/material/utils/useEventCallback';
import useLazyRipple from '@mui/material/useLazyRipple';
import TouchRipple from './TouchRipple';

// 버튼 기본 스타일 (브라우저 기본 스타일 리셋)
const buttonBaseStyles = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  boxSizing: 'border-box',
  WebkitTapHighlightColor: 'transparent',
  backgroundColor: 'transparent',
  outline: 0,
  border: 0,
  margin: 0,
  borderRadius: 0,
  padding: 0,
  cursor: 'pointer',
  userSelect: 'none',
  verticalAlign: 'middle',
  MozAppearance: 'none',
  WebkitAppearance: 'none',
  textDecoration: 'none',
  color: 'inherit',
};

/**
 * `ButtonBase` contains as few styles as possible.
 * It aims to be a simple building block for creating a button.
 * It contains a load of style reset and some focus/ripple logic.
 */
const ButtonBase = React.forwardRef(function ButtonBase(inProps, ref) {
  const {
    children,
    className,
    component = 'button',
    disabled = false,
    focusVisibleClassName,
    LinkComponent = 'a',
    onBlur,
    onClick,
    onContextMenu,
    onDragLeave,
    onFocus,
    onFocusVisible,
    onKeyDown,
    onKeyUp,
    onMouseDown,
    onMouseLeave,
    onMouseUp,
    onTouchEnd,
    onTouchMove,
    onTouchStart,
    tabIndex = 0,
    type,
    ...other
  } = inProps;

  const buttonRef = React.useRef(null);

  const ripple = useLazyRipple();

  const [focusVisible, setFocusVisible] = React.useState(false);
  if (disabled && focusVisible) {
    setFocusVisible(false);
  }

  const enableTouchRipple = ripple.shouldMount && !disabled;

  const handleMouseDown = useRippleHandler(ripple, 'start', onMouseDown);
  const handleContextMenu = useRippleHandler(ripple, 'stop', onContextMenu);
  const handleDragLeave = useRippleHandler(ripple, 'stop', onDragLeave);
  const handleMouseUp = useRippleHandler(ripple, 'stop', onMouseUp);
  const handleMouseLeave = useRippleHandler(ripple, 'stop', onMouseLeave);
  const handleTouchStart = useRippleHandler(ripple, 'start', onTouchStart);
  const handleTouchEnd = useRippleHandler(ripple, 'stop', onTouchEnd);
  const handleTouchMove = useRippleHandler(ripple, 'stop', onTouchMove);

  const handleBlur = useEventCallback((event) => {
    ripple.stop(event);
    if (!isFocusVisible(event.target)) {
      setFocusVisible(false);
    }
    if (onBlur) {
      onBlur(event);
    }
  });

  const handleFocus = useEventCallback((event) => {
    // Fix for https://github.com/facebook/react/issues/7769
    if (!buttonRef.current) {
      buttonRef.current = event.currentTarget;
    }

    if (isFocusVisible(event.target)) {
      setFocusVisible(true);

      if (onFocusVisible) {
        onFocusVisible(event);
      }
    }

    if (onFocus) {
      onFocus(event);
    }
  });

  const isNonNativeButton = () => {
    const button = buttonRef.current;
    return component && component !== 'button' && !(button.tagName === 'A' && button.href);
  };

  const handleKeyDown = useEventCallback((event) => {
    if (event.target === event.currentTarget && isNonNativeButton() && event.key === ' ') {
      event.preventDefault();
    }

    if (onKeyDown) {
      onKeyDown(event);
    }

    // Keyboard accessibility for non interactive elements
    if (
      event.target === event.currentTarget &&
      isNonNativeButton() &&
      event.key === 'Enter' &&
      !disabled
    ) {
      event.preventDefault();
      if (onClick) {
        onClick(event);
      }
    }
  });

  const handleKeyUp = useEventCallback((event) => {
    if (onKeyUp) {
      onKeyUp(event);
    }

    // Keyboard accessibility for non interactive elements
    if (
      onClick &&
      event.target === event.currentTarget &&
      isNonNativeButton() &&
      event.key === ' ' &&
      !event.defaultPrevented
    ) {
      onClick(event);
    }
  });

  let ComponentProp = component;

  if (ComponentProp === 'button' && (other.href || other.to)) {
    ComponentProp = LinkComponent;
  }

  const buttonProps = {};
  if (ComponentProp === 'button') {
    const hasFormAttributes = !!other.formAction;
    // ButtonBase was defaulting to type="button" when no type prop was provided, which prevented form submission and broke formAction functionality.
    // The fix checks for form-related attributes and skips the default type to allow the browser's natural submit behavior (type="submit").
    buttonProps.type = type === undefined && !hasFormAttributes ? 'button' : type;
    buttonProps.disabled = disabled;
  } else {
    if (!other.href && !other.to) {
      buttonProps.role = 'button';
    }
    if (disabled) {
      buttonProps['aria-disabled'] = disabled;
    }
  }

  const handleRef = useForkRef(ref, buttonRef);

  const rootStyle = {
    ...buttonBaseStyles,
    ...(disabled && {
      pointerEvents: 'none',
      cursor: 'default',
    }),
  };

  return (
    <ComponentProp
      className={clsx(className, focusVisible && focusVisibleClassName)}
      style={rootStyle}
      onBlur={handleBlur}
      onClick={onClick}
      onContextMenu={handleContextMenu}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onDragLeave={handleDragLeave}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
      ref={handleRef}
      tabIndex={disabled ? -1 : tabIndex}
      {...buttonProps}
      {...other}
    >
      {children}
      {enableTouchRipple ? <TouchRipple ref={ripple.ref} /> : null}
    </ComponentProp>
  );
});

function useRippleHandler(ripple, rippleAction, eventCallback) {
  return useEventCallback((event) => {
    if (eventCallback) {
      eventCallback(event);
    }
    ripple[rippleAction](event);
    return true;
  });
}

export default ButtonBase;
