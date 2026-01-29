# NativeSelect 컴포넌트

> Material-UI의 NativeSelect 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

NativeSelect는 **NativeSelectInput을 감싸는 API 래퍼 컴포넌트**로, `<Select native />`의 가벼운 대안입니다.

> **💡 작성 주의**: NativeSelect 자체가 하는 일만 작성하세요. NativeSelectInput이나 FormControl의 기능은 제외

### 핵심 기능
1. **Input 컴포넌트와 통합** - Input, FilledInput, OutlinedInput을 감싸서 select로 변환
2. **FormControl과 연결** - 폼 상태 관리 통합
3. **기본값 제공** - IconComponent, input 등의 기본값 설정

---

## 내부 구조

### 1. 컴포넌트 계층 (렌더링 구조)

```javascript
// 위치: packages/mui-material/src/NativeSelect/NativeSelect.js (136줄)

NativeSelect
  └─> Fragment
       └─> {React.cloneElement(input, {
            inputComponent: NativeSelectInput,
            inputProps: {...},
            ...
          })}
            └─> Input (기본값)
                 └─> NativeSelectInput (inputComponent으로 교체)
                      └─> <select>
                           └─> {children} // <option> 엘리먼트들
```

### 2. 하위 컴포넌트가 담당하는 기능

- **Input 컴포넌트** (기본값) - FormInput의 기반 구조 제공 (wrapper, label 등)
- **NativeSelectInput** - 실제 `<select>` 엘리먼트와 드롭다운 아이콘 렌더링

### 3. React.cloneElement 패턴

**역할**: Input 컴포넌트의 내부를 NativeSelectInput으로 교체

```javascript
const defaultInput = <Input />;

const NativeSelect = React.forwardRef(function NativeSelect(inProps, ref) {
  const props = useDefaultProps({ name: 'MuiNativeSelect', props: inProps });

  const {
    className,
    children,
    classes: classesProp = {},
    IconComponent = ArrowDropDownIcon,
    input = defaultInput, // 기본값: <Input />
    inputProps,
    variant,
    ...other
  } = props;

  // FormControl과 연결
  const muiFormControl = useFormControl();
  const fcs = formControlState({
    props,
    muiFormControl,
    states: ['variant'],
  });

  return (
    <React.Fragment>
      {React.cloneElement(input, {
        inputComponent: NativeSelectInput, // Input 내부를 select로 교체
        inputProps: {
          children,
          classes: otherClasses,
          IconComponent,
          variant: fcs.variant,
          type: undefined,
          ...inputProps,
          ...(input ? input.props.inputProps : {}), // input의 기존 inputProps 병합
        },
        ref,
        ...other,
        className: clsx(classes.root, input.props.className, className),
      })}
    </React.Fragment>
  );
});
```

**핵심 포인트**:
- **inputComponent**: Input 컴포넌트 내부에서 렌더링할 컴포넌트를 지정 (InputBase 기능)
- **inputProps**: inputComponent(NativeSelectInput)에 전달할 props
- **props 병합**: `inputProps` + `input.props.inputProps` (기존 값 우선)

### 4. FormControl 연결

**역할**: FormControl Context를 통해 variant 상태 전달받기

```javascript
const muiFormControl = useFormControl(); // FormControl Context 구독
const fcs = formControlState({
  props,
  muiFormControl,
  states: ['variant'], // variant 상태만 가져옴
});

// fcs.variant: FormControl의 variant 또는 props.variant
```

**왜 필요한가?**:
- `<FormControl variant="outlined">` 안에서 `<NativeSelect />`를 쓰면
- NativeSelect는 props.variant가 없어도 fcs.variant로 'outlined'를 받음

### 5. useUtilityClasses (단순한 버전)

**역할**: root 클래스만 생성 (다른 컴포넌트보다 훨씬 단순)

```javascript
const useUtilityClasses = (ownerState) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
  };

  return composeClasses(slots, getNativeSelectUtilityClasses, classes);
};
```

**왜 이렇게 단순한가?**:
- NativeSelect는 실제 스타일링을 Input 컴포넌트에 위임
- NativeSelect 자체는 래퍼 역할만 하므로 root 클래스만 필요

### 6. classes 분리

```javascript
const { root, ...otherClasses } = classesProp;

// root: NativeSelect의 root 클래스
// otherClasses: NativeSelectInput에 전달할 클래스 (select, icon 등)
```

**왜 분리하는가?**:
- `classes.root`는 NativeSelect 자체에 적용
- `classes.select`, `classes.icon` 등은 NativeSelectInput으로 전달

### 7. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | node | - | `<option>` 엘리먼트들 |
| `classes` | object | {} | 커스텀 CSS 클래스 오버라이드 |
| `className` | string | - | 루트 엘리먼트의 클래스 이름 |
| `IconComponent` | elementType | ArrowDropDownIcon | 드롭다운 아이콘 컴포넌트 |
| `input` | element | `<Input />` | 감쌀 Input 컴포넌트 |
| `inputProps` | object | - | select 엘리먼트에 전달할 속성들 |
| `onChange` | func | - | 선택 변경 이벤트 핸들러 |
| `sx` | prop | - | 시스템 prop (스타일 오버라이드) |
| `value` | any | - | 선택된 값 |
| `variant` | 'filled' \| 'outlined' \| 'standard' | - | 스타일 변형 (FormControl에서 우선) |

---

## 설계 패턴

1. **Clone Element 패턴**
   - `React.cloneElement(input, {...})`로 Input 컴포넌트의 props를 수정
   - Input의 내부 구현을 NativeSelectInput으로 교체 (`inputComponent`)

2. **제어 역전 (Inversion of Control)**
   - NativeSelect는 Input을 직접 렌더링하지 않고
   - 사용자가 `input={<FilledInput />}`으로 커스터마이징 가능

3. **Context 통합**
   - `useFormControl()`으로 FormControl Context 구독
   - `formControlState()`로 필요한 상태(variant)만 추출

4. **Props 위임 (Props Delegation)**
   - 대부분의 props를 input으로 전달 (`...other`)
   - 일부 props는 inputProps로 변환 (`IconComponent`, `children`)

5. **useDefaultProps 패턴** (MUI v5)
   - `useDefaultProps({ name: 'MuiNativeSelect', props })`로
   - 테마의 defaultProps와 병합

---

## 복잡도의 이유

NativeSelect는 **136줄**이며, 복잡한 이유는:

1. **React.cloneElement** - Input 컴포넌트의 props를 동적으로 수정
2. **inputProps 병합 로직** - 여러 소스의 inputProps를 병합 (58-66줄)
3. **FormControl 연결** - useFormControl, formControlState로 Context 통합
4. **classes 분리** - root와 otherClasses로 분리해서 각각 전달
5. **useDefaultProps** - MUI v5의 defaultProps 시스템

---

## 비교: NativeSelect vs Select (native prop)

| 기능 | NativeSelect | Select native={true} |
|------|-------------|---------------------|
| 번들 사이즈 | 작음 (Menu 의존 없음) | 큼 (Select 전체 포함) |
| API | 별도 컴포넌트 | Select의 prop |
| Input 통합 | 자동 (기본 Input) | 자동 (기본 Input) |
| FormControl | 통합됨 | 통합됨 |
| 용도 | 네이티브 select만 필요할 때 | Menu와 선택 가능 |

**핵심 차이**:
- NativeSelect: 독립 컴포넌트로 더 작은 번들
- Select native={true}: Select 컴포넌트의 prop으로 더 큰 번들

**공식 문서 권장**:
> "If you don't need the extra features of the Select component, consider using the NativeSelect component for a smaller bundle size."
