# Icon 컴포넌트

> Material-UI의 Icon 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

Icon은 **Material Icons 폰트를 사용하여 ligature 방식으로 아이콘을 표시하는** 컴포넌트입니다.

> **💡 작성 주의**: Icon은 단순히 Material Icons 폰트의 ligature를 표시하는 span 태그 래퍼입니다. 실제 아이콘 모양은 Google Fonts에서 제공하는 Material Icons 폰트에 의해 결정됩니다.

### 핵심 기능

1. **Material Icons ligature 표시** - children으로 받은 아이콘 이름(예: 'home', 'search')을 Material Icons 폰트로 렌더링
2. **색상 변경** - color prop으로 9가지 색상 지원 (inherit, action, disabled, primary, secondary, error, info, success, warning + 동적 palette)
3. **크기 변경** - fontSize prop으로 4가지 크기 지원 (inherit, small 20px, medium 24px, large 36px)
4. **아이콘 폰트 변경** - baseClassName prop으로 다른 아이콘 폰트 라이브러리 사용 가능 (예: Font Awesome)
5. **루트 태그 변경** - component prop으로 루트 요소를 span 외의 다른 태그로 변경 가능

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/Icon/Icon.js (228줄)
Icon (forwardRef)
  └─> IconRoot (styled span)
       └─> children (아이콘 이름 ligature: 'home', 'search', 'menu' 등)
