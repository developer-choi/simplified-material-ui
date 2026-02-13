# CircularProgress 컴포넌트

> CircularProgress 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

CircularProgress는 **SVG 기반으로 원형 로딩 인디케이터를 표시하는** 컴포넌트입니다.

### 핵심 기능
1. **두 가지 variant** - indeterminate (무한 회전), determinate (진행률 표시)
2. **keyframes 애니메이션** - rotate (회전) + dash (stroke-dashoffset 변화)
3. **SVG 기반 렌더링** - circle 요소로 원형 프로그레스바 그리기
4. **커스터마이징** - color (7가지), size, thickness, value

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/CircularProgress/CircularProgress.js (351줄)

CircularProgress (forwardRef)
  └─> CircularProgressRoot (styled('span'))
       └─> CircularProgressSVG (styled('svg'))
            ├─> CircularProgressTrack (styled('circle')) [enableTrackSlot=true]
            └─> CircularProgressCircle (styled('circle'))
```

### 2. keyframes 애니메이션

```javascript
const circularRotateKeyframe = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const circularDashKeyframe = keyframes`
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
`;
```

**두 애니메이션의 역할**:
- **rotate**: span을 360도 회전 (1.4s linear infinite)
- **dash**: circle의 stroke-dashoffset 변화로 "꼬리" 효과 (1.4s ease-in-out infinite)

### 3. indeterminate vs determinate

**indeterminate (무한 회전)**:
- 진행률 모름
- rotate + dash 애니메이션
- strokeDasharray: '80px, 200px' 고정

**determinate (진행률 표시)**:
- value prop (0-100)
- 애니메이션 없음
- strokeDashoffset 동적 계산:
  ```javascript
  const circumference = 2 * Math.PI * ((SIZE - thickness) / 2);
  circleStyle.strokeDashoffset = `${(((100 - value) / 100) * circumference).toFixed(3)}px`;
  ```
- transform: rotate(-90deg) (12시 방향부터 시작)

### 4. SVG 구조

```javascript
<svg viewBox="22 22 44 44">
  {/* 배경 트랙 (선택적) */}
  <circle
    cx={44}
    cy={44}
    r={(44 - 3.6) / 2}  // 20.2
    fill="none"
    strokeWidth={3.6}
  />

  {/* 프로그레스 원 */}
  <circle
    cx={44}
    cy={44}
    r={20.2}
    fill="none"
    strokeWidth={3.6}
    style={{ strokeDasharray, strokeDashoffset }}
  />
</svg>
```

**viewBox 계산**:
- SIZE = 44
- viewBox={`${SIZE / 2} ${SIZE / 2} ${SIZE} ${SIZE}`}
- → viewBox="22 22 44 44"
- 좌표계가 (22, 22)부터 시작, 44x44 영역

### 5. Styled-components 조건 처리

```javascript
const rotateAnimation =
  typeof circularRotateKeyframe !== 'string'
    ? css`animation: ${circularRotateKeyframe} 1.4s linear infinite;`
    : null;
```

**이유**: Styled-components v4+와 Pigment CSS 호환
- Styled-components: keyframes가 객체
- Pigment CSS: keyframes가 문자열로 변환됨

### 6. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `variant` | 'determinate' \| 'indeterminate' | 'indeterminate' | 로딩 타입 |
| `value` | number | 0 | determinate 진행률 (0-100) |
| `color` | 7가지 | 'primary' | 색상 |
| `size` | number \| string | 40 | 크기 (px) |
| `thickness` | number | 3.6 | stroke 두께 |
| `disableShrink` | boolean | false | dash 애니메이션 제거 |
| `enableTrackSlot` | boolean | false | 배경 트랙 표시 |

---

## 설계 패턴

1. **SVG viewBox Pattern**
   - 고정 SIZE (44)로 SVG 좌표 시스템 정의
   - size prop은 width/height만 변경
   - 내부 좌표는 항상 동일 (확대/축소만)

2. **CSS Keyframes Animation**
   - rotate: 전체 회전
   - dash: stroke-dashoffset 변화로 "진행" 효과

3. **Styled-components with Variants**
   - indeterminate / determinate별 다른 스타일
   - color별 동적 스타일 생성 (theme.palette 순회)

4. **Math-based Progress Calculation**
   - circumference = 2πr
   - strokeDashoffset = (100 - value)% × circumference

---

## 복잡도의 이유

CircularProgress는 **351줄**이며, 복잡한 이유는:

1. **두 가지 variant (indeterminate / determinate)**
   - variant별로 다른 로직, 스타일, 애니메이션
   - determinate: circumference 계산, strokeDashoffset, transform

2. **Styled-components 조건 처리 (30줄)**
   - Styled-components v4+ vs Pigment CSS 호환
   - rotateAnimation, dashAnimation 조건부 생성

3. **keyframes 애니메이션 (40줄)**
   - rotate, dash 두 keyframes 정의
   - Styled-components / Pigment CSS 대응

4. **Color 동적 생성**
   - theme.palette 순회
   - 7가지 색상별 variants 배열

5. **useUtilityClasses (12줄)**
   - variant, color, disableShrink별 조건부 className

6. **Styled 컴포넌트 4개**
   - Root, SVG, Circle, Track
   - 각각 memoTheme, variants 배열

7. **PropTypes (82줄)**
   - chainPropTypes 커스텀 검증 (disableShrink)

---

## 비교: 직접 SVG vs CircularProgress

| 기능 | 직접 SVG | CircularProgress |
|------|---------|------------------|
| **기본 표시** | `<svg><circle /></svg>` | `<CircularProgress />` |
| **애니메이션** | CSS @keyframes 직접 작성 | ✅ 자동 |
| **색상** | stroke 하드코딩 | ✅ theme.palette |
| **진행률** | strokeDashoffset 직접 계산 | ✅ value prop |
| **커스터마이징** | CSS 수동 조정 | ✅ size, thickness props |
| **번들 크기** | 0 KB | ~8 KB |

**CircularProgress의 장점**:
- 애니메이션 자동 처리
- Theme 통합
- 진행률 계산 자동

**CircularProgress의 단점**:
- 복잡한 내부 구조
- Styled-components 의존
- 번들 크기 증가
