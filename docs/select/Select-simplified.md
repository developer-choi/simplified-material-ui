# Select 컴포넌트

> SelectInput을 감싸는 단순화된 API 래퍼 컴포넌트

---

## 이 문서의 목적

**이 문서는 단순화된 코드의 "설명서"입니다.**

원본 Select는 복잡한 variant 시스템과 FormControl 통합을 가지고 있었습니다.
단순화된 버전은 OutlinedInput과 SelectInput의 통합 방법을 명확하게 보여줍니다.

---

## 무슨 기능을 하는가?

수정된 Select는 **SelectInput을 OutlinedInput으로 감싸서 렌더링하는 래퍼 컴포넌트**입니다.

### 핵심 기능 (남은 것)
1. **Input 래핑** - OutlinedInput을 사용하여 SelectInput을 감싸기
2. **Props 전달** - 사용자의 props를 SelectInput으로 전달
3. **notched 처리** - displayEmpty일 때 outlined label의 notch 처리

---

## 핵심 학습 포인트

### 1. React.cloneElement 패턴

**역할**: 기존 엘리먼트(InputComponent)의 props를 수정하여 새로 렌더링

```javascript
const InputComponent = <StyledOutlinedInput label={label} />;

return (
  <React.Fragment>
    {React.cloneElement(InputComponent, {
      inputComponent: SelectInput,  // 내부 구현체 교체 ★
      inputProps: { children, ... },
      ref,
      ...other,
    })}
  </React.Fragment>
);
```

**학습 가치**:
- **컴포넌트 재사용**: 기존 OutlinedInput을 그대로 사용하되 내부만 교체
- **inputComponent 패턴**: InputBase가 제공하는 기능으로 내부 구현체 교체
- **Props 전달**: React.cloneElement의 두 번째 인자로 props 병합

**왜 이렇게 구현했는지**:
- OutlinedInput의 스타일과 기능을 그대로 재사용
- SelectInput만 넣어서 드롭다운 동작 변경
- FormControl 통합, label 처리 등 OutlinedInput의 기능 활용

### 2. inputComponent와 inputProps 분리

**역할**: Input 컴포넌트에서 사용하는 내부 구현체와 그 props 분리

```javascript
React.cloneElement(InputComponent, {
  inputComponent: SelectInput,      // 어떤 컴포넌트를 내부에 렌더링할까?
  inputProps: {                     // 그 컴포넌트에 어떤 props를 전달할까?
    children,
    IconComponent,
    variant,
    multiple,
    // ...
  },
})
```

**학습 가치**:
- **관심사 분리**: Input 컴포넌트는 "무엇을" 렌더링할지 모름
- **유연성**: InputBase는 어떤 컴포넌트든 내부에 렌더링 가능
- **Props 전달**: inputProps로 내부 컴포넌트에 props 전달

**InputBase 내부 동작 (개념)**:
```javascript
// InputBase의 개념적 구현
function InputBase({ inputComponent, inputProps, ...props }) {
  return (
    <div {...props}>
      {React.createElement(inputComponent, inputProps)}
    </div>
  );
}
```

### 3. notched prop (OutlinedInput 전용)

**역할**: displayEmpty이거나 multiple일 때 outlined label의 notch(홈) 활성화

```javascript
...(displayEmpty && variant === 'outlined'
  ? { notched: true }
  : {}),
```

**학습 가치**:
- **OutlinedInput 특성**: label이 있을 때 value가 있으면 notch가 활성화
- **displayEmpty**: 빈 값도 표시할 때 notched=true로 label이 overlap 방지

**시각적 효과**:
```
notched=false (default):
┌─────────────────────┐
│ Label      [Value]  │  ← Label과 Value가 겹침
└─────────────────────┘

notched=true:
┌─────────────────────┐
│ Label ── [Value]    │  ← Label이 축소되고 홈이 생김
└─────────────────────┘
```

---

## 내부 구조

### 1. 렌더링 구조

```javascript
// 위치: packages/mui-material/src/Select/Select.js (72줄, 원본 297줄)

Select
  └─> Fragment
       └─> {React.cloneElement(OutlinedInput, {
            inputComponent: SelectInput,
            inputProps: {...},
            ...
          })}
            └─> OutlinedInput
                 └─> SelectInput (inputComponent로 교체됨)
                      ├─> Menu (드롭다운)
                      └─> IconComponent
```

### 2. 핵심 상태

Select는 상태를 가지고 있지 않습니다. 모든 상태는:
- **SelectInput**: open, value 등의 상태 관리
- **OutlinedInput**: FormControl과의 연결

