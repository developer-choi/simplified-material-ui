# InputBase 컴포넌트

> Material-UI의 모든 Input 컴포넌트의 기반이 되는 최소한의 입력 필드 컴포넌트

---

## 무슨 기능을 하는가?

수정된 InputBase는 **입력 필드의 핵심 동작(값 관리, 이벤트 처리, FormControl 연동)만 제공하는 기본 input 컴포넌트**입니다.

### 핵심 기능 (남은 것)
1. **Controlled/Uncontrolled 입력 관리** - value prop으로 제어하거나 내부 상태로 관리
2. **FormControl 상태 동기화** - 상위 FormControl의 disabled/error/focused 등의 상태를 자동으로 반영
3. **Multiline 지원** - TextareaAutosize와 통합하여 자동 높이 조절 textarea 제공
4. **Adornment 지원** - startAdornment/endAdornment로 아이콘 등을 양쪽에 배치
5. **기본 이벤트 처리** - onChange, onFocus, onBlur, onClick 등 표준 이벤트 핸들링

---

## 핵심 학습 포인트

### 1. Controlled vs Uncontrolled 패턴

```javascript
// Controlled: value prop으로 제어
<InputBase
  value={state}
  onChange={(e) => setState(e.target.value)}
/>

// Uncontrolled: defaultValue만 제공
<InputBase
  defaultValue="initial"
  inputRef={ref}
/>
```

**학습 가치**:
- React에서 폼 입력을 제어하는 두 가지 방식 이해
- Controlled 방식은 React 상태와 동기화, Uncontrolled는 DOM이 상태 관리
- `isControlled` 플래그로 어떤 모드인지 판단하여 동작 분기

### 2. FormControl Context 연동

```javascript
const muiFormControl = useFormControl();
const fcs = formControlState({
  props,
  muiFormControl,
  states: ['disabled', 'error', 'hiddenLabel', 'required', 'filled'],
});

// FormControl의 상태를 우선 적용
<InputComponent
  disabled={fcs.disabled}  // props.disabled || muiFormControl.disabled
  aria-invalid={fcs.error}
/>
```

**학습 가치**:
- Context API로 상위 컴포넌트(FormControl)와 상태 공유
- `formControlState` 유틸로 props와 context 상태를 병합
- TextField → FormControl → InputBase 계층에서 props 전파 방식 이해

### 3. Multiline 동적 컴포넌트 전환

```javascript
let InputComponent = inputComponent;  // 기본값 'input'
let inputProps = inputPropsProp;

if (multiline && InputComponent === 'input') {
  InputComponent = TextareaAutosize;
  inputProps = {
    type: undefined,
    maxRows,
    minRows,
    ...inputProps,
  };
}

return <InputComponent {...inputProps} />;
```

**학습 가치**:
- 런타임에 컴포넌트 타입을 동적으로 변경하는 패턴
- TextareaAutosize로 자동 높이 조절 구현
- `as` prop 대신 변수 할당으로 더 직관적인 컴포넌트 전환

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/mui-material/src/InputBase/InputBase.js (296줄, 원본 848줄)
InputBase (div)
  ├─> startAdornment (if provided)
  ├─> FormControlContext.Provider (value=null)
  │    └─> InputComponent (input or TextareaAutosize)
  ├─> endAdornment (if provided)
  └─> renderSuffix (if provided, for OutlinedInput compatibility)
