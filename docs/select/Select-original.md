# Select 컴포넌트

> Material-UI의 Select 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

Select는 **SelectInput을 감싸고 variant별 Input 컴포넌트와 통합하는 API 래퍼 컴포넌트**입니다.

> **💡 작성 주의**: Select 자체가 하는 일만 작성하세요. SelectInput이나 Input의 내부 동작은 제외

### 핵심 기능
1. **Variant별 Input 선택** - standard, outlined, filled에 따라 다른 Input 컴포넌트 사용
2. **NativeSelect 모드 지원** - native prop으로 네이티브 select 사용 가능
3. **FormControl과 통합** - Context를 통해 variant, error 상태 전달받음
4. **Input 컴포넌트 커스터마이징** - input prop으로 사용자 정의 Input 가능

---

## 내부 구조

### 1. 컴포넌트 계층 (렌더링 구조)

```javascript
// 위치: packages/mui-material/src/Select/Select.js (297줄)

Select
  └─> Fragment
       └─> {React.cloneElement(InputComponent, {
            inputComponent: SelectInput | NativeSelectInput,
            inputProps: {...},
            ...
          })}
            └─> Input | OutlinedInput | FilledInput
                 └─> SelectInput (또는 NativeSelectInput)
                      ├─> Menu (SelectInput의 드롭다운)
                      └─> IconComponent
```

### 2. Styled Input 컴포넌트

**역할**: variant별로 스타일이 적용된 Input 컴포넌트 생성

```javascript
const styledRootConfig = {
  name: 'MuiSelect',
  slot: 'Root',
  shouldForwardProp: (prop) => rootShouldForwardProp(prop) && prop !== 'variant',
};

const StyledInput = styled(Input, styledRootConfig)('');
const StyledOutlinedInput = styled(OutlinedInput, styledRootConfig)('');
const StyledFilledInput = styled(FilledInput, styledRootConfig)('');
```

**핵심 포인트**:
- **slot: 'Root'**: 테마 오버라이드용 슬롯 이름
- **shouldForwardProp**: variant prop을 DOM에 전달하지 않음
- **빈 문자열** (''): styled()의 두 번째 인자로 스타일 없이 래핑만 수행

### 3. InputComponent 선택 로직

**역할**: variant와 input prop에 따라 사용할 Input 컴포넌트 결정

```javascript
const InputComponent =
  input ||
  {
    standard: <StyledInput ownerState={ownerState} />,
    outlined: <StyledOutlinedInput label={label} ownerState={ownerState} />,
    filled: <StyledFilledInput ownerState={ownerState} />,
  }[variant];
```

**핵심 포인트**:
- **input prop 우선**: 사용자가 커스텀 Input을 제공하면 그것을 사용
- **variant 기본값**: standard, outlined, filled 중 하나로 결정
- **label 전달**: OutlinedInput일 경우만 label prop 전달

### 4. inputComponent 분기

**역할**: native prop에 따라 SelectInput 또는 NativeSelectInput 선택

```javascript
const inputComponent = native ? NativeSelectInput : SelectInput;
```

**핵심 포인트**:
- **native=false** (기본): SelectInput 사용 (Menu 기반 드롭다운)
- **native=true**: NativeSelectInput 사용 (네이티브 select)

### 5. FormControl 연결

**역할**: FormControl Context에서 variant, error 상태 가져오기

```javascript
const muiFormControl = useFormControl();
const fcs = formControlState({
  props,
  muiFormControl,
  states: ['variant', 'error'],
});

const variant = fcs.variant || variantProp;
```

**핵심 포인트**:
- **useFormControl**: FormControl Context 구독
- **formControlState**: 필요한 상태(variant, error)만 추출
- **우선순위**: FormControl의 variant > props의 variant

### 6. inputProps 병합 로직

**역할**: 여러 소스의 inputProps를 병합

```javascript
inputProps: {
  children,
  error: fcs.error,
  IconComponent,
  variant,
  type: undefined,
  multiple,
  ...(native
    ? { id }  // native 모드 props
    : {       // SelectInput 모드 props
        autoWidth,
        defaultOpen,
        displayEmpty,
        labelId,
        MenuProps,
        onClose,
        onOpen,
        open,
        renderValue,
        SelectDisplayProps: { id, ...SelectDisplayProps },
      }
  ),
  ...inputProps,
  classes: inputProps ? deepmerge(restOfClasses, inputProps.classes) : restOfClasses,
  ...(input ? input.props.inputProps : {}),
},
```

**핵심 포인트**:
- **조건부 props**: native 여부에 따라 다른 props 전달
- **deepmerge**: inputProps.classes를 깊은 병합 ( shallow spread 연산자는 덮어씀)
- **우선순위**: input.props.inputProps > inputProps > 명시적 props

### 7. React.cloneElement 패턴

**역할**: Input 컴포넌트의 props를 동적으로 수정

```javascript
{React.cloneElement(InputComponent, {
  inputComponent,
  inputProps: {...},
  ...(((multiple && native) || displayEmpty) && variant === 'outlined'
    ? { notched: true }
    : {}),
  ref: inputComponentRef,
  className: clsx(InputComponent.props.className, className, classes.root),
  ...(!input && { variant }),
  ...other,
})}
```

**핵심 포인트**:
- **notched**: multiple+native 또는 displayEmpty이고 outlined일 때 true
- **className 병합**: Input의 className + 사용자 className + classes.root
- **variant 전달**: 커스텀 input이 없을 때만 variant 전달

