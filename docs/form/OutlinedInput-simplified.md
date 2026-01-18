# OutlinedInput 컴포넌트

> Material Design Outlined 스타일 입력 필드의 핵심 구조만 남긴 단순화 버전

---

## 무슨 기능을 하는가?

수정된 OutlinedInput은 **전체 테두리와 라벨 notch 애니메이션을 인라인 스타일로 직접 구현한 Outlined 입력 필드** 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **전체 테두리 스타일** - fieldset/legend로 사방 테두리 렌더링
2. **라벨 Notch 애니메이션** - max-width 전환으로 라벨 공간 생성
3. **상태별 테두리 색상** - focus(#1976d2), error(#d32f2f), disabled 색상 변경
4. **FormControl 연동** - useFormControl로 상태 공유

---

## 핵심 학습 포인트

### 1. fieldset/legend를 활용한 Notch 패턴

```javascript
<fieldset aria-hidden style={fieldsetStyle}>
  <legend style={legendStyle}>
    {withLabel ? (
      <span style={legendSpanStyle}>{notchedLabel}</span>
    ) : (
      <span className="notranslate" aria-hidden>&#8203;</span>
    )}
  </legend>
</fieldset>
```

**학습 가치**:
- `<fieldset>`의 `<legend>`는 테두리에 자연스럽게 공간을 만듦
- CSS만으로는 테두리 중간에 "구멍"을 뚫기 어려움
- 브라우저 기본 동작을 활용한 영리한 해결책

### 2. max-width 애니메이션으로 Notch 효과

```javascript
const legendStyle = {
  maxWidth: withLabel ? (notched ? '100%' : 0.01) : undefined,
  transition: withLabel
    ? notched
      ? 'max-width 100ms cubic-bezier(0.4, 0, 0.2, 1) 50ms'
      : 'max-width 50ms cubic-bezier(0.4, 0, 0.2, 1)'
    : 'width 150ms cubic-bezier(0.4, 0, 0.2, 1)',
};
```

**학습 가치**:
- `max-width: 0.01` → `100%` 전환으로 부드러운 notch 열림
- 열릴 때 50ms delay로 자연스러운 시퀀스
- visibility: hidden이지만 공간은 차지함

### 3. 상태 기반 테두리 색상 결정

```javascript
const getBorderColor = () => {
  if (disabled) return 'rgba(0, 0, 0, 0.26)';
  if (error) return '#d32f2f';
  if (focused) return '#1976d2';
  return 'rgba(0, 0, 0, 0.23)';
};
```

**학습 가치**:
- 우선순위: disabled > error > focused > default
- CSS 셀렉터 대신 JavaScript로 명확한 로직
- Theme 시스템 없이도 동일한 결과

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/mui-material/src/OutlinedInput/OutlinedInput.js (180줄, 원본 463줄)

OutlinedInput (forwardRef)
  └─> div (containerStyle)
       ├─> InputBase
       │    └─> input 요소
       └─> fieldset (fieldsetStyle) - 테두리
            └─> legend (legendStyle) - notch 공간
                 └─> span (legendSpanStyle) - 라벨 텍스트
```

### 2. 로컬 상태 관리

```javascript
const [focused, setFocused] = React.useState(false);
const [filled, setFilled] = React.useState(
  Boolean(props.value || props.defaultValue)
);
```

**원본과의 차이**:
- 원본: InputBase의 renderSuffix를 통해 state 전달받음
- 단순화: 로컬 state로 focused/filled 직접 관리

### 3. FormControl 연동

```javascript
const muiFormControl = useFormControl();
const fcs = muiFormControl || {};
const disabled = disabledProp ?? fcs.disabled ?? false;
const error = errorProp ?? fcs.error ?? false;
const required = props.required ?? fcs.required ?? false;
```

**원본과의 차이**:
- 원본: formControlState 유틸리티로 7개 상태 일괄 추출
- 단순화: 필요한 상태만 직접 ?? 체인으로 추출

### 4. Props (13개만 남음)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `label` | node | - | 테두리 notch를 위한 라벨 |
| `notched` | boolean | - | notch 상태 외부 제어 |
| `disabled` | boolean | false | 비활성화 상태 |
| `error` | boolean | false | 에러 상태 |
| `fullWidth` | boolean | false | 전체 너비 |
| `multiline` | boolean | false | 멀티라인 입력 |
| `size` | 'small' \| 'medium' | - | 크기 |
| `startAdornment` | node | - | 시작 장식 요소 |
| `endAdornment` | node | - | 끝 장식 요소 |
| `inputComponent` | elementType | 'input' | input 요소 컴포넌트 |
| `type` | string | 'text' | input 타입 |
| `className` | string | - | root className |
| `required` | boolean | false | 필수 입력 표시 |

---

## 커밋 히스토리로 보는 단순화 과정

OutlinedInput은 **7개의 커밋**을 통해 단순화되었습니다.

### 1단계: Deprecated props 제거
- `5225bee8` - [OutlinedInput 단순화 1/7] Deprecated props 제거
- components prop과 fallback 체인 제거
- v4 → v5 마이그레이션용 하위 호환 API이므로 학습에 불필요

### 2단계: Color variants 동적 생성 제거
- `7825ba79` - [OutlinedInput 단순화 2/7] Color variants 동적 생성 제거
- createSimplePaletteValueFilter로 palette 순회하는 런타임 로직 제거
- primary 색상(#1976d2)으로 고정

### 3단계: Theme 시스템 제거
- `963cd737` - [OutlinedInput 단순화 3/7] Theme 시스템 제거
- memoTheme, useDefaultProps, theme.vars 조건부 처리 제거
- light mode 값으로 고정 (borderRadius: 4, colors 하드코딩)

### 4단계: Utility Classes 시스템 제거
- `b3d10fd5` - [OutlinedInput 단순화 4/7] Utility Classes 시스템 제거
- composeClasses, useUtilityClasses, getOutlinedInputUtilityClass 제거
- MuiOutlinedInput-* 클래스 생성 로직 불필요

### 5단계: useSlot 및 formControlState 제거
- `09e51f25` - [OutlinedInput 단순화 5/7] useSlot 및 formControlState 제거
- useSlot(165줄 유틸리티) 대신 직접 렌더링
- formControlState 대신 직접 useFormControl 값 사용

### 6단계: Styled 시스템 제거 및 인라인 구현
- `15c8dd08` - [OutlinedInput 단순화 6/7] Styled 시스템 제거 및 인라인 구현
- styled() API, OutlinedInputRoot/Input, NotchedOutlineRoot 모두 제거
- 인라인 스타일 객체로 직접 구현

### 7단계: PropTypes 제거
- `31a65558` - [OutlinedInput 단순화 7/7] PropTypes 제거
- PropTypes, refType import 및 정의 전체 제거
- 런타임 타입 검증은 TypeScript로 대체 가능

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 601줄 | 251줄 (58% 감소) |
| **Props 개수** | 30개+ | 13개 |
| **styled components** | 3개 (+ NotchedOutline 2개) | 0개 |
| **Theme 의존성** | memoTheme, theme.vars | 없음 (하드코딩) |
| **Color variants** | 동적 생성 | primary 고정 |
| **slots/slotProps** | 지원 | 제거 |
| **useSlot** | 사용 | 직접 렌더링 |
| **formControlState** | 사용 | 직접 값 추출 |
| **PropTypes** | 180줄 | 없음 |

---

## 학습 후 다음 단계

OutlinedInput을 이해했다면:

1. **InputBase** - OutlinedInput이 확장하는 기본 입력 컴포넌트
2. **TextField** - OutlinedInput을 사용하는 상위 컴포넌트
3. **FormControl** - Context를 통한 폼 상태 관리

**예시: 기본 사용**
```javascript
import OutlinedInput from './OutlinedInput';

function App() {
  return (
    <OutlinedInput
      label="이름"
      placeholder="이름을 입력하세요"
    />
  );
}
```

**예시: FormControl과 함께 사용**
```javascript
import FormControl from './FormControl';
import InputLabel from './InputLabel';
import OutlinedInput from './OutlinedInput';

function App() {
  return (
    <FormControl error>
      <InputLabel>이메일</InputLabel>
      <OutlinedInput label="이메일" />
      {/* error 상태가 FormControl에서 OutlinedInput으로 전달됨 */}
    </FormControl>
  );
}
```
