# Popper 컴포넌트

> Popper.js를 React에 통합하여 특정 요소 기준으로 팝업을 배치하는 컴포넌트

---

## 무슨 기능을 하는가?

수정된 Popper는 **anchorEl 기준으로 콘텐츠를 자동으로 위치 지정하는** 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **위치 자동 계산** - Popper.js를 사용하여 anchor 요소 기준으로 팝업 위치를 자동 계산
2. **배치 옵션** - `placement` prop으로 12가지 위치 선택 (top, bottom, left, right + start/end 조합)
3. **Portal 렌더링** - `document.body`에 Portal을 통해 렌더링하여 z-index 및 레이아웃 문제 회피
4. **동적 업데이트** - anchor 요소나 placement가 변경되면 자동으로 위치 재계산
5. **Overflow 처리** - preventOverflow, flip modifiers로 화면 밖으로 벗어나지 않도록 자동 조정
6. **Function Children** - render prop 패턴으로 placement 정보를 자식에게 전달 가능

---

## 핵심 학습 포인트

### 1. Popper.js 라이브러리 통합

```typescript
import { createPopper, Instance, Modifier, Placement } from '@popperjs/core';

const popper = createPopper(resolvedAnchorElement, tooltipRef.current!, {
  placement: initialPlacement,
  ...popperOptions,
  modifiers: popperModifiers,
});
```

**학습 가치**:
- 외부 라이브러리를 React와 통합하는 방법
- 라이브러리 인스턴스를 ref로 관리하는 패턴
- 라이브러리 옵션을 props로 노출하는 방식

### 2. Ref 포워딩 및 병합

```typescript
const popperRef = React.useRef<Instance>(null);
const handlePopperRef = useForkRef(popperRef, popperRefProp);
const handlePopperRefRef = React.useRef(handlePopperRef);

useEnhancedEffect(() => {
  handlePopperRefRef.current = handlePopperRef;
}, [handlePopperRef]);
```

**학습 가치**:
- `useForkRef`로 여러 ref를 동시에 관리하는 패턴
- ref의 ref를 사용하여 최신 값을 cleanup 함수에서 접근
- `useImperativeHandle`로 Popper 인스턴스를 외부에 노출

### 3. Effect를 통한 라이브러리 생명주기 관리

```typescript
useEnhancedEffect(() => {
  if (!resolvedAnchorElement || !open) {
    return undefined;
  }

  const popper = createPopper(/*...*/);
  handlePopperRefRef.current!(popper);

  return () => {
    popper.destroy();
    handlePopperRefRef.current!(null);
  };
}, [resolvedAnchorElement, modifiers, open, popperOptions, initialPlacement]);
```

**학습 가치**:
- 외부 라이브러리 인스턴스를 effect로 생성/파괴하는 패턴
- cleanup 함수로 메모리 누수 방지
- 의존성 배열로 인스턴스 재생성 조건 제어

### 4. Modifiers 배열 구성

```typescript
let popperModifiers: Partial<Modifier<any, any>>[] = [
  { name: 'preventOverflow' },
  { name: 'flip' },
  {
    name: 'onUpdate',
    enabled: true,
    phase: 'afterWrite',
    fn: ({ state }) => {
      setPlacement(state.placement);
    },
  },
];

if (modifiers != null) {
  popperModifiers = popperModifiers.concat(modifiers);
}
```

**학습 가치**:
- Popper.js의 modifier 시스템 이해
- 기본 modifiers와 사용자 modifiers 병합
- state 업데이트를 위한 커스텀 modifier 작성

### 5. Function Children 패턴

```typescript
const childProps: PopperChildrenProps = { placement: placement! };

return (
  <div role="tooltip" ref={ownRef} {...other}>
    {typeof children === 'function' ? children(childProps) : children}
  </div>
);
```

**학습 가치**:
- Render prop 패턴으로 동적 placement 정보 전달
- 일반 children과 function children 모두 지원하는 유연한 API
- 실시간으로 변경되는 값을 자식에게 전달하는 방법

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/mui-material/src/Popper/ (199줄, 원본 841줄)
Popper (Popper.tsx - BasePopper 직접 참조)
  └─> BasePopper (외부 Popper 컴포넌트)
       └─> Portal
            └─> PopperTooltip (내부 실제 팝업 컴포넌트)
                 └─> <div role="tooltip">
                      └─> children (또는 children(childProps))
```

### 2. Anchor 요소 처리

```typescript
function resolveAnchorEl(
  anchorEl: HTMLElement | (() => HTMLElement) | null | undefined,
): HTMLElement | null | undefined {
  return typeof anchorEl === 'function' ? anchorEl() : anchorEl;
}

