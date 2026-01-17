# Input 컴포넌트

> Material-UI의 Input 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

Input은 **InputBase에 Underline 스타일을 추가한 Material Design의 표준 입력 필드 컴포넌트**입니다.

### 핵심 기능
1. **Underline 스타일** - ::before, ::after pseudo-elements를 사용한 하단 밑줄
2. **Focus 애니메이션** - Focus 시 underline이 중앙에서 양쪽으로 확장되는 scaleX 애니메이션
3. **Color Variants** - 팔레트의 모든 색상에 대한 동적 underline 색상 생성
4. **Hover 효과** - Hover 시 underline 두께 증가 (1px → 2px)
5. **Disabled 스타일** - Disabled 시 점선 underline
6. **Error 스타일** - Error 시 빨간색 underline
7. **InputBase 확장** - slots 주입으로 InputBaseRoot, InputBaseInput을 커스터마이징

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/Input/Input.js (380줄)

<InputBase
  slots={{ root: RootSlot, input: InputSlot }}
  slotProps={componentsProps}
  fullWidth={fullWidth}
  inputComponent={inputComponent}
  multiline={multiline}
  ref={ref}
  type={type}
  {...other}
  classes={classes}
/>

// RootSlot = InputRoot (styled InputBaseRoot)
// InputSlot = InputInput (styled InputBaseInput)
```

### 2. 하위 컴포넌트가 담당하는 기능

- **InputRoot** - styled(InputBaseRoot)로 구현된 컨테이너, underline 스타일 제공 (93줄)
- **InputInput** - styled(InputBaseInput)로 구현된 input 요소, 빈 객체 (5줄)
- **InputBase** - 실제 입력 필드 로직, FormControl 통합, Adornments 처리

### 3. Theme 시스템 통합

DefaultPropsProvider를 통한 전역 기본값 주입:

```javascript
// 라인 142
const props = useDefaultProps({ props: inProps, name: 'MuiInput' });
```

**역할:**
- theme.components.MuiInput.defaultProps에 정의된 값을 자동으로 병합
- 전역적으로 disableUnderline, color 등의 기본값 설정 가능

### 4. Styled Components 및 스타일링

InputRoot는 styled() API로 생성되며, InputBaseRoot를 확장:

```javascript
// 라인 37-133
const InputRoot = styled(InputBaseRoot, {
  shouldForwardProp: (prop) => rootShouldForwardProp(prop) || prop === 'classes',
  name: 'MuiInput',
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
    let bottomLineColor = light ? 'rgba(0, 0, 0, 0.42)' : 'rgba(255, 255, 255, 0.7)';
    if (theme.vars) {
      bottomLineColor = theme.alpha(
        theme.vars.palette.common.onBackground,
        theme.vars.opacity.inputUnderline,
      );
    }
    return {
      position: 'relative',
      variants: [
        // ... variant 배열
      ],
    };
  }),
);
```

**주요 스타일:**
- `position: 'relative'` - ::before, ::after를 위한 위치 기준
- formControl 내부일 때 `label + &: { marginTop: 16 }` - 라벨 아래 간격
- disableUnderline이 false일 때 underline 스타일 적용

### 5. Underline 스타일 상세

#### 5.1. ::before (기본 Underline)

```javascript
// 라인 96-107
'&::before': {
  borderBottom: `1px solid ${bottomLineColor}`,
  left: 0,
  bottom: 0,
  content: '"\\00a0"',  // Non-breaking space
  position: 'absolute',
  right: 0,
  transition: theme.transitions.create('border-bottom-color', {
    duration: theme.transitions.duration.shorter,
  }),
  pointerEvents: 'none',
}
```

**역할:**
- 기본 상태의 1px 하단 밑줄
- bottomLineColor: light 모드 `rgba(0, 0, 0, 0.42)`, dark 모드 `rgba(255, 255, 255, 0.7)`
- content: non-breaking space로 요소 생성 보장

#### 5.2. ::after (Focus Underline)

```javascript
// 라인 73-85
'&::after': {
  left: 0,
  bottom: 0,
  content: '""',
  position: 'absolute',
  right: 0,
  transform: 'scaleX(0)',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shorter,
    easing: theme.transitions.easing.easeOut,
  }),
  pointerEvents: 'none',
}
```

**역할:**
- Focus 시 나타나는 2px 강조 밑줄
- 초기 상태: `transform: 'scaleX(0)'` (보이지 않음)
- Focus 시: `transform: 'scaleX(1) translateX(0)'` (중앙에서 양쪽으로 확장)
- translateX(0)은 Safari transform scale 버그 우회용

#### 5.3. Focus 상태

```javascript
// 라인 86-90
[`&.${inputClasses.focused}:after`]: {
  // translateX(0) is a workaround for Safari transform scale bug
  // See https://github.com/mui/material-ui/issues/31766
  transform: 'scaleX(1) translateX(0)',
}
```

**동작:**
- InputBase가 focused 클래스를 추가하면 ::after가 scaleX(1)로 확장
- 시각적 효과: 중앙에서 양쪽으로 퍼지는 애니메이션

#### 5.4. Hover 상태

```javascript
// 라인 108-114
[`&:hover:not(.${inputClasses.disabled}, .${inputClasses.error}):before`]: {
  borderBottom: `2px solid ${(theme.vars || theme).palette.text.primary}`,
  // Reset on touch devices, it doesn't add specificity
  '@media (hover: none)': {
    borderBottom: `1px solid ${bottomLineColor}`,
  },
}
```

**동작:**
- Disabled, Error가 아닐 때 Hover 시 ::before의 두께가 1px → 2px
- 색상: text.primary (검은색)
- 터치 디바이스에서는 적용 안됨 (hover: none 미디어 쿼리)

#### 5.5. Error 상태

```javascript
// 라인 91-95
[`&.${inputClasses.error}`]: {
  '&::before, &::after': {
    borderBottomColor: (theme.vars || theme).palette.error.main,
  },
}
```

**동작:**
- ::before, ::after 모두 error.main 색상 (#d32f2f)으로 변경

#### 5.6. Disabled 상태

```javascript
// 라인 115-117
[`&.${inputClasses.disabled}:before`]: {
  borderBottomStyle: 'dotted',
}
```

**동작:**
- ::before의 borderBottomStyle이 solid → dotted (점선)

### 6. Color Variants 동적 생성

```javascript
// 라인 120-129
...Object.entries(theme.palette)
  .filter(createSimplePaletteValueFilter())
  .map(([color]) => ({
    props: { color, disableUnderline: false },
    style: {
      '&::after': {
        borderBottom: `2px solid ${(theme.vars || theme).palette[color].main}`,
      },
    },
  }))
