# TableSortLabel (Simplified)

## 간소화 결과

```jsx
'use client';
import * as React from 'react';

const ArrowDownwardIcon = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    style={{ display: 'block', width: '1em', height: '1em', fill: 'currentColor' }}
  >
    <path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z" />
  </svg>
);

const TableSortLabel = React.forwardRef(function TableSortLabel(props, ref) {
  const {
    active = false,
    children,
    className,
    direction = 'asc',
    hideSortIcon = false,
    style,
    ...other
  } = props;

  const showIcon = active || !hideSortIcon;

  return (
    <span
      ref={ref}
      className={className}
      style={{
        cursor: 'pointer',
        display: 'inline-flex',
        justifyContent: 'flex-start',
        flexDirection: 'inherit',
        alignItems: 'center',
        ...(active && { color: 'rgba(0,0,0,0.87)' }),
        ...style,
      }}
      {...other}
    >
      {children}
      {showIcon && (
        <span
          style={{
            fontSize: 18,
            marginRight: 4,
            marginLeft: 4,
            opacity: active ? 1 : 0,
            color: active ? 'rgba(0,0,0,0.6)' : 'inherit',
            transition: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1), transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
            userSelect: 'none',
            transform: direction === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <ArrowDownwardIcon />
        </span>
      )}
    </span>
  );
});

export default TableSortLabel;
```

**217줄 → 63줄 (−71%)**

---

## 제거 항목 요약

| 항목 | 제거 이유 |
|------|---------|
| `styled(ButtonBase)` | inline style로 대체, `<span>`은 ButtonBase 없이도 충분 |
| `TableSortLabelIcon styled('span')` | 아이콘 span도 inline style로 대체 |
| `memoTheme` | 테마 종속성 제거 |
| `ButtonBase` | `component="span"` 사용했으므로 `<span>`으로 직접 대체 |
| `ArrowDownwardIcon` (createSvgIcon) | 인라인 SVG로 대체 |
| `useSlot`, `slots`, `slotProps` | slot 커스터마이즈 시스템 제거 |
| `IconComponent` prop | 아이콘 교체 기능 제거 (하드코딩) |
| `disableRipple` | ButtonBase 제거로 자연스럽게 사라짐 |
| `:hover` / `:focus` 효과 | CSS 의사 선택자는 inline style 불가 |
| `useUtilityClasses`, `composeClasses` | CSS 클래스 시스템 제거 |
| `getTableSortLabelUtilityClass`, `tableSortLabelClasses` | 클래스 시스템 일부 |
| `capitalize`, `clsx` | 클래스 시스템 유틸 |
| `classes` prop | 클래스 오버라이드 제거 |
| `useDefaultProps` | 기본값을 props 구조분해로 직접 처리 |
| `ownerState` | styled 변형 시스템 제거 |
| `PropTypes` | 런타임 타입 검사 제거 |

---

## 유지 항목 및 이유

| 항목 | 유지 이유 |
|------|---------|
| `active` prop | 아이콘 표시/색상 결정의 핵심 |
| `direction` prop | 아이콘 회전 방향 결정 |
| `hideSortIcon` prop | 비활성 시 아이콘 숨김 옵션 |
| 인라인 ArrowDownward SVG | 정렬 방향을 시각적으로 표현 |
| icon `opacity` transition | 부드러운 아이콘 등장/소멸 |
| icon `transform` transition | 방향 전환 애니메이션 |

---

## 핵심 학습 포인트

### 1. ButtonBase → span (component prop 패턴)

원본에서 `TableSortLabelRoot = styled(ButtonBase)`를 `component="span"`으로 렌더링:

```jsx
// 원본
<RootSlot disableRipple component="span" {...rootProps} {...other}>

// 이 말은 결국:
// ButtonBase가 내부에서 component="span" → <span> 렌더링
// ButtonBase의 기능: ripple, touch 처리, role=button 등

// 단순화: ButtonBase 없이 <span> 직접 사용
<span ref={ref} style={{ cursor: 'pointer', ... }} {...other}>
```

**제거 시 차이**:
- `ripple` 효과 없음 (시각적 차이, 기능적으로는 동일)
- `role="button"` 없음 (스크린 리더 접근성 일부 손실)
- 포커스 스타일 없음 (`:focus` 처리 제거됨)

학습 목적상 이 차이는 수용 가능.

### 2. hideSortIcon 로직 — opacity vs 미렌더

```jsx
const showIcon = active || !hideSortIcon;

{showIcon && (
  <span style={{ opacity: active ? 1 : 0, ... }}>
    <ArrowDownwardIcon />
  </span>
)}
```

**두 가지 숨김 방식:**

