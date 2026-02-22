# Table 가족 (Original)

## 구성 컴포넌트

| 컴포넌트 | 파일 | 줄수 | 역할 |
|---------|-----|-----|------|
| TableContainer | `TableContainer/TableContainer.js` | 82줄 | 스크롤 컨테이너 (div) |
| Table | `Table/Table.js` | 146줄 | 테이블 루트 + TableContext 제공 |
| TableBody | `TableBody/TableBody.js` | 91줄 | tbody + Tablelvl2Context 제공 |
| TableHead | `TableHead/TableHead.js` | 91줄 | thead + Tablelvl2Context 제공 |
| TableFooter | `TableFooter/TableFooter.js` | 91줄 | tfoot + Tablelvl2Context 제공 |
| TableRow | `TableRow/TableRow.js` | 136줄 | tr + hover/selected |
| TableCell | `TableCell/TableCell.js` | 311줄 | td/th 동적 결정, 가장 복잡 |

---

## Context 계층 구조

```
Table
  └─ TableContext.Provider ({ padding, size, stickyHeader })
      └─ TableBody / TableHead / TableFooter
            └─ Tablelvl2Context.Provider ({ variant: 'body'|'head'|'footer' })
                  └─ TableRow
                        └─ TableCell (두 Context 모두 소비)
```

**TableContext** (`Table/TableContext.js`): Table의 `padding`, `size`, `stickyHeader`를 TableCell에 전달

**Tablelvl2Context** (`Table/Tablelvl2Context.js`): Body/Head/Footer의 `variant`를 TableRow/TableCell에 전달

---

## 컴포넌트별 복잡도

### TableContainer
```js
// styled('div') → width: '100%', overflowX: 'auto'
// 이게 전부. 실제 로직 없음
```

### Table
```js
// 1. stickyHeader에 따른 borderCollapse 분기
// 2. & caption 자식 선택자 스타일 (theme.typography.body2)
// 3. TableContext.Provider로 padding/size/stickyHeader 전달
const table = React.useMemo(
  () => ({ padding, size, stickyHeader }),
  [padding, size, stickyHeader],
);
```

### TableBody / TableHead / TableFooter
```js
// 완전히 동일한 구조, 차이점:
// TableBody:   styled('tbody'), display: 'table-row-group',   variant: 'body'
// TableHead:   styled('thead'), display: 'table-header-group', variant: 'head'
// TableFooter: styled('tfoot'), display: 'table-footer-group', variant: 'footer'
```

### TableRow
```js
// 1. Tablelvl2Context 읽어서 head/footer 판별
const tablelvl2 = React.useContext(Tablelvl2Context);
const ownerState = {
  head: tablelvl2 && tablelvl2.variant === 'head',
  footer: tablelvl2 && tablelvl2.variant === 'footer',
};

// 2. hover: CSS :hover 선택자로 background 변경 (theme.palette.action.hover)
// 3. selected: alpha(primary.main, selectedOpacity) background
[`&.${tableRowClasses.hover}:hover`]: {
  backgroundColor: theme.palette.action.hover,
},
[`&.${tableRowClasses.selected}`]: {
  backgroundColor: theme.alpha(primary.main, selectedOpacity),
},
```

### TableCell — 가장 복잡
```js
// 1. 두 Context 동시 소비
const table = React.useContext(TableContext);       // padding, size, stickyHeader
const tablelvl2 = React.useContext(Tablelvl2Context); // variant

// 2. th vs td 자동 결정
const isHeadCell = tablelvl2 && tablelvl2.variant === 'head';
component = isHeadCell ? 'th' : 'td';

// 3. scope 자동 설정
// - <td>에서는 scope 제거 (HTML 스펙상 무효)
// - <th>에서 scope 없으면 'col' 자동 설정
if (component === 'td') {
  scope = undefined;
} else if (!scope && isHeadCell) {
  scope = 'col';
}

// 4. Context 상속 (prop 없으면 Table의 값 사용)
padding = paddingProp || (table && table.padding ? table.padding : 'normal');
size = sizeProp || (table && table.size ? table.size : 'medium');

// 5. stickyHeader (head variant이고 Table.stickyHeader=true일 때)
stickyHeader: variant === 'head' && table && table.stickyHeader,

// 6. aria-sort (정렬 방향 접근성)
ariaSort = sortDirection === 'asc' ? 'ascending' : 'descending';

// 7. styled 9개 variants:
// variant(head/body/footer), size(small), padding(checkbox/none),
// align(left/center/right/justify), stickyHeader
```

---

## 스타일 하드코딩 근거

### TableCell 테두리
```js
// theme.lighten(theme.alpha(theme.palette.divider, 1), 0.88)
// divider = rgba(0,0,0,0.12) → alpha(1) = #000000 → lighten(0.88) ≈ #e0e0e0
borderBottom: '1px solid rgba(224, 224, 224, 1)'
```

### TableRow selected
```js
// theme.alpha(primary.main, action.selectedOpacity)
// #1976d2, opacity=0.08
backgroundColor: 'rgba(25, 118, 210, 0.08)'
```

### TableCell variant 스타일
```js
// head: theme.typography.fontWeightMedium=500, pxToRem(24)='1.5rem'
// footer: text.secondary=rgba(0,0,0,0.6), pxToRem(21)='1.3125rem', pxToRem(12)='0.75rem'
```
