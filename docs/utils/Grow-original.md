# Grow 컴포넌트

> Grow 컴포넌트 원본 구조 빠른 파악

**⚠️ 이 문서의 목적**: 간소화 작업 **전에** 원본 코드를 빠르게 이해하기 위한 요약 문서입니다.

---

## 무슨 기능을 하는가?

Grow는 **자식 요소가 나타날 때 opacity 0→1 + scale(0.75→1) 애니메이션을, 사라질 때 반대 애니메이션을 적용하는 Transition 컴포넌트**입니다.

### 핵심 기능
1. **CSS Transition 상태 관리** - `react-transition-group`의 `Transition`이 entering/entered/exiting/exited 상태를 관리, 각 상태에 맞는 스타일 적용
2. **애니메이션 스타일 주입** - `React.cloneElement`로 자식 요소에 opacity/transform 스타일 주입, `handleEnter`/`handleExit`에서 CSS transition 속성 직접 설정
3. **자동 duration 계산** - `timeout='auto'`일 때 자식 요소의 `clientHeight` 기반으로 duration 자동 계산

---

## 주요 코드 구조

### 파일 위치 및 크기

```
packages/mui-material/src/Grow/Grow.js (297줄)
```

### 렌더링 구조

```
Grow (forwardRef)
  └─> Transition (react-transition-group)
       └─> children (React.cloneElement로 스타일 주입)
```

### 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `in` | boolean | - | 트랜지션 진입 여부 (true면 등장) |
| `timeout` | number \| 'auto' \| object | `'auto'` | 애니메이션 duration (ms) |
| `children` | ReactElement | (필수) | 스타일이 주입될 자식 요소 |
| `addEndListener` | func | - | 커스텀 종료 트리거 |
| `appear` | boolean | `true` | 최초 마운트 시 등장 애니메이션 여부 |
| `easing` | string \| object | - | timing function |
| `style` | object | - | 자식에게 병합될 외부 style |
| `onEnter/onEntering/onEntered` | func | - | 진입 단계별 콜백 |
| `onExit/onExiting/onExited` | func | - | 퇴장 단계별 콜백 |
| `TransitionComponent` | component | `Transition` | Transition 구현체 교체용 |

### 핵심 로직 발췌

```javascript
// 상태별 스타일 정의
const styles = {
  entering: { opacity: 1, transform: getScale(1) },
  entered:  { opacity: 1, transform: 'none' },
};

// 진입 시 CSS transition 속성 설정
const handleEnter = normalizedTransitionCallback((node, isAppearing) => {
  reflow(node); // 레이아웃 강제 실행 (애니메이션 초기화)

  // timeout='auto'면 clientHeight 기반 duration 자동 계산
  const duration = timeout === 'auto'
    ? theme.transitions.getAutoHeightDuration(node.clientHeight)
    : transitionDuration;

  node.style.transition = [
    theme.transitions.create('opacity', { duration, delay }),
    theme.transitions.create('transform', {
      duration: isWebKit154 ? duration : duration * 0.666, // Safari 버그 대응
      delay,
      easing: transitionTimingFunction,
    }),
  ].join(',');
});

// 자식에게 스타일 주입
{(state, { ownerState, ...restChildProps }) => {
  return React.cloneElement(children, {
    style: {
      opacity: 0,
      transform: getScale(0.75),
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

---

## 복잡도의 이유

Grow는 **297줄**이며, 복잡한 이유는:

1. **timeout='auto' 로직** - `clientHeight` 기반 duration 자동 계산, `useTimeout` + `autoTimeout` ref 관리, `addEndListener`와의 연동
2. **normalizedTransitionCallback 래퍼** - `onEnter`/`onExit` 계열 콜백들이 서로 다른 인자 수를 가져 통합 처리 필요
3. **복잡한 ref 병합** - `useForkRef(nodeRef, getReactElementRef(children), ref)` 3개 ref를 하나로 병합
4. **브라우저 호환성 코드** - `isWebKit154`로 Safari 15.4 CSS transition 버그 대응 (transform duration을 다르게 설정)
5. **Theme 시스템** - `useTheme()` → `theme.transitions.create()` 호출 체인으로 transition 문자열 생성

---

## 간소화 방향

이 컴포넌트를 간소화할 때 제거 고려 대상:

- **PropTypes 및 메타데이터** - 85줄 분량, 핵심 로직 아님
- **TransitionComponent prop** - Transition 고정 사용으로 충분
- **Lifecycle callback props** - onEnter/onEntered 등 6개, 확장 포인트이지 핵심 아님
- **addEndListener + timeout='auto'** - 고급 사용 케이스, 고정 300ms로 대체
- **easing / appear / style props** - 기본값으로 고정
- **isWebKit154 브라우저 호환성 코드** - 특정 버전 버그 대응, 학습 무관
- **Theme 시스템** - 고정 CSS transition 문자열로 대체
- **복잡한 ref 처리** - useForkRef/getReactElementRef 제거, nodeRef 단일 사용

> 상세한 간소화 결과는 `Grow-simplified.md` 참고
