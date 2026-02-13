# CircularProgress 컴포넌트

> SVG와 CSS 애니메이션으로 구현한 원형 로딩 인디케이터

---

## 이 문서의 목적

**이 문서는 단순화된 코드의 "설명서"입니다.**

CircularProgress의 핵심은 SVG circle 요소와 CSS keyframes 애니메이션입니다. 이 문서는 이러한 기술들이 어떻게 조합되어 회전하는 프로그레스바를 만드는지 상세히 설명합니다.

---

## 무슨 기능을 하는가?

단순화된 CircularProgress는 **SVG circle과 CSS keyframes 애니메이션으로 무한 회전하는 원형 로딩 인디케이터를 표시하는** 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **SVG circle 렌더링** - SVG로 원형 프로그레스바 그리기
2. **rotate 애니메이션** - span을 360도 회전
3. **dash 애니메이션** - strokeDashoffset 변화로 "꼬리" 효과
4. **role="progressbar"** - 접근성 지원

---

## 핵심 학습 포인트

### 1. SVG viewBox와 좌표 시스템

```javascript
const SIZE = 44;
const size = 40;  // 실제 표시 크기
const thickness = 3.6;

<svg viewBox={`${SIZE / 2} ${SIZE / 2} ${SIZE} ${SIZE}`}>
  {/* viewBox="22 22 44 44" */}
  <circle
    cx={SIZE}          // cx={44}
    cy={SIZE}          // cy={44}
    r={(SIZE - thickness) / 2}  // r={20.2}
    strokeWidth={thickness}     // strokeWidth={3.6}
  />
</svg>
```

**학습 가치**:
- **viewBox**: SVG 내부 좌표계 정의
  - `"22 22 44 44"` = (22, 22)부터 시작, 44x44 크기
  - 실제 표시 크기 (size)와 무관하게 내부 좌표는 고정
- **원의 중심**: (44, 44)
- **반지름**: (44 - 3.6) / 2 = 20.2
- **확대/축소**: size만 변경하면 자동으로 확대/축소

### 2. strokeDasharray와 strokeDashoffset

```javascript
const circleStyle = {
  stroke: '#1976d2',
  strokeDasharray: '80px, 200px',  // 80px 선, 200px 공백
  strokeDashoffset: 0,
};
```

**학습 가치**:
- **strokeDasharray**: 선 패턴 정의
  - `'80px, 200px'` = 80px 그리고, 200px 비우기
  - 원의 둘레 중 일부만 표시
- **strokeDashoffset**: 패턴 시작 위치
  - 애니메이션으로 변경하면 "진행" 효과

### 3. CSS keyframes 애니메이션

