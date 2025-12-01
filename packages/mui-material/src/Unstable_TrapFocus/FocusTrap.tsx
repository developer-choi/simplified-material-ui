'use client';
/* eslint-disable consistent-return, jsx-a11y/no-noninteractive-tabindex */
import * as React from 'react';
import PropTypes from 'prop-types';
import useForkRef from '@mui/utils/useForkRef';
import getReactElementRef from '@mui/utils/getReactElementRef';
import elementAcceptingRef from '@mui/utils/elementAcceptingRef';
import { FocusTrapProps } from './FocusTrap.types';

// Inspired by https://github.com/focus-trap/tabbable
const candidatesSelector = [
  'input',
  'select',
  'textarea',
  'a[href]',
  'button',
  '[tabindex]',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
].join(',');

interface OrderedTabNode {
  documentOrder: number;
  tabIndex: number;
  node: HTMLElement;
}

function getTabIndex(node: HTMLElement): number {
  // 브라우저 호환성 체크 로직 제거
  // 단순하게 tabIndex 반환
  return node.tabIndex;
}

function isNodeMatchingSelectorFocusable(node: HTMLInputElement): boolean {
  if (
    node.disabled ||
    (node.tagName === 'INPUT' && node.type === 'hidden')
  ) {
    return false;
  }
  return true;
}

function defaultGetTabbable(root: HTMLElement): HTMLElement[] {
  const regularTabNodes: HTMLElement[] = [];
  const orderedTabNodes: OrderedTabNode[] = [];

  Array.from(root.querySelectorAll(candidatesSelector)).forEach((node, i) => {
    const nodeTabIndex = getTabIndex(node as HTMLElement);

    if (nodeTabIndex === -1 || !isNodeMatchingSelectorFocusable(node as HTMLInputElement)) {
      return;
    }

    if (nodeTabIndex === 0) {
      regularTabNodes.push(node as HTMLElement);
    } else {
      orderedTabNodes.push({
        documentOrder: i,
        tabIndex: nodeTabIndex,
        node: node as HTMLElement,
      });
    }
  });

  return orderedTabNodes
    .sort((a, b) =>
      a.tabIndex === b.tabIndex ? a.documentOrder - b.documentOrder : a.tabIndex - b.tabIndex,
    )
    .map((a) => a.node)
    .concat(regularTabNodes);
}

function defaultIsEnabled(): boolean {
  return true;
}

/**
 * @ignore - internal component.
 */