```

**동작:**
1. `theme.palette`의 모든 엔트리 순회
2. `createSimplePaletteValueFilter()`로 유효한 색상 필터링 (primary, secondary, error, warning, info, success 등)
3. 각 색상마다 variant 객체 생성
4. color prop과 일치하고 disableUnderline이 false일 때 ::after의 색상 설정

**생성되는 variants 예시:**
```javascript
{
  props: { color: 'primary', disableUnderline: false },
  style: {
    '&::after': {
      borderBottom: `2px solid ${theme.palette.primary.main}`,  // #1976d2
    },
  },
}
{
  props: { color: 'secondary', disableUnderline: false },
  style: {
    '&::after': {
      borderBottom: `2px solid ${theme.palette.secondary.main}`,  // #9c27b0
    },
  },
}
// ... 팔레트의 모든 색상
```

### 7. Utility Classes 시스템

동적 className 생성:

```javascript
// 라인 21-35
const useUtilityClasses = (ownerState) => {
  const { classes, disableUnderline } = ownerState;

  const slots = {
    root: ['root', !disableUnderline && 'underline'],
    input: ['input'],
  };

  const composedClasses = composeClasses(slots, getInputUtilityClass, classes);

  return {
    ...classes, // forward classes to the InputBase
    ...composedClasses,
  };
};
```

**생성되는 className 예시:**
```
MuiInput-root
MuiInput-underline (disableUnderline이 false일 때)
MuiInput-input
```

### 8. Deprecated Props 하위 호환성

v4에서 v5로 마이그레이션하기 위한 하위 호환성:

```javascript
// 라인 145-146
components = {},
componentsProps: componentsPropsProp,

