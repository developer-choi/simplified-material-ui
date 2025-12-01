'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import HTMLElementType from '@mui/utils/HTMLElementType';
import elementAcceptingRef from '@mui/utils/elementAcceptingRef';
import FocusTrap from '../Unstable_TrapFocus';
import Portal from '../Portal';
import { styled } from '../zero-styled';
import memoTheme from '../utils/memoTheme';
import Backdrop from '../Backdrop';
import useModal from './useModal';

const ModalRoot = styled('div', {
  name: 'MuiModal',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [styles.root, !ownerState.open && ownerState.exited && styles.hidden];
  },
})(
  memoTheme(({ theme }) => ({
    position: 'fixed',
    zIndex: (theme.vars || theme).zIndex.modal,
    right: 0,
    bottom: 0,
    top: 0,
    left: 0,
    variants: [
      {
        props: ({ ownerState }) => !ownerState.open && ownerState.exited,
        style: {
          visibility: 'hidden',
        },
      },
    ],
  })),
);

const ModalBackdrop = styled(Backdrop, {
  name: 'MuiModal',
  slot: 'Backdrop',
})({
  zIndex: -1,
});

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
    classes,
    className,
    container,
    onClose,
    open,
    theme,
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

  const ownerState = {
    ...propsWithDefaults,
    exited,
  };

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
      {/* RootSlot 대신 ModalRoot 직접 사용 */}
      <ModalRoot
        {...rootProps}
        className={clsx(
          className,
          rootProps.className
        )}
        ownerState={ownerState}
      >
        {/* BackdropSlot 대신 ModalBackdrop 직접 사용 */}
        {!hideBackdrop && (
           <ModalBackdrop
             {...backdropProps}
             className={clsx(backdropProps.className)}
             open={open}
             ownerState={ownerState}
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
      </ModalRoot>
    </Portal>
  );
});

Modal.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * A single child content element.
   */
  children: elementAcceptingRef.isRequired,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * An HTML element or function that returns one.
   * The `container` will have the portal children appended to it.
   *
   * You can also provide a callback, which is called in a React layout effect.
   * This lets you set the container from a ref, and also makes server-side rendering possible.
   *
   * By default, it uses the body of the top-level document object,
   * so it's simply `document.body` most of the time.
   */
  container: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
    HTMLElementType,
    PropTypes.func,
  ]),
  /**
   * Callback fired when the component requests to be closed.
   * The `reason` parameter can optionally be used to control the response to `onClose`.
   *
   * @param {object} event The event source of the callback.
   * @param {string} reason Can be: `"escapeKeyDown"`, `"backdropClick"`.
   */
  onClose: PropTypes.func,
  /**
   * If `true`, the component is shown.
   */
  open: PropTypes.bool.isRequired,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
};

export default Modal;