function FocusTrap(props: FocusTrapProps): React.JSX.Element {
  const {
    children,
    disableEnforceFocus = false,
    disableRestoreFocus = false,
    isEnabled = defaultIsEnabled,
    open,
  } = props;
  const ignoreNextEnforceFocus = React.useRef(false);
  const sentinelStart = React.useRef<HTMLDivElement>(null);
  const sentinelEnd = React.useRef<HTMLDivElement>(null);
  const nodeToRestore = React.useRef<EventTarget>(null);

  const rootRef = React.useRef<HTMLElement>(null);
  const handleRef = useForkRef(getReactElementRef(children), rootRef);
  const lastKeydown = React.useRef<KeyboardEvent>(null);

  React.useEffect(() => {
    // 1. 방어 코드: 모달이 닫혀있거나 요소가 없으면 실행하지 않음
    if (!open || !rootRef.current) {
      return;
    }

    // 2. Initial Focus (초기 포커스 진입)
    // MUI 유틸리티 대신 표준 Web API인 document.activeElement 사용
    const activeElement = document.activeElement;

    // 현재 포커스가 모달 밖에 있다면, 모달 컨테이너(Root)로 강제 이동
    if (!rootRef.current.contains(activeElement)) {
      // 포커스를 받기 위해 tabIndex가 없다면 -1로 설정
      if (!rootRef.current.hasAttribute('tabIndex')) {
        rootRef.current.setAttribute('tabIndex', '-1');
      }

      rootRef.current.focus();
    }

    // 3. Cleanup & Restore (포커스 복원)
    return () => {
      if (!disableRestoreFocus && nodeToRestore.current) {
        // 포커스 트랩의 감시망을 잠시 끄고(flag), 원래 버튼으로 포커스 복귀
        ignoreNextEnforceFocus.current = true;

        // IE11 호환성 체크 로직 제거 (현대 브라우저는 HTMLElement에 focus가 무조건 있음)
        nodeToRestore.current.focus();

        // 참조 해제
        nodeToRestore.current = null;
      }
    };
  }, [open, disableRestoreFocus]);

  React.useEffect(() => {
    // We might render an empty child.
    if (!open || !rootRef.current) {
      return;
    }

    const activeElement = document.activeElement;

    const loopFocus = (nativeEvent: KeyboardEvent) => {
      lastKeydown.current = nativeEvent;

      if (disableEnforceFocus || !isEnabled() || nativeEvent.key !== 'Tab') {
        return;
      }

      // Make sure the next tab starts from the right place.
      // activeElement refers to the origin.
      if (activeElement === rootRef.current && nativeEvent.shiftKey) {
        // We need to ignore the next contain as
        // it will try to move the focus back to the rootRef element.
        ignoreNextEnforceFocus.current = true;
        if (sentinelEnd.current) {
          sentinelEnd.current.focus();
        }
      }
    };

    const contain = () => {
      const rootElement = rootRef.current;

      // Cleanup functions are executed lazily in React 17.
      // Contain can be called between the component being unmounted and its cleanup function being run.
      if (rootElement === null) {
        return;
      }

      const activeEl = document.activeElement;

      if (!document.hasFocus() || !isEnabled() || ignoreNextEnforceFocus.current) {
        ignoreNextEnforceFocus.current = false;
        return;
      }

      // The focus is already inside
      if (rootElement.contains(activeEl)) {
        return;
      }

      // The disableEnforceFocus is set and the focus is outside of the focus trap (and sentinel nodes)
      if (
        disableEnforceFocus &&
        activeEl !== sentinelStart.current &&
        activeEl !== sentinelEnd.current
      ) {
        return;
      }

      let tabbable: ReadonlyArray<HTMLElement> = [];
      if (activeEl === sentinelStart.current || activeEl === sentinelEnd.current) {
        tabbable = defaultGetTabbable(rootRef.current!);
      }

      // one of the sentinel nodes was focused, so move the focus
      // to the first/last tabbable element inside the focus trap
      if (tabbable.length > 0) {
        const isShiftTab = Boolean(
          lastKeydown.current?.shiftKey && lastKeydown.current?.key === 'Tab',
        );

        const focusNext = tabbable[0];
        const focusPrevious = tabbable[tabbable.length - 1];

        if (typeof focusNext !== 'string' && typeof focusPrevious !== 'string') {
          if (isShiftTab) {
            focusPrevious.focus();
          } else {
            focusNext.focus();
          }
        }
        // no tabbable elements in the trap focus or the focus was outside of the focus trap
      } else {
        rootElement.focus();
      }
    };

    document.addEventListener('focusin', contain);
    document.addEventListener('keydown', loopFocus, true);

    return () => {
      document.removeEventListener('focusin', contain);
      document.removeEventListener('keydown', loopFocus, true);
    };
  }, [disableEnforceFocus, disableRestoreFocus, isEnabled, open]);

  const onFocus = (event: React.FocusEvent<Element, Element>) => {
    if (nodeToRestore.current === null) {
      nodeToRestore.current = event.relatedTarget;
    }

    const childrenPropsHandler = children.props.onFocus;
    if (childrenPropsHandler) {
      childrenPropsHandler(event);
    }
  };

  const handleFocusSentinel = (event: React.FocusEvent<HTMLDivElement>) => {
    if (nodeToRestore.current === null) {
      nodeToRestore.current = event.relatedTarget;
    }
    // activated 설정 로직 제거
  };

  return (
    <React.Fragment>
      <div
        tabIndex={open ? 0 : -1}
        onFocus={handleFocusSentinel}
        ref={sentinelStart}
        data-testid="sentinelStart"
      />
      {React.cloneElement(children, { ref: handleRef, onFocus })}
      <div
        tabIndex={open ? 0 : -1}
        onFocus={handleFocusSentinel}
        ref={sentinelEnd}
        data-testid="sentinelEnd"
      />
    </React.Fragment>
  );
}

FocusTrap.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * A single child content element.
   */
  children: elementAcceptingRef,
  /**
   * If `true`, the focus trap will not prevent focus from leaving the focus trap while open.
   *
   * Generally this should never be set to `true` as it makes the focus trap less
   * accessible to assistive technologies, like screen readers.
   * @default false
   */
  disableEnforceFocus: PropTypes.bool,
  /**
   * If `true`, the focus trap will not restore focus to previously focused element once
   * focus trap is hidden or unmounted.
   * @default false
   */
  disableRestoreFocus: PropTypes.bool,
  /**
   * This prop extends the `open` prop.
   * It allows to toggle the open state without having to wait for a rerender when changing the `open` prop.
   * This prop should be memoized.
   * It can be used to support multiple focus trap mounted at the same time.
   * @default function defaultIsEnabled(): boolean {
   *   return true;
   * }
   */
  isEnabled: PropTypes.func,
  /**
   * If `true`, focus is locked.
   */
  open: PropTypes.bool.isRequired,
} as any;

export default FocusTrap;
