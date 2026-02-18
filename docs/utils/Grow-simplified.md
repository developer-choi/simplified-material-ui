# Grow 컴포넌트

> react-transition-group의 Transition을 이용해 opacity + scale CSS 애니메이션을 자식 요소에 주입하는 컴포넌트

---

## 이 문서의 목적

**이 문서는 단순화된 코드의 "상세 학습 가이드"입니다.**

라이브러리 코드는 복잡합니다. 단순화했더라도 코드만 보고는 이해하기 어려울 수 있습니다.
이 문서는 코드의 **동작 원리, 핵심 패턴, 왜 이렇게 구현했는지**를 상세히 설명하여 학습을 돕습니다.

> **원본 구조 파악**: 원본 코드의 빠른 이해는 `Grow-original.md` 참고

---

## 무슨 기능을 하는가?

수정된 Grow는 **자식 요소가 나타날 때 opacity + scale 애니메이션을, 사라질 때 반대 애니메이션을 적용하는 Transition 래퍼 컴포넌트**입니다.

### 핵심 기능 (남은 것)
1. **Transition 상태 관리** - `react-transition-group`의 `Transition`으로 entering/entered/exiting/exited 4단계 상태 관리
2. **CSS transition 동적 주입** - `onEnter`/`onExit` 콜백에서 `node.style.transition`을 직접 설정하여 애니메이션 시작
3. **자식 스타일 오버라이드** - `React.cloneElement`로 자식 컴포넌트를 변경하지 않고 opacity/transform 스타일 주입

---

## 핵심 학습 포인트

### 1. CSS transition을 JS에서 동적으로 설정하는 이유

```javascript
const handleEnter = () => {
  const node = nodeRef.current;
  // ❶ transition 속성을 먼저 설정
  node.style.transition = 'opacity 300ms ease-in-out, transform 200ms ease-in-out';
  // ❷ 이후 React가 re-render로 state='entering'의 스타일(opacity:1)을 적용
  //    → CSS transition이 0→1 애니메이션을 실행
};
```

**학습 가치**:
- CSS 파일에서 `transition`을 미리 선언하면, 컴포넌트가 DOM에 처음 삽입될 때도 transition이 실행되어 의도치 않은 애니메이션이 발생할 수 있다
- JS에서 `transition`을 동적으로 설정하면 **"애니메이션이 필요한 순간에만"** transition을 추가할 수 있다
- 순서가 핵심: `transition 설정` → `목표 스타일 적용` → CSS가 두 값 사이를 보간

### 2. getScale(x) - 비선형 스케일 공식

```javascript
function getScale(value) {
  return `scale(${value}, ${value ** 2})`;
}

// getScale(0.75) → scale(0.75, 0.5625)  // 시작 (납작하게 시작)
// getScale(1)    → scale(1, 1)           // 진입 중간
// entered 상태   → transform: 'none'     // 최종 (자연 크기)
```

**학습 가치**:
- X축과 Y축의 스케일을 다르게 설정하면 `y = x²` 관계로 Y축이 더 빠르게 확장된다
- 초기에 납작했다가 빠르게 펴지는 시각 효과 → 버튼 클릭 후 팝업이 "터지듯" 나타나는 느낌
- `entered` 상태에서 `transform: 'none'`을 사용하는 이유: `scale(1,1)` 대신 `none`을 써야 서브픽셀 렌더링 왜곡이 없음

### 3. Transition의 children render prop 패턴

```javascript
<Transition in={inProp} timeout={300} nodeRef={nodeRef}>
  {(state) => {
    // state: 'entering' | 'entered' | 'exiting' | 'exited'
    return React.cloneElement(children, {
      style: { ...baseStyle, ...styles[state] },
      ref: nodeRef,
    });
  }}
</Transition>
```

**학습 가치**:
- `children`이 컴포넌트가 아닌 **함수(render prop)** 인 패턴
- Transition은 내부적으로 `in` prop의 변화를 감지해 state를 순서대로 변경하고, 매 state마다 이 함수를 호출한다
- 이 패턴으로 상태에 따른 UI 변화를 **선언적으로** 표현할 수 있다

### 4. visibility vs display의 선택

```javascript
visibility: state === 'exited' && !inProp ? 'hidden' : undefined,
```

