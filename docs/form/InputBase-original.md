# InputBase 컴포넌트

> Material-UI의 InputBase 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

InputBase는 **Material-UI의 모든 입력 필드 컴포넌트(Input, FilledInput, OutlinedInput)의 기반이 되는 최소한의 스타일과 상태 로직만 담은 기본 컴포넌트**입니다.

### 핵심 기능
1. **기본 입력 필드 렌더링** - `<input>` 또는 `<textarea>` 요소 렌더링
2. **FormControl 상태 동기화** - 부모 FormControl과 filled/focused/error/disabled 상태 공유
3. **multiline 지원** - TextareaAutosize를 사용한 자동 높이 조절 textarea
4. **Adornments 지원** - startAdornment/endAdornment로 아이콘이나 텍스트 추가
5. **제어/비제어 컴포넌트 모드** - value prop 유무에 따라 자동 감지
6. **이벤트 핸들링** - onChange, onFocus, onBlur 이벤트 처리 및 FormControl에 전파

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/InputBase/InputBase.js (848줄)

<React.Fragment>
  <InputGlobalStyles />  // 자동완성 애니메이션 (조건부)

  <InputBaseRoot>  // styled div
    {startAdornment}

    <FormControlContext.Provider value={null}>
      <InputBaseInput  // styled input 또는 TextareaAutosize
        // ... input props
      />
    </FormControlContext.Provider>

    {endAdornment}
    {renderSuffix?.({ ...fcs, startAdornment })}  // OutlinedInput용
  </InputBaseRoot>
</React.Fragment>
```

### 2. 하위 컴포넌트가 담당하는 기능

- **InputBaseRoot** - 컨테이너 div, 레이아웃 및 스타일 제공
- **InputBaseInput** - 실제 input/textarea 요소, 텍스트 입력 처리
- **TextareaAutosize** - multiline 모드에서 자동 높이 조절
- **InputGlobalStyles** - 브라우저 자동완성 감지용 keyframes 애니메이션

### 3. FormControl 통합

FormControl과의 양방향 통신:

```javascript
// FormControl에서 상태 읽기 (선 352-356)
const fcs = formControlState({
  props,
  muiFormControl,
  states: ['color', 'disabled', 'error', 'hiddenLabel', 'size', 'required', 'filled'],
});

fcs.focused = muiFormControl ? muiFormControl.focused : focused;

// FormControl에 상태 전달 (선 374-385)
const checkDirty = React.useCallback((obj) => {
  if (isFilled(obj)) {
    if (onFilled) {
      onFilled();  // FormControl의 filled 상태 업데이트
    }
  } else if (onEmpty) {
    onEmpty();
  }
}, [onFilled, onEmpty]);

