# Input 컴포넌트

> InputBase에 Underline 스타일을 추가한 Material Design의 표준 입력 필드 컴포넌트

---

## 무슨 기능을 하는가?

수정된 Input은 **InputBase를 감싸서 하단 밑줄(Underline) 스타일과 상태별 시각 피드백을 제공하는 입력 필드 컴포넌트**입니다.

### 핵심 기능 (남은 것)
1. **Underline 스타일** - span 요소로 하단 밑줄 구현
2. **Focus 애니메이션** - scaleX transform을 사용한 중앙에서 양쪽으로 확장되는 애니메이션
3. **Hover 효과** - Hover 시 밑줄 두께 1px → 2px 증가
4. **Error/Disabled 스타일** - Error 시 빨간색, Disabled 시 점선 밑줄
5. **FormControl 통합** - useFormControl()로 상위 FormControl의 상태(disabled, error) 자동 반영
6. **InputBase 위임** - 실제 입력 로직은 InputBase가 처리

> Input은 순수하게 "스타일링 레이어"만 담당합니다. 값 관리, 이벤트 처리 등 모든 입력 로직은 InputBase가 처리합니다.

---

## 핵심 학습 포인트

### 1. FormControl Context 연동 (유지됨)

```javascript
const muiFormControl = useFormControl();

const disabled = muiFormControl?.disabled ?? props.disabled ?? false;
const error = muiFormControl?.error ?? props.error ?? false;
```

**학습 가치**:
- Context API로 상위 컴포넌트(FormControl)와 상태 공유
- `??` (nullish coalescing)으로 우선순위 체인: Context → props → 기본값
- FormControl에 `error` 설정하면 InputLabel, Input, FormHelperText 모두 자동 반영

**사용 예시**:
```jsx
// FormControl에만 error 설정하면 Input이 자동으로 빨간 밑줄 표시
<FormControl error>
  <InputLabel>Email</InputLabel>
  <Input />  {/* 자동으로 error 상태 반영 */}
  <FormHelperText>Invalid email</FormHelperText>
</FormControl>
```

### 2. Transform 애니메이션으로 Underline 확장 효과

```javascript
const underlineAfterStyle = {
  transform: focused ? 'scaleX(1) translateX(0)' : 'scaleX(0)',
  transition: 'transform 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms',
};
```

**학습 가치**:
- `scaleX(0)` → `scaleX(1)`로 중앙에서 양쪽으로 확장되는 효과 구현
- `translateX(0)`은 Safari transform scale 버그 우회용 (실무 팁)
- CSS transition으로 부드러운 애니메이션

### 3. Composition Pattern (InputBase 확장)

```javascript
return (
  <div style={containerStyle}>
    <InputBase {...other} ref={ref} onFocus={handleFocus} onBlur={handleBlur} />
    <span style={underlineBeforeStyle} />
    <span style={underlineAfterStyle} />
  </div>
);
```

**학습 가치**:
- 상속(inheritance) 대신 합성(composition)으로 컴포넌트 확장
- InputBase의 모든 props를 spread로 전달 (`...other`)
- onFocus/onBlur만 가로채서 내부 상태(focused) 업데이트 후 원래 핸들러 호출

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/mui-material/src/Input/Input.js (93줄, 원본 380줄)
Input (div, container)
  ├─> InputBase (입력 필드 로직 담당)
  ├─> span (underlineBefore - 기본 밑줄)
  └─> span (underlineAfter - focus 밑줄)
```

### 2. FormControl 연동

```javascript
const muiFormControl = useFormControl();

// FormControl Context에서 상태 가져오기 (props보다 우선)
const disabled = muiFormControl?.disabled ?? props.disabled ?? false;
const error = muiFormControl?.error ?? props.error ?? false;
```

**동작 흐름**:
```
FormControl (error={true})
  └─> FormControlContext.Provider (value={error: true, ...})
       ├─> InputLabel  ← useFormControl()로 error 읽음 → 빨간 라벨
       ├─> Input       ← useFormControl()로 error 읽음 → 빨간 밑줄
       └─> FormHelperText ← useFormControl()로 error 읽음 → 빨간 텍스트
