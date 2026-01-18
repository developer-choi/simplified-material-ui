# FilledInput 컴포넌트

> Material-UI의 FilledInput 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

FilledInput은 **InputBase를 확장하여 배경색과 밑줄 애니메이션을 추가한 Material Design Filled 스타일 입력 필드** 컴포넌트입니다.

### 핵심 기능
1. **배경색 스타일** - 회색 배경(rgba(0,0,0,0.06))과 상단 모서리 둥글림(4px)
2. **밑줄 애니메이션** - focus 시 scaleX(0→1) 애니메이션으로 밑줄 표시
3. **상태별 스타일** - disabled, error, focused 상태에 따른 시각적 피드백
4. **FormControl 통합** - Context를 통해 disabled, error 등 상태 상속

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/FilledInput/FilledInput.js (536줄)

<InputBase
  slots={{ root: FilledInputRoot, input: FilledInputInput }}
  slotProps={componentsProps}
  fullWidth={fullWidth}
  inputComponent={inputComponent}
  multiline={multiline}
  ref={ref}
  type={type}
  {...other}
  classes={classes}
/>
```

### 2. Styled Components (FilledInputRoot)

```javascript
// 라인 47-199
const FilledInputRoot = styled(InputBaseRoot, {
  shouldForwardProp: (prop) => rootShouldForwardProp(prop) || prop === 'classes',
  name: 'MuiFilledInput',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;
    return [
      ...inputBaseRootOverridesResolver(props, styles),
      !ownerState.disableUnderline && styles.underline,
    ];
  },
})(
  memoTheme(({ theme }) => {
    const light = theme.palette.mode === 'light';
    const bottomLineColor = light ? 'rgba(0, 0, 0, 0.42)' : 'rgba(255, 255, 255, 0.7)';
    const backgroundColor = light ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.09)';
    // ... 배경색, 테두리, 밑줄 스타일 정의
  })
);
```

**특징:**
- `::before` pseudo-element: 기본 밑줄 (1px solid)
- `::after` pseudo-element: focus 밑줄 (2px solid, scaleX 애니메이션)
- light/dark 모드 대응
- theme.vars (CSS Variables) 지원

### 3. Styled Components (FilledInputInput)

```javascript
// 라인 201-280
const FilledInputInput = styled(InputBaseInput, {
  name: 'MuiFilledInput',
  slot: 'Input',
  overridesResolver: inputBaseInputOverridesResolver,
})(
  memoTheme(({ theme }) => ({
    paddingTop: 25,
    paddingRight: 12,
    paddingBottom: 8,
    paddingLeft: 12,
    // ... autofill 스타일, variants
  }))
);
```

### 4. Color Variants 동적 생성

```javascript
// 라인 143-155
...Object.entries(theme.palette)
  .filter(createSimplePaletteValueFilter())
  .map(([color]) => ({
    props: { disableUnderline: false, color },
    style: {
      '&::after': {
        borderBottom: `2px solid ${(theme.vars || theme).palette[color]?.main}`,
      },
    },
  })),
```

**역할:**
- theme.palette의 모든 색상(primary, secondary, error 등)에 대해 자동으로 밑줄 색상 variant 생성
- createSimplePaletteValueFilter로 유효한 팔레트 색상만 필터링

### 5. Utility Classes 시스템

```javascript
// 라인 22-45
const useUtilityClasses = (ownerState) => {
  const { classes, disableUnderline, startAdornment, endAdornment, size, hiddenLabel, multiline } =
    ownerState;

  const slots = {
    root: [
      'root',
      !disableUnderline && 'underline',
      startAdornment && 'adornedStart',
      endAdornment && 'adornedEnd',
      size === 'small' && `size${capitalize(size)}`,
      hiddenLabel && 'hiddenLabel',
      multiline && 'multiline',
    ],
    input: ['input'],
  };

  return composeClasses(slots, getFilledInputUtilityClass, classes);
};
```

**생성되는 className:**
```
MuiFilledInput-root
MuiFilledInput-underline
MuiFilledInput-adornedStart
MuiFilledInput-adornedEnd
MuiFilledInput-sizeSmall
MuiFilledInput-hiddenLabel
MuiFilledInput-multiline
MuiFilledInput-input
```

### 6. Deprecated Props 지원

```javascript
// 라인 287-288, 311-318
const {
  components = {},
  componentsProps: componentsPropsProp,
  // ...
  slots = {},
} = props;

const componentsProps =
  (slotProps ?? componentsPropsProp)
    ? deepmerge(filledInputComponentsProps, slotProps ?? componentsPropsProp)
    : filledInputComponentsProps;