// 라인 161-164
const componentsProps =
  (slotProps ?? componentsPropsProp)
    ? deepmerge(slotProps ?? componentsPropsProp, inputComponentsProps)
    : inputComponentsProps;

// 라인 166-167
const RootSlot = slots.root ?? components.Root ?? InputRoot;
const InputSlot = slots.input ?? components.Input ?? InputInput;
```

**동작:**
1. `components` prop (v4) → `slots` prop (v5)
2. `componentsProps` prop (v4) → `slotProps` prop (v5)
3. Fallback 체인: slots → components → 기본값
4. deepmerge로 slotProps와 componentsProps 병합

### 9. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `disableUnderline` | boolean | false | true일 때 underline 제거 |
| `color` | 'primary' \| 'secondary' \| string | 'primary' | Focus 시 underline 색상 |
| `fullWidth` | boolean | false | 전체 너비 사용 |
| `multiline` | boolean | false | 여러 줄 입력 허용 |
| `type` | string | 'text' | input type |
| `inputComponent` | elementType | 'input' | input 요소 타입 |
| `components` | object | {} | **(Deprecated)** v4 slots |
| `componentsProps` | object | - | **(Deprecated)** v4 slotProps |
| `slots` | object | {} | 슬롯 컴포넌트 (root, input) |
| `slotProps` | object | - | 슬롯 props (root, input) |
| `startAdornment` | node | - | 시작 위치 adornment |
| `endAdornment` | node | - | 끝 위치 adornment |
| `inputProps` | object | - | input 요소에 전달할 props |
| `inputRef` | ref | - | input 요소 ref |

### 10. InputInput - 빈 Styled Component

```javascript
// 라인 135-139
const InputInput = styled(InputBaseInput, {
  name: 'MuiInput',
  slot: 'Input',
  overridesResolver: inputBaseInputOverridesResolver,
})({});
```

**왜 빈 객체인가?**
- InputBase의 InputBaseInput을 그대로 사용
- Input 컴포넌트는 underline 스타일만 추가하므로 input 요소 자체는 변경 없음
- overridesResolver만 제공하여 theme.components.MuiInput.styleOverrides.input 커스터마이징 가능

---

## 설계 패턴

### 1. Styled Component Extension Pattern
```javascript
const InputRoot = styled(InputBaseRoot, { ... })({ ... });
const InputInput = styled(InputBaseInput, { ... })({});
```
- InputBase의 styled components를 확장하여 재사용
- overridesResolver 체인으로 스타일 오버라이드 병합

### 2. Pseudo-elements Pattern
```javascript
'&::before': { ... },  // 기본 underline
'&::after': { ... },   // focus underline
```
- CSS pseudo-elements로 추가 DOM 없이 underline 구현
- transform 애니메이션으로 부드러운 focus 효과

### 3. Dynamic Variants Generation Pattern
```javascript
...Object.entries(theme.palette)
  .filter(createSimplePaletteValueFilter())
  .map(([color]) => ({ ... }))
