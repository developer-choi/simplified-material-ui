# Slide 컴포넌트

> 자식 엘리먼트를 특정 방향에서 밀어 넣거나 밀어 내는 슬라이드 전환 애니메이션 컴포넌트

---

## 이 문서의 목적

**이 문서는 단순화된 코드의 "상세 학습 가이드"입니다.**

라이브러리 코드는 복잡합니다. 단순화했더라도 코드만 보고는 이해하기 어려울 수 있습니다.
이 문서는 코드의 **동작 원리, 핵심 패턴, 왜 이렇게 구현했는지**를 상세히 설명하여 학습을 돕습니다.

> **원본 구조 파악**: 원본 코드의 빠른 이해는 `Slide-original.md` 참고

---

## 무슨 기능을 하는가?

수정된 Slide는 **자식 엘리먼트를 4가지 방향에서 슬라이드 인/아웃하는 전환 애니메이션** 컴포넌트입니다.

### 핵심 기능 (남은 것)

1. **위치 계산** - `getBoundingClientRect()`로 현재 위치 파악, 방향에 따라 화면 밖 좌표 계산
2. **CSS transform 애니메이션** - JS로 `style.transform`과 `style.transition`을 직접 조작
3. **react-transition-group 통합** - `Transition` 상태 머신(enter/entering/exit/exited)에 맞게 스타일 적용
4. **resize 대응** - `up`/`left` 방향일 때 창 크기 변경 시 화면 밖 위치 재계산

---

## 핵심 학습 포인트

이 컴포넌트에서 배울 수 있는 **핵심 개념과 패턴**을 코드와 함께 설명합니다.

### 1. reflow 강제 — 브라우저가 스타일을 즉시 반영하게 만들기

```javascript
const handleEnter = () => {
  const node = nodeRef.current;
  setTranslateValue(direction, node);  // 화면 밖으로 이동
  node.getBoundingClientRect();         // reflow 강제
};
```

**학습 가치**:
- 브라우저는 성능을 위해 스타일 변경을 일괄 처리(batch)하려고 함
- `setTranslateValue` 직후 바로 `transition` + `transform: none`을 설정하면 브라우저가 시작/끝 상태를 구분 못해 애니메이션이 발생하지 않음
- `getBoundingClientRect()` 호출이 레이아웃 계산을 강제 → 브라우저가 "여기서 한 번 처리해야 함"을 인식
- 이후 `handleEntering`에서 `transition`을 설정하면 비로소 애니메이션이 동작

**흐름 요약**:
```
setTranslateValue → node는 화면 밖에 있음 (브라우저 아직 미처리)
getBoundingClientRect() → 브라우저가 레이아웃 강제 확정
handleEntering → transition 설정 + transform: none → 애니메이션 발생!
```

### 2. Transition 상태 머신 활용

```javascript
// Transition이 관리하는 4가지 상태:
// exited → entering → entered (in=true일 때)
// entered → exiting → exited (in=false일 때)
```

각 핸들러의 역할:

| 핸들러 | 상태 | 역할 |
|--------|------|------|
| `handleEnter` | enter | 화면 밖에 배치 (시작 위치 설정) |
| `handleEntering` | entering | transition 설정 + `transform: none`으로 복귀 |
| `handleExit` | exit | transition 설정 + 화면 밖으로 이동 |
| `handleExited` | exited | transition 제거 (숨겨진 상태에서 transition 불필요) |

**학습 가치**:
- react-transition-group의 `Transition`은 상태를 관리할 뿐, 실제 스타일 적용은 개발자가 직접 구현
- CSS 클래스 기반이 아닌 JS로 직접 `style.*`를 조작하는 방식

### 3. 현재 transform 오프셋 계산

```javascript
const computedStyle = window.getComputedStyle(node);
const transform = computedStyle.getPropertyValue('transform');

if (transform && transform !== 'none' && typeof transform === 'string') {
  // "matrix(1, 0, 0, 1, 50, 100)" 형태 파싱
  const transformValues = transform.split('(')[1].split(')')[0].split(',');
  offsetX = parseInt(transformValues[4], 10);  // translateX
  offsetY = parseInt(transformValues[5], 10);  // translateY
}
```

**학습 가치**:
- 엘리먼트에 이미 transform이 적용된 경우, 이 값을 감안해야 올바른 "화면 밖" 위치 계산 가능
- CSS matrix 값 파싱: `matrix(scaleX, skewY, skewX, scaleY, translateX, translateY)`
- 인덱스 4 = X 오프셋, 인덱스 5 = Y 오프셋

### 4. resize 대응이 left/up에만 필요한 이유

