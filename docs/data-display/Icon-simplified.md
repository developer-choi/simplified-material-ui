# Icon 컴포넌트

> Material Icons 폰트 아이콘을 표시하는 간단한 span 래퍼

---

## 무슨 기능을 하는가?

단순화된 Icon은 **Material Icons 폰트를 사용하여 ligature 방식으로 아이콘을 표시하는** 컴포넌트입니다.

### 핵심 기능 (남은 것)

1. **Material Icons ligature 표시** - children으로 받은 아이콘 이름(예: 'home', 'search')을 Material Icons 폰트로 렌더링
2. **고정 스타일** - 24px 크기의 아이콘을 인라인 스타일로 표시
3. **스타일 병합** - style prop을 통한 커스터마이징 지원

---

## 핵심 학습 포인트

### 1. Material Icons Ligature 메커니즘

```javascript
<span className="material-icons">home</span>
// 브라우저가 'home' 텍스트를 Material Icons 폰트의 집 아이콘 모양으로 렌더링
```

**학습 가치**:
- **OpenType Ligature**: 폰트 기능으로 텍스트를 아이콘으로 변환
- **접근성**: 스크린 리더가 'home' 텍스트를 읽을 수 있음
- **간편함**: SVG나 이미지 파일 불필요

### 2. 인라인 스타일 병합

```javascript
const iconStyle = {
  userSelect: 'none',
  width: '1em',
  height: '1em',
  overflow: 'hidden',
  display: 'inline-block',
  textAlign: 'center',
  flexShrink: 0,
  fontSize: '1.5rem', // 24px
  ...style, // 사용자 스타일 병합
};
```

**학습 가치**:
- **객체 spread**로 스타일 병합
- 기본 스타일을 유지하면서 사용자 커스터마이징 허용
- CSS-in-JS 없이 순수 인라인 스타일 사용

### 3. className 병합

```javascript
className={clsx(
  'material-icons',
  'notranslate',
  className,
)}
```

**학습 가치**:
- **clsx** 유틸리티로 여러 className 조합
- `notranslate` 클래스로 Google 번역 방지 (폰트 ligature는 번역하면 안됨)
- `material-icons`로 Material Icons 폰트 적용

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/mui-material/src/Icon/Icon.js (44줄, 원본 228줄)
Icon (forwardRef)
  └─> span (인라인 스타일)
       └─> children (아이콘 이름 ligature: 'home', 'search', 'menu' 등)
