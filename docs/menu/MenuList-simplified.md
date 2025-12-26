# MenuList 컴포넌트

> 학습 목적으로 단순화된 MenuList - WAI-ARIA 메뉴 패턴의 핵심 개념에 집중

---

## 무슨 기능을 하는가?

수정된 MenuList는 **Menu의 항목 목록을 관리하고 키보드 내비게이션을 제공하는** 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **키보드 내비게이션** - ArrowUp/Down, Home/End로 항목 간 이동
2. **포커스 관리** - disabled 항목 자동 건너뛰기
3. **순환 내비게이션** - 리스트 끝에서 처음으로 돌아감
4. **autoFocus** - MenuList 컨테이너에 자동 포커스
5. **role="menu"** - WAI-ARIA 메뉴 패턴 준수

> **💡 작성 주의**: MenuList는 키보드 내비게이션만 담당합니다. MenuItem 렌더링, 클릭 처리, 선택 상태 관리는 각 MenuItem의 책임입니다.

---

## 핵심 학습 포인트

### 1. WAI-ARIA 메뉴 패턴

```javascript
<ul
  role="menu"
  tabIndex={autoFocus ? 0 : -1}
  onKeyDown={handleKeyDown}
>
  {children}
</ul>
```

**학습 가치**:
- `role="menu"`: 스크린 리더에 메뉴임을 알림
- `tabIndex={0}`: 포커스 가능 (Tab으로 접근)
- `tabIndex={-1}`: 포커스 가능하지만 Tab 순서에서 제외
- `onKeyDown`: 키보드 이벤트 핸들링
- [W3C WAI-ARIA 메뉴 패턴](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/) 표준

### 2. DOM 순회 알고리즘 (nextItem / previousItem)

```javascript
function nextItem(list, item) {
  if (list === item) {
    return list.firstChild;
  }
  if (item && item.nextElementSibling) {
    return item.nextElementSibling;
  }
  return list.firstChild;  // 순환: 끝에서 처음으로
}

function previousItem(list, item) {
  if (list === item) {
    return list.lastChild;
  }
  if (item && item.previousElementSibling) {
    return item.previousElementSibling;
  }
  return list.lastChild;  // 순환: 처음에서 끝으로
}
```

**학습 가치**:
- `nextElementSibling` / `previousElementSibling`: DOM API
- 리스트 자체가 전달되면 첫/마지막 자식 반환
- 마지막 항목에서 다음 → 첫 항목 (순환)
- 첫 항목에서 이전 → 마지막 항목 (순환)
- text node는 건너뜀 (Element만 선택)

### 3. 포커스 관리 알고리즘 (moveFocus)

```javascript
function moveFocus(list, currentFocus, traversalFunction) {
  let wrappedOnce = false;
  let nextFocus = traversalFunction(list, currentFocus);

  while (nextFocus) {
    // Prevent infinite loop.
    if (nextFocus === list.firstChild) {
      if (wrappedOnce) {
        return false;  // 한 바퀴 돌았으면 중단
      }
      wrappedOnce = true;
    }

    // Skip disabled items
    const nextFocusDisabled =
      nextFocus.disabled || nextFocus.getAttribute('aria-disabled') === 'true';

    if (!nextFocus.hasAttribute('tabindex') || nextFocusDisabled) {
      // Move to the next element.
      nextFocus = traversalFunction(list, nextFocus);
    } else {
      nextFocus.focus();
      return true;
    }
  }
  return false;
}
```

**학습 가치**:
- **무한 루프 방지**: `wrappedOnce` 플래그로 한 바퀴 감지
- **disabled 항목 건너뛰기**:
  - `disabled` 속성 확인
  - `aria-disabled="true"` 확인 (접근성)
- **tabindex 확인**: 포커스 가능한지 검증
- **traversalFunction**: nextItem 또는 previousItem 전달
- `element.focus()`: DOM API로 직접 포커스

### 4. 키보드 이벤트 핸들링

```javascript
const handleKeyDown = (event) => {
  const list = listRef.current;
  const key = event.key;
  const isModifierKeyPressed = event.ctrlKey || event.metaKey || event.altKey;

  if (isModifierKeyPressed) {
    if (onKeyDown) {
      onKeyDown(event);
    }
    return;
  }

  const currentFocus = getActiveElement(ownerDocument(list));

  if (key === 'ArrowDown') {
    event.preventDefault();
    moveFocus(list, currentFocus, nextItem);
  } else if (key === 'ArrowUp') {
    event.preventDefault();
    moveFocus(list, currentFocus, previousItem);
  } else if (key === 'Home') {
    event.preventDefault();
    moveFocus(list, null, nextItem);
  } else if (key === 'End') {
    event.preventDefault();
    moveFocus(list, null, previousItem);
  }

  if (onKeyDown) {
    onKeyDown(event);
  }
};
```