**학습 가치**:
- `display: none` : 요소가 DOM 레이아웃에서 완전히 제거 → 주변 요소들이 이동함 (레이아웃 시프트)
- `visibility: hidden` : 요소는 레이아웃 공간을 유지하되 화면에 보이지 않음 → 레이아웃 안정적
- Tooltip, Popover처럼 오버레이 요소는 레이아웃에 영향을 주지 않아야 하므로 `visibility` 선택

---

## 내부 구조

### 1. 렌더링 구조

```javascript
// 위치: packages/mui-material/src/Grow/Grow.js (67줄, 원본 297줄)

Grow
  └─> Transition (react-transition-group)  ← state machine: exited→entering→entered
       └─> children (React.cloneElement)   ← opacity/transform 스타일 주입
```

### 2. 핵심 상태 (ref, state, 변수)

| 이름 | 타입 | 용도 |
|------|------|------|
| `nodeRef` | ref | 자식 DOM 노드 참조. `handleEnter`/`handleExit`에서 `node.style` 직접 조작 |
| `timeout` | 상수 | 애니메이션 duration (300ms 고정). Transition에 전달되어 상태 전환 타이밍 결정 |

### 3. 함수 역할

#### getScale(value)

- **역할**: `scale(x, x²)` CSS transform 문자열 생성
- **호출 시점**: 초기 스타일(scale(0.75)) 및 entered 스타일(scale(1)) 계산 시
- **핵심 로직**:

```javascript
function getScale(value) {
  return `scale(${value}, ${value ** 2})`;
  // value=0.75 → 'scale(0.75, 0.5625)'
  // value=1    → 'scale(1, 1)'
}
```

- **왜 이렇게 구현했는지**: Y축을 X축의 제곱으로 설정해 처음엔 납작하다가 빠르게 정상 크기로 확장되는 자연스러운 "grow" 효과 구현

#### handleEnter()

- **역할**: 등장 애니메이션 시작 시 CSS transition 속성 설정
- **호출 시점**: `in` prop이 `false → true`로 변경되어 entering 단계 시작 시 (`onEnter` 콜백)
- **핵심 로직**:

```javascript
const handleEnter = () => {
  const node = nodeRef.current;
  // opacity와 transform에 각각 다른 duration 적용
  // transform이 opacity보다 짧게 끝나면 → 크기가 먼저 완성되고 opacity가 따라옴
  node.style.transition = 'opacity 300ms ease-in-out, transform 200ms ease-in-out';
};
```

- **왜 이렇게 구현했는지**: transition을 먼저 설정해야 이후 React re-render(styles.entering 적용)에서 CSS가 애니메이션을 실행함

#### handleExit()

- **역할**: 퇴장 애니메이션 시작 시 CSS transition 설정 + 목표 스타일 즉시 적용
- **호출 시점**: `in` prop이 `true → false`로 변경되어 exiting 단계 시작 시 (`onExit` 콜백)
- **핵심 로직**:

```javascript
const handleExit = () => {
  const node = nodeRef.current;
  // transform에 100ms delay: opacity가 먼저 사라지기 시작하고 이후 크기가 줄어듦
  node.style.transition = 'opacity 300ms ease-in-out, transform 200ms ease-in-out 100ms';

  // 목표 스타일을 직접 설정 → 위에서 설정한 transition이 현재값에서 이 값으로 애니메이션
  node.style.opacity = 0;
  node.style.transform = getScale(0.75);
};
```

- **왜 이렇게 구현했는지**: `entered` 상태(opacity:1, transform:none)에서 목표값(opacity:0, scale(0.75))으로 JS가 직접 설정하면 CSS transition이 자동으로 중간값을 보간함

### 4. 동작 흐름

#### 등장(in: false → true) 플로우차트

```
in prop: false → true
        ↓
Transition: exited → entering
        ↓
onEnter 콜백 호출
        ↓
┌─────────────────────────────────────────────────┐
│ node.style.transition = 'opacity 300ms, ...'    │  ← CSS transition 준비
└─────────────────────────────────────────────────┘
        ↓
React re-render (state='entering')
        ↓
┌─────────────────────────────────────────────────┐
│ style: { opacity: 0 → 1, transform: scale→none }│  ← CSS transition 실행
└─────────────────────────────────────────────────┘
        ↓ 300ms 후
Transition: entering → entered (애니메이션 완료)
```

