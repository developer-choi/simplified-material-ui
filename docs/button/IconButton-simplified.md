# IconButton 컴포넌트

> 아이콘을 감싸는 원형 버튼을 제공하는 단순화된 컴포넌트

---

## 무슨 기능을 하는가?

수정된 IconButton은 **아이콘을 클릭 가능한 원형 버튼으로 렌더링하는** 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **원형 버튼** - 아이콘을 감싸는 원형 클릭 영역
2. **색상 변형** - default, inherit, primary, secondary, error, info, success, warning
3. **크기 변형** - small, medium, large 3가지 크기
4. **로딩 상태** - loading prop으로 CircularProgress 표시
5. **edge 조절** - start/end edge로 여백 조절

---

## 핵심 학습 포인트

### 1. 스타일 객체 매핑 패턴

```javascript
// 색상 매핑
const colorMap = {
  default: '#0000008a',
  inherit: 'inherit',
  primary: '#1976d2',
  secondary: '#9c27b0',
  // ...
};

// 크기별 스타일
const sizeStyles = {
  small: { padding: 5, fontSize: '1.125rem' },
  medium: { padding: 8, fontSize: '1.5rem' },
  large: { padding: 12, fontSize: '1.75rem' },
};

// 사용
const buttonColor = colorMap[color] || colorMap.default;
const sizeStyle = sizeStyles[size] || sizeStyles.medium;
```

**학습 가치**:
- props 값을 스타일로 변환하는 매핑 패턴
- fallback 처리로 안전한 기본값 적용
- 스타일 객체 조합으로 최종 스타일 계산

### 2. 조건부 스타일 계산

```javascript
const computedStyle = {
  ...baseStyle,
  ...sizeStyle,
  ...edgeMargin,
  color: loading ? 'transparent' : buttonColor,
  ...(disabled && {
    backgroundColor: 'transparent',
    color: '#0000001f',
  }),
  ...style, // 사용자 style prop 우선
};
```

**학습 가치**:
- 스프레드 연산자로 스타일 합성
- 삼항 연산자로 조건부 스타일
- `...(조건 && 객체)` 패턴으로 조건부 속성 추가
- 사용자 스타일을 마지막에 합성하여 오버라이드 허용

### 3. Loading 상태 처리

```javascript
const loadingId = useId(idProp);
const loadingIndicator = loadingIndicatorProp ?? (
  <CircularProgress aria-labelledby={loadingId} color="inherit" size={16} />
);

return (
  <ButtonBase
    id={loading ? loadingId : idProp}
    disabled={disabled || loading}
    {...other}
  >
    {typeof loading === 'boolean' && (
      <span style={{ display: 'contents' }}>
        <span style={{ ...loadingIndicatorStyle, display: loading ? 'flex' : 'none' }}>
          {loading && loadingIndicator}
        </span>
      </span>
    )}
    {children}
  </ButtonBase>
);
```

**학습 가치**:
- `useId`: 접근성을 위한 고유 ID 생성 (aria-labelledby 연결)
- `??` (nullish coalescing): 기본 로딩 인디케이터 제공
- `typeof loading === 'boolean'`: loading이 명시적으로 설정된 경우만 렌더링
- loading 중 버튼 자동 비활성화

### 4. Edge 마진 계산

```javascript
const getEdgeMargin = (edge, size) => {
  if (!edge) return {};
  const isSmall = size === 'small';
  if (edge === 'start') {
    return { marginLeft: isSmall ? -3 : -12 };
  }
  if (edge === 'end') {
    return { marginRight: isSmall ? -3 : -12 };
  }
  return {};
};
```

**학습 가치**:
- 음수 마진으로 정렬 조정
- size에 따라 다른 마진 값 (작은 버튼은 작은 음수 마진)
- 빈 객체 반환으로 안전한 스프레드

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/mui-material/src/IconButton/IconButton.js (124줄, 원본 347줄)
IconButton (React.forwardRef)
  └─> ButtonBase
       ├─> span (loading wrapper, display: contents)
       │    └─> span (loading indicator)
       │         └─> CircularProgress
       └─> children (아이콘)