### 3. Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `autoWidth` | boolean | false | 드롭다운 너비 자동 조정 |
| `children` | ReactNode | - | MenuItem 엘리먼트들 |
| `defaultOpen` | boolean | false | 초기 열림 상태 |
| `displayEmpty` | boolean | false | 빈 값 표시 |
| `IconComponent` | elementType | ArrowDropDownIcon | 드롭다운 아이콘 |
| `id` | string | - | select 엘리먼트의 ID |
| `inputProps` | object | - | input 엘리먼트에 전달할 속성 |
| `label` | ReactNode | - | Label (OutlinedInput용) |
| `labelId` | string | - | 추가 label의 ID |
| `MenuProps` | object | - | Menu 컴포넌트에 전달할 props |
| `multiple` | boolean | false | 다중 선택 |
| `onClose` | func | - | 닫힘 이벤트 핸들러 |
| `onOpen` | func | - | 열림 이벤트 핸들러 |
| `open` | boolean | - | 제어된 모드의 열림 상태 |
| `renderValue` | func | - | 값 렌더링 함수 |
| `SelectDisplayProps` | object | - | 디스플레이 영역에 전달할 props |

**제거된 Props**:
- ❌ `classes` - 클래스 오버라이드 제거
- ❌ `className` - className 병합 제거
- ❌ `variant` - outlined만 지원
- ❌ `native` - SelectInput만 사용
- ❌ `input` - OutlinedInput 고정
- ❌ `sx` - 시스템 prop 제거
- ❌ `error` - FormControl 연결 제거
- ❌ `value`, `defaultValue`, `onChange` - SelectInput으로 전달

---

## 동작 흐름

### Select 렌더링 플로우차트

```
사용자가 <Select value={10}> 렌더링
        ↓
┌─────────────────────────────────┐
│ Props 추출                       │
│  - children, autoWidth, multiple, ... │
│  - ...other (나머지 props)        │
└─────────────────────────────────┘
        ↓
┌─────────────────────────────────┐
│ InputComponent 생성              │
│  - StyledOutlinedInput + label │
└─────────────────────────────────┘
        ↓
┌─────────────────────────────────┐
│ React.cloneElement로 복제        │
│  - inputComponent: SelectInput   │
│  - inputProps: {...}            │
│  - notched: displayEmpty? true │
│  - ref 전달                      │
└─────────────────────────────────┘
        ↓
┌─────────────────────────────────┐
│ OutlinedInput 렌더링             │
│  - 내부에 SelectInput 렌더링      │
│  - label 처리                    │
└─────────────────────────────────┘
```

### 시나리오 예시

**시나리오 1: 기본 사용**
```javascript
// 사용자 코드
<Select value={10} onChange={handleChange}>
  <MenuItem value={10}>Ten</MenuItem>
  <MenuItem value={20}>Twenty</MenuItem>
</Select>

// 내부 동작
1. Select가 props 받음
2. OutlinedInput 생성 (label 없음)
3. React.cloneElement로 inputComponent=SelectInput 설정
4. OutlinedInput 내부에서 SelectInput 렌더링
5. children (<MenuItem>)들을 SelectInput으로 전달
```

**시나리오 2: Label과 displayEmpty**
```javascript
<Select label="Age" displayEmpty value="">
  <MenuItem value="">None</MenuItem>
  <MenuItem value={10}>Ten</MenuItem>
</Select>

// 내부 동작
1. OutlinedInput에 label="Age" 전달
2. displayEmpty && variant==='outlined' → notched=true
3. OutlinedInput이 notched로 인해 label을 축소해서 렌더링
4. 빈 값도 표시됨
```

---

## 주요 변경 사항 (원본 대비)

### 변경 전: Variant 시스템

```javascript
// 원본: 3가지 variant 지원
const StyledInput = styled(Input, config)('');
const StyledOutlinedInput = styled(OutlinedInput, config)('');
const StyledFilledInput = styled(FilledInput, config)('');

const InputComponent =
  input ||
  {
    standard: <StyledInput ... />,
    outlined: <StyledOutlinedInput ... />,
    filled: <StyledFilledInput ... />,
  }[variant];
```

### 변경 후: OutlinedInput 고정

```javascript
// 단순화: OutlinedInput만
const StyledOutlinedInput = OutlinedInput;
const InputComponent = <StyledOutlinedInput label={label} />;
const variant = 'outlined';
```

**원본과의 차이**:
- ❌ variant prop 제거 → outlined만
- ❌ StyledInput, StyledFilledInput 제거
- ❌ variant 선택 로직 제거
- ❌ FormControl에서 variant 가져오기 제거
- ❌ native 모드 제거 → SelectInput만
- ❌ input prop 제거 → OutlinedInput 고정
- ❌ 스타일 시스템 제거 (useUtilityClasses, composeClasses, clsx)
- ❌ FormControl 연결 제거 (useFormControl, formControlState)
- ❌ useDefaultProps 제거
- ✅ 핵심 기능 유지 → SelectInput 래핑

---

## 커밋 히스토리로 보는 단순화 과정

Select는 **7개의 커밋**을 통해 단순화되었습니다.

### 1단계: PropTypes 제거

- `34637cbd` - [Select 단순화 1/7] PropTypes 제거

**삭제된 코드**: 150줄의 PropTypes 정의

