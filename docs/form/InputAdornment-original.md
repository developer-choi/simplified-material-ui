# InputAdornment 컴포넌트

> Material-UI의 InputAdornment 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

InputAdornment는 **Input, TextField 등의 입력 필드 양 끝에 아이콘이나 텍스트를 배치하는 장식 컴포넌트**입니다.

### 핵심 기능
1. **위치 기반 렌더링** - position prop('start' 또는 'end')에 따라 입력 필드의 앞/뒤에 배치
2. **Typography 자동 래핑** - 문자열 children을 자동으로 Typography 컴포넌트로 감쌈
3. **FormControl 통합** - 부모 FormControl의 variant, size, hiddenLabel 상태를 자동으로 읽어 스타일 조정
4. **Vertical Alignment** - position='start'일 때 zero-width space를 삽입하여 baseline 정렬 보정
5. **포인터 이벤트 제어** - disablePointerEvents로 클릭 이벤트를 하위 input으로 전달

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/InputAdornment/InputAdornment.js (218줄)

<FormControlContext.Provider value={null}>
  <InputAdornmentRoot  // styled div
    as={component}
    ownerState={ownerState}
    className={clsx(classes.root, className)}
    ref={ref}
    {...other}
  >
    {typeof children === 'string' && !disableTypography ? (
      <Typography color="textSecondary">{children}</Typography>
    ) : (
      <React.Fragment>
        {position === 'start' ? (
          <span className="notranslate" aria-hidden>&#8203;</span>
        ) : null}
        {children}
      </React.Fragment>
    )}
  </InputAdornmentRoot>
</FormControlContext.Provider>
```

### 2. 하위 컴포넌트가 담당하는 기능

- **InputAdornmentRoot** - styled div로 구현된 컨테이너, Flexbox 레이아웃 및 variant/position 기반 스타일 제공
- **Typography** - 문자열 children을 래핑하여 텍스트 스타일링
- **Zero-width Space** - position='start'일 때 baseline 정렬을 위한 보이지 않는 문자

### 3. Theme 시스템 통합

DefaultPropsProvider를 통한 전역 기본값 주입:

```javascript
// 선 94
const props = useDefaultProps({ props: inProps, name: 'MuiInputAdornment' });
```

**역할:**
- theme.components.MuiInputAdornment.defaultProps에 정의된 값을 자동으로 병합
- 전역적으로 disablePointerEvents, variant 등의 기본값 설정 가능

### 4. FormControl 통합

FormControl 컨텍스트에서 variant, size, hiddenLabel 상태 읽기:

```javascript
// 선 106-132
const muiFormControl = useFormControl() || {};

let variant = variantProp;

// variant 충돌 검증 (개발 환경)
if (variantProp && muiFormControl.variant) {
  if (process.env.NODE_ENV !== 'production') {
    if (variantProp === muiFormControl.variant) {
      console.error(
        'MUI: The `InputAdornment` variant infers the variant prop ' +
          'you do not have to provide one.',
      );
    }
  }
}

// FormControl에서 variant 자동 추론
if (muiFormControl && !variant) {
  variant = muiFormControl.variant;
}

