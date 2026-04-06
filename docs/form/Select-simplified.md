# Select 컴포넌트

> SelectInput을 OutlinedInput으로 감싸는 래퍼 컴포넌트

---

## 이 문서의 목적

**이 문서는 단순화된 코드의 "설명서"입니다.**

원본 Select는 복잡한 variant 시스템, FormControl 통합, React.cloneElement 패턴을 가지고 있었습니다.
단순화된 버전은 OutlinedInput에 inputComponent로 SelectInput을 직접 전달하는 명확한 구조를 보여줍니다.

---

## 간소화 전/후 비교

| 항목 | 원본 | 단순화 |
|------|------|--------|
| **줄 수** | 297줄 | 56줄 (81% 감소) |
| **Props 개수** | 23개 | 17개 |
| **Variant** | standard, outlined, filled | outlined만 |
| **Native 모드** | 지원 | 제거 |
| **Input 커스터마이징** | input prop | OutlinedInput 고정 |
| **FormControl 연결** | useFormControl, formControlState | 없음 |
| **스타일 시스템** | useUtilityClasses, composeClasses, styled | 없음 |
| **React.cloneElement** | 사용 | 직접 JSX |
| **forwardRef** | 사용 | 제거 |
| **useDefaultProps** | 사용 | 제거 |
| **muiName** | 사용 | 제거 |

---

## 최종 코드 구조

```javascript
// 위치: packages/form/Select/Select.js (56줄, 원본 297줄)

function Select(props) {
  const {
    autoWidth = false, children, defaultOpen = false, displayEmpty = false,
    IconComponent = ArrowDropDownIcon, id, inputProps, label, labelId,
    MenuProps, multiple = false, onClose, onOpen, open,
    renderValue, SelectDisplayProps, ...other
  } = props;

  return (
    <OutlinedInput
      label={label}
      inputComponent={SelectInput}
      inputProps={{
        children, IconComponent, variant: 'outlined', type: undefined,
        multiple, autoWidth, defaultOpen, displayEmpty, labelId,
        MenuProps, onClose, onOpen, open, renderValue,
        SelectDisplayProps: { id, ...SelectDisplayProps },
        ...inputProps,
      }}
      {...(displayEmpty ? { notched: true } : {})}
      {...other}
    />
  );
}
```

### 렌더링 구조

```
Select
  └─> OutlinedInput (label, inputComponent, inputProps)
       └─> SelectInput (inputComponent로 교체됨)
            ├─> div (선택된 값 표시)
            ├─> input (숨겨진 input)
            ├─> IconComponent
            └─> Menu (드롭다운)
                 └─> MenuItem들
```

---

## 핵심 학습 포인트

### 1. inputComponent 패턴 — 내부 input 교체

```javascript
<OutlinedInput
  inputComponent={SelectInput}   // <input> 대신 SelectInput을 렌더링
  inputProps={{ children, ... }} // SelectInput에 전달할 props
/>
```

- OutlinedInput은 내부적으로 `<input>` 엘리먼트를 렌더링
- `inputComponent`를 지정하면 그 컴포넌트로 교체됨
- SelectInput이 `<input>` 자리에서 실제 드롭다운 UI 담당

**InputBase 내부 동작 (개념)**:
```javascript
function InputBase({ inputComponent, inputProps, ...props }) {
  return (
    <div {...props}>
      {React.createElement(inputComponent, inputProps)}
    </div>
  );
}
```

### 2. cloneElement → 직접 JSX (단순화 과정에서 변환)

```javascript
// 원본: cloneElement 패턴
const InputComponent = <StyledOutlinedInput label={label} />;
return React.cloneElement(InputComponent, { inputComponent: SelectInput, ... });

// 단순화: 직접 JSX
return <OutlinedInput label={label} inputComponent={SelectInput} inputProps={{...}} />;
```

- `React.cloneElement`는 기존 React 엘리먼트에 props를 추가하는 API
- 직접 JSX로 쓰는 것이 훨씬 명확함
- 원본이 cloneElement를 쓴 이유: variant별 InputComponent를 동적으로 선택한 뒤 props를 추가해야 했기 때문

