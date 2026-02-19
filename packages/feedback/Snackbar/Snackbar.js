'use client';
import * as React from 'react';
import ClickAwayListener from '../../../utils/ClickAwayListener';
import SnackbarContent from '../SnackbarContent';

function getPositionStyle(vertical, horizontal) {
  const style = {
    position: 'fixed',
    zIndex: 1400,
    display: 'flex',
    left: 8,
    right: 8,
    justifyContent: 'center',
    alignItems: 'center',
  };

  if (vertical === 'top') {
    style.top = 8;
  } else {
    style.bottom = 8;
  }

  if (horizontal === 'left') {
    style.justifyContent = 'flex-start';
    style.left = 24;
    style.right = 'auto';
  } else if (horizontal === 'right') {
    style.justifyContent = 'flex-end';
    style.right = 24;
    style.left = 'auto';
  } else if (horizontal === 'center') {
    style.left = '50%';
    style.right = 'auto';
    style.transform = 'translateX(-50%)';
  }

  return style;
}

const Snackbar = React.forwardRef(function Snackbar(inProps, ref) {
  const {
    action,
    anchorOrigin: { vertical, horizontal } = { vertical: 'bottom', horizontal: 'left' },
    autoHideDuration = null,
    children,
    message,
    onClose,
    open,
    ...other
  } = inProps;

  // ESC 키 닫기
  React.useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(nativeEvent) {
      if (!nativeEvent.defaultPrevented && nativeEvent.key === 'Escape') {
        onClose?.(nativeEvent, 'escapeKeyDown');
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // autoHideDuration 타이머
  React.useEffect(() => {
    if (!open || autoHideDuration == null || !onClose) return undefined;

    const timer = setTimeout(() => {
      onClose(null, 'timeout');
    }, autoHideDuration);

    return () => clearTimeout(timer);
  }, [open, autoHideDuration, onClose]);

  const handleClickAway = (event) => {
    onClose?.(event, 'clickaway');
  };

  if (!open) {
    return null;
  }

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <div
        role="presentation"
        style={getPositionStyle(vertical, horizontal)}
        ref={ref}
        {...other}
      >
        {children || <SnackbarContent message={message} action={action} />}
      </div>
    </ClickAwayListener>
  );
});

export default Snackbar;
