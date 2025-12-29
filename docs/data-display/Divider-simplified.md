# Divider 컴포넌트

> 가로/세로 구분선을 제공하는 단순화된 컴포넌트

---

## 무슨 기능을 하는가?

수정된 Divider는 **리스트, 메뉴, 레이아웃의 콘텐츠를 시각적으로 구분하는 가로/세로 선을 제공하는** 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **가로/세로 구분선** - orientation prop으로 horizontal 또는 vertical 선 렌더링
2. **텍스트 포함 구분선** - children prop으로 구분선 중간에 텍스트/아이콘 삽입
3. **3가지 배치 옵션** - fullWidth, inset, middle variant 지원
4. **인라인 스타일** - JavaScript 객체 스타일로 간단하게 구현
5. **접근성 지원** - role="separator", aria-orientation 자동 설정

---

## 핵심 학습 포인트

### 1. 조건부 스타일 객체 생성

```javascript
// Variant styles
let variantStyle = {};
if (variant === 'inset') {
  variantStyle.marginLeft = 72;
} else if (variant === 'middle' && orientation === 'horizontal') {
  variantStyle.marginLeft = '16px';
  variantStyle.marginRight = '16px';
} else if (variant === 'middle' && orientation === 'vertical') {
  variantStyle.marginTop = '8px';
  variantStyle.marginBottom = '8px';
}
```

**학습 가치**:
- **조건부 스타일링**: if-else로 props에 따라 다른 스타일 객체 생성
- **객체 병합**: spread 연산자로 baseStyle, variantStyle, orientationStyle 합성
- **읽기 쉬운 코드**: styled-components보다 직관적

### 2. React.createElement로 동적 요소 타입

```javascript
const component = children || orientation === 'vertical' ? 'div' : 'hr';

return React.createElement(component, {
  ref,
  className,
  role,
  style: { ...baseStyle, ...variantStyle, ...orientationStyle },
  ...other,
});
```

**학습 가치**:
- **동적 요소 타입**: JSX는 정적이지만 createElement는 동적 요소 타입 가능
- **Semantic HTML**: children 없고 horizontal이면 `<hr>` (의미론적으로 올바름)
- **Props 전달**: ref, className, other 등 모든 props를 그대로 전달

### 3. 실제 요소로 구분선 렌더링 (children 모드)

```javascript
if (children) {
  return React.createElement(
    component,
    {
      ref,
      className,
      role,
      style: childrenContainerStyle,
      ...other,
    },
    <div style={lineStyle} />,  // 왼쪽 또는 상단 선
    <span style={wrapperStyle}>{children}</span>,  // 텍스트
    <div style={lineStyle} />,  // 오른쪽 또는 하단 선
  );
}
```

**학습 가치**:
- **::before/::after 대체**: pseudo-elements 대신 실제 div 요소 사용
- **Flexbox 활용**: flexGrow: 1로 선이 남은 공간 채우기
- **가독성**: pseudo-elements보다 코드 구조가 명확

### 4. 인라인 스타일 객체 병합

```javascript
const childrenContainerStyle = {
  ...baseStyle,
  ...variantStyle,
  display: 'flex',
  alignItems: 'center',
  textAlign: 'center',
  border: 0,
  ...(orientation === 'vertical' ? { flexDirection: 'column' } : {}),
};
```

**학습 가치**:
- **Spread 연산자**: 여러 스타일 객체를 순서대로 병합
- **조건부 병합**: 삼항 연산자 + spread로 조건부 속성 추가
- **우선순위**: 나중에 spread된 속성이 앞의 속성 덮어씀

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/mui-material/src/Divider/Divider.js (128줄, 원본 355줄)

// children 없을 때
<hr /> 또는 <div />  // orientation과 children에 따라 결정

// children 있을 때
<div>
  <div />  // 왼쪽/상단 선
  <span>  // children wrapper
    {children}
  </span>
  <div />  // 오른쪽/하단 선
</div>
```

### 2. Props 기반 요소 타입 결정

```javascript
const component = children || orientation === 'vertical' ? 'div' : 'hr';
const role = component !== 'hr' ? 'separator' : undefined;
```

**원본과의 차이**:
- ❌ `component` prop 제거 → 자동으로 div/hr 결정
- ✅ children 있거나 vertical → `<div>` (flex 레이아웃 필요)
- ✅ children 없고 horizontal → `<hr>` (semantic HTML)

### 3. 스타일 계산 로직

```javascript
// 1. Base styles (모든 Divider 공통)
const baseStyle = {
  margin: 0,
  flexShrink: 0,
  borderWidth: 0,
  borderStyle: 'solid',
  borderColor: 'rgba(0, 0, 0, 0.12)',
};

// 2. Variant styles (fullWidth, inset, middle)
let variantStyle = {};
if (variant === 'inset') {
  variantStyle.marginLeft = 72;
}
// ... 생략

