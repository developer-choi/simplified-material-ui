# Badge 컴포넌트

> Material-UI의 Badge 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

Badge는 **자식 요소의 우측 상단에 작은 배지(숫자나 점)를 표시**하는 컴포넌트입니다.

> **💡 작성 주의**: Badge 자체는 배지를 표시하는 역할만 담당합니다. 자식 요소(아이콘, 아바타 등)는 사용자가 제공합니다.

### 핵심 기능
1. **숫자 배지 표시** - badgeContent로 숫자나 텍스트 표시
2. **위치 조정** - anchorOrigin으로 8가지 위치 지원 (top/bottom × left/right × rectangular/circular)
3. **스타일 변형** - variant (standard/dot), color (7가지), max (99+) 등 다양한 옵션 지원
4. **조건부 표시** - invisible, showZero로 표시 여부 제어

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/Badge/Badge.js (485줄)
Badge (forwardRef)
  └─> BadgeRoot (styled span)
       ├─> children (사용자 제공 요소: 아이콘, 아바타 등)
       └─> BadgeBadge (styled span)
            └─> displayValue (배지 내용: 숫자 or 점)
```

### 2. 주요 Styled Components

**BadgeRoot** (라인 40-49)
- 기본 span을 styled()로 래핑
- 자식 요소를 감싸는 컨테이너

```javascript
const BadgeRoot = styled('span', {
  name: 'MuiBadge',
  slot: 'Root',
})({
  position: 'relative',
  display: 'inline-flex',
  verticalAlign: 'middle',
  flexShrink: 0,
});
```

**BadgeBadge** (라인 51-242)
- 실제 배지를 표시하는 span
- memoTheme()로 테마 기반 스타일 적용
- variants 배열로 조건부 스타일 정의 (anchorOrigin 8개, variant, color, invisible)

```javascript
const BadgeBadge = styled('span', {
  name: 'MuiBadge',
  slot: 'Badge',
  overridesResolver,
})(
  memoTheme(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    boxSizing: 'border-box',
    minWidth: RADIUS_STANDARD * 2, // 20px
    height: RADIUS_STANDARD * 2,
    borderRadius: RADIUS_STANDARD, // 10px
    padding: '0 6px',
    zIndex: 1,
    transition: theme.transitions.create('transform', {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    variants: [
      // color variants (7개)
      ...Object.entries(theme.palette).filter(...).map(...),
      // variant: dot
      { props: { variant: 'dot' }, style: { borderRadius: RADIUS_DOT, height: 8, minWidth: 8 } },
      // anchorOrigin × overlap = 8개 조합
      { props: ({ ownerState }) => ownerState.anchorOrigin.vertical === 'top' && ..., style: { top: 0, right: 0, transform: 'translate(50%, -50%)' } },
      // invisible 전환 애니메이션
      { props: { invisible: true }, style: { transition: theme.transitions.create('transform', { duration: theme.transitions.duration.leavingScreen }) } },
    ],
  })),
);
```

### 3. useBadge 훅

**useBadge** (별도 파일 useBadge.ts)
- max 처리: `badgeContent > max` → "99+"
- invisible 계산: `badgeContent === 0 && !showZero` → invisible
- usePreviousProps로 이전 값 추적 (애니메이션 전환용)

```javascript
const { badgeContent, invisible, max, displayValue } = useBadge({
  max: maxProp,
  invisible: invisibleProp,
  badgeContent: badgeContentProp,
  showZero,
});

// useBadge.ts 내부
const displayValue: React.ReactNode =
  badgeContent && Number(badgeContent) > max ? `${max}+` : badgeContent;
```

### 4. usePreviousProps 처리

**usePreviousProps** (라인 285-291)
- invisible 전환 시 이전 값 유지 (애니메이션 부드럽게)
- anchorOrigin, color, overlap, variant, badgeContent 추적

```javascript
const prevProps = usePreviousProps({
  anchorOrigin: getAnchorOrigin(anchorOriginProp),
  color: colorProp,
  overlap: overlapProp,
  variant: variantProp,
  badgeContent: badgeContentProp,
});

