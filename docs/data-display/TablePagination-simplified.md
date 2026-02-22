# TablePagination (Simplified)

## 간소화 결과

```jsx
'use client';
import * as React from 'react';
import TableCell from '../TableCell';
import TablePaginationActions from '../TablePaginationActions';

function defaultLabelDisplayedRows({ from, to, count }) {
  return `${from}–${to} of ${count !== -1 ? count : `more than ${to}`}`;
}

function defaultGetAriaLabel(type) {
  return `Go to ${type} page`;
}

const TablePagination = React.forwardRef(function TablePagination(props, ref) {
  const {
    colSpan: colSpanProp,
    count,
    disabled = false,
    getItemAriaLabel = defaultGetAriaLabel,
    labelDisplayedRows = defaultLabelDisplayedRows,
    labelRowsPerPage = 'Rows per page:',
    onPageChange,
    onRowsPerPageChange,
    page,
    rowsPerPage,
    rowsPerPageOptions = [10, 25, 50, 100],
    showFirstButton = false,
    showLastButton = false,
    ...other
  } = props;

  const colSpan = colSpanProp || 1000;
  const selectId = React.useId();
  const labelId = React.useId();

  const getLabelDisplayedRowsTo = () => {
    if (count === -1) {
      return (page + 1) * rowsPerPage;
    }
    return rowsPerPage === -1 ? count : Math.min(count, (page + 1) * rowsPerPage);
  };

  const body2 = { fontSize: '0.875rem', lineHeight: 1.43, fontWeight: 400 };

  return (
    <TableCell
      ref={ref}
      colSpan={colSpan}
      style={{ overflow: 'auto', color: 'rgba(0,0,0,0.87)', fontSize: '0.875rem', padding: 0 }}
      {...other}
    >
      <div
        style={{ display: 'flex', alignItems: 'center', minHeight: 52, paddingRight: 2 }}
      >
        <div style={{ flex: '1 1 100%' }} />
        {rowsPerPageOptions.length > 1 && (
          <p id={labelId} style={{ ...body2, flexShrink: 0, margin: 0 }}>
            {labelRowsPerPage}
          </p>
        )}
        {rowsPerPageOptions.length > 1 && (
          <select
            id={selectId}
            aria-labelledby={labelId}
            value={rowsPerPage}
            onChange={onRowsPerPageChange}
            disabled={disabled}
            style={{ color: 'inherit', fontSize: 'inherit', flexShrink: 0, marginRight: 32, marginLeft: 8 }}
          >
            {rowsPerPageOptions.map((option) => (
              <option
                key={option.label ?? option}
                value={option.value ?? option}
              >
                {option.label ?? option}
              </option>
            ))}
          </select>
        )}
        <p style={{ ...body2, flexShrink: 0, margin: 0 }}>
          {labelDisplayedRows({
            from: count === 0 ? 0 : page * rowsPerPage + 1,
            to: getLabelDisplayedRowsTo(),
            count: count === -1 ? -1 : count,
            page,
          })}
        </p>
        <TablePaginationActions
          count={count}
          onPageChange={onPageChange}
          page={page}
          rowsPerPage={rowsPerPage}
          showFirstButton={showFirstButton}
          showLastButton={showLastButton}
          getItemAriaLabel={getItemAriaLabel}
          disabled={disabled}
          style={{ flexShrink: 0, marginLeft: 20 }}
        />
      </div>
    </TableCell>
  );
});

export default TablePagination;
```

**529줄 → 98줄 (−81%)**

---

## 제거 항목 요약

| 항목 | 제거 이유 |
|------|---------|
| 7개 `styled()` 컴포넌트 | inline style로 대체 |
| `memoTheme` | 테마 값 하드코딩 |
| `Toolbar` | `<div>` flex로 대체 |
| `Select`, `MenuItem`, `InputBase` | native `<select>`, `<option>`으로 대체 |
| 7개 `useSlot` | 직접 JSX 사용 |
| `slots`, `slotProps` props | 슬롯 시스템 제거 |
| `ActionsComponent`, `component` props | 고정 컴포넌트 사용 |
| `SelectProps`, `backIconButtonProps`, `nextIconButtonProps` | deprecated 제거 |
| `clsx` | 클래스 합성 유틸 |
| `useUtilityClasses`, `composeClasses` | CSS 클래스 시스템 제거 |
| `tablePaginationClasses`, `getTablePaginationUtilityClass` | 클래스 시스템 일부 |
| `classes` prop | 클래스 오버라이드 제거 |
| `useDefaultProps` | 기본값 직접 처리 |
| `ownerState` | styled 변형 시스템 제거 |
| `PropTypes`, `integerPropType`, `chainPropTypes` | 런타임 타입 검사 제거 |
| 커스텀 `useId` | `React.useId()` (React 18 내장)으로 대체 |