```

**단순한 구조**: Icon은 자식 컴포넌트 없이 styled span 하나로 구성됩니다.

### 2. useUtilityClasses (13-25줄)

CSS 클래스 이름을 생성하는 함수:

```javascript
const useUtilityClasses = (ownerState) => {
  const { color, fontSize, classes } = ownerState;

  const slots = {
    root: [
      'root',
      color !== 'inherit' && `color${capitalize(color)}`,
      `fontSize${capitalize(fontSize)}`,
    ],
  };

  return composeClasses(slots, getIconUtilityClass, classes);
};
```

**역할**:
- ownerState에서 color, fontSize 추출
- 동적으로 클래스 이름 생성 (예: 'MuiIcon-colorPrimary', 'MuiIcon-fontSizeLarge')
- composeClasses로 클래스 병합

### 3. IconRoot (styled span) (27-117줄)

스타일이 적용된 span 컴포넌트:

```javascript
const IconRoot = styled('span', {
  name: 'MuiIcon',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;
    return [
      styles.root,
      ownerState.color !== 'inherit' && styles[`color${capitalize(ownerState.color)}`],
      styles[`fontSize${capitalize(ownerState.fontSize)}`],
    ];
  },
})(
  memoTheme(({ theme }) => ({
    // 기본 스타일
    userSelect: 'none',
    width: '1em',
    height: '1em',
    overflow: 'hidden',
    display: 'inline-block',
    textAlign: 'center',
    flexShrink: 0,

    // variants 배열 (50-115줄)
    variants: [
      // fontSize variants (4가지)
      { props: { fontSize: 'inherit' }, style: { fontSize: 'inherit' } },
      { props: { fontSize: 'small' }, style: { fontSize: theme.typography.pxToRem(20) } },
      { props: { fontSize: 'medium' }, style: { fontSize: theme.typography.pxToRem(24) } },
      { props: { fontSize: 'large' }, style: { fontSize: theme.typography.pxToRem(36) } },

      // color variants (action, disabled, inherit)
      { props: { color: 'action' }, style: { color: (theme.vars || theme).palette.action.active } },
      { props: { color: 'disabled' }, style: { color: (theme.vars || theme).palette.action.disabled } },
      { props: { color: 'inherit' }, style: { color: undefined } },

      // 동적 palette 색상 (primary, secondary, error, info, success, warning 등)
      ...Object.entries(theme.palette)
        .filter(createSimplePaletteValueFilter())
        .map(([color]) => ({
          props: { color },
          style: { color: (theme.vars || theme).palette[color].main },
        })),
    ],
  })),
);
```

**핵심 요소**:
1. **overridesResolver**: 테마 오버라이드 지원
2. **memoTheme**: 테마 의존 스타일 메모이제이션
3. **variants**: props에 따른 조건부 스타일 (fontSize 4개 + color 9개+)
4. **createSimplePaletteValueFilter**: 동적으로 palette 색상 필터링

### 4. Icon 메인 컴포넌트 (119-157줄)

```javascript
const Icon = React.forwardRef(function Icon(inProps, ref) {
  // 1. 테마에서 기본 props 병합
  const props = useDefaultProps({ props: inProps, name: 'MuiIcon' });

  // 2. Props 구조 분해 및 기본값
  const {
    baseClassName = 'material-icons',
    className,
    color = 'inherit',
    component: Component = 'span',
    fontSize = 'medium',
    ...other
  } = props;

  // 3. ownerState 생성 (styled 컴포넌트에 전달)
  const ownerState = {
    ...props,
    baseClassName,
    color,
    component: Component,
    fontSize,
  };

  // 4. CSS 클래스 생성
  const classes = useUtilityClasses(ownerState);

  // 5. 렌더링
  return (
    <IconRoot
      as={Component}
      className={clsx(
        baseClassName,
        'notranslate',  // Google 번역 방지
        classes.root,
        className,
      )}
      ownerState={ownerState}
      aria-hidden
      ref={ref}
      {...other}
    />
  );
});
```

**처리 흐름**:
1. useDefaultProps로 테마 기본값 병합
2. Props 구조 분해 (baseClassName, color, fontSize, component 등)
3. ownerState 생성 (styled 컴포넌트의 variants에서 사용)
4. useUtilityClasses로 CSS 클래스 생성
5. IconRoot 렌더링 (as={Component}로 다형성 지원)

### 5. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | node | - | 아이콘 이름 ligature (예: 'home', 'search', 'menu') |
| `baseClassName` | string | 'material-icons' | 아이콘 폰트 기본 클래스 (다른 폰트 사용 시 변경) |
| `color` | 'inherit' \| 'action' \| 'disabled' \| 'primary' \| 'secondary' \| 'error' \| 'info' \| 'success' \| 'warning' \| string | 'inherit' | 아이콘 색상 |
| `fontSize` | 'inherit' \| 'small' \| 'medium' \| 'large' \| string | 'medium' | 아이콘 크기 |
| `component` | elementType | 'span' | 루트 요소 태그 |
| `className` | string | - | 추가 CSS 클래스 |
| `sx` | object | - | System prop (CSS-in-JS) |
| `classes` | object | - | 클래스 오버라이드 |

### 6. Material Icons Ligature 메커니즘

Icon 컴포넌트는 **ligature** 방식으로 아이콘을 표시합니다:

```html
<!-- HTML 출력 -->
<span class="material-icons">home</span>
<!-- 브라우저가 'home' 텍스트를 Material Icons 폰트의 집 아이콘 모양으로 렌더링 -->
```

**작동 원리**:
1. Material Icons 폰트가 로드되어 있어야 함
2. `className="material-icons"`로 폰트 적용
3. children으로 아이콘 이름(ligature) 전달
4. 브라우저가 OpenType ligature 기능으로 텍스트를 아이콘 모양으로 변환

**장점**:
- 접근성: 스크린 리더가 'home' 텍스트를 읽을 수 있음
- 간편함: SVG나 이미지 파일 불필요

**단점**:
- Material Icons 폰트 로드 필수
- 폰트 로딩 전에는 텍스트로 보임

---

## 설계 패턴

### 1. CSS-in-JS (styled)

```javascript
const IconRoot = styled('span', {
  name: 'MuiIcon',
  slot: 'Root',
  overridesResolver: (props, styles) => [...],
})(memoTheme(({ theme }) => ({ ... })));
```

**패턴 적용**:
- @mui/zero-styled의 styled() 함수 사용
- 테마 통합 (theme.palette, theme.typography)
- overridesResolver로 커스터마이징 지원

### 2. Variants 패턴

```javascript
variants: [
  { props: { fontSize: 'small' }, style: { fontSize: theme.typography.pxToRem(20) } },
  { props: { color: 'primary' }, style: { color: theme.palette.primary.main } },
]
```

**패턴 적용**:
- props 값에 따라 다른 스타일 적용
- 선언적 방식으로 조건부 스타일 정의
- 테마 값 참조

### 3. Utility Classes 패턴

```javascript
const classes = useUtilityClasses(ownerState);
// 결과: { root: 'MuiIcon-root MuiIcon-colorPrimary MuiIcon-fontSizeLarge' }
```

**패턴 적용**:
- composeClasses로 클래스 이름 조합
- BEM 규칙 (Block-Element-Modifier) 유사
- 사용자 클래스 오버라이드 지원

### 4. Polymorphic Component (다형성)

```javascript
const Icon = ({ component: Component = 'span', ... }) => (
  <IconRoot as={Component} {...props} />
);
```

**패턴 적용**:
- component prop으로 루트 태그 변경 가능
- `as` prop으로 styled 컴포넌트에 전달
- 예: `<Icon component="i">` → `<i class="material-icons">home</i>`

### 5. Theme Integration

```javascript
const props = useDefaultProps({ props: inProps, name: 'MuiIcon' });
```

**패턴 적용**:
- 테마에서 기본 props 가져오기
- 테마 설정으로 전역 기본값 변경 가능
- 예: `theme.components.MuiIcon.defaultProps = { color: 'primary' }`

---

## 복잡도의 이유

Icon은 **228줄**이며, 복잡한 이유는:

### 1. 색상 시스템 (약 80줄)

**복잡한 점**:
- 9가지 기본 색상 (inherit, action, disabled, primary, secondary, error, info, success, warning)
- 동적 palette 색상 지원 (Object.entries + filter + map)
- theme.palette.action.active, theme.palette[color].main 등 테마 의존
- useUtilityClasses에서 color별 클래스 생성
- overridesResolver에서 color별 스타일 매핑

**코드 예시**:
```javascript
// 동적 palette 색상 생성 (107-114줄)
...Object.entries(theme.palette)
  .filter(createSimplePaletteValueFilter())
  .map(([color]) => ({
    props: { color },
    style: { color: (theme.vars || theme).palette[color].main },
  })),
