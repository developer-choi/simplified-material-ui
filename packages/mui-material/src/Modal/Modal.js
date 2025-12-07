'use client';
import * as React from 'react';
import FocusTrap from '../Unstable_TrapFocus';
import Portal from '../Portal';
import useModal from './useModal';

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
    ...other
  } = props;

  // 하드코딩된 기본값들
  const disableAutoFocus = false;
  const disableEnforceFocus = false;
  const disableEscapeKeyDown = false;
  const disablePortal = false;
  const disableRestoreFocus = false;
  const keepMounted = false;
  const disableScrollLock = false;
  const hideBackdrop = false;

  const propsWithDefaults = {
    ...props,
    disableAutoFocus,
    disableEnforceFocus,
    disableEscapeKeyDown,
    disablePortal,
    disableRestoreFocus,
    keepMounted,
    disableScrollLock,
    hideBackdrop,
  };

  const {
    getRootProps,
    getBackdropProps,
    portalRef,
    isTopModal,
    exited,
  } = useModal({
    ...propsWithDefaults,
    rootRef: ref,
  });

  const childProps = {};
  if (children.props.tabIndex === undefined) {
    childProps.tabIndex = '-1';
  }

  // useSlot 제거 -> 직관적인 컴포넌트 사용
  // getRootProps를 직접 호출하여 prop을 생성
  const rootProps = getRootProps(other);
  const backdropProps = getBackdropProps();

  if (!keepMounted && !open && exited) {
    return null;
  }

  return (
    <Portal ref={portalRef} container={container} disablePortal={disablePortal}>
      {/* RootSlot 대신 div 직접 사용 */}
      <div
        {...rootProps}
        className={className}
        style={{
          position: 'fixed',
          zIndex: 1300,
          right: 0,
          bottom: 0,
          top: 0,
          left: 0,
          visibility: !open && exited ? 'hidden' : undefined,
          ...rootProps.style,
        }}
      >
        {/* BackdropSlot 대신 div 직접 사용 */}
        {!hideBackdrop && (
           <div
             {...backdropProps}
             style={{
               zIndex: -1,
               position: 'fixed',
               right: 0,
               bottom: 0,
               top: 0,
               left: 0,
               backgroundColor: 'rgba(0, 0, 0, 0.5)',
               WebkitTapHighlightColor: 'transparent',
               ...backdropProps.style,
             }}
           />
        )}

        <FocusTrap
          disableEnforceFocus={disableEnforceFocus}
          disableAutoFocus={disableAutoFocus}
          disableRestoreFocus={disableRestoreFocus}
          isEnabled={isTopModal}
          open={open}
        >
          {React.cloneElement(children, childProps)}
        </FocusTrap>
      </div>
    </Portal>
  );
});

export default Modal;
