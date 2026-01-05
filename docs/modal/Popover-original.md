# Popover 컴포넌트

> Material-UI의 Popover 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

Popover는 **anchorEl 요소를 기준으로 콘텐츠를 위치시켜 오버레이로 표시하는** 컴포넌트입니다.

> **💡 작성 주의**: Popover 자체는 위치 지정과 스타일 관리만 담당합니다. 백드롭, 포커스 트랩, Portal 렌더링은 Modal이 담당합니다.

### 핵심 기능
1. **앵커 기반 위치 지정** - anchorEl 요소를 기준으로 Popover의 위치를 자동 계산
2. **Origin 조합 시스템** - anchorOrigin/transformOrigin으로 9가지 위치 조합 지원
3. **화면 경계 처리** - marginThreshold를 사용하여 Popover가 화면 밖으로 벗어나지 않도록 자동 조정
4. **다중 위치 지정 모드** - anchorEl, anchorPosition, none 3가지 모드 지원
5. **반응형 위치 업데이트** - resize, scroll 이벤트 시 위치 자동 재계산

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/Popover/Popover.js (699줄)
PopoverRoot (Modal을 styled로 감싼 것)
  └─> Grow (Transition)
       └─> PopoverPaper (Paper를 styled로 감싼 것)
            └─> children
```

### 2. 하위 컴포넌트가 담당하는 기능

- **Modal** - Portal 렌더링, Backdrop, 포커스 트랩, ESC 키 처리, 스크롤 잠금
- **Grow** - 등장/사라질 때 애니메이션 (scale + fade)
- **Paper** - elevation 그림자, 둥근 모서리, 기본 배경색

### 3. 위치 계산 시스템

Popover의 핵심은 **anchorEl 기준으로 Popover를 어디에 배치할 것인가**를 계산하는 것입니다.

#### 3.1 getOffsetTop / getOffsetLeft (lines 24-50)

```javascript
export function getOffsetTop(rect, vertical) {
  let offset = 0;

  if (typeof vertical === 'number') {
    offset = vertical;  // 픽셀 단위 절대값
  } else if (vertical === 'center') {
    offset = rect.height / 2;  // 중앙
  } else if (vertical === 'bottom') {
    offset = rect.height;  // 하단
  }
  // 'top'이면 0

  return offset;
}

