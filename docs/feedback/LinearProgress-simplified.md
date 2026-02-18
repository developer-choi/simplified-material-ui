# LinearProgress 컴포넌트

> 진행 상태를 가로 막대로 시각화하는 컴포넌트 (CSS 키프레임 애니메이션 + ARIA)

---

## 이 문서의 목적

**이 문서는 단순화된 코드의 "상세 학습 가이드"입니다.**

라이브러리 코드는 복잡합니다. 단순화했더라도 코드만 보고는 이해하기 어려울 수 있습니다.
이 문서는 코드의 **동작 원리, 핵심 패턴, 왜 이렇게 구현했는지**를 상세히 설명하여 학습을 돕습니다.

> **원본 구조 파악**: 원본 코드의 빠른 이해는 `LinearProgress-original.md` 참고

---

## 무슨 기능을 하는가?

수정된 LinearProgress는 **작업 진행 상태를 가로 막대(bar)로 시각화하는** 컴포넌트입니다.

### 핵심 기능 (남은 것)

1. **3가지 variant** - `indeterminate`(무한 루프), `determinate`(진행률 표시), `buffer`(버퍼+진행률)
2. **CSS 키프레임 애니메이션** - `<style>` 태그로 주입한 `@keyframes`를 `animation` 속성으로 참조
3. **ARIA 접근성** - `role="progressbar"`, `aria-valuenow/min/max`로 스크린리더 지원
4. **CSS transform 진행률** - `translateX(value-100%)` 로 막대 너비를 CSS transform으로 표현

---

## 핵심 학습 포인트

이 컴포넌트에서 배울 수 있는 **핵심 개념과 패턴**을 코드와 함께 설명합니다.

### 1. CSS translateX로 진행률 표현하기

```javascript
const transform = value - 100;
inlineStyles.bar1.transform = `translateX(${transform}%)`;
```

**학습 가치**:
- 진행률 70% → `translateX(-30%)` → bar가 왼쪽으로 30% 밀려나 70%만 보임
- `width`를 바꾸는 것보다 `transform`이 성능 좋음 (GPU 가속, Reflow 없음)
- `transformOrigin: 'left'`가 세트로 필요 — 왼쪽 기준으로 변환해야 올바른 방향으로 채워짐

### 2. `<style>` 태그로 CSS 키프레임 주입

```javascript
const keyframeStyles = `
  @keyframes mui-linear-progress-indeterminate1 {
    0%   { left: -35%;  right: 100%; }
    60%  { left: 100%;  right: -90%; }
    100% { left: 100%;  right: -90%; }
  }
  ...
`;

return (
  <>
    <style>{keyframeStyles}</style>
    <span ... />
  </>
);
```

**학습 가치**:
- CSS-in-JS(emotion/styled) 없이 키프레임 애니메이션을 삽입하는 패턴
- `animation` 속성에서 `@keyframes` 이름을 문자열로 참조 → 이름이 전역 CSS 네임스페이스에 등록됨
- 충돌 방지를 위해 `mui-` 접두사로 고유 이름 부여

### 3. 3가지 variant의 구조 차이

```javascript
const isIndeterminate = variant === 'indeterminate';
const isDeterminate = variant === 'determinate';
const isBuffer = variant === 'buffer';
```

| variant | bar1 역할 | bar2 역할 | 루트 배경 |
|---------|-----------|-----------|-----------|
| `indeterminate` | 애니메이션 bar (1번째) | 애니메이션 bar (2번째) | primary track |
| `determinate` | 진행률 bar | 없음 (렌더 안함) | primary track |
| `buffer` | 진행률 bar (실제 진행) | 버퍼 bar | 투명 (dashed로 대체) |

**학습 가치**:
- 하나의 컴포넌트가 구조가 다른 3가지 시각 표현을 처리하는 패턴
- boolean 플래그(`isIndeterminate`, `isDeterminate`, `isBuffer`)로 분기를 명확히 표현

### 4. buffer variant의 dashed 배경

