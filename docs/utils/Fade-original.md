# Fade 컴포넌트

> Material-UI의 Fade 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

Fade는 **opacity 속성을 애니메이션하여 요소를 부드럽게 나타내고 사라지게 하는** 컴포넌트입니다.

### 핵심 기능
1. **Opacity 애니메이션** - 0 → 1 (나타남), 1 → 0 (사라짐)
2. **Transition 래핑** - react-transition-group의 Transition 컴포넌트를 래핑하여 Material-UI 스타일 적용
3. **Lifecycle 콜백** - 애니메이션의 각 단계(enter, entering, entered, exit, exiting, exited)마다 콜백 제공

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/Fade/Fade.js (232줄)
Fade (forwardRef)
  └─> Transition (react-transition-group)
       └─> children (cloneElement로 props 주입)
            - style: opacity + visibility
            - ref: handleRef
```

### 2. 주요 로직

#### 2.1 테마 통합

```javascript
// 라인 25-29
const theme = useTheme();
const defaultTimeout = {
  enter: theme.transitions.duration.enteringScreen,  // 225ms
  exit: theme.transitions.duration.leavingScreen,    // 195ms
};
```

Material-UI 테마 시스템에서 transition duration을 가져옵니다.

#### 2.2 Ref 병합

```javascript
// 라인 50-52
const enableStrictModeCompat = true;
const nodeRef = React.useRef(null);
const handleRef = useForkRef(nodeRef, getReactElementRef(children), ref);
```

- `nodeRef`: 내부에서 사용할 ref (Transition에 전달)
- `useForkRef`: nodeRef + 자식의 ref + forwardedRef를 병합
- `getReactElementRef`: 자식 엘리먼트의 ref 추출

#### 2.3 Callback 정규화

```javascript
// 라인 54-65
const normalizedTransitionCallback = (callback) => (maybeIsAppearing) => {
  if (callback) {
    const node = nodeRef.current;

    // onEnterXxx와 onExitXxx는 arguments.length가 다름
    if (maybeIsAppearing === undefined) {
      callback(node);
    } else {
      callback(node, maybeIsAppearing);
    }
  }
};
```

Transition 콜백의 시그니처를 통일합니다:
- `onEnter(node, isAppearing)` - 2개 파라미터
- `onExit(node)` - 1개 파라미터

#### 2.4 Enter 애니메이션

```javascript
// 라인 69-85
const handleEnter = normalizedTransitionCallback((node, isAppearing) => {
  reflow(node); // DOM 리플로우 트리거 (node.scrollTop)

  const transitionProps = getTransitionProps(
    { style, timeout, easing },
    { mode: 'enter' }
  );
  // → { duration: 225, easing: undefined, delay: undefined }

  node.style.webkitTransition = theme.transitions.create('opacity', transitionProps);
  node.style.transition = theme.transitions.create('opacity', transitionProps);
  // → 'opacity 225ms ease-in-out 0ms'

  if (onEnter) {
    onEnter(node, isAppearing);
  }
});
```

**핵심 단계**:
1. `reflow(node)`: 브라우저가 현재 스타일을 적용하도록 강제 (애니메이션 시작 전 필수)
2. `getTransitionProps`: duration, easing, delay 계산
3. CSS transition 속성 설정 (webkit prefix 포함)
4. 사용자 콜백 호출 (있을 경우)

#### 2.5 Exit 애니메이션

```javascript
// 라인 91-105
const handleExit = normalizedTransitionCallback((node) => {
  const transitionProps = getTransitionProps(
    { style, timeout, easing },
    { mode: 'exit' }
  );

  node.style.webkitTransition = theme.transitions.create('opacity', transitionProps);
  node.style.transition = theme.transitions.create('opacity', transitionProps);

  if (onExit) {
    onExit(node);
  }
});
```

Exit는 Enter와 동일하나 `reflow()` 호출 없음 (이미 렌더링된 상태이므로).

#### 2.6 Styles 적용

```javascript
// 라인 11-18
const styles = {
  entering: {
    opacity: 1,
  },
  entered: {
    opacity: 1,
  },
};

// 라인 132-144
{(state, { ownerState, ...restChildProps }) => {
  return React.cloneElement(children, {
    style: {
      opacity: 0,
      visibility: state === 'exited' && !inProp ? 'hidden' : undefined,
      ...styles[state],
      ...style,
      ...children.props.style,
    },
    ref: handleRef,
    ...restChildProps,
  });
}}
```

**상태별 스타일**:
- 초기: `opacity: 0`
- `entering`, `entered`: `opacity: 1`
- `exited` + `in={false}`: `visibility: 'hidden'` (DOM에서 완전히 숨김)

### 3. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `in` | boolean | - | true면 나타남, false면 사라짐 |
| `children` | element | - | 애니메이션 적용할 자식 (ref 받을 수 있어야 함) |
| `timeout` | number \| { enter, exit } | `{ enter: 225, exit: 195 }` | 애니메이션 지속 시간 |
| `appear` | boolean | `true` | 초기 마운트 시에도 애니메이션 적용 여부 |
| `easing` | string \| { enter, exit } | - | transition timing function |
| `style` | object | - | 추가 스타일 |
| `onEnter` | function | - | Enter 시작 시 콜백 |
| `onEntering` | function | - | Enter 진행 중 콜백 |
| `onEntered` | function | - | Enter 완료 시 콜백 |
| `onExit` | function | - | Exit 시작 시 콜백 |
| `onExiting` | function | - | Exit 진행 중 콜백 |
| `onExited` | function | - | Exit 완료 시 콜백 |
| `addEndListener` | function | - | 커스텀 transition end 리스너 |
| `TransitionComponent` | component | `Transition` | Transition 컴포넌트 교체 |

### 4. Transition Lifecycle

```
in={false} → in={true} 시:
  exited → entering → entered