---

## 유지 항목 및 이유

| 항목 | 유지 이유 |
|------|---------|
| `TableCell` (root) | 이미 단순화된 컴포넌트 재사용 |
| `TablePaginationActions` | 이미 단순화된 컴포넌트 재사용 |
| `React.useId()` | label/select 접근성 연결 필수 |
| `getLabelDisplayedRowsTo()` | 핵심 학습 포인트 |
| `defaultLabelDisplayedRows` | 기본 텍스트 포맷 |
| `defaultGetAriaLabel` | 기본 접근성 레이블 |
| `count`, `page`, `rowsPerPage`, `onPageChange` | 핵심 기능 |
| `rowsPerPageOptions` | 선택 UI 제어 |
| `labelDisplayedRows`, `labelRowsPerPage` | 로컬라이징 포인트 |

---

## 핵심 학습 포인트

### 1. getLabelDisplayedRowsTo — 3가지 케이스

```js
const getLabelDisplayedRowsTo = () => {
  if (count === -1) return (page + 1) * rowsPerPage;
  return rowsPerPage === -1 ? count : Math.min(count, (page + 1) * rowsPerPage);
};
```

| 조건 | 의미 | 반환 |
|------|------|------|
| `count === -1` | 전체 데이터 수 미확정 | 현재 페이지 끝 행 번호 |
| `rowsPerPage === -1` | "All" 옵션 (전체 보기) | `count` 전체 |
| 일반 | 일반 페이지네이션 | `Math.min(count, (page+1)*rowsPerPage)` |

**`Math.min` 보호**: 마지막 페이지는 rowsPerPage보다 적을 수 있으므로 count를 초과하지 않도록.

### 2. from 계산 — count === 0 특수 처리

```js
from: count === 0 ? 0 : page * rowsPerPage + 1,
```

| `count` | `page` | `from` |
|---------|--------|--------|
| 0 | 0 | 0 (빈 데이터 → "0–0 of 0") |
| 100 | 0 | 1 (첫 페이지 → "1–10 of 100") |
| 100 | 1 | 11 (두 번째 페이지 → "11–20 of 100") |

`count === 0`이면 `page * rowsPerPage + 1 = 1`이 되어 "1–0 of 0"이 됨 → `0`으로 보정.

### 3. React.useId — label/select 접근성 연결

```jsx
const selectId = React.useId();
const labelId = React.useId();

<p id={labelId}>Rows per page:</p>
<select id={selectId} aria-labelledby={labelId}>
```

- `id`/`aria-labelledby` 쌍: 스크린 리더가 select를 읽을 때 "Rows per page: 10" 으로 읽음
- `React.useId()`: SSR과 클라이언트에서 일치하는 고유 ID 생성 (React 18+)

원본의 커스텀 `useId`도 같은 역할이지만 React 18에서는 내장 훅으로 대체 가능.

### 4. rowsPerPageOptions — 두 가지 형태 지원

```jsx
rowsPerPageOptions={[10, 25, { label: 'All', value: -1 }]}
```

```jsx
{rowsPerPageOptions.map((option) => (
  <option
    key={option.label ?? option}
    value={option.value ?? option}
  >
    {option.label ?? option}
  </option>
))}
```

- **숫자**: `option.label` = undefined → `option.label ?? option` = 숫자
- **객체 `{label, value}`**: `option.label` = "All" → "All" 표시, `option.value` = -1

`??` (nullish coalescing): `null`/`undefined`일 때만 우측 사용 (0이나 빈 문자열은 그대로).

### 5. MUI Select → native select — 복잡도 제거

원본의 MUI `Select`:
- `InputBase`를 input으로 사용
- `variant="standard"` 지정
- `classes` 오버라이드 (select, input, selectRoot, selectIcon)
- `labelId` prop으로 내부 연결

단순화의 native `<select>`:
- HTML 기본 컨트롤
- `aria-labelledby`로 직접 레이블 연결
- 스타일 최소화 (`color: inherit, fontSize: inherit`)

**트레이드오프**: MUI Select의 커스텀 드롭다운 UI 포기, 대신 브라우저 기본 UI 사용.

### 6. 하드코딩 값

| 원본 테마 참조 | 하드코딩 값 |
|----------------|------------|
| `theme.palette.text.primary` | `'rgba(0,0,0,0.87)'` |
| `theme.typography.pxToRem(14)` | `'0.875rem'` |
| `theme.typography.body2` | `{ fontSize: '0.875rem', lineHeight: 1.43, fontWeight: 400 }` |
| Toolbar `minHeight` | `52` |
| Toolbar `paddingRight` | `2` |
| Actions `marginLeft` | `20` |