```

**단순화 포인트**:
- ❌ styled 컴포넌트 제거 → 일반 span 태그
- ❌ ownerState 제거 → props 직접 사용
- ❌ 복잡한 테마 시스템 제거 → 하드코딩된 스타일

### 2. 인라인 스타일 처리

```javascript
const iconStyle = {
  userSelect: 'none',
  width: '1em',
  height: '1em',
  overflow: 'hidden',
  display: 'inline-block',
  textAlign: 'center',
  flexShrink: 0,
  fontSize: '1.5rem', // 24px
  ...style,
};
```

**원본과의 차이**:
- ❌ `styled()` 시스템 제거 → 인라인 스타일로 대체
- ❌ `memoTheme()` 제거 → 하드코딩된 값 사용
- ❌ `theme.typography.pxToRem(24)` → `'1.5rem'` 직접 사용
- ❌ `variants` 배열 제거 → 조건부 스타일 없음
- ✅ `...style` spread로 사용자 스타일 병합 지원

### 3. Props (3개만 남음)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | node | - | 아이콘 이름 ligature (예: 'home', 'search', 'menu') |
| `className` | string | - | 추가 CSS 클래스 |
| `style` | object | - | 인라인 스타일 객체 (iconStyle과 병합됨) |

**추가 props**:
- `ref`: React.forwardRef 지원
- `{...other}`: aria-*, data-* 등 HTML 속성 전달

---

## 커밋 히스토리로 보는 단순화 과정

Icon은 **10개의 커밋**을 통해 단순화되었습니다.

### 1단계: Props 단순화 (Commit 1-5)

#### [1/10] `799b62c4` - component prop 제거
- **무엇을**: 루트 요소의 태그를 변경할 수 있는 prop
- **왜 불필요한가**:
  - Icon의 핵심은 "아이콘 폰트 표시"이지 "루트 태그 변경"이 아님
  - span으로 고정해도 아이콘 표시 기능은 동일
  - 다형성은 Button, Link 등에서만 유용

#### [2/10] `6c084032` - action, disabled 색상 제거
- **무엇을**: theme.palette.action.active, theme.palette.action.disabled 색상
- **왜 불필요한가**:
  - Icon의 핵심은 "아이콘 폰트 표시"이지 "색상 시스템"이 아님
  - 테마 의존성 제거
  - `color: inherit`로 부모 색상 상속

#### [3/10] `ad54fa56` - 동적 palette 색상 제거
- **무엇을**: `Object.entries(theme.palette).filter(...).map(...)`로 생성된 동적 색상
- **왜 불필요한가**:
  - primary, secondary, error 등 동적으로 색상 생성하는 복잡한 로직
  - createSimplePaletteValueFilter 의존성 제거
  - 필요시 CSS나 style prop으로 색상 지정 가능

#### [4/10] `dcb94c83` - fontSize prop 제거
- **무엇을**: inherit, small (20px), medium (24px), large (36px) 크기 옵션
- **왜 불필요한가**:
  - 하나의 크기(24px)만 있어도 개념 이해 충분
  - theme.typography.pxToRem 의존성 제거
  - 필요시 style prop으로 크기 조절 가능

#### [5/10] `601a3bb2` - baseClassName prop 제거
- **무엇을**: 아이콘 폰트의 기본 클래스를 변경하는 prop
- **왜 불필요한가**:
  - Icon의 핵심은 "Material Icons 표시"
  - 다른 아이콘 폰트 지원은 고급 기능
  - 'material-icons' 하나로도 충분히 이해 가능

### 2단계: 테마 시스템 제거 (Commit 6-8)

#### [6/10] `08b58628` - useDefaultProps 제거
- **무엇을**: 테마에서 기본 props를 가져오는 훅
- **왜 불필요한가**:
  - 테마 시스템은 Material-UI 전체의 주제
  - 하드코딩된 기본값으로도 Icon 동작 이해 가능
  - 함수 파라미터 기본값으로 충분

#### [7/10] `eb1f630c` - useUtilityClasses, composeClasses 제거
- **무엇을**: CSS 클래스 이름을 생성하고 병합하는 시스템
- **왜 불필요한가**:
  - CSS 클래스 이름 생성은 스타일 시스템용
  - 인라인 스타일로는 불필요
  - `MuiIcon-colorPrimary` 같은 동적 클래스 제거

#### [8/10] `51dba0b3` - memoTheme 제거
- **무엇을**: 테마 의존 스타일을 메모이제이션하는 래퍼
- **왜 불필요한가**:
  - 테마 시스템은 별도 학습 주제
  - 하드코딩된 값으로도 Icon 이해 가능
  - `theme.typography.pxToRem(24)` → `'1.5rem'`

### 3단계: 스타일 시스템 제거 (Commit 9)

#### [9/10] `00ce5473` - styled 제거 및 인라인 스타일 전환
- **무엇을**: Material-UI의 스타일링 시스템 (styled, ownerState, overridesResolver, variants)
- **왜 불필요한가**:
  - Icon 구조 배우는 것이지 CSS-in-JS 배우는 게 아님
  - 인라인 스타일로도 똑같이 동작
  - 코드 가독성 향상 (스타일이 바로 보임)
- **변경 사항**:
  - `IconRoot` styled 컴포넌트 → 일반 `span` 태그
  - `ownerState` 제거
  - `overridesResolver` 제거
  - `variants` 배열 제거
  - 인라인 `iconStyle` 객체 추가

### 4단계: 메타데이터 제거 (Commit 10)

#### [10/10] `ee9a09e3` - PropTypes 및 메타데이터 제거
- **무엇을**: 런타임 타입 검증을 위한 PropTypes
- **왜 불필요한가**:
  - PropTypes는 타입 검증 도구이지 컴포넌트 로직이 아님
  - TypeScript 사용 시 빌드 타임 검증이 더 강력
  - 프로덕션 빌드 시 자동 제거됨
- **변경 사항**:
  - `PropTypes` import 제거
  - `Icon.propTypes` 전체 제거 (65줄 감소)
  - `Icon.muiName` 제거

---

## 원본과의 차이점

| 항목 | 원본 | 단순화 후 |
|------|------|-----------|
| **코드 라인** | 228줄 | 44줄 (81% 감소) |
| **Import 개수** | 11개 | 2개 (React, clsx만) |
| **Props 개수** | 14개+ | 3개 (children, className, style) |
| **styled 사용** | ✅ (IconRoot) | ❌ |
| **테마 통합** | ✅ (useDefaultProps, useUtilityClasses, memoTheme) | ❌ |
| **color prop** | ✅ (9가지 색상 + 동적 palette) | ❌ (inherit 고정) |
| **fontSize prop** | ✅ (4가지 크기) | ❌ (24px 고정) |
| **baseClassName prop** | ✅ | ❌ ('material-icons' 고정) |
| **component prop** | ✅ | ❌ (span 고정) |
| **PropTypes** | ✅ (65줄) | ❌ |
| **ownerState** | ✅ | ❌ |
| **classes prop** | ✅ | ❌ |
| **sx prop** | ✅ | ❌ |
| **variants** | ✅ (13개) | ❌ |
| **스타일** | CSS-in-JS (styled) | 인라인 스타일 |

---

## 학습 후 다음 단계

Icon을 이해했다면:

1. **SvgIcon** - SVG path를 직접 사용하는 아이콘 컴포넌트 학습
2. **@mui/icons-material** - Material Icons를 SvgIcon 기반으로 제공하는 라이브러리
3. **Ligature vs SVG** - 폰트 ligature와 SVG 아이콘의 차이점 이해
4. **실전 응용** - 커스텀 아이콘 폰트 적용 (Font Awesome 등)

**예시: 기본 사용법**
```javascript
import Icon from './Icon';