```

### 2. Props (26개만 남음)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `value` | any | - | Controlled 모드: 입력 값 |
| `defaultValue` | any | - | Uncontrolled 모드: 초기 값 |
| `onChange` | function | - | 값 변경 시 호출 |
| `disabled` | boolean | false | 비활성화 상태 (FormControl에서 상속 가능) |
| `error` | boolean | false | 에러 상태 (FormControl에서 상속 가능) |
| `multiline` | boolean | false | textarea로 렌더링 여부 |
| `rows` | number/string | - | multiline 시 고정 행 수 |
| `minRows` | number/string | - | multiline 시 최소 행 수 |
| `maxRows` | number/string | - | multiline 시 최대 행 수 |
| `startAdornment` | node | - | 입력 필드 앞에 표시할 요소 |
| `endAdornment` | node | - | 입력 필드 뒤에 표시할 요소 |
| `placeholder` | string | - | placeholder 텍스트 |
| `type` | string | 'text' | input type (text, password 등) |
| `name` | string | - | input name 속성 |
| `id` | string | - | input id 속성 |
| `autoFocus` | boolean | - | 마운트 시 자동 포커스 |
| `autoComplete` | string | - | 자동완성 설정 |
| `readOnly` | boolean | - | 읽기 전용 모드 |
| `onFocus` | function | - | 포커스 시 호출 |
| `onBlur` | function | - | 블러 시 호출 |
| `onKeyDown` | function | - | 키 다운 시 호출 |
| `onKeyUp` | function | - | 키 업 시 호출 |
| `onClick` | function | - | 클릭 시 호출 |
| `inputRef` | ref | - | input 요소에 전달할 ref |
| `inputComponent` | elementType | 'input' | 사용할 input 컴포넌트 |
| `inputProps` | object | {} | input 요소에 전달할 추가 props |
| `className` | string | - | root 요소의 className |
| `renderSuffix` | function | - | OutlinedInput 호환성을 위한 suffix 렌더링 함수 |
| `aria-describedby` | string | - | 접근성을 위한 설명 요소 ID |

---

## 커밋 히스토리로 보는 단순화 과정

InputBase는 **10개의 커밋**을 통해 단순화되었습니다.

### 1단계: 레거시 Slot 시스템 제거
- `1d7db176` - [InputBase 단순화 1/10] components/componentsProps 레거시 Slot 제거

**왜 불필요한가**:
- **학습 목적**: `components`와 `componentsProps`는 deprecated된 구 API로, `slots`와 `slotProps`로 이미 대체됨
- **복잡도**: 두 가지 API를 동시 지원하면서 props 병합 로직(deepmerge)이 복잡해짐
- **일관성**: 다른 컴포넌트들도 레거시 API를 제거하는 추세

**삭제 내용**:
- `components` prop (components.Root, components.Input)
- `componentsProps` prop (componentsProps.root, componentsProps.input)
- fallback 체인 로직

### 2단계: Slot 시스템을 고정 구조로 단순화
- `e6a0fd8f` - [InputBase 단순화 2/10] slots/slotProps를 고정 구조로 단순화

**왜 불필요한가**:
- **학습 목적**: Slot 커스터마이징은 Material-UI 고급 기능으로, InputBase의 핵심인 "입력 필드 동작" 학습에 불필요
- **복잡도**: useSlot 훅, 동적 컴포넌트 선택, 슬롯별 props 병합 등 많은 추상화
- **대안**: 고정된 div + input 구조로 충분

**삭제 내용**:
- `slots` prop (slots.root, slots.input)
- `slotProps` prop (slotProps.root, slotProps.input)
- useSlot() 훅 및 동적 컴포넌트 선택 로직

### 3단계: color prop 제거
- `00a648fa` - [InputBase 단순화 3/10] color prop 제거

**왜 불필요한가**:
- **학습 목적**: FormControl에서 상속 가능한 값으로 InputBase 레벨에서 다룰 필요 없음
- **복잡도**: Theme palette에서 색상 매핑, ownerState.color 전파, 조건부 스타일 생성
- **현실**: FormControl 레벨에서 설정하는 것이 일반적

**삭제 내용**:
- `color` prop (primary, secondary, error, info, success, warning)
- formControlState에서 'color' 읽기
- ownerState.color 전파 및 color 기반 스타일

### 4단계: size prop 제거
- `f5c9a62b` - [InputBase 단순화 4/10] size prop 제거

**왜 불필요한가**:
- **학습 목적**: padding과 font-size는 CSS로 직접 제어 가능하며, FormControl에서도 상속 가능
- **복잡도**: Theme 기반 크기 매핑, size별 스타일 variants
- **현실**: 하나의 크기만 있어도 개념 이해에 충분

**삭제 내용**:
- `size` prop (small, medium)
- formControlState에서 'size' 읽기
- ownerState.size 전파 및 size 기반 스타일 variants

### 5단계: 레이아웃 Props 제거
- `a3f584d8` - [InputBase 단순화 5/10] margin/fullWidth 레이아웃 Props 제거

**왜 불필요한가**:
- **학습 목적**: 외부 레이아웃은 상위 컴포넌트에서 처리해야 함
- **복잡도**: 컴포넌트가 자신의 외부 간격까지 관리하는 것은 책임 과다
- **일관성**: Dialog 등 다른 단순화된 컴포넌트도 레이아웃 props 제거

**삭제 내용**:
- `margin` prop (dense, none)
- `fullWidth` prop
- 해당 스타일 variants

### 6단계: GlobalStyles 및 자동완성 스타일 제거
- `9ff3ff60` - [InputBase 단순화 6/10] GlobalStyles 및 자동완성 스타일 제거

**왜 불필요한가**:
- **학습 목적**: 브라우저 자동완성 스타일 제어는 부가 기능으로 InputBase의 핵심 동작과 무관
- **복잡도**: GlobalStyles 컴포넌트 주입, @keyframes 애니메이션 정의, 조건부 로직
- **현실**: 기본 브라우저 동작으로도 충분

**삭제 내용**:
- `disableInjectingGlobalStyles` prop
- InputGlobalStyles 컴포넌트
- @keyframes mui-auto-fill, mui-auto-fill-cancel
- GlobalStyles 조건부 렌더링
- handleAutoFill 함수

### 7단계: Theme 시스템 제거
- `fe55b6dd` - [InputBase 단순화 7/10] Theme 시스템 제거

**왜 불필요한가**:
- **학습 목적**: Theme 커스터마이징은 Material-UI 전체 시스템의 주제로, InputBase 학습에는 과함
- **복잡도**: useDefaultProps, useUtilityClasses, composeClasses, memoTheme 등 많은 추상화
- **대안**: Props 기본값과 간단한 스타일로 충분

**삭제 내용**:
- `useDefaultProps` 호출
- `useUtilityClasses` 함수 전체
- `composeClasses` 사용
- `memoTheme` 래퍼
- `inputBaseClasses`, `getInputBaseUtilityClass` import
- `classes` prop
- 동적 클래스명 생성 로직

### 8단계: Styled Components를 인라인 스타일로 전환
- `11c8ec81` - [InputBase 단순화 8/10] Styled Components를 인라인 스타일로 전환

**왜 불필요한가**:
- **학습 목적**: styled() API는 CSS-in-JS 라이브러리 주제로, 인라인 스타일로도 시각적 피드백 가능
- **복잡도**: styled() API, ownerState 생성/전파, shouldForwardProp, overridesResolver, variants
- **대안**: 간단한 인라인 style 객체

**삭제 내용**:
- `InputBaseRoot = styled('div', { ... })` - 일반 div로 대체
- `InputBaseInput = styled('input', { ... })` - InputComponent로 대체
- `ownerState` 객체 생성
- `rootOverridesResolver`, `inputOverridesResolver`
- Theme 기반 동적 스타일 → 하드코딩된 인라인 스타일

**변경 내용**:
```javascript
// Before (styled components)
<InputBaseRoot ownerState={ownerState} />

