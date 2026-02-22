# TablePaginationActions (Original)

## 역할

`TablePagination` 내부에서 사용되는 페이지네이션 버튼 그룹 (첫 페이지/이전/다음/마지막 페이지).

---

## 구조

```
TablePaginationActionsRoot (styled div — 스타일 없음)
  ├─ [showFirstButton] FirstButtonSlot (IconButton) → FirstButtonIcon
  ├─ PreviousButtonSlot (IconButton) → PreviousButtonIcon
  ├─ NextButtonSlot (IconButton) → NextButtonIcon
  └─ [showLastButton] LastButtonSlot (IconButton) → LastButtonIcon
```

---

## 주요 props

| prop | 역할 |
|------|------|
| `count` | 전체 행 수 (-1이면 미확정) |
| `page` | 현재 페이지 (0-based) |
| `rowsPerPage` | 페이지당 행 수 |
| `onPageChange` | 페이지 변경 콜백 `(event, newPage) => void` |
| `showFirstButton` / `showLastButton` | 첫/마지막 버튼 표시 여부 |
| `getItemAriaLabel` | `(type, page) => string` 접근성 레이블 |
| `disabled` | 전체 버튼 비활성화 |

---

## 복잡도 원인

```js
// 1. RTL: first/last, prev/next 버튼과 아이콘을 모두 뒤집음 (8개 조건)
const isRtl = useRtl();
const FirstButtonSlot = isRtl ? LastButton : FirstButton;
const firstButtonSlotProps = isRtl ? slotProps.lastButton : slotProps.firstButton;
// ... 8개 조건 변수

// 2. 8개 slot (버튼 4개 + 아이콘 4개) 교체 가능
const FirstButton = slots.firstButton ?? IconButton;
const FirstButtonIcon = slots.firstButtonIcon ?? FirstPageIconDefault;

// 3. deprecated props (backIconButtonProps, nextIconButtonProps)
{...(previousButtonSlotProps ?? backIconButtonProps)}

// 4. TablePaginationActionsRoot styled('div') — 스타일 없음
const TablePaginationActionsRoot = styled('div', { ... })({});
```

---

## 페이지 계산

```js
const lastPage = Math.ceil(count / rowsPerPage) - 1;

// next 버튼 disabled: 마지막 페이지이면 비활성
// count === -1이면 전체 수 미확정 → 항상 활성
disabled={count !== -1 ? page >= lastPage : false}

// 마지막 페이지 이동 시 Math.max(0, ...) 보호
onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
```