**학습 가치**:
- **event.key**: 키 식별 (ArrowDown, ArrowUp, Home, End)
- **event.preventDefault()**: 페이지 스크롤 방지
- **Modifier key 무시**: Ctrl+Down 등은 브라우저 기본 동작 유지
- **getActiveElement()**: 현재 포커스된 요소 찾기
- **Home/End**: `currentFocus=null` → moveFocus가 처음/끝부터 탐색
- **이벤트 위임**: 자식 이벤트를 부모에서 처리

### 5. useEnhancedEffect로 autoFocus

```javascript
const listRef = React.useRef(null);

useEnhancedEffect(() => {
  if (autoFocus) {
    listRef.current.focus();
  }
}, [autoFocus]);
```

**학습 가치**:
- `useEnhancedEffect`: useLayoutEffect + SSR 호환
- `listRef.current.focus()`: 컨테이너에 직접 포커스
- `[autoFocus]`: autoFocus 변경 시 재실행
- 초기 렌더링 시 MenuList 컨테이너에 포커스 → 키보드 내비게이션 즉시 가능

### 6. useForkRef 패턴

```javascript
const listRef = React.useRef(null);
const handleRef = useForkRef(listRef, ref);

return (
  <ul ref={handleRef}>
```

**학습 가치**:
- **ref 병합**: 내부 ref + 외부 ref 동시 사용
- `listRef`: MenuList 내부에서 사용 (focus(), 이벤트 핸들러)
- `ref`: 부모 컴포넌트가 전달한 ref (forwardRef)
- `useForkRef`: 두 ref를 하나로 병합

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/mui-material/src/MenuList/MenuList.js (141줄, 원본 346줄)
MenuList
  └─> ul (role="menu")
       └─> children (MenuItem들)
```

**변경 사항**:
- ❌ List styled component 제거 → ul 태그 직접 렌더링
- ❌ variant 로직 제거 → activeItemIndex 계산 없음
- ❌ 타이핑 검색 제거 → 화살표 키만 지원
- ✅ 간단한 3단계 구조 (MenuList → ul → MenuItem)

### 2. 전체 코드

```javascript
'use client';
import * as React from 'react';
import ownerDocument from '../utils/ownerDocument';
import getActiveElement from '../utils/getActiveElement';
import useForkRef from '../utils/useForkRef';
import useEnhancedEffect from '../utils/useEnhancedEffect';

function nextItem(list, item) {
  if (list === item) {
    return list.firstChild;
  }
  if (item && item.nextElementSibling) {
    return item.nextElementSibling;
  }
  return list.firstChild;
}

function previousItem(list, item) {
  if (list === item) {
    return list.lastChild;
  }
  if (item && item.previousElementSibling) {
    return item.previousElementSibling;
  }
  return list.lastChild;
}

function moveFocus(list, currentFocus, traversalFunction) {
  let wrappedOnce = false;
  let nextFocus = traversalFunction(list, currentFocus);

  while (nextFocus) {
    // Prevent infinite loop.
    if (nextFocus === list.firstChild) {
      if (wrappedOnce) {
        return false;
      }
      wrappedOnce = true;
    }

    // Skip disabled items
    const nextFocusDisabled =
      nextFocus.disabled || nextFocus.getAttribute('aria-disabled') === 'true';

    if (!nextFocus.hasAttribute('tabindex') || nextFocusDisabled) {
      // Move to the next element.
      nextFocus = traversalFunction(list, nextFocus);
    } else {
      nextFocus.focus();
      return true;
    }
  }
  return false;
}