```javascript
React.useEffect(() => {
  // Skip configuration where the position is screen size invariant.
  if (inProp || direction === 'down' || direction === 'right') {
    return undefined;
  }
  // ...
}, [direction, inProp]);
```

**왜 down/right는 resize 불필요한가?**

- `down`: `translateY(-${rect.top + rect.height}px)` → 엘리먼트 자신의 크기 기반 → 창 크기와 무관
- `right`: `translateX(-${rect.left + rect.width}px)` → 엘리먼트 자신의 위치 기반 → 창 크기와 무관
- `left`: `translateX(${window.innerWidth - rect.left}px)` → `window.innerWidth` 사용 → 창 크기 변경 시 재계산 필요
- `up`: `translateY(${window.innerHeight - rect.top}px)` → `window.innerHeight` 사용 → 창 크기 변경 시 재계산 필요

### 5. updatePosition의 두 번째 useEffect

```javascript
const updatePosition = React.useCallback(() => {
  if (nodeRef.current) {
    setTranslateValue(direction, nodeRef.current);
  }
}, [direction]);

React.useEffect(() => {
  if (!inProp) {
    updatePosition();
  }
}, [inProp, updatePosition]);
```

**왜 필요한가?**
- `direction`이 바뀌었을 때 (예: 'left' → 'up'), 숨겨진 상태의 엘리먼트를 새 방향에 맞게 재배치 필요
- `in=false` (숨겨진) 상태에서 방향이 바뀌면 → `updatePosition`이 새 방향으로 `setTranslateValue` 호출

---

## 내부 구조

### 1. 렌더링 구조

```
// 위치: packages/mui-material/src/Slide/Slide.js (138줄, 원본 405줄)

Slide
  └─> Transition (react-transition-group)  ← 상태 머신 관리
       └─> children (React.cloneElement)   ← ref + visibility style 주입
```

### 2. 핵심 상태 (ref, state, 변수)

| 이름 | 타입 | 용도 |
|------|------|------|
| `nodeRef` | ref | 자식 DOM 엘리먼트 참조 (transform 적용 대상) |
| `timeout` | 상수 | 전환 시간: enter 225ms, exit 195ms |

### 3. 함수 역할

#### getTranslateValue(direction, node)

- **역할**: 방향에 따른 "화면 밖" CSS transform 문자열 계산
- **호출 시점**: `setTranslateValue` 내부에서 호출
- **핵심 로직**:

```javascript
function getTranslateValue(direction, node) {
  const rect = node.getBoundingClientRect();  // 현재 위치
  const transform = window.getComputedStyle(node).getPropertyValue('transform');

  // 이미 적용된 transform 오프셋 추출 (CSS matrix 파싱)
  let offsetX = 0, offsetY = 0;
  if (transform && transform !== 'none') {
    const values = transform.split('(')[1].split(')')[0].split(',');
    offsetX = parseInt(values[4], 10);
    offsetY = parseInt(values[5], 10);
  }

  if (direction === 'left')  return `translateX(${window.innerWidth + offsetX - rect.left}px)`;
  if (direction === 'right') return `translateX(-${rect.left + rect.width - offsetX}px)`;
  if (direction === 'up')    return `translateY(${window.innerHeight + offsetY - rect.top}px)`;
  /* down */                 return `translateY(-${rect.top + rect.height - offsetY}px)`;
}
```

- **왜 이렇게 구현했는가**: `rect.left`, `rect.top`은 뷰포트 기준 위치 → 화면 밖으로 밀어낼 만큼의 거리를 정확히 계산

#### setTranslateValue(direction, node) — named export

- **역할**: `getTranslateValue`로 계산한 값을 DOM에 적용
- **호출 시점**: `handleEnter`, `handleExit`, `updatePosition`, resize 핸들러
- **왜 named export인가**: Drawer 컴포넌트 등 외부에서도 사용

#### handleEnter()

- **역할**: 슬라이드 시작 전 엘리먼트를 화면 밖에 배치 + reflow 강제
- **핵심**: `setTranslateValue` 후 `getBoundingClientRect()` 호출 (reflow 트리거)

#### handleEntering()

- **역할**: enter 방향 transition 설정 + `transform: none`으로 원래 위치 복귀
- **핵심**: `transition`을 먼저 설정하고 `transform: none`으로 애니메이션 발생

#### handleExit()

- **역할**: exit 방향 transition 설정 + 화면 밖 위치로 이동
- **핵심**: `transition` 설정 후 `setTranslateValue`로 화면 밖 좌표 적용

#### handleExited()

- **역할**: 숨겨진 상태에서 transition 제거
- **왜**: 숨겨진 상태에서 방향 변경 시 transition 없이 즉시 새 위치로 이동해야 함

