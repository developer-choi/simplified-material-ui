# Skeleton 컴포넌트

> Material-UI의 Skeleton 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

Skeleton은 **콘텐츠가 로딩되는 동안 플레이스홀더를 표시하는** 컴포넌트입니다.

### 핵심 기능
1. **플레이스홀더 표시** - 로딩 중 콘텐츠 위치에 회색 박스 표시
2. **variant 지원** - text, circular, rounded, rectangular 4가지 형태
3. **애니메이션** - pulse(깜빡임), wave(물결) 2가지 애니메이션
4. **크기 자동 조정** - children 기반 또는 width/height로 크기 지정

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/Skeleton/Skeleton.js (308줄)
Skeleton (React.forwardRef)
  └─> SkeletonRoot (styled span)
       └─> children (선택적, 크기 참조용)
```

### 2. useUtilityClasses

```javascript
const useUtilityClasses = (ownerState) => {
  const { classes, variant, animation, hasChildren, width, height } = ownerState;

  const slots = {
    root: [
      'root',
      variant,
      animation,
      hasChildren && 'withChildren',
      hasChildren && !width && 'fitContent',
      hasChildren && !height && 'heightAuto',
    ],
  };

  return composeClasses(slots, getSkeletonUtilityClass, classes);
};
```

조건에 따라 CSS 클래스 생성:
- `MuiSkeleton-root`
- `MuiSkeleton-text` (variant="text"일 때)
- `MuiSkeleton-pulse` (animation="pulse"일 때)
- `MuiSkeleton-withChildren` (children이 있을 때)

### 3. Keyframes 애니메이션

```javascript
// pulse 애니메이션 - 투명도 변화
const pulseKeyframe = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
`;

// wave 애니메이션 - 좌에서 우로 이동
const waveKeyframe = keyframes`
  0% { transform: translateX(-100%); }
  50% { transform: translateX(100%); }
  100% { transform: translateX(100%); }
`;
```

- pulse: 2초 주기로 투명도 깜빡임
- wave: 2초 주기로 빛이 지나가는 효과 (::after pseudo-element)

### 4. SkeletonRoot (styled 컴포넌트)

```javascript
const SkeletonRoot = styled('span', {
  name: 'MuiSkeleton',
  slot: 'Root',
  overridesResolver: (props, styles) => { /* ... */ },
})(
  memoTheme(({ theme }) => ({
    display: 'block',
    backgroundColor: theme.alpha(
      theme.palette.text.primary,
      theme.palette.mode === 'light' ? 0.11 : 0.13
    ),
    height: '1.2em',
    variants: [
      // text variant - scale 변환으로 텍스트 높이 시뮬레이션
      // circular variant - 원형
      // rounded variant - 둥근 모서리
      // hasChildren - 자식 숨기고 크기 맞춤
      // animation: pulse - 깜빡임
      // animation: wave - 물결 효과
    ],
  })),
);
```

- 기본: 회색 배경, 1.2em 높이
- variant별로 다른 borderRadius 적용
- animation별로 다른 keyframes 적용

### 5. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `animation` | 'pulse' \| 'wave' \| false | 'pulse' | 애니메이션 유형 |
| `children` | ReactNode | - | 크기 참조용 자식 |
| `classes` | object | - | CSS 클래스 오버라이드 |
| `className` | string | - | 외부 클래스 |
| `component` | elementType | 'span' | 루트 요소 타입 |
| `height` | number \| string | - | 높이 |
| `width` | number \| string | - | 너비 |
| `variant` | string | 'text' | text, circular, rounded, rectangular |
| `sx` | object | - | 시스템 스타일 |

### 6. Children 기반 크기 자동 조정

```javascript
const ownerState = {
  ...props,
  animation,
  component,
  variant,
  hasChildren: Boolean(other.children),
};

// hasChildren이 true면:
// - 자식을 visibility: hidden으로 숨김
// - 자식의 크기만큼 Skeleton 크기 설정
// - width가 없으면 maxWidth: 'fit-content'
// - height가 없으면 height: 'auto'
```

---

## 설계 패턴

1. **Placeholder 패턴**
   - 실제 콘텐츠가 로딩되는 동안 시각적 피드백 제공
   - 레이아웃 시프트 방지

2. **Variants 패턴**
   - 여러 형태(text, circular, rounded)를 하나의 컴포넌트로 제공
   - props로 형태 전환

3. **CSS Animation 패턴**
   - keyframes로 애니메이션 정의
   - variants 배열로 조건부 적용

---

## 복잡도의 이유

Skeleton은 **308줄**이며, 복잡한 이유는:

1. **Theme 시스템** (약 30줄)
   - useDefaultProps
   - useUtilityClasses
   - memoTheme

2. **Keyframes 애니메이션** (약 50줄)
   - pulseKeyframe, waveKeyframe 정의
   - Styled-components vs Pigment CSS 호환성 처리
   - pulseAnimation, waveAnimation 래퍼

3. **SkeletonRoot styled 컴포넌트** (약 130줄)
   - 기본 스타일
   - 4가지 variant 스타일
   - 2가지 animation 스타일
   - hasChildren 관련 스타일

4. **PropTypes** (약 59줄)
   - 런타임 타입 검증

---

## Skeleton vs 다른 로딩 표시

| 컴포넌트 | 용도 |
|---------|------|
| Skeleton | 콘텐츠 형태를 미리 보여주는 플레이스홀더 |
| CircularProgress | 작업 진행 중 표시 (시간 불명확) |
| LinearProgress | 작업 진행률 표시 (0-100%) |
| Backdrop + CircularProgress | 전체 화면 블로킹 로딩 |
