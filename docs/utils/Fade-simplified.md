# Fade 컴포넌트

> 단순화된 opacity 기반 Fade transition 컴포넌트

---

## 무슨 기능을 하는가?

수정된 Fade는 **opacity 속성을 애니메이션하여 요소를 부드럽게 나타내고 사라지게 하는** 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **Opacity 애니메이션** - 0 → 1 (나타남), 1 → 0 (사라짐)
2. **고정된 Transition 설정** - enter 225ms, exit 195ms
3. **react-transition-group 활용** - Transition 컴포넌트 래핑

---

## 핵심 학습 포인트

### 1. Opacity 기반 Transition의 핵심

```javascript
// 라인 29-39: Enter 애니메이션
const handleEnter = (node, isAppearing) => {
  node.scrollTop; // Force reflow (애니메이션 시작 전 필수)

  const duration = style?.transitionDuration || 225;
  const easing = style?.transitionTimingFunction || 'cubic-bezier(0.4, 0, 0.2, 1)';
  const delay = style?.transitionDelay || 0;
  const transition = `opacity ${duration}ms ${easing} ${delay}ms`;

  node.style.webkitTransition = transition;
  node.style.transition = transition;
};
```

**학습 가치**:
- `node.scrollTop` - 브라우저가 현재 스타일을 적용하도록 강제 (reflow)
- CSS transition 문자열 직접 생성 - `opacity 225ms cubic-bezier(...) 0ms`
- webkit prefix 지원 - 구형 브라우저 호환성

### 2. react-transition-group의 Transition 사용

```javascript
// 라인 52-60
<Transition
  appear={true}
  in={inProp}
  nodeRef={enableStrictModeCompat ? nodeRef : undefined}
  onEnter={handleEnter}
  onExit={handleExit}
  timeout={{ enter: 225, exit: 195 }}
  {...other}
>
```

**학습 가치**:
- `in` prop - true면 나타남, false면 사라짐
- `onEnter` / `onExit` - 애니메이션 시작 시 CSS transition 설정
- `nodeRef` - React 18+ Strict Mode 호환성
- `timeout` - 애니메이션 지속 시간

### 3. Render Props 패턴으로 스타일 주입

```javascript
// 라인 62-74
{(state, { ownerState, ...restChildProps }) => {
  return React.cloneElement(children, {
    style: {
      opacity: 0,
      visibility: state === 'exited' && !inProp ? 'hidden' : undefined,
      ...styles[state],
      ...style,
      ...children.props.style,
    },
    ref: nodeRef,
    ...restChildProps,
  });
}}
```

**학습 가치**:
- `state` - 'entering', 'entered', 'exiting', 'exited'
- 초기 opacity: 0 → CSS transition으로 1로 변경
- `visibility: 'hidden'` - exited 상태에서 DOM에서 완전히 숨김
- 스타일 병합 순서 - styles[state] → style prop → children.props.style

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/mui-material/src/Fade/Fade.js (79줄, 원본 232줄)
Fade (forwardRef)
  └─> Transition (react-transition-group)
       └─> children (cloneElement로 props 주입)
            - style: opacity + visibility
            - ref: nodeRef