const RootSlot = slots.root ?? components.Root ?? FilledInputRoot;
const InputSlot = slots.input ?? components.Input ?? FilledInputInput;
```

**역할:**
- v4 → v5 마이그레이션을 위한 하위 호환성
- `components`/`componentsProps` (deprecated) → `slots`/`slotProps` (신규)
- deepmerge로 두 API 병합

### 7. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `disableUnderline` | boolean | false | 밑줄 제거 |
| `color` | string | 'primary' | 밑줄 색상 (primary, secondary, error 등) |
| `disabled` | boolean | false | 비활성화 상태 |
| `error` | boolean | false | 에러 상태 |
| `fullWidth` | boolean | false | 전체 너비 |
| `hiddenLabel` | boolean | false | 라벨 숨김 (패딩 조정) |
| `multiline` | boolean | false | 멀티라인 입력 |
| `size` | 'small' \| 'medium' | 'medium' | 크기 |
| `components` | object | {} | 슬롯 컴포넌트 (deprecated) |
| `componentsProps` | object | {} | 슬롯 props (deprecated) |
| `slots` | object | {} | 슬롯 컴포넌트 |
| `slotProps` | object | {} | 슬롯 props |

---

## 설계 패턴

### 1. Slot Pattern
```javascript
<InputBase
  slots={{ root: RootSlot, input: InputSlot }}
  slotProps={componentsProps}
/>
```
- InputBase를 기반으로 root/input 슬롯만 교체
- 스타일만 다른 여러 Input 변형 생성 가능

### 2. Pseudo-element Pattern
```javascript
'&::before': { borderBottom: '1px solid ...' },  // 기본 밑줄
'&::after': { borderBottom: '2px solid ...', transform: 'scaleX(0)' }  // focus 밑줄
```
- CSS pseudo-elements로 밑줄 구현
- 실제 DOM 요소 없이 애니메이션 가능

### 3. Variants Array Pattern
```javascript
variants: [
  { props: { disableUnderline: false }, style: { ... } },
  { props: ({ ownerState }) => ownerState.multiline, style: { ... } },
]
```
- 조건부 스타일을 배열로 선언적 정의
- props 함수로 복잡한 조건 처리

---

## 복잡도의 이유

FilledInput은 **536줄**이며, 복잡한 이유는:

### 1. Styled Components 시스템 (~230줄)
- FilledInputRoot: 152줄 (배경, 밑줄, 상태별 스타일, variants)
- FilledInputInput: 79줄 (패딩, autofill, variants)
- memoTheme 래퍼
- overridesResolver 함수

### 2. Theme 시스템 통합 (~50줄)
- light/dark 모드 색상 분기
- theme.vars (CSS Variables) 조건부 처리
- theme.transitions.create() 호출
- theme.shape.borderRadius 사용

### 3. Color Variants 동적 생성 (~15줄)
- Object.entries(theme.palette) 순회
- createSimplePaletteValueFilter 사용
- 8개 이상의 색상 variants 자동 생성

### 4. Utility Classes 시스템 (~25줄)
- useUtilityClasses 함수
- composeClasses, getFilledInputUtilityClass
- 7개 조건부 클래스명 생성

### 5. Deprecated Props 지원 (~20줄)
- components/componentsProps 처리
- deepmerge로 slotProps와 병합
- fallback 체인 (slots.root ?? components.Root ?? ...)

### 6. PropTypes 정의 (~198줄)
- 30개 이상의 props 타입 정의
- 복잡한 oneOfType, shape 타입
- JSDoc 주석

---

## 관련 파일

| 파일 | 역할 |
|------|------|
| `filledInputClasses.ts` | className 생성 유틸리티 |
| `InputBase/InputBase.js` | 기반 컴포넌트 |
| `Input/Input.js` | Standard 스타일 변형 |
| `OutlinedInput/OutlinedInput.js` | Outlined 스타일 변형 |

---

## Input vs FilledInput vs OutlinedInput

| 항목 | Input (Standard) | FilledInput | OutlinedInput |
|------|-----------------|-------------|---------------|
| **배경** | 없음 | 회색 배경 | 없음 |
| **테두리** | 하단 밑줄만 | 하단 밑줄 + 상단 둥근 모서리 | 전체 테두리 |
| **라벨 위치** | 밑줄 위에 떠있음 | 배경 안에 들어감 | 테두리 안에 들어감 |
| **Material Design** | v1 스타일 | v2 권장 스타일 | v2 권장 스타일 |
