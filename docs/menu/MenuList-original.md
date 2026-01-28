# MenuList 컴포넌트

> Material-UI의 MenuList 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

MenuList는 **Menu나 Select의 항목 목록을 관리하고 키보드 내비게이션을 제공하는** 컴포넌트입니다.

### 핵심 기능
1. **키보드 내비게이션** - ArrowUp/Down으로 항목 간 이동, Home/End로 첫/마지막 이동
2. **타이핑 검색 (Type-ahead)** - 문자 키 입력 시 해당 문자로 시작하는 항목으로 이동
3. **포커스 관리** - disabled 항목 건너뛰기, 순환/비순환 선택
4. **activeItemIndex 계산** - variant에 따라 초기 포커스 항목 결정
5. **adjustStyleForScrollbar** - 스크롤바 너비만큼 padding/width 조정

> **💡 작성 주의**: 해당 컴포넌트 자체가 하는 일만 작성하세요. 하위 컴포넌트의 기능까지 포함하지 마세요.

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/MenuList/MenuList.js (346줄)
MenuList (React.forwardRef)
  └─> ul (role="menu")
       └─> children (MenuItem들)
```

### 2. 헬퍼 함수들

#### nextItem / previousItem
```javascript
function nextItem(list, item, disableListWrap) {
  if (list === item) {
    return list.firstChild;
  }
  if (item && item.nextElementSibling) {
    return item.nextElementSibling;
  }
  return disableListWrap ? null : list.firstChild;
}

function previousItem(list, item, disableListWrap) {
  if (list === item) {
    return disableListWrap ? list.firstChild : list.lastChild;
  }
  if (item && item.previousElementSibling) {
    return item.previousElementSibling;
  }
  return disableListWrap ? null : list.lastChild;
}
```

**역할**:
- DOM 트리를 순회하며 다음/이전 항목 찾기
- `disableListWrap`: true면 순환 안 함 (끝에서 null 반환)
- nextElementSibling / previousElementSibling 사용

#### textCriteriaMatches
```javascript
function textCriteriaMatches(nextFocus, textCriteria) {
  if (textCriteria === undefined) {
    return true;
  }
  let text = nextFocus.innerText;
  if (text === undefined) {
    // jsdom doesn't support innerText
    text = nextFocus.textContent;
  }
  text = text.trim().toLowerCase();
  if (text.length === 0) {
    return false;
  }
  if (textCriteria.repeating) {
    return text[0] === textCriteria.keys[0];
  }
  return text.startsWith(textCriteria.keys.join(''));
}
```

**역할**:
- 타이핑 검색을 위한 텍스트 매칭
- `repeating`: 같은 키 반복 입력 시 첫 글자만 비교
- `startsWith`: 누적된 키로 시작하는지 검사
- innerText fallback to textContent (jsdom 호환성)

#### moveFocus
```javascript
function moveFocus(
  list,
  currentFocus,
  disableListWrap,
  disabledItemsFocusable,
  traversalFunction,
  textCriteria,
) {
  let wrappedOnce = false;
  let nextFocus = traversalFunction(list, currentFocus, currentFocus ? disableListWrap : false);

  while (nextFocus) {
    // Prevent infinite loop.
    if (nextFocus === list.firstChild) {
      if (wrappedOnce) {
        return false;
      }
      wrappedOnce = true;
    }

    const nextFocusDisabled = disabledItemsFocusable
      ? false
      : nextFocus.disabled || nextFocus.getAttribute('aria-disabled') === 'true';

    if (
      !nextFocus.hasAttribute('tabindex') ||
      !textCriteriaMatches(nextFocus, textCriteria) ||
      nextFocusDisabled
    ) {
      nextFocus = traversalFunction(list, nextFocus, disableListWrap);
    } else {
      nextFocus.focus();
      return true;
    }
  }
  return false;
}
```

**역할**:
- 포커스 가능한 다음 항목 찾기 및 포커스
- `wrappedOnce`: 무한 루프 방지 (한 바퀴 돌았는지 확인)
- `traversalFunction`: nextItem 또는 previousItem
- `textCriteria`: 타이핑 검색 조건
- `disabledItemsFocusable`: disabled 항목도 포커스할지 여부
- tabindex 속성 확인 (포커스 가능한지)

### 3. 타이핑 검색 (Type-ahead)

```javascript
const textCriteriaRef = React.useRef({
  keys: [],
  repeating: true,
  previousKeyMatched: true,
  lastTime: null,
});

