# FilledInput 컴포넌트

> InputBase를 감싸고 배경색과 밑줄 애니메이션을 추가한 Filled 스타일 입력 필드

---

## 무슨 기능을 하는가?

수정된 FilledInput은 **인라인 스타일과 span 요소로 배경색/밑줄 스타일을 구현한 단순화된 Filled 입력 필드** 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **배경색 스타일** - 회색 배경(rgba(0,0,0,0.06))과 상단 모서리 둥글림(4px)
2. **밑줄 애니메이션** - span 요소로 focus 시 scaleX 애니메이션
3. **상태별 스타일** - disabled, error 상태에 따른 시각적 피드백
4. **FormControl 통합** - useFormControl로 disabled, error 상태 상속

---

## 핵심 학습 포인트

### 1. Pseudo-element 대체: span 요소로 밑줄 구현

```javascript
{!disableUnderline && (
  <>
    <span style={underlineBeforeStyle} />  {/* 기본 밑줄 */}
    <span style={underlineAfterStyle} />   {/* focus 밑줄 */}
  </>
)}
```

**학습 가치**:
- CSS `::before`/`::after`를 실제 DOM 요소로 대체
- 인라인 스타일에서는 pseudo-element 사용 불가 → span으로 해결
- 동일한 시각적 결과를 더 명시적인 방법으로 구현

### 2. 조건부 스타일 객체 패턴

```javascript
const containerStyle = {
  position: 'relative',
  backgroundColor: disabled ? 'rgba(0, 0, 0, 0.12)' : 'rgba(0, 0, 0, 0.06)',
  // ...
  ...(startAdornment && { paddingLeft: 12 }),
  ...(multiline && !hiddenLabel && {
    padding: size === 'small' ? '21px 12px 4px' : '25px 12px 8px',
  }),
};
```

**학습 가치**:
- spread 연산자로 조건부 스타일 병합
- styled-components의 variants를 순수 JavaScript로 구현
- 삼항 연산자와 논리 AND로 조건 처리

### 3. FormControl Context 통합

```javascript
const muiFormControl = useFormControl();
const fcs = muiFormControl || {};
const disabled = disabledProp ?? fcs.disabled ?? false;
const error = errorProp ?? fcs.error ?? false;
```

**학습 가치**:
- Props 우선순위: props > context > 기본값
- nullish coalescing (??)으로 안전한 기본값 처리
- FormControl과의 연동 패턴

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/mui-material/src/FilledInput/FilledInput.js (129줄, 원본 536줄)

<div style={containerStyle} className={className}>
  <InputBase
    inputComponent={inputComponent}
    multiline={multiline}
    ref={ref}
    type={type}
    disabled={disabled}
    fullWidth={fullWidth}
    startAdornment={startAdornment}
    endAdornment={endAdornment}
    onFocus={handleFocus}
    onBlur={handleBlur}
    style={inputStyle}
    {...other}
  />
  {!disableUnderline && (
    <>
      <span style={underlineBeforeStyle} />
      <span style={underlineAfterStyle} />
    </>
  )}
