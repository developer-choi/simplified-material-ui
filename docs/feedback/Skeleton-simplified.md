# Skeleton 컴포넌트

> 콘텐츠 로딩 중 플레이스홀더를 표시하는 단순화된 컴포넌트

---

## 무슨 기능을 하는가?

수정된 Skeleton은 **콘텐츠가 로딩되는 동안 회색 플레이스홀더를 표시하는** 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **플레이스홀더 표시** - 로딩 중 콘텐츠 위치에 회색 박스 표시
2. **variant 지원** - text, circular, rounded, rectangular 4가지 형태
3. **크기 지정** - width, height로 크기 지정
4. **children 기반 크기** - 자식 요소 크기에 맞춤

> **참고**: CSS keyframes 애니메이션(pulse, wave)은 인라인 스타일로 구현 불가능하여 정적 스타일로 대체되었습니다.

---

## 핵심 학습 포인트

### 1. Variant 스타일 매핑 패턴

```javascript
// variant별 borderRadius
const variantStyles = {
  text: {
    height: 'auto',
    transformOrigin: '0 55%',
    transform: 'scale(1, 0.60)',
    borderRadius: '4px/7px',
  },
  circular: {
    borderRadius: '50%',
  },
  rounded: {
    borderRadius: '4px',
  },
  rectangular: {
    borderRadius: 0,
  },
};

// 사용
const variantStyle = variantStyles[variant] || {};
```

**학습 가치**:
- props 값을 스타일로 변환하는 매핑 패턴
- `||` fallback으로 안전한 기본값 적용
- 각 variant별로 다른 borderRadius 적용

### 2. text variant의 scale 트릭

```javascript
text: {
  height: 'auto',
  transformOrigin: '0 55%',
  transform: 'scale(1, 0.60)',
  borderRadius: '4px/7px',
}
```

**학습 가치**:
- `scale(1, 0.60)`: 세로만 60%로 축소하여 텍스트 라인 높이 시뮬레이션
- `transformOrigin: '0 55%'`: 축소 기준점을 왼쪽 중앙으로 설정
- `borderRadius: '4px/7px'`: x축/y축 다른 borderRadius (elliptical)

### 3. Children 기반 크기 자동 조정

```javascript
const hasChildren = Boolean(children);

const computedStyle = {
  ...baseStyle,
  ...variantStyle,
  ...(hasChildren && !width && {
    maxWidth: 'fit-content',
  }),
  ...(hasChildren && !height && {
    height: 'auto',
  }),
  width,
  height,
  ...style,
};

return (
  <Component style={computedStyle} {...other}>
    {hasChildren && (
      <span style={{ visibility: 'hidden' }}>
        {children}
      </span>
    )}
  </Component>
);
```

**학습 가치**:
- `visibility: 'hidden'`: 자식을 숨기되 공간은 유지
- `maxWidth: 'fit-content'`: 자식 너비에 맞춤
- `height: 'auto'`: 자식 높이에 맞춤
- children이 있으면 Skeleton이 자식 크기에 맞춰짐

### 4. 조건부 스타일 패턴

```javascript
const computedStyle = {
  ...baseStyle,
  ...variantStyle,
  ...(hasChildren && !width && {
    maxWidth: 'fit-content',
  }),
  ...(hasChildren && !height && {
    height: 'auto',
  }),
  width,
  height,
  ...style,
};
```

**학습 가치**:
- `...(조건 && 객체)` 패턴으로 조건부 속성 추가
- 스프레드 연산자 순서로 우선순위 결정
- 사용자 style이 마지막에 와서 오버라이드 가능

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/mui-material/src/Skeleton/Skeleton.js (97줄, 원본 308줄)
Skeleton (React.forwardRef)
  └─> Component (기본: span)
       └─> span (visibility: hidden, children 있을 때만)
            └─> children
