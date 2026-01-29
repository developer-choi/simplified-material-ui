# NativeSelect 컴포넌트

> NativeSelectInput을 감싸는 단순화된 API 래퍼 컴포넌트

---

## 이 문서의 목적

**이 문서는 단순화된 코드의 "설명서"입니다.**

원본 NativeSelect는 복잡한 Input 컴포넌트와의 통합 로직을 가지고 있었습니다.
단순화된 버전은 NativeSelectInput을 직접 렌더링하여 구조를 명확하게 만들었습니다.

---

## 무슨 기능을 하는가?

수정된 NativeSelect는 **NativeSelectInput을 감싸는 간단한 래퍼 컴포넌트**입니다.

### 핵심 기능 (남은 것)
1. **Props 전달** - 사용자의 props를 NativeSelectInput으로 전달
2. **children 렌더링** - `<option>` 엘리먼트들을 children으로 전달

---

## 핵심 학습 포인트

### 1. Props Forwarding (Props 전달)

```javascript
const NativeSelect = React.forwardRef(function NativeSelect(props, ref) {
  const {
    children,
    disabled,
    error,
    multiple,
    open,
    value,
    onChange,
    name,
    ...other
  } = props;

  return (
    <NativeSelectInput
      ref={ref}
      disabled={disabled}
      error={error}
      multiple={multiple}
      open={open}
      value={value}
      onChange={onChange}
      name={name}
      {...other}  // 나머지 props 전달 ★
    >
      {children}  // option 엘리먼트들 ★
    </NativeSelectInput>
  );
});
```

**학습 가치**:
- **React.forwardRef**: ref를 하위 컴포넌트로 전달
- **Props destructuring**: 명시적으로 추출한 props + `...other`로 나머지 전달
- **children as props**: 자식 엘리먼트들을 prop으로 전달

**왜 이렇게 구현했는지**:
- NativeSelect는 API 래퍼 역할만 하므로 props를 그대로 전달
- 명시적으로 추출한 props는 문서화를 위해 나열
- `...other`로 예상치 못한 props도 전달 (유연성)

---

## 내부 구조

### 1. 렌더링 구조

```javascript
// 위치: packages/mui-material/src/NativeSelect/NativeSelect.js (42줄, 원본 136줄)

NativeSelect
  └─> NativeSelectInput  ← 실제 구현
       └─> <select>      ← 네이티브 select
            └─> {children} // <option> 엘리먼트들
```

### 2. 핵심 상태 (ref, state, 변수)

NativeSelect는 상태를 가지고 있지 않습니다. 모든 상태는 사용자가 관리합니다.

### 3. Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | ReactNode | - | `<option>` 엘리먼트들 |
| `disabled` | boolean | - | 비활성화 상태 |
| `error` | boolean | - | 에러 상태 |
| `multiple` | boolean | - | 다중 선택 여부 |
| `open` | boolean | - | 드롭다운 열림 상태 |
| `value` | any | - | 선택된 값 |
| `onChange` | func | - | 선택 변경 이벤트 핸들러 |
| `name` | string | - | name 속성 |

**제거된 Props**:
- ❌ `classes` - 클래스 오버라이드 제거
- ❌ `className` - className 병합 제거
- ❌ `IconComponent` - ArrowDropDownIcon 고정
- ❌ `input` - Input 컴포넌트 통합 제거
- ❌ `inputProps` - inputProps 병합 제거
- ❌ `variant` - standard만 지원
- ❌ `sx` - 시스템 prop 제거

---

## 동작 흐름

### NativeSelect 렌더링 플로우차트

```
사용자가 <NativeSelect value={10}> 렌더링
        ↓
┌─────────────────────────────────┐
│ Props 추출                       │
│  - children, disabled, value, ... │
│  - ...other (나머지 props)        │
└─────────────────────────────────┘
        ↓
┌─────────────────────────────────┐
│ NativeSelectInput 렌더링         │
│  - ref 전달                       │
│  - 명시적 props 전달              │
│  - ...other 전달                  │
│  - children 전달                  │
└─────────────────────────────────┘
        ↓
┌─────────────────────────────────┐
│ NativeSelectInput 내부           │
│  - <select> 렌더링               │
│  - <ArrowDropDownIcon> 렌더링    │
└─────────────────────────────────┘
```

