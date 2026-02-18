# Slide 컴포넌트

> Slide 컴포넌트 원본 구조 빠른 파악

**⚠️ 이 문서의 목적**: 간소화 작업 **전에** 원본 코드를 빠르게 이해하기 위한 요약 문서입니다.

---

## 무슨 기능을 하는가?

Slide는 **자식 엘리먼트를 특정 방향에서 밀어 넣거나 밀어 내는 슬라이드 전환 애니메이션** 컴포넌트입니다.

### 핵심 기능
1. **4방향 슬라이드** - `left`, `right`, `up`, `down` 방향으로 슬라이드 in/out
2. **위치 계산** - `getBoundingClientRect()`로 엘리먼트 현재 위치 파악 후 화면 밖 좌표 계산
3. **react-transition-group 통합** - `Transition` 상태 머신(entering/exiting 등)에 맞게 transform 설정
4. **resize 대응** - 창 크기 변경 시 화면 밖 위치 재계산 (debounce 적용)

---

## 주요 코드 구조

### 파일 위치 및 크기

```
packages/mui-material/src/Slide/Slide.js (405줄)
```

### 렌더링 구조

```
Slide
  └─> Transition (react-transition-group)
       └─> children (React.cloneElement로 ref + style 주입)
```

### 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `in` | boolean | - | 전환 트리거 (true=슬라이드 인, false=슬라이드 아웃) |
| `direction` | string | `'down'` | 슬라이드 방향 (left/right/up/down) |
| `children` | ReactElement | - | 대상 엘리먼트 (ref 받을 수 있어야 함) |
| `timeout` | number/object | `{ enter: 225, exit: 195 }` | 전환 시간 (테마 기본값) |
| `easing` | string/object | `{ enter: easeOut, exit: sharp }` | 이징 함수 |
| `container` | element/func | - | 슬라이드 기준 컨테이너 (기본: window) |
| `appear` | boolean | `true` | 첫 마운트 시 애니메이션 여부 |
| `addEndListener` | func | - | 커스텀 transition 종료 감지 |
| `TransitionComponent` | component | `Transition` | 내부 전환 컴포넌트 교체 가능 |
| `onEnter/Entering/Entered/Exit/Exiting/Exited` | func | - | 생명주기 콜백 |

### 핵심 로직 발췌

```javascript
// 방향별 화면 밖 위치 계산
function getTranslateValue(direction, node, resolvedContainer) {
  const rect = node.getBoundingClientRect();
  const containerWindow = ownerWindow(node);

  if (direction === 'left') {
    return `translateX(${containerWindow.innerWidth + offsetX - rect.left}px)`;
  }
  if (direction === 'right') {
    return `translateX(-${rect.left + rect.width - offsetX}px)`;
  }
  if (direction === 'up') {
    return `translateY(${containerWindow.innerHeight + offsetY - rect.top}px)`;
  }
  // 'down'
  return `translateY(-${rect.top + rect.height - offsetY}px)`;
}

// enter 단계: 화면 밖에 배치 + reflow 강제
const handleEnter = normalizedTransitionCallback((node, isAppearing) => {
  setTranslateValue(direction, node, containerProp);
  reflow(node);
});

// entering 단계: transition 설정 + 원래 위치로 복귀
const handleEntering = normalizedTransitionCallback((node, isAppearing) => {
  node.style.transition = theme.transitions.create('transform', transitionProps);
  node.style.transform = 'none';
});
```

---

## 복잡도의 이유

Slide는 **405줄**이며, 복잡한 이유는:

1. **normalizedTransitionCallback 패턴** - 외부 콜백(onEnter 등)을 nodeRef와 함께 래핑하는 패턴 + 6개 생명주기 콜백
2. **Theme 시스템** - `useTheme()`로 easing, duration 값 가져오기 + `getTransitionProps` 유틸리티
3. **복잡한 Ref 처리** - `useForkRef` + `getReactElementRef`로 외부 ref + children ref + nodeRef 3개 병합
4. **container prop** - 커스텀 컨테이너 기준 위치 계산 (`resolveContainer` + `containerRect` 분기)
5. **브라우저 호환성** - `-webkit-transform/transition` prefix + `fakeTransform` 테스팅 유틸리티
6. **debounce resize** - 창 크기 변경 시 위치 재계산 (debounce + clear 패턴)
7. **PropTypes** - ~133줄 (chainPropTypes, HTMLElementType 등 복잡한 타입 검증)

---

## 간소화 방향

이 컴포넌트를 간소화할 때 제거 고려 대상:

- **PropTypes** - 133줄, 핵심 로직 아님
- **TransitionComponent prop** - Transition 고정
- **Lifecycle callback props** - normalizedTransitionCallback 패턴 포함
- **addEndListener** - timeout 기반 종료로 충분
- **easing/appear/style props + getTransitionProps** - 고정 easing 문자열로 대체
- **timeout prop** - 225ms/195ms 고정
- **Theme 시스템 (useTheme)** - easing 값 하드코딩
- **container prop** - window 기준 고정, resolveContainer 제거
- **debounce** - 직접 addEventListener
- **useForkRef/getReactElementRef/forwardRef** - 내부 nodeRef만 사용
- **webkit prefix + fakeTransform** - 브라우저 호환성/테스팅 코드

> 상세한 간소화 결과는 `Slide-simplified.md` 참고