```javascript
{isBuffer && (
  <span style={{
    backgroundImage: 'radial-gradient(rgba(25, 118, 210, 0.38) 0%, rgba(25, 118, 210, 0.38) 16%, transparent 42%)',
    backgroundSize: '10px 10px',
    animation: 'mui-linear-progress-buffer 3s infinite linear',
  }} />
)}
```

**학습 가치**:
- `radial-gradient` + `backgroundSize`로 점선(dashed) 패턴 생성 — 이미지 없이 CSS만으로 패턴 표현
- buffer는 "아직 불러오지 않은 영역"을 표시하는 개념 → 반투명 점선으로 시각화

---

## 내부 구조

### 1. 렌더링 구조

```
// 위치: packages/mui-material/src/LinearProgress/LinearProgress.js (123줄, 원본 524줄)

<>
  <style>          ← CSS @keyframes 주입 (전역 스타일)
  <span            ← 루트 (role="progressbar", ARIA)
    [isBuffer] <span />    ← dashed 배경 (buffer variant만)
    <span />               ← bar1: 주 진행 바 / indeterminate 1번째 bar
    [!isDeterminate] <span /> ← bar2: indeterminate 2번째 bar / buffer 버퍼 bar
  </span>
</>
```

### 2. 핵심 상태 (ref, state, 변수)

| 이름 | 타입 | 용도 |
|------|------|------|
| `rootProps` | 객체 | ARIA 속성 (`aria-valuenow/min/max`) 동적 추가용 |
| `inlineStyles.bar1` | 객체 | bar1의 `transform` 값 (determinate/buffer 진행률) |
| `inlineStyles.bar2` | 객체 | bar2의 `transform` 값 (buffer의 버퍼값) |
| `isIndeterminate` | boolean | indeterminate variant 여부 플래그 |
| `isDeterminate` | boolean | determinate variant 여부 플래그 |
| `isBuffer` | boolean | buffer variant 여부 플래그 |
| `TRANSITION_DURATION` | 상수 | determinate/buffer의 transition 시간 (4초) |

### 3. 함수 역할

LinearProgress는 별도 함수 없이 렌더링 로직만 포함합니다.

#### 진행률 계산 (컴포넌트 본문)

- **역할**: `value`/`valueBuffer`를 CSS transform 값으로 변환
- **호출 시점**: 매 렌더링마다 실행
- **핵심 로직**:

```javascript
if (variant === 'determinate' || variant === 'buffer') {
  if (value !== undefined) {
    // ARIA 속성 설정
    rootProps['aria-valuenow'] = Math.round(value);
    rootProps['aria-valuemin'] = 0;
    rootProps['aria-valuemax'] = 100;
    // 진행률 → CSS transform 변환
    // 예: 70% → translateX(-30%) → bar가 왼쪽으로 30% 이동 → 70%만 보임
    const transform = value - 100;
    inlineStyles.bar1.transform = `translateX(${transform}%)`;
  }
}
if (variant === 'buffer') {
  if (valueBuffer !== undefined) {
    const transform = (valueBuffer || 0) - 100;
    inlineStyles.bar2.transform = `translateX(${transform}%)`;
  }
}
```

- **왜 이렇게 구현했는가**: `width` 대신 `transform`을 사용하면 GPU 가속이 가능하여 애니메이션이 부드러움

### 4. 동작 흐름

#### variant별 렌더링 플로우차트

```
props.variant 확인
       ↓
┌─────────────────────────────────┐
│ 'indeterminate' ?               │──→ YES → bar1: 애니메이션1, bar2: 애니메이션2
└─────────────────────────────────┘           루트 배경: primary track
       ↓ NO
┌─────────────────────────────────┐
│ 'determinate' ?                 │──→ YES → bar1: translateX(value-100%), bar2: 없음
└─────────────────────────────────┘           ARIA: aria-valuenow 설정
       ↓ NO
'buffer'                                       bar1: translateX(value-100%)
                                               bar2: translateX(valueBuffer-100%)
                                               dashed 배경 렌더링
                                               루트 배경: 투명
```