### 시나리오 예시

**시나리오 1: 기본 사용**
```javascript
// 사용자 코드
<NativeSelect value={value} onChange={handleChange}>
  <option value={10}>Ten</option>
  <option value={20}>Twenty</option>
</NativeSelect>

// 내부 동작
1. NativeSelect가 props 받음
2. NativeSelectInput에 props 전달
3. NativeSelectInput이 <select> 렌더링
4. children (<option>)들을 select 안에 렌더링
```

**시나리오 2: ref 전달**
```javascript
// 사용자 코드
const selectRef = useRef();
<NativeSelect ref={selectRef} />

// 내부 동작
1. React.forwardRef가 ref를 받음
2. NativeSelectInput에 ref 전달
3. NativeSelectInput이 <select ref={ref}> 렌더링
4. 사용자가 selectRef.current로 DOM 엘리먼트 접근 가능
```

---

## 주요 변경 사항 (원본 대비)

### 변경 전: React.cloneElement 패턴

```javascript
// 원본: Input 컴포넌트와 통합
{React.cloneElement(input, {
  inputComponent: NativeSelectInput,  // Input 내부를 select로 교체
  inputProps: {
    children,
    classes: otherClasses,
    IconComponent,
    type: undefined,
    ...inputProps,
    ...(input ? input.props.inputProps : {}),  // 기존 inputProps 병합
  },
  ref,
  ...other,
  className: clsx(classes.root, input.props.className, className),
})}
```

**복잡한 점**:
- `React.cloneElement`: Input 컴포넌트의 props를 동적으로 수정
- `inputComponent`: InputBase의 기능으로 내부 컴포넌트 교체
- `inputProps` 병합: 3단계 병합 (inputProps + input.props.inputProps + 명시적 props)
- Input 컴포넌트 의존: Input, FilledInput, OutlinedInput 등

### 변경 후: 직접 렌더링

```javascript
// 단순화: NativeSelectInput을 직접 렌더링
<NativeSelectInput
  ref={ref}
  disabled={disabled}
  error={error}
  multiple={multiple}
  open={open}
  value={value}
  onChange={onChange}
  name={name}
  {...other}
>
  {children}
</NativeSelectInput>
```

**단순해진 점**:
- 직관적인 구조: NativeSelect → NativeSelectInput → select
- props 전달이 명확함
- Input 컴포넌트 불필요

---

## 커밋 히스토리로 보는 단순화 과정

NativeSelect는 **4개의 커밋**을 통해 단순화되었습니다.

### 1단계: PropTypes 제거

- `30837b8a` - [NativeSelect 단순화 1/8] PropTypes 제거

**삭제된 코드**:
```javascript
NativeSelect.propTypes = {
  children: PropTypes.node,
  classes: PropTypes.object,
  IconComponent: PropTypes.elementType,
  input: PropTypes.element,
  inputProps: PropTypes.object,
  sx: PropTypes.oneOfType([...]),
  variant: PropTypes.oneOf(['filled', 'outlined', 'standard']),
  // ... 56줄의 PropTypes
};
```

### 2단계: Variant 시스템 제거

- `a61b4c7b` - [NativeSelect 단순화 2/8] variant 시스템 제거 및 standard 고정

**삭제된 코드**:
```javascript
const muiFormControl = useFormControl();
const fcs = formControlState({
  props,
  muiFormControl,
  states: ['variant'],
});

// inputProps에 variant 전달
variant: fcs.variant,
```

### 3단계: 스타일 시스템 제거

- `4debf50b` - [NativeSelectInput 단순화 5/8] useUtilityClasses, composeClasses, 클래스 시스템 제거

