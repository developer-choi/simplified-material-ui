'use client';
import * as React from 'react';
import ownerDocument from '@mui/utils/ownerDocument';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import useForkRef from '@mui/utils/useForkRef';
import HTMLElementType from '@mui/utils/HTMLElementType';
import refType from '@mui/utils/refType';
import { createPopper, Instance, Modifier, Placement, State } from '@popperjs/core';
import PropTypes from 'prop-types';
import Portal from '../../../modal/Portal';
import {
  PopperPlacementType,
  PopperTooltipProps,
  PopperChildrenProps,
  PopperProps,
} from './BasePopper.types';

function resolveAnchorEl(
  anchorEl: HTMLElement | (() => HTMLElement) | null | undefined,
): HTMLElement | null | undefined {
  return typeof anchorEl === 'function' ? anchorEl() : anchorEl;
}

const defaultPopperOptions = {};

const PopperTooltip = React.forwardRef<HTMLDivElement, PopperTooltipProps>(function PopperTooltip(
  props: PopperTooltipProps,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const {
    anchorEl,
    children,
    modifiers,
    open,
    placement: initialPlacement,
    popperOptions,
    popperRef: popperRefProp,
    ...other
  } = props;

  const tooltipRef = React.useRef<HTMLElement>(null);
  const ownRef = useForkRef(tooltipRef, forwardedRef);

  const popperRef = React.useRef<Instance>(null);
  const handlePopperRef = useForkRef(popperRef, popperRefProp);
  const handlePopperRefRef = React.useRef(handlePopperRef);
  useEnhancedEffect(() => {
    handlePopperRefRef.current = handlePopperRef;
  }, [handlePopperRef]);
  React.useImperativeHandle(popperRefProp, () => popperRef.current!, []);

  /**
   * placement initialized from prop but can change during lifetime if modifiers.flip.
   * modifiers.flip is essentially a flip for controlled/uncontrolled behavior
   */
  const [placement, setPlacement] = React.useState<Placement | undefined>(initialPlacement);
  const [resolvedAnchorElement, setResolvedAnchorElement] = React.useState<
    HTMLElement | null | undefined
  >(resolveAnchorEl(anchorEl));

  React.useEffect(() => {
    if (popperRef.current) {
      popperRef.current.forceUpdate();
    }
  });

  React.useEffect(() => {
    if (anchorEl) {
      setResolvedAnchorElement(resolveAnchorEl(anchorEl));
    }
  }, [anchorEl]);

  useEnhancedEffect(() => {
    if (!resolvedAnchorElement || !open) {
      return undefined;
    }

    const handlePopperUpdate = (data: State) => {
      setPlacement(data.placement);
    };

    let popperModifiers: Partial<Modifier<any, any>>[] = [
      {
        name: 'preventOverflow',
      },
      {
        name: 'flip',
      },
      {
        name: 'onUpdate',
        enabled: true,
        phase: 'afterWrite',
        fn: ({ state }) => {
          handlePopperUpdate(state);
        },
      },
    ];

    if (modifiers != null) {
      popperModifiers = popperModifiers.concat(modifiers);
    }
    if (popperOptions && popperOptions.modifiers != null) {
      popperModifiers = popperModifiers.concat(popperOptions.modifiers);
    }

    const popper = createPopper(resolvedAnchorElement, tooltipRef.current!, {
      placement: initialPlacement,
      ...popperOptions,
      modifiers: popperModifiers,
    });

    handlePopperRefRef.current!(popper);

    return () => {
      popper.destroy();
      handlePopperRefRef.current!(null);
    };
  }, [resolvedAnchorElement, modifiers, open, popperOptions, initialPlacement]);

  const childProps: PopperChildrenProps = { placement: placement! };

  return (
    <div role="tooltip" ref={ownRef} {...other}>
      {typeof children === 'function' ? children(childProps) : children}
    </div>
  );
});

/**
 * @ignore - internal component.
 */
const Popper = React.forwardRef<HTMLDivElement, PopperProps>(function Popper(
  props: PopperProps,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const {
    anchorEl,
    children,
    modifiers,
    open,
    placement = 'bottom',
    popperOptions = defaultPopperOptions,
    popperRef,
    style,
    ...other
  } = props;

  if (!open) {
    return null;
  }

  return (
    <Portal>
      <PopperTooltip
        anchorEl={anchorEl}
        modifiers={modifiers}
        ref={forwardedRef}
        open={open}
        placement={placement}
        popperOptions={popperOptions}
        popperRef={popperRef}
        {...other}
        style={{
          // Prevents scroll issue, waiting for Popper.js to add this style once initiated.
          position: 'fixed',
          // Fix Popper.js display issue
          top: 0,
          left: 0,
          ...style,
        }}
      >
        {children}
      </PopperTooltip>
    </Portal>
  );
});

Popper.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * An HTML element or a function that returns one.
   * It's used to set the position of the popper.
   */
  anchorEl: PropTypes.oneOfType([HTMLElementType, PropTypes.func]),
  /**
   * Popper render function or node.
   */
  children: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
    PropTypes.node,
    PropTypes.func,
  ]),
  /**
   * Popper.js is based on a "plugin-like" architecture,
   * most of its features are fully encapsulated "modifiers".
   *
   * A modifier is a function that is called each time Popper.js needs to
   * compute the position of the popper.
   * For this reason, modifiers should be very performant to avoid bottlenecks.
   * To learn how to create a modifier, [read the modifiers documentation](https://popper.js.org/docs/v2/modifiers/).
   */
  modifiers: PropTypes.arrayOf(
    PropTypes.shape({
      data: PropTypes.object,
      effect: PropTypes.func,
      enabled: PropTypes.bool,
      fn: PropTypes.func,
      name: PropTypes.any,
      options: PropTypes.object,
      phase: PropTypes.oneOf([
        'afterMain',
        'afterRead',
        'afterWrite',
        'beforeMain',
        'beforeRead',
        'beforeWrite',
        'main',
        'read',
        'write',
      ]),
      requires: PropTypes.arrayOf(PropTypes.string),
      requiresIfExists: PropTypes.arrayOf(PropTypes.string),
    }),
  ),
  /**
   * If `true`, the component is shown.
   */
  open: PropTypes.bool.isRequired,
  /**
   * Popper placement.
   * @default 'bottom'
   */
  placement: PropTypes.oneOf([
    'auto-end',
    'auto-start',
    'auto',
    'bottom-end',
    'bottom-start',
    'bottom',
    'left-end',
    'left-start',
    'left',
    'right-end',
    'right-start',
    'right',
    'top-end',
    'top-start',
    'top',
  ]),
  /**
   * Options provided to the [`Popper.js`](https://popper.js.org/docs/v2/constructors/#options) instance.
   * @default {}
   */
  popperOptions: PropTypes.shape({
    modifiers: PropTypes.array,
    onFirstUpdate: PropTypes.func,
    placement: PropTypes.oneOf([
      'auto-end',
      'auto-start',
      'auto',
      'bottom-end',
      'bottom-start',
      'bottom',
      'left-end',
      'left-start',
      'left',
      'right-end',
      'right-start',
      'right',
      'top-end',
      'top-start',
      'top',
    ]),
    strategy: PropTypes.oneOf(['absolute', 'fixed']),
  }),
  /**
   * A ref that points to the used popper instance.
   */
  popperRef: refType,
} as any;

export default Popper;