// invisible일 때 이전 값 사용
const { color = colorProp, overlap = overlapProp, ... } = invisible ? prevProps : props;
```

### 5. Slot 시스템

**useSlot** (라인 332-351)
- root, badge 2개 슬롯
- slots/slotProps (v5), components/componentsProps (deprecated) 모두 지원
- externalForwardedProps로 병합

```javascript
const externalForwardedProps = {
  slots: {
    root: slots?.root ?? components.Root,
    badge: slots?.badge ?? components.Badge,
  },
  slotProps: {
    root: slotProps?.root ?? componentsProps.root,
    badge: slotProps?.badge ?? componentsProps.badge,
  },
};

const [RootSlot, rootProps] = useSlot('root', {
  elementType: BadgeRoot,
  externalForwardedProps,
  ownerState,
  className: clsx(classes.root, className),
  ref,
  additionalProps: { as: component },
});
```

### 6. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `anchorOrigin` | { vertical, horizontal } | { vertical: 'top', horizontal: 'right' } | 배지 위치 (4가지) |
| `badgeContent` | ReactNode | - | 배지에 표시할 내용 (숫자, 텍스트 등) |
| `children` | ReactNode | - | 배지를 붙일 대상 요소 |
| `color` | string | 'default' | 배지 색상 (7가지) |
| `component` | elementType | 'span' | 루트 HTML 태그 |
| `invisible` | boolean | false | 배지 숨김 여부 |
| `max` | number | 99 | 최대 숫자 (초과 시 "99+") |
| `overlap` | 'rectangular' \| 'circular' | 'rectangular' | 덮는 모양에 따른 위치 조정 |
| `showZero` | boolean | false | 0일 때 표시 여부 |
| `variant` | 'standard' \| 'dot' | 'standard' | 배지 모양 (숫자 or 점) |
| `slots` | object | - | 슬롯 커스터마이징 (v5) |
| `slotProps` | object | - | 슬롯 props (v5) |
| `components` | object | - | 컴포넌트 커스터마이징 (deprecated) |
| `componentsProps` | object | - | 컴포넌트 props (deprecated) |

### 7. anchorOrigin × overlap 조합

**8가지 위치 variants** (라인 112-230)
- top-right-rectangular (기본): `{ top: 0, right: 0, transform: 'translate(50%, -50%)' }`
- top-right-circular: `{ top: '14%', right: '14%', transform: 'translate(50%, -50%)' }`
- bottom-right-rectangular, bottom-right-circular
- top-left-rectangular, top-left-circular
- bottom-left-rectangular, bottom-left-circular

```javascript
// top-right-rectangular (기본)
{
  props: ({ ownerState }) =>
    ownerState.anchorOrigin.vertical === 'top' &&
    ownerState.anchorOrigin.horizontal === 'right' &&
    ownerState.overlap === 'rectangular',
  style: {
    top: 0,
    right: 0,
    transform: 'scale(1) translate(50%, -50%)',
    transformOrigin: '100% 0%',
    [`&.${badgeClasses.invisible}`]: {
      transform: 'scale(0) translate(50%, -50%)',
    },
  },
}