### 2단계: Variant 시스템 제거

- `9c68672f` - [Select 단순화 2/7] variant 시스템 제거 및 outlined 고정

**삭제된 코드**:
```javascript
const StyledInput = styled(Input, ...);
const StyledFilledInput = styled(FilledInput, ...);
const InputComponent = input || {
  standard: <StyledInput ... />,
  outlined: <StyledOutlinedInput ... />,
  filled: <StyledFilledInput ... />,
}[variant];
```

### 3단계: NativeSelect 모드 제거

- `8da4a4d3` - [Select 단순화 3/7] native 모드 제거

**삭제된 코드**:
```javascript
const inputComponent = native ? NativeSelectInput : SelectInput;
...(native ? { id } : { autoWidth, defaultOpen, ... })
```

### 4단계: input prop 커스터마이징 제거

- `a5cda6e3` - [Select 단순화 4/7] input prop 제거

**삭제된 코드**:
```javascript
const InputComponent = input || <StyledOutlinedInput ...>;
const inputComponentRef = useForkRef(ref, getReactElementRef(InputComponent));
...(input ? input.props.inputProps : {})
```

### 5단계: 스타일 시스템 제거

- `e2169faf` - [Select 단순화 5/7] 스타일 시스템 제거

**삭제된 코드**:
```javascript
import clsx from 'clsx';
import deepmerge from '@mui/utils/deepmerge';
import composeClasses from '@mui/utils/composeClasses';
import { getSelectUtilityClasses } from './selectClasses';
import { styled } from '../zero-styled';

const useUtilityClasses = (ownerState) => { ... };
const classes = useUtilityClasses(ownerState);
className: clsx(InputComponent.props.className, className, classes.root),
classes: inputProps ? deepmerge(restOfClasses, inputProps.classes) : restOfClasses,
```

### 6단계: FormControl 연결 제거

- `5819e40f` - [Select 단순화 6/7] FormControl 연결 제거

**삭제된 코드**:
```javascript
import useFormControl from '../../../form/FormControl/useFormControl';
import formControlState from '../../../form/FormControl/formControlState';

const muiFormControl = useFormControl();
const fcs = formControlState({ props, muiFormControl, states: ['variant', 'error'] });
const variant = fcs.variant || 'outlined';
error: fcs.error,
```

### 7단계: useDefaultProps 제거

- `38a201e2` - [Select 단순화 7/7] useDefaultProps 제거

**삭제된 코드**:
```javascript
import { useDefaultProps } from '../DefaultPropsProvider';

const props = useDefaultProps({ name: 'MuiSelect', props: inProps });
```

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 297줄 | 72줄 (76% 감소) |
| **Props 개수** | 23개 | 17개 |
| **Variant** | standard, outlined, filled | outlined만 |
| **Native 모드** | 지원 | 제거 |
| **Input 커스터마이징** | input prop | OutlinedInput 고정 |
| **FormControl 연결** | useFormControl, formControlState | 없음 |
| **스타일 시스템** | useUtilityClasses, composeClasses | 없음 |
| **styled-components** | 3개 styled 컴포넌트 | 제거 |
| **useDefaultProps** | 사용 | 안 함 |

---

## 학습 후 다음 단계

Select를 이해했다면:

1. **SelectInput** - 핵심 로직 구현
   - Menu와의 통합 방법
   - 오픈/닫힘 상태 관리
   - 다중 선택 구현

2. **OutlinedInput** - Form Input의 variant 구현
   - label 처리
   - notched prop

3. **InputBase** - 모든 Input의 기반
   - inputComponent 패턴 이해
   - FormControl과의 통합

**예시: 기본 사용**
```javascript
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

function SelectComponent() {
  const [age, setAge] = React.useState(10);

  const handleChange = (event) => {
    setAge(event.target.value);
  };

  return (
    <Select value={age} onChange={handleChange}>
      <MenuItem value={10}>Ten</MenuItem>
      <MenuItem value={20}>Twenty</MenuItem>
      <MenuItem value={30}>Thirty</MenuItem>
    </Select>
  );
}
```

**예시: Label과 displayEmpty**
```javascript
<Select label="Age" displayEmpty value={age}>
  <MenuItem value="">
    <em>None</em>
  </MenuItem>
  <MenuItem value={10}>Ten</MenuItem>
  <MenuItem value={20}>Twenty</MenuItem>
</Select>
```

**예시: 제어된 모드**
```javascript
const [open, setOpen] = React.useState(false);

<Select open={open} onOpen={() => setOpen(true)} onClose={() => setOpen(false)}>
  <MenuItem value={1}>Option 1</MenuItem>
</Select>
```

**예시: 다중 선택**
```javascript
const [values, setValues] = React.useState([]);

<Select
  multiple
  value={values}
  onChange={(e) => setValues(e.target.value)}
>
  <MenuItem value={1}>Option 1</MenuItem>
  <MenuItem value={2}>Option 2</MenuItem>
</Select>
```
