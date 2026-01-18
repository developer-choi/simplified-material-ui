# FormControl 컴포넌트

> Material-UI의 FormControl 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

FormControl은 **폼 입력 요소들(Input, InputLabel, FormHelperText)에 Context로 상태를 공유하는 컨테이너 컴포넌트**입니다.

### 핵심 기능
1. **Context로 상태 공유** - disabled, error, focused, filled 등을 자식에게 전파
2. **상태 관리** - focused, filled, adornedStart 상태를 추적
3. **레이아웃** - flexbox column으로 자식 배치, margin/fullWidth 지원
4. **개발 모드 경고** - 여러 InputBase 사용 시 경고
5. **SSR 지원** - children 순회하여 초기 상태 계산

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/FormControl/FormControl.js (352줄)

<FormControlContext.Provider value={childContext}>
  <FormControlRoot
    as={component}
    ownerState={ownerState}
    className={clsx(classes.root, className)}
    ref={ref}
    {...other}
  >
    {children}
  </FormControlRoot>
</FormControlContext.Provider>
```

### 2. Context에서 공유하는 상태

```javascript
// 라인 204-227
const childContext = React.useMemo(() => {
  return {
    // Props에서 전달
    adornedStart,
    setAdornedStart,
    color,
    disabled,
    error,
    filled,
    focused,
    fullWidth,
    hiddenLabel,
    size,
    required,
    variant,

    // 상태 변경 콜백
    onBlur: () => setFocused(false),
    onFocus: () => setFocused(true),
    onEmpty,
    onFilled,
    registerEffect,
  };
}, [...]);
```

### 3. Theme 시스템 통합

```javascript
// 라인 94
const props = useDefaultProps({ props: inProps, name: 'MuiFormControl' });
```

**역할:**
- theme.components.MuiFormControl.defaultProps에 정의된 값을 자동으로 병합
- 전역적으로 variant, margin 등의 기본값 설정 가능

### 4. Styled Components 및 스타일링

```javascript
// 라인 23-67
const FormControlRoot = styled('div', {
  name: 'MuiFormControl',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;
    return [
      styles.root,
      styles[`margin${capitalize(ownerState.margin)}`],
      ownerState.fullWidth && styles.fullWidth,
    ];
  },
})({
  display: 'inline-flex',
  flexDirection: 'column',
  position: 'relative',
  minWidth: 0,
  padding: 0,
  margin: 0,
  border: 0,
  verticalAlign: 'top',
  variants: [
    { props: { margin: 'normal' }, style: { marginTop: 16, marginBottom: 8 } },
    { props: { margin: 'dense' }, style: { marginTop: 8, marginBottom: 4 } },
    { props: { fullWidth: true }, style: { width: '100%' } },
  ],
});
```

### 5. Utility Classes 시스템

```javascript
// 라인 14-21
const useUtilityClasses = (ownerState) => {
  const { classes, margin, fullWidth } = ownerState;
  const slots = {
    root: ['root', margin !== 'none' && `margin${capitalize(margin)}`, fullWidth && 'fullWidth'],
  };
  return composeClasses(slots, getFormControlUtilityClasses, classes);
};
```

**생성되는 className:**
```
MuiFormControl-root
MuiFormControl-marginNormal (margin='normal'일 때)
MuiFormControl-marginDense (margin='dense'일 때)
MuiFormControl-fullWidth (fullWidth=true일 때)
```

### 6. SSR 지원을 위한 Children 순회

#### 6.1. adornedStart 초기값 계산

```javascript
// 라인 128-147
const [adornedStart, setAdornedStart] = React.useState(() => {
  let initialAdornedStart = false;
  if (children) {
    React.Children.forEach(children, (child) => {
      if (!isMuiElement(child, ['Input', 'Select'])) {
        return;
      }
      const input = isMuiElement(child, ['Select']) ? child.props.input : child;
      if (input && isAdornedStart(input.props)) {
        initialAdornedStart = true;
      }
    });
  }
  return initialAdornedStart;
});
```

**역할:**
- SSR에서 hydration mismatch 방지
- 초기 렌더링 시 startAdornment가 있는지 확인

#### 6.2. filled 초기값 계산

```javascript
// 라인 149-167
const [filled, setFilled] = React.useState(() => {
  let initialFilled = false;
  if (children) {
    React.Children.forEach(children, (child) => {
      if (!isMuiElement(child, ['Input', 'Select'])) {
        return;
      }
      if (isFilled(child.props, true) || isFilled(child.props.inputProps, true)) {
        initialFilled = true;
      }
    });
  }
  return initialFilled;
});
```

**역할:**
- 초기 렌더링 시 Input에 value/defaultValue가 있는지 확인
- InputLabel의 shrink 상태에 영향

### 7. 개발 모드 경고

```javascript
// 라인 176-194
let registerEffect;
const registeredInput = React.useRef(false);
if (process.env.NODE_ENV !== 'production') {
  registerEffect = () => {
    if (registeredInput.current) {
      console.error(
        'MUI: There are multiple `InputBase` components inside a FormControl.',
        'This creates visual inconsistencies, only use one `InputBase`.',
      );
    }
    registeredInput.current = true;
    return () => {
      registeredInput.current = false;
    };
  };
}
```

**역할:**
- FormControl 안에 여러 InputBase가 있으면 경고
- InputBase가 마운트될 때 registerEffect() 호출

### 8. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | node | - | 자식 컴포넌트 (Input, InputLabel 등) |
| `disabled` | boolean | false | 비활성화 상태 (자식에게 전파) |
| `error` | boolean | false | 에러 상태 (자식에게 전파) |
| `required` | boolean | false | 필수 여부 (자식에게 전파) |
| `focused` | boolean | - | 외부에서 포커스 상태 제어 |
| `fullWidth` | boolean | false | 전체 너비 사용 |
| `margin` | 'none' \| 'dense' \| 'normal' | 'none' | 상하 여백 |
| `variant` | 'filled' \| 'outlined' \| 'standard' | 'outlined' | Input 스타일 변형 |
| `color` | string | 'primary' | 색상 (자식에게 전파) |
| `size` | 'small' \| 'medium' | 'medium' | 크기 (자식에게 전파) |
| `hiddenLabel` | boolean | false | 라벨 숨김 (FilledInput용) |
| `component` | elementType | 'div' | 루트 요소 타입 |

### 9. 자식 컴포넌트가 Context를 사용하는 방식

```javascript
// Input, InputLabel 등에서
import useFormControl from '../FormControl/useFormControl';