```
- 런타임에 theme.palette를 순회하여 variants 동적 생성
- 확장 가능한 색상 시스템

### 4. Fallback Chain Pattern
```javascript
const RootSlot = slots.root ?? components.Root ?? InputRoot;
```
- v5 (slots) → v4 (components) → 기본값 순으로 fallback
- 하위 호환성 보장

### 5. Props Spreading Pattern
```javascript
const { disableUnderline, components, componentsProps, ...other } = props;
return <InputBase {...other} />;
```
- Input 고유 props 추출, 나머지는 InputBase로 전달
- Delegation 패턴

---

## 복잡도의 이유

Input은 **380줄**이며, 복잡한 이유는:

### 1. Styled Components 시스템 (~100줄)
- `InputRoot` 정의 (93줄)
- memoTheme 래퍼
- variants 배열로 조건부 스타일
- theme.vars 처리 (CSS 변수 지원)
- overridesResolver 체인

### 2. Underline 스타일 (~60줄)
- ::before 스타일 (12줄)
- ::after 스타일 (13줄)
- Focus 상태 (5줄)
- Hover 상태 (7줄)
- Error 상태 (5줄)
- Disabled 상태 (3줄)
- FormControl 연동 (8줄)

### 3. Color Variants 동적 생성 (~10줄)
- theme.palette 순회
- createSimplePaletteValueFilter import 및 사용
- map으로 각 색상마다 variant 생성

### 4. Deprecated Props 하위 호환성 (~20줄)
- components, componentsProps prop (v4)
- slots, slotProps prop (v5)
- deepmerge로 병합 로직
- Fallback 체인

### 5. Theme 시스템 통합 (~15줄)
- useDefaultProps - 전역 기본값 주입
- memoTheme - 테마 메모이제이션
- theme.vars 조건부 처리

### 6. Utility Classes 시스템 (~15줄)
- useUtilityClasses 함수
- composeClasses - 클래스 병합
- getInputUtilityClass - 클래스 이름 생성

### 7. PropTypes 정의 (~192줄, 51%)
- 22개 props의 상세한 타입 정의
- JSDoc 주석
- oneOf, oneOfType, shape 등 복잡한 타입 검증

### 8. InputBase 의존성 (~10줄)
- InputBaseRoot, InputBaseInput import
- inputBaseRootOverridesResolver, inputBaseInputOverridesResolver import
- slots 주입 로직

---

## 비교: Input vs InputBase

| 기능 | InputBase | Input |
|------|-----------|-------|
| **Underline** | 없음 | ✅ ::before, ::after pseudo-elements |
| **Focus 애니메이션** | 없음 | ✅ scaleX transform |
| **Hover 효과** | 없음 | ✅ borderBottom 두께 증가 |
| **Color Variants** | 없음 | ✅ 팔레트 동적 생성 |
| **Disabled 스타일** | 기본 | ✅ 점선 underline |
| **Error 스타일** | 기본 | ✅ 빨간색 underline |
| **Theme 통합** | ✅ | ✅ |
| **FormControl 통합** | ✅ | ✅ (상속) |
| **Adornments** | ✅ | ✅ (상속) |
| **Multiline** | ✅ | ✅ (상속) |
| **코드 라인** | 296줄 (간소화 후) | 380줄 |

**Input = InputBase + Underline 스타일**

---

## 학습 포인트

### 1. Pseudo-elements로 장식 요소 구현
- ::before, ::after로 추가 DOM 없이 underline 구현
- position: absolute로 부모 요소 기준 배치
- content: '""' 또는 '"\00a0"'로 요소 생성 보장

### 2. Transform 애니메이션의 실전 활용
- scaleX(0) → scaleX(1)로 중앙에서 양쪽으로 확장
- translateX(0)은 Safari 버그 우회용 (실무 팁)
- transition의 duration, easing 설정

### 3. Variants 배열로 조건부 스타일 관리
- props 조합에 따른 스타일 자동 적용
- theme.palette 동적 순회로 확장 가능한 색상 시스템
- 선언적 스타일 정의

### 4. 하위 호환성 Fallback 체인
- slots ?? components ?? 기본값 패턴
- deepmerge로 props 병합
- v4 → v5 마이그레이션 지원

### 5. Styled Component Extension
- styled(BaseComponent)로 기존 컴포넌트 확장
- overridesResolver 체인으로 부모 스타일 상속
- shouldForwardProp으로 prop 전달 제어

### 6. Theme.vars와 일반 Theme 호환
- `(theme.vars || theme).palette.color.main` 패턴
- CSS 변수 지원과 일반 값 폴백
- theme.alpha, theme.transitions 같은 유틸리티 사용

### 7. Media Query로 터치 디바이스 대응
- `@media (hover: none)` - 터치 디바이스 감지
- hover 효과를 터치 디바이스에서 제외하여 UX 개선