#### 시나리오 예시

**시나리오 1: determinate 70% 표시**
```
value=70 전달
→ transform = 70 - 100 = -30
→ bar1: translateX(-30%) (bar가 왼쪽으로 30% 밀림 → 70%만 보임)
→ aria-valuenow=70 설정
→ bar2: 렌더링 안함 (!isDeterminate가 false)
```

**시나리오 2: buffer 50% 진행, 70% 버퍼**
```
value=50, valueBuffer=70 전달
→ bar1: translateX(-50%) (실제 진행: 50%)
→ bar2: translateX(-30%) (버퍼: 70%)
→ dashed 배경: 0-100% 전체 점선
→ 루트 배경: 투명 (dashed가 대신 배경 역할)
```

**시나리오 3: indeterminate (로딩 중)**
```
variant 기본값 = 'indeterminate'
→ bar1: @keyframes indeterminate1 애니메이션 (2.1s, 무한)
→ bar2: @keyframes indeterminate2 애니메이션 (1.15s 지연, 무한)
→ ARIA: aria-valuenow 없음 (진행률 불명)
```

### 5. 핵심 패턴/플래그

#### bar의 overflow: hidden 클리핑

- **비유**: "창문 틀 밖의 물체는 보이지 않는다"
- **역할**: 루트 span에 `overflow: hidden`이 있어 `translateX(-30%)`로 이동한 bar의 왼쪽 부분이 클리핑됨

**왜 필요한가?**

```
루트 (width: 100%, overflow: hidden)
|------가시 영역------|
          bar (translateX(-30%))
|-30%-|---70%---|
       ↑ 이 부분만 보임
```

`overflow: hidden`이 없으면 bar가 루트 밖으로 삐져나와 보임

#### indeterminate bar2의 1.15s animation-delay

```javascript
animation: 'mui-linear-progress-indeterminate2 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) 1.15s infinite'
//                                                                                       ↑ 1.15s 지연
```

- **비유**: "두 사람이 달리기를 하는데, 두 번째 사람이 약간 늦게 출발"
- **역할**: bar1이 먼저 지나간 후 bar2가 뒤따라와서 자연스러운 물결 효과를 만듦

### 6. 주요 변경 사항 (원본 대비)

**원본과의 차이**:
- ❌ `styled()` 4개 컴포넌트 제거 → `<span>` + 인라인 `style={}` 로 대체
- ❌ `keyframes` (emotion) 제거 → `<style>` 태그에 plain CSS 문자열로 대체
- ❌ `color` prop 제거 → primary 색상(`#1976d2`, `rgba(25, 118, 210, 0.38)`) 고정
- ❌ `query` variant 제거 → 3가지 variant만 지원
- ❌ RTL(`useRtl()`) 제거 → LTR 고정
- ❌ `forwardRef` 제거 → 외부 ref 전달 불가
- ❌ `className`/`classes` 제거 → CSS 클래스 커스텀 불가
- ❌ `useDefaultProps` 제거 → 함수 파라미터 기본값으로 대체
- ✅ ARIA 속성 유지 → 접근성 지원
- ✅ 3가지 variant 유지 → 핵심 동작 원리 학습 가능
- ✅ CSS transform 진행률 패턴 유지 → 성능 최적화 패턴 학습 가능

### 7. Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `variant` | `'indeterminate' \| 'determinate' \| 'buffer'` | `'indeterminate'` | 표시 방식 |
| `value` | number | - | determinate/buffer의 진행값 (0-100) |
| `valueBuffer` | number | - | buffer variant의 버퍼값 (0-100) |

**제거된 Props**:
- ❌ `color` - primary 고정 (색상 시스템 제거)
- ❌ `className` - CSS 클래스 시스템 제거
- ❌ `classes` - 슬롯별 클래스 오버라이드 제거
- ❌ `query` variant - indeterminate의 단순 반전이라 학습 가치 낮음

---

## 커밋 히스토리로 보는 단순화 과정