const ownerState = {
  ...props,
  hiddenLabel: muiFormControl.hiddenLabel,  // FormControl에서 가져옴
  size: muiFormControl.size,                // FormControl에서 가져옴
  disablePointerEvents,
  position,
  variant,
};
```

**FormControlContext.Provider value={null} 사용 이유:**
- InputAdornment 내부의 children이 FormControl 상태를 읽지 못하도록 격리
- 예: InputAdornment 내부의 Button이 FormControl의 variant를 상속받지 않도록

### 5. Styled Components 및 스타일링

InputAdornmentRoot는 styled() API로 생성되며, variants 배열로 조건부 스타일 정의:

```javascript
// 선 42-91
const InputAdornmentRoot = styled('div', {
  name: 'MuiInputAdornment',
  slot: 'Root',
  overridesResolver,
})(
  memoTheme(({ theme }) => ({
    display: 'flex',
    maxHeight: '2em',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    color: (theme.vars || theme).palette.action.active,
    variants: [
      {
        props: { variant: 'filled' },
        style: {
          [`&.${inputAdornmentClasses.positionStart}&:not(.${inputAdornmentClasses.hiddenLabel})`]: {
            marginTop: 16,
          },
        },
      },
      {
        props: { position: 'start' },
        style: { marginRight: 8 },
      },
      {
        props: { position: 'end' },
        style: { marginLeft: 8 },
      },
      {
        props: { disablePointerEvents: true },
        style: { pointerEvents: 'none' },
      },
    ],
  })),
);
```

**주요 스타일:**
- `display: flex` - Flexbox로 children 배치
- `maxHeight: '2em'` - 높이 제한
- `color: theme.palette.action.active` - 아이콘 색상 (#757575)
- variant='filled' + position='start' + hiddenLabel 아님 → marginTop: 16
- position='start' → marginRight: 8
- position='end' → marginLeft: 8
- disablePointerEvents → pointerEvents: 'none'

### 6. Utility Classes 시스템

동적 className 생성:

```javascript
// 선 26-40
const useUtilityClasses = (ownerState) => {
  const { classes, disablePointerEvents, hiddenLabel, position, size, variant } = ownerState;
  const slots = {
    root: [
      'root',
      disablePointerEvents && 'disablePointerEvents',
      position && `position${capitalize(position)}`,
      variant,
      hiddenLabel && 'hiddenLabel',
      size && `size${capitalize(size)}`,
    ],
  };

  return composeClasses(slots, getInputAdornmentUtilityClass, classes);
};
```

**생성되는 className 예시:**
```
MuiInputAdornment-root
MuiInputAdornment-positionStart
MuiInputAdornment-filled
MuiInputAdornment-sizeSmall
```

### 7. Typography 자동 래핑 로직

```javascript
// 선 145-158
{typeof children === 'string' && !disableTypography ? (
  <Typography color="textSecondary">{children}</Typography>
) : (
  <React.Fragment>
    {/* To have the correct vertical alignment baseline */}
    {position === 'start' ? (
      /* notranslate needed while Google Translate will not fix zero-width space issue */
      <span className="notranslate" aria-hidden>
        &#8203;
      </span>
    ) : null}
    {children}
  </React.Fragment>
)}
```

**동작:**
1. children이 문자열이고 disableTypography가 false → Typography로 자동 래핑
2. 그 외 경우 → children 그대로 렌더링
3. position='start'일 때 zero-width space(`&#8203;`) 삽입

**Zero-width space 이유:**
- Flexbox에서 baseline 정렬을 할 때 참조점이 필요
- position='start'인 경우에만 삽입하여 Input의 텍스트와 아이콘의 baseline을 맞춤

### 8. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | node | - | 렌더링할 콘텐츠 (주로 Icon 또는 텍스트) |
| `position` | 'start' \| 'end' | - | **(필수)** Input의 시작/끝 위치 |
| `variant` | 'filled' \| 'outlined' \| 'standard' | - | Input variant (FormControl에서 자동 추론 가능) |
| `disablePointerEvents` | boolean | false | true일 때 클릭 이벤트가 Input으로 전달됨 |
| `disableTypography` | boolean | false | 문자열 children의 Typography 래핑 비활성화 |
| `component` | elementType | 'div' | 루트 엘리먼트 타입 (다형성) |
| `className` | string | - | 추가 CSS 클래스 |
| `classes` | object | - | Utility classes 커스터마이징 |
| `sx` | SxProps | - | 인라인 스타일 오버라이드 |

### 9. overridesResolver 패턴

```javascript
// 선 15-24
const overridesResolver = (props, styles) => {
  const { ownerState } = props;

  return [
    styles.root,
    styles[`position${capitalize(ownerState.position)}`],
    ownerState.disablePointerEvents === true && styles.disablePointerEvents,
    styles[ownerState.variant],
  ];
};
```

**역할:**
- theme.components.MuiInputAdornment.styleOverrides에서 어떤 스타일을 적용할지 결정
- 각 상태(position, variant, disablePointerEvents)에 따른 스타일 커스터마이징 가능

