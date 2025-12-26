# Checkbox 컴포넌트

> Material-UI의 Checkbox를 최소한의 기능만 남겨 단순화한 학습용 버전

---

## 무슨 기능을 하는가?

수정된 Checkbox는 **여러 옵션 중 하나 이상을 선택할 수 있는 입력 컴포넌트**입니다.

### 핵심 기능 (남은 것)
1. **2상태 관리** - checked/unchecked 상태 토글
2. **FormControl 통합** - FormControl 내부에서 disabled 상태 자동 상속
3. **값 제출** - 폼 제출 시 선택된 값 전달

---

## 핵심 학습 포인트

### 1. SwitchBase 기반 구조

```javascript
// 위치: packages/mui-material/src/Checkbox/Checkbox.js (26줄, 원본 309줄)
const Checkbox = React.forwardRef(function Checkbox(props, ref) {
  const {
    className,
    ...other
  } = props;

  return (
    <SwitchBase
      ref={ref}
      className={className}
      type="checkbox"
      icon={<CheckBoxOutlineBlankIcon fontSize="medium" />}
      checkedIcon={<CheckBoxIcon fontSize="medium" />}
      {...other}
    />
  );
});
```

**학습 가치**:
- **SwitchBase 재사용**: Radio, Checkbox, Switch의 공통 베이스 컴포넌트
- **props 전달**: `...other`로 모든 props를 SwitchBase에 위임
- **type="checkbox"**: input 요소의 타입 지정으로 브라우저 네이티브 동작 활용
- **간단한 wrapper**: Checkbox는 SwitchBase에 아이콘만 전달하는 얇은 래퍼

### 2. 아이콘 시스템

```javascript
icon={<CheckBoxOutlineBlankIcon fontSize="medium" />}
checkedIcon={<CheckBoxIcon fontSize="medium" />}
```

**학습 가치**:
- **2가지 아이콘**: unchecked (빈 사각형), checked (체크 표시)
- **fontSize 고정**: 'medium'으로 일관된 크기 유지
- **SVG 아이콘**: CheckBoxIcon, CheckBoxOutlineBlankIcon은 Material Design의 표준 아이콘

### 3. FormControl 통합 (SwitchBase에서 처리)

SwitchBase 내부에서 `useFormControl()` 훅으로:
- FormControl의 disabled 상태 자동 상속
- FormControl의 focus/blur 이벤트 연동

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/mui-material/src/Checkbox/Checkbox.js (26줄, 원본 309줄)
Checkbox (forwardRef)
  └─> SwitchBase
       ├─> ButtonBase
       ├─> input[type="checkbox"]
       └─> Icon (조건부 렌더링)
            ├─> CheckBoxOutlineBlankIcon (unchecked)
            └─> CheckBoxIcon (checked)
