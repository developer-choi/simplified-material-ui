# InputLabel 컴포넌트

> TextField와 Select 등의 입력 필드에 variant별 transform 애니메이션을 제공하는 라벨 컴포넌트

---

## 무슨 기능을 하는가?

수정된 InputLabel은 **TextField, Select 등의 입력 필드에 라벨을 표시하고, variant와 shrink 상태에 따라 위치와 크기가 변하는 애니메이션을 제공하는 컴포넌트**입니다.

### 핵심 기능 (남은 것)
1. **Variant별 Transform** - filled, outlined, standard 세 가지 variant에 따라 서로 다른 transform 값 적용
2. **Shrink 자동 계산** - FormControl의 filled, focused, adornedStart 상태를 기반으로 자동으로 shrink 결정
3. **FormControl 통합** - useFormControl()로 부모 FormControl의 상태를 구독하여 자동 동기화
4. **상태 기반 색상** - disabled, error, focused 상태에 따라 라벨 색상 자동 변경
5. **Required 표시** - required prop이 true일 때 asterisk(*) 자동 렌더링

---

## 핵심 학습 포인트

### 1. Variant별 Transform 계산

```javascript
// 위치: InputLabel.js (7-31줄)
function getTransform(variant, shrink, formControl) {
  if (!formControl) {
    return undefined;
  }

  if (variant === 'filled') {
    if (shrink) {
      return 'translate(12px, 7px) scale(0.75)';
    }
    return 'translate(12px, 16px) scale(1)';
  }

  if (variant === 'outlined') {
    if (shrink) {
      return 'translate(14px, -9px) scale(0.75)';
    }
    return 'translate(14px, 16px) scale(1)';
  }

  // standard variant
  if (shrink) {
    return 'translate(0, -1.5px) scale(0.75)';
  }
  return 'translate(0, 20px) scale(1)';
}
```

**학습 가치**:
- **Variant별 위치 전략**: standard는 입력 필드 안쪽 중간, filled는 12px 왼쪽 여백, outlined는 14px 왼쪽 여백
- **Shrink 애니메이션**: shrink 시 scale(0.75)로 75% 크기로 줄이고 위로 이동
- **음수 Y 좌표**: outlined variant는 shrink 시 `translate(14px, -9px)`로 테두리 밖으로 이동
- **조건부 transform 반환**: FormControl 내부가 아니면 transform을 적용하지 않음 (undefined 반환)

### 2. Shrink 자동 계산 로직

```javascript
// 위치: InputLabel.js (92-95줄)
let shrink = shrinkProp;
if (typeof shrink === 'undefined' && muiFormControl) {
  shrink = muiFormControl.filled || muiFormControl.focused || muiFormControl.adornedStart;
}
```

**학습 가치**:
- **Props 우선**: shrinkProp이 명시적으로 전달되면 그 값을 사용 (수동 제어)
- **자동 계산 3가지 조건**:
  1. `filled`: 입력 필드에 값이 있음
  2. `focused`: 입력 필드가 포커스됨
  3. `adornedStart`: InputAdornment가 앞에 있음 (아이콘 등)
- **OR 조건**: 셋 중 하나라도 true이면 라벨이 shrink됨
- **사용자 경험**: 사용자가 입력을 시작하거나 포커스하면 라벨이 자동으로 위로 이동

### 3. FormControl 상태 통합

```javascript
// 위치: InputLabel.js (98-108줄)
const fcs = formControlState({
  props,
  muiFormControl,
  states: ['variant', 'required', 'focused', 'disabled', 'error'],
});

const variant = fcs.variant || variantProp;
const required = fcs.required ?? requiredProp;
const focused = fcs.focused ?? focusedProp;
const disabled = fcs.disabled ?? disabledProp;
const error = fcs.error ?? errorProp;
```

**학습 가치**:
- **formControlState 유틸리티**: props와 muiFormControl에서 상태를 자동으로 병합
- **states 배열**: 필요한 상태만 선택적으로 가져옴
- **Fallback 체인**: `fcs.variant || variantProp` - FormControl 상태 우선, 없으면 직접 전달된 prop 사용
- **Nullish Coalescing**: `??` 연산자로 null/undefined만 fallback (false는 유지)
- **중앙 집중식 상태 관리**: FormControl 하나로 여러 하위 컴포넌트의 상태를 일관되게 관리

### 4. 상태 기반 색상 계산

```javascript
// 위치: InputLabel.js (61-72줄)
function getColor(disabled, error, focused) {
  if (disabled) {
    return '#00000042'; // rgba(0, 0, 0, 0.26)
  }
  if (error) {
    return '#d32f2f';
  }
  if (focused) {
    return '#1976d2'; // primary.main
  }
  return '#0000008a'; // rgba(0, 0, 0, 0.54) - text.secondary
}
```