// startAdornment 존재 여부 전달 (선 501-505)
React.useEffect(() => {
  if (muiFormControl) {
    muiFormControl.setAdornedStart(Boolean(startAdornment));
  }
}, [muiFormControl, startAdornment]);
```

**주요 동기화 상태:**
- `filled` - 입력값이 채워졌는지 (라벨 위치 결정)
- `focused` - 포커스 상태
- `error` - 에러 상태
- `disabled` - 비활성화 상태
- `size` - 크기 (small, medium)
- `color` - 색상 테마

### 4. multiline 동작

```javascript
// 선 469-494
if (multiline && InputComponent === 'input') {
  if (rows) {
    inputProps = {
      type: undefined,
      minRows: rows,
      maxRows: rows,
      ...inputProps,
    };
  } else {
    inputProps = {
      type: undefined,
      maxRows,
      minRows,
      ...inputProps,
    };
  }

  InputComponent = TextareaAutosize;  // 동적으로 컴포넌트 변경
}
```

**특징:**
- `multiline={true}`이고 `inputComponent`가 기본값('input')일 때만 활성화
- `InputComponent`를 `TextareaAutosize`로 동적 교체
- `rows` prop이 있으면 고정 높이, 없으면 자동 조절

### 5. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `value` | any | - | Controlled 모드의 입력값 |
| `defaultValue` | any | - | Uncontrolled 모드의 초기값 |
| `onChange` | function | - | 값 변경 시 호출 |
| `multiline` | boolean | false | textarea로 렌더링 여부 |
| `rows` / `minRows` / `maxRows` | number \| string | - | multiline 높이 제어 |
| `startAdornment` | node | - | 입력 필드 앞에 표시할 요소 |
| `endAdornment` | node | - | 입력 필드 뒤에 표시할 요소 |
| `disabled` | boolean | false | 비활성화 상태 (FormControl 상속) |
| `error` | boolean | false | 에러 상태 (FormControl 상속) |
| `fullWidth` | boolean | false | 전체 너비 사용 |
| `placeholder` | string | - | placeholder 텍스트 |
| `type` | string | 'text' | input type (text, password, email 등) |
| `inputRef` | ref | - | input 요소에 대한 ref |
| `inputComponent` | elementType | 'input' | 커스텀 입력 컴포넌트 |
| `inputProps` | object | {} | input 요소에 전달할 추가 props |
| `readOnly` | boolean | false | 읽기 전용 상태 |
| `color` | string | 'primary' | 색상 테마 (FormControl 상속) |
| `size` | string | 'medium' | 크기 (small, medium) |
| `margin` | string | 'none' | 여백 (dense, none) |
| **Slot 시스템** | | | |
| `slots` | object | {} | 컴포넌트 교체 (root, input) |
| `slotProps` | object | {} | 슬롯별 props 전달 |
| `components` | object | {} | (Deprecated) slots의 레거시 버전 |
| `componentsProps` | object | {} | (Deprecated) slotProps의 레거시 버전 |
| **기타** | | | |
| `renderSuffix` | function | - | OutlinedInput용 커스텀 렌더 |
| `disableInjectingGlobalStyles` | boolean | false | 자동완성 스타일 주입 비활성화 |

### 6. Slot 시스템 메커니즘

동적 컴포넌트 선택 (선 525-529):

```javascript
// Root 컴포넌트 결정
const Root = slots.root || components.Root || InputBaseRoot;
const rootProps = slotProps.root || componentsProps.root || {};

// Input 컴포넌트 결정
const Input = slots.input || components.Input || InputBaseInput;
inputProps = { ...inputProps, ...(slotProps.input ?? componentsProps.input) };
```

**Fallback 순서:**
1. `slots.root` (최신 API)
2. `components.Root` (레거시 API)
3. `InputBaseRoot` (기본 styled 컴포넌트)

**props 병합:**
- `slotProps` 또는 `componentsProps`에 정의된 props를 각 슬롯에 전달
- `deepmerge`로 기본 props와 사용자 props 병합

### 7. 이벤트 핸들링 상세

```javascript
// onChange - 입력값 변경 (선 423-447)
const handleChange = (event, ...args) => {
  if (!isControlled) {
    // Uncontrolled 모드: 입력값 체크하여 FormControl에 전달
    checkDirty({ value: event.target.value });
  }

  // 1. inputProps.onChange 호출
  if (inputPropsProp.onChange) {
    inputPropsProp.onChange(event, ...args);
  }

  // 2. 컴포넌트의 onChange prop 호출
  if (onChange) {
    onChange(event, ...args);
  }
};

// onFocus - 포커스 획득 (선 393-406)
const handleFocus = (event) => {
  // 1. 컴포넌트의 onFocus prop 호출
  if (onFocus) {
    onFocus(event);
  }

  // 2. inputProps.onFocus 호출
  if (inputPropsProp.onFocus) {
    inputPropsProp.onFocus(event);
  }

  // 3. FormControl에 전파 또는 로컬 상태 업데이트
  if (muiFormControl && muiFormControl.onFocus) {
    muiFormControl.onFocus(event);
  } else {
    setFocused(true);
  }
};