### 4. 동작 흐름

#### 슬라이드 인 플로우차트 (in: false → true)

```
in=false → in=true 변경
        ↓
onEnter 호출
        ↓
┌─────────────────────────────────┐
│ setTranslateValue(direction)    │ → 엘리먼트를 화면 밖으로 이동
│ getBoundingClientRect() reflow  │ → 브라우저가 스타일 확정
└─────────────────────────────────┘
        ↓
onEntering 호출
        ↓
┌─────────────────────────────────┐
│ transition 설정 (225ms easeOut) │
│ transform: none (원래 위치로)   │ → 애니메이션 시작!
└─────────────────────────────────┘
        ↓ (225ms 후)
entered 상태 → 화면에 표시됨
```

#### 슬라이드 아웃 플로우차트 (in: true → false)

```
in=true → in=false 변경
        ↓
onExit 호출
        ↓
┌─────────────────────────────────┐
│ transition 설정 (195ms sharp)   │
│ setTranslateValue (화면 밖으로) │ → 애니메이션 시작!
└─────────────────────────────────┘
        ↓ (195ms 후)
onExited 호출
        ↓
┌─────────────────────────────────┐
│ transition 제거 ('')            │
│ visibility: hidden              │
└─────────────────────────────────┘
```

#### 시나리오 예시

**시나리오 1: direction='left', in=false → true**
```
엘리먼트가 오른쪽 화면 밖에서 시작 (rect.left = 100, window.innerWidth = 1200)
→ handleEnter: translateX(1200 - 100 = 1100px) 적용 → 오른쪽 밖으로
→ handleEntering: transition + transform: none → 왼쪽 방향으로 슬라이드 인
```

**시나리오 2: direction='down', in=true → false**
```
엘리먼트가 현재 화면 내에 표시 중 (rect.top = 200, rect.height = 300)
→ handleExit: transition + translateY(-(200+300) = -500px) 적용
→ 위로 슬라이드 아웃 (화면 위쪽으로 사라짐)
```

### 5. 핵심 패턴/플래그

#### `visibility: hidden` vs `display: none`

```javascript
style: {
  visibility: state === 'exited' && !inProp ? 'hidden' : undefined,
  ...children.props.style,
},
```

- **비유**: "투명 망토" vs "존재 자체를 지움"
- `visibility: hidden`: 엘리먼트 자리는 유지하되 보이지 않음 → 레이아웃 영향 있음
- `display: none`: 레이아웃에서 완전히 제거 → 재등장 시 reflow 발생
- Slide에서 `visibility`를 쓰는 이유: exited 상태에서 `getBoundingClientRect()`가 여전히 정확한 위치 반환해야 함

#### reflow가 필요한 이유 (심화)

```javascript
// 왜 reflow가 필요한가?
node.style.transform = 'translateX(1100px)';  // 화면 밖으로
// 브라우저: "나중에 한꺼번에 처리할게요" (batching)
node.getBoundingClientRect();                  // "지금 당장 처리하세요!" (강제)
node.style.transition = 'transform 225ms ...';// 이제 transition이 적용됨
node.style.transform = 'none';                // 애니메이션 발생!
```

### 6. 주요 변경 사항 (원본 대비)

**원본과의 차이**:
- ❌ `normalizedTransitionCallback` 패턴 제거 → 핸들러가 직접 `nodeRef.current` 접근
- ❌ `onEnter/Entered/Entering/Exit/Exited/Exiting` props 제거 → 외부 콜백 주입 불가
- ❌ `addEndListener` 제거 → timeout 기반 종료만 지원
- ❌ `easing/appear/style/timeout` props 제거 → 고정값으로 대체
- ❌ `useTheme()` 제거 → easing 값 하드코딩
- ❌ `container` prop 제거 → window 기준 고정
- ❌ `debounce` 제거 → 직접 addEventListener (resize 최적화 없음)
- ❌ `useForkRef/getReactElementRef/forwardRef` 제거 → 외부 ref 전달 불가
- ❌ `ownerState` → 렌더 콜백에서 제거
- ❌ `-webkit-` prefix 제거 → 현대 브라우저만 지원
- ❌ `fakeTransform` 제거 → 테스팅 유틸리티 제거
- ✅ `getTranslateValue` / `setTranslateValue` 핵심 위치 계산 로직 유지
- ✅ `Transition` 기반 상태 머신 유지
- ✅ resize 대응 useEffect 유지 (left/up 방향)
- ✅ `direction` 변경 시 위치 갱신 useEffect 유지

