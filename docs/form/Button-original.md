# Button 컴포넌트

> Material-UI의 Button 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

Button은 **사용자의 클릭 액션을 받아 이벤트를 발생시키는 인터랙티브 UI 요소**입니다.

### 핵심 기능
1. **클릭 이벤트 처리** - 사용자의 마우스/터치/키보드 입력을 받아 onClick 핸들러 실행
2. **시각적 스타일 변형** - variant(text/outlined/contained), color, size 조합으로 다양한 버튼 스타일 제공
3. **로딩 상태 표시** - loading prop으로 비동기 작업 진행 중임을 시각적으로 표현
4. **아이콘 통합** - startIcon/endIcon으로 버튼 내 아이콘 배치 자동화
5. **ButtonGroup 통합** - ButtonGroup 내부에서 Context로 props 공유 및 그룹 스타일 적용

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/Button/Button.js (748줄)
Button (React.forwardRef)
  └─> ButtonRoot (styled ButtonBase)
       ├─> ButtonStartIcon (startIcon이 있을 때)
       ├─> ButtonLoadingIndicator (loading === true일 때)
       │    └─> CircularProgress (기본 로딩 인디케이터)
       ├─> children (버튼 텍스트/내용)
       └─> ButtonEndIcon (endIcon이 있을 때)
```

### 2. 하위 컴포넌트가 담당하는 기능

- **ButtonBase** - 리플 효과, 포커스 관리, 키보드 접근성, 터치 이벤트 처리 (Button.js:12, 596)
- **CircularProgress** - 로딩 상태 애니메이션 표시 (Button.js:13, 538)
- **ButtonStartIcon** - 시작 아이콘 래퍼, size별 fontSize, margin 조정 (Button.js:331-371)
- **ButtonEndIcon** - 끝 아이콘 래퍼, size별 fontSize, margin 조정 (Button.js:373-413)
- **ButtonLoadingIndicator** - 로딩 인디케이터 래퍼, loadingPosition별 위치 조정 (Button.js:415-497)
- **ButtonLoadingIconPlaceholder** - 로딩 중 아이콘 공간 유지용 placeholder (Button.js:499-506)

### 3. Styled Components 시스템

**ButtonRoot** (78-329줄)
- ButtonBase를 styled로 래핑
- memoTheme으로 테마 값 메모이제이션
- variants 배열로 조건부 스타일 정의 (총 16개 variants)

```javascript
const ButtonRoot = styled(ButtonBase, {
  shouldForwardProp: (prop) => rootShouldForwardProp(prop) || prop === 'classes',
  overridesResolver: (props, styles) => { /* 8가지 스타일 병합 */ }
})(
  memoTheme(({ theme }) => ({
    ...theme.typography.button,  // 폰트 스타일 상속
    minWidth: 64,
    padding: '6px 16px',
    variants: [
      { props: { variant: 'contained' }, style: {...} },  // variant별 스타일
      { props: { variant: 'outlined' }, style: {...} },
      { props: { variant: 'text' }, style: {...} },
      ...동적 색상 생성 (7가지),                         // color별 스타일
      { props: { color: 'inherit' }, style: {...} },     // inherit 특수 처리
      { props: { size: 'small', variant: 'text' }, ...},  // size × variant 조합 (9개)
      { props: { disableElevation: true }, ...},         // 기타 props
      { props: { fullWidth: true }, ...},
      { props: { loadingPosition: 'center' }, ...},
    ],
  }))
);
```

**Icon Wrappers** (331-413줄)
- ButtonStartIcon, ButtonEndIcon: size별 margin, loading 시 opacity 조절
- commonIconStyles: size별 아이콘 fontSize (18/20/22)

**Loading Components** (415-506줄)
- ButtonLoadingIndicator: loadingPosition별 위치 (left/center/right)
- ButtonLoadingIconPlaceholder: 아이콘 공간 유지 (1em × 1em)

### 4. Theme 시스템 통합

**useDefaultProps** (513줄)
```javascript
const props = useDefaultProps({ props: resolvedProps, name: 'MuiButton' });
```
- 테마에서 정의된 기본 props를 병합
- 우선순위: inProps > contextProps > themeDefaultProps

**useUtilityClasses** (20-49줄)
```javascript
const classes = useUtilityClasses(ownerState);
// 반환: { root: 'MuiButton-root MuiButton-contained MuiButton-containedPrimary ...' }
```
- props 조합으로 CSS 클래스 이름 생성
- variant, color, size, loading 등 11개 조건 조합

**동적 색상 생성** (170-198줄)
```javascript
...Object.entries(theme.palette)
  .filter(createSimplePaletteValueFilter())
  .map(([color]) => ({
    props: { color },
    style: {
      '--variant-textColor': theme.palette[color].main,
      '--variant-containedBg': theme.palette[color].main,
      ...
    }
  }))