// After (inline styles)
const rootStyle = {
  lineHeight: '1.4375em',
  boxSizing: 'border-box',
  position: 'relative',
  cursor: fcs.disabled ? 'default' : 'text',
  display: 'inline-flex',
  alignItems: 'center',
  ...(multiline && { padding: '4px 0 5px' }),
};
<div style={rootStyle} />
```

### 9단계: 복잡한 Ref 병합 단순화
- `2ee5b2fe` - [InputBase 단순화 9/10] 복잡한 Ref 병합 단순화

**왜 불필요한가**:
- **학습 목적**: Ref 병합은 React 고급 패턴으로, 단일 ref 포워딩만으로도 충분
- **복잡도**: useForkRef로 여러 ref 병합, handleInputRefWarning 검증
- **대안**: 하나의 inputRef만 사용

**삭제 내용**:
- `useForkRef(inputRef, inputRefProp, inputPropsProp.ref, handleInputRefWarning)`
- `handleInputRefWarning` 콜백
- 복잡한 ref 병합 로직

**변경 내용**:
```javascript
// Before
const inputRef = React.useRef();
const handleInputRef = useForkRef(
  inputRef, inputRefProp, inputPropsProp.ref, handleInputRefWarning
);

// After
const inputRef = inputRefProp || React.useRef();
```

### 10단계: PropTypes 제거
- `f615bab2` - [InputBase 단순화 10/10] PropTypes 제거

**왜 불필요한가**:
- **학습 목적**: PropTypes는 타입 검증 도구이지 컴포넌트 로직이 아님
- **복잡도**: 154줄의 PropTypes 정의 및 JSDoc 주석
- **대안**: TypeScript나 코드 리뷰로 대체 가능

**삭제 내용**:
- `InputBase.propTypes = { ... }` 전체 (154줄)
- `prop-types` import
- `elementTypeAcceptingRef`, `refType` import

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 848줄 | 296줄 (65% 감소) |
| **Props 개수** | 40+개 | 26개 |
| **Slot 시스템** | ✅ components, componentsProps, slots, slotProps | ❌ 고정 구조 |
| **Theme 통합** | ✅ useDefaultProps, useUtilityClasses, memoTheme | ❌ 제거 |
| **스타일링** | ✅ Styled Components | ❌ 인라인 스타일 |
| **GlobalStyles** | ✅ 자동완성 스타일 제어 | ❌ 제거 |
| **Ref 병합** | ✅ useForkRef로 다중 ref 병합 | ❌ 단일 ref |
| **PropTypes** | ✅ 154줄 | ❌ 제거 |
| **color prop** | ✅ primary, secondary, error 등 | ❌ 제거 |
| **size prop** | ✅ small, medium | ❌ 제거 |
| **margin prop** | ✅ dense, none | ❌ 제거 |
| **fullWidth prop** | ✅ | ❌ 제거 |

---

## 학습 후 다음 단계

InputBase를 이해했다면:

1. **Input / FilledInput / OutlinedInput** - InputBase를 기반으로 한 구체적인 스타일 변형들
2. **TextField** - FormControl + InputLabel + Input(또는 variants) 조합
3. **FormControl** - 상위 컴포넌트로 여러 폼 요소의 상태 관리
4. **실전 응용** - 커스텀 Input 컴포넌트 만들기

**예시: 기본 사용**
```javascript
import InputBase from './InputBase';

function BasicInput() {
  const [value, setValue] = React.useState('');

  return (
    <InputBase
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Enter text..."
    />
  );
}
```

**예시: Adornment 활용**
```javascript
import InputBase from './InputBase';
import SearchIcon from '@mui/icons-material/Search';

function SearchInput() {
  return (
    <InputBase
      placeholder="Search..."
      startAdornment={<SearchIcon />}
    />
  );
}
```

**예시: FormControl과 함께**
```javascript
import FormControl from '../FormControl';
import InputLabel from '../InputLabel';
import InputBase from './InputBase';

function ControlledInput() {
  return (
    <FormControl error disabled>
      <InputLabel>Email</InputLabel>
      <InputBase placeholder="email@example.com" />
    </FormControl>
  );
}
```

**예시: Multiline (Textarea)**
```javascript
import InputBase from './InputBase';

function MultilineInput() {
  return (
    <InputBase
      multiline
      minRows={3}
      maxRows={10}
      placeholder="Enter long text..."
    />
  );
}
```
