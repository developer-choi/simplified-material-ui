# Popper 컴포넌트

> Material-UI의 Popper 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

Popper는 **앵커 요소를 기준으로 팝업/오버레이를 정확하게 배치하는 컴포넌트**입니다.

> **💡 작성 주의**: Popper 자체는 "위치 지정"만 담당합니다. Portal을 통한 DOM 외부 렌더링, Popper.js 라이브러리 통합, 위치 계산이 핵심입니다.

### 핵심 기능

1. **앵커 기반 위치 지정** - anchorEl 요소를 기준으로 팝업 위치 자동 계산
2. **Popper.js 통합** - @popperjs/core 라이브러리를 사용한 복잡한 위치 계산
3. **Portal 렌더링** - document.body에 렌더링하여 z-index 문제 해결
4. **Placement 옵션** - top, bottom, left, right + start/end 12가지 위치 지정
5. **VirtualElement 지원** - DOM 요소 외에 마우스 좌표 등 가상 위치 기준 지원
6. **RTL 자동 처리** - Right-to-Left 언어 지원 (placement 자동 변환)
7. **Transition 지원** - react-transition-group과의 통합
8. **Slot 시스템** - 루트 컴포넌트 커스터마이징

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/Popper/ (총 841줄)
Popper.tsx (305줄) - MUI Theme 통합 레이어
  └─> PopperRoot (styled BasePopper)
      └─> BasePopper.tsx (536줄) - 핵심 로직
          └─> PopperTooltip (내부 컴포넌트)
              ├─ createPopper() - Popper.js 인스턴스 생성
              ├─ Portal - DOM 외부 렌더링
              └─ children (함수 또는 ReactNode)
```

**파일 구조**:
- `Popper.tsx` (305줄) - useDefaultProps, styled wrapper, RTL 처리
- `BasePopper.tsx` (536줄) - Popper.js 통합, Portal, 핵심 로직
- `BasePopper.types.ts` (155줄) - TypeScript 타입 정의
- `popperClasses.ts` (17줄) - 유틸리티 클래스

### 2. 하위 컴포넌트가 담당하는 기능

**PopperTooltip** (BasePopper.tsx 내부, 78-235줄):
- Popper.js 인스턴스 생성 및 생명주기 관리
- anchorEl과 tooltip 요소 간 위치 계산
- placement state 관리 (flip modifier에 의해 동적 변경)
- useSlotProps로 props 병합 및 전달

**Popper** (BasePopper.tsx의 default export, 240-327줄):
- keepMounted, transition 처리
- Portal container 결정
- PopperTooltip 래핑
- 조건부 렌더링 관리

### 3. Popper.js 통합 (BasePopper.tsx 132-209줄)

**createPopper 호출**:
```typescript
const popper = createPopper(resolvedAnchorElement, tooltipRef.current!, {
  placement: rtlPlacement,
  ...popperOptions,
  modifiers: popperModifiers,
});
```

**주요 흐름**:
1. `resolveAnchorEl()`: anchorEl이 함수면 실행하여 실제 요소 가져오기
2. `useEnhancedEffect()`: anchorEl과 open 상태 변경 시 Popper 인스턴스 생성/파괴
3. `flipPlacement()`: RTL 모드일 때 placement 변환 (bottom-end ↔ bottom-start)
4. **기본 modifiers**:
   - `preventOverflow`: 뷰포트 밖으로 나가지 않도록 조정
   - `flip`: 공간 부족 시 반대편으로 위치 변경
   - `onUpdate`: placement 변경 시 state 업데이트
5. cleanup 함수: `popper.destroy()`로 메모리 누수 방지

### 4. flipPlacement 함수 (BasePopper.tsx 28-45줄)

**RTL 지원**:
```typescript
function flipPlacement(placement?: PopperPlacementType, direction?: 'ltr' | 'rtl') {
  if (direction === 'ltr') {
    return placement;
  }

  switch (placement) {
    case 'bottom-end':
      return 'bottom-start';
    case 'bottom-start':
      return 'bottom-end';
    // ... top-end, top-start도 동일
  }
}
```

**동작**:
- direction='rtl'일 때 start ↔ end 변환
- 아랍어/히브리어 등 Right-to-Left 언어 지원
- `useRtl()` hook으로 direction 자동 감지 (Popper.tsx 64줄)

### 5. resolveAnchorEl 함수 (BasePopper.tsx 47-57줄)

**동적 앵커 요소 처리**:
```typescript
function resolveAnchorEl(
  anchorEl: VirtualElement | (() => VirtualElement) | HTMLElement | (() => HTMLElement) | null | undefined
): HTMLElement | VirtualElement | null | undefined {
  return typeof anchorEl === 'function' ? anchorEl() : anchorEl;
}
```

**유스케이스**:
- 함수형 anchorEl: ref가 아직 null일 때 지연 평가
- VirtualElement: 마우스 좌표, 커서 위치 등 가상 위치

### 6. Portal 통합 (BasePopper.tsx 272-327줄)

**container 결정 로직**:
```typescript
const container =
  containerProp ||
  (resolvedAnchorElement && isHTMLElement(resolvedAnchorElement)
    ? ownerDocument(resolvedAnchorElement).body
    : ownerDocument(null).body);
