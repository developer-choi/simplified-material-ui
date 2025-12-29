# Collapse 컴포넌트

> Material-UI의 Collapse 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

Collapse는 **콘텐츠를 접거나 펼치는 애니메이션을 제공하는** 컴포넌트입니다.

### 핵심 기능
1. **높이/너비 애니메이션** - `0px` (또는 collapsedSize) ↔ `auto` 간 부드러운 전환
2. **방향 지원** - vertical(높이 애니메이션) 또는 horizontal(너비 애니메이션)
3. **자동 Duration 계산** - 콘텐츠 크기에 따라 최적의 애니메이션 속도 계산
4. **Lifecycle 콜백** - 애니메이션의 6단계(Enter/Entering/Entered/Exit/Exiting/Exited)에서 커스텀 로직 실행
5. **부분 접기 지원** - collapsedSize로 완전히 숨기지 않고 일부만 보이도록 설정 가능

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/Collapse/Collapse.js (502줄)
Transition (from react-transition-group)
  └─> CollapseRoot (styled div)
       └─> CollapseWrapper (styled div)
            └─> CollapseWrapperInner (styled div)
                 └─> {children}
```

### 2. 3개의 Styled Components

**CollapseRoot** (lines 32-91)
```javascript
const CollapseRoot = styled('div', {
  name: 'MuiCollapse',
  slot: 'Root',
  overridesResolver: (props, styles) => { /* ... */ },
})(
  memoTheme(({ theme }) => ({
    height: 0,
    overflow: 'hidden',
    transition: theme.transitions.create('height'),
    variants: [
      // horizontal: width 기반 애니메이션
      { props: { orientation: 'horizontal' }, style: { height: 'auto', width: 0, transition: theme.transitions.create('width') } },
      // entered: 자동 크기로 전환
      { props: { state: 'entered' }, style: { height: 'auto', overflow: 'visible' } },
      // hidden: 완전히 숨김
      { props: ({ ownerState }) => ownerState.state === 'exited' && !ownerState.in && ownerState.collapsedSize === '0px', style: { visibility: 'hidden' } },
    ],
  })),
);
```

**역할**:
- 애니메이션의 주체 (height 또는 width transition)
- overflow 제어 (애니메이션 중에는 hidden, 완료 후에는 visible)
- entered 상태일 때 `auto` 크기로 전환 (자식 크기에 맞춤)
- exited + collapsedSize='0px'일 때 `visibility: hidden` 적용

**CollapseWrapper** (lines 93-111)
```javascript
const CollapseWrapper = styled('div', {
  name: 'MuiCollapse',
  slot: 'Wrapper',
})({
  display: 'flex',
  width: '100%',
  variants: [
    { props: { orientation: 'horizontal' }, style: { width: 'auto', height: '100%' } },
  ],
});
```

**역할**:
- `display: flex` - **자식의 negative margin을 올바르게 계산하기 위한 hack** (주석 참고)
- vertical: width 100% 고정
- horizontal: height 100% 고정

**CollapseWrapperInner** (lines 113-129)
```javascript
const CollapseWrapperInner = styled('div', {
  name: 'MuiCollapse',
  slot: 'WrapperInner',
})({
  width: '100%',
  variants: [
    { props: { orientation: 'horizontal' }, style: { width: 'auto', height: '100%' } },
  ],
});
```

**역할**:
- 실제 children을 감싸는 최종 컨테이너
- vertical: width 100% 고정
- horizontal: height 100% 고정

### 3. react-transition-group 통합

Collapse는 `<Transition>` 컴포넌트를 래핑하여 상태 머신을 사용합니다 (lines 334-368).

**Transition의 6가지 상태**:
1. **exited** - 완전히 접힌 상태
2. **entering** - 펼쳐지기 시작 (높이 0px → 목표 높이)
3. **entered** - 완전히 펼쳐진 상태 (높이 auto)
4. **exiting** - 접히기 시작 (높이 목표 높이 → 0px)
5. **exited** - 다시 접힌 상태
6. **unmounted** - 마운트 해제

**Render Props 패턴**:
```javascript
<TransitionComponent {...props}>
  {(state, { ownerState: incomingOwnerState, ...restChildProps }) => {
    const stateOwnerState = { ...ownerState, state };
    return (
      <RootSlot
        className={clsx(rootSlotProps.className, {
          [classes.entered]: state === 'entered',
          [classes.hidden]: state === 'exited' && !inProp && collapsedSize === '0px',
        })}
        ownerState={stateOwnerState}
        {...restChildProps}
      >
        {/* ... */}
      </RootSlot>
    );
  }}