```

### 2. 크기 시스템 (약 40줄)

**복잡한 점**:
- 4가지 fontSize (inherit, small, medium, large)
- theme.typography.pxToRem 사용 (테마 기반 폰트 크기 계산)
- useUtilityClasses에서 fontSize별 클래스 생성
- overridesResolver에서 fontSize별 스타일 매핑

### 3. 테마 통합 시스템 (약 30줄)

**복잡한 점**:
- useDefaultProps: 테마 기본값 병합
- useUtilityClasses: 동적 클래스 생성
- composeClasses: 클래스 조합
- memoTheme: 테마 스타일 메모이제이션

### 4. 스타일 시스템 (약 50줄)

**복잡한 점**:
- styled() API
- overridesResolver: 테마 오버라이드
- variants: 조건부 스타일 (13개)
- ownerState: props를 스타일에 전달

### 5. PropTypes (약 65줄)

**복잡한 점**:
- 모든 props 타입 정의
- JSDoc 주석
- TypeScript에서 자동 생성된 경고 주석

### 6. 다형성 및 유연성 (약 10줄)

**복잡한 점**:
- component prop (루트 태그 변경)
- baseClassName prop (아이콘 폰트 변경)
- as={Component} 처리

---

## 비교: Icon vs SvgIcon

| 기능 | Icon | SvgIcon |
|------|------|---------|
| **아이콘 소스** | Material Icons 폰트 (ligature) | SVG path 직접 전달 |
| **사용법** | `<Icon>home</Icon>` | `<SvgIcon><path d="..."/></SvgIcon>` |
| **폰트 로드** | 필요 (Google Fonts) | 불필요 |
| **번들 크기** | 작음 (폰트는 CDN) | 큼 (SVG path 포함) |
| **아이콘 개수** | Material Icons 전체 (1000+) | 개별 import 필요 |
| **커스터마이징** | 제한적 (폰트 의존) | 자유로움 (SVG 수정 가능) |
| **접근성** | 좋음 (ligature 텍스트) | 좋음 (title prop) |
| **권장 사용** | Material Icons 사용 시 | 커스텀 아이콘 사용 시 |

**Material-UI 권장사항**:
- Material Icons 사용 시 → Icon 또는 @mui/icons-material (SvgIcon 기반)
- 커스텀 SVG 아이콘 → SvgIcon
- Icon보다 SvgIcon이 더 현대적이고 유연함