function SearchButton() {
  return (
    <button>
      <Icon>search</Icon> 검색
    </button>
  );
}
```

**예시: 스타일 커스터마이징**
```javascript
<Icon style={{ color: '#1976d2', fontSize: '2rem' }}>
  favorite
</Icon>
```

**예시: className으로 커스터마이징**
```javascript
<Icon className="my-icon">home</Icon>

<style>
  .my-icon {
    color: red;
    font-size: 3rem;
    cursor: pointer;
  }
  .my-icon:hover {
    color: darkred;
  }
</style>
```

**예시: 여러 아이콘 사용**
```javascript
function IconExamples() {
  const icons = ['home', 'search', 'menu', 'settings', 'favorite'];

  return (
    <div>
      {icons.map((iconName) => (
        <Icon key={iconName} style={{ margin: '0 8px' }}>
          {iconName}
        </Icon>
      ))}
    </div>
  );
}
```

**예시: ref 전달**
```javascript
function FocusableIcon() {
  const iconRef = React.useRef(null);

  const handleClick = () => {
    iconRef.current?.focus();
  };

  return (
    <>
      <Icon ref={iconRef} style={{ cursor: 'pointer' }} tabIndex={0}>
        star
      </Icon>
      <button onClick={handleClick}>Focus Icon</button>
    </>
  );
}
```

**Material Icons 사용 시 주의사항**:
1. Material Icons 폰트가 로드되어 있어야 함 (Google Fonts CDN 또는 로컬 설치)
2. children으로 전달하는 아이콘 이름은 [Material Icons](https://fonts.google.com/icons) 공식 사이트에서 확인
3. `notranslate` 클래스로 Google 번역 방지 (ligature는 번역하면 안됨)
4. `aria-hidden` 속성으로 스크린 리더에서 숨김 (장식용 아이콘인 경우)