const muiFormControl = useFormControl();

// 우선순위: props > context > 기본값
const disabled = muiFormControl?.disabled ?? props.disabled ?? false;
const error = muiFormControl?.error ?? props.error ?? false;
```

---

## 설계 패턴

### 1. Context Provider Pattern
```javascript
<FormControlContext.Provider value={childContext}>
  {children}
</FormControlContext.Provider>
```
- React Context로 깊은 자식에게 상태 전달
- prop drilling 방지

### 2. Controlled State Pattern
```javascript
const focused = visuallyFocused !== undefined && !disabled ? visuallyFocused : focusedState;
```
- 외부에서 제어 가능 (visuallyFocused)
- 내부 상태도 관리 (focusedState)

### 3. Lazy Initial State Pattern
```javascript
const [filled, setFilled] = React.useState(() => {
  // 초기값 계산 로직
});
```
- 비용이 큰 초기값 계산을 렌더링 시점에 한 번만 실행

### 4. Callback Memoization Pattern
```javascript
const onFilled = React.useCallback(() => {
  setFilled(true);
}, []);
```
- 자식에게 전달하는 콜백 메모이제이션
- 불필요한 리렌더링 방지

---

## 복잡도의 이유

FormControl은 **352줄**이며, 복잡한 이유는:

### 1. Styled Components 시스템 (~45줄)
- FormControlRoot 정의
- overridesResolver 함수
- variants 배열로 조건부 스타일

### 2. Utility Classes 시스템 (~10줄)
- useUtilityClasses 함수
- composeClasses 사용
- capitalize 유틸리티

### 3. Theme 시스템 통합 (~5줄)
- useDefaultProps 호출

### 4. SSR 지원 children 순회 (~40줄)
- adornedStart 초기값 계산 (20줄)
- filled 초기값 계산 (20줄)
- isMuiElement, isFilled, isAdornedStart 사용

### 5. 개발 모드 경고 (~20줄)
- registerEffect 함수
- registeredInput ref
- process.env.NODE_ENV 조건

### 6. Context 생성 (~40줄)
- childContext useMemo
- 의존성 배열 관리

### 7. PropTypes 정의 (~85줄)
- 14개 props의 상세한 타입 정의
- JSDoc 주석

---

## 관련 파일

| 파일 | 역할 |
|------|------|
| `FormControlContext.ts` | Context 객체 정의 |
| `useFormControl.ts` | Context 소비 훅 |
| `formControlState.js` | props와 context 상태 병합 유틸리티 |
| `formControlClasses.ts` | className 생성 유틸리티 |

---

## 학습 포인트

### 1. Context로 폼 상태 공유
- 여러 컴포넌트 간 상태 일관성 유지
- prop drilling 없이 깊은 자식에게 전달
- FormControl → InputLabel, Input, FormHelperText 모두 같은 상태 공유

### 2. Controlled vs Uncontrolled 패턴
- focused prop으로 외부 제어 가능
- 없으면 내부 상태로 관리
- `visuallyFocused !== undefined ? visuallyFocused : focusedState`

### 3. SSR 지원을 위한 초기값 계산
- useState 초기화 함수로 children 순회
- hydration mismatch 방지
- 서버/클라이언트 동일한 초기 상태 보장

### 4. 개발 도구와 프로덕션 분리
- process.env.NODE_ENV로 개발 모드 감지
- 개발 시에만 경고 표시
- 프로덕션 번들에서 제거됨