// top-right-circular (14% 오프셋)
{
  props: ({ ownerState }) =>
    ownerState.anchorOrigin.vertical === 'top' &&
    ownerState.anchorOrigin.horizontal === 'right' &&
    ownerState.overlap === 'circular',
  style: {
    top: '14%',
    right: '14%',
    transform: 'scale(1) translate(50%, -50%)',
    // ...
  },
}
```

### 8. invisible 계산 로직

**invisible 결정** (라인 293)
- useBadge에서 계산: `badgeContent === 0 && !showZero` → invisible
- 외부 invisibleProp으로도 제어 가능
- variant === 'dot'일 때는 badgeContent null이어도 표시

```javascript
const invisible = invisibleFromHook || (badgeContent == null && variantProp !== 'dot');
```

---

## 설계 패턴

1. **Composition (조합)**
   - 자식 요소(children)를 래핑하여 배지 추가
   - 자식 요소는 사용자가 제공

2. **Slot System**
   - useSlot()으로 root, badge 2개 슬롯 커스터마이징
   - slots/slotProps (v5), components/componentsProps (deprecated) 병행 지원

3. **Styled Component System**
   - styled() + memoTheme()로 테마 기반 스타일
   - ownerState로 props를 스타일에 전달
   - variants 배열로 조건부 스타일 정의 (anchorOrigin, overlap, variant, color)

4. **Utility Classes**
   - useUtilityClasses로 상태별 클래스명 생성
   - composeClasses로 클래스 병합

5. **Custom Hook**
   - useBadge로 로직 분리 (max, invisible, displayValue 계산)
   - usePreviousProps로 애니메이션 전환 시 이전 값 유지

6. **Animation**
   - invisible 전환 시 scale(1) ↔ scale(0) 애니메이션
   - theme.transitions.duration (enteringScreen/leavingScreen)

---

## 복잡도의 이유

Badge는 **485줄**이며, 복잡한 이유는:

1. **테마 시스템 통합**
   - useDefaultProps로 테마 기본값 병합
   - useUtilityClasses로 클래스명 자동 생성
   - memoTheme()로 테마 기반 스타일 메모이제이션

2. **Styled Component 시스템**
   - styled() API로 컴포넌트 생성 (200줄 이상)
   - overridesResolver로 테마 오버라이드 지원
   - variants 배열로 조건부 스타일 정의 (15개 이상)
   - shouldForwardProp으로 prop 필터링

3. **다양한 Props 지원**
   - 10개 이상의 props (anchorOrigin, overlap, variant, color, max, showZero, invisible 등)
   - anchorOrigin 4가지 × overlap 2가지 = 8개 위치 variants
   - color 7가지 variants
   - PropTypes 120줄

4. **Slot 시스템**
   - useSlot() 훅 2번 호출 (root, badge)
   - slots/slotProps와 components/componentsProps 병행 지원
   - externalForwardedProps 병합 로직

5. **useBadge 훅**
   - max 처리 (99+)
   - invisible 계산 (badgeContent === 0 && !showZero)
   - displayValue 계산
   - usePreviousProps로 이전 값 추적

6. **애니메이션**
   - usePreviousProps로 invisible 전환 시 이전 값 유지
   - transition 스타일 (enteringScreen/leavingScreen)
   - transform scale(1) ↔ scale(0)

7. **getAnchorOrigin 헬퍼**
   - anchorOrigin 기본값 처리 (vertical: 'top', horizontal: 'right')

8. **복잡한 variants 스타일**
   - anchorOrigin × overlap = 8개
   - color 7개 (theme.palette 필터링)
   - variant: dot
   - invisible 전환

---

## 비교: Badge vs 일반 `<span>` 조합

| 기능 | Badge | `<span>` 조합 |
|------|------|--------------|
| **테마 통합** | 자동 (palette, transitions) | 수동 CSS 필요 |
| **위치 조정** | anchorOrigin, overlap prop으로 쉽게 | 수동 position, transform 계산 |
| **스타일 변형** | variant, color 등 prop으로 쉽게 | CSS 클래스 직접 관리 |
| **max 처리** | 99+ 자동 | 직접 계산 필요 |
| **애니메이션** | invisible 전환 시 자동 | 직접 구현 필요 |
| **코드 복잡도** | 485줄 (재사용 가능) | 간단하지만 반복 필요 |
| **커스터마이징** | slots, sx, styled 등 다양 | CSS만 가능 |
