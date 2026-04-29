'use client';
import * as React from 'react';
import TabScrollButton from '../TabScrollButton';

const nextItem = (list, item) => {
  if (list === item) {
    return list.firstChild;
  }
  if (item && item.nextElementSibling) {
    return item.nextElementSibling;
  }
  return list.firstChild;
};

const previousItem = (list, item) => {
  if (list === item) {
    return list.lastChild;
  }
  if (item && item.previousElementSibling) {
    return item.previousElementSibling;
  }
  return list.lastChild;
};

const moveFocus = (list, currentFocus, traversalFunction) => {
  let wrappedOnce = false;
  let nextFocus = traversalFunction(list, currentFocus);

  while (nextFocus) {
    if (nextFocus === list.firstChild) {
      // 한 바퀴 다 돌았는데도 포커스 가능한 탭이 없으면 종료
      if (wrappedOnce) {
        return;
      }
      wrappedOnce = true;
    }
    const disabled = nextFocus.disabled || nextFocus.getAttribute('aria-disabled') === 'true';
    if (!nextFocus.hasAttribute('tabindex') || disabled) {
      nextFocus = traversalFunction(list, nextFocus);
    } else {
      nextFocus.focus();
      return;
    }
  }
};

const defaultIndicatorStyle = {};

const Tabs = React.forwardRef(function Tabs(props, ref) {
  const {
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    centered = false,
    children: childrenProp,
    onChange,
    scrollButtons = 'auto',
    selectionFollowsFocus,
    textColor = 'primary',
    value,
    variant = 'standard',
    ...other
  } = props;

  const scrollable = variant === 'scrollable';

  const [mounted, setMounted] = React.useState(false);
  const [indicatorStyle, setIndicatorStyle] = React.useState(defaultIndicatorStyle);
  const [displayStartScroll, setDisplayStartScroll] = React.useState(false);
  const [displayEndScroll, setDisplayEndScroll] = React.useState(false);
  // childList 변경 시 IntersectionObserver를 다시 붙이기 위한 토글
  const [updateScrollObserver, setUpdateScrollObserver] = React.useState(false);

  const valueToIndex = new Map();
  const tabsRef = React.useRef(null);
  const tabListRef = React.useRef(null);

  const getTabsMeta = () => {
    const tabsNode = tabsRef.current;
    let tabsMeta;
    if (tabsNode) {
      const rect = tabsNode.getBoundingClientRect();
      tabsMeta = {
        clientWidth: tabsNode.clientWidth,
        scrollLeft: tabsNode.scrollLeft,
        left: rect.left,
        right: rect.right,
      };
    }
    let tabMeta;
    if (tabsNode && value !== false) {
      const tabs = tabListRef.current.children;
      if (tabs.length > 0) {
        const tab = tabs[valueToIndex.get(value)];
        tabMeta = tab ? tab.getBoundingClientRect() : null;
      }
    }
    return { tabsMeta, tabMeta };
  };

  const updateIndicatorState = React.useCallback(() => {
    const { tabsMeta, tabMeta } = getTabsMeta();
    let left = 0;
    if (tabMeta && tabsMeta) {
      left = tabMeta.left - tabsMeta.left + tabsMeta.scrollLeft;
    }
    const newStyle = {
      left,
      width: tabMeta ? tabMeta.width : 0,
    };

    setIndicatorStyle((prev) => {
      // 1px 미만 변화는 무시 (chattering 방지)
      if (typeof prev.left !== 'number' || typeof prev.width !== 'number') {
        return newStyle;
      }
      const dLeft = Math.abs(prev.left - newStyle.left);
      const dWidth = Math.abs(prev.width - newStyle.width);
      if (dLeft >= 1 || dWidth >= 1) {
        return newStyle;
      }
      return prev;
    });
    // value/valueToIndex 변화는 매 렌더에 새 클로저로 반영됨
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const scroll = (scrollValue) => {
    tabsRef.current.scrollTo({ left: scrollValue, behavior: 'smooth' });
  };

  const moveTabsScroll = (delta) => {
    scroll(tabsRef.current.scrollLeft + delta);
  };

  // 한 화면(컨테이너 폭)만큼 스크롤하되 첫 탭이 컨테이너보다 크면 컨테이너 크기로 제한
  const getScrollSize = () => {
    const containerSize = tabsRef.current.clientWidth;
    let totalSize = 0;
    const children = Array.from(tabListRef.current.children);
    for (let i = 0; i < children.length; i += 1) {
      const tab = children[i];
      if (totalSize + tab.clientWidth > containerSize) {
        if (i === 0) {
          totalSize = containerSize;
        }
        break;
      }
      totalSize += tab.clientWidth;
    }
    return totalSize;
  };

  const handleStartScrollClick = () => moveTabsScroll(-getScrollSize());
  const handleEndScrollClick = () => moveTabsScroll(getScrollSize());

  const scrollSelectedIntoView = React.useCallback(
    (animation) => {
      const { tabsMeta, tabMeta } = getTabsMeta();
      if (!tabMeta || !tabsMeta) {
        return;
      }
      if (tabMeta.left < tabsMeta.left) {
        // 선택된 탭이 왼쪽 밖에 있음 → 보이게 스크롤
        const next = tabsMeta.scrollLeft + (tabMeta.left - tabsMeta.left);
        if (animation) {
          tabsRef.current.scrollTo({ left: next, behavior: 'smooth' });
        } else {
          tabsRef.current.scrollLeft = next;
        }
      } else if (tabMeta.right > tabsMeta.right) {
        const next = tabsMeta.scrollLeft + (tabMeta.right - tabsMeta.right);
        if (animation) {
          tabsRef.current.scrollTo({ left: next, behavior: 'smooth' });
        } else {
          tabsRef.current.scrollLeft = next;
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [value],
  );

  const updateScrollButtonState = React.useCallback(() => {
    if (scrollable && scrollButtons !== false) {
      setUpdateScrollObserver((prev) => !prev);
    }
  }, [scrollable, scrollButtons]);

  // (1) ResizeObserver — 각 Tab 크기 변화 감지
  // (2) MutationObserver — Tab 추가/제거 감지
  React.useEffect(() => {
    if (!tabsRef.current || !tabListRef.current) {
      return undefined;
    }
    const handleResize = () => {
      // Suspense fallback으로 대체된 경우 ref가 null일 수 있음
      if (tabsRef.current) {
        updateIndicatorState();
      }
    };

    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(handleResize);
      Array.from(tabListRef.current.children).forEach((child) => {
        resizeObserver.observe(child);
      });
    }

    let mutationObserver;
    if (typeof MutationObserver !== 'undefined') {
      mutationObserver = new MutationObserver((records) => {
        records.forEach((record) => {
          record.removedNodes.forEach((item) => resizeObserver?.unobserve(item));
          record.addedNodes.forEach((item) => resizeObserver?.observe(item));
        });
        handleResize();
        updateScrollButtonState();
      });
      mutationObserver.observe(tabListRef.current, { childList: true });
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mutationObserver?.disconnect();
      resizeObserver?.disconnect();
    };
  }, [updateIndicatorState, updateScrollButtonState]);

  // (3) IntersectionObserver — 첫/마지막 탭 가시성으로 스크롤 버튼 표시 여부 결정
  React.useEffect(() => {
    const tabListChildren = Array.from(tabListRef.current?.children ?? []);
    const length = tabListChildren.length;
    if (
      typeof IntersectionObserver === 'undefined' ||
      length === 0 ||
      !scrollable ||
      scrollButtons === false
    ) {
      return undefined;
    }

    const firstTab = tabListChildren[0];
    const lastTab = tabListChildren[length - 1];
    // threshold: 0.99 — 정확히 1.0이면 픽셀 반올림으로 false negative 발생
    const observerOptions = { root: tabsRef.current, threshold: 0.99 };

    const firstObserver = new IntersectionObserver(
      (entries) => setDisplayStartScroll(!entries[0].isIntersecting),
      observerOptions,
    );
    firstObserver.observe(firstTab);

    const lastObserver = new IntersectionObserver(
      (entries) => setDisplayEndScroll(!entries[0].isIntersecting),
      observerOptions,
    );
    lastObserver.observe(lastTab);

    return () => {
      firstObserver.disconnect();
      lastObserver.disconnect();
    };
  }, [scrollable, scrollButtons, updateScrollObserver, childrenProp?.length]);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    updateIndicatorState();
  });

  React.useEffect(() => {
    // 첫 렌더는 애니메이션 없이 위치만 잡고, 이후 indicatorStyle 변화는 animation으로 따라감
    scrollSelectedIntoView(defaultIndicatorStyle !== indicatorStyle);
  }, [scrollSelectedIntoView, indicatorStyle]);

  const indicator = (
    <span
      style={{
        position: 'absolute',
        height: 2,
        bottom: 0,
        backgroundColor: '#1976d2',
        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
        ...indicatorStyle,
      }}
    />
  );

  let childIndex = 0;
  const children = React.Children.map(childrenProp, (child) => {
    if (!React.isValidElement(child)) {
      return null;
    }
    const childValue = child.props.value === undefined ? childIndex : child.props.value;
    valueToIndex.set(childValue, childIndex);
    const selected = childValue === value;

    childIndex += 1;
    return React.cloneElement(child, {
      fullWidth: variant === 'fullWidth',
      // 첫 렌더(mounted=false)에는 indicator를 selected Tab 안에 인라인 → 깜빡임 없이 즉시 표시
      // mount 후엔 Scroller 직속 indicator만 사용
      indicator: selected && !mounted && indicator,
      selected,
      selectionFollowsFocus,
      onChange,
      textColor,
      value: childValue,
      // value=false(선택 없음)일 때 첫 탭이 키보드 진입점
      ...(childIndex === 1 && value === false && !child.props.tabIndex ? { tabIndex: 0 } : {}),
    });
  });

  const handleKeyDown = (event) => {
    // modifier 키 조합은 다른 단축키이므로 무시
    if (event.altKey || event.shiftKey || event.ctrlKey || event.metaKey) {
      return;
    }
    const list = tabListRef.current;
    const currentFocus = document.activeElement;
    if (currentFocus?.getAttribute('role') !== 'tab') {
      return;
    }
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        moveFocus(list, currentFocus, previousItem);
        break;
      case 'ArrowRight':
        event.preventDefault();
        moveFocus(list, currentFocus, nextItem);
        break;
      case 'Home':
        event.preventDefault();
        moveFocus(list, null, nextItem);
        break;
      case 'End':
        event.preventDefault();
        moveFocus(list, null, previousItem);
        break;
      default:
        break;
    }
  };

  const scrollButtonsActive = displayStartScroll || displayEndScroll;
  const showScrollButtons =
    scrollable && ((scrollButtons === 'auto' && scrollButtonsActive) || scrollButtons === true);

  return (
    <div
      ref={ref}
      style={{
        overflow: 'hidden',
        minHeight: 48,
        WebkitOverflowScrolling: 'touch',
        display: 'flex',
      }}
      {...other}
    >
      {showScrollButtons && (
        <TabScrollButton
          direction="left"
          onClick={handleStartScrollClick}
          disabled={!displayStartScroll}
        />
      )}
      <div
        ref={tabsRef}
        style={{
          position: 'relative',
          display: 'inline-block',
          flex: '1 1 auto',
          whiteSpace: 'nowrap',
          ...(variant === 'standard' || variant === 'fullWidth'
            ? { overflowX: 'hidden', width: '100%' }
            : { overflowX: 'auto', overflowY: 'hidden', scrollbarWidth: 'none' }),
        }}
      >
        <div
          ref={tabListRef}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          role="tablist"
          onKeyDown={handleKeyDown}
          style={{
            display: 'flex',
            ...(centered && !scrollable ? { justifyContent: 'center' } : null),
          }}
        >
          {children}
        </div>
        {mounted && indicator}
      </div>
      {showScrollButtons && (
        <TabScrollButton
          direction="right"
          onClick={handleEndScrollClick}
          disabled={!displayEndScroll}
        />
      )}
    </div>
  );
});

export default Tabs;