```

**동작**:
1. `containerProp` 있으면 사용
2. 없으면 anchorEl의 document.body 사용
3. Portal을 통해 해당 container에 렌더링

### 7. Transition 지원 (BasePopper.tsx 256-270줄)

**react-transition-group 통합**:
```typescript
const [exited, setExited] = React.useState(true);

const handleEnter = () => {
  setExited(false);
};

const handleExited = () => {
  setExited(true);
};

// TransitionProps 전달
const transitionProps = transition
  ? {
      in: open,
      onEnter: handleEnter,
      onExited: handleExited,
    }
  : undefined;
```

**조건부 렌더링**:
- `keepMounted=false, open=false`: null 반환 (렌더링 안 함)
- `keepMounted=true, open=false`: display: none 적용
- `transition=true`: exited 상태 고려

### 8. useSlotProps (BasePopper.tsx 220-230줄)

**props 병합**:
```typescript
const rootProps: WithOptionalOwnerState<PopperRootSlotProps> = useSlotProps({
  elementType: Root,
  externalSlotProps: slotProps.root,
  externalForwardedProps: other,
  additionalProps: {
    role: 'tooltip',
    ref: ownRef,
  },
  ownerState: props,
  className: classes.root,
});
```

**기능**:
- `slotProps.root` (사용자 커스텀) 병합
- `externalForwardedProps` (나머지 props) 병합
- `additionalProps` (기본 props) 병합
- 함수형 slotProps 지원 (`(ownerState) => ({ ... })`)

### 9. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `anchorEl` | HTMLElement \| VirtualElement \| Function | - | 위치 기준 요소 (필수 아님) |
| `children` | ReactNode \| Function | - | 팝업 콘텐츠 또는 render function |
| `open` | boolean | - | 표시 여부 (필수) |
| `placement` | string | 'bottom' | 위치 (top, bottom, left, right + start/end) |
| `modifiers` | Modifier[] | - | Popper.js modifiers |
| `popperOptions` | object | {} | Popper.js options |
| `popperRef` | Ref | - | Popper.js 인스턴스 ref |
| `container` | HTMLElement \| Function | - | Portal 컨테이너 |
| `disablePortal` | boolean | false | Portal 비활성화 |
| `keepMounted` | boolean | false | DOM에 항상 유지 |
| `transition` | boolean | false | Transition 지원 |
| `component` | ElementType | - | 루트 컴포넌트 |
| `slots` | {root?} | {} | Slot 컴포넌트 |
| `slotProps` | {root?} | {} | Slot props |
| `components` | {Root?} | {} | deprecated (→ slots) |
| `componentsProps` | {root?} | {} | deprecated (→ slotProps) |
| `sx` | SxProps | - | 시스템 스타일 |

### 10. Ref 관리 (BasePopper.tsx 99-108줄)

**4개 레벨의 ref**:
```typescript
const tooltipRef = React.useRef<HTMLElement>(null);           // (1) 실제 DOM 요소
const ownRef = useForkRef(tooltipRef, forwardedRef);          // (2) forwardedRef 병합
const popperRef = React.useRef<Instance>(null);               // (3) Popper.js 인스턴스
const handlePopperRef = useForkRef(popperRef, popperRefProp); // (4) 사용자 popperRef 병합
const handlePopperRefRef = React.useRef(handlePopperRef);     // (5) ref의 ref (최신화)