LinearProgress는 **9개의 커밋**을 통해 단순화되었습니다.

### 1단계: PropTypes 및 메타데이터 제거

- `06e12e17` - [LinearProgress 단순화 1/9] PropTypes 및 메타데이터 제거

**삭제된 코드**:
```javascript
import PropTypes from 'prop-types';
// ...
LinearProgress.propTypes = {
  classes: PropTypes.object,
  className: PropTypes.string,
  color: PropTypes.oneOfType([...]),
  value: PropTypes.number,
  valueBuffer: PropTypes.number,
  variant: PropTypes.oneOf(['buffer', 'determinate', 'indeterminate', 'query']),
};
```

**왜 불필요한가**:
- **학습 목적**: TypeScript 환경에서 런타임 타입 검사는 불필요
- **복잡도**: ~47줄 메타데이터 제거

### 2단계: useDefaultProps 제거

- `034469d4` - [LinearProgress 단순화 2/9] useDefaultProps 제거

**삭제된 코드**:
```javascript
import { useDefaultProps } from '../DefaultPropsProvider';
// ...
function LinearProgress(inProps) {
  const props = useDefaultProps({ props: inProps, name: 'MuiLinearProgress' });
```

**왜 불필요한가**:
- **학습 목적**: 테마의 `defaultProps`에서 값을 읽는 패턴 → 함수 파라미터 기본값으로 충분
- **복잡도**: DefaultPropsProvider Context 의존성 제거

### 3단계: className/classes/useUtilityClasses 제거

- `2435da88` - [LinearProgress 단순화 3/9] className/classes/useUtilityClasses 제거

**삭제된 코드**:
```javascript
import composeClasses from '@mui/utils/composeClasses';
import { getLinearProgressUtilityClass } from './linearProgressClasses';

function useUtilityClasses(ownerState) {
  const { classes, variant, color } = ownerState;
  const slots = { root: ['root', ...], dashed: [...], bar1: [...], bar2: [...] };
  return composeClasses(slots, getLinearProgressUtilityClass, classes);
}
```

**왜 불필요한가**:
- **학습 목적**: CSS 클래스 시스템은 별도 주제 / 인라인 스타일로 대체
- **복잡도**: useUtilityClasses → composeClasses → getLinearProgressUtilityClass 3단계 체인 제거

### 4단계: color prop 제거 (primary 고정)

- `fd497f2f` - [LinearProgress 단순화 4/9] color prop 제거 (primary 고정)

**삭제된 코드**:
```javascript
import createSimplePaletteValueFilter from '../utils/createSimplePaletteValueFilter';

function getColorShade(theme, color) { ... }

// styled component 내부의 theme.palette 순회
...Object.entries(theme.palette)
  .filter(createSimplePaletteValueFilter())
  .map(([colorName]) => ({
    props: { color: colorName },
    style: { backgroundColor: theme.palette[colorName].main },
  })),
```

**왜 불필요한가**:
- **학습 목적**: 색상 시스템보다 진행 바 동작 원리가 핵심
- **복잡도**: `getColorShade`, `createSimplePaletteValueFilter`, theme.palette 순회 등 수십 줄 제거

### 5단계: query variant 제거

- `c7271de9` - [LinearProgress 단순화 5/9] query variant 제거

**삭제된 코드**:
```javascript
// root styled component에서
...(ownerState.variant === 'query' && {
  transform: 'rotate(180deg)',
}),
```

**왜 불필요한가**:
- **학습 목적**: indeterminate를 180도 회전한 것 — 시각적 변형일 뿐 새 개념 없음
- **복잡도**: `rotate(180deg)` 단 한 줄이지만, 3가지 variant로 단순화

### 6단계: RTL 지원 제거

- `4425c9b5` - [LinearProgress 단순화 6/9] RTL 지원 제거

**삭제된 코드**:
```javascript
import { useRtl } from '@mui/system/RtlProvider';
// ...
const isRtl = useRtl();
// ...
if (isRtl) { transform = -transform; }  // 두 곳
```

