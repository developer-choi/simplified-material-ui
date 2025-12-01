'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import HTMLElementType from '@mui/utils/HTMLElementType';
import elementAcceptingRef from '@mui/utils/elementAcceptingRef';
import composeClasses from '@mui/utils/composeClasses';
import FocusTrap from '../Unstable_TrapFocus';
import Portal from '../Portal';
import { styled } from '../zero-styled';
import memoTheme from '../utils/memoTheme';
import { useDefaultProps } from '../DefaultPropsProvider';
import Backdrop from '../Backdrop';
import useModal from './useModal';
import { getModalUtilityClass } from './modalClasses';
import useSlot from '../utils/useSlot';

const useUtilityClasses = (ownerState) => {
  const { open, exited, classes } = ownerState;

  const slots = {
    root: ['root', !open && exited && 'hidden'],
    backdrop: ['backdrop'],
  };

  return composeClasses(slots, getModalUtilityClass, classes);
};

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
  const props = useDefaultProps({ name: 'MuiModal', props: inProps });
  const {
    children,
    classes: classesProp,
    className,
    container,
    onClose,
    open,
    // eslint-disable-next-line react/prop-types
    theme,
    ...other
  } = props;

  // 하드코딩된 기본값들
  const closeAfterTransition = false;
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
    closeAfterTransition,
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
    getTransitionProps,
    portalRef,
    isTopModal,
    exited,
    hasTransition,
  } = useModal({
    ...propsWithDefaults,
    rootRef: ref,
  });

  const ownerState = {
    ...propsWithDefaults,
    exited,
  };

  const classes = useUtilityClasses(ownerState);

  const childProps = {};
  if (children.props.tabIndex === undefined) {
    childProps.tabIndex = '-1';
  }

  // It's a Transition like component
  if (hasTransition) {
    const { onEnter, onExited } = getTransitionProps();
    childProps.onEnter = onEnter;
    childProps.onExited = onExited;
  }

  const [RootSlot, rootProps] = useSlot('root', {
    ref,
    elementType: ModalRoot,
    externalForwardedProps: {
      ...other,
    },
    getSlotProps: getRootProps,
    ownerState,
    className: clsx(
      className,
      classes?.root,
      !ownerState.open && ownerState.exited && classes?.hidden,
    ),
  });

  const [BackdropSlot, backdropProps] = useSlot('backdrop', {
    elementType: ModalBackdrop,
    shouldForwardComponentProp: true,
    getSlotProps: (otherHandlers) => {
      return getBackdropProps({
        ...otherHandlers,
        onClick: (event) => {
          if (otherHandlers?.onClick) {
            otherHandlers.onClick(event);
          }
        },
      });
    },
    className: clsx(classes?.backdrop),
    ownerState,
  });

  if (!keepMounted && !open && (!hasTransition || exited)) {
    return null;
  }

  return (
    <Portal ref={portalRef} container={container} disablePortal={disablePortal}>
      <RootSlot {...rootProps}>
        <BackdropSlot {...backdropProps} />
        <FocusTrap
          disableEnforceFocus={disableEnforceFocus}
          disableAutoFocus={disableAutoFocus}
          disableRestoreFocus={disableRestoreFocus}
          isEnabled={isTopModal}
          open={open}
        >
          {React.cloneElement(children, childProps)}
        </FocusTrap>
      </RootSlot>
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