</TransitionComponent>
```

Transition 컴포넌트는 children으로 함수를 받아 현재 상태(`state`)를 주입합니다.

### 4. Lifecycle 콜백과 애니메이션 오케스트레이션

Collapse는 6개의 lifecycle 콜백을 제공합니다. 각 단계에서 DOM을 직접 조작하여 애니메이션을 구현합니다.

**handleEnter** (lines 198-208):
```javascript
const handleEnter = normalizedTransitionCallback((node, isAppearing) => {
  if (wrapperRef.current && isHorizontal) {
    // horizontal일 때 크기 측정을 위해 position: absolute 설정
    wrapperRef.current.style.position = 'absolute';
  }
  node.style[size] = collapsedSize;  // 시작 크기 설정 (보통 '0px')

  if (onEnter) {
    onEnter(node, isAppearing);
  }
});
```

**handleEntering** (lines 210-240):
```javascript
const handleEntering = normalizedTransitionCallback((node, isAppearing) => {
  const wrapperSize = getWrapperSize();  // 실제 콘텐츠 크기 측정

  if (wrapperRef.current && isHorizontal) {
    wrapperRef.current.style.position = '';  // position 리셋
  }

  const { duration: transitionDuration, easing: transitionTimingFunction } = getTransitionProps(
    { style, timeout, easing },
    { mode: 'enter' },
  );

  // timeout='auto'일 때 자동 duration 계산
  if (timeout === 'auto') {
    const duration2 = theme.transitions.getAutoHeightDuration(wrapperSize);
    node.style.transitionDuration = `${duration2}ms`;
    autoTransitionDuration.current = duration2;
  } else {
    node.style.transitionDuration = typeof transitionDuration === 'string' ? transitionDuration : `${transitionDuration}ms`;
  }

  node.style[size] = `${wrapperSize}px`;  // 목표 크기 설정 → 애니메이션 시작
  node.style.transitionTimingFunction = transitionTimingFunction;

  if (onEntering) {
    onEntering(node, isAppearing);
  }
});
```

**handleEntered** (lines 242-248):
```javascript
const handleEntered = normalizedTransitionCallback((node, isAppearing) => {
  node.style[size] = 'auto';  // auto로 전환 (자식 크기 변경에 대응)

  if (onEntered) {
    onEntered(node, isAppearing);
  }
});
```

**handleExit** (lines 250-256):
```javascript
const handleExit = normalizedTransitionCallback((node) => {
  node.style[size] = `${getWrapperSize()}px`;  // 현재 크기를 명시적으로 설정 (auto → px)

  if (onExit) {
    onExit(node);
  }
});
```

**handleExiting** (lines 260-286):
```javascript
const handleExiting = normalizedTransitionCallback((node) => {
  const wrapperSize = getWrapperSize();
  const { duration: transitionDuration, easing: transitionTimingFunction } = getTransitionProps(
    { style, timeout, easing },
    { mode: 'exit' },
  );

  // timeout='auto'일 때 자동 duration 계산
  if (timeout === 'auto') {
    const duration2 = theme.transitions.getAutoHeightDuration(wrapperSize);
    node.style.transitionDuration = `${duration2}ms`;
    autoTransitionDuration.current = duration2;
  } else {
    node.style.transitionDuration = typeof transitionDuration === 'string' ? transitionDuration : `${transitionDuration}ms`;
  }

  node.style[size] = collapsedSize;  // 목표 크기 설정 (보통 '0px') → 애니메이션 시작
  node.style.transitionTimingFunction = transitionTimingFunction;

  if (onExiting) {
    onExiting(node);
  }
});
```

**handleExited** (line 258):
```javascript
const handleExited = normalizedTransitionCallback(onExited);
```

**normalizedTransitionCallback** (lines 182-193):
```javascript
const normalizedTransitionCallback = (callback) => (maybeIsAppearing) => {
  if (callback) {
    const node = nodeRef.current;

    // onEnterXxx와 onExitXxx는 인자 개수가 다름
    if (maybeIsAppearing === undefined) {
      callback(node);  // onExit, onExited: 1개 인자
    } else {
      callback(node, maybeIsAppearing);  // onEnter, onEntering, onEntered: 2개 인자
    }
  }
};
```

**역할**:
- react-transition-group의 콜백과 MUI의 콜백 시그니처를 통일
- nodeRef를 사용하여 첫 번째 인자로 node 전달

### 5. 'auto' Timeout과 자동 Duration 계산

`timeout='auto'`를 사용하면 콘텐츠 크기에 따라 최적의 애니메이션 duration을 자동으로 계산합니다.

**계산 로직** (handleEntering, handleExiting에서 호출):
```javascript
if (timeout === 'auto') {
  const duration2 = theme.transitions.getAutoHeightDuration(wrapperSize);
  node.style.transitionDuration = `${duration2}ms`;
  autoTransitionDuration.current = duration2;
}
```

**getAutoHeightDuration 공식** (packages/mui-material/src/styles/createTransitions.js):
```javascript
// constant = height / 36
// duration = Math.min(Math.round((4 + 15 * constant^0.25 + constant / 5) * 10), 3000)
```

**예시**:
- height=0px → ~100ms
- height=100px → ~250ms
- height=300px → ~400ms
- height=1000px → ~800ms
- height=10000px → 3000ms (최대값)

**handleAddEndListener** (lines 288-296):
```javascript
const handleAddEndListener = (next) => {
  if (timeout === 'auto') {
    timer.start(autoTransitionDuration.current || 0, next);  // useTimeout 훅 사용
  }
  if (addEndListener) {
    addEndListener(nodeRef.current, next);
  }
};
```

**역할**:
- timeout='auto'일 때 timer를 수동으로 시작 (Transition 컴포넌트는 timeout=null을 받음)
- 사용자 정의 addEndListener 콜백 실행

### 6. Slot 시스템

Collapse는 3개의 슬롯(root, wrapper, wrapperInner)을 커스터마이징할 수 있습니다.

**useSlot 훅 사용** (lines 304-331):
```javascript
const externalForwardedProps = {
  slots,
  slotProps,
  component,
};

