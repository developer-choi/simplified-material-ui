# Table 가족 (Simplified)

## 간소화 결과

### TableContainer

```jsx
'use client';
import * as React from 'react';

const TableContainer = React.forwardRef(function TableContainer(props, ref) {
  const { className, style, ...other } = props;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        width: '100%',
        overflowX: 'auto',
        ...style,
      }}
      {...other}
    />
  );
});

export default TableContainer;
```

**82줄 → 21줄 (−74%)**

---

### Table

```jsx
'use client';
import * as React from 'react';
import TableContext from './TableContext';

const Table = React.forwardRef(function Table(props, ref) {
  const {
    className,
    padding = 'normal',
    size = 'medium',
    stickyHeader = false,
    style,
    ...other
  } = props;

  const table = React.useMemo(
    () => ({ padding, size, stickyHeader }),
    [padding, size, stickyHeader],
  );

  return (
    <TableContext.Provider value={table}>
      <table
        ref={ref}
        className={className}
        style={{
          display: 'table',
          width: '100%',
          borderCollapse: stickyHeader ? 'separate' : 'collapse',
          borderSpacing: 0,
          ...style,
        }}
        {...other}
      />
    </TableContext.Provider>
  );
});

export default Table;
```

**146줄 → 38줄 (−74%)**

---

### TableBody / TableHead / TableFooter

세 컴포넌트 구조가 동일. variant와 HTML 태그만 다름.

```jsx
// TableBody
'use client';
import * as React from 'react';
import Tablelvl2Context from '../Table/Tablelvl2Context';

const tablelvl2 = { variant: 'body' };

const TableBody = React.forwardRef(function TableBody(props, ref) {
  const { className, style, ...other } = props;

  return (
    <Tablelvl2Context.Provider value={tablelvl2}>
      <tbody
        ref={ref}
        className={className}
        style={{ display: 'table-row-group', ...style }}
        {...other}
      />
    </Tablelvl2Context.Provider>
  );
});

export default TableBody;
```

| 컴포넌트 | HTML 태그 | display 값 | variant |
|---------|----------|-----------|---------|
| TableBody | `<tbody>` | `table-row-group` | `'body'` |
| TableHead | `<thead>` | `table-header-group` | `'head'` |
| TableFooter | `<tfoot>` | `table-footer-group` | `'footer'` |

**각 91줄 → 22줄 (−76%)**

---

### TableRow

```jsx
'use client';
import * as React from 'react';

const TableRow = React.forwardRef(function TableRow(props, ref) {
  const {
    className,
    selected = false,
    style,
    ...other
  } = props;

  return (
    <tr
      ref={ref}
      className={className}
      style={{
        color: 'inherit',
        display: 'table-row',
        verticalAlign: 'middle',
        outline: 0,
        ...(selected && { backgroundColor: 'rgba(25, 118, 210, 0.08)' }),
        ...style,
      }}
      {...other}
    />
  );
});

export default TableRow;
```

**136줄 → 28줄 (−79%)**

---

### TableCell

```jsx
'use client';
import * as React from 'react';
import TableContext from '../Table/TableContext';
import Tablelvl2Context from '../Table/Tablelvl2Context';

const TableCell = React.forwardRef(function TableCell(props, ref) {
  const {
    align = 'inherit',
    className,
    padding: paddingProp,
    scope: scopeProp,
    size: sizeProp,
    sortDirection,
    style,
    variant: variantProp,
    ...other
  } = props;

  const table = React.useContext(TableContext);
  const tablelvl2 = React.useContext(Tablelvl2Context);

  const isHeadCell = tablelvl2 && tablelvl2.variant === 'head';
  const Component = isHeadCell ? 'th' : 'td';

  let scope = scopeProp;
  if (Component === 'td') {
    scope = undefined;
  } else if (!scope && isHeadCell) {
    scope = 'col';
  }

  const variant = variantProp || (tablelvl2 && tablelvl2.variant);
  const padding = paddingProp || (table && table.padding ? table.padding : 'normal');
  const size = sizeProp || (table && table.size ? table.size : 'medium');
  const stickyHeader = variant === 'head' && table && table.stickyHeader;

  let ariaSort = null;
  if (sortDirection) {
    ariaSort = sortDirection === 'asc' ? 'ascending' : 'descending';
  }

  return (
    <Component
      ref={ref}
      className={className}
      aria-sort={ariaSort}
      scope={scope}
      style={{
        display: 'table-cell',
        verticalAlign: 'inherit',
        borderBottom: '1px solid rgba(224, 224, 224, 1)',
        textAlign: 'left',
        padding: size === 'small' ? '6px 16px' : '16px',
        fontSize: '0.875rem',
        lineHeight: 1.43,
        fontWeight: 400,
        ...(variant === 'head' && {
          color: 'rgba(0,0,0,0.87)',
          fontWeight: 500,
          lineHeight: '1.5rem',
        }),
        ...(variant === 'body' && {
          color: 'rgba(0,0,0,0.87)',
        }),
        ...(variant === 'footer' && {
          color: 'rgba(0,0,0,0.6)',
          fontSize: '0.75rem',
          lineHeight: '1.3125rem',
        }),
        ...(padding === 'checkbox' && {
          width: 48,
          padding: '0 0 0 4px',
        }),
        ...(padding === 'none' && {
          padding: 0,
        }),
        ...(align === 'center' && { textAlign: 'center' }),
        ...(align === 'right' && { textAlign: 'right', flexDirection: 'row-reverse' }),
        ...(align === 'justify' && { textAlign: 'justify' }),
        ...(stickyHeader && {
          position: 'sticky',
          top: 0,
          zIndex: 2,
          backgroundColor: '#ffffff',
        }),
        ...style,
      }}
      {...other}
    />
  );
});

export default TableCell;
```