const MenuList = React.forwardRef(function MenuList(props, ref) {
  const {
    autoFocus = false,
    children,
    className,
    onKeyDown,
    ...other
  } = props;
  const listRef = React.useRef(null);

  useEnhancedEffect(() => {
    if (autoFocus) {
      listRef.current.focus();
    }
  }, [autoFocus]);

  const handleKeyDown = (event) => {
    const list = listRef.current;
    const key = event.key;
    const isModifierKeyPressed = event.ctrlKey || event.metaKey || event.altKey;

    if (isModifierKeyPressed) {
      if (onKeyDown) {
        onKeyDown(event);
      }
      return;
    }

    const currentFocus = getActiveElement(ownerDocument(list));

    if (key === 'ArrowDown') {
      event.preventDefault();
      moveFocus(list, currentFocus, nextItem);
    } else if (key === 'ArrowUp') {
      event.preventDefault();
      moveFocus(list, currentFocus, previousItem);
    } else if (key === 'Home') {
      event.preventDefault();
      moveFocus(list, null, nextItem);
    } else if (key === 'End') {
      event.preventDefault();
      moveFocus(list, null, previousItem);
    }

    if (onKeyDown) {
      onKeyDown(event);
    }
  };

  const handleRef = useForkRef(listRef, ref);

  return (
    <ul
      role="menu"
      ref={handleRef}
      className={className}
      onKeyDown={handleKeyDown}
      tabIndex={autoFocus ? 0 : -1}
      style={{
        listStyle: 'none',
        margin: 0,
        padding: '8px 0',
        outline: 0,
      }}
      {...other}
    >
      {children}
    </ul>
  );
});

