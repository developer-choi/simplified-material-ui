import * as React from 'react';
import { Instance, Options, OptionsGeneric } from '@popperjs/core';

export type PopperPlacementType = Options['placement'];

export interface PopperChildrenProps {
  placement: PopperPlacementType;
}

export interface PopperOwnProps {
  /**
   * An HTML element or a function that returns one.
   * It's used to set the position of the popper.
   */
  anchorEl?: null | HTMLElement | (() => HTMLElement);
  /**
   * Popper render function or node.
   */
  children?: React.ReactNode | ((props: PopperChildrenProps) => React.ReactNode);
  /**
   * Popper.js is based on a "plugin-like" architecture,
   * most of its features are fully encapsulated "modifiers".
   *
   * A modifier is a function that is called each time Popper.js needs to
   * compute the position of the popper.
   * For this reason, modifiers should be very performant to avoid bottlenecks.
   * To learn how to create a modifier, [read the modifiers documentation](https://popper.js.org/docs/v2/modifiers/).
   */
  modifiers?: Options['modifiers'];
  /**
   * If `true`, the component is shown.
   */
  open: boolean;
  /**
   * Popper placement.
   * @default 'bottom'
   */
  placement?: PopperPlacementType;
  /**
   * Options provided to the [`Popper.js`](https://popper.js.org/docs/v2/constructors/#options) instance.
   * @default {}
   */
  popperOptions?: Partial<OptionsGeneric<any>>;
  /**
   * A ref that points to the used popper instance.
   */
  popperRef?: React.Ref<Instance>;
}

export type PopperProps = PopperOwnProps;

export type PopperTooltipProps = PopperOwnProps;
