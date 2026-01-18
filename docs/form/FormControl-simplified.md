# FormControl 컴포넌트

> FormControl 핵심 기능: Context로 자식 컴포넌트에 상태 공유

---

## 무슨 기능을 하는가?

수정된 FormControl은 **폼 입력 요소들(Input, InputLabel, FormHelperText)에 Context로 상태를 공유하는 컨테이너 컴포넌트**입니다.

### 핵심 기능 (남은 것)
1. **Context로 상태 공유** - disabled, error, focused, filled 등을 자식에게 전파
2. **상태 관리** - focused, filled, adornedStart 상태를 추적
3. **레이아웃** - flexbox column으로 자식 배치, margin/fullWidth 지원
4. **Controlled State** - focused prop으로 외부에서 포커스 상태 제어 가능

> FormControl의 핵심 가치는 **Context Provider Pattern**입니다. 이를 통해 FormControl에 error나 disabled를 설정하면 모든 자식(Input, InputLabel, FormHelperText)이 자동으로 반영합니다.

---

## 핵심 학습 포인트

### 1. Context Provider Pattern (핵심)

```javascript
const childContext = React.useMemo(() => ({
  // Props에서 전달
  color, disabled, error, fullWidth, hiddenLabel, required, size, variant,

  // FormControl이 관리하는 상태
  adornedStart, setAdornedStart,
  filled, focused,

  // 상태 변경 콜백
  onBlur: () => setFocused(false),
  onFocus: () => setFocused(true),
  onEmpty,
  onFilled,
}), [...]);

return (
  <FormControlContext.Provider value={childContext}>
    <div style={rootStyle}>{children}</div>
  </FormControlContext.Provider>
);
```

**학습 가치**:
- React Context로 깊은 자식에게 상태 전달
- prop drilling 없이 상태 공유
- useMemo로 Context 값 메모이제이션 (불필요한 리렌더링 방지)

**사용 예시**:
```jsx
// FormControl에만 error 설정하면 모든 자식이 자동 반영
<FormControl error>
  <InputLabel>Email</InputLabel>  {/* 자동으로 빨간색 */}
  <Input />                        {/* 자동으로 빨간 밑줄 */}
  <FormHelperText>Error!</FormHelperText>  {/* 자동으로 빨간색 */}
</FormControl>
```

### 2. 자식이 Context를 소비하는 방식

```javascript
// Input, InputLabel 등에서
import useFormControl from '../FormControl/useFormControl';

const muiFormControl = useFormControl();

// 우선순위: props > context > 기본값
const disabled = muiFormControl?.disabled ?? props.disabled ?? false;
const error = muiFormControl?.error ?? props.error ?? false;
```

**학습 가치**:
- `??` (nullish coalescing)으로 우선순위 체인 구현
- Context 값이 없어도 안전하게 동작 (optional chaining)
- 개별 컴포넌트에서 직접 props로 오버라이드 가능

### 3. Controlled vs Uncontrolled Pattern

```javascript
const [focusedState, setFocused] = React.useState(false);

// focused prop이 있으면 외부 제어, 없으면 내부 상태 사용
const focused = visuallyFocused !== undefined && !disabled
  ? visuallyFocused
  : focusedState;
```

**학습 가치**:
- 외부에서 `focused` prop으로 제어 가능 (Controlled)
- 없으면 내부 `focusedState`로 관리 (Uncontrolled)
- disabled 상태에서는 focused 무시

### 4. Callback Memoization

```javascript
const onFilled = React.useCallback(() => {
  setFilled(true);
}, []);

const onEmpty = React.useCallback(() => {
  setFilled(false);
}, []);
```

**학습 가치**:
- Context로 전달되는 콜백 메모이제이션
- 자식 컴포넌트의 불필요한 리렌더링 방지
- 빈 의존성 배열로 컴포넌트 수명 동안 동일한 참조 유지

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/mui-material/src/FormControl/FormControl.js (132줄, 원본 352줄)