**학습 가치**:
- **우선순위 순서**: disabled > error > focused > default
- **Material Design 색상**:
  - disabled: 투명도 26% 검은색 (흐리게)
  - error: #d32f2f (빨간색)
  - focused: #1976d2 (파란색, primary 색상)
  - default: 투명도 54% 검은색 (text.secondary)
- **Early Return 패턴**: if 조건문으로 명확한 우선순위 표현
- **하드코딩된 색상**: 테마 시스템 없이도 Material Design 가이드라인 준수

### 5. 인라인 스타일을 통한 조건부 스타일링

```javascript
// 위치: InputLabel.js (115-146줄)
const baseStyle = {
  display: 'block',
  transformOrigin: 'top left',
  // ... 기본 스타일
  maxWidth,
  color: labelColor,
  transition: 'color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms, transform 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms, max-width 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms',
};

// formControl 내부일 때만 절대 위치 스타일 적용
if (muiFormControl) {
  baseStyle.position = 'absolute';
  baseStyle.left = 0;
  baseStyle.top = 0;
  baseStyle.transform = transform;
}

// filled, outlined variant일 때 추가 스타일
if (variant === 'filled' || variant === 'outlined') {
  baseStyle.zIndex = 1;
  baseStyle.pointerEvents = shrink ? 'auto' : 'none';
  if (shrink) {
    baseStyle.userSelect = 'none';
  }
}
```

**학습 가치**:
- **객체 뮤테이션**: baseStyle 객체를 직접 수정하여 조건부 스타일 적용
- **FormControl 감지**: muiFormControl 존재 여부로 독립 라벨 vs FormControl 내부 라벨 구분
- **절대 위치 전략**: FormControl 내부에서만 `position: absolute` 적용
- **zIndex 레이어링**: filled/outlined variant는 zIndex: 1로 input 위에 배치 (autofill 배경색 문제 해결)
- **Pointer Events 제어**: shrink 전에는 `pointerEvents: 'none'`으로 클릭 이벤트를 input으로 전달
- **CSS Transition**: 200ms easeOut으로 부드러운 색상/transform/maxWidth 변화

### 6. Required Asterisk 렌더링

```javascript
// 위치: InputLabel.js (157-167줄)
{required && (
  <span
    aria-hidden="true"
    style={{
      color: error ? '#d32f2f' : 'inherit',
      marginLeft: '4px',
    }}
  >
    {' *'}
  </span>
)}
```

**학습 가치**:
- **조건부 렌더링**: required가 true일 때만 asterisk 표시
- **aria-hidden**: 스크린 리더는 required prop으로 이미 인식하므로 중복 방지
- **에러 색상 연동**: error 상태일 때 asterisk도 빨간색으로 변경
- **공백 문자**: `{' *'}` - 앞에 공백을 포함하여 라벨과 asterisk 사이 간격 확보
- **marginLeft**: 추가로 4px 왼쪽 여백

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/mui-material/src/InputLabel/InputLabel.js (173줄, 원본 304줄)

<label
  ref={ref}
  className={className}
  data-shrink={shrink}
  style={baseStyle}  // 인라인 스타일
  {...other}
>
  {children}
  {required && <span aria-hidden="true">{' *'}</span>}
</label>
```

> **💡 원본과의 차이**:
> - ❌ FormLabel 래핑 제거 → label 태그 직접 사용
> - ❌ styled() 제거 → 인라인 style 객체 사용
> - ❌ ownerState 제거 → props와 계산된 값 직접 사용
> - ❌ classes 제거 → className만 전달
> - ✅ asterisk 직접 렌더링 (FormLabel 의존성 제거)

### 2. 헬퍼 함수 (Transform 계산)

InputLabel의 핵심은 3개의 순수 함수로 구성됩니다:

```javascript
// 1. Transform 계산 (variant, shrink에 따라)
getTransform(variant, shrink, formControl) → string | undefined

// 2. MaxWidth 계산 (variant, shrink에 따라)
getMaxWidth(variant, shrink, formControl) → string