// 3. Orientation styles (horizontal, vertical)
let orientationStyle = {};
if (orientation === 'vertical') {
  orientationStyle.height = '100%';
  orientationStyle.borderRightWidth = 'thin';
} else {
  orientationStyle.borderBottomWidth = 'thin';
}

// 4. 최종 병합
style: { ...baseStyle, ...variantStyle, ...orientationStyle }
```

**원본과의 차이**:
- ❌ `memoTheme` 제거 → 하드코딩 'rgba(0, 0, 0, 0.12)'
- ❌ `theme.spacing()` 제거 → 직접 '16px', '8px'
- ❌ `styled()` API 제거 → 인라인 스타일
- ❌ `variants` 배열 제거 → if-else 로직

### 4. Children 모드 렌더링

```javascript
const lineStyle = {
  flexGrow: 1,
  ...(orientation === 'vertical'
    ? {
        borderLeft: 'thin solid rgba(0, 0, 0, 0.12)',
        borderLeftStyle: 'solid',
      }
    : {
        borderTop: 'thin solid rgba(0, 0, 0, 0.12)',
        borderTopStyle: 'solid',
      }),
};

const wrapperStyle = {
  display: 'inline-block',
  paddingLeft: '9.6px',  // 8px * 1.2
  paddingRight: '9.6px',
  whiteSpace: 'nowrap',
  ...(orientation === 'vertical' ? {
    paddingTop: '9.6px',
    paddingBottom: '9.6px',
  } : {}),
};
```

**원본과의 차이**:
- ❌ `::before/::after` pseudo-elements 제거 → 실제 div 요소 사용
- ❌ `DividerWrapper` styled component 제거 → span + 인라인 스타일
- ❌ `textAlign` prop 제거 → center 고정 (50%/50% 분할)

### 5. Props (4개만 남음)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | node | - | 구분선 중간에 표시할 콘텐츠 |
| `className` | string | - | 추가 CSS 클래스 |
| `orientation` | 'horizontal' \| 'vertical' | 'horizontal' | 구분선 방향 |
| `variant` | 'fullWidth' \| 'inset' \| 'middle' | 'fullWidth' | 구분선 배치 형태 |

**원본에서 제거된 props**:
- ❌ `absolute` - 절대 위치 배치
- ❌ `classes` - 클래스 오버라이드 객체
- ❌ `component` - 루트 요소 타입 변경
- ❌ `flexItem` - flex container 내 높이 조정
- ❌ `light` - 연한 색상 (deprecated)
- ❌ `role` - ARIA role (내부에서 자동 계산)
- ❌ `sx` - 시스템 스타일 prop
- ❌ `textAlign` - 텍스트 정렬

---

## 커밋 히스토리로 보는 단순화 과정

Divider는 **10개의 커밋**을 통해 단순화되었습니다.

### 1단계: light prop 제거
- `d22b92a5` - [Divider 단순화 1/10] light prop 제거

**무엇을**: Divider의 색상을 더 연하게 만드는 deprecated prop

**왜 불필요한가**:
- **학습 목적**: 핵심은 "구분선"이지 "투명도 조절"이 아님
- **복잡도**: theme.alpha() 함수 호출, variant 블록 추가
- **현실**: Material-UI v6에서 완전히 제거 예정, sx로 대체 권장

### 2단계: absolute prop 제거
- `ade6bbc3` - [Divider 단순화 2/10] absolute prop 제거

**무엇을**: Divider를 절대 위치(absolute position)로 배치하는 prop

**왜 불필요한가**:
- **학습 목적**: 핵심은 "구분선"이지 "포지셔닝"이 아님, CSS position은 별도 주제
- **복잡도**: position, bottom, left, width 4가지 스타일 추가
- **현실**: 테스트에서 1번만 사용, 실제 프로젝트에서 거의 사용하지 않음

### 3단계: flexItem prop 제거
- `169cd19c` - [Divider 단순화 3/10] flexItem prop 제거

**무엇을**: Flex container 내에서 Divider의 높이를 자동으로 맞추는 prop

**왜 불필요한가**:
- **학습 목적**: 핵심 기능과 무관한 특수 케이스, Flexbox는 CSS의 별도 주제
- **복잡도**: alignSelf: 'stretch', height: 'auto' 속성 추가
- **현실**: 테스트에서 1번 사용, 대부분 일반 Divider로 충분

### 4단계: component prop 제거
- `c4426f06` - [Divider 단순화 4/10] component prop 제거

**무엇을**: Divider의 HTML 요소를 변경할 수 있는 prop

**왜 불필요한가**:
- **학습 목적**: semantic HTML 학습에서 hr/div 자동 결정이 더 명확
- **복잡도**: 기본값 계산 로직, role/aria-orientation 계산에 영향
- **일관성**: 다른 단순화 컴포넌트도 component prop 제거

### 5단계: textAlign prop 제거
- `4f3b0cb1` - [Divider 단순화 5/10] textAlign prop 제거

**무엇을**: children이 있을 때 텍스트 정렬 위치 (left/center/right)

**왜 불필요한가**:
- **학습 목적**: 핵심은 "구분선"이지 "텍스트 정렬"이 아님
- **복잡도**: 2개의 variant 블록, ::before/::after width 조정 (90%/10%, 10%/90%)
- **현실**: 대부분 center(기본값) 사용, left/right는 매우 드물게 사용

### 6단계: useDefaultProps 제거
- `097ca9e5` - [Divider 단순화 6/10] useDefaultProps 제거

**무엇을**: 테마에서 기본 props를 가져오는 Hook

**왜 불필요한가**:
- **학습 목적**: Theme 시스템은 Material-UI 전체 주제이지 Divider의 핵심 아님
- **복잡도**: DefaultPropsProvider Context 구독, props 병합 메커니즘
- **일관성**: 모든 단순화 컴포넌트에서 제거

### 7단계: useUtilityClasses 및 classes 제거
- `2ab709fe` - [Divider 단순화 7/10] useUtilityClasses 및 classes 제거

**무엇을**: 동적으로 CSS 클래스 이름을 생성하고 병합하는 시스템

**왜 불필요한가**:
- **학습 목적**: 핵심은 "구분선"이지 "클래스 이름 관리"가 아님
- **복잡도**: useUtilityClasses 22줄, 10가지 조건 체크, composeClasses 호출
- **일관성**: 모든 단순화 컴포넌트에서 제거

### 8단계: Theme 시스템 제거
- `38505c92` - [Divider 단순화 8/10] Theme 시스템 제거

**무엇을**: memoTheme으로 theme 객체를 사용하는 시스템

**왜 불필요한가**:
- **학습 목적**: Theme은 Material-UI 전체 주제이지 Divider의 핵심 아님
- **복잡도**: memoTheme wrapper, theme.vars || theme 조건, theme.spacing() 호출
- **일관성**: 모든 단순화 컴포넌트에서 제거

### 9단계: Styled Components 제거
- `6208139e` - [Divider 단순화 9/10] Styled Components 제거

**무엇을**: DividerRoot, DividerWrapper styled components

**왜 불필요한가**:
- **학습 목적**: Divider 구조 배우는 것이지 styled API 배우는 게 아님
- **복잡도**: DividerRoot 159줄, DividerWrapper 27줄, overridesResolver 56줄, variants 12개
- **일관성**: 모든 단순화 컴포넌트에서 제거

### 10단계: PropTypes 및 메타데이터 제거
- `074876cd` - [Divider 단순화 10/10] PropTypes 및 메타데이터 제거

**무엇을**: PropTypes 타입 검증 및 주석

**왜 불필요한가**:
- **학습 목적**: PropTypes는 타입 검증 도구이지 컴포넌트 로직 아님
- **복잡도**: PropTypes 정의 45줄, JSDoc 주석
- **일관성**: 모든 단순화 컴포넌트에서 제거

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 355줄 | 128줄 (64% 감소) |
| **Props 개수** | 11개 (+ sx, role 등) | 4개 (children, className, orientation, variant) |
| **Styled Components** | ✅ (DividerRoot 159줄, DividerWrapper 27줄) | ❌ (인라인 스타일) |
| **Theme 통합** | ✅ (memoTheme, palette, spacing) | ❌ (하드코딩) |
| **Utility Classes** | ✅ (useUtilityClasses 22줄) | ❌ (className 단순 전달) |
| **PropTypes** | ✅ (45줄) | ❌ |
| **Pseudo-elements** | ✅ (::before, ::after) | ❌ (실제 div 요소) |
| **useDefaultProps** | ✅ | ❌ (함수 파라미터 기본값) |

---

## 학습 후 다음 단계

Divider를 이해했다면:

1. **ListItem** - 리스트 아이템 사이에 Divider 사용법
2. **Menu** - 메뉴 아이템 구분에 Divider 사용법
3. **Grid/Stack** - 레이아웃 컴포넌트와 Divider 조합
4. **실전 응용** - 대시보드 섹션 구분, 사이드바 메뉴 구분

**예시: 기본 구분선**
```javascript
import Divider from '@mui/material/Divider';

function MyList() {
  return (
    <div>
      <p>Item 1</p>
      <Divider />
      <p>Item 2</p>
      <Divider />
      <p>Item 3</p>
    </div>
  );
}
```

**예시: 텍스트 포함 구분선**
```javascript
<Divider>중요 섹션</Divider>
```

**예시: 세로 구분선**
```javascript
<div style={{ display: 'flex', height: 100 }}>
  <span>Left</span>
  <Divider orientation="vertical" />
  <span>Right</span>
</div>
```

**예시: Variant 사용**
```javascript
<Divider variant="inset" />  // 왼쪽 마진 72px
<Divider variant="middle" />  // 좌우 마진 16px
```

**예시: Vertical + Middle**
```javascript
<div style={{ display: 'flex', height: 100 }}>
  <span>Top</span>
  <Divider orientation="vertical" variant="middle" />  // 상하 마진 8px
  <span>Bottom</span>
</div>
```