---

## 설계 패턴

### 1. Composition Pattern
- children을 받아서 래핑하는 구조
- Typography, zero-width space 등 추가 요소를 조합

### 2. Context Isolation Pattern
```javascript
<FormControlContext.Provider value={null}>
```
- 부모 FormControl의 상태는 읽지만, children에게는 전파하지 않음
- InputAdornment 내부의 컴포넌트가 FormControl 상태를 오염시키지 않도록

### 3. Conditional Rendering Pattern
- typeof children === 'string' 체크로 Typography 자동 래핑
- position === 'start' 체크로 zero-width space 조건부 삽입

### 4. Theme Integration Pattern
- useDefaultProps로 전역 기본값
- styled() + memoTheme로 테마 기반 스타일링
- useUtilityClasses로 동적 className 생성

### 5. Polymorphic Component Pattern
- component prop으로 루트 엘리먼트 타입 변경 가능 (as={component})

---

## 복잡도의 이유

InputAdornment는 **218줄**이며, 복잡한 이유는:

### 1. Theme 시스템 통합 (~60줄)
- `useDefaultProps` - 전역 기본값 주입 (10줄)
- `useUtilityClasses` - 동적 className 생성 (14줄)
- `composeClasses` - className 병합 로직
- `memoTheme` - 테마 메모이제이션
- `overridesResolver` - 스타일 오버라이드 해결 (9줄)

### 2. Styled Components 시스템 (~50줄)
- `InputAdornmentRoot` 정의 (46줄)
- variants 배열로 조건부 스타일 (4개 variant)
- theme.vars 처리 (CSS 변수 지원)

### 3. FormControl 통합 (~30줄)
- `useFormControl` hook
- variant 자동 추론 로직
- variant 충돌 검증 (개발 환경 전용)
- hiddenLabel, size 상태 상속
- FormControlContext.Provider 래퍼

### 4. Typography 자동 래핑 (~15줄)
- typeof children === 'string' 조건 분기
- disableTypography prop 처리
- Typography import 및 사용

### 5. Vertical Alignment 처리 (~10줄)
- Zero-width space 삽입 로직
- position='start' 조건 체크
- notranslate 속성 (Google Translate 호환성)

### 6. PropTypes 정의 (~53줄)
- 9개 props의 상세한 타입 정의
- JSDoc 주석
- oneOf, oneOfType 등 복잡한 타입 검증

### 7. 다형성 및 유틸리티 (~15줄)
- component prop 처리 (as={component})
- ownerState 객체 생성 및 전파
- capitalize 유틸리티 사용

---

## 비교: InputAdornment vs 일반 div

| 기능 | 일반 div | InputAdornment |
|------|---------|----------------|
| **위치 제어** | 수동 CSS | position prop으로 자동 margin 적용 |
| **Typography 래핑** | 수동 | 문자열 자동 래핑 |
| **FormControl 연동** | 없음 | variant, size, hiddenLabel 자동 상속 |
| **Vertical Alignment** | 수동 조정 필요 | Zero-width space 자동 삽입 |
| **Theme 통합** | 없음 | Theme color 자동 적용 |
| **포인터 이벤트 제어** | 수동 CSS | disablePointerEvents prop |
| **스타일 커스터마이징** | 직접 CSS | theme.components.MuiInputAdornment.styleOverrides |

---

## 학습 포인트

### 1. Zero-width Space의 실전 활용
- CSS Flexbox의 baseline 정렬 문제를 해결하는 실용적 기법
- `&#8203;` (U+200B) 문자로 보이지 않는 정렬 기준점 생성

### 2. Context Isolation 패턴
- `FormControlContext.Provider value={null}`로 부모 Context 차단
- children이 부모 상태를 오염시키지 않도록 격리

### 3. Conditional Typography Wrapping
- 개발자 경험(DX) 향상: 간단한 텍스트는 자동으로 스타일링
- disableTypography로 제어 가능성 유지

### 4. Theme Variants 시스템
- variants 배열로 조건부 스타일을 선언적으로 정의
- props 조합에 따른 스타일 자동 적용