// 3. 색상 계산 (disabled, error, focused에 따라)
getColor(disabled, error, focused) → string
```

**장점**:
- 테스트 가능: 순수 함수로 unit test 작성 용이
- 재사용성: 다른 컴포넌트에서도 동일한 로직 사용 가능
- 가독성: 계산 로직이 컴포넌트에서 분리되어 명확함

> **💡 원본과의 차이**:
> - ❌ `memoTheme()` + `variants` 배열 (11개 조건) 제거
> - ✅ 단순 함수 3개로 대체
> - ❌ styled 시스템의 조건부 스타일 제거
> - ✅ if/else 조건문으로 명확한 로직

### 3. Props (10개만 남음)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | `ReactNode` | - | 라벨 텍스트 또는 요소 |
| `className` | `string` | - | CSS 클래스 |
| `shrink` | `boolean` | 자동* | 라벨 축소 상태 |
| `variant` | `'filled' \| 'outlined' \| 'standard'` | - | 입력 필드 스타일 (FormControl에서 상속) |
| `required` | `boolean` | - | 필수 표시 (FormControl에서 상속) |
| `focused` | `boolean` | - | 포커스 상태 (FormControl에서 상속) |
| `disabled` | `boolean` | - | 비활성화 상태 (FormControl에서 상속) |
| `error` | `boolean` | - | 에러 상태 (FormControl에서 상속) |
| `color` | `string` | - | 색상 (현재 미사용) |
| `margin` | `'dense'` | - | 마진 조정 (현재 미사용) |

*shrink 자동 결정: `muiFormControl.filled || muiFormControl.focused || muiFormControl.adornedStart`

> **💡 원본과의 차이**:
> - ❌ `size` prop 삭제 → medium으로 고정
> - ❌ `disableAnimation` prop 삭제 → 항상 애니메이션 활성화
> - ❌ `classes` prop 삭제 → className만 사용
> - ❌ `sx` prop 삭제 → style 직접 사용
> - ✅ 핵심 기능에만 집중: variant, shrink, FormControl 상태

---

## 커밋 히스토리로 보는 단순화 과정

InputLabel은 **6개의 커밋**을 통해 단순화되었습니다.

### 1단계: size prop 삭제
- `c022eb6d` - [InputLabel 단순화 1/6] size prop 삭제

**무엇을**: 컴포넌트 크기 조절 기능 (small, medium)

**왜 불필요한가**:
- InputLabel의 핵심은 "라벨의 위치 이동 애니메이션"이지 "크기 변형"이 아님
- medium 크기 하나로도 variant별 transform 개념 충분히 이해 가능
- size별로 다른 transform 값이 6가지 케이스로 복잡도 증가 (variant × size)

**삭제 대상**:
- size 관련 variants 스타일 4개
- formControlState의 'size' 구독
- useUtilityClasses의 size 처리
- PropTypes의 size

### 2단계: disableAnimation prop 삭제
- `aba7b0b7` - [InputLabel 단순화 2/6] disableAnimation prop 삭제

**무엇을**: 트랜지션 애니메이션 비활성화 옵션

**왜 불필요한가**:
- InputLabel의 핵심 학습 포인트는 "shrink 시 transform 애니메이션"
- 애니메이션이 없으면 라벨이 왜 움직이는지 이해하기 어려움
- Material Design 가이드라인에서 애니메이션은 기본 동작

**삭제 대상**:
- disableAnimation prop 및 기본값
- disableAnimation variant 스타일
- overridesResolver의 disableAnimation 체크

### 3단계: Theme 시스템 제거
- `73b43e94` - [InputLabel 단순화 3/6] Theme 시스템 제거

**무엇을**: Material-UI의 테마 통합 시스템

**왜 불필요한가**:
- 테마 시스템은 Material-UI 전체의 주제로, InputLabel 학습에는 과함
- `theme.transitions.duration.shorter` vs `200ms` → 결과는 같음
- 하드코딩된 값으로도 variant별 transform 개념 이해 가능

**삭제 대상**:
- `useDefaultProps` (테마 기본값 주입)
- `memoTheme` (테마 변경 감지 최적화)
- theme.transitions.create() → 하드코딩된 transition으로 대체

### 4단계: Utility Classes 시스템 제거
- `5414502f` - [InputLabel 단순화 4/6] Utility Classes 시스템 제거

**무엇을**: 클래스 이름 자동 생성 및 병합 시스템

**왜 불필요한가**:
- 클래스 이름 시스템은 테마 커스터마이징을 위한 것
- InputLabel의 핵심 개념과 무관
- 인라인 스타일로도 똑같이 동작

**삭제 대상**:
- `useUtilityClasses` 함수 (20줄)
- `composeClasses`, `getInputLabelUtilityClasses` import
- `clsx` import
- classes 사용 → className만 직접 전달

### 5단계: Styled 시스템 제거 및 인라인 구현
- `6e5aa60c` - [InputLabel 단순화 5/6] Styled 시스템 제거 및 인라인 구현

**무엇을**: Material-UI의 스타일링 시스템 (styled, ownerState, overridesResolver)

**왜 불필요한가**:
- InputLabel의 핵심은 "variant별 transform"과 "shrink 로직"
- styled() API는 스타일링 도구일 뿐, 컴포넌트 개념과 무관
- 인라인 스타일이 더 직관적이고 코드 가독성 향상

**삭제 대상**:
- `InputLabelRoot` styled 컴포넌트 (98줄)
- `FormLabel` import 및 래핑 → label 태그로 대체
- `ownerState` 객체
- variants 배열 11개 → getTransform(), getMaxWidth(), getColor() 함수로 대체

**구현**:
- label 태그 직접 사용
- variant, shrink 기반 transform을 함수로 계산
- required일 때 asterisk 직접 렌더링
- FormControl 상태 기반 색상 처리

### 6단계: PropTypes 제거
- `51c1d19a` - [InputLabel 단순화 6/6] PropTypes 제거

**무엇을**: 런타임 타입 검증 시스템

**왜 불필요한가**:
- PropTypes는 타입 검증 도구이지 InputLabel 로직이 아님
- TypeScript를 사용하면 빌드 타임에 검증 (더 강력)
- PropTypes 자체가 배울 주제가 아님

**삭제 대상**:
- PropTypes import
- InputLabel.propTypes 전체 (62줄)

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 304줄 | 173줄 (43% 감소) |
| **Props 개수** | 14개 | 10개 |
| **size prop** | ✅ small, medium | ❌ medium 고정 |
| **disableAnimation** | ✅ 옵션 제공 | ❌ 항상 애니메이션 |
| **Styled 시스템** | ✅ styled(FormLabel) | ❌ label 태그 + 인라인 style |
| **Theme 통합** | ✅ useDefaultProps, memoTheme | ❌ 하드코딩된 값 |
| **Utility Classes** | ✅ 13개 클래스 생성 | ❌ className만 전달 |
| **PropTypes** | ✅ 62줄 | ❌ 제거 |
| **FormLabel 의존** | ✅ 래핑 | ❌ 독립적 label 태그 |
| **variants 배열** | ✅ 11개 조건부 스타일 | ❌ 3개 함수로 대체 |
| **복잡도** | 높음 (여러 시스템 통합) | 낮음 (순수 함수 + 인라인 스타일) |

---

## 학습 후 다음 단계

InputLabel을 이해했다면:

1. **TextField** - InputLabel을 사용하는 대표적인 컴포넌트, 전체 입력 필드 시스템 학습
2. **Select** - InputLabel과 함께 사용하는 선택 필드, FormControl 통합 학습
3. **FormControl** - InputLabel, TextField, Select의 상태를 중앙 관리하는 컨테이너
4. **InputAdornment** - InputLabel의 shrink 트리거 중 하나인 adornedStart와 연동
5. **실전 응용** - Material Design의 Floating Label 패턴 구현 학습

**예시: TextField와 함께 사용**
```javascript
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Input from '@mui/material/Input';