const [RootSlot, rootSlotProps] = useSlot('root', {
  ref: handleRef,
  className: clsx(classes.root, className),
  elementType: CollapseRoot,
  externalForwardedProps,
  ownerState,
  additionalProps: {
    style: {
      [isHorizontal ? 'minWidth' : 'minHeight']: collapsedSize,
      ...style,
    },
  },
});

const [WrapperSlot, wrapperSlotProps] = useSlot('wrapper', {
  ref: wrapperRef,
  className: classes.wrapper,
  elementType: CollapseWrapper,
  externalForwardedProps,
  ownerState,
});

const [WrapperInnerSlot, wrapperInnerSlotProps] = useSlot('wrapperInner', {
  className: classes.wrapperInner,
  elementType: CollapseWrapperInner,
  externalForwardedProps,
  ownerState,
});
```

**사용 예시**:
```javascript
<Collapse
  slots={{
    root: 'section',
    wrapper: CustomWrapper,
    wrapperInner: 'article',
  }}
  slotProps={{
    root: { id: 'collapse-root' },
    wrapper: { elevation: 2 },
  }}
>
  {content}
</Collapse>
```

### 7. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `in` | boolean | - | true일 때 펼쳐짐 |
| `timeout` | number \| 'auto' \| object | `duration.standard` (300) | 애니메이션 지속 시간 (ms) 또는 'auto' |
| `orientation` | 'horizontal' \| 'vertical' | 'vertical' | 애니메이션 방향 |
| `collapsedSize` | number \| string | '0px' | 접힌 상태의 크기 |
| `easing` | string \| object | - | CSS easing 함수 (예: 'ease-in-out') |
| `component` | elementType | 'div' | 루트 엘리먼트 타입 |
| `slots` | object | {} | 커스텀 컴포넌트 (root, wrapper, wrapperInner) |
| `slotProps` | object | {} | 각 슬롯의 props |
| `onEnter` | func | - | 애니메이션 시작 전 콜백 |
| `onEntering` | func | - | 애니메이션 시작 시 콜백 |
| `onEntered` | func | - | 애니메이션 완료 후 콜백 |
| `onExit` | func | - | 닫기 애니메이션 시작 전 콜백 |
| `onExiting` | func | - | 닫기 애니메이션 시작 시 콜백 |
| `onExited` | func | - | 닫기 애니메이션 완료 후 콜백 |
| `addEndListener` | func | - | 커스텀 transition end 감지 |
| `children` | node | - | 접거나 펼칠 콘텐츠 |
| `className` | string | - | 루트 엘리먼트의 className |
| `classes` | object | - | 슬롯별 스타일 오버라이드 |
| `sx` | object \| func \| array | - | 시스템 스타일링 |
| `style` | object | - | 인라인 스타일 |

**timeout 상세**:
```javascript
// 단일 값
timeout={300}