<FormControlContext.Provider value={childContext}>
  <div style={rootStyle} className={className} ref={ref} {...other}>
    {children}
  </div>
</FormControlContext.Provider>
```

### 2. Context에서 공유하는 상태

| 속성 | 타입 | 설명 |
|------|------|------|
| `disabled` | boolean | 비활성화 상태 |
| `error` | boolean | 에러 상태 |
| `focused` | boolean | 포커스 상태 |
| `filled` | boolean | 입력값 존재 여부 |
| `required` | boolean | 필수 여부 |
| `color` | string | 색상 ('primary' 등) |
| `size` | string | 크기 ('small', 'medium') |
| `variant` | string | 스타일 변형 |
| `fullWidth` | boolean | 전체 너비 사용 |
| `hiddenLabel` | boolean | 라벨 숨김 |
| `adornedStart` | boolean | 시작 adornment 존재 여부 |
| `onFocus` | function | 포커스 콜백 |
| `onBlur` | function | 블러 콜백 |
| `onFilled` | function | 입력값 존재 시 콜백 |
| `onEmpty` | function | 입력값 비어있을 때 콜백 |
| `setAdornedStart` | function | adornedStart setter |

### 3. Props

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
| `className` | string | - | root div의 className |

---

## 커밋 히스토리로 보는 단순화 과정

FormControl은 **5개의 커밋**을 통해 단순화되었습니다.

### 1단계: Theme 시스템 제거
- `[FormControl 단순화 1/5] Theme 시스템 제거`

**왜 불필요한가**:
- **학습 목적**: Theme 시스템은 MUI 전체 주제, FormControl 학습에 과함
- **복잡도**: DefaultPropsProvider 의존성

**삭제 내용**:
- `useDefaultProps` import
- `useDefaultProps({ props: inProps, name: 'MuiFormControl' })` 호출

### 2단계: Utility Classes 시스템 제거
- `[FormControl 단순화 2/5] Utility Classes 시스템 제거`

**왜 불필요한가**:
- **학습 목적**: className 생성은 스타일 오버라이드 시스템의 일부
- **복잡도**: useUtilityClasses, composeClasses, capitalize 함수

**삭제 내용**:
- `useUtilityClasses` 함수 전체
- `composeClasses`, `getFormControlUtilityClasses`, `capitalize` import
- `clsx(classes.root, className)` → `className`만 사용

### 3단계: Styled 시스템 제거 및 인라인 구현
- `[FormControl 단순화 3/5] Styled 시스템 제거 및 인라인 구현`

**왜 불필요한가**:
- **학습 목적**: styled() API는 CSS-in-JS 라이브러리 주제
- **복잡도**: styled, overridesResolver, ownerState, variants 배열

**변경 내용**:
```javascript
// Before (styled components)
const FormControlRoot = styled('div', { ... })({ ... });
<FormControlRoot as={component} ownerState={ownerState} />

