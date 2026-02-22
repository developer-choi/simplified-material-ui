# Zoom (Original)

## 핵심 역할

`scale(0)` → `scale(1)` transform 애니메이션으로 요소를 확대 등장/축소 퇴장시키는 컴포넌트.
`react-transition-group`의 `Transition`을 래핑하고, `useTheme`로 duration을 가져와
`theme.transitions.create`로 CSS transition 문자열을 생성한다.
FAB(Floating Action Button) 등에서 주로 사용.

## 복잡도 요소

### 1. useTheme + theme.transitions.create — CSS transition 문자열 생성

```js
const theme = useTheme();
const defaultTimeout = {
  enter: theme.transitions.duration.enteringScreen,  // 225ms
  exit: theme.transitions.duration.leavingScreen,    // 195ms
};

// handleEnter 내부:
const transitionProps = getTransitionProps({ style, timeout, easing }, { mode: 'enter' });
node.style.transition = theme.transitions.create('transform', transitionProps);
// → 'transform 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms'
```

`getTransitionProps`가 `{ duration, easing, delay }` 객체를 만들고,
`theme.transitions.create`가 최종 CSS 문자열로 변환하는 2단계 파이프라인.

### 2. useForkRef + getReactElementRef — 3-way ref 병합

```js
const nodeRef = React.useRef(null);
const handleRef = useForkRef(nodeRef, getReactElementRef(children), ref);
```

3개의 ref를 하나로 병합:
- `nodeRef`: 내부 콜백에서 DOM 접근용
- `getReactElementRef(children)`: 자식의 기존 ref 유지
- `ref`: forwardRef로 받은 외부 ref

### 3. normalizedTransitionCallback — 콜백 시그니처 통일

```js
const normalizedTransitionCallback = (callback) => (maybeIsAppearing) => {
  if (callback) {
    const node = nodeRef.current;
    if (maybeIsAppearing === undefined) {
      callback(node);          // onExit 계열: (node)
    } else {
      callback(node, maybeIsAppearing);  // onEnter 계열: (node, isAppearing)
    }
  }
};

const handleEntering = normalizedTransitionCallback(onEntering);
const handleEnter = normalizedTransitionCallback((node, isAppearing) => {
  reflow(node);
  // ...transition 설정
  if (onEnter) onEnter(node, isAppearing);
});
// handleEntered, handleExiting, handleExit, handleExited 동일 패턴
```

Enter 계열(2인수)과 Exit 계열(1인수)의 콜백 시그니처 차이를 이중 currying으로 추상화.

### 4. getTransitionProps — timeout/easing/style 우선순위 처리

```js
// getTransitionProps 결과:
{
  duration: style?.transitionDuration ?? (typeof timeout === 'number' ? timeout : timeout[mode] ?? 0),
  easing: style?.transitionTimingFunction ?? (typeof easing === 'object' ? easing[mode] : easing),
  delay: style?.transitionDelay,
}
```

`style` prop의 CSS 속성이 가장 우선순위 높고, `timeout`/`easing` prop이 그 다음.

### 5. reflow(node)

```js
reflow(node); // === node.scrollTop (읽기만 해도 브라우저가 레이아웃 강제 계산)
```

Enter 직전에 DOM을 강제 리플로우해서 scale(0) 초기 상태가 적용된 후 transition이 시작되도록 보장.
Exit에서는 이미 렌더링된 상태이므로 reflow 불필요.

### 6. TransitionComponent, addEndListener — escape hatch props

```js
// eslint-disable-next-line react/prop-types
TransitionComponent = Transition,  // 테스트 시 교체 가능
```

```js
const handleAddEndListener = (next) => {
  if (addEndListener) addEndListener(nodeRef.current, next);
};
```

`TransitionComponent`로 Transition 구현 교체, `addEndListener`로 커스텀 종료 감지 추가.