// handleKeyDown 내부
if (key.length === 1) {
  const criteria = textCriteriaRef.current;
  const lowerKey = key.toLowerCase();
  const currTime = performance.now();

  if (criteria.keys.length > 0) {
    // Reset after 500ms
    if (currTime - criteria.lastTime > 500) {
      criteria.keys = [];
      criteria.repeating = true;
      criteria.previousKeyMatched = true;
    } else if (criteria.repeating && lowerKey !== criteria.keys[0]) {
      criteria.repeating = false;
    }
  }

  criteria.lastTime = currTime;
  criteria.keys.push(lowerKey);

  const keepFocusOnCurrent =
    currentFocus && !criteria.repeating && textCriteriaMatches(currentFocus, criteria);

  if (
    criteria.previousKeyMatched &&
    (keepFocusOnCurrent ||
      moveFocus(list, currentFocus, false, disabledItemsFocusable, nextItem, criteria))
  ) {
    event.preventDefault();
  } else {
    criteria.previousKeyMatched = false;
  }
}
```

**역할**:
- 500ms 타이머: 시간 간격이 길면 키 누적 초기화
- `repeating`: 같은 키 반복 입력 감지 (예: 'a', 'a', 'a')
- `keys`: 누적된 키 배열 (예: ['a', 'p'] → "ap"로 시작하는 항목 찾기)
- `previousKeyMatched`: 이전 매칭 성공 여부

### 4. adjustStyleForScrollbar

```javascript
React.useImperativeHandle(
  actions,
  () => ({
    adjustStyleForScrollbar: (containerElement, { direction }) => {
      const noExplicitWidth = !listRef.current.style.width;
      if (containerElement.clientHeight < listRef.current.clientHeight && noExplicitWidth) {
        const scrollbarSize = `${getScrollbarSize(ownerWindow(containerElement))}px`;
        listRef.current.style[direction === 'rtl' ? 'paddingLeft' : 'paddingRight'] =
          scrollbarSize;
        listRef.current.style.width = `calc(100% + ${scrollbarSize})`;
      }
      return listRef.current;
    },
  }),
  [],
);
```

**역할**:
- Menu에서 `actions` ref로 호출
- 스크롤바가 있을 때 너비만큼 padding/width 조정
- RTL 지원: 오른쪽/왼쪽 padding 선택
- `getScrollbarSize`: 브라우저별 스크롤바 너비 계산

### 5. activeItemIndex 계산 (variant 기반)

```javascript
let activeItemIndex = -1;
React.Children.forEach(children, (child, index) => {
  if (!React.isValidElement(child)) {
    if (activeItemIndex === index) {
      activeItemIndex += 1;
      if (activeItemIndex >= children.length) {
        activeItemIndex = -1;
      }
    }
    return;
  }

  if (process.env.NODE_ENV !== 'production') {
    if (isFragment(child)) {
      console.error(
        [
          "MUI: The Menu component doesn't accept a Fragment as a child.",
          'Consider providing an array instead.',
        ].join('\n'),
      );
    }
  }

  if (!child.props.disabled) {
    if (variant === 'selectedMenu' && child.props.selected) {
      activeItemIndex = index;
    } else if (activeItemIndex === -1) {
      activeItemIndex = index;
    }
  }

  if (
    activeItemIndex === index &&
    (child.props.disabled || child.props.muiSkipListHighlight || child.type.muiSkipListHighlight)
  ) {
    activeItemIndex += 1;
    if (activeItemIndex >= children.length) {
      activeItemIndex = -1;
    }
  }
});

const items = React.Children.map(children, (child, index) => {
  if (index === activeItemIndex) {
    const newChildProps = {};
    if (autoFocusItem) {
      newChildProps.autoFocus = true;
    }
    if (child.props.tabIndex === undefined && variant === 'selectedMenu') {
      newChildProps.tabIndex = 0;
    }
    return React.cloneElement(child, newChildProps);
  }
  return child;
});
```

**역할**:
- `variant='selectedMenu'`: selected된 MenuItem에 포커스
- `variant='menu'`: 첫 번째 유효한 MenuItem에 포커스
- disabled 항목 건너뛰기
- `muiSkipListHighlight`: 특정 항목 건너뛰기 (Divider 등)
- `React.cloneElement`로 autoFocus, tabIndex props 주입

### 6. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `autoFocus` | boolean | `false` | MenuList 컨테이너에 포커스 |
| `autoFocusItem` | boolean | `false` | activeItemIndex 항목에 autoFocus |
| `children` | ReactNode | - | MenuItem들 |
| `className` | string | - | List에 전달되는 클래스 |
| `variant` | 'menu' \| 'selectedMenu' | `'selectedMenu'` | 초기 포커스 전략 |
| `disableListWrap` | boolean | `false` | 리스트 끝에서 순환 방지 |
| `disabledItemsFocusable` | boolean | `false` | disabled 항목도 포커스 가능 |
| `onKeyDown` | func | - | 추가 키보드 핸들러 |
| `actions` | ref | - | *private* adjustStyleForScrollbar 접근 |

### 7. 키보드 핸들러

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
    moveFocus(list, currentFocus, disableListWrap, disabledItemsFocusable, nextItem);
  } else if (key === 'ArrowUp') {
    event.preventDefault();
    moveFocus(list, currentFocus, disableListWrap, disabledItemsFocusable, previousItem);
  } else if (key === 'Home') {
    event.preventDefault();
    moveFocus(list, null, disableListWrap, disabledItemsFocusable, nextItem);
  } else if (key === 'End') {
    event.preventDefault();
    moveFocus(list, null, disableListWrap, disabledItemsFocusable, previousItem);
  } else if (key.length === 1) {
    // 타이핑 검색 로직
  }

  if (onKeyDown) {
    onKeyDown(event);
  }
};
```