### 7. Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `in` | boolean | - | 전환 트리거 (true=슬라이드 인, false=아웃) |
| `direction` | `'left' \| 'right' \| 'up' \| 'down'` | `'down'` | 슬라이드 방향 |
| `children` | ReactElement | - | 대상 엘리먼트 (ref 받을 수 있어야 함) |

**제거된 Props**:
- ❌ `timeout` - 225ms/195ms 고정
- ❌ `easing` - easeOut/sharp 고정
- ❌ `appear` - 항상 true
- ❌ `style` - children.props.style 병합만
- ❌ `container` - window 기준 고정
- ❌ `addEndListener` - timeout 기반 종료
- ❌ `TransitionComponent` - Transition 고정
- ❌ `onEnter/Entering/Entered/Exit/Exiting/Exited` - 생명주기 콜백 제거

---

## 커밋 히스토리로 보는 단순화 과정

Slide는 **11개의 커밋**을 통해 단순화되었습니다.

### 1단계: PropTypes 및 메타데이터 제거

- `f4d7fb89` - [Slide 단순화 1/11] PropTypes 및 메타데이터 제거

**삭제된 코드**:
```javascript
import PropTypes from 'prop-types';
import chainPropTypes from '@mui/utils/chainPropTypes';
import HTMLElementType from '@mui/utils/HTMLElementType';
import elementAcceptingRef from '@mui/utils/elementAcceptingRef';
// + Slide.propTypes = { ... } 블록 (133줄)
```

**왜 불필요한가**: TypeScript 환경에서 런타임 타입 검사 불필요. `chainPropTypes`로 복잡한 container 유효성 검사 포함.

### 2단계: TransitionComponent prop 제거

- `a99d0460` - [Slide 단순화 2/11] TransitionComponent prop 제거

**삭제된 코드**:
```javascript
TransitionComponent = Transition,  // 비구조화에서 제거
// <TransitionComponent ...> → <Transition ...>
```

**왜 불필요한가**: 내부 전환 컴포넌트를 교체할 필요 없음. Transition 고정이 더 명확.

### 3단계: Lifecycle callback props + normalizedTransitionCallback 제거

- `80d3b3ab` - [Slide 단순화 3/11] Lifecycle callback props + normalizedTransitionCallback 제거

**삭제된 코드**:
```javascript
// normalizedTransitionCallback 래퍼 패턴
const normalizedTransitionCallback = (callback) => (isAppearing) => {
  if (callback) {
    if (isAppearing === undefined) { callback(childrenRef.current); }
    else { callback(childrenRef.current, isAppearing); }
  }
};
// onEnter, onEntered, onEntering, onExit, onExited, onExiting props
```

**왜 불필요한가**: 외부 콜백 주입은 별도 학습 주제. 핵심 로직(위치 계산)에 집중. 핸들러가 직접 `nodeRef.current` 접근으로 단순화.

### 4단계: addEndListener 제거

- `e958f651` - [Slide 단순화 4/11] addEndListener 제거

**삭제된 코드**:
```javascript
const handleAddEndListener = (next) => {
  if (addEndListener) { addEndListener(childrenRef.current, next); }
};
```

**왜 불필요한가**: timeout 기반 종료로 충분. transitionend 이벤트 기반 고급 제어는 학습 외 범위.

### 5단계: easing/appear/style props 제거 + getTransitionProps 인라인화

- `f340913e` - [Slide 단순화 5/11] easing/appear/style props 제거 + getTransitionProps 인라인화

**삭제된 코드**:
```javascript
import { reflow, getTransitionProps } from '../transitions/utils';
// ...
const transitionProps = getTransitionProps({ timeout, style, easing: easingProp }, { mode: 'enter' });
node.style.transition = theme.transitions.create('transform', { ...transitionProps });
```

**왜 불필요한가**: `getTransitionProps`는 `style.transitionDelay`, `easing`, `timeout`을 조합하는 유틸. 고정값으로 직접 문자열 사용이 더 직관적.

### 6단계: timeout prop 제거 → 고정값

- `8347481c` - [Slide 단순화 6/11] timeout prop 제거 (225ms/195ms 고정)

**삭제된 코드**:
```javascript
const defaultTimeout = {
  enter: theme.transitions.duration.enteringScreen,
  exit: theme.transitions.duration.leavingScreen,
};
// timeout = defaultTimeout 기본값 prop
```

**왜 불필요한가**: MUI 기본값 225ms/195ms으로 고정. 테마에서 가져오는 필요 없음.

### 7단계: Theme 시스템 제거

- `cb5cdd12` - [Slide 단순화 7/11] Theme 시스템 제거 (easing 하드코딩)