```

### 3. Underline 스타일 로직

```javascript
const underlineBeforeStyle = !disableUnderline
  ? {
      borderBottom: error
        ? '1px solid #d32f2f'           // Error: 빨간색
        : hover && !disabled
          ? '2px solid rgba(0, 0, 0, 0.87)'  // Hover: 두껍게
          : '1px solid rgba(0, 0, 0, 0.42)', // 기본: 회색
      ...(disabled && { borderBottomStyle: 'dotted' }),  // Disabled: 점선
    }
  : { display: 'none' };
```

**원본과의 차이**:
- ❌ theme.palette 색상 참조 → 하드코딩된 색상값
- ❌ @media (hover: none) 터치 디바이스 대응 → 제거
- ❌ theme.transitions 사용 → 하드코딩된 transition
- ✅ FormControl 연동 유지 → useFormControl() 사용

### 4. Props (5개만 직접 처리)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `disableUnderline` | boolean | false | true면 underline 제거 |
| `disabled` | boolean | false | 비활성화 상태 (FormControl에서 상속 가능) |
| `error` | boolean | false | 에러 상태 (FormControl에서 상속 가능) |
| `className` | string | - | root div의 className |
| `onFocus` | function | - | 포커스 시 호출 |
| `onBlur` | function | - | 블러 시 호출 |

> 나머지 모든 props(value, onChange, placeholder, multiline 등)는 `...other`로 InputBase에 전달됩니다.

---

## 커밋 히스토리로 보는 단순화 과정

Input은 **6개의 커밋**을 통해 단순화되었습니다.

### 1단계: Deprecated Props 제거
- `c1bee406` - [Input 단순화 1/6] Deprecated props 제거

**왜 불필요한가**:
- **학습 목적**: v4 → v5 마이그레이션용 하위 호환 props는 학습에 불필요
- **복잡도**: components/componentsProps와 slots/slotProps 두 가지 API 동시 지원

**삭제 내용**:
- `components` prop (components.Root, components.Input)
- `componentsProps` prop
- fallback 체인 로직 (slots ?? components ?? 기본값)
- deepmerge로 props 병합 로직

### 2단계: Color Variants 동적 생성 제거
- `51784e1f` - [Input 단순화 2/6] Color variants 동적 생성 제거

**왜 불필요한가**:
- **학습 목적**: theme.palette 순회하여 variants 생성하는 것은 Material-UI 시스템 주제
- **복잡도**: `Object.entries(theme.palette).filter().map()` 런타임 동적 생성
- **현실**: 대부분 primary(#1976d2) 하나만 사용

**삭제 내용**:
- `color` prop (primary, secondary, error 등)
- `createSimplePaletteValueFilter()` import 및 사용
- 팔레트 순회 및 variants 동적 생성 로직

### 3단계: Theme 시스템 제거
- `9468af1a` - [Input 단순화 3/6] Theme 시스템 제거

**왜 불필요한가**:
- **학습 목적**: Theme 시스템은 Material-UI 전체 주제로 Input 학습에 과함
- **복잡도**: useDefaultProps, memoTheme, theme.transitions, theme.vars 등
- **대안**: 하드코딩된 값으로 충분

**삭제 내용**:
- `useDefaultProps()` 호출
- `memoTheme()` 래퍼
- `theme.transitions.create()` → 직접 transition 문자열
- `theme.vars` 조건부 처리

### 4단계: Utility Classes 시스템 제거
- `a4e68862` - [Input 단순화 4/6] Utility Classes 시스템 제거

**왜 불필요한가**:
- **학습 목적**: 동적 className 생성은 스타일 오버라이드 시스템의 일부
- **복잡도**: useUtilityClasses, composeClasses, getInputUtilityClass
- **대안**: 단순 className prop만 사용

**삭제 내용**:
- `useUtilityClasses()` 함수 전체
- `composeClasses()` 호출
- `getInputUtilityClass` import
- `inputClasses` import
- `classes` prop

### 5단계: Styled 시스템 제거 및 인라인 구현
- `7cd98ed4` - [Input 단순화 5/6] Styled 시스템 제거 및 인라인 구현

**왜 불필요한가**:
- **학습 목적**: styled() API는 CSS-in-JS 라이브러리 주제
- **복잡도**: styled(InputBaseRoot), shouldForwardProp, overridesResolver, variants 배열
- **대안**: 인라인 style 객체

**변경 내용**:
```javascript
// Before (styled components + pseudo-elements)
const InputRoot = styled(InputBaseRoot, { ... })({
  '&::before': { ... },
  '&::after': { ... },
});