const [resolvedAnchorElement, setResolvedAnchorElement] = React.useState<
  HTMLElement | null | undefined
>(resolveAnchorEl(anchorEl));

React.useEffect(() => {
  if (anchorEl) {
    setResolvedAnchorElement(resolveAnchorEl(anchorEl));
  }
}, [anchorEl]);
```

**설명**:
- `anchorEl`은 HTMLElement 또는 함수 (lazy evaluation 지원)
- 함수형 anchorEl은 ref가 아직 설정되지 않은 시점에 유용
- state로 관리하여 anchorEl 변경 시 자동 업데이트

> **💡 원본과의 차이**:
> - ❌ `VirtualElement` 지원 제거 → HTMLElement만 허용
> - ❌ `isHTMLElement()`, `isVirtualElement()` 헬퍼 함수 제거
> - ❌ 개발 모드 검증 로직 제거 (getBoundingClientRect 검사 등)

### 3. Portal을 통한 DOM 외부 렌더링

```typescript
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
        position: 'fixed',
        top: 0,
        left: 0,
        ...style,
      }}
    >
      {children}
    </PopperTooltip>
  </Portal>
);
```

**설명**:
- Portal을 통해 항상 `document.body`에 렌더링
- `position: fixed`로 고정 위치 지정 (Popper.js가 transform으로 실제 위치 계산)
- `top: 0, left: 0`은 초기값 (Popper.js가 즉시 올바른 위치로 변경)

> **💡 원본과의 차이**:
> - ❌ `container` prop 제거 → 항상 `document.body` 사용
> - ❌ `disablePortal` prop 제거 → 항상 Portal 사용
> - ❌ `keepMounted` prop 제거 → open일 때만 렌더링
> - ❌ `display: none` 계산 로직 제거

### 4. Popper.js 인스턴스 관리

```typescript
// 인스턴스 생성 및 ref 설정
const popper = createPopper(resolvedAnchorElement, tooltipRef.current!, {
  placement: initialPlacement,
  ...popperOptions,
  modifiers: popperModifiers,
});

handlePopperRefRef.current!(popper);

// cleanup: 인스턴스 파괴
return () => {
  popper.destroy();
  handlePopperRefRef.current!(null);
};
```

**설명**:
- Popper.js 인스턴스는 effect에서 생성되고 cleanup에서 파괴
- `handlePopperRefRef.current`로 최신 ref 함수에 접근
- `destroy()`로 이벤트 리스너 및 메모리 정리

**Popper.js가 하는 일**:
- anchor 요소와 popup 요소의 위치를 계산
- `transform: translate3d(x, y, 0)`으로 popup 위치 조정
- 스크롤/리사이즈 시 자동으로 위치 업데이트
- modifiers를 통한 overflow/flip 처리

### 5. Placement 상태 관리

```typescript
const [placement, setPlacement] = React.useState<Placement | undefined>(initialPlacement);

const handlePopperUpdate = (data: State) => {
  setPlacement(data.placement);
};

