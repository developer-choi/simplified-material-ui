# Radio 컴포넌트

> Material-UI의 Radio를 최소한의 기능만 남겨 단순화한 학습용 버전

---

## 무슨 기능을 하는가?

수정된 Radio는 **RadioGroup 내에서 하나의 옵션을 선택할 수 있는 입력 컴포넌트**입니다.

### 핵심 기능 (남은 것)
1. **선택 상태 관리** - checked prop으로 선택 여부 제어
2. **RadioGroup 통합** - RadioGroup과 함께 사용 시 자동으로 name, checked 값 동기화
3. **FormControl 통합** - FormControl 내부에서 disabled 상태 자동 상속
4. **값 비교** - RadioGroup의 value와 Radio의 value를 비교하여 checked 상태 결정

---

## 핵심 학습 포인트

### 1. RadioGroup과의 통합

```javascript
// 위치: packages/mui-material/src/Radio/Radio.js (40-53줄)
const radioGroup = useRadioGroup();

let checked = checkedProp;
const onChange = createChainedFunction(onChangeProp, radioGroup && radioGroup.onChange);
let name = nameProp;

if (radioGroup) {
  if (typeof checked === 'undefined') {
    checked = areEqualValues(radioGroup.value, props.value);
  }
  if (typeof name === 'undefined') {
    name = radioGroup.name;
  }
}
```

**학습 가치**:
- **Context API 활용**: `useRadioGroup()` 훅으로 부모 RadioGroup의 상태에 접근
- **자동 동기화**: RadioGroup 내부에 있으면 name, checked 값을 자동으로 설정
- **이벤트 체이닝**: `createChainedFunction`으로 Radio의 onChange와 RadioGroup의 onChange를 순차 실행
- **값 비교**: `areEqualValues` 함수로 문자열/객체/숫자 등 다양한 타입의 값 비교

### 2. FormControl 통합

```javascript
// 위치: packages/mui-material/src/Radio/Radio.js (28-38줄)
const muiFormControl = useFormControl();

let disabled = disabledProp;

if (muiFormControl) {
  if (typeof disabled === 'undefined') {
    disabled = muiFormControl.disabled;
  }
}

disabled ??= false;
```

**학습 가치**:
- **상태 상속**: FormControl의 disabled 상태를 자동으로 상속
- **우선순위**: 명시적으로 전달된 `disabled` prop이 FormControl보다 우선
- **Nullish Coalescing**: `??=` 연산자로 undefined/null인 경우만 기본값 설정

### 3. 값 비교 로직

```javascript
// 위치: packages/mui-material/src/Radio/Radio.js (9-16줄)
function areEqualValues(a, b) {
  if (typeof b === 'object' && b !== null) {
    return a === b;
  }

  // The value could be a number, the DOM will stringify it anyway.
  return String(a) === String(b);
}
```

**학습 가치**:
- **타입 안전성**: 객체는 참조 비교, 원시값은 문자열로 변환하여 비교
- **DOM 호환성**: input의 value는 문자열로 변환되므로 숫자도 문자열로 비교
- **엣지케이스 처리**: null 체크로 안전한 타입 검사

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/mui-material/src/Radio/Radio.js (72줄, 원본 331줄)
Radio (forwardRef)
  └─> SwitchBase
       ├─> RadioButtonIcon (unchecked)
       └─> RadioButtonIcon (checked)