```javascript
<style>{`
  @keyframes MuiCircularProgress-keyframes-circular-rotate {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes MuiCircularProgress-keyframes-circular-dash {
    0% {
      stroke-dasharray: 1px, 200px;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 100px, 200px;
      stroke-dashoffset: -15px;
    }
    100% {
      stroke-dasharray: 1px, 200px;
      stroke-dashoffset: -126px;
    }
  }
`}</style>
```

**두 애니메이션의 조합**:
- **rotate**: 전체 span을 회전 (1.4s linear infinite)
- **dash**: strokeDasharray + strokeDashoffset 변화 (1.4s ease-in-out infinite)
  - 0%: 거의 없음 (1px)
  - 50%: 반쯤 채워짐 (100px)
  - 100%: 다시 거의 없음 (1px, offset -126px)

**학습 가치**:
- 회전 + 길이 변화 = "진행하는 듯한" 착시 효과
- linear vs ease-in-out 타이밍 함수 차이

---

## 내부 구조

### 1. 렌더링 구조

```javascript
// 위치: packages/mui-material/src/CircularProgress/CircularProgress.js (90줄, 원본 351줄)

<>
  <style>...</style>
  <span (rotate 애니메이션)>
    <svg>
      <circle (dash 애니메이션)/>
    </svg>
  </span>
</>
```

### 2. 핵심 상태 (ref, state, 변수)

| 이름 | 타입 | 용도 |
|------|------|------|
| `SIZE` | 상수 (44) | SVG 내부 좌표계 크기 |
| `size` | 상수 (40) | 실제 표시 크기 (px) |
| `thickness` | 상수 (3.6) | stroke 두께 |
| `circleStyle` | 객체 | 기본 circle 스타일 |
| `rootStyle` | 객체 | span 스타일 (rotate 애니메이션 포함) |
| `circleAnimationStyle` | 객체 | circle 스타일 (dash 애니메이션 포함) |

### 3. 주요 변경 사항 (원본 대비)

**원본과의 차이**:
- ❌ `variant` prop 제거 → 'indeterminate'로 고정
- ❌ `color` prop 제거 → '#1976d2' (primary) 고정
- ❌ `size`, `thickness` prop 제거 → 40, 3.6으로 고정
- ❌ `value` prop 제거 (determinate 전용)
- ❌ `disableShrink` prop 제거
- ❌ `enableTrackSlot` prop 제거 (배경 트랙)
- ❌ styled 시스템 (240줄) → 일반 HTML 요소
- ❌ keyframes 조건 처리 (Styled-components v4+ 호환) → 단순 <style> 태그
- ❌ PropTypes (82줄) 제거
- ✅ SVG 구조 유지
- ✅ 애니메이션 유지
- ✅ forwardRef 유지
- ✅ role="progressbar" 유지

### 4. Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `className` | string | - | 추가 CSS 클래스 |
| `style` | object | - | 인라인 스타일 |
| `...other` | any | - | 기타 HTML 속성 |

**제거된 Props**:
- ❌ `variant`, `color`, `size`, `thickness` - 모두 고정값
- ❌ `value` - determinate 전용
- ❌ `disableShrink`, `enableTrackSlot` - 복잡도 감소

---

## 커밋 히스토리로 보는 단순화 과정

CircularProgress는 **7개의 커밋**을 통해 단순화되었습니다 (계획 9개 → 실제 7개).

### Commit 1: variant 고정

- `385c0884` - variant를 'indeterminate'로 고정

**이유**: determinate (진행률 표시)는 복잡한 계산 로직 필요. indeterminate만으로 로딩 인디케이터 개념 이해 충분.

### Commit 2-6: Props 고정

- `d95c463d` - color, size, thickness, disableShrink, enableTrackSlot 고정

**이유**: 모두 커스터마이징 옵션. 고정값으로도 핵심 동작 이해 가능.

### Commit 7: Theme 시스템 제거

- `81ecf63d` - useDefaultProps, useUtilityClasses, composeClasses 제거

**이유**: Theme 시스템은 Material-UI 전체의 주제. SVG + 애니메이션 학습에 불필요.

### Commit 8: Styled 시스템 제거

- `75301cfb` - styled, keyframes, memoTheme, ownerState 제거 (240줄 → 60줄)

**이유**: CSS-in-JS는 별도 학습 주제. <style> 태그 + 인라인 스타일로 충분.

### Commit 9: PropTypes 제거

- `7accceb4` - PropTypes 제거 (82줄)

**이유**: TypeScript로 타입 검증 가능.

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 351줄 | 90줄 (74.4% 감소) |
| **Props 개수** | 8개 | 2개 (className, style) |
| **variant** | ✅ determinate/indeterminate | ❌ indeterminate 고정 |
| **color** | ✅ 7가지 | ❌ primary (#1976d2) 고정 |
| **size/thickness** | ✅ 커스터마이징 | ❌ 40/3.6 고정 |
| **styled 시스템** | ✅ 240줄 | ❌ <style> 태그 |
| **keyframes 조건** | ✅ Styled-components 호환 | ❌ 단순 @keyframes |
| **SVG 구조** | ✅ | ✅ (유지) |
| **애니메이션** | ✅ | ✅ (유지) |

---

## 학습 후 다음 단계

CircularProgress를 이해했다면:

1. **LinearProgress** - 선형 프로그레스바 (SVG 대신 div + CSS)
2. **SVG 심화** - path, arc 등 복잡한 SVG 도형
3. **CSS 애니메이션 심화** - transition vs animation, 타이밍 함수
4. **실전 응용** - 커스텀 로딩 인디케이터 만들기

**예시: 기본 사용**
```javascript
import CircularProgress from './CircularProgress';

function Loading() {
  return <CircularProgress />;
}
```

**예시: 커스텀 스타일**
```javascript
<CircularProgress
  style={{
    width: 60,
    height: 60,
  }}
/>
```

**예시: 색상 변경**
```javascript
<CircularProgress
  style={{
    filter: 'hue-rotate(120deg)',  // 색상 변경
  }}
/>

{/* 또는 CSS 변수 사용 */}
<CircularProgress
  className="custom-progress"
/>

<style>{`
  .custom-progress circle {
    stroke: #ff5722;  /* deep orange */
  }
`}</style>
```

---

## 결론

단순화된 CircularProgress의 핵심은:
- ✅ **SVG viewBox**: 고정 좌표계로 확대/축소
- ✅ **strokeDasharray/offset**: 원 일부만 표시
- ✅ **두 애니메이션 조합**: rotate + dash = 진행 효과

**핵심 교훈**: 복잡한 styled 시스템, variant 분기, theme 통합을 제거해도, SVG + CSS 애니메이션만으로 충분히 효과적인 로딩 인디케이터를 만들 수 있습니다.