// onBlur - 포커스 상실 (선 408-421)
const handleBlur = (event) => {
  // 1. 컴포넌트의 onBlur prop 호출
  if (onBlur) {
    onBlur(event);
  }

  // 2. inputProps.onBlur 호출
  if (inputPropsProp.onBlur) {
    inputPropsProp.onBlur(event);
  }

  // 3. FormControl에 전파 또는 로컬 상태 업데이트
  if (muiFormControl && muiFormControl.onBlur) {
    muiFormControl.onBlur(event);
  } else {
    setFocused(false);
  }
};
```

**이벤트 호출 순서:**
1. 사용자 제공 핸들러 (`onFocus`, `onChange`, `onBlur`)
2. `inputProps`에 포함된 핸들러 (하위 호환성)
3. FormControl 통합 핸들러 (상태 동기화)

### 8. Ref 병합 (useForkRef)

```javascript
// 선 330-335
const handleInputRef = useForkRef(
  inputRef,           // 내부 ref (checkDirty, focus() 등에 사용)
  inputRefProp,       // 사용자가 전달한 inputRef prop
  inputPropsProp.ref, // inputProps.ref (하위 호환성)
  handleInputRefWarning, // 개발 모드 경고 콜백
);
```

**세 가지 ref 동시 업데이트:**
- `inputRef` - 내부 로직용 (값 체크, 포커스 제어)
- `inputRefProp` - 사용자가 input 요소에 접근
- `inputPropsProp.ref` - 레거시 방식 지원

### 9. isFilled 로직

```javascript
// packages/mui-material/src/InputBase/utils.js
export function isFilled(obj, SSR = false) {
  return (
    obj &&
    ((hasValue(obj.value) && obj.value !== '') ||
      (SSR && hasValue(obj.defaultValue) && obj.defaultValue !== ''))
  );
}

export function hasValue(value) {
  return value != null && !(Array.isArray(value) && value.length === 0);
}
```

**filled 판정 규칙:**
- `null`, `undefined` → filled 아님
- 빈 문자열 `''` → filled 아님
- `0` → filled (숫자 0은 유효한 값)
- 빈 배열 `[]` → filled 아님
- SSR 시: `defaultValue` 기준으로 판정

---

## 설계 패턴

### 1. Slot 패턴 (Component Composition)

**목적:** 내부 요소를 외부에서 교체 가능하게 만듦

```javascript
// 사용자가 Root를 커스텀 컴포넌트로 교체
<InputBase
  slots={{ root: CustomRoot, input: CustomInput }}
  slotProps={{ root: { elevation: 2 }, input: { maxLength: 10 } }}
/>
```

**구현:**
- `slots.root || components.Root || InputBaseRoot` - fallback 체인
- `slotProps`로 각 슬롯에 props 전달
- `isHostComponent`로 네이티브 요소 판별 (ownerState 전달 여부 결정)

### 2. Theme 시스템 통합

**목적:** 전역 테마 설정을 컴포넌트에 자동 적용

```javascript
// 1. 기본값 주입
const props = useDefaultProps({ props: inProps, name: 'MuiInputBase' });

// 2. 테마 기반 스타일
InputBaseRoot = styled('div')(
  memoTheme(({ theme }) => ({
    color: theme.palette.text.primary,
    ...theme.typography.body1,
  }))
);

// 3. 동적 클래스 생성
const classes = useUtilityClasses(ownerState);
```

### 3. Styled Components 패턴

**ownerState 기반 동적 스타일:**

```javascript
export const InputBaseRoot = styled('div', {
  overridesResolver: rootOverridesResolver,
})(
  memoTheme(({ theme }) => ({
    variants: [
      {
        props: ({ ownerState }) => ownerState.multiline,
        style: { padding: '4px 0 5px' },
      },
      {
        props: ({ ownerState }) => ownerState.fullWidth,
        style: { width: '100%' },
      },
    ],
  }))
);
```

**ownerState 생성 (선 507-521):**
```javascript
const ownerState = {
  ...props,
  color: fcs.color || 'primary',
  disabled: fcs.disabled,
  endAdornment,
  error: fcs.error,
  focused: fcs.focused,
  formControl: muiFormControl,
  fullWidth,
  hiddenLabel: fcs.hiddenLabel,
  multiline,
  size: fcs.size,
  startAdornment,
  type,
};
```

### 4. Context 분리 패턴

```javascript
<FormControlContext.Provider value={null}>
  <Input ... />