```

### 2. 핵심 상태 (ref, state, 변수)

| 이름 | 용도 |
|------|------|
| `loadingId` | 접근성을 위한 고유 ID |
| `loadingIndicator` | 커스텀 또는 기본 로딩 인디케이터 |
| `buttonColor` | colorMap에서 조회한 색상 |
| `sizeStyle` | sizeStyles에서 조회한 크기 스타일 |
| `edgeMargin` | edge에 따른 마진 스타일 |
| `computedStyle` | 최종 합성된 스타일 |

### 3. Props (11개)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | ReactNode | - | 아이콘 컨텐츠 |
| `className` | string | - | 외부 클래스 |
| `color` | string | 'default' | 색상 |
| `disabled` | boolean | false | 비활성화 |
| `disableFocusRipple` | boolean | false | 포커스 리플 비활성화 |
| `edge` | 'start' \| 'end' \| false | false | 여백 조절 |
| `size` | 'small' \| 'medium' \| 'large' | 'medium' | 크기 |
| `style` | object | - | 인라인 스타일 |
| `id` | string | - | ID 속성 |
| `loading` | boolean | null | 로딩 상태 |
| `loadingIndicator` | ReactNode | CircularProgress | 커스텀 로딩 인디케이터 |

---

## 커밋 히스토리로 보는 단순화 과정

IconButton은 **4개의 커밋**을 통해 단순화되었습니다.

### 1단계: useUtilityClasses 제거
- `e4961111` - [IconButton 단순화 1/4] useUtilityClasses 제거
- **왜 불필요한가**: 자동 CSS 클래스 생성(MuiIconButton-root 등)은 테마 커스터마이징용으로 학습 목적과 무관.

### 2단계: useDefaultProps 제거
- `c3f95acd` - [IconButton 단순화 2/4] useDefaultProps 제거
- **왜 불필요한가**: 테마 기반 기본값 시스템은 학습 범위 외. 파라미터 기본값이 더 직관적.

### 3단계: styled 시스템 제거
- `8923d779` - [IconButton 단순화 3/4] styled 시스템 제거
- **왜 불필요한가**: styled-components, variants, memoTheme 시스템은 별도 학습 주제. 인라인 스타일이 바로 보임.

### 4단계: PropTypes 제거
- `16335ee9` - [IconButton 단순화 4/4] PropTypes 제거
- **왜 불필요한가**: PropTypes는 런타임 타입 검증으로 컴포넌트 로직과 무관. TypeScript가 대안.

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 347줄 | 124줄 (64% 감소) |
| **Props 개수** | 12개 | 11개 (classes 제거) |
| **styled 컴포넌트** | IconButtonRoot, IconButtonLoadingIndicator | ButtonBase + 인라인 스타일 |
| **useUtilityClasses** | 자동 클래스 생성 | 제거됨 |
| **useDefaultProps** | 테마 기반 기본값 | 파라미터 기본값 |
| **PropTypes** | 113줄 | 제거됨 |
| **Loading 기능** | 유지 | 유지 |

---

## 학습 후 다음 단계

IconButton을 이해했다면:

1. **ButtonBase** - IconButton이 확장하는 기본 버튼 컴포넌트
2. **Button** - 텍스트 + 아이콘을 지원하는 범용 버튼
3. **CircularProgress** - 로딩 인디케이터 컴포넌트

**예시: 기본 사용**
```javascript
import IconButton from './IconButton';
import DeleteIcon from '@mui/icons-material/Delete';

<IconButton>
  <DeleteIcon />
</IconButton>
```

**예시: 색상 및 크기**
```javascript
<IconButton color="primary" size="large">
  <DeleteIcon />
</IconButton>
```

**예시: 로딩 상태**
```javascript
<IconButton loading={isLoading}>
  <SaveIcon />
</IconButton>
```

**예시: edge 조절**
```javascript
// 툴바에서 왼쪽 정렬 시
<IconButton edge="start">
  <MenuIcon />
</IconButton>

// 툴바에서 오른쪽 정렬 시
<IconButton edge="end">
  <SettingsIcon />
</IconButton>
```

**예시: 커스텀 로딩 인디케이터**
```javascript
<IconButton
  loading={isLoading}
  loadingIndicator={<CustomSpinner />}
>
  <UploadIcon />
</IconButton>
```