```

### 2. Styles 상태 매핑

```javascript
// 라인 5-12
const styles = {
  entering: { opacity: 1 },
  entered: { opacity: 1 },
};
```

> **💡 원본과의 차이**:
> - ❌ `exiting`, `exited` 상태 제거 → 초기 opacity: 0으로 충분
> - ❌ 복잡한 스타일 계산 제거 → 단순 opacity 값만

### 3. Transition 콜백 단순화

**원본**:
```javascript
// 6개의 lifecycle 콜백
onEnter, onEntered, onEntering, onExit, onExited, onExiting
```

**수정본**:
```javascript
// 2개만 남음
onEnter, onExit
```

> **💡 원본과의 차이**:
> - ❌ `normalizedTransitionCallback` 유틸리티 제거
> - ❌ 사용자 콜백 호출 제거 (onEnter, onExit props 삭제)
> - ✅ 핵심 기능만 유지 - CSS transition 설정

### 4. Props (3개만 남음)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | element | - | 애니메이션 적용할 자식 |
| `in` | boolean | - | true면 나타남, false면 사라짐 |
| `style` | object | - | 추가 스타일 (transition 설정 오버라이드 가능) |

---

## 커밋 히스토리로 보는 단순화 과정

Fade는 **10개의 커밋**을 통해 단순화되었습니다.

### 1단계: 세밀한 제어 기능 제거
- `f051d6b5` - [Fade 단순화 1/10] addEndListener prop 삭제
  - 커스텀 transition end 트리거 제거
  - 이유: timeout으로 충분, 세밀한 타이밍 제어는 고급 주제

- `3a2776ee` - [Fade 단순화 2/10] appear prop 삭제
  - 초기 마운트 시 transition 여부 제거
  - 이유: 항상 appear=true로 동작, edge case 제거

- `2f4c262d` - [Fade 단순화 3/10] easing prop 삭제
  - transition timing function 커스터마이징 제거
  - 이유: 기본 easing으로 충분, Material Design 표준 사용

- `ab1e0d4d` - [Fade 단순화 4/10] TransitionComponent prop 삭제
  - Transition 컴포넌트 교체 기능 제거
  - 이유: react-transition-group의 Transition으로 고정

### 2단계: Lifecycle 콜백 제거
- `103e10cf` - [Fade 단순화 5/10] Lifecycle 콜백 props 삭제
  - onEnter, onEntered, onEntering, onExit, onExited, onExiting 6개 제거
  - normalizedTransitionCallback 유틸리티 제거
  - 이유: in prop으로 충분, 세밀한 lifecycle 제어는 복잡도만 증가

- `aa9204cb` - [Fade 단순화 6/10] timeout prop 삭제
  - transition duration 커스터마이징 제거
  - 이유: Material Design 표준 duration (225ms/195ms) 고정

### 3단계: 테마 및 유틸리티 시스템 제거
- `00d0b728` - [Fade 단순화 7/10] Theme 시스템 제거
  - useTheme 제거
  - theme.transitions.create → 직접 CSS transition 문자열 생성
  - 이유: 하드코딩된 값으로도 충분히 동작 이해 가능

- `639b49eb` - [Fade 단순화 8/10] Transition 유틸리티 함수 제거
  - reflow, getTransitionProps 제거
  - 이유: 인라인 구현이 더 명확, 함수 추상화 불필요

### 4단계: Ref 처리 및 메타데이터 제거
- `5137066a` - [Fade 단순화 9/10] 복잡한 Ref 처리 제거
  - useForkRef, getReactElementRef 제거
  - 이유: 단순 nodeRef로 충분, ref 병합은 고급 주제

- `c54c094b` - [Fade 단순화 10/10] PropTypes 및 메타데이터 제거
  - PropTypes 정의 80줄 제거
  - elementAcceptingRef 제거
  - 이유: TypeScript로 타입 검증, 런타임 검증 불필요

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 232줄 | 79줄 (66% 감소) |
| **Props 개수** | 14개 | 3개 |
| **Import 개수** | 9개 | 3개 |
| **Lifecycle 콜백** | 6개 | 0개 (내부적으로 onEnter/onExit만 사용) |
| **테마 시스템** | ✅ | ❌ |
| **PropTypes** | ✅ (80줄) | ❌ |
| **useForkRef** | ✅ | ❌ |
| **getTransitionProps** | ✅ | ❌ (인라인) |

---

## 학습 후 다음 단계

Fade를 이해했다면:

1. **Grow** - opacity + scale 애니메이션, timeout='auto' 지원
2. **Slide** - transform(translate) 애니메이션, direction prop
3. **Collapse** - height 애니메이션, collapsedSize prop
4. **실전 응용** - Modal, Dialog, Tooltip 등에서 Fade 활용

**예시: 기본 사용법**
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

**예시: 커스텀 duration**
```javascript
<Fade in={show} style={{ transitionDuration: '300ms' }}>
  <div>Slower fade</div>
</Fade>
```

---

## 핵심 Takeaway

1. **Reflow의 중요성** - `node.scrollTop`으로 브라우저가 스타일을 적용하도록 강제
2. **CSS Transition 직접 제어** - `opacity 225ms cubic-bezier(...) 0ms` 문자열 생성
3. **react-transition-group** - unmount 시 애니메이션을 위한 핵심 라이브러리
4. **Render Props 패턴** - state를 받아서 스타일을 동적으로 주입
5. **단순함의 가치** - 232줄 → 79줄, 핵심 기능만 남기면 이해하기 쉬움