#### 퇴장(in: true → false) 플로우차트

```
in prop: true → false
        ↓
Transition: entered → exiting
        ↓
onExit 콜백 호출
        ↓
┌─────────────────────────────────────────────────┐
│ node.style.transition = 'opacity 300ms, ...'    │  ← CSS transition 준비
│ node.style.opacity = 0                          │  ← 목표값 즉시 설정
│ node.style.transform = getScale(0.75)           │  ← CSS transition이 보간 시작
└─────────────────────────────────────────────────┘
        ↓ 300ms 후
Transition: exiting → exited
        ↓
┌─────────────────────────────────────────────────┐
│ visibility: 'hidden' 적용                        │  ← 완전히 숨김
└─────────────────────────────────────────────────┘
```

#### 시나리오 예시

**시나리오 1: Tooltip 열기**
```
사용자가 버튼에 호버 → in=true → exited→entering→entered
→ handleEnter: transition 설정
→ React re-render: opacity 0→1, scale(0.75)→none 애니메이션
→ 300ms 후 완전히 나타남
```

**시나리오 2: Tooltip 닫기**
```
사용자가 버튼에서 마우스 이탈 → in=false → entered→exiting→exited
→ handleExit: transition 설정 + opacity=0, scale(0.75) 즉시 설정
→ CSS transition: opacity 0(즉시)→0(목표, 이미 0), scale도 애니메이션
→ 300ms 후 exited: visibility='hidden'
```

### 5. 핵심 패턴: onEnter/onExit의 역할 분리

- **비유**: "총을 장전하고(transition 설정), 방아쇠를 당기는(목표값 설정) 두 단계"
- **역할**: CSS transition이 작동하려면 반드시 ① transition 속성이 있어야 하고 ② 값이 변해야 함

**왜 CSS 파일에서 미리 선언하지 않는가?**

```javascript
// ❌ CSS에서 미리 선언하면:
// .grow { transition: opacity 300ms; }
// 문제: DOM에 처음 삽입될 때도 transition이 실행됨
//       → exited(opacity:0) → entering(opacity:1) 애니메이션이 즉시 시작

// ✅ JS에서 필요한 순간에 설정:
// onEnter 호출 시점 = entering 시작 직전 → 이후 스타일 변경에만 transition 적용
```

### 6. 주요 변경 사항 (원본 대비)

```javascript
// 단순화 후 핵심 코드
function Grow(props) {
  const { children, in: inProp, ...other } = props;
  const timeout = 300;
  const nodeRef = React.useRef(null);
  // ...
}
```

**원본과의 차이**:
- ❌ `PropTypes` 제거 → TypeScript 환경에서 불필요 (85줄 감소)
- ❌ `TransitionComponent` prop 제거 → `Transition` 고정 사용
- ❌ `onEnter/onEntering/onEntered/onExit/onExiting/onExited` 6개 콜백 prop 제거 → 확장 포인트 제거
- ❌ `addEndListener` + `timeout='auto'` 로직 제거 → `timeout = 300` 고정
- ❌ `easing/appear/style` prop 제거 → 각각 `ease-in-out`/`true`/없음으로 고정
- ❌ `isWebKit154` Safari 15.4 워크어라운드 제거 → 현대 브라우저 대상
- ❌ `useTheme()` + `theme.transitions.create()` 제거 → 고정 CSS transition 문자열
- ❌ `useForkRef` + `getReactElementRef` 제거 → `nodeRef` 단일 사용, `React.forwardRef` 제거
- ✅ `Transition` 상태 관리 유지 → 애니메이션 타이밍의 핵심
- ✅ `React.cloneElement`로 자식 스타일 주입 유지 → 핵심 패턴
- ✅ `getScale()` + `styles` 객체 유지 → 비선형 스케일 학습 가치

### 7. Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `in` | boolean | - | `true`면 등장 애니메이션, `false`면 퇴장 애니메이션 |
| `children` | ReactElement | (필수) | 스타일이 주입될 단일 자식 요소 |