function MyTextField() {
  const [value, setValue] = React.useState('');

  return (
    <FormControl variant="standard">
      <InputLabel htmlFor="my-input">이메일</InputLabel>
      <Input
        id="my-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </FormControl>
  );
}
```

**어떻게 동작하나요?**
1. 초기 상태: InputLabel은 Input 위에 겹쳐져 있음 (`position: absolute`, `translate(0, 20px)`)
2. 사용자가 입력 시작: FormControl이 `filled: true` 설정
3. InputLabel이 shrink 감지: `muiFormControl.filled`이 true이므로 `shrink = true`
4. Transform 애니메이션: `translate(0, -1.5px) scale(0.75)`로 위로 이동하며 작아짐
5. 색상 변화 (optional): 포커스 시 파란색으로 변경

**예시: Required 필드**
```javascript
<FormControl required>
  <InputLabel>비밀번호</InputLabel>
  <Input type="password" />
</FormControl>
```

FormControl의 `required` prop이 InputLabel에 자동 전파되어 asterisk(*)가 표시됩니다.

**예시: Error 상태**
```javascript
<FormControl error variant="filled">
  <InputLabel>사용자 이름</InputLabel>
  <Input />
</FormControl>
```

FormControl의 `error` prop이 InputLabel에 전파되어:
- 라벨 색상이 빨간색(#d32f2f)으로 변경
- asterisk도 빨간색으로 변경

**예시: InputAdornment와 함께**
```javascript
<FormControl variant="outlined">
  <InputLabel>검색</InputLabel>
  <Input
    startAdornment={
      <InputAdornment position="start">
        <SearchIcon />
      </InputAdornment>
    }
  />
</FormControl>
```

InputAdornment의 `position="start"`가 FormControl의 `adornedStart: true`로 전파되어 InputLabel이 자동으로 shrink됩니다 (아이콘과 겹치지 않도록).

**핵심 takeaway**:
- InputLabel은 단독으로는 별 의미가 없고, **FormControl + Input 조합**에서 진가를 발휘합니다
- **FormControl의 상태 구독**으로 수동 prop 전달 없이도 자동 동기화됩니다
- **Material Design의 Floating Label 패턴**을 이해하는 것이 핵심입니다
