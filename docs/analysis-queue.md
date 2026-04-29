# 분석 대상 목록

## 완료 ✅

### 초기 (대규모 단순화)
- [x] AppBar
- [x] Avatar
- [x] Dialog (+ DialogTitle, DialogContent, DialogActions, DialogContentText)
- [x] Drawer
- [x] FocusTrap
- [x] Modal
- [x] Portal

### 개별 단순화
- [x] Box
- [x] ButtonGroup
- [x] CircularProgress
- [x] Container
- [x] Fab
- [x] FormControlLabel
- [x] Grid
- [x] Grow
- [x] LinearProgress
- [x] Link
- [x] MobileStepper
- [x] RadioGroup
- [x] Slide
- [x] Snackbar
- [x] SnackbarContent
- [x] SpeedDial
- [x] SpeedDialAction
- [x] SpeedDialIcon
- [x] Stack
- [x] StepIcon
- [x] SvgIcon
- [x] SwipeableDrawer
- [x] Switch
- [x] Tab
- [x] Tabs
- [x] Table 가족 (TableContainer, Table, TableBody, TableHead, TableFooter, TableRow, TableCell)
- [x] TablePagination
- [x] TablePaginationActions
- [x] TableSortLabel
- [x] TabScrollButton
- [x] TextareaAutosize
- [x] TextField
- [x] ToggleButton
- [x] ToggleButtonGroup
- [x] Toolbar
- [x] Typography
- [x] Zoom

---

## 남은 분석 목록 📋

(없음)

---

## 간소화 안함 ❌

| 항목 | 이유 |
|------|------|
| NoSsr | 서버사이드 렌더링 제어 목적, 핵심 로직 자체가 단순 |
| CssBaseline | 글로벌 CSS 리셋, 간소화 불가 |
| ScopedCssBaseline | CssBaseline의 scoped 버전 |
| GlobalStyles | 글로벌 스타일 주입 유틸 |

---

## 제외 대상

컴포넌트가 아니므로 분석 대상에서 제외:
- className, colors, darkScrollbar
- DefaultPropsProvider, generateUtilityClass, generateUtilityClasses
- GridLegacy (deprecated), InitColorSchemeScript, internal, locale
- OverridableComponent
- PigmentContainer, PigmentGrid, PigmentStack (Pigment CSS 전용)