```

### 2. 주요 변경된 로직

#### Slot 시스템 제거
> **💡 원본과의 차이**:
> - ❌ `slots` prop 제거 → SwitchBase 고정
> - ❌ `slotProps` prop 제거 → 커스터마이징 불가
> - ❌ `useSlot()` 훅 제거 → 간단한 구조

#### 색상/크기 고정
> **💡 원본과의 차이**:
> - ❌ `color` prop 제거 → 'primary' 고정
> - ❌ `size` prop 제거 → 'medium' 고정
> - ❌ 동적 색상 생성 제거 → 단순한 스타일

#### 아이콘 고정
> **💡 원본과의 차이**:
> - ❌ `icon` prop 제거 → RadioButtonIcon 고정
> - ❌ `checkedIcon` prop 제거 → RadioButtonIcon checked 고정

#### Ripple 항상 활성화
> **💡 원본과의 차이**:
> - ❌ `disableRipple` prop 제거 → 항상 Ripple 효과 활성화

#### Theme 시스템 제거
> **💡 원본과의 차이**:
> - ❌ `useDefaultProps()` 제거 → 함수 파라미터 직접 사용
> - ❌ `useUtilityClasses()` 제거 → 클래스 이름 단순화
> - ❌ `classes` prop 제거 → 스타일 커스터마이징 불가

#### Styled Component 제거
> **💡 원본과의 차이**:
> - ❌ `RadioRoot` styled component 제거 → SwitchBase 직접 사용
> - ❌ `styled()` API 제거 → CSS-in-JS 제거
> - ❌ `variants` 배열 제거 → 조건부 스타일 제거
> - ❌ `ownerState` 제거 → props를 스타일에 전달하지 않음

#### PropTypes 제거
> **💡 원본과의 차이**:
> - ❌ `inputProps` prop 제거 (deprecated)
> - ❌ `PropTypes` 전체 제거 → TypeScript로 타입 검증

### 3. Props (5개만 남음)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `checked` | boolean | - | Radio 선택 여부 |
| `name` | string | RadioGroup.name | input의 name 속성 |
| `value` | any | - | Radio의 값 |
| `onChange` | function | - | 상태 변경 콜백 |
| `disabled` | boolean | false | 비활성화 여부 |

**추가 props** (SwitchBase로부터 상속):
- `className` - 추가 클래스
- `id` - input의 id
- `required` - 필수 여부
- 기타 HTML input 속성들

---

## 커밋 히스토리로 보는 단순화 과정

Radio는 **9개의 커밋**을 통해 단순화되었습니다.

### 1단계: Slot 시스템 제거
- `318f56d2` - [Radio 단순화 1/9] Slot 시스템 제거
- **이 기능이 불필요한 이유**:
  - **학습 목적**: Radio의 핵심은 "선택 가능한 옵션"이지 "컴포넌트 커스터마이징"이 아님
  - **복잡도**: useSlot() 훅, externalForwardedProps 병합, getSlotProps 이벤트 핸들러 병합

### 2단계: color prop 고정
- `c9d9f082` - [Radio 단순화 2/9] color prop 고정 (primary)
- **이 기능이 불필요한 이유**:
  - **학습 목적**: 색상 시스템은 테마의 별도 주제, primary 하나로 충분
  - **복잡도**: 7가지 색상 × 동적 생성 = 28가지 조합

### 3단계: color 관련 variants 정리
- `0660e6ba` - [Radio 단순화 3/9] color 관련 variants 정리
- **이 기능이 불필요한 이유**:
  - **복잡도**: colorPrimary, colorSecondary 등 클래스 제거

### 4단계: size prop 제거
- `6c0378db` - [Radio 단순화 4/9] size prop 제거
- **이 기능이 불필요한 이유**:
  - **학습 목적**: 크기는 CSS로 간단히 조절 가능
  - **복잡도**: edge × size 조합 variants

### 5단계: icon/checkedIcon 고정
- `2bbaca42` - [Radio 단순화 5/9] icon/checkedIcon 고정
- **이 기능이 불필요한 이유**:
  - **학습 목적**: Material Design 가이드라인에 따라 Radio는 특정 모양(원형)을 가짐
  - **복잡도**: React.cloneElement로 props 주입

### 6단계: disableRipple 제거
- `8906fd82` - [Radio 단순화 6/9] disableRipple 제거
- **이 기능이 불필요한 이유**:
  - **학습 목적**: Ripple은 ButtonBase의 기능, Radio 핵심 개념 아님
  - **복잡도**: disableRipple에 따른 조건부 variants

### 7단계: Theme 시스템 제거
- `a577f118` - [Radio 단순화 7/9] Theme 시스템 제거
- **이 기능이 불필요한 이유**:
  - **학습 목적**: 테마 시스템은 Material-UI 전체의 주제, Radio 학습에는 과함
  - **복잡도**: useDefaultProps, useUtilityClasses, composeClasses

### 8단계: Styled Component 제거
- `302d9b28` - [Radio 단순화 8/9] Styled Component 제거
- **이 기능이 불필요한 이유**:
  - **학습 목적**: Radio 구조 배우는 것이지 CSS-in-JS 배우는 게 아님
  - **복잡도**: styled() API, overridesResolver, variants, memoTheme, ownerState

### 9단계: Deprecated props 및 PropTypes 제거
- `35e0732b` - [Radio 단순화 9/9] Deprecated props 및 PropTypes 제거
- **이 기능이 불필요한 이유**:
  - **학습 목적**: deprecated props는 옛날 API, TypeScript가 있으면 빌드 타임 검증으로 충분
  - **복잡도**: PropTypes 115줄

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 331줄 | 72줄 (78% 감소) |
| **Props 개수** | 14개 | 5개 (핵심만) |
| **Slot 시스템** | ✅ | ❌ |
| **color 선택** | 7가지 | primary 고정 |
| **size 선택** | 2가지 | medium 고정 |
| **icon 커스터마이징** | ✅ | ❌ |
| **disableRipple** | ✅ | ❌ (항상 활성) |
| **Theme 통합** | ✅ | ❌ |
| **Styled Component** | ✅ | ❌ |
| **PropTypes** | ✅ (115줄) | ❌ |
| **RadioGroup 통합** | ✅ | ✅ (유지) |
| **FormControl 통합** | ✅ | ✅ (유지) |

---

## 학습 후 다음 단계

Radio를 이해했다면:

1. **RadioGroup** - Radio들을 그룹으로 묶어 하나만 선택 가능하게 만드는 컨테이너
2. **FormControl** - Form 요소들을 감싸는 컨테이너, 공통 상태 관리
3. **SwitchBase** - Radio, Checkbox, Switch의 공통 베이스 컴포넌트
4. **실전 응용** - RadioGroup과 함께 사용하여 설문조사, 옵션 선택 폼 만들기

**예시: RadioGroup과 함께 사용**
```javascript
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

function Survey() {
  const [value, setValue] = React.useState('option1');

  return (
    <RadioGroup value={value} onChange={(e) => setValue(e.target.value)}>
      <FormControlLabel value="option1" control={<Radio />} label="옵션 1" />
      <FormControlLabel value="option2" control={<Radio />} label="옵션 2" />
      <FormControlLabel value="option3" control={<Radio />} label="옵션 3" />
    </RadioGroup>
  );
}
```

**예시: FormControl과 함께 사용**
```javascript
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

function FormExample() {
  return (
    <FormControl disabled>
      <FormLabel>선택 불가능한 옵션들</FormLabel>
      <RadioGroup>
        <Radio value="a" /> {/* FormControl의 disabled 자동 상속 */}
        <Radio value="b" />
      </RadioGroup>
    </FormControl>
  );
}
```
