# Divider 컴포넌트

> Material-UI의 Divider 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

Divider는 **리스트, 메뉴, 레이아웃의 콘텐츠를 시각적으로 구분하는 가로/세로 선을 제공하는** 컴포넌트입니다.

### 핵심 기능
1. **구분선 렌더링** - 가로(horizontal) 또는 세로(vertical) 방향의 얇은 선 표시
2. **텍스트 포함 구분선** - children prop으로 구분선 중간에 텍스트/아이콘 삽입 가능
3. **다양한 배치 옵션** - fullWidth, inset, middle 등 3가지 variant 제공
4. **위치 제어** - absolute positioning, flex container 지원 등
5. **스타일 커스터마이징** - light 모드, textAlign 제어, 테마 통합

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/Divider/Divider.js (355줄)
Divider (DividerRoot - styled div/hr)
  └─> DividerWrapper (styled span) - children이 있을 때만 렌더링
       └─> {children} - 텍스트 또는 노드
```

**구조 설명**:
- **DividerRoot**: 구분선의 베이스 요소 (기본 hr, children 있으면 div)
- **DividerWrapper**: children을 감싸는 래퍼 (패딩/정렬 담당)
- **children**: 구분선 중간에 표시될 콘텐츠

### 2. Styled Components

#### DividerRoot (34-193줄, 159줄)
```javascript
const DividerRoot = styled('div', {
  name: 'MuiDivider',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    // 37-56줄: 20줄의 overridesResolver 로직
    // ownerState에 따라 styles 배열 생성
  },
})(
  memoTheme(({ theme }) => ({
    // 기본 스타일 (59-64줄)
    margin: 0,
    flexShrink: 0,
    borderWidth: 0,
    borderStyle: 'solid',
    borderColor: (theme.vars || theme).palette.divider,
    borderBottomWidth: 'thin',

    // variants: 12개의 조건부 스타일 블록 (65-191줄)
  })),
);
```

**주요 variants** (12개):
1. **absolute** (67-76줄): position absolute 설정
2. **light** (78-84줄): 더 연한 색상 (deprecated)
3. **variant: 'inset'** (86-92줄): 왼쪽 마진 72px
4. **variant: 'middle' + horizontal** (94-102줄): 좌우 마진 16px
5. **variant: 'middle' + vertical** (104-112줄): 상하 마진 8px
6. **orientation: 'vertical'** (114-122줄): 세로 구분선 스타일
7. **flexItem** (124-131줄): flex container 내 높이 조정
8. **children 존재** (133-145줄): flex 레이아웃, ::before/::after 준비
9. **children + horizontal** (147-155줄): ::before/::after에 상단 border
10. **children + vertical** (157-166줄): ::before/::after에 좌측 border
11. **textAlign: 'right'** (168-178줄): ::before 90%, ::after 10%
12. **textAlign: 'left'** (180-190줄): ::before 10%, ::after 90%

#### DividerWrapper (195-221줄, 27줄)
```javascript
const DividerWrapper = styled('span', {
  name: 'MuiDivider',
  slot: 'Wrapper',
  overridesResolver: (props, styles) => {
    // 198-202줄: wrapper 스타일 병합
  },
})(
  memoTheme(({ theme }) => ({
    display: 'inline-block',
    paddingLeft: `calc(${theme.spacing(1)} * 1.2)`,  // 8px * 1.2 = 9.6px
    paddingRight: `calc(${theme.spacing(1)} * 1.2)`,
    whiteSpace: 'nowrap',
    variants: [
      {
        props: { orientation: 'vertical' },
        style: {
          paddingTop: `calc(${theme.spacing(1)} * 1.2)`,
          paddingBottom: `calc(${theme.spacing(1)} * 1.2)`,
        },
      },
    ],
  })),
);
```

### 3. Divider 컴포넌트 (223-274줄, 52줄)

```javascript
const Divider = React.forwardRef(function Divider(inProps, ref) {
  // 1. useDefaultProps: 테마에서 기본값 가져오기 (224줄)
  const props = useDefaultProps({ props: inProps, name: 'MuiDivider' });

  // 2. Props destructuring + 기본값 (225-237줄)
  const {
    absolute = false,
    children,
    className,
    orientation = 'horizontal',
    component = children || orientation === 'vertical' ? 'div' : 'hr',
    flexItem = false,
    light = false,
    role = component !== 'hr' ? 'separator' : undefined,
    textAlign = 'center',
    variant = 'fullWidth',
    ...other
  } = props;

  // 3. ownerState 생성 (239-249줄)
  const ownerState = { ...props, absolute, component, flexItem, light, orientation, role, textAlign, variant };

  // 4. useUtilityClasses: CSS 클래스 이름 생성 (251줄)
  const classes = useUtilityClasses(ownerState);

  // 5. 렌더링 (253-273줄)
  return (
    <DividerRoot
      as={component}
      className={clsx(classes.root, className)}
      role={role}
      ref={ref}
      ownerState={ownerState}
      aria-orientation={role === 'separator' && (component !== 'hr' || orientation === 'vertical') ? orientation : undefined}
      {...other}
    >
      {children ? <DividerWrapper className={classes.wrapper} ownerState={ownerState}>{children}</DividerWrapper> : null}
    </DividerRoot>
  );
});
```

### 4. useUtilityClasses (11-32줄, 22줄)

```javascript
const useUtilityClasses = (ownerState) => {
  const { absolute, children, classes, flexItem, light, orientation, textAlign, variant } = ownerState;

  const slots = {
    root: [
      'root',
      absolute && 'absolute',
      variant,  // 'fullWidth' | 'inset' | 'middle'
      light && 'light',
      orientation === 'vertical' && 'vertical',
      flexItem && 'flexItem',
      children && 'withChildren',
      children && orientation === 'vertical' && 'withChildrenVertical',
      textAlign === 'right' && orientation !== 'vertical' && 'textAlignRight',
      textAlign === 'left' && orientation !== 'vertical' && 'textAlignLeft',
    ],
    wrapper: ['wrapper', orientation === 'vertical' && 'wrapperVertical'],
  };

  return composeClasses(slots, getDividerUtilityClass, classes);
};
```

**역할**: ownerState를 기반으로 10가지 조건을 체크하여 CSS 클래스 이름 배열 생성

### 5. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `absolute` | boolean | false | 절대 위치(absolute position)로 배치 |
| `children` | node | - | 구분선 중간에 표시할 콘텐츠 |
| `classes` | object | - | 스타일 오버라이드용 클래스 이름 맵 |
| `className` | string | - | 추가 CSS 클래스 |
| `component` | elementType | 'hr' 또는 'div' | 루트 HTML 요소 타입 |
| `flexItem` | boolean | false | flex container 내 높이 자동 조정 |
| `light` | boolean | false | 연한 색상 (deprecated) |
| `orientation` | 'horizontal' \| 'vertical' | 'horizontal' | 구분선 방향 |
| `role` | string | 'separator' 또는 undefined | ARIA role |
| `sx` | object | - | 시스템 스타일 prop |
| `textAlign` | 'left' \| 'center' \| 'right' | 'center' | children 텍스트 정렬 |
| `variant` | 'fullWidth' \| 'inset' \| 'middle' | 'fullWidth' | 구분선 배치 형태 |

### 6. children 렌더링 메커니즘

children이 있을 때 Divider는 **::before와 ::after pseudo-elements**를 사용하여 구분선을 만듭니다.

**가로 방향 (orientation: 'horizontal')**:
```
┌──────────────::before─────────────┐ ┌─children─┐ ┌──────────────::after──────────────┐
│    width: 100% (or 90%/10%)       │ │  Wrapper │ │    width: 100% (or 10%/90%)       │
│  borderTop: thin solid divider    │ │          │ │  borderTop: thin solid divider    │
└───────────────────────────────────┘ └──────────┘ └───────────────────────────────────┘
```

**세로 방향 (orientation: 'vertical')**:
```
┌─::before─┐
│ height:  │
│   100%   │
│borderLeft│
└──────────┘
┌─children─┐
│ Wrapper  │
└──────────┘
┌─::after──┐
│ height:  │
│   100%   │
│borderLeft│
└──────────┘
```

**textAlign 동작**:
- `center` (기본값): ::before, ::after 모두 width: 100% (균등 분할)
- `left`: ::before width: 10%, ::after width: 90%
- `right`: ::before width: 90%, ::after width: 10%

---

## 설계 패턴

1. **Styled Components**
   - `styled()` API로 DividerRoot, DividerWrapper 생성
   - `variants` 배열로 조건부 스타일 정의 (12개 블록)
   - `overridesResolver`로 테마 오버라이드 지원

2. **Theme Integration**
   - `memoTheme`으로 테마 함수 메모이제이션
   - `theme.palette.divider` (기본: rgba(0, 0, 0, 0.12))
   - `theme.spacing()` 함수 사용 (1 = 8px, 2 = 16px)
   - `theme.alpha()` 함수로 투명도 조정 (light prop)

3. **Utility Classes**
   - `useUtilityClasses` Hook으로 동적 클래스 이름 생성
   - `composeClasses` 유틸리티로 조건부 클래스 병합
   - `clsx`로 최종 className 문자열 생성

4. **Default Props Pattern**
   - `useDefaultProps` Hook으로 테마에서 기본값 가져오기
   - DefaultPropsProvider Context 구독

5. **Pseudo-elements (::before/::after)**
   - children이 있을 때 구분선을 pseudo-elements로 구현
   - flexbox로 중앙 정렬 및 크기 제어
   - textAlign에 따라 width 비율 조정

6. **Conditional Component Type**
   - children 없고 horizontal → `<hr>` (semantic HTML)
   - children 있거나 vertical → `<div>` (flex 레이아웃 필요)
   - `as={component}` prop으로 동적 요소 타입 설정

---

## 복잡도의 이유

Divider는 **355줄**이며, 복잡한 이유는:

1. **Styled Components 비중** - 186줄 (52%)
   - DividerRoot: 159줄 (12개 variants 포함)
   - DividerWrapper: 27줄
   - overridesResolver: 56줄

2. **PropTypes 정의** - 70줄 (20%)
   - 11개 props에 대한 타입 검증
   - JSDoc 주석 포함

3. **조건부 스타일 블록** - 12개 variants
   - absolute, light, inset, middle(h), middle(v), vertical, flexItem
   - children, children+h, children+v, textAlign(left), textAlign(right)
   - 각 블록마다 props 체크 및 스타일 정의

4. **Theme 시스템** - memoTheme, palette, spacing
   - theme.palette.divider 참조 (2곳)
   - theme.spacing(1), spacing(2) 호출 (4곳)
   - theme.alpha() 함수 (light prop)
   - theme.vars || theme 조건 체크 (CSS 변수 지원)

5. **Utility Classes 시스템** - 22줄
   - 10가지 조건 체크
   - composeClasses, getDividerUtilityClass 호출
   - root, wrapper 슬롯

6. **복잡한 기본값 계산**
   - `component`: children 또는 orientation에 따라 'div' 또는 'hr'
   - `role`: component 타입에 따라 'separator' 또는 undefined
   - `aria-orientation`: role, component, orientation 조합 체크

7. **다양한 사용 케이스 지원**
   - 가로/세로 구분선
   - 텍스트 포함 구분선 (3가지 정렬)
   - 3가지 variant (fullWidth, inset, middle)
   - Flexbox 지원, absolute positioning
   - Light 모드 (deprecated)

8. **메타데이터** - 8줄
   - muiSkipListHighlight 플래그
   - PropTypes 경고 주석
   - 'use client' 지시어

---

## 비교: 일반 `<hr>` vs Material-UI Divider

| 기능 | `<hr>` | Material-UI Divider |
|------|--------|---------------------|
| **기본 스타일** | 브라우저 기본 (border-top, 그레이) | 테마 통합 (palette.divider) |
| **세로 방향** | ❌ 지원 안 함 | ✅ orientation="vertical" |
| **텍스트 삽입** | ❌ semantic하지 않음 | ✅ children으로 깔끔하게 지원 |
| **Variant** | ❌ 없음 | ✅ fullWidth, inset, middle |
| **Flex 지원** | ❌ 높이 계산 문제 | ✅ flexItem prop |
| **테마 일관성** | ❌ 별도 스타일 필요 | ✅ 자동 적용 |
| **접근성** | ✅ role 불필요 | ✅ role="separator", aria-orientation |
| **복잡도** | 1줄 HTML | 355줄 React 컴포넌트 |

---

## 특이사항

### muiSkipListHighlight 플래그 (280-282줄)
```javascript
if (Divider) {
  Divider.muiSkipListHighlight = true;
}
```
**목적**: MUI List 컴포넌트 내부에서 Divider가 키보드 포커스를 받지 않도록 설정. List는 이 플래그를 체크하여 Divider를 탭 순서에서 제외함.

### deprecated light prop
PropTypes에 다음 경고 포함:
> @deprecated Use `<Divider sx={{ opacity: 0.6 }} />` (or any opacity or color) instead.

Material-UI v6에서 완전히 제거 예정.

### component 기본값 계산 (230줄)
```javascript
component = children || orientation === 'vertical' ? 'div' : 'hr'
```
- **children 있음** → `div` (::before/::after를 위해 flex 레이아웃 필요)
- **vertical** → `div` (hr은 가로선만 가능)
- **그 외** → `hr` (semantic HTML)