// After (inline styles)
const rootStyle = {
  display: 'inline-flex',
  flexDirection: 'column',
  position: 'relative',
  ...(margin === 'normal' && { marginTop: 16, marginBottom: 8 }),
  ...(fullWidth && { width: '100%' }),
};
<div style={rootStyle} />
```

### 4단계: 개발 모드 경고 및 SSR 로직 단순화
- `[FormControl 단순화 4/5] 개발 모드 경고 및 SSR 로직 단순화`

**왜 불필요한가**:
- **학습 목적**: 개발 도구 기능은 핵심 로직이 아님
- **복잡도**: process.env.NODE_ENV 조건, React.Children.forEach 순회

**삭제 내용**:
- `registerEffect` 함수 (multiple InputBase 경고)
- SSR용 children 순회 로직 → 기본값 `false`로 단순화
- `isMuiElement`, `isFilled`, `isAdornedStart` import

### 5단계: PropTypes 제거
- `[FormControl 단순화 5/5] PropTypes 제거`

**왜 불필요한가**:
- **학습 목적**: PropTypes는 런타임 타입 검증 도구이지 컴포넌트 로직이 아님
- **복잡도**: 85줄의 PropTypes 정의

**삭제 내용**:
- `PropTypes` import
- `FormControl.propTypes = { ... }` 전체 (85줄)

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 352줄 | 132줄 (63% 감소) |
| **Context 공유** | ✅ FormControlContext.Provider | ✅ 유지 |
| **Theme 통합** | ✅ useDefaultProps | ❌ 제거 |
| **스타일링** | ✅ styled(FormControlRoot) | ❌ 인라인 스타일 |
| **Utility Classes** | ✅ MuiFormControl-root 등 | ❌ 제거 |
| **SSR children 순회** | ✅ isFilled, isAdornedStart | ❌ 기본값 false |
| **개발 모드 경고** | ✅ registerEffect | ❌ 제거 |
| **PropTypes** | ✅ 85줄 | ❌ 제거 |
| **component prop** | ✅ 커스텀 루트 요소 | ❌ 항상 div |

---

## 사용 예시

### 기본 사용 (핵심 패턴)

```javascript
import FormControl from './FormControl';
import InputLabel from '../InputLabel';
import Input from '../Input';
import FormHelperText from '../FormHelperText';

function BasicForm() {
  return (
    <FormControl>
      <InputLabel htmlFor="email">Email</InputLabel>
      <Input id="email" placeholder="email@example.com" />
      <FormHelperText>We'll never share your email.</FormHelperText>
    </FormControl>
  );
}
```

### 에러 상태 (Context 공유 데모)

```javascript
function ErrorForm({ hasError }) {
  return (
    // error를 FormControl에만 설정하면 모든 자식이 자동 반영
    <FormControl error={hasError}>
      <InputLabel>Email</InputLabel>
      <Input />  {/* 자동으로 빨간 밑줄 */}
      <FormHelperText>
        {hasError ? 'Invalid email format' : 'Enter your email'}
      </FormHelperText>
    </FormControl>
  );
}
```

### 다양한 상태

```javascript
function FormStates() {
  return (
    <>
      {/* 기본 */}
      <FormControl>
        <InputLabel>Normal</InputLabel>
        <Input />
      </FormControl>

      {/* 에러 */}
      <FormControl error>
        <InputLabel>Error</InputLabel>
        <Input />
      </FormControl>

      {/* 비활성화 */}
      <FormControl disabled>
        <InputLabel>Disabled</InputLabel>
        <Input />
      </FormControl>

      {/* 필수 */}
      <FormControl required>
        <InputLabel>Required</InputLabel>
        <Input />
      </FormControl>

      {/* 전체 너비 */}
      <FormControl fullWidth>
        <InputLabel>Full Width</InputLabel>
        <Input />
      </FormControl>
    </>
  );
}
```

### 외부에서 포커스 제어

```javascript
function ControlledFocus() {
  const [focused, setFocused] = React.useState(false);

  return (
    <>
      <button onClick={() => setFocused(true)}>Focus Input</button>
      <FormControl focused={focused}>
        <InputLabel>Controlled Focus</InputLabel>
        <Input onBlur={() => setFocused(false)} />
      </FormControl>
    </>
  );
}
```

---

## 관련 파일

| 파일 | 역할 |
|------|------|
| `FormControlContext.ts` | Context 객체 정의 |
| `useFormControl.ts` | Context 소비 훅 |
| `Input.js` | FormControl Context 소비 예시 |
| `InputLabel.js` | FormControl Context 소비 예시 |
| `FormHelperText.js` | FormControl Context 소비 예시 |

---

## 학습 후 다음 단계

FormControl을 이해했다면:

1. **Input** - FormControl Context를 소비하는 방법
2. **InputLabel** - shrink 상태와 FormControl 연동
3. **FormHelperText** - 에러 메시지 표시와 FormControl 연동
4. **TextField** - FormControl + InputLabel + Input + FormHelperText 조합