### 8. ref 병합

**역할**: 사용자 ref와 Input의 ref를 병합

```javascript
const inputComponentRef = useForkRef(ref, getReactElementRef(InputComponent));
```

**핵심 포인트**:
- **useForkRef**: 두 ref를 병합하여 양쪽 모두 업데이트
- **getReactElementRef**: Input 컴포넌트(Element)에서 ref 추출

### 9. useUtilityClasses

**역할**: root 클래스 생성

```javascript
const useUtilityClasses = (ownerState) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
  };

  const composedClasses = composeClasses(slots, getSelectUtilityClasses, classes);

  return { ...classes, ...composedClasses };
};
```

**핵심 포인트**:
- **단순한 구조**: root 슬롯만 있음 (NativeSelect보다 단순)
- **병합**: 사용자 classes + 기본 classes

### 10. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `autoWidth` | bool | false | 드롭다운 너비 자동 조정 |
| `children` | node | - | MenuItem 또는 option 엘리먼트들 |
| `classes` | object | {} | 커스텀 CSS 클래스 |
| `className` | string | - | 루트 엘리먼트의 클래스 |
| `defaultOpen` | bool | false | 초기 열림 상태 |
| `defaultValue` | any | - | 제어되지 않은 모드의 기본값 |
| `displayEmpty` | bool | false | 빈 값 표시 |
| `IconComponent` | elementType | ArrowDropDownIcon | 드롭다운 아이콘 |
| `id` | string | - | select 엘리먼트의 ID |
| `input` | element | - | 커스텀 Input 컴포넌트 |
| `inputProps` | object | - | input 엘리먼트에 전달할 속성 |
| `label` | node | - | Label (outlined variant용) |
| `labelId` | string | - | 추가 label의 ID |
| `MenuProps` | object | - | Menu 컴포넌트에 전달할 props |
| `multiple` | bool | false | 다중 선택 |
| `native` | bool | false | 네이티브 select 사용 |
| `onChange` | func | - | 값 변경 이벤트 핸들러 |
| `onClose` | func | - | 닫힘 이벤트 핸들러 |
| `onOpen` | func | - | 열림 이벤트 핸들러 |
| `open` | bool | - | 제어된 모드의 열림 상태 |
| `renderValue` | func | - | 선택된 값 렌더링 함수 |
| `SelectDisplayProps` | object | - | 디스플레이 영역에 전달할 props |
| `sx` | prop | - | 시스템 prop (스타일 오버라이드) |
| `value` | any | - | 선택된 값 |
| `variant` | 'filled' \| 'outlined' \| 'standard' | 'outlined' | 스타일 변형 |

---

## 설계 패턴

1. **Clone Element 패턴**
   - `React.cloneElement(InputComponent, {...})`로 Input의 props 수정
   - Input의 내부 구현체(inputComponent)를 교체

2. **Polymorphic Component** (입력)
   - `input` prop으로 사용자 정의 Input 가능
   - `inputComponent`로 내부 구현체 선택 (SelectInput/NativeSelectInput)

3. **제어 역전 (Inversion of Control)**
   - Select는 Input을 직접 렌더링하지 않음
   - 사용자가 `input={<OutlinedInput />}`으로 커스터마이징

4. **Context 통합**
   - `useFormControl()`으로 FormControl Context 구독
   - `formControlState()`로 필요한 상태 추출

5. **다중 레이어 병합**
   - inputProps: 3단계 병합 (input.props.inputProps > inputProps > 명시적)
   - className: 3가지 소스 병합 (Input + 사용자 + classes.root)
   - ref: 2개 ref 병합 (사용자 ref + Input ref)

6. **Styled Components 래핑**
   - 기존 Input을 styled()로 래핑하여 MUI 슬롯 시스템 연결

---

## 복잡도의 이유

Select는 **297줄**이며, 복잡한 이유는:

1. **Variant 시스템** - 3가지 variant × 3개 styled 컴포넌트
2. **NativeSelect 모드** - native prop에 따른 조건부 분기
3. **Input 커스터마이징** - input prop 처리 및 병합 로직
4. **React.cloneElement** - Input의 props를 동적으로 수정
5. **FormControl 연결** - Context 구독 및 상태 추출
6. **다중 레이어 병합** - inputProps, className, ref 3단계 병합
7. **스타일 시스템** - useUtilityClasses, composeClasses, deepmerge

---

## 비교: Select vs NativeSelect

| 항목 | Select | NativeSelect |
|------|--------|--------------|
| 기반 | SelectInput + Menu | NativeSelectInput |
| 드롭다운 | Material-UI Menu | 브라우저 네이티브 |
| 번들 | 큼 (Menu 의존) | 작음 |
| variant | standard, outlined, filled | standard, outlined, filled |
| native 모드 | native prop으로 지원 | 항상 네이티브 |
| 아이콘 | IconComponent 커스터마이징 | IconComponent 커스터마이징 |
| 용도 | 풍부한 UI | 가벼운 번들 |

**핵심 차이**:
- Select: Menu 기반 커스텀 드롭다운 (풍부한 UI, 무거움)
- NativeSelect: 네이티브 select (가벼움, 단순)

**공식 문서 권장**:
> "If you don't need the extra features of the Select component, consider using the NativeSelect component for a smaller bundle size."
