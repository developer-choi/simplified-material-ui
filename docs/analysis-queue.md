# 분석 대상 목록

## 완료 ✅

- [x] Box
- [x] ButtonGroup
- [x] CircularProgress
- [x] Container
- [x] Fab
- [x] FormControlLabel

## 다음 분석 목록 📋

### Layout Components
- [ ] Grid
- [ ] GridLegacy (Grid 분석 후)

### Transitions
- [ ] Grow
- [ ] Slide

### Progress Indicators
- [ ] LinearProgress

### Navigation
- [ ] Link
- [ ] MobileStepper

### Inputs
- [ ] NativeSelect
- [ ] RadioGroup
- [ ] Rating
- [ ] Select
- [ ] Slider

### Feedback
- [ ] Snackbar
- [ ] SnackbarContent

### Utils
- [ ] NoSsr
- [ ] ScopedCssBaseline
- [ ] CssBaseline
- [ ] GlobalStyles

---

## 분석 우선순위

1. **현재 진행 중**: Grow (Transitions)
2. **다음**: LinearProgress (Progress Indicators)
3. **이후**: Link, Grid 등

---

## 제외 대상

다음 항목들은 컴포넌트가 아니므로 분석 대상에서 제외:
- className
- colors
- darkScrollbar
- DefaultPropsProvider
- generateUtilityClass
- generateUtilityClasses
- InitColorSchemeScript
- internal
- locale
- OverridableComponent
- PigmentContainer (Pigment CSS 전용)
- PigmentGrid (Pigment CSS 전용)
- PigmentStack (Pigment CSS 전용)