in={true} → in={false} 시:
  entered → exiting → exited
```

각 상태 변경마다 콜백 호출:
- `onEnter` → `onEntering` → `onEntered`
- `onExit` → `onExiting` → `onExited`

---

## 설계 패턴

### 1. Wrapper Pattern
- react-transition-group의 `Transition`을 래핑하여 Material-UI 스타일 적용
- Transition의 복잡한 API를 단순화하지 않고 그대로 노출

### 2. Render Props Pattern
```javascript
<Transition>
  {(state, childProps) => {
    // state: 'entering', 'entered', 'exiting', 'exited'
    return React.cloneElement(children, { ...childProps });
  }}
</Transition>
```

### 3. Forward Ref Pattern
- forwardRef로 ref를 받아서 내부 DOM에 전달
- useForkRef로 여러 ref 병합

### 4. Callback Normalization Pattern
- `normalizedTransitionCallback`으로 콜백 시그니처 통일
- 파라미터 개수가 다른 콜백을 동일한 방식으로 처리

---

## 복잡도의 이유

Fade는 **232줄**이며, 복잡한 이유는:

1. **Lifecycle 콜백 6개** - onEnter, onEntering, onEntered, onExit, onExiting, onExited
2. **Callback 정규화** - normalizedTransitionCallback으로 콜백 래핑 (12줄)
3. **Ref 병합** - useForkRef + getReactElementRef (복잡한 ref 처리)
4. **테마 통합** - useTheme, theme.transitions.create, theme.transitions.duration
5. **유틸리티 함수** - reflow, getTransitionProps
6. **커스터마이징 Props** - timeout, easing, appear, TransitionComponent, addEndListener
7. **PropTypes** - 80줄 (라인 149-229)
8. **브라우저 호환성** - webkit prefix 지원
9. **ownerState 필터링** - Transition의 render props에서 ownerState 제거 (라인 132)

---

## 비교: Fade vs CSS Transition

| 기능 | CSS Transition | Fade (Material-UI) |
|------|---------------|-------------------|
| **기본 애니메이션** | `transition: opacity 0.3s` | react-transition-group 사용 |
| **Lifecycle 제어** | ❌ 없음 | ✅ 6개 콜백 |
| **테마 통합** | ❌ 없음 | ✅ theme.transitions |
| **코드 양** | 1줄 | 232줄 |
| **의존성** | 없음 | react-transition-group, @mui/utils |
| **커스터마이징** | CSS 직접 수정 | Props로 제어 |
| **Unmount 시 애니메이션** | ❌ 불가능 | ✅ 가능 (exit animation) |

**핵심 차이점**: CSS는 unmount 시 애니메이션 불가능. Fade는 DOM에서 제거되기 전에 exit 애니메이션 실행.

---

## 의존성

### 외부 패키지
- `react-transition-group` - Transition 컴포넌트
- `@mui/utils/elementAcceptingRef` - PropTypes 검증
- `@mui/utils/getReactElementRef` - 자식 ref 추출
- `prop-types` - PropTypes 정의

### 내부 모듈
- `../zero-styled` - useTheme 훅
- `../transitions/utils` - reflow, getTransitionProps
- `../utils/useForkRef` - ref 병합

---

## 사용 예시

```javascript
import Fade from '@mui/material/Fade';

function MyComponent() {
  const [show, setShow] = React.useState(false);

  return (
    <div>
      <button onClick={() => setShow(!show)}>Toggle</button>
      <Fade in={show}>
        <div>Hello World</div>
      </Fade>
    </div>
  );
}
```

---

## 다른 Transition 컴포넌트와의 비교

| 컴포넌트 | 애니메이션 속성 | 초기 상태 | 특수 기능 |
|---------|---------------|----------|---------|
| **Fade** | opacity | opacity: 0 | - |
| **Grow** | opacity + scale | opacity: 0, scale(0.75) | timeout='auto' 지원 |
| **Slide** | transform (translate) | translateX/Y | direction prop (left/right/up/down) |
| **Zoom** | transform (scale) | scale(0) | - |
| **Collapse** | height | height: 0 | collapsedSize prop |

**Fade의 특징**: 가장 단순한 transition (opacity만 변경)
