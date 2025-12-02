'use client';
import * as React from 'react';
import FocusTrap from '../Unstable_TrapFocus';
import Portal from '../Portal';

/**
 * Modal is a lower-level construct that is leveraged by the following components:
 *
 * - [Dialog](/material-ui/api/dialog/)
 * - [Drawer](/material-ui/api/drawer/)
 * - [Menu](/material-ui/api/menu/)
 * - [Popover](/material-ui/api/popover/)
 *
 * If you are creating a modal dialog, you probably want to use the [Dialog](/material-ui/api/dialog/) component
 * rather than directly using Modal.
 *
 * This component shares many concepts with [react-overlays](https://react-bootstrap.github.io/react-overlays/#modals).
 */
const Modal = React.forwardRef(function Modal(inProps, ref) {
  const props = inProps;
  const {
    children,
    className,
    container,
    onClose,
    open,
    disableEscapeKeyDown = false,
    hideBackdrop = false,
    ...other
  } = props;

  const [exited, setExited] = React.useState(!open);
  const backdropClickRef = React.useRef(false);

  // Open state change effect
  React.useEffect(() => {
    if (open) {
      setExited(false);
    } else {
      setExited(true);
    }
  }, [open]);

  // ESC Key Handler
  const handleKeyDown = React.useCallback((event) => {
    if (event.key !== 'Escape' || event.which === 229) {
      return;
    }

    if (!disableEscapeKeyDown && onClose) {
      event.stopPropagation();
      onClose(event, 'escapeKeyDown');
    }
  }, [disableEscapeKeyDown, onClose]);

  // Backdrop Mouse Handlers
  const handleBackdropMouseDown = React.useCallback((event) => {
    backdropClickRef.current = event.target === event.currentTarget;
  }, []);

  const handleBackdropClick = React.useCallback((event) => {
    if (!backdropClickRef.current) {
      return;
    }
    backdropClickRef.current = false;

    if (event.target !== event.currentTarget) {
      return;
    }

    if (onClose) {
      onClose(event, 'backdropClick');
    }
  }, [onClose]);

  if (!open && exited) {
    return null;
  }

  const childProps = {};
  if (children.props.tabIndex === undefined) {
    childProps.tabIndex = '-1';
  }

  return (
    <Portal container={container}>
      <div
        ref={ref}
        role="presentation"
        onKeyDown={handleKeyDown}
        className={className}
        {...other}
        style={{
          position: 'fixed',
          zIndex: 1300,
          right: 0,
          bottom: 0,
          top: 0,
          left: 0,
          visibility: !open && exited ? 'hidden' : undefined,
          ...other.style,
        }}
      >
        {!hideBackdrop && (
           <div
             aria-hidden="true"
             onMouseDown={handleBackdropMouseDown}
             onClick={handleBackdropClick}
             style={{
               zIndex: -1,
               position: 'fixed',
               right: 0,
               bottom: 0,
               top: 0,
               left: 0,
               backgroundColor: 'rgba(0, 0, 0, 0.5)',
               WebkitTapHighlightColor: 'transparent',
             }}
           />
        )}

        <FocusTrap
          open={open}
        >
          {React.cloneElement(children, childProps)}
        </FocusTrap>
      </div>
    </Portal>
  );
});

export default Modal;