</div>
```

### 2. 스타일 객체들

**containerStyle** - 배경색, 테두리 반경, 패딩:
```javascript
const containerStyle = {
  position: 'relative',
  backgroundColor: disabled ? 'rgba(0, 0, 0, 0.12)' : 'rgba(0, 0, 0, 0.06)',
  borderTopLeftRadius: 4,
  borderTopRightRadius: 4,
  transition: 'background-color 150ms cubic-bezier(0.0, 0, 0.2, 1)',
  display: fullWidth ? 'flex' : 'inline-flex',
  width: fullWidth ? '100%' : undefined,
};
```

**underlineBeforeStyle** - 기본 밑줄:
```javascript
const underlineBeforeStyle = {
  borderBottom: error ? '1px solid #d32f2f' : '1px solid rgba(0, 0, 0, 0.42)',
  left: 0,
  bottom: 0,
  position: 'absolute',
  right: 0,
  ...(disabled && { borderBottomStyle: 'dotted' }),
};
```

**underlineAfterStyle** - focus 밑줄 (애니메이션):
```javascript
const underlineAfterStyle = {
  borderBottom: error ? '2px solid #d32f2f' : '2px solid #1976d2',
  left: 0,
  bottom: 0,
  position: 'absolute',
  right: 0,
  transform: focused ? 'scaleX(1) translateX(0)' : 'scaleX(0)',
  transition: 'transform 150ms cubic-bezier(0.0, 0, 0.2, 1)',
};
```

> **원본과의 차이**:
> - ❌ `styled()` API 제거 → 인라인 style 객체
> - ❌ `::before`/`::after` pseudo-elements → span 요소
> - ❌ `memoTheme` 제거 → 하드코딩된 값
> - ❌ `theme.vars` CSS Variables 분기 제거 → light mode 고정
> - ❌ color variants 동적 생성 제거 → primary(#1976d2) 고정

### 3. Props (13개만 남음)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `className` | string | - | 컨테이너 className |
| `disableUnderline` | boolean | false | 밑줄 제거 |
| `disabled` | boolean | false | 비활성화 |
| `error` | boolean | false | 에러 상태 |
| `fullWidth` | boolean | false | 전체 너비 |
| `hiddenLabel` | boolean | - | 라벨 숨김 (패딩 조정) |
| `inputComponent` | elementType | 'input' | input 요소 타입 |
| `multiline` | boolean | false | 멀티라인 |
| `size` | 'small' \| 'medium' | - | 크기 |
| `startAdornment` | node | - | 시작 장식 요소 |
| `endAdornment` | node | - | 끝 장식 요소 |
| `type` | string | 'text' | input 타입 |
| + InputBase props | - | - | value, onChange 등 |

---

## 커밋 히스토리로 보는 단순화 과정

FilledInput은 **6개의 커밋**을 통해 단순화되었습니다.

### 1단계: Deprecated Props 제거
- `edefa779` - [FilledInput 단순화 1/6] Deprecated props 제거
- components/componentsProps → slots/slotProps만 유지
- deepmerge 유틸리티 제거
- 불필요한 이유: v4→v5 마이그레이션용 하위 호환 API는 학습에 불필요

### 2단계: Color Variants 동적 생성 제거
- `7817574d` - [FilledInput 단순화 2/6] Color variants 동적 생성 제거
- Object.entries(theme.palette) 순회 제거
- createSimplePaletteValueFilter 제거
- primary(#1976d2) 색상으로 고정
- 불필요한 이유: 팔레트 순회는 Theme 시스템 주제, 대부분 primary만 사용

### 3단계: Theme 시스템 제거
- `166bc8e1` - [FilledInput 단순화 3/6] Theme 시스템 제거
- useDefaultProps, memoTheme 제거
- theme.vars 조건부 처리 제거
- theme.transitions.create() → 하드코딩된 transition
- theme.palette.mode 분기 → light mode 값 고정
- 불필요한 이유: Theme 시스템은 전체 프레임워크 주제, 개별 컴포넌트 학습에 과함

### 4단계: Utility Classes 시스템 제거
- `0557b19f` - [FilledInput 단순화 4/6] Utility Classes 시스템 제거
- useUtilityClasses 함수 제거
- composeClasses, getFilledInputUtilityClass, capitalize 제거
- classes prop 제거
- 불필요한 이유: MuiFilledInput-* 클래스 생성은 스타일 오버라이드 시스템 주제

### 5단계: Styled 시스템 제거 및 인라인 구현
- `5dd398ec` - [FilledInput 단순화 5/6] Styled 시스템 제거 및 인라인 구현
- styled() API, FilledInputRoot, FilledInputInput 제거
- rootShouldForwardProp, InputBaseRoot, InputBaseInput import 제거
- 인라인 style 객체로 구현
- span 요소로 밑줄 구현 (::before/::after 대체)
- 불필요한 이유: styled() API는 CSS-in-JS 라이브러리 주제, 인라인으로 동일 결과 가능

### 6단계: PropTypes 제거
- `087c017c` - [FilledInput 단순화 6/6] PropTypes 제거
- PropTypes, refType import 제거
- FilledInput.propTypes 전체 제거
- 불필요한 이유: 런타임 타입 검증은 컴포넌트 로직이 아님, TypeScript로 대체 가능

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 536줄 | 129줄 (76% 감소) |
| **Props 개수** | 30개+ | 13개 |
| **styled() API** | ✅ | ❌ |
| **Theme 시스템** | ✅ | ❌ |
| **Color Variants** | 8개+ 동적 생성 | primary 고정 |
| **Dark Mode** | ✅ | ❌ (light 고정) |
| **Utility Classes** | ✅ | ❌ |
| **PropTypes** | ✅ | ❌ |
| **밑줄 구현** | ::before/::after | span 요소 |

---

## 학습 후 다음 단계

FilledInput을 이해했다면:

1. **Input (Standard)** - 배경 없는 기본 스타일 비교
2. **OutlinedInput** - 전체 테두리 스타일 비교
3. **InputBase** - 세 Input의 공통 기반 컴포넌트
4. **FormControl** - Context로 상태 공유하는 컨테이너

**예시: 기본 사용**
```javascript
import FilledInput from './FilledInput';

function App() {
  return (
    <FilledInput
      placeholder="이름을 입력하세요"
      fullWidth
    />
  );
}
```

**예시: FormControl과 함께 사용**
```javascript
import FormControl from '../FormControl';
import InputLabel from '../InputLabel';
import FilledInput from './FilledInput';

function App() {
  return (
    <FormControl error>
      <InputLabel>이메일</InputLabel>
      <FilledInput type="email" />
      {/* error 상태가 Context로 전달됨 */}
    </FormControl>
  );
}
```

**예시: 밑줄 없는 스타일**
```javascript
<FilledInput
  disableUnderline
  placeholder="밑줄 없는 입력"
/>
```