// auto (콘텐츠 크기 기반)
timeout="auto"

// 각 페이즈별 지정
timeout={{
  appear: 500,
  enter: 300,
  exit: 200,
}}
```

**easing 상세**:
```javascript
// 단일 값
easing="ease-in-out"

// enter/exit 별도 지정
easing={{
  enter: 'ease-in',
  exit: 'ease-out',
}}
```

### 8. Horizontal Orientation의 특수 처리

horizontal 모드에서는 크기 측정을 위한 특별한 처리가 필요합니다 (lines 199-202, 213-216).

**문제**:
- `width: 0`일 때 내부 콘텐츠의 실제 너비를 측정할 수 없음
- `display: none`도 아니고 `overflow: hidden`이기 때문

**해결책**:
```javascript
// handleEnter에서
if (wrapperRef.current && isHorizontal) {
  wrapperRef.current.style.position = 'absolute';  // 레이아웃에서 제거
}

// handleEntering에서 (크기 측정 후)
if (wrapperRef.current && isHorizontal) {
  wrapperRef.current.style.position = '';  // 원래대로 복구
}
```

**역할**:
- 잠깐 `position: absolute`로 설정하여 width 제약 없이 실제 콘텐츠 너비 측정
- 측정 후 바로 원래 상태로 복구

---

## 설계 패턴

1. **Render Props 패턴**
   - react-transition-group의 `<Transition>`이 children으로 함수를 받음
   - 현재 상태(`state`)를 함수 인자로 주입
   - 상태에 따라 조건부 클래스 이름 적용

2. **Wrapper 패턴**
   - 3개의 중첩된 div로 구조화
   - **Wrapper의 역할**: negative margin을 가진 자식 요소의 크기를 올바르게 계산
   - `display: flex`가 이 문제를 해결하는 핵심

3. **Slot 시스템**
   - `useSlot` 훅으로 3개의 슬롯 관리
   - 사용자가 커스텀 컴포넌트로 교체 가능
   - slotProps로 각 슬롯에 추가 props 전달

4. **Controlled Animation**
   - react-transition-group이 상태 머신 제공
   - Collapse가 각 lifecycle 단계에서 DOM을 직접 조작
   - `style[size]`를 동적으로 변경하여 애니메이션 트리거

5. **Theme Integration**
   - `useTheme()` 훅으로 테마 접근
   - `theme.transitions.create()` - CSS transition 문자열 생성
   - `theme.transitions.getAutoHeightDuration()` - 자동 duration 계산
   - `memoTheme()` - 테마 변경 시에만 재계산

---

## 복잡도의 이유

Collapse는 **502줄**이며, 복잡한 이유는:

1. **react-transition-group 통합** (약 150줄)
   - Transition 컴포넌트 래핑
   - 6개의 lifecycle 콜백 정의 및 정규화
   - normalizedTransitionCallback 유틸리티
   - nodeRef 관리
   - addEndListener 처리

2. **'auto' Timeout 모드** (약 50줄)
   - useTimeout 훅 사용
   - 각 lifecycle에서 auto 체크
   - getAutoHeightDuration 호출
   - autoTransitionDuration ref 관리
   - timeout='auto'일 때 Transition에 null 전달

3. **Horizontal/Vertical 양방향 지원** (약 40줄)
   - orientation에 따라 size property 분기 (height vs width)
   - horizontal일 때 position: absolute 측정 hack
   - styled components의 variants 배열
   - 조건부 스타일 로직

4. **3개의 Styled Components** (약 80줄)
   - CollapseRoot, CollapseWrapper, CollapseWrapperInner
   - memoTheme() 래퍼
   - variants 배열로 조건부 스타일
   - overridesResolver

5. **Slot 시스템** (약 40줄)
   - useSlot() 훅 3번 호출
   - externalForwardedProps 객체 생성
   - slotProps 병합 로직

6. **Theme 통합** (약 30줄)
   - useDefaultProps() - 테마의 기본값 적용
   - useTheme() - 테마 접근
   - theme.transitions.create() - transition 문자열 생성
   - getTransitionProps() - easing 정규화

7. **Utility Classes** (약 30줄)
   - useUtilityClasses() 훅
   - composeClasses() 호출
   - 5개 슬롯의 클래스 이름 생성 (root, entered, hidden, wrapper, wrapperInner)
   - clsx() 사용

8. **PropTypes** (약 80줄)
   - 17개 props의 타입 정의
   - 복잡한 타입 (oneOfType, shape 등)
   - JSDoc 주석

---

## 비교: CSS Transition vs react-transition-group

Collapse는 왜 단순한 CSS transition 대신 react-transition-group을 사용할까?

| 기능 | CSS Transition | react-transition-group |
|------|----------------|------------------------|
| **높이 auto 지원** | ❌ (height: 0 → auto는 애니메이션 불가) | ✅ (JS로 실제 높이 측정 후 px 설정) |
| **Lifecycle 콜백** | ❌ (transitionend 이벤트만) | ✅ (6단계 세밀한 제어) |
| **Auto duration** | ❌ | ✅ (크기 기반 자동 계산) |
| **Appear 애니메이션** | ❌ (마운트 시 애니메이션 어려움) | ✅ (appear prop 지원) |
| **상태 기반 스타일** | ⚠️ (CSS만 가능) | ✅ (JS로 동적 계산) |

**핵심 문제: `height: 0` → `height: auto` 애니메이션**

CSS에서는 불가능:
```css
/* 동작하지 않음 */
.collapse {
  height: 0;
  transition: height 300ms;
}
.collapse.open {
  height: auto; /* auto로 전환 시 애니메이션 안 됨 */
}
```

Collapse의 해결책:
1. **Enter**: height: 0px → (실제 크기 측정) → height: 245px (애니메이션) → height: auto
2. **Exit**: height: auto → (실제 크기 측정) → height: 245px → height: 0px (애니메이션)

이를 위해 react-transition-group의 상태 머신이 필수입니다.

---

## 주요 유틸리티 및 의존성

1. **react-transition-group** - 상태 머신 라이브러리
2. **useTimeout** - timeout='auto'일 때 수동 타이머 관리
3. **getTransitionProps** - easing 정규화 (enter/exit 분리)
4. **useForkRef** - 여러 ref 병합 (사용자 ref + 내부 nodeRef)
5. **useSlot** - slot 시스템 구현
6. **composeClasses** - 클래스 이름 생성 및 병합
7. **memoTheme** - 테마 기반 스타일 메모이제이션
8. **clsx** - className 병합
