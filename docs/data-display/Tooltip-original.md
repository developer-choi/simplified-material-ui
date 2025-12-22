# Tooltip 컴포넌트

> Material-UI의 Tooltip 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

Tooltip은 **사용자가 요소에 호버, 포커스, 터치할 때 설명 텍스트를 팝업으로 표시**하는 컴포넌트입니다.

### 핵심 기능
1. **멀티 이벤트 감지** - 마우스 호버, 키보드 포커스, 터치(long-press) 세 가지 방식 모두 지원
2. **정밀한 위치 지정** - Popper.js를 이용해 15가지 placement 중 최적 위치 자동 계산
3. **타이밍 제어** - 5개 타이머로 표시/숨김 딜레이, hysteresis(빠른 전환), 터치 딜레이 관리
4. **접근성** - ARIA 속성, focus-visible, Escape 키 지원
5. **커스터마이징** - Slot 시스템으로 Popper, Transition, Tooltip, Arrow 각각 교체 가능

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/Tooltip/Tooltip.js (999줄)
React.Fragment
  ├─> React.cloneElement(children, childrenProps)  // 이벤트 핸들러 주입
  │     └─> onMouseOver, onMouseLeave, onFocus, onBlur, onTouchStart, onTouchEnd
  │
  └─> PopperSlot (TooltipPopper)                   // 위치 계산 컨테이너
        └─> TransitionSlot (Grow)                  // 애니메이션
              └─> TooltipSlot (TooltipTooltip)     // 실제 Tooltip 박스
                    ├─> {title}                    // 텍스트 내용
                    └─> ArrowSlot (TooltipArrow)   // 화살표 (선택)
```

### 2. 주요 Styled Components

#### TooltipPopper (라인 45-146)
- **역할**: Popper의 래퍼로 z-index, pointer-events 제어
- **핵심 스타일**:
  ```javascript
  zIndex: theme.zIndex.tooltip,  // 1500
  pointerEvents: 'none',         // 기본값
  pointerEvents: 'auto',         // disableInteractive=false일 때
  ```
- **variants**: arrow 위치 조정 (top/bottom/left/right × RTL)

#### TooltipTooltip (라인 148-268)
- **역할**: Tooltip 박스의 시각적 스타일
- **핵심 스타일**:
  ```javascript
  backgroundColor: alpha(grey[700], 0.92),
  color: 'white',
  padding: '4px 8px',
  fontSize: '11px',
  maxWidth: 300,
  borderRadius: theme.shape.borderRadius,
  ```
- **variants**: placement별 margin, touch별 padding

#### TooltipArrow (라인 270-291)
- **역할**: 화살표 표시 (45도 회전 정사각형)
- **구현**: `::before` 의사 요소를 45도 회전

### 3. 이벤트 핸들링

```javascript
// 마우스 호버
handleMouseOver() → enterTimer.start(enterDelay) → handleOpen()
handleMouseLeave() → leaveTimer.start(leaveDelay) → handleClose()

// 포커스
handleFocus() → isFocusVisible 체크 → handleMouseOver()
handleBlur() → handleMouseLeave()

// 터치
handleTouchStart() → touchTimer.start(enterTouchDelay) → handleMouseOver()
handleTouchEnd() → leaveTimer.start(leaveTouchDelay) → handleClose()

// Escape 키
useEffect(() => document.addEventListener('keydown', ...))
```

### 4. 타이머 시스템 (5개)

| 타이머 | 용도 | 기본 딜레이 |
|--------|------|-------------|
| **enterTimer** | 호버 후 표시 대기 | 100ms (enterDelay) |
| **leaveTimer** | 마우스 떠난 후 숨김 대기 | 0ms (leaveDelay) |
| **touchTimer** | 터치 유지 후 표시 | 700ms (enterTouchDelay) |
| **closeTimer** | 닫힌 후 cleanup | theme.transitions.duration.shortest |
| **hystersisTimer** | 빠른 전환 시 재표시 | 800ms + leaveDelay |

**Hysteresis 메커니즘**:
```javascript
let hystersisOpen = false;          // 전역 상태
const hystersisTimer = new Timeout();

// Tooltip 닫힐 때
handleClose() → hystersisTimer.start(800 + leaveDelay) → hystersisOpen = false