export function getOffsetLeft(rect, horizontal) {
  let offset = 0;

  if (typeof horizontal === 'number') {
    offset = horizontal;
  } else if (horizontal === 'center') {
    offset = rect.width / 2;
  } else if (horizontal === 'right') {
    offset = rect.width;
  }
  // 'left'면 0

  return offset;
}
```

**역할**: anchorOrigin/transformOrigin의 vertical/horizontal 값을 픽셀 offset으로 변환

**지원 값**:
- `'top'` → 0
- `'center'` → height/2 또는 width/2
- `'bottom'` / `'right'` → height 또는 width
- `number` → 직접 픽셀 값

#### 3.2 getAnchorOffset (lines 144-190)

```javascript
const getAnchorOffset = React.useCallback(() => {
  // 모드 1: anchorPosition (절대 좌표)
  if (anchorReference === 'anchorPosition') {
    if (process.env.NODE_ENV !== 'production') {
      if (!anchorPosition) {
        console.error('MUI: anchorPosition prop 필요');
      }
    }
    return anchorPosition;  // { top: number, left: number }
  }

  // 모드 2: anchorEl (요소 기준)
  const resolvedAnchorEl = resolveAnchorEl(anchorEl);

  const anchorElement =
    resolvedAnchorEl && resolvedAnchorEl.nodeType === 1
      ? resolvedAnchorEl
      : ownerDocument(paperRef.current).body;
  const anchorRect = anchorElement.getBoundingClientRect();

  // 개발 모드 검증: anchor가 화면에 없으면 경고
  if (process.env.NODE_ENV !== 'production') {
    const box = anchorElement.getBoundingClientRect();
    if (box.top === 0 && box.left === 0 && box.right === 0 && box.bottom === 0) {
      console.warn('MUI: anchorEl이 화면에 없음');
    }
  }

  return {
    top: anchorRect.top + getOffsetTop(anchorRect, anchorOrigin.vertical),
    left: anchorRect.left + getOffsetLeft(anchorRect, anchorOrigin.horizontal),
  };
}, [anchorEl, anchorOrigin.horizontal, anchorOrigin.vertical, anchorPosition, anchorReference]);
```

**역할**: anchor 요소의 어느 지점을 기준점으로 사용할지 계산

**예시**:
- `anchorOrigin = { vertical: 'bottom', horizontal: 'left' }` → 왼쪽 하단 모서리

#### 3.3 getTransformOrigin (lines 193-201)

```javascript
const getTransformOrigin = React.useCallback(
  (elemRect) => {
    return {
      vertical: getOffsetTop(elemRect, transformOrigin.vertical),
      horizontal: getOffsetLeft(elemRect, transformOrigin.horizontal),
    };
  },
  [transformOrigin.horizontal, transformOrigin.vertical],
);
```

**역할**: Popover 자체의 어느 지점을 anchor에 붙일지 계산

**예시**:
- `transformOrigin = { vertical: 'top', horizontal: 'left' }` → Popover의 왼쪽 상단 모서리

#### 3.4 getPositioningStyle (lines 203-284)

```javascript
const getPositioningStyle = React.useCallback(
  (element) => {
    const elemRect = {
      width: element.offsetWidth,
      height: element.offsetHeight,
    };

    // Popover의 transform origin 계산
    const elemTransformOrigin = getTransformOrigin(elemRect);

    // 모드 3: anchorReference='none'
    if (anchorReference === 'none') {
      return {
        top: null,
        left: null,
        transformOrigin: getTransformOriginValue(elemTransformOrigin),
      };
    }

    // Anchor 기준점 계산
    const anchorOffset = getAnchorOffset();

    // 초기 위치: anchor 기준점 - Popover transform origin
    let top = anchorOffset.top - elemTransformOrigin.vertical;
    let left = anchorOffset.left - elemTransformOrigin.horizontal;
    const bottom = top + elemRect.height;
    const right = left + elemRect.width;

    // 화면 크기
    const containerWindow = ownerWindow(resolveAnchorEl(anchorEl));
    const heightThreshold = containerWindow.innerHeight - marginThreshold;
    const widthThreshold = containerWindow.innerWidth - marginThreshold;

    // 수직 경계 체크
    if (marginThreshold !== null && top < marginThreshold) {
      const diff = top - marginThreshold;
      top -= diff;
      elemTransformOrigin.vertical += diff;  // transform origin 조정
    } else if (marginThreshold !== null && bottom > heightThreshold) {
      const diff = bottom - heightThreshold;
      top -= diff;
      elemTransformOrigin.vertical += diff;
    }

    // 개발 모드 경고: Popover가 너무 크면
    if (process.env.NODE_ENV !== 'production') {
      if (elemRect.height > heightThreshold && elemRect.height && heightThreshold) {
        console.error(
          `MUI: Popover가 너무 큼 (${elemRect.height - heightThreshold}px 초과)`
        );
      }
    }

    // 수평 경계 체크
    if (marginThreshold !== null && left < marginThreshold) {
      const diff = left - marginThreshold;
      left -= diff;
      elemTransformOrigin.horizontal += diff;
    } else if (right > widthThreshold) {
      const diff = right - widthThreshold;
      left -= diff;
      elemTransformOrigin.horizontal += diff;
    }

    return {
      top: `${Math.round(top)}px`,
      left: `${Math.round(left)}px`,
      transformOrigin: getTransformOriginValue(elemTransformOrigin),
    };
  },
  [anchorEl, anchorReference, getAnchorOffset, getTransformOrigin, marginThreshold],
);
```

**역할**: 최종 위치 스타일 계산 (화면 경계 처리 포함)

**핵심 로직**:
1. Popover의 초기 위치 = anchor 기준점 - Popover transform origin
2. 화면 경계를 벗어나면 위치 조정
3. transform origin도 함께 조정 (애니메이션 기준점 유지)

#### 3.5 setPositioningStyles (lines 288-305)

```javascript
const setPositioningStyles = React.useCallback(() => {
  const element = paperRef.current;

  if (!element) {
    return;
  }

  const positioning = getPositioningStyle(element);

  if (positioning.top !== null) {
    element.style.setProperty('top', positioning.top);
  }
  if (positioning.left !== null) {
    element.style.left = positioning.left;
  }
  element.style.transformOrigin = positioning.transformOrigin;
  setIsPositioned(true);
}, [getPositioningStyle]);
```

**역할**: 계산된 스타일을 실제 DOM에 적용

### 4. 반응형 위치 업데이트

#### 4.1 스크롤 이벤트 (lines 307-312)

```javascript
React.useEffect(() => {
  if (disableScrollLock) {
    window.addEventListener('scroll', setPositioningStyles);
  }
  return () => window.removeEventListener('scroll', setPositioningStyles);
}, [anchorEl, disableScrollLock, setPositioningStyles]);
```

**역할**: `disableScrollLock=true`일 때 스크롤 시 위치 업데이트

#### 4.2 리사이즈 이벤트 (lines 341-356)

```javascript
React.useEffect(() => {
  if (!open) {
    return undefined;
  }

  const handleResize = debounce(() => {
    setPositioningStyles();
  });

  const containerWindow = ownerWindow(resolveAnchorEl(anchorEl));
  containerWindow.addEventListener('resize', handleResize);
  return () => {
    handleResize.clear();
    containerWindow.removeEventListener('resize', handleResize);
  };
}, [anchorEl, open, setPositioningStyles]);
```

**역할**: 창 크기 변경 시 위치 재계산 (debounce 적용)

#### 4.3 open/anchorEl 변경 시 (lines 322-326)

```javascript
React.useEffect(() => {
  if (open) {
    setPositioningStyles();
  }
});
```

**역할**: Popover가 열릴 때마다 위치 계산

### 5. Slot 시스템

```javascript
const externalForwardedProps = {
  slots: {
    transition: TransitionComponent,
    ...slots,
  },
  slotProps: {
    transition: TransitionProps,
    paper: PaperPropsProp,
    ...slotProps,
  },
};