| 상황 | `showIcon` | `opacity` | 렌더링 | 레이아웃 공간 |
|------|-----------|-----------|--------|------------|
| `hideSortIcon=false`, `active=false` | true | 0 (투명) | O | 차지함 |
| `hideSortIcon=false`, `active=true`  | true | 1 (불투명) | O | 차지함 |
| `hideSortIcon=true`, `active=false`  | false | - | X | 없음 |
| `hideSortIcon=true`, `active=true`   | true | 1 (불투명) | O | 차지함 |

**왜 두 가지 방식을 쓰는가?**

- `hideSortIcon=false` (기본): 아이콘이 투명(`opacity: 0`)하지만 레이아웃 공간을 차지.
  → 호버 시 아이콘이 나타나도 레이아웃이 밀리지 않음 (레이아웃 안정)
- `hideSortIcon=true`: 아이콘을 아예 렌더링하지 않음.
  → 비활성 시 공간 절약, 활성화되면 갑자기 나타남 (레이아웃 shift 발생 가능)

### 3. direction → 아이콘 회전

```jsx
transform: direction === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)',
```

아이콘 원본(`ArrowDownward`)은 아래를 향함(↓).

| `direction` | `transform` | 시각적 결과 |
|-------------|------------|-----------|
| `'desc'` | `rotate(0deg)` | ↓ (내림차순: 큰 값 → 작은 값) |
| `'asc'` | `rotate(180deg)` | ↑ (오름차순: 작은 값 → 큰 값) |

하나의 아이콘으로 두 방향을 표현하는 패턴.

### 4. active 상태별 스타일

```jsx
// root span
...(active && { color: 'rgba(0,0,0,0.87)' }),
// → active=false: color 없음 (부모에서 상속)
// → active=true:  color: text.primary (강조)

// icon span
opacity: active ? 1 : 0,
color: active ? 'rgba(0,0,0,0.6)' : 'inherit',
```

`active=false`일 때 아이콘이 `opacity: 0`이어도 `color`는 `inherit`으로 설정.
이는 불필요해 보이지만 `opacity: 0`→`1` 전환 시 색상이 준비되어 있어야 애니메이션이 자연스럽게 나타남.

### 5. transition — opacity와 transform 동시 애니메이션

```jsx
transition: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1), transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
```

두 속성을 동시에 애니메이션:
- `opacity`: 아이콘 등장/소멸 (0 ↔ 1)
- `transform`: 방향 전환 회전 (0deg ↔ 180deg)

`cubic-bezier(0.4, 0, 0.2, 1)` = MUI의 `easeInOut` — 처음과 끝에서 느리고 중간에 빠름.

**왜 icon span에만 transition인가?**

root span의 `color` 변경에는 transition이 없음.
원본에서도 active 색상은 CSS 클래스로 즉시 전환됨 (transition 없음).
아이콘의 opacity/transform만 부드럽게 전환하는 것이 의도된 UX.

### 6. flexDirection: 'inherit'

```jsx
style={{
  display: 'inline-flex',
  flexDirection: 'inherit',  // ← 부모의 flex 방향 상속
  ...
}}
```

TableCell 안에 배치될 때 정렬 방향(`flexDirection`)을 부모에서 상속받음.
`TableCell`의 `align` prop이 `flexDirection: 'row-reverse'`를 설정하면 → TableSortLabel도 자동으로 row-reverse가 되어 아이콘과 텍스트 순서가 뒤집힘.

직접 `flexDirection`을 설정하지 않고 상속받음으로써 부모 TableCell과 자동으로 연동.

### 7. createSvgIcon vs 인라인 SVG 비교

**원본 createSvgIcon:**
```jsx
// createSvgIcon이 생성하는 컴포넌트:
// - SvgIcon styled 컴포넌트 (theme.typography.inherit 적용)
// - fontSize prop (small/medium/large/inherit)
// - htmlColor, color prop (palette 기반)
// - titleAccess, role="img" 접근성
// - viewBox="0 0 24 24" 기본값
```

**단순화 인라인 SVG:**
```jsx
const ArrowDownwardIcon = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    style={{ display: 'block', width: '1em', height: '1em', fill: 'currentColor' }}
  >
    <path d="..." />
  </svg>
);
```

- `width/height: '1em'` → 부모의 `fontSize: 18`을 상속받아 18px 크기가 됨
- `fill: 'currentColor'` → 부모 span의 `color`를 상속받아 색상 설정
- `aria-hidden="true"` → 아이콘은 장식적 요소, 스크린 리더에서 무시
- `display: 'block'` → inline SVG의 하단 공백(descender gap) 제거
