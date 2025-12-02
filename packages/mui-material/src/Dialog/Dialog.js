'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import useId from '@mui/utils/useId';
import Modal from '../Modal';
import Paper from '../Paper';
import DialogContext from './DialogContext';
import Backdrop from '../Backdrop';
import { styled } from '../zero-styled';

const DialogBackdrop = styled(Backdrop, {
  name: 'MuiDialog',
  slot: 'Backdrop',
  overrides: (props, styles) => styles.backdrop,
})({
  // Improve scrollable dialog support.
  zIndex: -1,
});

const DialogRoot = styled(Modal, {
  name: 'MuiDialog',
  slot: 'Root',
})({
  '@media print': {
    // Use !important to override the Modal inline-style.
    position: 'absolute !important',
  },
});

const DialogContainer = styled('div', {
  name: 'MuiDialog',
  slot: 'Container',
  overridesResolver: (props, styles) => {
    return [styles.container];
  },
})({
  height: '100%',
  '@media print': {
    height: 'auto',
  },
  // We disable the focus ring for mouse, touch and keyboard users.
  outline: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const DialogPaper = styled(Paper, {
  name: 'MuiDialog',
  slot: 'Paper',
  overridesResolver: (props, styles) => {
    return [styles.paper];
  },
})({
  margin: 32,
  position: 'relative',
  overflowY: 'auto',
  '@media print': {
    overflowY: 'visible',
    boxShadow: 'none',
  },
  // 기본 스타일 (paper scroll 방식)
  display: 'flex',
  flexDirection: 'column',
  maxHeight: 'calc(100% - 64px)',
  maxWidth: '600px',  // sm size
  width: 'calc(100% - 64px)',
});

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

  const backdropClick = React.useRef();
  const handleMouseDown = (event) => {
    // We don't want to close the dialog when clicking the dialog content.
    // Make sure the event starts and ends on the same DOM element.
    backdropClick.current = event.target === event.currentTarget;
  };
  const handleBackdropClick = (event) => {
    // Ignore the events not coming from the "backdrop".
    if (!backdropClick.current) {
      return;
    }

    backdropClick.current = null;

    if (onClose) {
      onClose(event, 'backdropClick');
    }
  };

  const ariaLabelledby = useId(ariaLabelledbyProp);
  const dialogContextValue = React.useMemo(() => {
    return { titleId: ariaLabelledby };
  }, [ariaLabelledby]);

  return (
    <DialogRoot
      ref={ref}
      className={className}
      slots={{ backdrop: DialogBackdrop }}
      disableEscapeKeyDown={disableEscapeKeyDown}
      onClose={onClose}
      open={open}
      onClick={handleBackdropClick}
      {...other}
    >
      {/* Transition 제거 - 과제 스펙에서는 선택 기능 */}
      <DialogContainer
        onMouseDown={handleMouseDown}
        role="presentation"
      >
        <DialogPaper
          elevation={24}
          role="dialog"
          aria-describedby={ariaDescribedby}
          aria-labelledby={ariaLabelledby}
          aria-modal={ariaModal}
        >
          <DialogContext.Provider value={dialogContextValue}>{children}</DialogContext.Provider>
        </DialogPaper>
      </DialogContainer>
    </DialogRoot>
  );
});

Dialog.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The id(s) of the element(s) that describe the dialog.
   */
  'aria-describedby': PropTypes.string,
  /**
   * The id(s) of the element(s) that label the dialog.
   */
  'aria-labelledby': PropTypes.string,
  /**
   * Informs assistive technologies that the element is modal.
   * It's added on the element with role="dialog".
   * @default true
   */
  'aria-modal': PropTypes.oneOfType([PropTypes.oneOf(['false', 'true']), PropTypes.bool]),
  /**
   * Dialog children, usually the included sub-components.
   */
  children: PropTypes.node,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * If `true`, hitting escape will not fire the `onClose` callback.
   * @default false
   */
  disableEscapeKeyDown: PropTypes.bool,
  /**
   * Callback fired when the component requests to be closed.
   *
   * @param {object} event The event source of the callback.
   * @param {string} reason Can be: `"escapeKeyDown"`, `"backdropClick"`.
   */
  onClose: PropTypes.func,
  /**
   * If `true`, the component is shown.
   */
  open: PropTypes.bool.isRequired,
};

export default Dialog;