```
- 테마 팔레트에서 유효한 색상만 필터링 (primary, secondary, error, warning, info, success)
- 각 색상마다 CSS 변수 생성 (6개: textColor, textBg, outlinedColor, outlinedBorder, containedColor, containedBg)

### 5. ButtonGroup Context 통합

**Props 병합** (510-513줄)
```javascript
const contextProps = React.useContext(ButtonGroupContext);
const resolvedProps = resolveProps(contextProps, inProps);
```
- ButtonGroup이 variant, size, color 등을 자식 Button에 전달
- inProps가 우선 (명시적 prop > Context props)

**위치 클래스** (511줄, 581줄, 598줄)
```javascript
const buttonGroupButtonContextPositionClassName = React.useContext(ButtonGroupButtonContext);
const positionClassName = buttonGroupButtonContextPositionClassName || '';
className={clsx(contextProps.className, classes.root, className, positionClassName)}
```
- ButtonGroup 내 위치에 따른 스타일 (첫 번째, 중간, 마지막)

### 6. Loading 시스템

**loadingPosition별 처리** (559-593줄)
- `start`: startIcon 위치에 로딩 인디케이터, 기존 아이콘은 opacity: 0
- `center`: 중앙에 로딩 인디케이터, 텍스트는 color: transparent
- `end`: endIcon 위치에 로딩 인디케이터, 기존 아이콘은 opacity: 0

**Placeholder 패턴** (562-566줄, 573-577줄)
```javascript
{startIconProp || (
  <ButtonLoadingIconPlaceholder  // 공간 유지용
    className={classes.loadingIconPlaceholder}
    ownerState={ownerState}
  />
)}
```
- 로딩 중 아이콘이 사라질 때 레이아웃 변경 방지

**접근성** (536-538줄, 605줄)
```javascript
const loadingId = useId(idProp);
const loadingIndicator = <CircularProgress aria-labelledby={loadingId} ... />;
<ButtonRoot ... id={loading ? loadingId : idProp} />
```
- useId로 고유 ID 생성, CircularProgress를 Button과 연결

### 7. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `variant` | 'text' \| 'outlined' \| 'contained' | 'text' | 버튼 스타일 변형 |
| `color` | 'inherit' \| 'primary' \| 'secondary' \| 'success' \| 'error' \| 'info' \| 'warning' | 'primary' | 색상 테마 |
| `size` | 'small' \| 'medium' \| 'large' | 'medium' | 버튼 크기 |
| `loading` | boolean \| null | null | 로딩 상태 (true일 때 disabled + 인디케이터 표시) |
| `loadingPosition` | 'start' \| 'center' \| 'end' | 'center' | 로딩 인디케이터 위치 |
| `loadingIndicator` | ReactNode | `<CircularProgress ... />` | 커스텀 로딩 인디케이터 |
| `startIcon` | ReactNode | - | 텍스트 앞 아이콘 |
| `endIcon` | ReactNode | - | 텍스트 뒤 아이콘 |
| `fullWidth` | boolean | false | 부모 너비 100% |
| `disableElevation` | boolean | false | elevation(그림자) 제거 |
| `disableRipple` | boolean | false | 클릭 ripple 효과 제거 |
| `disableFocusRipple` | boolean | false | 포커스 ripple 효과 제거 |
| `component` | elementType | 'button' | 루트 요소 타입 (다형성 지원) |
| `disabled` | boolean | false | 비활성화 |
| `onClick` | function | - | 클릭 핸들러 |
| `type` | 'button' \| 'reset' \| 'submit' | - | Form 제출 타입 |

### 8. Variants 조합 복잡도

**variant × color = 21가지**
- text × 7가지 색상
- outlined × 7가지 색상
- contained × 7가지 색상

**size × variant = 9가지**
- small × (text, outlined, contained)
- medium × (text, outlined, contained)
- large × (text, outlined, contained)

**총 조합**
- variant(3) × color(7) × size(3) = **63가지 기본 조합**
- + fullWidth(2) × disableElevation(2) × loading(3 positions) = **252가지 확장 조합**

---

## 설계 패턴

1. **Composition (합성)**
   - ButtonRoot(ButtonBase)를 기반으로 startIcon, loadingIndicator, children, endIcon을 조합
   - 각 하위 요소가 독립적으로 조건부 렌더링됨

2. **Styled Components**
   - styled() API로 ButtonBase에 스타일 레이어 추가
   - ownerState를 통해 props를 스타일에 전달
   - variants 배열로 조건부 스타일 선언적 정의

3. **Context 기반 Props 상속**
   - ButtonGroup이 Context로 variant, size, color 등을 자식에게 전달
   - resolveProps로 Context props와 직접 props 병합 (직접 props 우선)

4. **Utility-First Class 생성**
   - useUtilityClasses로 props에 따른 클래스 이름 동적 생성
   - composeClasses로 기본 클래스 + 조건부 클래스 병합
   - 테마 커스터마이징 및 CSS-in-JS 오버라이드 지원

5. **Theme 통합**
   - useDefaultProps로 테마 기본값 자동 병합
   - memoTheme으로 테마 값 메모이제이션 (성능 최적화)
   - CSS 변수로 런타임 색상 변경 지원

6. **Forwarding Pattern**
   - React.forwardRef로 ref를 ButtonRoot(ButtonBase)에 전달
   - ButtonBase가 실제 DOM 요소 참조

---

## 복잡도의 이유

Button은 **748줄**이며, 복잡한 이유는:

1. **Styled Components 시스템 (약 250줄)**
   - ButtonRoot: 250줄 (memoTheme, variants 배열, overridesResolver)
   - ButtonStartIcon, ButtonEndIcon: 각 42줄
   - ButtonLoadingIndicator: 82줄 (12가지 loadingPosition/size/variant 조합)
   - ButtonLoadingIconPlaceholder: 7줄

2. **Theme 시스템 통합 (약 100줄)**
   - useDefaultProps, useUtilityClasses, composeClasses
   - 동적 색상 생성 (Object.entries + filter + map)
   - memoTheme 메모이제이션

3. **Loading 시스템 (약 150줄)**
   - loadingPosition 3가지 (start/center/end) 조건부 처리
   - ButtonLoadingIndicator variants (12개)
   - Placeholder 패턴으로 레이아웃 보존
   - useId + aria-labelledby 접근성

4. **Icon Props (약 120줄)**
   - ButtonStartIcon, ButtonEndIcon styled components
   - size별 margin/fontSize 조정 (commonIconStyles)
   - loading과의 상호작용 (opacity, placeholder)

5. **Variants 조합 (약 200줄)**
   - variant 3가지 × color 7가지 × size 3가지 = 63가지
   - 각 조합마다 다른 padding, fontSize, boxShadow, border 등
   - ButtonRoot variants 배열에 16개 항목

6. **ButtonGroup Context 통합 (약 30줄)**
   - ButtonGroupContext, ButtonGroupButtonContext 구독
   - resolveProps로 props 병합
   - positionClassName 처리

7. **PropTypes 메타데이터 (128줄)**
   - 런타임 타입 검증 (20개 props)
   - JSDoc 주석 (50+줄)

---

## 비교: HTML `<button>` vs Button 컴포넌트

| 기능 | HTML `<button>` | Button 컴포넌트 |
|------|----------------|----------------|
| **기본 클릭** | onClick, type, disabled | ✅ 동일 (ButtonBase로 위임) |
| **리플 효과** | ❌ 없음 | ✅ ButtonBase 기본 제공 |
| **로딩 상태** | ❌ 수동 구현 필요 | ✅ loading prop + CircularProgress 자동 |
| **아이콘 통합** | ❌ 수동 배치 | ✅ startIcon/endIcon prop |
| **스타일 변형** | ❌ CSS 직접 작성 | ✅ variant, color, size prop 조합 |
| **테마 통합** | ❌ 없음 | ✅ useDefaultProps, palette, typography 자동 연동 |
| **접근성** | ⚠️ 수동 ARIA | ✅ aria-labelledby, focusRipple 자동 |
| **ButtonGroup** | ❌ 불가능 | ✅ Context로 props 공유, 위치별 스타일 |
| **복잡도** | 낮음 (HTML 표준) | 높음 (748줄, styled, theme, context) |

**핵심 차이점**:
- HTML `<button>`은 순수한 클릭 가능 요소
- Button 컴포넌트는 Material Design 스타일 시스템 + 로딩 + 아이콘 + 테마 통합 + ButtonGroup 연동을 모두 포함하는 "풀 스택 버튼"