**왜 불필요한가**:
- **학습 목적**: 국제화/RTL은 별도 학습 주제 / LTR로 고정해도 핵심 이해 가능
- **복잡도**: transform 계산에 RTL 분기 제거

### 7단계: console.error 개발 경고 제거

- `ee90b8fb` - [LinearProgress 단순화 7/9] console.error 개발 경고 제거

**삭제된 코드**:
```javascript
} else if (process.env.NODE_ENV !== 'production') {
  console.error(
    'MUI: You need to provide a value prop when using the determinate or buffer variant of LinearProgress.'
  );
}
```

**왜 불필요한가**:
- **학습 목적**: 런타임 경고는 프로덕션 코드가 아님
- **복잡도**: `process.env.NODE_ENV` 조건부 코드 2곳 제거

### 8단계: Pigment CSS 호환 분기 제거

- `83c3f8b9` - [LinearProgress 단순화 8/9] Pigment CSS 호환 분기 제거

**삭제된 코드**:
```javascript
import { keyframes, css, styled } from '../zero-styled';
// ...
const indeterminate1Animation = typeof indeterminate1Keyframe !== 'string'
  ? css`animation: ${indeterminate1Keyframe} 2.1s ...`
  : null;
// styled component에서
...(ownerState.variant === 'indeterminate' && {
  ...(indeterminate1Animation || {
    animation: `${indeterminate1Keyframe} 2.1s ...`
  }),
}),
```

**왜 불필요한가**:
- **학습 목적**: 빌드 도구 호환성 코드는 학습 무관
- **복잡도**: `typeof` 런타임 체크 + `css` helper + 3개 animation 변수 제거

### 9단계: styled() → 인라인 스타일 변환

- `90eab21d` - [LinearProgress 단순화 9/9] styled() → 인라인 스타일 변환

**변환된 코드**:
```javascript
// 이전: emotion styled 컴포넌트 4개
const LinearProgressRoot = styled('span', {...})(memoTheme(({ theme }) => ({...})));
const LinearProgressDashed = styled('span', {...})(memoTheme(({ theme }) => ({...})));
// ...

// 이후: <style> 태그 + 인라인 스타일
const keyframeStyles = `@keyframes mui-linear-progress-indeterminate1 { ... }`;
// <style>{keyframeStyles}</style>
// <span style={{ position: 'absolute', backgroundColor: '#1976d2', ... }} />
```

**왜 불필요한가**:
- **학습 목적**: CSS-in-JS보다 컴포넌트 동작 원리가 핵심 / 인라인 스타일이 더 직관적
- **복잡도**: 4개 styled component + memoTheme + overridesResolver + ownerState 전달 제거

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 524줄 | 123줄 (77% 감소) |
| **Props 개수** | 6개 | 3개 |
| **styled 컴포넌트** | 4개 | 0개 |
| **color prop** | ✅ (테마 색상 전체) | ❌ (primary 고정) |
| **query variant** | ✅ | ❌ |
| **RTL 지원** | ✅ | ❌ |
| **CSS 키프레임** | ✅ emotion keyframes | ✅ `<style>` + plain CSS |
| **ARIA 속성** | ✅ | ✅ |
| **3가지 variant** | ✅ (4가지) | ✅ |

---

## 학습 후 다음 단계

LinearProgress를 이해했다면:

1. **CircularProgress** - 동일한 개념(진행 표시)을 원형으로 구현 / SVG + strokeDashoffset 패턴
2. **Slide** - CSS transform을 애니메이션으로 사용하는 또 다른 패턴 (react-transition-group)
3. **실전 응용** - 파일 업로드 진행 표시, 비디오 버퍼링 표시 구현

**예시: 기본 사용 (indeterminate - 로딩 중)**
```javascript
<LinearProgress />
```

**예시: determinate (진행률 70%)**
```javascript
<LinearProgress variant="determinate" value={70} />
```

**예시: buffer (진행률 50%, 버퍼 70%)**
```javascript
<LinearProgress variant="buffer" value={50} valueBuffer={70} />
```