useEnhancedEffect(() => {
  handlePopperRefRef.current = handlePopperRef;
}, [handlePopperRef]);

React.useImperativeHandle(popperRefProp, () => popperRef.current!, []);
```

**이유**:
- `tooltipRef`: createPopper에 전달할 실제 DOM 요소
- `ownRef`: 외부 ref와 병합
- `popperRef`: Popper.js 인스턴스 저장 (forceUpdate, destroy 호출용)
- `handlePopperRefRef`: cleanup 함수에서 최신 ref 참조

---

## 설계 패턴

1. **Popper.js 라이브러리 통합**
   - createPopper() 함수로 인스턴스 생성
   - useEnhancedEffect에서 생명주기 관리
   - cleanup 함수로 popper.destroy()
   - modifiers 시스템으로 위치 조정 로직 플러그인화

2. **Portal 패턴**
   - document.body (또는 커스텀 container)에 렌더링
   - 부모 DOM 계층에서 벗어나 z-index 문제 해결
   - container 자동 결정 로직

3. **Slot 시스템**
   - `slots.root`로 루트 컴포넌트 교체
   - `slotProps.root`로 props 커스터마이징
   - useSlotProps로 props 병합
   - 레거시 components/componentsProps 지원

4. **Polymorphic Component**
   - `component` prop으로 루트 요소 변경
   - TypeScript 제네릭으로 타입 안전성
   - PolymorphicComponent 타입

5. **RTL 지원**
   - useRtl() hook으로 direction 감지
   - flipPlacement() 함수로 placement 변환
   - start ↔ end 자동 전환

6. **Transition 통합**
   - react-transition-group 지원
   - TransitionProps 전달
   - exited 상태 관리
   - handleEnter, handleExited 콜백

7. **VirtualElement 지원**
   - Popper.js의 VirtualElement 타입 지원
   - getBoundingClientRect() 메서드 구현 필요
   - 마우스 좌표, 커서 위치 등 활용

8. **Theme 시스템**
   - useDefaultProps로 테마 기본값 적용
   - styled() API로 PopperRoot 래퍼
   - useUtilityClasses로 CSS 클래스 생성
   - sx prop 지원

---

## 복잡도의 이유

Popper는 **841줄**이며, MUI 컴포넌트 중 가장 복잡한 편입니다. 복잡한 이유는:

1. **Popper.js 라이브러리 통합** (약 150줄)
   - createPopper() 인스턴스 생성 및 관리
   - modifiers 배열 구성 (preventOverflow, flip, onUpdate 등)
   - placement state 동적 변경 처리
   - cleanup 함수로 메모리 누수 방지
   - anchorEl, tooltipRef 동기화

2. **Portal 렌더링** (약 80줄)
   - container 결정 로직 (containerProp || anchorEl.body || document.body)
   - Portal 컴포넌트 래핑
   - disablePortal 옵션 처리
   - Portal vs 일반 렌더링 분기

3. **Transition 지원** (약 60줄)
   - exited state 관리
   - handleEnter, handleExited 콜백
   - TransitionProps 계산 및 전달
   - 조건부 렌더링 (transition, keepMounted, open 조합)

4. **RTL 지원** (약 50줄)
   - flipPlacement() 함수 (start ↔ end 변환)
   - useRtl() hook 통합
   - direction prop 전달
   - rtlPlacement 계산

5. **VirtualElement 지원** (약 40줄)
   - resolveAnchorEl() 함수 (함수형 anchorEl 처리)
   - isHTMLElement(), isVirtualElement() 헬퍼 함수
   - VirtualElement 타입 정의 및 import
   - anchorEl 유효성 검증 (개발 모드)

6. **다중 Ref 관리** (약 40줄)
   - tooltipRef, ownRef, popperRef, handlePopperRef, handlePopperRefRef
   - useForkRef로 ref 병합
   - useImperativeHandle로 외부 노출
   - handlePopperRefRef로 최신 ref 참조 보장

7. **Slot 시스템** (약 60줄)
   - slots.root 처리
   - slotProps.root 병합
   - useSlotProps() 호출
   - 레거시 components/componentsProps 지원
   - RootComponent 선택 로직

8. **PropTypes** (약 390줄 = Popper.tsx 188줄 + BasePopper.tsx 202줄)
   - 런타임 타입 검증
   - placement 14가지 enum 값
   - modifiers 배열 상세 검증 (phase enum, requires 등)
   - anchorEl chainPropTypes (HTMLElement, VirtualElement, Function)
   - popperOptions shape 검증

9. **Theme 통합** (약 50줄)
   - useDefaultProps (DefaultPropsProvider)
   - styled() API (PopperRoot)
   - useUtilityClasses + composeClasses
   - sx prop 지원

10. **개발 모드 검증** (약 30줄)
    - anchorEl 유효성 체크 (getBoundingClientRect 0,0,0,0 경고)
    - process.env.NODE_ENV !== 'production' 조건

11. **Polymorphic Component** (약 30줄)
    - component prop 처리
    - TypeScript 제네릭 파라미터
    - PolymorphicComponent 타입 캐스팅

---

## 비교: Popper vs Tooltip

Material-UI에서 Popper는 Tooltip, Menu, Autocomplete의 기반이 됩니다.

| 기능 | Popper | Tooltip |
|------|-------|---------|
| **목적** | 위치 지정 유틸리티 | 설명 팝업 |
| **Popper 사용** | - (자체 구현) | ✅ 내부적으로 Popper 사용 |
| **스타일** | ❌ 없음 | ✅ 배경, 패딩, 화살표 |
| **Trigger** | 수동 (open prop) | 자동 (hover, focus) |
| **Arrow** | ❌ | ✅ |
| **Transition** | 옵션 | 기본 포함 |
| **복잡도** | 841줄 | ~600줄 |

**핵심 차이점**:
- Popper는 "위치만 잡아주는" 저수준 유틸리티
- Tooltip은 Popper + 스타일 + 인터랙션
- Menu, Autocomplete도 Popper 기반

---

## Popper.js 라이브러리

Popper는 @popperjs/core 라이브러리에 의존합니다.

### 주요 개념

**placement**:
- top, top-start, top-end
- bottom, bottom-start, bottom-end
- left, left-start, left-end
- right, right-start, right-end
- auto, auto-start, auto-end (자동 결정)

**modifiers**:
- preventOverflow: 뷰포트 밖으로 나가지 않도록 조정
- flip: 공간 부족 시 반대편으로 위치 변경
- offset: 거리 조정
- arrow: 화살표 위치 계산
- hide: 앵커가 안 보일 때 숨김

**strategy**:
- absolute (기본): position: absolute
- fixed: position: fixed

### createPopper 사용법

```javascript
const popper = createPopper(referenceElement, popperElement, {
  placement: 'bottom',
  modifiers: [
    {
      name: 'preventOverflow',
      options: { boundary: 'viewport' },
    },
    {
      name: 'offset',
      options: { offset: [0, 8] },
    },
  ],
});

// 업데이트
popper.update();

// 강제 업데이트
popper.forceUpdate();

// 파괴
popper.destroy();
```

---

## 사용 사례

Popper는 직접 사용되기보다는 다른 컴포넌트의 기반으로 사용됩니다:

1. **Tooltip** - 설명 팝업
2. **Menu** - 드롭다운 메뉴
3. **Autocomplete** - 자동완성 드롭다운
4. **Select** - 옵션 드롭다운
5. **Popover** - 일반 팝오버

**직접 사용 예시**:
```jsx
const [anchorEl, setAnchorEl] = React.useState(null);
const open = Boolean(anchorEl);

<Button onClick={(e) => setAnchorEl(e.currentTarget)}>
  Open Popper
</Button>

<Popper open={open} anchorEl={anchorEl}>
  <Paper>Popper Content</Paper>
</Popper>
```