// 다른 Tooltip 열릴 때
if (hystersisOpen) {
  enterTimer.start(enterNextDelay);  // 0ms (빠름)
} else {
  enterTimer.start(enterDelay);      // 100ms (일반)
}
```

### 5. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `title` | node | - | **필수**. Tooltip에 표시할 내용 |
| `children` | element | - | **필수**. Tooltip을 붙일 대상 요소 |
| `placement` | enum | 'bottom' | 15가지 위치 중 선택 |
| `arrow` | bool | false | 화살표 표시 여부 |
| `enterDelay` | number | 100 | 호버 후 표시 딜레이 (ms) |
| `leaveDelay` | number | 0 | 마우스 떠난 후 숨김 딜레이 (ms) |
| `enterNextDelay` | number | 0 | hysteresis 시 표시 딜레이 |
| `enterTouchDelay` | number | 700 | 터치 유지 시간 (ms) |
| `leaveTouchDelay` | number | 1500 | 터치 종료 후 숨김 딜레이 (ms) |
| `followCursor` | bool | false | 마우스 커서 따라다니기 |
| `disableHoverListener` | bool | false | 호버 이벤트 비활성화 |
| `disableFocusListener` | bool | false | 포커스 이벤트 비활성화 |
| `disableTouchListener` | bool | false | 터치 이벤트 비활성화 |
| `disableInteractive` | bool | false | Tooltip 호버 시 닫기 |
| `open` | bool | undefined | 제어 컴포넌트 모드 |
| `onOpen` | func | - | 열림 콜백 |
| `onClose` | func | - | 닫힘 콜백 |
| `describeChild` | bool | false | ARIA: describedby vs label |
| `slots` | object | {} | 슬롯 시스템 (v5) |
| `slotProps` | object | {} | 슬롯별 props |
| `PopperComponent` | elementType | Popper | Popper 교체 (deprecated) |
| `PopperProps` | object | {} | Popper props (deprecated) |
| `TransitionComponent` | elementType | Grow | Transition 교체 (deprecated) |
| `TransitionProps` | object | {} | Transition props (deprecated) |

### 6. Popper.js 통합

**Modifiers 구성**:
```javascript
const popperOptions = {
  modifiers: [
    {
      name: 'arrow',
      enabled: Boolean(arrowRef),
      options: { element: arrowRef, padding: 4 }
    },
    ...PopperProps.popperOptions.modifiers,      // 사용자 modifiers
    ...slotProps.popper.popperOptions.modifiers, // 슬롯 modifiers
  ]
};
```

**anchorEl 계산**:
```javascript
// 일반: 자식 요소
anchorEl={childNode}

// followCursor: 마우스 위치
anchorEl={{
  getBoundingClientRect: () => ({
    top: cursorPosition.y,
    left: cursorPosition.x,
    right: cursorPosition.x,
    bottom: cursorPosition.y,
    width: 0,
    height: 0,
  })
}}
```

### 7. 접근성 (ARIA)

```javascript
// describeChild = false (기본)
if (titleIsString) {
  childrenProps['aria-label'] = title;           // 라벨로 사용
} else {
  childrenProps['aria-labelledby'] = open ? id : null;
}

// describeChild = true
childrenProps['title'] = !open && titleIsString ? title : null;
childrenProps['aria-describedby'] = open ? id : null;
```

**Focus-visible 감지**:
```javascript
import isFocusVisible from '@mui/utils/isFocusVisible';

const handleFocus = (event) => {
  if (isFocusVisible(event.target)) {  // 키보드 네비게이션인지 확인
    setChildIsFocusVisible(true);
    handleMouseOver(event);
  }
};
```

### 8. RTL 지원

```javascript
const isRtl = useRtl();  // theme.direction === 'rtl'

// 화살표 위치 조정
{
  props: ({ ownerState }) => ownerState.arrow && !ownerState.isRtl,
  style: {
    [`&[data-popper-placement*="right"] .${tooltipClasses.arrow}`]: {
      left: 0,
      marginLeft: '-0.71em',
    },
  },
},
{
  props: ({ ownerState }) => ownerState.arrow && !!ownerState.isRtl,
  style: {
    [`&[data-popper-placement*="right"] .${tooltipClasses.arrow}`]: {
      right: 0,
      marginRight: '-0.71em',
    },
  },
}
```

---

## 설계 패턴

### 1. **Slot Pattern** (Material-UI v5)
4개의 슬롯으로 각 부분을 교체 가능:
```javascript
slots={{
  popper: CustomPopper,      // 위치 계산 컨테이너
  transition: CustomFade,    // 애니메이션
  tooltip: CustomDiv,        // Tooltip 박스
  arrow: CustomArrow,        // 화살표
}}