</FormControlContext.Provider>
```

**이유:** Input 내부의 중첩된 FormControl이 부모 FormControl의 상태를 상속받지 않도록 차단

### 5. 제어/비제어 자동 감지

```javascript
const value = inputPropsProp.value != null ? inputPropsProp.value : valueProp;
const { current: isControlled } = React.useRef(value != null);
```

**특징:**
- 초기 렌더링 시 `value` prop 존재 여부로 판단
- `useRef`로 모드 고정 (컴포넌트 생명주기 동안 변경 불가)
- Controlled 모드: onChange만 실행, filled 상태는 value prop 기준
- Uncontrolled 모드: onChange + checkDirty 실행

---

## 복잡도의 이유

InputBase는 **848줄**이며, 복잡한 이유는:

### 1. Slot 시스템 (약 100줄)

**두 가지 API 동시 지원:**
- 최신: `slots`, `slotProps`
- 레거시: `components`, `componentsProps`

**복잡도 요인:**
- Fallback 체인 (3단계)
- Props 병합 (deepmerge)
- `isHostComponent` 판별 (ownerState 전달 여부)

### 2. Theme 시스템 (약 150줄)

**통합 요소:**
- `useDefaultProps` - 테마의 기본값 주입
- `useUtilityClasses` - 동적 CSS 클래스 생성 (53-100줄)
- `memoTheme` - 테마 변경 시에만 스타일 재계산
- `composeClasses` - 여러 클래스를 조합

### 3. Styled Components (약 150줄)

**스타일 정의:**
- `InputBaseRoot` - 102-141줄 (40줄)
- `InputBaseInput` - 143-256줄 (113줄)

**복잡도 요인:**
- `variants` 배열 - 조건부 스타일 정의
- `overridesResolver` - 테마 오버라이드 지원
- Placeholder 스타일 (브라우저별 prefix)
- 자동완성 애니메이션 스타일

### 4. FormControl 통합 (약 80줄)

**상태 동기화:**
- `formControlState` - 7개 상태 읽기
- `checkDirty` - filled 상태 전달
- `setAdornedStart` - startAdornment 존재 여부 전달
- focused 상태 이중 관리 (로컬 + FormControl)

### 5. 이벤트 핸들링 (약 80줄)

**각 이벤트마다:**
- 사용자 핸들러 호출
- inputProps 핸들러 호출
- FormControl 통합 로직 실행

**세 가지 핸들러:**
- `handleFocus`, `handleBlur`, `handleChange`
- `handleClick`, `handleAutoFill`

### 6. Ref 병합 및 검증 (약 30줄)

**useForkRef:**
- 세 가지 ref 동시 업데이트
- `handleInputRefWarning` - 개발 모드 검증

### 7. PropTypes (약 240줄)

**타입 정의:**
- 608-845줄 (237줄)
- 40개 이상의 props
- JSDoc 주석 포함

### 8. multiline 동적 처리 (약 30줄)

**조건부 컴포넌트 교체:**
- `InputComponent` 동적 결정
- `rows`/`minRows`/`maxRows` props 변환
- 개발 모드 경고 (rows와 minRows/maxRows 동시 사용)

### 9. GlobalStyles 주입 (약 10줄)

**브라우저 자동완성 감지:**
- `@keyframes mui-auto-fill` 애니메이션
- `disableInjectingGlobalStyles` 조건부 주입

### 10. 개발 모드 경고 및 검증 (약 40줄)

- inputComponent ref 검증
- FormControl 등록 (registerEffect)
- rows prop 충돌 경고

---

## 핵심 차이점: InputBase vs HTML `<input>`

| 기능 | HTML `<input>` | InputBase |
|------|---------------|-----------|
| **기본 렌더링** | `<input>` 태그 | `<div><input /></div>` 구조 |
| **multiline** | ❌ (`<textarea>` 필요) | ✅ 자동 전환 (TextareaAutosize) |
| **Adornments** | ❌ | ✅ startAdornment/endAdornment |
| **FormControl 통합** | ❌ | ✅ 상태 동기화 (filled, focused, error) |
| **Theme 시스템** | ❌ | ✅ 전역 테마 적용 |
| **커스터마이징** | CSS만 | Slot 시스템으로 컴포넌트 교체 |
| **Ref** | 단일 ref | 복수 ref 병합 (useForkRef) |
| **자동완성 감지** | ❌ | ✅ 애니메이션으로 감지 |
| **Controlled 모드** | 수동 처리 | 자동 감지 |

---

## 요약

InputBase는 Material-UI 입력 시스템의 **핵심 추상화 레이어**입니다:

1. **최소한의 스타일** - "unstyled"에 가까움, 상위 컴포넌트(Input, FilledInput)가 스타일 추가
2. **최대한의 유연성** - Slot 시스템으로 모든 부분 교체 가능
3. **FormControl 통합** - Material Design의 Form 패턴 구현
4. **접근성 고려** - ARIA 속성, 포커스 관리
5. **복잡한 상태 관리** - Controlled/Uncontrolled 자동 감지, filled 추적