**제거된 Props**:
- ❌ `timeout` - 300ms 고정
- ❌ `appear` - true 고정 (마운트 시 항상 애니메이션)
- ❌ `easing` - ease-in-out 고정
- ❌ `style` - 외부 스타일 병합 불가
- ❌ `addEndListener` - 커스텀 종료 트리거 제거
- ❌ `TransitionComponent` - Transition 고정
- ❌ `onEnter/onEntering/onEntered/onExit/onExiting/onExited` - 단계별 콜백 제거

---

## 커밋 히스토리로 보는 단순화 과정

Grow는 **8개의 커밋**을 통해 단순화되었습니다.

### 1단계: PropTypes 및 메타데이터 제거

- `a4e694c8` - [Grow 단순화 1/8] PropTypes 및 메타데이터 제거

**삭제된 코드**:
```javascript
Grow.propTypes = {
  addEndListener: PropTypes.func,
  appear: PropTypes.bool,
  children: elementAcceptingRef.isRequired,
  // ... 약 85줄
};
if (Grow) { Grow.muiSupportAuto = true; }
```

**왜 불필요한가**:
- **학습 목적**: TypeScript 환경에서 런타임 타입 검증은 불필요
- **복잡도**: 85줄의 메타데이터가 실제 로직보다 많아 가독성 저해

### 2단계: TransitionComponent prop 제거

- `65034c2d` - [Grow 단순화 2/8] TransitionComponent prop 제거

**삭제된 코드**:
```javascript
// eslint-disable-next-line react/prop-types
TransitionComponent = Transition,
// ...
<TransitionComponent ...>
```

**왜 불필요한가**:
- **학습 목적**: Transition 구현체 교체보다 핵심 동작 원리가 중요
- **복잡도**: Component props 패턴은 별도 학습 주제

### 3단계: Lifecycle callback props 제거

- `cefb930b` - [Grow 단순화 3/8] Lifecycle callback props 제거

**삭제된 코드**:
```javascript
const normalizedTransitionCallback = (callback) => (maybeIsAppearing) => {
  if (callback) {
    const node = nodeRef.current;
    if (maybeIsAppearing === undefined) {
      callback(node);
    } else {
      callback(node, maybeIsAppearing);
    }
  }
};
const handleEntering = normalizedTransitionCallback(onEntering);
const handleEntered = normalizedTransitionCallback(onEntered);
// ...
```

**왜 불필요한가**:
- **학습 목적**: 확장 포인트가 아닌 핵심 애니메이션 구조 이해가 목적
- **복잡도**: `normalizedTransitionCallback` 래퍼가 인자 수 차이를 처리하는 간접 구조

### 4단계: addEndListener 및 timeout='auto' 로직 제거

- `ad302244` - [Grow 단순화 4/8] addEndListener 및 timeout='auto' 로직 제거

**삭제된 코드**:
```javascript
const timer = useTimeout();
const autoTimeout = React.useRef();
// ...
if (timeout === 'auto') {
  duration = theme.transitions.getAutoHeightDuration(node.clientHeight);
  autoTimeout.current = duration;
}
const handleAddEndListener = (next) => {
  if (timeout === 'auto') { timer.start(autoTimeout.current || 0, next); }
  if (addEndListener) { addEndListener(nodeRef.current, next); }
};
```

**왜 불필요한가**:
- **학습 목적**: `timeout='auto'`의 clientHeight 기반 계산은 고급 사용 케이스
- **복잡도**: `useTimeout` 훅 + `autoTimeout` ref + 'auto' 분기가 얽힌 구조

### 5단계: easing/appear/style props 제거 및 getTransitionProps 인라인화

- `71fdeb56` - [Grow 단순화 5/8] easing/appear/style props 제거 및 getTransitionProps 인라인화

**삭제된 코드**:
```javascript
const { duration, delay, easing: transitionTimingFunction } = getTransitionProps(
  { style, timeout, easing },
  { mode: 'enter' },
);
```

**왜 불필요한가**:
- **학습 목적**: `style`, `timeout`, `easing` 3개 prop을 해석하는 로직보다 핵심 값이 중요
- **복잡도**: `getTransitionProps`는 외부 유틸리티 함수로 추가 탐색 필요

