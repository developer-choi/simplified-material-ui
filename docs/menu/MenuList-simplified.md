# MenuList 컴포넌트

> 키보드 내비게이션을 제공하는 메뉴 목록 최소 단순화 컴포넌트

---

## 무슨 기능을 하는가?

MenuList는 **Menu의 항목 목록을 관리하고 키보드 내비게이션을 제공하는** 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **키보드 내비게이션** - ArrowUp/Down, Home/End로 항목 간 이동
2. **포커스 관리** - disabled 항목 자동 건너뛰기
3. **순환 내비게이션** - 리스트 끝에서 처음으로 돌아감
4. **role="menu"** - WAI-ARIA 메뉴 패턴 준수

> **제거된 기능**: autoFocus, 타이핑 검색, variant 로직, adjustStyleForScrollbar, disableListWrap, disabledItemsFocusable, 외부 의존 (ownerDocument, getActiveElement, useForkRef, useEnhancedEffect)

---

## 핵심 학습 포인트

### 1. WAI-ARIA 메뉴 패턴

```javascript
<ul
  role="menu"
  onKeyDown={handleKeyDown}
>
  {children}
</ul>
```

**학습 가치**:
- `role="menu"`: 스크린 리더에 메뉴임을 알림
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
  const list = event.currentTarget;
  const key = event.key;
  const isModifierKeyPressed = event.ctrlKey || event.metaKey || event.altKey;

  if (isModifierKeyPressed) {
    if (onKeyDown) {
      onKeyDown(event);
    }
    return;
  }

  const currentFocus = document.activeElement;

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
- **document.activeElement**: 현재 포커스된 요소 찾기
- **Home/End**: `currentFocus=null` → moveFocus가 처음/끝부터 탐색
- **이벤트 위임**: 자식 이벤트를 부모에서 처리
- **event.currentTarget**: 이벤트 핸들러가 attached된 요소 (ul)

### 5. React.forwardRef 패턴

```javascript
const MenuList = React.forwardRef(function MenuList(props, ref) {
  return (
    <ul ref={ref}>
```

**학습 가치**:
- `forwardRef`: 부모 컴포넌트가 자식의 DOM 요소에 직접 접근
- ref 전달을 위한 표준 React 패턴

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/menu/MenuList/MenuList.js (약 90줄, 원본 346줄)
MenuList (React.forwardRef)
  └─> ul (role="menu")
       └─> children (MenuItem들)
```

### 2. 전체 코드

```javascript
'use client';
import * as React from 'react';

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
    children,
    className,
    onKeyDown,
    ...other
  } = props;

  const handleKeyDown = (event) => {
    const list = event.currentTarget;
    const key = event.key;
    const isModifierKeyPressed = event.ctrlKey || event.metaKey || event.altKey;

    if (isModifierKeyPressed) {
      if (onKeyDown) {
        onKeyDown(event);
      }

      return;
    }

    const currentFocus = document.activeElement;

    if (key === 'ArrowDown') {
      // Prevent scroll of the page
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

  return (
    <ul
      role="menu"
      ref={ref}
      className={className}
      onKeyDown={handleKeyDown}
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

### 3. Props (3개)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | ReactNode | - | MenuItem들 |
| `className` | string | - | 외부 클래스 |
| `onKeyDown` | func | - | 추가 키보드 핸들러 |

---

## 커밋 히스토리로 보는 단순화 과정

MenuList는 **3개의 커밋**을 통해 추가 단순화되었습니다. (이미 이전에 6개의 커밋으로 346줄 → 142줄 단순화 완료)

### 1단계: autoFocus 제거
- `f9123923` - [MenuList 단순화 1/2] autoFocus 제거

**왜 불필요한가**:
- **학습 목적**: MenuList의 핵심은 "키보드 내비게이션"이지 "자동 포커스"가 아님
- **복잡도**: useEnhancedEffect는 useLayoutEffect 래퍼로, 학습 목적에 불필요한 복잡도 추가
- **대안**: 사용자가 ref로 직접 focus() 호출 가능

**삭제 대상**:
- `autoFocus` prop
- `useEnhancedEffect` import
- `useEnhancedEffect` 호출
- `tabIndex={autoFocus ? 0 : -1}` 로직

### 2단계: 외부 의존 제거
- `5dedc677` - [MenuList 단순화 2/2] 외부 의존 제거

**왜 불필요한가**:
- **학습 목적**: 외부 유틸리티는 Material-UI 내부 동작 이해와 무관
- **복잡도**: ownerDocument는 iframe 등 특수 케이스용으로 일반 학습에는 불필요
- **단순화**: getActiveElement는 document.activeElement로 완전 대체 가능
- **단순화**: useForkRef는 ref 병합용인데, 단순한 ref 하나만 사용해도 충분

**삭제 대상**:
- `import ownerDocument`
- `import getActiveElement`
- `import useForkRef`
- `ownerDocument(list)` → `document`로 대체
- `getActiveElement(...)` → `document.activeElement`로 대체
- `useForkRef(listRef, ref)` → `ref`로 대체

### 3단계: listRef 제거
- `7c9b8f26` - refactor: MenuList listRef 제거

**왜 불필요한가**:
- ref를 직접 사용하므로 listRef가 불필요
- event.currentTarget으로 대체 가능

**삭제 대상**:
- `listRef` useRef
- `listRef.current` → `event.currentTarget`으로 대체

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 346줄 | 약 90줄 (74% 감소) |
| **Props 개수** | 9개 | 3개 (-6개) |
| **외부 의존** | 11개 import | 1개 (React) |
| **autoFocus** | ✅ | ❌ |
| **variant 로직** | ✅ activeItemIndex 계산 | ❌ |
| **타이핑 검색** | ✅ Type-ahead | ❌ |
| **adjustStyleForScrollbar** | ✅ useImperativeHandle | ❌ |
| **disableListWrap** | ✅ 순환/비순환 선택 | ❌ 항상 순환 |
| **disabledItemsFocusable** | ✅ disabled 포커스 선택 | ❌ 항상 건너뜀 |
| **List 사용** | ✅ styled component | ❌ ul 직접 사용 |
| **PropTypes** | ✅ 45줄 | ❌ |
| **핵심 기능** | ✅ 키보드 내비게이션 | ✅ 유지 |

---

## 학습 후 다음 단계

MenuList를 이해했다면:

1. **Menu** - MenuList를 감싸는 드롭다운 메뉴
2. **Select** - Menu를 사용하는 셀렉트 박스

**예시: 기본 사용**
```javascript
<MenuList>
  <MenuItem>옵션 1</MenuItem>
  <MenuItem>옵션 2</MenuItem>
  <MenuItem disabled>비활성화</MenuItem>
</MenuList>
```

**예시: 커스텀 키보드 핸들러**
```javascript
<MenuList
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