**311줄 → 97줄 (−69%)**

---

## 전체 감소량

| 컴포넌트 | 원본 | 단순화 | 감소 |
|---------|-----|--------|------|
| TableContainer | 82줄 | 21줄 | −74% |
| Table | 146줄 | 38줄 | −74% |
| TableBody | 91줄 | 22줄 | −76% |
| TableHead | 91줄 | 22줄 | −76% |
| TableFooter | 91줄 | 22줄 | −76% |
| TableRow | 136줄 | 28줄 | −79% |
| TableCell | 311줄 | 97줄 | −69% |
| **합계** | **948줄** | **250줄** | **−74%** |

---

## 제거 항목 요약

| 항목 | 해당 파일 | 제거 이유 |
|------|---------|---------|
| `styled()` | 전체 | inline style로 대체 |
| `memoTheme` | Table, TableRow, TableCell | 테마 종속성 제거 |
| `useUtilityClasses` / `composeClasses` | 전체 | CSS 클래스 시스템 제거 |
| `getXxxUtilityClass` | 전체 | 클래스 시스템의 일부 |
| `useDefaultProps` | 전체 | 기본값을 props 구조분해로 직접 처리 |
| `component` prop | 전체 | 태그 고정 (TableCell만 동적 결정 유지) |
| `ownerState` | 전체 | styled 변형(variant) 시스템 제거 |
| `clsx` | 전체 | className 조건 합성 불필요 |
| `PropTypes` | 전체 | 런타임 타입 검사 제거 |
| `hover` prop (TableRow) | TableRow | CSS `:hover`는 inline style 불가 |
| `Tablelvl2Context` 읽기 | TableRow | TableRow 자체 스타일에서 variant 불필요 |
| `theme.typography.body2` (`& caption`) | Table | `<caption>` 자식 스타일 제거 |

---

## 유지 항목 및 이유

| 항목 | 유지 이유 |
|------|---------|
| `TableContext.Provider` (Table) | padding/size/stickyHeader를 TableCell에 전달하는 핵심 메커니즘 |
| `useMemo(table)` (Table) | Context 값 안정화 → 불필요한 자식 리렌더 방지 |
| `Tablelvl2Context.Provider` (Body/Head/Footer) | variant를 TableCell에 전달하는 핵심 메커니즘 |
| `TableContext` 읽기 (TableCell) | Table의 padding/size/stickyHeader 상속 |
| `Tablelvl2Context` 읽기 (TableCell) | variant 결정 (head/body/footer) |
| `isHeadCell ? 'th' : 'td'` (TableCell) | 접근성 핵심: 헤더 셀은 `<th>` 사용 |
| `scope` 자동 설정 (TableCell) | HTML 스펙 준수 (`<th>`에 scope, `<td>`에서 제거) |
| `aria-sort` (TableCell) | 정렬 방향 접근성 지원 |
| `selected` → `backgroundColor` (TableRow) | 선택 상태 시각적 피드백 |
| `stickyHeader` → `position: sticky` (TableCell) | sticky 헤더 기능 |
| `borderCollapse: stickyHeader ? 'separate' : 'collapse'` (Table) | stickyHeader 작동에 필수 |

---

## 핵심 학습 포인트

### 1. 2단계 Context 계층 구조

```
Table
  └─ TableContext.Provider ({ padding, size, stickyHeader })
      └─ TableBody / TableHead / TableFooter
            └─ Tablelvl2Context.Provider ({ variant: 'body'|'head'|'footer' })
                  └─ TableRow
                        └─ TableCell (두 Context 모두 소비)
```

**왜 두 개의 Context인가?**

- `TableContext`: Table 컴포넌트의 전역 설정 (패딩, 크기, sticky)
- `Tablelvl2Context`: 현재 위치(body/head/footer)를 자식에게 알림

TableCell이 두 Context를 모두 읽어야 하는 이유:
- `TableContext` → padding, size, stickyHeader 상속
- `Tablelvl2Context` → `th`/`td` 결정, variant별 스타일 적용

### 2. useMemo로 Context 값 안정화

```js
// Table.js
const table = React.useMemo(
  () => ({ padding, size, stickyHeader }),
  [padding, size, stickyHeader],
);

return <TableContext.Provider value={table}>...</TableContext.Provider>;
```

**왜 useMemo인가?**