{
  name: 'onUpdate',
  enabled: true,
  phase: 'afterWrite',
  fn: ({ state }) => {
    handlePopperUpdate(state);
  },
}
```

**설명**:
- `placement`는 초기값에서 시작하지만 flip modifier에 의해 변경될 수 있음
- `onUpdate` modifier로 Popper.js의 placement 변경을 감지
- state로 저장하여 function children에 전달

> **💡 원본과의 차이**:
> - ❌ `flipPlacement()` 함수 제거 → RTL 자동 변환 미지원
> - ❌ `direction` prop 제거 → 항상 LTR 모드

### 6. Props (7개만 남음)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `anchorEl`* | `HTMLElement \| (() => HTMLElement) \| null` | - | 위치 기준 요소 (필수 아님) |
| `children` | `ReactNode \| ((props: PopperChildrenProps) => ReactNode)` | - | 팝업 콘텐츠 또는 render function |
| `open`* | `boolean` | - | true일 때만 렌더링 (필수) |
| `placement` | `PopperPlacementType` | `'bottom'` | 12가지 위치 옵션 |
| `modifiers` | `Modifier[]` | `[]` | Popper.js modifiers 배열 |
| `popperOptions` | `Partial<OptionsGeneric>` | `{}` | Popper.js 전체 옵션 |
| `popperRef` | `React.Ref<Instance>` | - | Popper.js 인스턴스 접근용 ref |

**placement 옵션** (12가지):
- `auto`, `auto-start`, `auto-end`
- `top`, `top-start`, `top-end`
- `bottom`, `bottom-start`, `bottom-end`
- `left`, `left-start`, `left-end`
- `right`, `right-start`, `right-end`

---

## 커밋 히스토리로 보는 단순화 과정

Popper는 **11개의 커밋**을 통해 단순화되었습니다.

### 1단계: Slot 시스템 제거
- `535ba6ea29` - Popper 원본 분석 문서 작성
- `4b37e2c896` - [Popper 단순화 1/11] Slot 시스템 제거
  - `useSlotProps()` 훅 및 slot 렌더링 로직 제거
  - Material-UI v5의 커스터마이징 시스템 제거
  - **불필요한 이유**: Popper의 핵심은 "위치 지정"이지 "커스터마이징"이 아님

### 2단계: 다형성 제거
- `5dfbeac45f` - [Popper 단순화 2/11] component prop 제거
  - `component` prop 제거
  - PolymorphicComponent 타입 제거
  - **불필요한 이유**: Popper는 항상 div로 충분하며, 다형성은 별도 학습 주제

### 3단계: 레거시 API 제거
- `e1e8bfd9e4` - [Popper 단순화 3/11] 레거시 API 제거
  - `components`, `componentsProps` (v4 호환성) 제거
  - **불필요한 이유**: 하위 호환성은 프로덕션 라이브러리의 책임, 최신 API만 학습하면 충분

### 4단계: Transition 제거
- `3836240377` - [Popper 단순화 4/11] transition prop 제거
  - `transition` prop 및 `exited` state 제거
  - TransitionProps 전달 로직 제거
  - **불필요한 이유**: Popper의 핵심은 "위치 지정"이지 "애니메이션"이 아님

### 5단계: KeepMounted 제거
- `1c122c16da` - [Popper 단순화 5/11] keepMounted prop 제거
  - `keepMounted` prop 및 display 계산 제거
  - **불필요한 이유**: 학습에서는 "열렸을 때만 렌더링"이 더 직관적

### 6단계: Portal 옵션 제거
- `cb4e59153b` - [Popper 단순화 6/11] disablePortal, container props 제거
  - `container`, `disablePortal` props 제거
  - modifiers의 `altBoundary` 옵션 제거
  - **불필요한 이유**: Popper는 항상 Portal을 사용하는 것이 표준 패턴

### 7단계: RTL 지원 제거
- `b889512072` - [Popper 단순화 7/11] RTL 지원 제거
  - `flipPlacement()` 함수, `direction` prop 제거
  - `useRtl()` 훅 제거
  - **불필요한 이유**: 한국어/영어 학습자에게는 LTR만으로 충분

### 8단계: VirtualElement 제거
- `e6b104ee98` - [Popper 단순화 8/11] VirtualElement 지원 제거
  - VirtualElement 타입 및 헬퍼 함수 제거
  - PropTypes 검증 로직 대폭 간소화
  - **불필요한 이유**: 99% 케이스는 실제 DOM 요소 사용

### 9단계: Theme 시스템 제거
- `36c07b29a1` - [Popper 단순화 9/11] Theme 시스템 제거
  - `useDefaultProps()`, `useUtilityClasses()` 제거
  - `sx` prop 제거
  - **불필요한 이유**: 테마는 Material-UI 전체 주제, Popper 학습에 과함

### 10단계: Styled Components 제거
- `32a84761b8` - [Popper 단순화 10/11] Styled Components 제거
  - `styled()` API 제거, PopperRoot 래퍼 제거
  - Popper를 BasePopper의 직접 참조로 변경
  - **불필요한 이유**: Popper의 핵심은 위치 지정이지 스타일링이 아님

### 11단계: PropTypes 제거
- `369a4524d5` - [Popper 단순화 11/11] PropTypes 및 메타데이터 제거
  - PropTypes 140+ 줄 제거
  - **불필요한 이유**: TypeScript가 빌드 타임에 더 강력한 타입 검증 제공

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 841줄 | 199줄 (76% 감소) |
| **Props 개수** | 17개 | 7개 |
| **Slot 시스템** | ✅ | ❌ |
| **component prop (다형성)** | ✅ | ❌ |
| **레거시 API (components, componentsProps)** | ✅ | ❌ |
| **transition prop** | ✅ | ❌ (즉시 나타남) |
| **keepMounted** | ✅ | ❌ (open일 때만 렌더링) |
| **container prop** | ✅ | ❌ (항상 document.body) |
| **disablePortal** | ✅ | ❌ (항상 Portal 사용) |
| **RTL 지원 (direction)** | ✅ | ❌ (LTR만 지원) |
| **VirtualElement 지원** | ✅ | ❌ (HTMLElement만 지원) |
| **Theme 통합 (sx, useDefaultProps)** | ✅ | ❌ |
| **styled() 래퍼** | ✅ | ❌ (BasePopper 직접 사용) |
| **PropTypes 검증** | ✅ | ❌ (TypeScript만 사용) |

---

## 학습 후 다음 단계

Popper를 이해했다면:

1. **Tooltip** - Popper 기반으로 만들어진 실용적인 컴포넌트
2. **Menu** - Popper + FocusTrap + 키보드 내비게이션
3. **Autocomplete** - Popper + Input + 복잡한 상태 관리
4. **실전 응용** - 드롭다운, 컨텍스트 메뉴, 날짜 피커 등

**예시: 기본 사용**
```javascript
function BasicPopper() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <button onClick={(e) => setAnchorEl(e.currentTarget)}>
        Open Popper
      </button>
      <Popper open={open} anchorEl={anchorEl}>
        <div style={{ border: '1px solid', padding: '8px', backgroundColor: 'white' }}>
          The content of the Popper.
        </div>
      </Popper>
    </>
  );
}
```

**예시: Placement 옵션**
```javascript
<Popper open={open} anchorEl={anchorEl} placement="top-start">
  <div>Positioned at top-start</div>
