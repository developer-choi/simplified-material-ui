# OutlinedInput 컴포넌트

> Material-UI의 OutlinedInput 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

OutlinedInput은 **InputBase에 전체 테두리(outline)와 라벨 notch 스타일을 추가한 Material Design Outlined 입력 필드** 컴포넌트입니다.

### 핵심 기능
1. **전체 테두리 스타일** - fieldset/legend 패턴으로 사방 테두리 렌더링
2. **라벨 Notch 애니메이션** - 포커스/입력 시 테두리에 라벨 공간 생성
3. **상태별 테두리 색상** - focus, error, disabled 상태에 따른 색상 변경
4. **FormControl 연동** - Context를 통한 상태 공유

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/OutlinedInput/OutlinedInput.js (463줄)
// + NotchedOutline.js (138줄) = 총 601줄

OutlinedInput (forwardRef)
  └─> InputBase
       ├─> OutlinedInputRoot (styled InputBaseRoot)
       │    └─> InputBase 내부 구조
       ├─> OutlinedInputInput (styled InputBaseInput)
       └─> renderSuffix → NotchedOutlineRoot (styled NotchedOutline)
                           └─> NotchedOutline
                                ├─> fieldset (NotchedOutlineRoot)
                                └─> legend (NotchedOutlineLegend)
                                     └─> span (라벨 텍스트)
```

### 2. Styled Components (3개)

**OutlinedInputRoot** - Root 컨테이너 스타일링
```javascript
const OutlinedInputRoot = styled(InputBaseRoot, {
  shouldForwardProp: (prop) => rootShouldForwardProp(prop) || prop === 'classes',
  name: 'MuiOutlinedInput',
  slot: 'Root',
  overridesResolver: inputBaseRootOverridesResolver,
})(
  memoTheme(({ theme }) => {
    const borderColor = theme.palette.mode === 'light'
      ? 'rgba(0, 0, 0, 0.23)'
      : 'rgba(255, 255, 255, 0.23)';
    return {
      position: 'relative',
      borderRadius: (theme.vars || theme).shape.borderRadius,
      // hover, focused, error, disabled 상태별 스타일
      // variants로 color, startAdornment, endAdornment, multiline, size 처리
    };
  }),
);
```

**NotchedOutlineRoot** - 테두리(fieldset) 스타일링
```javascript
const NotchedOutlineRoot = styled(NotchedOutline, {
  name: 'MuiOutlinedInput',
  slot: 'NotchedOutline',
})(
  memoTheme(({ theme }) => ({
    borderColor: theme.vars
      ? theme.alpha(theme.vars.palette.common.onBackground, 0.23)
      : borderColor,
  })),
);
```

**OutlinedInputInput** - input 요소 스타일링
```javascript
const OutlinedInputInput = styled(InputBaseInput, {
  name: 'MuiOutlinedInput',
  slot: 'Input',
  overridesResolver: inputBaseInputOverridesResolver,
})(
  memoTheme(({ theme }) => ({
    padding: '16.5px 14px',
    // autofill, size, multiline, adornment variants
  })),
);
```

### 3. NotchedOutline 서브 컴포넌트

```javascript
// NotchedOutline.js
const NotchedOutlineRoot = styled('fieldset')({
  textAlign: 'left',
  position: 'absolute',
  bottom: 0, right: 0, top: -5, left: 0,
  margin: 0,
  padding: '0 8px',
  pointerEvents: 'none',
  borderRadius: 'inherit',
  borderStyle: 'solid',
  borderWidth: 1,
  overflow: 'hidden',
  minWidth: '0%',
});

const NotchedOutlineLegend = styled('legend')(
  memoTheme(({ theme }) => ({
    // withLabel, notched 상태에 따른 variants
    // max-width 애니메이션으로 notch 효과 구현
  })),
);
```

### 4. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `label` | node | - | 테두리 notch를 위한 라벨 |
| `notched` | boolean | - | notch 상태 외부 제어 |
| `color` | string | 'primary' | 포커스 시 테두리 색상 |
| `disabled` | boolean | false | 비활성화 상태 |
| `error` | boolean | false | 에러 상태 |
| `fullWidth` | boolean | false | 전체 너비 |
| `multiline` | boolean | false | 멀티라인 입력 |
| `size` | 'small' \| 'medium' | 'medium' | 크기 |
| `slots` | object | {} | 슬롯 컴포넌트 커스터마이징 |
| `slotProps` | object | {} | 슬롯 props 커스터마이징 |
| `components` | object | {} | (deprecated) 슬롯 컴포넌트 |

### 5. useSlot을 통한 NotchedOutline 렌더링

```javascript
const [NotchedSlot, notchedProps] = useSlot('notchedOutline', {
  elementType: NotchedOutlineRoot,
  className: classes.notchedOutline,
  shouldForwardComponentProp: true,
  ownerState,
  externalForwardedProps: { slots, slotProps },
  additionalProps: {
    label: label != null && label !== '' && fcs.required ? (
      <React.Fragment>{label}&thinsp;{'*'}</React.Fragment>
    ) : label,
  },
});
```

### 6. formControlState를 통한 상태 병합

```javascript
const fcs = formControlState({
  props,
  muiFormControl,
  states: ['color', 'disabled', 'error', 'focused', 'hiddenLabel', 'size', 'required'],
});
```

---

## 설계 패턴

1. **Composition** - InputBase를 확장하여 Outlined 스타일 추가
2. **Slot Pattern** - slots/slotProps로 내부 컴포넌트 커스터마이징
3. **renderSuffix** - InputBase의 renderSuffix prop으로 NotchedOutline 주입
4. **CSS-in-JS with Variants** - styled()와 variants로 조건부 스타일링

---

## 복잡도의 이유

OutlinedInput은 **601줄** (OutlinedInput 463줄 + NotchedOutline 138줄)이며, 복잡한 이유는:

1. **Theme 시스템 통합** - memoTheme, theme.vars, CSS Variables 모드 지원
2. **동적 Color Variants** - palette 순회하여 런타임에 color variants 생성
3. **Slot 시스템** - useSlot을 통한 복잡한 props 병합 및 컴포넌트 교체
4. **Utility Classes** - composeClasses, getOutlinedInputUtilityClass로 동적 className 생성
5. **하위 호환성** - components prop (deprecated)과 slots prop 동시 지원
6. **PropTypes** - 약 180줄의 런타임 타입 검증

---

## 비교: OutlinedInput vs FilledInput vs Input

| 기능 | OutlinedInput | FilledInput | Input |
|------|---------------|-------------|-------|
| **테두리** | 전체 테두리 (fieldset) | 하단 underline | 하단 underline |
| **배경** | 없음 | 회색 배경 | 없음 |
| **라벨 notch** | 테두리에 공간 생성 | 없음 | 없음 |
| **Material Design** | Outlined variant | Filled variant | Standard variant |