Context.Provider의 `value`가 참조가 바뀌면 모든 소비자가 리렌더됨.
매 렌더마다 `{ padding, size, stickyHeader }` 새 객체가 생성되면 → TableCell 전체 리렌더.
`useMemo`로 값이 실제로 변경될 때만 새 객체 생성.

```js
// useMemo 없이:
<TableContext.Provider value={{ padding, size, stickyHeader }}>
// → Table 리렌더될 때마다 value 객체가 새로 생성 → TableCell 불필요한 리렌더

// useMemo 있음:
// → padding/size/stickyHeader가 바뀔 때만 새 객체 → TableCell은 실제 변경 시만 리렌더
```

### 3. th vs td 자동 결정 + scope HTML 스펙

```js
const isHeadCell = tablelvl2 && tablelvl2.variant === 'head';
const Component = isHeadCell ? 'th' : 'td';

let scope = scopeProp;
if (Component === 'td') {
  scope = undefined;  // <td>에는 scope 속성 무효
} else if (!scope && isHeadCell) {
  scope = 'col';      // <th>에 기본 scope='col' 자동 설정
}
```

**HTML 스펙 규칙**:
- `scope` 속성은 `<th>` 전용 (접근성 목적)
- `scope="col"`: 같은 열의 셀들에 대한 헤더임을 명시
- `scope="row"`: 같은 행의 셀들에 대한 헤더임을 명시

TableCell은 `Tablelvl2Context`에서 variant를 읽어 자동으로 올바른 HTML 요소와 scope를 설정.

### 4. aria-sort — 접근성

```js
let ariaSort = null;
if (sortDirection) {
  ariaSort = sortDirection === 'asc' ? 'ascending' : 'descending';
}

return <Component aria-sort={ariaSort} ... />;
```

스크린 리더가 테이블 정렬 상태를 인식할 수 있게 함.

| `sortDirection` prop | `aria-sort` 속성 |
|---------------------|----------------|
| `'asc'` | `'ascending'` |
| `'desc'` | `'descending'` |
| `undefined` | `null` (속성 없음) |

### 5. Context에서 값 상속 (prop 우선, 없으면 Context)

```js
// TableCell
const padding = paddingProp || (table && table.padding ? table.padding : 'normal');
const size = sizeProp || (table && table.size ? table.size : 'medium');
```

우선순위:
1. `TableCell`에 직접 전달된 prop (`paddingProp`, `sizeProp`)
2. `Table` 컴포넌트의 Context 값 (`table.padding`, `table.size`)
3. 기본값 (`'normal'`, `'medium'`)

이 패턴으로 개별 셀에서 오버라이드 가능, 없으면 Table 설정 상속.

### 6. stickyHeader 작동 원리

```js
// Table.js
borderCollapse: stickyHeader ? 'separate' : 'collapse',
borderSpacing: 0,

// TableCell.js
const stickyHeader = variant === 'head' && table && table.stickyHeader;
...(stickyHeader && {
  position: 'sticky',
  top: 0,
  zIndex: 2,
  backgroundColor: '#ffffff',
}),
```

**왜 `borderCollapse: 'separate'`가 필요한가?**

`border-collapse: collapse`인 경우, `position: sticky`가 제대로 작동하지 않음 (브라우저 버그).
`border-collapse: separate` + `border-spacing: 0`으로 시각적으로 동일하게 유지하면서 sticky 활성화.

**왜 `zIndex: 2`인가?**

스크롤 시 헤더가 body 셀 위에 겹쳐야 하므로.

**왜 `backgroundColor: '#ffffff'`인가?**

`position: sticky`는 배경이 투명하면 뒤에 스크롤되는 셀이 비쳐 보임. 흰색 배경으로 차단.

### 7. hover 제거 — inline style의 한계

```js
// 원본 (styled 사용 시 가능):
[`&:hover`]: {
  backgroundColor: theme.palette.action.hover,
},

// inline style로는 불가 — 제거됨
```

CSS 가상 선택자(`:hover`, `:focus`, `:nth-child` 등)는 React inline style로 표현 불가.

**대안**: 사용자가 `className`으로 CSS를 추가하거나, `onMouseEnter`/`onMouseLeave`로 state 관리.

### 8. 하드코딩 값 근거

| 값 | 원본 계산식 | 하드코딩 |
|---|------------|---------|
| `borderBottom` | `lighten(alpha(divider, 1), 0.88)` | `'1px solid rgba(224, 224, 224, 1)'` |
| `selected bg` | `alpha(primary.main, 0.08)` | `'rgba(25, 118, 210, 0.08)'` |
| `head fontWeight` | `theme.typography.fontWeightMedium` | `500` |
| `head lineHeight` | `pxToRem(24)` | `'1.5rem'` |
| `footer fontSize` | `pxToRem(12)` | `'0.75rem'` |
| `footer lineHeight` | `pxToRem(21)` | `'1.3125rem'` |
| `footer color` | `text.secondary` | `'rgba(0,0,0,0.6)'` |
| `stickyHeader bg` | `background.default` | `'#ffffff'` |