```

### 2. 주요 변경된 로직

#### Slot 시스템 제거
> **💡 원본과의 차이**:
> - ❌ `slots` prop 제거 → SwitchBase 고정
> - ❌ `slotProps` prop 제거 → 커스터마이징 불가
> - ❌ `useSlot()` 훅 제거 → 간단한 구조

#### 색상 고정
> **💡 원본과의 차이**:
> - ❌ `color` prop 제거 → 'primary' 고정
> - ❌ 동적 색상 생성 제거 → 단순한 스타일
> - ❌ 7가지 색상 variants 제거

#### 크기 고정
> **💡 원본과의 차이**:
> - ❌ `size` prop 제거 → 'medium' 고정
> - ❌ small/medium 크기 variants 제거

#### **Indeterminate 상태 제거** (Checkbox 특화)
> **💡 원본과의 차이**:
> - ❌ `indeterminate` prop 제거 → 2상태만 지원 (checked/unchecked)
> - ❌ `indeterminateIcon` prop 제거
> - ❌ IndeterminateCheckBoxIcon 제거
> - ❌ data-indeterminate 속성 제거
> - **학습 초점**: Checkbox의 기본 개념인 "체크/미체크"에만 집중

#### 아이콘 고정
> **💡 원본과의 차이**:
> - ❌ `icon` prop 제거 → CheckBoxOutlineBlank 고정
> - ❌ `checkedIcon` prop 제거 → CheckBox 고정

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
> - ❌ `CheckboxRoot` styled component 제거 → SwitchBase 직접 사용
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
| `checked` | boolean | - | Checkbox 선택 여부 |
| `onChange` | function | - | 상태 변경 콜백 |
| `value` | any | - | Checkbox의 값 |
| `disabled` | boolean | false | 비활성화 여부 |
| `className` | string | - | 추가 클래스 |

**추가 props** (SwitchBase로부터 상속):
- `name` - input의 name 속성
- `id` - input의 id
- `required` - 필수 여부
- 기타 HTML input 속성들

---

## 커밋 히스토리로 보는 단순화 과정

Checkbox는 **10개의 커밋**을 통해 단순화되었습니다.

### 1단계: Slot 시스템 제거
- `f26be60c` - [Checkbox 단순화 1/10] Slot 시스템 제거
- **이 기능이 불필요한 이유**:
  - **학습 목적**: Checkbox의 핵심은 "체크 가능한 옵션"이지 "컴포넌트 커스터마이징"이 아님
  - **복잡도**: useSlot() 훅, externalForwardedProps 병합, getSlotProps 이벤트 핸들러 병합

### 2단계: color prop 고정
- `055313f0` - [Checkbox 단순화 2/10] color prop 고정 (primary)
- **이 기능이 불필요한 이유**:
  - **학습 목적**: 색상 시스템은 테마의 별도 주제, primary 하나로 충분
  - **복잡도**: 7가지 색상 × 동적 생성 = 28가지 조합

### 3단계: color 관련 variants 정리
- `2395ccc9` - [Checkbox 단순화 3/10] color 관련 variants 정리
- **이 기능이 불필요한 이유**:
  - **복잡도**: colorPrimary, colorSecondary 등 클래스 제거

### 4단계: size prop 제거
- `73880a44` - [Checkbox 단순화 4/10] size prop 제거
- **이 기능이 불필요한 이유**:
  - **학습 목적**: 크기는 CSS로 간단히 조절 가능
  - **복잡도**: edge × size 조합 variants

### 5단계: **indeterminate 상태 제거** (Checkbox 특화)
- `e9881d10` - [Checkbox 단순화 5/10] indeterminate 상태 제거
- **이 기능이 불필요한 이유**:
  - **학습 목적**: Checkbox의 기본 개념은 "체크/미체크" 2상태면 충분
  - **복잡도**: indeterminate 조건부 아이콘 렌더링, data-indeterminate 속성, indeterminate 클래스
  - **사용 사례**: 트리 컴포넌트 등 고급 사용 사례에만 필요

### 6단계: icon/checkedIcon 고정
- `6b78ff29` - [Checkbox 단순화 6/10] icon/checkedIcon 고정
- **이 기능이 불필요한 이유**:
  - **학습 목적**: Material Design 가이드라인에 따라 Checkbox는 특정 모양(사각형)을 가짐
  - **복잡도**: React.cloneElement로 props 주입

### 7단계: disableRipple 제거
- `016e5430` - [Checkbox 단순화 7/10] disableRipple 제거
- **이 기능이 불필요한 이유**:
  - **학습 목적**: Ripple은 ButtonBase의 기능, Checkbox 핵심 개념 아님
  - **복잡도**: disableRipple에 따른 조건부 variants

### 8단계: Theme 시스템 제거
- `79b2de21` - [Checkbox 단순화 8/10] Theme 시스템 제거
- **이 기능이 불필요한 이유**:
  - **학습 목적**: 테마 시스템은 Material-UI 전체의 주제, Checkbox 학습에는 과함
  - **복잡도**: useDefaultProps, useUtilityClasses, composeClasses

### 9단계: Styled Component 제거
- `e26d2f0e` - [Checkbox 단순화 9/10] Styled Component 제거
- **이 기능이 불필요한 이유**:
  - **학습 목적**: Checkbox 구조 배우는 것이지 CSS-in-JS 배우는 게 아님
  - **복잡도**: styled() API, overridesResolver, variants, memoTheme, ownerState

### 10단계: Deprecated props 및 PropTypes 제거
- `daaebd6e` - [Checkbox 단순화 10/10] Deprecated props 및 PropTypes 제거
- **이 기능이 불필요한 이유**:
  - **학습 목적**: deprecated props는 옛날 API, TypeScript가 있으면 빌드 타임 검증으로 충분
  - **복잡도**: PropTypes 140줄

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 309줄 | 26줄 (91% 감소) |
| **Props 개수** | 14개 | 5개 (핵심만) |
| **Slot 시스템** | ✅ | ❌ |
| **color 선택** | 7가지 | primary 고정 |
| **size 선택** | 2가지 | medium 고정 |
| **indeterminate 상태** | ✅ (3상태) | ❌ (2상태만) |
| **icon 커스터마이징** | ✅ | ❌ |
| **disableRipple** | ✅ | ❌ (항상 활성) |
| **Theme 통합** | ✅ | ❌ |
| **Styled Component** | ✅ (35줄) | ❌ |
| **PropTypes** | ✅ (140줄) | ❌ |
| **FormControl 통합** | ✅ | ✅ (유지) |

---

## 학습 후 다음 단계

Checkbox를 이해했다면:

1. **FormControl** - Form 요소들을 감싸는 컨테이너, 공통 상태 관리
2. **SwitchBase** - Radio, Checkbox, Switch의 공통 베이스 컴포넌트
3. **Radio** - 단일 선택을 위한 입력 컴포넌트 (RadioGroup과 함께 사용)
4. **실전 응용** - FormControl과 함께 사용하여 폼 만들기

**예시: 기본 사용**
```javascript
import Checkbox from '@mui/material/Checkbox';

function BasicCheckbox() {
  const [checked, setChecked] = React.useState(false);

  return (
    <Checkbox
      checked={checked}
      onChange={(e) => setChecked(e.target.checked)}
    />
  );
}
```

**예시: FormControl과 함께 사용**
```javascript
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';

function CheckboxGroup() {
  return (
    <FormControl>
      <FormGroup>
        <FormControlLabel
          control={<Checkbox />}
          label="옵션 1"
        />
        <FormControlLabel
          control={<Checkbox />}
          label="옵션 2"
        />
        <FormControlLabel
          control={<Checkbox disabled />}
          label="비활성화된 옵션"
        />
      </FormGroup>
    </FormControl>
  );
}
```

**예시: 다중 선택 폼**
```javascript
function MultiSelectForm() {
  const [options, setOptions] = React.useState({
    option1: false,
    option2: false,
    option3: false,
  });

  const handleChange = (name) => (event) => {
    setOptions({ ...options, [name]: event.target.checked });
  };

  return (
    <FormGroup>
      <FormControlLabel
        control={<Checkbox checked={options.option1} onChange={handleChange('option1')} />}
        label="이메일 수신 동의"
      />
      <FormControlLabel
        control={<Checkbox checked={options.option2} onChange={handleChange('option2')} />}
        label="SMS 수신 동의"
      />
      <FormControlLabel
        control={<Checkbox checked={options.option3} onChange={handleChange('option3')} />}
        label="마케팅 정보 수신 동의"
      />
    </FormGroup>
  );
}
```
