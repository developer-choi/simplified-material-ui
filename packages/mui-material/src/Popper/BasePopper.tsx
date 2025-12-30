'use client';
import * as React from 'react';
import ownerDocument from '@mui/utils/ownerDocument';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import useForkRef from '@mui/utils/useForkRef';
import { createPopper, Instance, Modifier, Placement, State } from '@popperjs/core';
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

export default Popper;