</Popper>
```

**예시: Function Children (동적 placement 표시)**
```javascript
<Popper open={open} anchorEl={anchorEl}>
  {({ placement }) => (
    <div>
      Current placement: {placement}
    </div>
  )}
</Popper>
```

**예시: Custom Modifiers**
```javascript
const modifiers = [
  {
    name: 'offset',
    options: {
      offset: [0, 8], // x, y offset
    },
  },
];

<Popper open={open} anchorEl={anchorEl} modifiers={modifiers}>
  <div>Offset by 8px</div>
</Popper>
```

**예시: Popper Instance 접근**
```javascript
function ControlledPopper() {
  const popperRef = React.useRef(null);

  const updatePosition = () => {
    popperRef.current?.update();
  };

  return (
    <Popper open={true} anchorEl={anchorEl} popperRef={popperRef}>
      <div>
        <button onClick={updatePosition}>Update Position</button>
      </div>
    </Popper>
  );
}
```

---

## 추가 학습 포인트

### Popper.js의 Modifier 시스템 이해

Popper.js는 플러그인 기반 아키텍처로, 모든 기능이 "modifiers"로 구현됩니다.

**주요 내장 Modifiers**:
- `preventOverflow`: 팝업이 화면 밖으로 나가지 않도록 제한
- `flip`: 공간이 부족하면 반대편으로 위치 변경
- `offset`: 팝업과 anchor 사이 간격 조정
- `arrow`: 화살표 요소 위치 계산
- `hide`: 팝업이 완전히 가려지면 숨김 처리

**Modifier Phase**:
- `beforeRead`: 초기 데이터 수집 전
- `read`: DOM 측정
- `afterRead`: 측정 후 데이터 처리
- `beforeMain`: 메인 계산 전
- `main`: 위치 계산
- `afterMain`: 계산 후 처리
- `beforeWrite`: DOM 업데이트 전
- `write`: DOM 업데이트
- `afterWrite`: 업데이트 완료 후

### Portal 패턴의 장점

Portal을 사용하면:
1. **Z-index 문제 해결**: 부모의 `overflow: hidden`이나 `z-index`에 영향받지 않음
2. **레이아웃 독립성**: 부모의 레이아웃(flexbox, grid 등)에 영향받지 않음
3. **접근성**: 논리적 DOM 위치와 시각적 위치를 분리 (스크린 리더 순서 유지)
4. **이벤트 버블링**: Portal 내부 이벤트가 React 트리를 따라 버블링

### useEnhancedEffect의 이유

일반 `useEffect` 대신 `useEnhancedEffect`를 사용하는 이유:
- SSR (Server-Side Rendering) 환경에서 `useLayoutEffect` 경고 방지
- 브라우저에서는 `useLayoutEffect`로 동작 (DOM 측정 전 실행)
- 서버에서는 `useEffect`로 동작 (경고 없음)

### Ref 병합 패턴의 필요성

```typescript
const ownRef = useForkRef(tooltipRef, forwardedRef);
```

두 개의 ref를 동시에 설정해야 하는 이유:
- `tooltipRef`: Popper.js가 위치를 계산할 요소 참조
- `forwardedRef`: 외부에서 전달받은 ref (컴포넌트 사용자가 DOM에 접근)

`useForkRef`는 하나의 DOM 요소에 여러 ref를 동시에 설정하는 유틸리티입니다.
