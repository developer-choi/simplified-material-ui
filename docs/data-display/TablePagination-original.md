# TablePagination (Original)

## 역할

`TableFooter` 안에 위치하는 페이지네이션 컨트롤 (행/페이지 수 선택, 페이지 이동 버튼).

---

## 구조

```
TablePaginationRoot (styled(TableCell))
  └─ TablePaginationToolbar (styled(Toolbar))
       ├─ TablePaginationSpacer (styled div)
       ├─ [rowsPerPageOptions > 1] TablePaginationSelectLabel (styled p, body2)
       ├─ [rowsPerPageOptions > 1] TablePaginationSelect (styled(Select))
       │     └─ TablePaginationMenuItem (styled(MenuItem)) × N
       ├─ TablePaginationDisplayedRows (styled p, body2)
       └─ ActionsComponent (기본값: TablePaginationActions)
```

---

## 주요 props

| prop | 역할 |
|------|------|
| `count` | 전체 행 수 (-1이면 미확정) |
| `page` | 현재 페이지 (0-based) |
| `rowsPerPage` | 페이지당 행 수 |
| `onPageChange` | 페이지 변경 콜백 |
| `onRowsPerPageChange` | 행 수 변경 콜백 |
| `rowsPerPageOptions` | 선택 가능한 행 수 목록 (기본: [10, 25, 50, 100]) |
| `labelDisplayedRows` | 표시 행 범위 포맷 함수 |
| `labelRowsPerPage` | "Rows per page:" 레이블 |
| `showFirstButton` / `showLastButton` | 첫/마지막 버튼 표시 여부 |
| `getItemAriaLabel` | 접근성 레이블 함수 |
| `disabled` | 전체 비활성화 |
| `colSpan` | TableCell colSpan (기본: 1000) |

---

## 복잡도 원인

```js
// 1. 7개 styled 컴포넌트
const TablePaginationRoot = styled(TableCell, { name: 'MuiTablePagination', slot: 'Root' })(
  memoTheme(({ theme }) => ({ overflow: 'auto', color: theme.palette.text.primary, ... }))
);
const TablePaginationToolbar = styled(Toolbar, ...)( memoTheme(({ theme }) => ({ minHeight: 52, ... })) );
const TablePaginationSpacer = styled('div', ...)({ flex: '1 1 100%' });
const TablePaginationSelectLabel = styled('p', ...)( memoTheme(({ theme }) => ({ ...theme.typography.body2 })) );
const TablePaginationSelect = styled(Select, ...)({ color: 'inherit', ... });
const TablePaginationMenuItem = styled(MenuItem, ...)({});  // 빈 스타일
const TablePaginationDisplayedRows = styled('p', ...)( memoTheme(({ theme }) => ({ ...theme.typography.body2 })) );

// 2. 7개 useSlot 호출
const [RootSlot, rootSlotProps] = useSlot('root', { ... });
const [ToolbarSlot, toolbarSlotProps] = useSlot('toolbar', { ... });
// ... 5개 더

// 3. deprecated props
ActionsComponent, component, SelectProps, backIconButtonProps, nextIconButtonProps

// 4. selectProps 파생 변수, MenuItemComponent 조건 분기
const selectProps = slotProps?.select ?? SelectProps;
const MenuItemComponent = selectProps.native ? 'option' : TablePaginationMenuItem;

// 5. colSpan 조건 분기
if (component === TableCell || component === 'td') colSpan = colSpanProp || 1000;
```

---

## getLabelDisplayedRowsTo 로직

```js
const getLabelDisplayedRowsTo = () => {
  if (count === -1) return (page + 1) * rowsPerPage;  // 전체 수 미확정
  return rowsPerPage === -1 ? count : Math.min(count, (page + 1) * rowsPerPage);
};
```

| 조건 | 반환값 |
|------|--------|
| `count === -1` | 미확정 → 현재 페이지 마지막 행 번호 |
| `rowsPerPage === -1` | 전체 보기 → count 전체 |
| 일반 | 현재 페이지 마지막 행 (count 초과 방지) |

---

## defaultLabelDisplayedRows

```js
function defaultLabelDisplayedRows({ from, to, count }) {
  return `${from}–${to} of ${count !== -1 ? count : `more than ${to}`}`;
}
```

- `count !== -1`: "1–10 of 100"
- `count === -1`: "1–10 of more than 10"
