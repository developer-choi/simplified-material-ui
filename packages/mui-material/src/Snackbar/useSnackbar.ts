'use client';
import * as React from 'react';
import useEventCallback from '@mui/utils/useEventCallback';
import useTimeout from '@mui/utils/useTimeout';
import extractEventHandlers from '@mui/utils/extractEventHandlers';
import {
  UseSnackbarParameters,
  SnackbarCloseReason,
  UseSnackbarReturnValue,
} from './useSnackbar.types';
import { EventHandlers } from '../utils/types';

function useSnackbar(parameters: UseSnackbarParameters = {}): UseSnackbarReturnValue {
  const {
    autoHideDuration = null,
    onClose,
    open,
  } = parameters;

  const timerAutoHide = useTimeout();

  React.useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleKeyDown(nativeEvent: KeyboardEvent) {
      if (!nativeEvent.defaultPrevented) {
        if (nativeEvent.key === 'Escape') {
          onClose?.(nativeEvent, 'escapeKeyDown');
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  const handleClose = useEventCallback((event: null, reason: SnackbarCloseReason) => {
    onClose?.(event, reason);
  });

  const setAutoHideTimer = useEventCallback((autoHideDurationParam: number | null) => {
    if (!onClose || autoHideDurationParam == null) {
      return;
    }

    timerAutoHide.start(autoHideDurationParam, () => {
      handleClose(null, 'timeout');
    });
  });

  React.useEffect(() => {
    if (open) {
      setAutoHideTimer(autoHideDuration);
    }

    return timerAutoHide.clear;
  }, [open, autoHideDuration, setAutoHideTimer, timerAutoHide]);

  const handleClickAway = (event: React.SyntheticEvent<any> | Event) => {
    onClose?.(event, 'clickaway');
  };

  const getRootProps = <ExternalProps extends Record<string, unknown> = {}>(
    externalProps: ExternalProps = {} as ExternalProps,
  ) => {
    const externalEventHandlers = {
      ...extractEventHandlers(parameters),
      ...extractEventHandlers(externalProps),
    };

    return {
      role: 'presentation',
      ...externalProps,
      ...externalEventHandlers,
    };
  };

  return { getRootProps, onClickAway: handleClickAway };
}

export default useSnackbar;
