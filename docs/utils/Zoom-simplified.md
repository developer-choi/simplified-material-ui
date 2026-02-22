# Zoom (Simplified)

## 간소화 결과

```jsx
'use client';
import * as React from 'react';
import { Transition } from 'react-transition-group';

const styles = {
  entering: { transform: 'none' },
  entered: { transform: 'none' },
};

const Zoom = React.forwardRef(function Zoom(props, ref) {
  const { children, in: inProp, style, ...other } = props;

  const nodeRef = React.useRef(null);

  const handleEnter = () => {
    const node = nodeRef.current;
    node.scrollTop; // reflow
    const duration = style?.transitionDuration || 225;
    const easing = style?.transitionTimingFunction || 'cubic-bezier(0.4, 0, 0.2, 1)';
    const delay = style?.transitionDelay || 0;
    node.style.webkitTransition = `transform ${duration}ms ${easing} ${delay}ms`;
    node.style.transition = `transform ${duration}ms ${easing} ${delay}ms`;
  };

  const handleExit = () => {
    const node = nodeRef.current;
    const duration = style?.transitionDuration || 195;
    const easing = style?.transitionTimingFunction || 'cubic-bezier(0.4, 0, 0.2, 1)';
    const delay = style?.transitionDelay || 0;
    node.style.webkitTransition = `transform ${duration}ms ${easing} ${delay}ms`;
    node.style.transition = `transform ${duration}ms ${easing} ${delay}ms`;
  };

  return (
    <Transition
      appear={true}
      in={inProp}
      nodeRef={nodeRef}
      onEnter={handleEnter}
      onExit={handleExit}
      timeout={{ enter: 225, exit: 195 }}
      {...other}
    >
      {(state, { ownerState, ...restChildProps }) => {
        return React.cloneElement(children, {
          style: {
            transform: 'scale(0)',
            visibility: state === 'exited' && !inProp ? 'hidden' : undefined,
            ...styles[state],
            ...style,
            ...children.props.style,
          },
          ref: nodeRef,
          ...restChildProps,
        });
      }}
    </Transition>
  );
});

export default Zoom;
```

**231줄 → 48줄 (−79%)**

## 제거 항목 요약

| 항목 | 제거 이유 |
|------|---------|
| `useTheme` | duration 상수(225/195)로 대체 |
| `theme.transitions.create` | template literal로 직접 생성 |
| `getTransitionProps` | 로직 인라인 (style?.transitionDuration 등) |
| `reflow(node)` import | `node.scrollTop` 직접 사용 |
| `useForkRef`, `getReactElementRef` | `nodeRef` 직접 ref로 사용 |
| `normalizedTransitionCallback` | handleEnter/Exit 직접 구현 |
| `handleEntering`, `handleEntered`, `handleExiting`, `handleExited` | `...other`로 통과 |
| `handleAddEndListener` | `addEndListener` → `...other`로 통과 |
| `addEndListener`, `easing`, `timeout`, `TransitionComponent` props | 하드코딩 또는 제거 |
| `appear`, `onEnter*`, `onExit*` 구조분해 | 하드코딩(`appear={true}`) 또는 `...other`로 통과 |
| `PropTypes`, `elementAcceptingRef` | 타입 시스템 제거 |

## 유지 항목 및 이유

| 항목 | 유지 이유 |
|------|---------|
| `Transition` (react-transition-group) | 핵심 상태 머신 (entering/entered/exiting/exited) |
| `nodeRef` | DOM 접근 + Strict Mode 호환 |
| `styles` 객체 | 상태별 transform 적용 |
| `handleEnter` + reflow | 애니메이션 시작 전 초기 상태 강제 적용 |
| `handleExit` | exit transition 설정 |
| `scale(0)` 초기 상태 | 등장 전 숨김 |
| `visibility: hidden` (exited+!in) | DOM에서 공간 차지 없이 숨김 |
| `ownerState` 필터링 | DOM에 불필요한 prop 전달 방지 |
| `children.props.style` 병합 | 자식의 기존 스타일 보존 |

## 핵심 학습 포인트

### 1. react-transition-group의 Transition 상태 머신

```
in=false → in=true:
  exited → entering → entered
  (onEnter) → (onEntering) → (onEntered)

in=true → in=false:
  entered → exiting → exited
  (onExit) → (onExiting) → (onExited)
```

Zoom은 이 상태 변화에 맞춰:
- `entering`/`entered` → `transform: none` (원래 크기)
- 초기/`exiting`/`exited` → `transform: scale(0)` (숨겨진 상태)

```js
const styles = {
  entering: { transform: 'none' },
  entered: { transform: 'none' },
};

// 렌더 prop에서:
style: {
  transform: 'scale(0)',        // 기본값 (exiting, exited)
  ...styles[state],             // entering/entered에서 덮어씀
}
```