**역할**:
- **ArrowDown/ArrowUp**: 다음/이전 항목으로 이동
- **Home/End**: 첫/마지막 항목으로 이동
- **문자 키**: 타이핑 검색 (해당 문자로 시작하는 항목 찾기)
- **Modifier key**: Ctrl/Alt/Meta 누르면 무시
- `event.preventDefault()`: 페이지 스크롤 방지

---

## 설계 패턴

1. **WAI-ARIA 메뉴 패턴**
   - role="menu" + 키보드 내비게이션
   - ArrowUp/Down, Home/End 지원
   - [W3C 표준](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/) 준수

2. **DOM 순회 알고리즘**
   - nextItem/previousItem: nextElementSibling 사용
   - moveFocus: 포커스 가능한 항목 찾을 때까지 순회
   - wrappedOnce 플래그로 무한 루프 방지

3. **타이핑 검색 (Type-ahead)**
   - 500ms 타이머로 키 누적 관리
   - repeating 플래그로 같은 키 반복 감지
   - textCriteriaMatches로 텍스트 매칭

4. **React.Children 조작**
   - `React.Children.forEach`: activeItemIndex 계산
   - `React.Children.map`: autoFocus/tabIndex props 주입
   - `React.cloneElement`: 자식 요소에 props 추가

5. **useImperativeHandle**
   - actions ref로 외부 접근 허용
   - adjustStyleForScrollbar 메서드 제공
   - Menu 컴포넌트가 호출

---

## 복잡도의 이유

MenuList는 **346줄**이며, 복잡한 이유는:

1. **타이핑 검색** (약 80줄)
   - `textCriteriaRef` ref 관리 (5줄)
   - `textCriteriaMatches` 함수 (18줄)
   - handleKeyDown 내 타이핑 검색 로직 (28줄)
   - moveFocus에 textCriteria 파라미터 전달 및 처리

2. **variant 로직** (약 70줄)
   - `activeItemIndex` 계산 (46줄)
   - `React.Children.forEach`: children 순회 및 검증
   - `React.Children.map`: autoFocus/tabIndex 주입 (16줄)
   - isFragment 검증, muiSkipListHighlight 처리

3. **adjustStyleForScrollbar** (약 20줄)
   - `React.useImperativeHandle` 사용
   - `getScrollbarSize` 호출
   - RTL 지원 (direction 파라미터)
   - padding/width 조정 로직

4. **옵션 props** (약 15줄)
   - `disableListWrap`: nextItem/previousItem 분기 처리
   - `disabledItemsFocusable`: moveFocus 분기 처리
   - 각 헬퍼 함수에 파라미터 전달

5. **PropTypes** (약 45줄)
   - 런타임 타입 검증
   - JSDoc 주석
   - 7개 props 정의

6. **헬퍼 함수들** (약 90줄)
   - nextItem, previousItem (각 10줄)
   - textCriteriaMatches (18줄)
   - moveFocus (38줄)

---

## 비교: MenuList vs List

MenuList는 List 컴포넌트를 래핑하여 메뉴 기능을 추가합니다.

| 기능 | List | MenuList |
|------|------|----------|
| **역할** | 단순한 ul 래퍼 | 키보드 내비게이션 + 메뉴 로직 |
| **코드 라인** | 144줄 | 346줄 |
| **키보드 핸들링** | ❌ | ✅ ArrowUp/Down, Home/End |
| **타이핑 검색** | ❌ | ✅ Type-ahead |
| **포커스 관리** | ❌ | ✅ moveFocus 알고리즘 |
| **variant** | ❌ | ✅ selectedMenu, menu |
| **role** | `"list"` | `"menu"` |
| **사용 사례** | 일반 목록 (ListItem) | 메뉴 항목 (MenuItem) |

**핵심 차이**:
- `List`는 스타일 래퍼 (padding, listStyle 등)
- `MenuList`는 List + 키보드 접근성 + 포커스 관리
