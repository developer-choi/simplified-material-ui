'use client';
/* eslint-disable consistent-return, jsx-a11y/no-noninteractive-tabindex */
import * as React from 'react';
import PropTypes from 'prop-types';
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

function defaultGetTabbable(root: HTMLElement): HTMLElement[] {
  // 🔥 [변경됨] 복잡한 정렬(sort) 로직을 제거하고, 단순히 DOM 순서대로 가져옵니다.
  return Array.from(root.querySelectorAll(candidatesSelector)) as HTMLElement[];
}

/**
 * @ignore - internal component.
 */
function FocusTrap(props: FocusTrapProps): React.JSX.Element {
  const {
    children,
    open,
  } = props;
  const ignoreNextEnforceFocus = React.useRef(false);
  const sentinelStart = React.useRef<HTMLDivElement>(null);
  const sentinelEnd = React.useRef<HTMLDivElement>(null);
  const nodeToRestore = React.useRef<EventTarget>(null);

  const rootRef = React.useRef<HTMLElement>(null);
  const lastKeydown = React.useRef<KeyboardEvent>(null);

  // useForkRef 대체 로직
  const handleRef = React.useCallback((instance: HTMLElement | null) => {
    // 1. 내부 rootRef 업데이트만 수행
    rootRef.current = instance;
    // 2. children이 가진 원래 ref를 업데이트하는 로직은 삭제
  }, []); // children 의존성 제거. 이 함수는 순수하게 rootRef.current만 업데이트함.

  React.useEffect(() => {
    // 1. 방어 코드: 모달이 닫혀있거나 요소가 없으면 실행하지 않음
    if (!open || !rootRef.current) {
      return;
    }

    // 2. Initial Focus (초기 포커스 진입)
    const activeElement = document.activeElement;

    nodeToRestore.current = activeElement;

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
      // 항상 포커스 복원 (disableRestoreFocus=false 기본값)
      if (nodeToRestore.current && (nodeToRestore.current as HTMLElement).focus) {
        // 포커스 트랩의 감시망을 잠시 끄고(flag), 원래 버튼으로 포커스 복귀
        ignoreNextEnforceFocus.current = true;

        // IE11 호환성 체크 로직 제거 (현대 브라우저는 HTMLElement에 focus가 무조건 있음)
        nodeToRestore.current.focus();

        // 참조 해제
        nodeToRestore.current = null;
      }
    };
  }, [open]);

  React.useEffect(() => {
    // We might render an empty child.
    if (!open || !rootRef.current) {
      return;
    }

    const activeElement = document.activeElement;

    const loopFocus = (nativeEvent: KeyboardEvent) => {
      lastKeydown.current = nativeEvent;

      if (nativeEvent.key !== 'Tab') {
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

      if (!document.hasFocus() || ignoreNextEnforceFocus.current) {
        ignoreNextEnforceFocus.current = false;
        return;
      }

      // The focus is already inside
      if (rootElement.contains(activeEl)) {
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
  }, [open]);

  const onFocus = (event: React.FocusEvent<Element, Element>) => {
    if (nodeToRestore.current === null) {
      nodeToRestore.current = event.relatedTarget;
    }

    const childrenPropsHandler = children.props.onFocus;
    if (childrenPropsHandler) {
      childrenPropsHandler(event);
    }
  };

  return (
    <React.Fragment>
      <div
        tabIndex={open ? 0 : -1}
        ref={sentinelStart}
        data-testid="sentinelStart"
      />
      {React.cloneElement(children, { ref: handleRef, onFocus })}
      <div
        tabIndex={open ? 0 : -1}
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
   * If `true`, focus is locked.
   */
  open: PropTypes.bool.isRequired,
} as any;

export default FocusTrap;
