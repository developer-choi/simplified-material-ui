# Link 컴포넌트

> Link 컴포넌트 원본 구조 빠른 파악

**⚠️ 이 문서의 목적**: 간소화 작업 **전에** 원본 코드를 빠르게 이해하기 위한 요약 문서입니다.

---

## 무슨 기능을 하는가?

Link는 **밑줄(underline) 스타일 제어와 키보드 포커스 감지를 갖춘 링크** 컴포넌트입니다.

### 핵심 기능
1. **underline 제어** - `'always' | 'hover' | 'none'` 3가지 밑줄 스타일
2. **키보드 포커스 감지** - `isFocusVisible`로 마우스 클릭 vs 키보드 Tab 포커스를 구분해 포커스 링 표시
3. **Typography 통합** - `styled(Typography)`로 링크에 타이포그래피 variant 적용
4. **color 시스템** - MUI 팔레트 색상 + 커스텀 색상 지원 (CSS 변수 `--Link-underlineColor` 활용)

---

## 주요 코드 구조

### 파일 위치 및 크기

```
packages/mui-material/src/Link/Link.js (335줄)
```

### 렌더링 구조

```
Link
  └─> LinkRoot (styled(Typography))  ← Typography 기반 + 링크 스타일
       └─> children
```

### 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `underline` | string | `'always'` | 밑줄 표시 방식 (always/hover/none) |
| `color` | string | `'primary'` | 링크 색상 (테마 팔레트 또는 커스텀) |
| `component` | element | `'a'` | 루트 엘리먼트 교체 |
| `variant` | string | `'inherit'` | Typography variant |
| `onBlur/onFocus` | func | - | 포커스 이벤트 (isFocusVisible 내부 로직 포함) |
| `className/classes` | - | - | CSS 클래스 시스템 |
| `TypographyClasses` | object | - | Typography 내부 클래스 오버라이드 |
| `sx` | - | - | CSS-in-JS sx prop |

### 핵심 로직 발췌

```javascript
// isFocusVisible로 키보드 포커스 감지
const [focusVisible, setFocusVisible] = React.useState(false);
const handleBlur = (event) => {
  if (!isFocusVisible(event.target)) { setFocusVisible(false); }
};
const handleFocus = (event) => {
  if (isFocusVisible(event.target)) { setFocusVisible(true); }
};

// underline 스타일 (styled 컴포넌트에서)
{ props: { underline: 'hover' }, style: { textDecoration: 'none', '&:hover': { textDecoration: 'underline' } } }
{ props: { underline: 'always' }, style: { textDecoration: 'underline' } }
{ props: { underline: 'none' }, style: { textDecoration: 'none' } }
```

---

## 복잡도의 이유

Link는 **335줄**이며, 복잡한 이유는:

1. **styled(Typography)** - Typography를 기반으로 하는 styled 컴포넌트 (`LinkRoot`) + `memoTheme` + `variants` 배열
2. **color 시스템** - `v6Colors` 맵 + `createSimplePaletteValueFilter`로 팔레트 순회 + `--Link-underlineColor` CSS 변수 + `getTextDecoration` 유틸리티
3. **useUtilityClasses** - `underline`, `component`, `focusVisible` 상태에 따른 동적 클래스 생성
4. **sx prop + 색상 조건 분기** - `v6Colors` 여부에 따라 sx 배열에 `{ color }` 추가 분기
5. **PropTypes** - ~93줄

---

## 간소화 방향

이 컴포넌트를 간소화할 때 제거 고려 대상:

- **PropTypes** - 93줄
- **useDefaultProps** - 함수 파라미터 기본값으로 대체
- **className/classes/TypographyClasses/useUtilityClasses** - 인라인 스타일로 대체
- **color prop** - primary(`#1976d2`) 고정 / v6Colors, getTextDecoration, createSimplePaletteValueFilter 제거
- **component/variant props** - `<a>` 고정, Typography 종속 제거
- **onBlur/onFocus external props** - isFocusVisible 내부 로직은 유지
- **sx prop** - 인라인 style로 충분
- **forwardRef** - 외부 ref 전달 불필요
- **styled(Typography)/LinkRoot** - `<a>` 인라인 스타일로 변환, Typography/memoTheme/useTheme/capitalize 제거

> 상세한 간소화 결과는 `Link-simplified.md` 참고