```

### 2. 핵심 상태 (ref, state, 변수)

| 이름 | 용도 |
|------|------|
| `hasChildren` | children 존재 여부 |
| `variantStyle` | variant에 따른 스타일 객체 |
| `computedStyle` | 최종 합성된 스타일 |

### 3. Props (8개)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `animation` | 'pulse' \| 'wave' \| false | 'pulse' | 애니메이션 (정적 스타일로 대체됨) |
| `children` | ReactNode | - | 크기 참조용 자식 |
| `className` | string | - | 외부 클래스 |
| `component` | elementType | 'span' | 루트 요소 타입 |
| `height` | number \| string | - | 높이 |
| `width` | number \| string | - | 너비 |
| `variant` | string | 'text' | text, circular, rounded, rectangular |
| `style` | object | - | 인라인 스타일 |

---

## 커밋 히스토리로 보는 단순화 과정

Skeleton은 **4개의 커밋**을 통해 단순화되었습니다.

### 1단계: useUtilityClasses 제거
- `6cf43833` - [Skeleton 단순화 1/4] useUtilityClasses 제거
- **왜 불필요한가**: 자동 CSS 클래스 생성(MuiSkeleton-root 등)은 테마 커스터마이징용으로 학습 목적과 무관.

### 2단계: useDefaultProps 제거
- `8eac9c85` - [Skeleton 단순화 2/4] useDefaultProps 제거
- **왜 불필요한가**: 테마 기반 기본값 시스템은 학습 범위 외. 파라미터 기본값이 더 직관적.

### 3단계: styled 시스템 제거
- `5acbfc46` - [Skeleton 단순화 3/4] styled 시스템 제거
- **왜 불필요한가**: styled-components, keyframes, memoTheme 시스템은 별도 학습 주제. 인라인 스타일이 바로 보임.
- **참고**: CSS keyframes 애니메이션은 인라인으로 불가능하여 정적 스타일로 대체.

### 4단계: PropTypes 제거
- `00652462` - [Skeleton 단순화 4/4] PropTypes 제거
- **왜 불필요한가**: PropTypes는 런타임 타입 검증으로 컴포넌트 로직과 무관. TypeScript가 대안.

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 308줄 | 97줄 (68% 감소) |
| **Props 개수** | 9개 | 8개 (classes 제거) |
| **styled 컴포넌트** | SkeletonRoot | 일반 span + 인라인 스타일 |
| **애니메이션** | pulse, wave keyframes | 정적 스타일 (제거됨) |
| **useUtilityClasses** | 자동 클래스 생성 | 제거됨 |
| **useDefaultProps** | 테마 기반 기본값 | 파라미터 기본값 |
| **PropTypes** | 59줄 | 제거됨 |

---

## 학습 후 다음 단계

Skeleton을 이해했다면:

1. **CircularProgress** - 작업 진행 중 표시 (시간 불명확)
2. **LinearProgress** - 작업 진행률 표시 (0-100%)
3. **Backdrop** - 전체 화면 블로킹 오버레이

**예시: 기본 사용**
```javascript
import Skeleton from './Skeleton';

// 텍스트 형태
<Skeleton variant="text" />

// 원형
<Skeleton variant="circular" width={40} height={40} />

// 둥근 모서리 직사각형
<Skeleton variant="rounded" width={210} height={60} />
```

**예시: 크기 지정**
```javascript
// 고정 크기
<Skeleton width={200} height={100} />

// 퍼센트
<Skeleton width="100%" height={200} />
```

**예시: children 기반 크기**
```javascript
// 아바타 크기에 맞춤
<Skeleton variant="circular">
  <Avatar />
</Skeleton>

// 텍스트 크기에 맞춤
<Skeleton variant="text">
  <Typography>로딩 중...</Typography>
</Skeleton>
```

**예시: 로딩 상태 토글**
```javascript
function UserCard({ loading, user }) {
  return (
    <div>
      {loading ? (
        <Skeleton variant="circular" width={40} height={40} />
      ) : (
        <Avatar src={user.avatar} />
      )}
      {loading ? (
        <Skeleton variant="text" width={100} />
      ) : (
        <span>{user.name}</span>
      )}
    </div>
  );
}
```