### 3. displayEmpty → notched 연동

```javascript
{...(displayEmpty ? { notched: true } : {})}
```

- `displayEmpty=true` → 빈 값일 때도 OutlinedInput의 레이블 notch를 열어둠
- `notched` prop은 label이 위로 올라간 상태(레이블 notch 열림)를 강제

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

## Props

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

---

## 동작 흐름

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
│ OutlinedInput 직접 렌더링        │
│  - inputComponent: SelectInput   │
│  - inputProps: {...}            │
│  - notched: displayEmpty? true │
└─────────────────────────────────┘
        ↓
┌─────────────────────────────────┐
│ OutlinedInput 내부              │
│  - SelectInput 렌더링            │
│  - label 처리                    │
└─────────────────────────────────┘
```

---

## 커밋 히스토리로 보는 단순화 과정

Select는 **2차에 걸쳐 총 10개 커밋**으로 단순화되었습니다.

### 1차 단순화 (7커밋) — 외부 복잡성 제거

| 커밋 | 단계 | 제거 대상 |
|------|------|-----------|
| `34637cbd` | 1/7 | PropTypes (150줄) |
| `9c68672f` | 2/7 | variant 시스템 → outlined 고정 |
| `8da4a4d3` | 3/7 | native 모드 (NativeSelectInput) |
| `a5cda6e3` | 4/7 | input prop 커스터마이징 |
| `e2169faf` | 5/7 | 스타일 시스템 (styled, composeClasses, clsx) |
| `5819e40f` | 6/7 | FormControl 연결 (useFormControl, formControlState) |
| `38a201e2` | 7/7 | useDefaultProps |

**결과**: 297줄 → 72줄. variant/native/스타일/FormControl 등 외부 연동 코드 제거. React.cloneElement 패턴은 유지.

### 2차 단순화 (3커밋) — 내부 복잡성 제거

| 커밋 | 단계 | 제거 대상 |
|------|------|-----------|
| `26fd8889` | 1/3 | forwardRef, muiName 제거, cloneElement → 직접 JSX |
| `b2d1aa66` | 2/3 | forwardRef, useForkRef, useImperativeHandle, inputRefProp (SelectInput) |
| `f3898559` | 3/3 | labelId DOM 이벤트, className, `delete other['aria-invalid']` (SelectInput) |

**결과**: 72줄 → 56줄 (Select.js), 464줄 → 417줄 (SelectInput.js). cloneElement를 직접 JSX로 변환하고 ref 시스템 간소화.

---

## 사용 예시

**기본 사용**
```javascript
<Select value={age} onChange={handleChange}>
  <MenuItem value={10}>Ten</MenuItem>
  <MenuItem value={20}>Twenty</MenuItem>
  <MenuItem value={30}>Thirty</MenuItem>
</Select>
```

**Label과 displayEmpty**
```javascript
<Select label="Age" displayEmpty value="">
  <MenuItem value="">
    <em>None</em>
  </MenuItem>
  <MenuItem value={10}>Ten</MenuItem>
</Select>
```

**제어된 모드**
```javascript
const [open, setOpen] = React.useState(false);

<Select open={open} onOpen={() => setOpen(true)} onClose={() => setOpen(false)}>
  <MenuItem value={1}>Option 1</MenuItem>
</Select>
```

**다중 선택**
```javascript
<Select multiple value={values} onChange={(e) => setValues(e.target.value)}>
  <MenuItem value={1}>Option 1</MenuItem>
  <MenuItem value={2}>Option 2</MenuItem>
</Select>
```

---

## 학습 후 다음 단계

Select를 이해했다면:

1. **SelectInput** - 핵심 로직 구현 (Menu 통합, 상태 관리, 다중 선택)
2. **OutlinedInput** - Form Input의 variant 구현 (label, notched)
3. **InputBase** - 모든 Input의 기반 (inputComponent 패턴)