slotProps={{
  popper: { modifiers: [...] },
  transition: { timeout: 300 },
  tooltip: { className: '...' },
  arrow: { className: '...' }
}}
```

`useSlot()` 훅으로 슬롯 해결:
- `slots.popper` 우선 → `components.Popper` (deprecated) → 기본 `TooltipPopper`

### 2. **Render Props Pattern**
```javascript
<PopperSlot>
  {({ TransitionProps }) => (
    <TransitionSlot {...TransitionProps}>
      <TooltipSlot>...</TooltipSlot>
    </TransitionSlot>
  )}
</PopperSlot>
```

### 3. **Compound Component Pattern**
```javascript
React.cloneElement(children, {
  onMouseOver: composeEventHandler(handleMouseOver, children.props.onMouseOver),
  onMouseLeave: composeEventHandler(handleMouseLeave, children.props.onMouseLeave),
  ref: useForkRef(getReactElementRef(children), setChildNode, ref),
});
```
- 자식 요소의 기존 핸들러 보존
- Tooltip 핸들러 추가
- ref 병합

### 4. **제어/비제어 컴포넌트 패턴**
```javascript
const [openState, setOpenState] = useControlled({
  controlled: openProp,       // 제어: open prop 제공 시
  default: false,             // 비제어: 내부 state
  name: 'Tooltip',
  state: 'open',
});
```

---

## 복잡도의 이유

Tooltip은 **999줄** (PropTypes 200줄 포함)이며, 복잡한 이유는:

### 1. **Popper.js 통합** (약 150줄)
- Popper import 및 TooltipPopper styled component (100줄)
- popperOptions 계산 및 병합 (30줄)
- anchorEl 조건부 계산 (followCursor 지원)
- placement 15가지 지원 → Popper가 자동 계산

### 2. **5개 타이머 시스템** (약 100줄)
- enterTimer, leaveTimer, touchTimer, closeTimer, hystersisTimer
- 각 타이머마다 start/clear 로직
- hysteresis 전역 상태 관리
- 타이머 충돌 방지 로직

### 3. **멀티 이벤트 처리** (약 150줄)
- **Hover**: handleMouseOver, handleMouseLeave
- **Focus**: handleFocus, handleBlur, isFocusVisible
- **Touch**: handleTouchStart, handleTouchEnd, detectTouchStart, stopTouchInteraction
- **Keyboard**: Escape 키 리스너
- **composeEventHandler**: 자식 핸들러 병합

### 4. **Slot 시스템** (약 80줄)
- useSlot() 4번 호출
- externalForwardedProps 객체 생성
- slots + slotProps + components + componentsProps 병행 지원
- 각 슬롯별 props 병합 로직

### 5. **Styled Components** (약 200줄)
- TooltipPopper: variants 10개 (arrow × RTL)
- TooltipTooltip: variants 12개 (placement × touch × RTL)
- TooltipArrow: 화살표 스타일
- overridesResolver로 테마 오버라이드 지원

### 6. **Theme 통합** (약 50줄)
- useDefaultProps: 테마 기본값 적용
- useUtilityClasses: 조건부 클래스 생성
- composeClasses: 클래스 병합
- memoTheme: 테마 메모이제이션
- theme.zIndex, theme.transitions 참조

### 7. **접근성** (약 60줄)
- describeChild에 따른 ARIA 속성 분기
- isFocusVisible로 키보드 네비게이션 감지
- Escape 키 리스너
- disabled button 경고

### 8. **RTL 지원** (약 40줄)
- useRtl() 훅
- isRtl ownerState
- 화살표 및 margin 조건부 스타일

### 9. **PropTypes** (200줄)
- 모든 props 런타임 타입 검증
- JSDoc 주석
- elementAcceptingRef 검증

### 10. **개발 모드 경고** (약 50줄)
- disabled button 경고
- children props 전달 검증
- children.props.title 중복 경고
- 제어/비제어 전환 경고

---

## 비교: Tooltip vs HTML title 속성

| 기능 | Material-UI Tooltip | HTML title |
|------|---------------------|------------|
| **스타일링** | 완전 커스터마이징 가능 | 브라우저 기본 스타일 (변경 불가) |
| **위치** | 15가지 정밀 제어 | 마우스 근처 (브라우저 결정) |
| **표시 딜레이** | 100ms (커스터마이징 가능) | 약 1초 (브라우저 결정) |
| **터치** | Long-press 지원 (700ms) | 지원 안 함 |
| **포커스** | 키보드 네비게이션 지원 | 지원 안 함 |
| **애니메이션** | Grow transition | 없음 (즉시 표시) |
| **접근성** | ARIA 속성 완벽 지원 | 기본 지원 |
| **Rich content** | React 노드 (이미지 등) | 텍스트만 |
| **복잡도** | 999줄 | 1줄 (`<div title="...">`) |
| **번들 크기** | ~10KB (Popper 포함) | 0KB |
