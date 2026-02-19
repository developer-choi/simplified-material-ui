'use client';
import * as React from 'react';
import ClickAwayListener from '../../../utils/ClickAwayListener';
import { styled } from '../zero-styled';
import memoTheme from '../utils/memoTheme';
import SnackbarContent from '../SnackbarContent';

const SnackbarRoot = styled('div')(
  memoTheme(({ theme }) => ({
    zIndex: (theme.vars || theme).zIndex.snackbar,
    position: 'fixed',
    display: 'flex',
    left: 8,
    right: 8,
    justifyContent: 'center',
    alignItems: 'center',
    variants: [
      {
        props: ({ ownerState }) => ownerState.anchorOrigin.vertical === 'top',
        style: { top: 8, [theme.breakpoints.up('sm')]: { top: 24 } },
      },
      {
        props: ({ ownerState }) => ownerState.anchorOrigin.vertical !== 'top',
        style: { bottom: 8, [theme.breakpoints.up('sm')]: { bottom: 24 } },
      },
      {
        props: ({ ownerState }) => ownerState.anchorOrigin.horizontal === 'left',
        style: {
          justifyContent: 'flex-start',
          [theme.breakpoints.up('sm')]: {
            left: 24,
            right: 'auto',
          },
        },
      },
      {
        props: ({ ownerState }) => ownerState.anchorOrigin.horizontal === 'right',
        style: {
          justifyContent: 'flex-end',
          [theme.breakpoints.up('sm')]: {
            right: 24,
            left: 'auto',
          },
        },
      },
      {
        props: ({ ownerState }) => ownerState.anchorOrigin.horizontal === 'center',
        style: {
          [theme.breakpoints.up('sm')]: {
            left: '50%',
            right: 'auto',
            transform: 'translateX(-50%)',
          },
        },
      },
    ],
  })),
);

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

  const contentProps = { message, action };

  const rootProps = {
    role: 'presentation',
    ...other,
    ref,
  };

  if (!open) {
    return null;
  }

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <SnackbarRoot {...rootProps}>
        {children || <SnackbarContent {...contentProps} />}
      </SnackbarRoot>
    </ClickAwayListener>
  );
});

export default Snackbar;