### 2. nodeRef와 CSS transition 동적 설정

```js
const nodeRef = React.useRef(null);

const handleEnter = () => {
  const node = nodeRef.current;  // DOM 직접 접근
  node.style.transition = `transform 225ms cubic-bezier(...) 0ms`;
};
```

`Transition`에 `nodeRef`를 전달하면:
1. Strict Mode 호환 (DOM 직접 접근 대신 ref 사용)
2. `onEnter` 콜백에서 `nodeRef.current`로 DOM 접근
3. 자식 `ref={nodeRef}`로 자식 DOM이 nodeRef에 연결됨

CSS transition은 React가 아닌 **DOM API를 직접 조작**해서 설정.
각 진입/퇴장 직전에 transition 속성을 동적으로 주입하는 방식.

### 3. reflow 트릭 — node.scrollTop

```js
const handleEnter = () => {
  const node = nodeRef.current;
  node.scrollTop;  // 브라우저가 레이아웃 강제 계산
  // 이후 transition 설정
};
```

**왜 필요한가?**

브라우저는 성능을 위해 스타일 변경을 배치(batch) 처리한다.
transition 설정 → transform 변경이 같은 프레임에서 일어나면
브라우저가 초기 상태(scale(0))를 무시하고 바로 최종 상태로 점프.

`node.scrollTop`을 읽으면 브라우저가 즉시 레이아웃을 계산(reflow)하여
현재 `scale(0)` 상태가 확정된 후 transition이 시작됨.

| 동작 | 결과 |
|------|------|
| reflow 없음 | scale(0) → scale(1) 점프 (애니메이션 없음) |
| reflow 있음 | scale(0)에서 부드럽게 scale(1)로 전환 |

Exit에서는 reflow 불필요: 이미 렌더링된 상태에서 시작하므로.

### 4. style 전달 우선순위

```js
style: {
  transform: 'scale(0)',        // Zoom 기본값 (가장 낮은 우선순위)
  visibility: ...,               // exited 상태 처리
  ...styles[state],             // 상태별 스타일 (entering/entered에서 transform: none)
  ...style,                     // 사용자 style prop
  ...children.props.style,      // 자식 자체 style (최우선)
}
```

나중에 스프레드될수록 우선순위 높음. 자식의 기존 스타일이 가장 강함.

### 5. ...other로 lifecycle 콜백 통과

```jsx
const { children, in: inProp, style, ...other } = props;
// other에 onEnter, onEntered, onEntering, onExit, onExited, onExiting 포함 가능

return (
  <Transition
    onEnter={handleEnter}   // ← 내부 handler (enter transition 설정)
    onExit={handleExit}     // ← 내부 handler (exit transition 설정)
    {...other}              // ← other가 뒤에 오므로 사용자 콜백이 내부 handler를 덮어씀
  >
```

`{...other}`가 `onEnter`/`onExit` 뒤에 오므로:
- 사용자가 `onEnter`를 prop으로 전달하면 → 내부 `handleEnter`를 대체
- 즉, 사용자 콜백이 최우선 (단, transition CSS 설정이 실행되지 않음)

### 6. Fade vs Zoom vs Grow 비교

| 컴포넌트 | 애니메이션 | 초기 상태 | transition 속성 |
|---------|-----------|---------|---------------|
| Fade | opacity 0→1 | `opacity: 0` | `opacity` |
| Zoom | scale 0→1 | `transform: scale(0)` | `transform` |
| Grow | opacity+scale | `opacity: 0, scale(0.75)` | `opacity, transform` |

모두 동일한 구조:
1. `nodeRef`로 DOM 접근
2. `handleEnter`에서 reflow + transition 설정
3. `styles` 객체로 상태별 스타일 정의
4. render prop으로 자식에 스타일 주입

### 7. visibility: hidden vs display: none

```js
visibility: state === 'exited' && !inProp ? 'hidden' : undefined,
```

`exited` 상태이고 `in={false}`일 때만 `visibility: hidden`.

| CSS | 특징 |
|-----|------|
| `display: none` | DOM에서 공간 제거 (레이아웃 shift) |
| `visibility: hidden` | 공간 유지하며 투명 (레이아웃 안정) |
| `opacity: 0` | 공간 유지, 이벤트도 받음 |

Zoom은 `visibility: hidden`으로 공간을 유지하면서 숨김.
`scale(0)`이 이미 시각적으로 보이지 않게 하지만, `visibility: hidden`이 없으면
크기가 0인 요소가 이벤트를 받을 수 있음.

`in={true}`(entering/entered)일 때는 `undefined` → `visibility` 속성 없음 → 정상 표시.
