# InputBase 컴포넌트

> Material-UI 입력 컴포넌트의 기반이 되는 최소 단순화 컴포넌트

---

## 무슨 기능을 하는가?

InputBase는 **Material-UI의 모든 입력 컴포넌트의 기반이 되는 최소한의 스타일과 상태 로직을 제공하는** 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **입력 요소 렌더링** - 기본 `<input>` 요소
2. **포커스 상태 관리** - focused state, handleFocus, handleBlur
3. **값 처리** - controlled/uncontrolled 모두 지원
4. **장식 지원** - startAdornment, endAdornment, renderSuffix
5. **기본 스타일** - 브라우저 기본 스타일 리셋

> **제거된 기능**: FormControl 통합, filled 상태 체크, multiline 지원, inputComponent 교체, Slot 시스템, Theme 시스템, Styled Components, PropTypes

---

## 핵심 학습 포인트

### 1. Controlled/Uncontrolled 패턴

```javascript
const value = inputPropsProp.value != null ? inputPropsProp.value : valueProp;
const { current: isControlled } = React.useRef(value != null);

const handleChange = (event, ...args) => {
  if (!isControlled) {
    // Uncontrolled 모드에서의 처리
    const element = event.target || inputRef.current;
    // ...
  }

  if (onChange) {
    onChange(event, ...args);
  }
};
```

**학습 가치**:
- `isControlled`: value prop 유무로 제어 여부 판단
- `useRef`로 모드 고정 (생명주기 동안 변경 불가)
- **Controlled**: value prop으로 값 제어, onChange만 호출
- **Uncontrolled**: defaultValue로 초기값 설정, 변경 시 내부 처리

### 2. 포커스 상태 관리

```javascript
const [focused, setFocused] = React.useState(false);

const handleFocus = (event) => {
  if (onFocus) onFocus(event);
  if (inputPropsProp.onFocus) inputPropsProp.onFocus(event);
  setFocused(true);
};

const handleBlur = (event) => {
  if (onBlur) onBlur(event);
  if (inputPropsProp.onBlur) inputPropsProp.onBlur(event);
  setFocused(false);
};

// disabled 상태에서 포커스 해제
React.useEffect(() => {
  if (disabled && focused) {
    setFocused(false);
    if (onBlur) onBlur();
  }
}, [disabled, focused, onBlur]);
```

**학습 가치**:
- 내부 focused state로 포커스 상태 추적
- 두 핸들러 모두 사용자 콜백과 inputProps 콜백 호출
- disabled 설정 시 포커스 자동 해제 (blur 이벤트가 발생하지 않기 때문)

### 3. 이벤트 핸들러 래핑

```javascript
const handleChange = (event, ...args) => {
  // 1. inputPropsProp.onChange 호출
  if (inputPropsProp.onChange) {
    inputPropsProp.onChange(event, ...args);
  }

  // 2. 컴포넌트의 onChange prop 호출
  if (onChange) {
    onChange(event, ...args);
  }
};
```

**학습 가치**:
- **이벤트 위임**: 자식 이벤트를 부모에서 처리
- **다중 핸들러**: inputProps와 props 두 곳의 핸들러 모두 호출
- **호출 순서**: inputProps 먼저, 그 다음 props
- 하위 호환성 유지

### 4. 장식(Adornment) 패턴

```javascript
<div>
  {startAdornment}
  <input ... />
  {endAdornment}
  {renderSuffix
    ? renderSuffix({
        ...fcs,
        startAdornment,
      })
    : null}
</div>
```

**학습 가치**:
- **startAdornment**: 입력 앞에 렌더링 (아이콘, 텍스트 등)
- **endAdornment**: 입력 뒤에 렌더링 (지우기 버튼 등)
- **renderSuffix**: 접미사 렌더링 함수 (에러 아이콘, 체크박스 등)
  - fcs (form control state) 전달
  - startAdornment 전달
  - 조건부 렌더링

### 5. 클릭 핸들링

```javascript
const handleClick = (event) => {
  if (inputRef.current && event.currentTarget === event.target) {
    inputRef.current.focus();
  }

  if (onClick) {
    onClick(event);
  }
};
```

**학습 가치**:
- root div를 클릭하면 input에 포커스
- `event.currentTarget === event.target`: 직접 클릭한 경우만
- 내부 요소(startAdornment 등)를 클릭하면 포커스하지 않음

### 6. React.forwardRef 패턴

```javascript
const InputBase = React.forwardRef(function InputBase(props, ref) {
  return (
    <div ref={ref} ...>
      <input ref={inputRef} ... />
    </div>
  );
});
```

**학습 가치**:
- `ref`를 root div에 전달
- `inputRef`를 input 요소에 전달
- 부모 컴포넌트가 root div에 접근 가능
- input 요소는 inputRef prop으로 접근