**삭제된 코드**:
```javascript
const useUtilityClasses = (ownerState) => {
  const slots = { root: ['root'] };
  return composeClasses(slots, getNativeSelectUtilityClasses, classes);
};

const { root, ...otherClasses } = classesProp;
className: clsx(classes.root, input.props.className, className),
```

### 4단계: Input 통합 제거

- `6ac30467` - [NativeSelect 단순화 7/8] input prop 제거 및 NativeSelectInput 직접 렌더링

**삭제된 코드**:
```javascript
// Input import
import Input from '../../../form/Input';

// React.cloneElement로 Input과 통합
{React.cloneElement(input, {
  inputComponent: NativeSelectInput,
  inputProps: { children, ... },
  ref,
  ...other,
})}

// 변경 후: 직접 렌더링
<NativeSelectInput ref={ref} {...props}>
  {children}
</NativeSelectInput>
```

### 5단계: useDefaultProps 제거

- `4d612f32` - [NativeSelect 단순화 8/8] useDefaultProps 제거

**삭제된 코드**:
```javascript
const props = useDefaultProps({ name: 'MuiNativeSelect', props: inProps });
const { children, ... } = props;
```

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 136줄 | 42줄 (69% 감소) |
| **Props 개수** | 10개 | 8개 |
| **Input 통합** | React.cloneElement | 직접 렌더링 |
| **FormControl 연결** | useFormControl, formControlState | 없음 |
| **클래스 시스템** | useUtilityClasses, composeClasses | 없음 |
| **useDefaultProps** | 사용 | 안 함 |

---

## 비교: NativeSelect vs NativeSelectInput

| 항목 | NativeSelect | NativeSelectInput |
|------|-------------|-------------------|
| **역할** | API 래퍼 | 실제 구현 |
| **렌더링** | NativeSelectInput | `<select>`, `<svg>` |
| **Props** | 사용자 인터페이스 | 내부 상태 |
| **단순화 후** | 42줄 | 55줄 |
| **필수성** | 선택적 (직접 NativeSelectInput 사용 가능) | 필수 |

**왜 NativeSelect가 필요한가?**
- 원본: Input 컴포넌트와의 통합을 위해 필요
- 단순화: NativeSelectInput을 직접 사용해도 됨
- 실용성: NativeSelect가 더 나은 API 제공

---

## 학습 후 다음 단계

NativeSelect를 이해했다면:

1. **Select** - Menu 기반 커스텀 드롭다운
   - NativeSelect vs Select 차이
   - 왜 Select가 더 복잡한가

2. **FormControl** - 폼 상태 관리
   - NativeSelect와의 연결 (원본)
   - Context API 활용

3. **InputBase** - Form Input의 기반
   - inputComponent 패턴 이해

**예시: 기본 사용**
```javascript
import NativeSelect from '@mui/material/NativeSelect';

function SelectComponent() {
  const [age, setAge] = React.useState('');

  const handleChange = (event) => {
    setAge(event.target.value);
  };

  return (
    <NativeSelect value={age} onChange={handleChange}>
      <option value="">None</option>
      <option value={10}>Ten</option>
      <option value={20}>Twenty</option>
      <option value={30}>Thirty</option>
    </NativeSelect>
  );
}
```

**예시: 비활성화**
```javascript
<NativeSelect disabled value={10}>
  <option value={10}>Ten</option>
</NativeSelect>
```

**예시: 다중 선택**
```javascript
const [values, setValues] = React.useState([10, 20]);

<NativeSelect
  multiple
  value={values}
  onChange={(e) => setValues(e.target.value)}
>
  <option value={10}>Ten</option>
  <option value={20}>Twenty</option>
  <option value={30}>Thirty</option>
</NativeSelect>
```

**예시: ref 사용**
```javascript
const selectRef = React.useRef();

<NativeSelect ref={selectRef} value={10}>
  <option value={10}>Ten</option>
</NativeSelect>

// DOM 엘리먼트 접근
selectRef.current.focus();
```
