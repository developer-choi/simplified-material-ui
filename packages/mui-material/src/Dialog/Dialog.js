'use client';
import * as React from 'react';
import useId from '@mui/utils/useId';
import Modal from '../Modal';
import DialogContext from './DialogContext';

/**
 * Dialogs are overlaid modal paper based components with a backdrop.
 */
const Dialog = React.forwardRef(function Dialog(inProps, ref) {
  const {
    'aria-describedby': ariaDescribedby,
    'aria-labelledby': ariaLabelledbyProp,
    'aria-modal': ariaModal = true,
    children,
    className,
    disableEscapeKeyDown = false,
    onClose,
    open,
    ...other
  } = inProps;

  const ariaLabelledby = useId(ariaLabelledbyProp);
  const dialogContextValue = React.useMemo(() => {
    return { titleId: ariaLabelledby };
  }, [ariaLabelledby]);

  return (
    <Modal
      ref={ref}
      className={className}
      disableEscapeKeyDown={disableEscapeKeyDown}
      onClose={onClose}
      open={open}
      {...other}
    >
      <div
        role="presentation"
        style={{
          height: '100%',
          outline: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          role="dialog"
          aria-describedby={ariaDescribedby}
          aria-labelledby={ariaLabelledby}
          aria-modal={ariaModal}
          style={{
            margin: 32,
            position: 'relative',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 'calc(100% - 64px)',
            maxWidth: '600px',
            width: 'calc(100% - 64px)',
            backgroundColor: '#fff',
            borderRadius: 4,
            boxShadow: '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)',
          }}
        >
          <DialogContext.Provider value={dialogContextValue}>{children}</DialogContext.Provider>
        </div>
      </div>
    </Modal>
  );
});

export default Dialog;