### 7. Props Spreading과 스타일 병합

```javascript
<input
  {...inputPropsProp}
  style={{ ...inputStyle, ...inputPropsProp.style }}
/>
```

**학습 가치**:
- `...inputPropsProp`: 사용자 정의 props를 input에 전달
- `style` 병합: 기본 스타일 + 사용자 정의 스타일
- 순서 중요: 뒤에 있는 스타일이 우선

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/form/InputBase/InputBase.js (약 190줄, 원본 297줄)
InputBase (React.forwardRef)
  └─> div (root)
       ├─> startAdornment
       ├─> input
       └─> endAdornment
       └─> renderSuffix (optional)
```

### 2. 전체 코드

```javascript
'use client';
import * as React from 'react';

const InputBase = React.forwardRef(function InputBase(props, ref) {
  const {
    'aria-describedby': ariaDescribedby,
    autoComplete,
    autoFocus,
    className,
    defaultValue,
    disabled,
    endAdornment,
    error,
    id,
    inputProps: inputPropsProp = {},
    inputRef: inputRefProp,
    name,
    onBlur,
    onChange,
    onClick,
    onFocus,
    onKeyDown,
    onKeyUp,
    placeholder,
    readOnly,
    renderSuffix,
    startAdornment,
    type = 'text',
    value: valueProp,
    ...other
  } = props;

  const value = inputPropsProp.value != null ? inputPropsProp.value : valueProp;
  const { current: isControlled } = React.useRef(value != null);

  const inputRef = inputRefProp || React.useRef();

  const [focused, setFocused] = React.useState(false);

  const fcs = {
    disabled: disabled || false,
    error: error || false,
    required: false,
    hiddenLabel: false,
    filled: false,
  };

  fcs.focused = focused;

  React.useEffect(() => {
    if (disabled && focused) {
      setFocused(false);
      if (onBlur) {
        onBlur();
      }
    }
  }, [disabled, focused, onBlur]);

  const handleFocus = (event) => {
    if (onFocus) {
      onFocus(event);
    }
    if (inputPropsProp.onFocus) {
      inputPropsProp.onFocus(event);
    }

    setFocused(true);
  };

  const handleBlur = (event) => {
    if (onBlur) {
      onBlur(event);
    }
    if (inputPropsProp.onBlur) {
      inputPropsProp.onBlur(event);
    }

    setFocused(false);
  };

  const handleChange = (event, ...args) => {
    if (!isControlled) {
      const element = event.target || inputRef.current;
      if (element == null) {
        throw new Error(
          'MUI: Expected valid input target. ' +
            'Did you use a custom `inputComponent` and forget to forward refs? '
        );
      }
    }

    if (inputPropsProp.onChange) {
      inputPropsProp.onChange(event, ...args);
    }

    if (onChange) {
      onChange(event, ...args);
    }
  };

  const handleClick = (event) => {
    if (inputRef.current && event.currentTarget === event.target) {
      inputRef.current.focus();
    }

    if (onClick) {
      onClick(event);
    }
  };

  const rootStyle = {
    lineHeight: '1.4375em',
    boxSizing: 'border-box',
    position: 'relative',
    cursor: fcs.disabled ? 'default' : 'text',
    display: 'inline-flex',
    alignItems: 'center',
  };

  const inputStyle = {
    font: 'inherit',
    letterSpacing: 'inherit',
    color: 'currentColor',
    padding: '4px 0 5px',
    border: 0,
    boxSizing: 'content-box',
    background: 'none',
    height: '1.4375em',
    margin: 0,
    WebkitTapHighlightColor: 'transparent',
    display: 'block',
    minWidth: 0,
    width: '100%',
    ...(type === 'search' && { MozAppearance: 'textfield' }),
  };

  return (
    <div
      ref={ref}
      onClick={handleClick}
      {...other}
      className={className}
      style={rootStyle}
    >
      {startAdornment}
      <input
        aria-invalid={fcs.error}
        aria-describedby={ariaDescribedby}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        defaultValue={defaultValue}
        disabled={fcs.disabled}
        id={id}
        name={name}
        placeholder={placeholder}
        readOnly={readOnly}
        required={fcs.required}
        value={value}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        type={type}
        {...inputPropsProp}
        ref={inputRef}
        className={inputPropsProp.className}
        style={{ ...inputStyle, ...inputPropsProp.style }}
        onBlur={handleBlur}
        onChange={handleChange}
        onFocus={handleFocus}
      />
      {endAdornment}
      {renderSuffix
        ? renderSuffix({
            ...fcs,
            startAdornment,
          })
        : null}
    </div>
  );
});