const [RootSlot, { slots: rootSlotsProp, slotProps: rootSlotPropsProp, ...rootProps }] = useSlot(
  'root',
  {
    ref,
    elementType: PopoverRoot,
    externalForwardedProps: {
      ...externalForwardedProps,
      ...other,
    },
    shouldForwardComponentProp: true,
    additionalProps: {
      slots: { backdrop: slots.backdrop },
      slotProps: {
        backdrop: mergeSlotProps(
          typeof slotProps.backdrop === 'function'
            ? slotProps.backdrop(ownerState)
            : slotProps.backdrop,
          { invisible: true },
        ),
      },
      container,
      open,
    },
    ownerState,
    className: clsx(classes.root, className),
  },
);

const [PaperSlot, paperProps] = useSlot('paper', {
  ref: paperRef,
  className: classes.paper,
  elementType: PopoverPaper,
  externalForwardedProps,
  shouldForwardComponentProp: true,
  additionalProps: {
    elevation,
    style: isPositioned ? undefined : { opacity: 0 },
  },
  ownerState,
});
```

**역할**: root, paper, transition 슬롯 커스터마이징 지원

### 6. Transition 시스템

```javascript
const [TransitionSlot, transitionSlotProps] = useSlot('transition', {
  elementType: Grow,
  externalForwardedProps,
  ownerState,
  getSlotProps: (handlers) => ({
    ...handlers,
    onEntering: (element, isAppearing) => {
      handlers.onEntering?.(element, isAppearing);
      handleEntering();
    },
    onExited: (element) => {
      handlers.onExited?.(element);
      handleExited();
    },
  }),
  additionalProps: {
    appear: true,
    in: open,
  },
});

const handleEntering = () => {
  setPositioningStyles();
};