### 6단계: isWebKit154 브라우저 호환성 코드 및 reflow 제거

- `eab991a9` - [Grow 단순화 6/8] isWebKit154 브라우저 호환성 코드 및 reflow 제거

**삭제된 코드**:
```javascript
const isWebKit154 =
  typeof navigator !== 'undefined' &&
  /^((?!chrome|android).)*(safari|mobile)/i.test(navigator.userAgent) &&
  /(os |version\/)15(.|_)4/i.test(navigator.userAgent);
// ...
duration: isWebKit154 ? duration : duration * 0.666,
```

**왜 불필요한가**:
- **학습 목적**: Safari 15.4 특정 버전 버그 대응은 학습과 무관
- **복잡도**: userAgent 파싱 로직이 핵심 animation 로직을 가림

### 7단계: Theme 시스템 제거

- `534be721` - [Grow 단순화 7/8] Theme 시스템 제거

**삭제된 코드**:
```javascript
const theme = useTheme();
node.style.transition = [
  theme.transitions.create('opacity', { duration, delay }),
  theme.transitions.create('transform', { duration: duration * 0.666, easing }),
].join(',');
```

**왜 불필요한가**:
- **학습 목적**: `theme.transitions.create()`는 MUI 테마 시스템 학습 주제, 고정값으로도 동일 동작
- **복잡도**: `useTheme` Context 구독 + 메서드 호출 체인

### 8단계: 복잡한 Ref 처리 및 ownerState 필터링 제거

- `862a0720` - [Grow 단순화 8/8] 복잡한 Ref 처리 및 ownerState 필터링 제거

**삭제된 코드**:
```javascript
const handleRef = useForkRef(nodeRef, getReactElementRef(children), ref);
// ...
{(state, { ownerState, ...restChildProps }) => {
  return React.cloneElement(children, {
    ref: handleRef,
    ...restChildProps,
  });
}}
```

**왜 불필요한가**:
- **학습 목적**: 3개 ref 병합(`useForkRef`)은 고급 React 주제, `ownerState` 필터링은 MUI 내부 패턴
- **복잡도**: `useForkRef` + `getReactElementRef` 두 유틸리티 조합

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 297줄 | 67줄 (77% 감소) |
| **Props 개수** | 12개 | 2개 |
| **PropTypes** | ✅ (~85줄) | ❌ 제거 |
| **timeout='auto'** | ✅ clientHeight 기반 | ❌ 300ms 고정 |
| **Lifecycle 콜백** | ✅ 6개 (onEnter 등) | ❌ 제거 |
| **Safari 호환성** | ✅ isWebKit154 분기 | ❌ 제거 |
| **Theme 시스템** | ✅ useTheme + create() | ❌ 고정 CSS 문자열 |
| **ref 병합** | ✅ useForkRef (3개) | ❌ nodeRef 단일 |
| **Transition 상태 관리** | ✅ | ✅ 유지 |
| **CSS animation 패턴** | ✅ | ✅ 유지 |
| **getScale 비선형 스케일** | ✅ | ✅ 유지 |

---

## 학습 후 다음 단계

Grow를 이해했다면:

1. **Fade** (`docs/utils/Fade-original.md`) - 동일한 Transition 패턴에서 scale 없이 opacity만 사용, Grow와 비교 학습
2. **Collapse** (`docs/utils/Collapse-original.md`) - height 기반 애니메이션, Grow와 달리 레이아웃을 변경함
3. **Slide** - 위치(translateX/Y) 기반 Transition, Grow와 같은 패턴

**예시: 기본 사용**
```javascript
function PopupExample() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button onClick={() => setOpen(!open)}>Toggle</button>
      <Grow in={open}>
        <div style={{ padding: 16, background: 'lightblue' }}>
          나타나는 콘텐츠
        </div>
      </Grow>
    </>
  );
}
```

**예시: visibility 동작 확인**
```javascript
// exited 상태에서 visibility='hidden' 적용
// display: none 대신 visibility를 쓰는 이유:
// → 레이아웃 공간을 유지하여 주변 요소의 이동(layout shift)을 방지
<Grow in={false}>
  <div>이 요소는 보이지 않지만 공간은 차지함</div>
</Grow>
```
