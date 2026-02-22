# TableSortLabel (Original)

## 역할

테이블 컬럼 헤더에 정렬 방향을 나타내는 레이블 버튼. `TableCell` 안에 배치해서 사용.

---

## 구조

```
TableSortLabel (ButtonBase[component="span"])
  └─ children (텍스트)
  └─ IconSlot (span) → ArrowDownwardIcon (createSvgIcon → svg)
```

---

## 주요 props

| prop | 기본값 | 역할 |
|------|-------|------|
| `active` | `false` | 현재 정렬 중인 컬럼 여부 (아이콘 표시 + 색상) |
| `direction` | `'asc'` | 정렬 방향 → 아이콘 회전 (asc=180deg, desc=0deg) |
| `hideSortIcon` | `false` | 비활성 시 아이콘 숨김 여부 |
| `IconComponent` | `ArrowDownwardIcon` | 아이콘 교체 가능 |
| `slots` / `slotProps` | `{}` | 루트/아이콘 슬롯 커스터마이즈 |

---

## 복잡도 원인

```js
// 1. styled 2개 (Root + Icon)
const TableSortLabelRoot = styled(ButtonBase, { ... })(memoTheme(({ theme }) => ({
  cursor: 'pointer',
  '&:hover': {
    color: theme.palette.text.secondary,
    [`& .${tableSortLabelClasses.icon}`]: { opacity: 0.5 },
  },
  [`&.${tableSortLabelClasses.active}`]: {
    color: theme.palette.text.primary,
    [`& .${tableSortLabelClasses.icon}`]: { opacity: 1, color: theme.palette.text.secondary },
  },
})));

const TableSortLabelIcon = styled('span', { ... })(memoTheme(({ theme }) => ({
  opacity: 0,
  transition: theme.transitions.create(['opacity', 'transform'], {
    duration: theme.transitions.duration.shorter,
  }),
  variants: [
    { props: { direction: 'desc' }, style: { transform: 'rotate(0deg)' } },
    { props: { direction: 'asc' },  style: { transform: 'rotate(180deg)' } },
  ],
})));

// 2. slot 시스템
const [RootSlot, rootProps] = useSlot('root', { ... });
const [IconSlot, iconProps] = useSlot('icon', { ... });

// 3. CSS 의사 선택자 (:hover, :focus, &.active)
// → inline style 불가

// 4. hideSortIcon 로직
{hideSortIcon && !active ? null : <IconSlot as={IconComponent} {...iconProps} />}
```

---

## 하드코딩 필요 값

| 값 | 원본 | 하드코딩 |
|---|------|---------|
| icon transition duration | `theme.transitions.duration.shorter` = 200ms | `200ms` |
| active root color | `theme.palette.text.primary` | `rgba(0,0,0,0.87)` |
| active icon color | `theme.palette.text.secondary` | `rgba(0,0,0,0.6)` |