const handleExited = () => {
  setIsPositioned(false);
};
```

**역할**: Grow 애니메이션 진입/종료 시 콜백

### 7. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `action` | ref | - | `updatePosition()` 메서드 제공 |
| `anchorEl`* | HTMLElement \| (() => HTMLElement) | - | 위치 기준 요소 |
| `anchorOrigin` | `{ vertical, horizontal }` | `{ vertical: 'top', horizontal: 'left' }` | anchor 기준점 |
| `anchorPosition` | `{ top, left }` | - | 절대 좌표 (anchorReference='anchorPosition'일 때) |
| `anchorReference` | `'anchorEl' \| 'anchorPosition' \| 'none'` | `'anchorEl'` | 위치 지정 모드 |
| `children` | ReactNode | - | Popover 콘텐츠 |
| `className` | string | - | PopoverRoot 클래스 |
| `container` | HTMLElement \| func | - | Portal 컨테이너 (기본값: anchorEl의 body) |
| `elevation` | number | 8 | Paper elevation |
| `marginThreshold` | number | 16 | 화면 경계까지 최소 거리 (px) |
| `open`* | boolean | - | 표시 여부 |
| `PaperProps` | object | `{}` | Paper에 전달할 props (deprecated) |
| `slots` | object | `{}` | 슬롯 커스터마이징 |
| `slotProps` | object | `{}` | 슬롯 props |
| `transformOrigin` | `{ vertical, horizontal }` | `{ vertical: 'top', horizontal: 'left' }` | Popover 기준점 |
| `TransitionComponent` | elementType | Grow | Transition 컴포넌트 (deprecated) |
| `transitionDuration` | number \| 'auto' | 'auto' | Transition 지속 시간 |
| `TransitionProps` | object | `{}` | Transition props (deprecated) |
| `disableScrollLock` | boolean | false | 스크롤 잠금 비활성화 |

### 8. Styled Components

#### PopoverRoot (lines 73-76)

```javascript
export const PopoverRoot = styled(Modal, {
  name: 'MuiPopover',
  slot: 'Root',
})({});
```

**역할**: Modal을 감싸서 Material-UI 테마 시스템에 통합

#### PopoverPaper (lines 78-93)

```javascript
export const PopoverPaper = styled(PaperBase, {
  name: 'MuiPopover',
  slot: 'Paper',
})({
  position: 'absolute',
  overflowY: 'auto',
  overflowX: 'hidden',
  minWidth: 16,
  minHeight: 16,
  maxWidth: 'calc(100% - 32px)',
  maxHeight: 'calc(100% - 32px)',
  outline: 0,
});
```

**역할**: Paper에 Popover 전용 스타일 추가

---

## 설계 패턴

1. **Composition (조합)**
   - Modal + Paper + Grow를 조합하여 Popover 구성
   - 각 컴포넌트가 독립적인 책임 (Modal: 오버레이, Paper: 스타일, Grow: 애니메이션)

2. **Slot System**
   - root, paper, transition 슬롯으로 커스터마이징 가능
   - `useSlot()` 훅으로 슬롯 props 병합 및 전달

3. **Callback Ref**
   - `paperRef`로 Paper DOM 접근
   - `setPositioningStyles()`에서 직접 DOM 스타일 조작

4. **Command Pattern**
   - `action` ref로 `updatePosition()` 메서드 제공
   - `useImperativeHandle()`로 명령형 API 노출

---

## 복잡도의 이유

Popover는 **699줄**이며, 복잡한 이유는:

1. **Slot 시스템 (약 80줄)**
   - `useSlot()` 훅 3번 호출 (root, paper, transition)
   - `externalForwardedProps` 객체 생성 및 병합
   - `mergeSlotProps()`, `isHostComponent()` 체크

2. **3가지 anchorReference 모드 (약 50줄)**
   - `anchorEl`: 요소 기준 (가장 일반적)
   - `anchorPosition`: 절대 좌표
   - `none`: 위치 지정 없음

3. **9가지 origin 조합 (약 40줄)**
   - vertical: `top` / `center` / `bottom` / number
   - horizontal: `left` / `center` / `right` / number
   - 총 3×3 = 9가지 조합 + 숫자값 지원

4. **화면 경계 처리 (약 60줄)**
   - `marginThreshold`로 화면 밖으로 벗어나지 않도록 조정
   - vertical/horizontal 각각 경계 체크
   - transform origin도 함께 조정

5. **Transition 시스템 (약 50줄)**
   - Grow 애니메이션 통합
   - `handleEntering`, `handleExited` 콜백
   - `isPositioned` 상태 관리
   - `transitionDuration='auto'` 처리

6. **Theme 시스템 (약 50줄)**
   - `useDefaultProps()` 호출
   - `useUtilityClasses()` 함수
   - `composeClasses()` 호출
   - `ownerState` 객체 생성 및 전달

7. **Styled Components (약 30줄)**
   - PopoverRoot, PopoverPaper styled components
   - name, slot 메타데이터

8. **PropTypes (약 240줄)**
   - 런타임 타입 검증
   - 복잡한 검증 로직 (chainPropTypes)
   - JSDoc 주석

9. **반응형 위치 업데이트 (약 40줄)**
   - resize 이벤트 리스너 (debounce)
   - scroll 이벤트 리스너 (조건부)
   - open/anchorEl 변경 감지

10. **개발 모드 검증 (약 30줄)**
    - anchorEl 유효성 검사
    - Popover 크기 경고
    - anchorPosition 누락 경고

---

## 비교: anchorOrigin vs transformOrigin

| 속성 | anchorOrigin | transformOrigin |
|------|--------------|-----------------|
| **대상** | anchorEl 요소 | Popover 요소 |
| **역할** | anchor의 어느 지점을 기준점으로 사용할지 | Popover의 어느 지점을 anchor에 붙일지 |
| **예시 1** | `{ vertical: 'bottom', horizontal: 'left' }` | `{ vertical: 'top', horizontal: 'left' }` |
| **결과 1** | anchor의 왼쪽 하단 모서리 | Popover의 왼쪽 상단 모서리 |
| **최종 위치** | anchor 왼쪽 하단 아래에 Popover가 나타남 (드롭다운) | - |
| **예시 2** | `{ vertical: 'top', horizontal: 'right' }` | `{ vertical: 'bottom', horizontal: 'right' }` |
| **결과 2** | anchor의 오른쪽 상단 모서리 | Popover의 오른쪽 하단 모서리 |
| **최종 위치** | anchor 오른쪽 상단 위에 Popover가 나타남 (드롭업) | - |

**핵심 공식**:
```
Popover 위치 = anchorEl 기준점 - Popover 기준점
즉, top = anchorOffset.top - transformOrigin.vertical
    left = anchorOffset.left - transformOrigin.horizontal
```