**삭제된 코드**:
```javascript
import { useTheme } from '../zero-styled';
const theme = useTheme();
const defaultEasing = {
  enter: theme.transitions.easing.easeOut,  // cubic-bezier(0, 0, 0.2, 1)
  exit: theme.transitions.easing.sharp,     // cubic-bezier(0.4, 0, 0.6, 1)
};
```

**왜 불필요한가**: 테마 시스템은 별도 학습 주제. easing 값을 CSS 문자열로 직접 하드코딩.

### 8단계: container prop + resolveContainer 제거

- `507cb910` - [Slide 단순화 8/11] container prop 제거 (window 기준 고정)

**삭제된 코드**:
```javascript
function resolveContainer(containerPropProp) {
  return typeof containerPropProp === 'function' ? containerPropProp() : containerPropProp;
}
// getTranslateValue 내 containerRect 분기 4곳 제거
// ownerWindow(node) → window 직접 사용
```

**왜 불필요한가**: viewport 기준이 일반적 사용. 커스텀 컨테이너는 고급 기능으로 별도 학습 주제.

### 9단계: debounce 제거

- `3fcb2d26` - [Slide 단순화 9/11] debounce 제거

**삭제된 코드**:
```javascript
import debounce from '../utils/debounce';
const handleResize = debounce(() => { ... });
// handleResize.clear() → 제거
```

**왜 불필요한가**: debounce는 성능 최적화 주제. 직접 addEventListener로 단순화. (학습 코드에서 성능 최적화 불필요)

### 10단계: 복잡한 Ref 처리 및 ownerState 제거

- `6cbe17da` - [Slide 단순화 10/11] 복잡한 Ref 처리 및 ownerState 제거

**삭제된 코드**:
```javascript
import getReactElementRef from '@mui/utils/getReactElementRef';
import useForkRef from '../utils/useForkRef';
// ...
const Slide = React.forwardRef(function Slide(props, ref) {
  const handleRef = useForkRef(getReactElementRef(children), childrenRef, ref);
  // 렌더 콜백: (state, { ownerState, ...restChildProps }) => ...restChildProps
```

**왜 불필요한가**: 외부 ref 전달(forwardRef)은 별도 학습 주제. 내부 nodeRef만으로 충분. `ownerState`는 styled 시스템 없이 불필요.

### 11단계: webkit prefix + fakeTransform 제거

- `5116c8bd` - [Slide 단순화 11/11] webkit prefix + fakeTransform 제거

**삭제된 코드**:
```javascript
if (node.fakeTransform) { transform = node.fakeTransform; }  // 테스팅 유틸리티
computedStyle.getPropertyValue('-webkit-transform') || ...    // webkit 분기
node.style.webkitTransform = transform;  // webkit prefix
node.style.webkitTransition = '...';     // webkit prefix
```

**왜 불필요한가**: 현대 브라우저에서 webkit prefix 불필요. `fakeTransform`은 테스트 환경 전용.

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 405줄 | 138줄 (66% 감소) |
| **Props 개수** | 13개 | 3개 |
| **외부 lifecycle 콜백** | ✅ 6개 | ❌ |
| **Theme 시스템** | ✅ useTheme | ❌ 하드코딩 |
| **container 기준** | ✅ 커스텀/window | ❌ window 고정 |
| **debounce** | ✅ | ❌ |
| **webkit prefix** | ✅ | ❌ |
| **외부 ref 전달** | ✅ forwardRef | ❌ |
| **위치 계산 로직** | ✅ | ✅ |
| **Transition 상태 머신** | ✅ | ✅ |
| **resize 대응** | ✅ | ✅ |

---

## 학습 후 다음 단계

Slide를 이해했다면:

1. **Grow** - 다른 전환 컴포넌트 / scale + opacity 기반 애니메이션 패턴
2. **Collapse** - 높이(height) 기반 전환 / 측정 방식이 다름
3. **Drawer** - Slide를 내부적으로 사용하는 컴포넌트 / `setTranslateValue` named export 활용

**예시: 기본 사용 (아래서 위로 슬라이드 인)**
```javascript
<Slide in={open} direction="up">
  <div>슬라이드 내용</div>
</Slide>
```

**예시: 왼쪽에서 오른쪽으로**
```javascript
<Slide in={open} direction="right">
  <div>메뉴 패널</div>
</Slide>
```

**예시: 토글 버튼으로 제어**
```javascript
const [open, setOpen] = React.useState(false);
<button onClick={() => setOpen(!open)}>토글</button>
<Slide in={open} direction="left">
  <div style={{ position: 'fixed', right: 0, top: 0 }}>사이드 패널</div>
</Slide>
```