// After (inline styles + span elements)
<div style={containerStyle}>
  <InputBase {...props} />
  <span style={underlineBeforeStyle} />
  <span style={underlineAfterStyle} />
</div>
```

### 6단계: PropTypes 제거
- `f2e92762` - [Input 단순화 6/6] PropTypes 제거

**왜 불필요한가**:
- **학습 목적**: PropTypes는 런타임 타입 검증 도구이지 컴포넌트 로직이 아님
- **복잡도**: 160줄의 PropTypes 정의 및 JSDoc 주석
- **대안**: TypeScript 사용 시 빌드 타임에 검증

**삭제 내용**:
- `Input.propTypes = { ... }` 전체 (160줄)
- `PropTypes` import
- `refType` import

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 380줄 | 93줄 (76% 감소) |
| **Props 개수** | 22개 | 5개 (나머지는 InputBase로 전달) |
| **Underline 구현** | ✅ ::before, ::after pseudo-elements | ❌ span 요소 |
| **Color variants** | ✅ theme.palette 동적 생성 | ❌ #1976d2 고정 |
| **Theme 통합** | ✅ useDefaultProps, memoTheme | ❌ 제거 |
| **스타일링** | ✅ styled(InputBaseRoot) | ❌ 인라인 스타일 |
| **FormControl 연동** | ✅ useFormControl() | ✅ 유지 |
| **Utility Classes** | ✅ MuiInput-root, MuiInput-underline | ❌ 제거 |
| **PropTypes** | ✅ 160줄 | ❌ 제거 |
| **터치 디바이스 대응** | ✅ @media (hover: none) | ❌ 제거 |

---

## 학습 후 다음 단계

Input을 이해했다면:

1. **FormControl** - Input, InputLabel, FormHelperText의 상태를 Context로 관리
2. **InputBase** - Input이 위임하는 실제 입력 로직 컴포넌트
3. **TextField** - FormControl + InputLabel + Input + FormHelperText 조합
4. **FilledInput / OutlinedInput** - Input과 같은 레벨의 다른 스타일 변형

**예시: 기본 사용**
```javascript
import Input from './Input';

function BasicInput() {
  const [value, setValue] = React.useState('');

  return (
    <Input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Enter text..."
    />
  );
}
```

**예시: FormControl과 함께 (핵심 패턴)**
```javascript
import FormControl from '../FormControl';
import InputLabel from '../InputLabel';
import Input from './Input';
import FormHelperText from '../FormHelperText';

function ControlledInput({ hasError }) {
  return (
    // error를 FormControl에만 설정하면 모든 자식이 자동 반영
    <FormControl error={hasError} disabled={false}>
      <InputLabel>Email</InputLabel>
      <Input placeholder="email@example.com" />
      <FormHelperText>
        {hasError ? 'Invalid email format' : 'We will never share your email'}
      </FormHelperText>
    </FormControl>
  );
}
```

**예시: 상태별 스타일**
```javascript
import Input from './Input';

function StyledInputs() {
  return (
    <>
      {/* 기본 */}
      <Input placeholder="Normal" />

      {/* 에러 상태 - 빨간색 밑줄 */}
      <Input error placeholder="Error" />

      {/* 비활성화 - 점선 밑줄 */}
      <Input disabled placeholder="Disabled" />

      {/* 밑줄 없음 */}
      <Input disableUnderline placeholder="No underline" />
    </>
  );
}
```