export default MenuList;
```

> **💡 원본과의 차이**:
> - ❌ `variant` 제거 → activeItemIndex 계산 없음
> - ❌ 타이핑 검색 제거 → textCriteriaRef, textCriteriaMatches
> - ❌ `adjustStyleForScrollbar` 제거 → useImperativeHandle
> - ❌ `disableListWrap` 제거 → 항상 순환
> - ❌ `disabledItemsFocusable` 제거 → 항상 disabled 건너뜀
> - ❌ List styled component 제거 → ul 직접 사용
> - ❌ PropTypes 제거

### 3. Props (4개만 남음)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `autoFocus` | boolean | `false` | MenuList 컨테이너에 포커스 (즉시 키보드 내비게이션 가능) |
| `children` | ReactNode | - | MenuItem들 |
| `onKeyDown` | func | - | 추가 키보드 핸들러 (Menu의 Tab 처리 등) |
| `...other` | - | - | ul에 전달되는 모든 props (className, style 등) |

**제거된 props** (5개):
- ❌ `variant` - 항상 컨테이너에 autoFocus
- ❌ `autoFocusItem` - variant와 함께 제거
- ❌ `disableListWrap` - 항상 순환 허용
- ❌ `disabledItemsFocusable` - 항상 disabled 건너뜀
- ❌ `actions` (private) - adjustStyleForScrollbar 제거

---

## 커밋 히스토리로 보는 단순화 과정

MenuList는 **6개의 커밋**을 통해 단순화되었습니다.

### 1단계: variant 로직 제거
- `f2ed5410` - [MenuList 단순화 1/6] variant 로직 제거

**왜 불필요한가**:
- **학습 목적**: MenuList의 핵심은 "키보드 내비게이션"이지 "복잡한 초기 포커스 전략"이 아님
- **복잡도**: activeItemIndex 계산 (46줄), React.Children.forEach 순회, React.cloneElement로 props 주입 (16줄)
- **일관성**: Menu-simplified.md에서 이미 variant를 제거했음

**삭제 대상**:
- `variant` prop (기본값: 'selectedMenu')
- `autoFocusItem` prop
- `activeItemIndex` 계산 로직 (221-266줄)
- `React.Children.forEach` 순회
- `React.Children.map` + cloneElement (268-283줄)
- `isFragment` import 및 검증

### 2단계: 타이핑 검색 제거
- `770d871e` - [MenuList 단순화 2/6] 타이핑 검색 제거

**왜 불필요한가**:
- **학습 목적**: MenuList의 핵심은 "ArrowUp/Down 내비게이션"이지 "타이핑 검색"이 아님
- **복잡도**: textCriteriaRef ref (5줄), textCriteriaMatches 함수 (18줄), 타이핑 검색 로직 (28줄), 500ms 타이머 관리
- **현실**: 대부분 메뉴는 항목이 적어서 화살표 키로 충분

**삭제 대상**:
- `textCriteriaRef` ref (114-119줄)
- `textCriteriaMatches` 함수 (33-50줄)
- 타이핑 검색 로직 (180-207줄의 `key.length === 1` 블록)
- moveFocus의 `textCriteria` 파라미터 및 처리

### 3단계: adjustStyleForScrollbar 제거
- `cb83025a` - [MenuList 단순화 3/6] adjustStyleForScrollbar 제거

**왜 불필요한가**:
- **학습 목적**: MenuList의 핵심은 "키보드 내비게이션"이지 "스크롤바 스타일 조정"이 아님
- **복잡도**: React.useImperativeHandle (18줄), getScrollbarSize, RTL 지원, padding/width 조정
- **일관성**: Menu-simplified.md에서 이미 actions ref 호출을 제거했음

**삭제 대상**:
- `actions` prop (private)
- `React.useImperativeHandle` 전체 (127-144줄)
- `getScrollbarSize` import
- `ownerWindow` import

### 4단계: 옵션 props 제거
- `86bfde88` - [MenuList 단순화 4/6] 옵션 props 제거

**왜 불필요한가**:
- **disableListWrap**: 대부분 순환이 자연스러운 동작, 기본값(false)으로 충분
- **disabledItemsFocusable**: disabled 항목은 건너뛰는 게 일반적, 기본값(false)으로 충분

**삭제 대상**:
- `disableListWrap` prop
- `disabledItemsFocusable` prop
- nextItem/previousItem에서 disableListWrap 파라미터 제거
- moveFocus에서 disabledItemsFocusable 파라미터 제거
- → 항상 순환, 항상 disabled 건너뜀

### 5단계: List styled component 제거
- `68074cb1` - [MenuList 단순화 5/6] List styled component 제거

**왜 불필요한가**:
- **학습 목적**: MenuList의 핵심은 "키보드 내비게이션"이지 "styled component"가 아님
- **복잡도**: List는 Theme 시스템과 통합 (useDefaultProps, useUtilityClasses)
- **가독성**: 인라인 스타일이 JSX 내에서 바로 보여 이해하기 쉬움

**삭제 대상**:
- `List` import
- `<List>` 대신 `<ul>` 사용
- 인라인 스타일로 기본 스타일 적용:
  - `listStyle: 'none'`, `margin: 0`, `padding: '8px 0'`, `outline: 0`

### 6단계: PropTypes 제거
- `fcfd6e29` - [MenuList 단순화 6/6] PropTypes 제거

**왜 불필요한가**:
- **학습 목적**: PropTypes는 타입 검증 도구이지 컴포넌트 로직이 아님
- **복잡도**: PropTypes 정의 약 45줄, JSDoc 주석
- **프로덕션**: TypeScript가 빌드 타임에 검증하므로 런타임 검증 불필요

**삭제 대상**:
- `PropTypes` import
- `MenuList.propTypes` 전체 (약 45줄)
- JSDoc 주석

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 346줄 | 141줄 (59% 감소) |
| **Props 개수** | 9개 | 4개 (5개 제거) |
| **Import 개수** | 11개 | 6개 (5개 제거) |
| **variant 로직** | ✅ activeItemIndex 계산 | ❌ 제거 |
| **타이핑 검색** | ✅ Type-ahead | ❌ 제거 |
| **adjustStyleForScrollbar** | ✅ useImperativeHandle | ❌ 제거 |
| **disableListWrap** | ✅ 순환/비순환 선택 | ❌ 항상 순환 |
| **disabledItemsFocusable** | ✅ disabled 포커스 선택 | ❌ 항상 건너뜀 |
| **List 사용** | ✅ styled component | ❌ ul 직접 사용 |
| **PropTypes** | ✅ 45줄 | ❌ 제거 |
| **핵심 기능** | ✅ 키보드 내비게이션 | ✅ 유지 (ArrowUp/Down, Home/End) |

---

## 학습 후 다음 단계

MenuList를 이해했다면:

1. **MenuItem** - 개별 항목 컴포넌트, selected/disabled 상태 관리
2. **Menu** - Popover + MenuList 조합 패턴 학습
3. **접근성 심화** - ARIA 속성, 스크린 리더 테스트
4. **실전 응용** - ContextMenu, Nested Menu 등 직접 만들어보기

**예시: 간단한 메뉴 사용**
```javascript
<MenuList autoFocus>
  <MenuItem>Profile</MenuItem>
  <MenuItem>My account</MenuItem>
  <MenuItem disabled>Logout</MenuItem>
</MenuList>
```

**예시: 커스텀 키보드 핸들러**
```javascript
<MenuList
  autoFocus
  onKeyDown={(event) => {
    if (event.key === 'Escape') {
      // 메뉴 닫기 로직
      handleClose();
    }
  }}
>
  {menuItems}
</MenuList>
```

**예시: ref로 접근**
```javascript
const menuListRef = React.useRef(null);

// 프로그래밍 방식으로 포커스
React.useEffect(() => {
  if (isOpen) {
    menuListRef.current?.focus();
  }
}, [isOpen]);

<MenuList ref={menuListRef}>
  {children}
</MenuList>
```