export default InputBase;
```

### 3. Props (19개)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `autoComplete` | string | - | 자동 완성 |
| `autoFocus` | boolean | - | 자동 포커스 |
| `className` | string | - | 외부 클래스 |
| `defaultValue` | any | - | 비제어 값 |
| `disabled` | boolean | false | 비활성화 |
| `endAdornment` | node | - | 끝 장식 |
| `error` | boolean | false | 에러 상태 |
| `id` | string | - | ID |
| `name` | string | - | 이름 |
| `onBlur` | func | - | 포커스 아웃 |
| `onChange` | func | - | 값 변경 |
| `onClick` | func | - | 클릭 |
| `onFocus` | func | - | 포커스 인 |
| `onKeyDown` | func | - | 키 다운 |
| `onKeyUp` | func | - | 키 업 |
| `placeholder` | string | - | 플레이스홀더 |
| `readOnly` | boolean | false | 읽기 전용 |
| `renderSuffix` | func | - | 접미사 렌더링 |
| `startAdornment` | node | - | 시작 장식 |
| `type` | string | 'text' | 타입 |
| `value` | any | - | 값 |

---

## 커밋 히스토리로 보는 단순화 과정

InputBase는 **4개의 커밋**을 통해 단순화되었습니다.

### 1단계: FormControl 통합 제거
- `01108c4a` - [InputBase 단순화 1/4] FormControl 통합 제거

**왜 불필요한가**:
- **학습 목적**: InputBase의 핵심은 "입력 요소"이지 "폼 상태 통합"이 아님
- **복잡도**: useFormControl, formControlState, muiFormControl 연동 (약 20줄)
- **의존성**: FormControl에 의존하여 재사용성 저하

**삭제 대상**:
- `useFormControl()` import 및 호출
- `formControlState()` import 및 호출
- `FormControlContext.Provider`
- `muiFormControl` 관련 로직

### 2단계: filled 상태 체크 제거
- `4dc84d1b` - [InputBase 단순화 2/4] filled 상태 체크 제거

**왜 불필요한가**:
- **학습 목적**: 입력 요소의 핵심은 "값 입력/출력"이지 "filled 상태"가 아님
- **복잡도**: checkDirty 로직 (약 15줄), useEnhancedEffect
- **간소화**: filled 상태는 사용자가 직접 구현 가능

**삭제 대상**:
- `checkDirty` 함수
- `isFilled` import
- `useEnhancedEffect` import 및 호출
- `onFilled`, `onEmpty` 콜백

### 3단계: multiline 지원 제거
- `2a7a49c1` - [InputBase 단순화 3/4] multiline 지원 제거

**왜 불필요한가**:
- **학습 목적**: InputBase의 핵심은 "단일 행 입력"이지 "여러 줄"이 아님
- **복잡도**: TextareaAutosize 의존, rows/minRows/maxRows 조건부 로직
- **간소화**: textarea는 별도 HTML 요소로 사용 가능

**삭제 대상**:
- `multiline` prop
- `rows`, `minRows`, `maxRows` props
- `TextareaAutosize` import
- multiline 관련 로직

### 4단계: inputComponent 고정
- `1290784f` - [InputBase 단순화 4/4] inputComponent 고정

**왜 불필요한가**:
- **학습 목적**: 기본 input 요소 학습이 목표
- **간소화**: textarea 등은 별도 HTML 요소로 사용

**삭제 대상**:
- `inputComponent` prop

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 297줄 | 약 190줄 (36% 감소) |
| **Props 개수** | 25개 | 19개 (-6개) |
| **외부 의존** | 6개 | 0개 |
| **FormControl** | ✅ 통합 | ❌ |
| **filled 상태** | ✅ checkDirty | ❌ |
| **multiline** | ✅ TextareaAutosize | ❌ |
| **inputComponent** | ✅ 교체 가능 | ❌ 'input' 고정 |
| **핵심 기능** | ✅ 입력 요소 | ✅ 유지 |

---

## 학습 후 다음 단계

InputBase를 이해했다면:

1. **FormControl** - 폼 상태 관리 컴포넌트
2. **TextField** - InputBase + FormControl + Label 조합
3. **Select** - InputBase를 사용하는 셀렉트 박스

**예시: 기본 사용**
```javascript
<InputBase
  value={value}
  onChange={handleChange}
  placeholder="입력하세요"
/>
```

**예시: Adornments**
```javascript
<InputBase
  startAdornment={<SearchIcon />}
  endAdornment={<ClearIcon />}
  placeholder="검색어를 입력하세요"
/>
```

**예시: 에러 상태**
```javascript
<InputBase
  error={hasError}
  renderSuffix={(state) =>
    state.error && <ErrorIcon />
  }
/>
```

**예시: 제어/비제어**
```javascript
// Controlled
<InputBase value={value} onChange={handleChange} />

// Uncontrolled
<InputBase defaultValue="initial" />
```
