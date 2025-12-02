'use client';
import * as React from 'react';
import useId from '@mui/utils/useId';
import Modal from '../Modal';
import DialogContext from './DialogContext';

const DialogContainer = React.forwardRef(function DialogContainer(props, ref) {
  const { children, style, ...other } = props;
  return (
    <div
      ref={ref}
      role="presentation"
      {...other}
      style={{
        height: '100%',
        outline: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        ...style,
      }}
    >
      {children}
    </div>
  );
});

const DialogPaper = React.forwardRef(function DialogPaper(props, ref) {
  const { children, style, ...other } = props;
  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      {...other}
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
        ...style,
      }}
    >
      {children}
    </div>
  );
});

/**
 * Dialogs are overlaid modal paper based components with a backdrop.
 */
const Dialog = React.forwardRef(function Dialog(inProps, ref) {
  const {
    'aria-describedby': ariaDescribedby,
    'aria-labelledby': ariaLabelledbyProp,
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
      <DialogContainer>
        <DialogPaper
          aria-describedby={ariaDescribedby}
          aria-labelledby={ariaLabelledby}
        >
          <DialogContext.Provider value={dialogContextValue}>{children}</DialogContext.Provider>
        </DialogPaper>
      </DialogContainer>
    </Modal>
  );
});

export default Dialog;
