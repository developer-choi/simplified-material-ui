# FormLabel 컴포넌트

> FormControl과 연동하여 상태에 따라 색상이 변하는 단순화된 폼 라벨

---

## 무슨 기능을 하는가?

수정된 FormLabel은 **폼 요소에 라벨을 표시하고, FormControl Context를 통해 상태를 읽어 색상을 변경하는 컴포넌트**입니다.

### 핵심 기능 (남은 것)
1. **라벨 텍스트 표시** - 폼 요소에 대한 설명 텍스트 렌더링
2. **Required 표시** - 필수 입력 필드에 별표(*) 자동 표시
3. **FormControl 통합** - 부모 FormControl의 상태를 자동으로 읽어 색상 변경
4. **상태별 색상 변경** - focused, disabled, error 상태에 따라 색상 자동 변경

---

## 핵심 학습 포인트

### 1. FormControl Context 통합

```javascript
const muiFormControl = useFormControl();
const fcs = formControlState({
  props,
  muiFormControl,
  states: ['color', 'required', 'focused', 'disabled', 'error', 'filled'],
});
```

**학습 가치:**
- Context를 통한 부모-자식 상태 공유 패턴
- props와 context 값의 우선순위 병합 로직
- 폼 컴포넌트 간 상태 동기화 메커니즘

### 2. 상태 기반 동적 스타일링

```javascript
const getLabelColor = () => {
  if (fcs.error) return '#d32f2f';
  if (fcs.disabled) return 'rgba(0, 0, 0, 0.38)';
  if (fcs.focused) return '#1976d2';
  return 'rgba(0, 0, 0, 0.6)';
};
```

**학습 가치:**
- 상태 우선순위에 따른 스타일 결정 (error > disabled > focused > default)
- 인라인 스타일로 동적 색상 적용
- Material Design 색상 규칙 이해

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/mui-material/src/FormLabel/FormLabel.js (63줄, 원본 203줄)

<label
  className={className}
  ref={ref}
  style={rootStyle}
  {...other}
>
  {children}
  {fcs.required && (
    <span aria-hidden style={{ color: fcs.error ? '#d32f2f' : 'inherit' }}>
      &thinsp;{'*'}
    </span>
  )}
</label>
```

### 2. FormControl 통합 (유지됨)

```javascript
const muiFormControl = useFormControl();
const fcs = formControlState({
  props,
  muiFormControl,
  states: ['color', 'required', 'focused', 'disabled', 'error', 'filled'],
});
```

FormControl과의 통합은 학습 목적으로 유지되었습니다:
- `useFormControl()` - FormControlContext 구독
- `formControlState()` - props와 context 값 병합

**formControlState 동작 원리:**
1. props에 값이 있으면 → props 값 사용 (명시적 제어)
2. props에 값이 없고 muiFormControl이 있으면 → FormControl 값 사용
3. 둘 다 없으면 → undefined

### 3. 인라인 스타일 (styled 대체)

```javascript
const rootStyle = {
  color: getLabelColor(),
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  fontWeight: 400,
  fontSize: '1rem',
  lineHeight: '1.4375em',
  letterSpacing: '0.00938em',
  padding: 0,
  position: 'relative',
};
```

> **원본과의 차이:**
> - ❌ `styled('label')` → `<label style={...}>`
> - ❌ `memoTheme` → 직접 스타일 객체
> - ❌ `theme.typography.body1` → 인라인으로 동일한 값 하드코딩
> - ❌ `variants` 배열 → `getLabelColor()` 함수로 단순화

### 4. Props (7개만 남음)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | `node` | - | 라벨 텍스트 또는 요소 |
| `className` | `string` | - | CSS 클래스 |
| `disabled` | `boolean` | - | 비활성화 상태 |
| `error` | `boolean` | - | 에러 상태 |
| `filled` | `boolean` | - | 채워진 상태 |
| `focused` | `boolean` | - | 포커스 상태 |
| `required` | `boolean` | - | 필수 표시 |

> **제거된 Props:**
> - ❌ `color` - primary 고정
> - ❌ `component` - label 고정
> - ❌ `classes` - 클래스 시스템 제거
> - ❌ `sx` - styled 시스템 제거

---

## 커밋 히스토리로 보는 단순화 과정

FormLabel은 **5개의 커밋**을 통해 단순화되었습니다.

### 1단계: useDefaultProps 제거
- `59c4b27f` - [FormLabel 단순화 1/5] useDefaultProps 제거
- 테마에서 기본 props를 가져오는 기능 제거
- 함수 파라미터 기본값으로 충분함 (학습 시 테마 시스템은 별도 주제)

### 2단계: useUtilityClasses, composeClasses 제거
- `a045564c` - [FormLabel 단순화 2/5] useUtilityClasses, composeClasses 제거
- 동적 클래스 이름 생성 시스템 제거
- 인라인 스타일 사용으로 클래스 불필요

### 3단계: styled 시스템 제거 (FormLabelRoot)
- `940b66c4` - [FormLabel 단순화 3/5] styled 시스템 제거 - FormLabelRoot
- CSS-in-JS 스타일링 제거
- 일반 `<label>` 엘리먼트 + 인라인 스타일로 대체

### 4단계: styled 시스템 제거 (AsteriskComponent)
- `e24f3eb1` - [FormLabel 단순화 4/5] styled 시스템 제거 - AsteriskComponent
- 별표(*) styled 컴포넌트 제거
- 일반 `<span>` + 인라인 스타일로 대체

### 5단계: PropTypes 제거
- `94ac1227` - [FormLabel 단순화 5/5] PropTypes 제거
- 런타임 타입 검증 제거
- TypeScript 사용 시 빌드 타임에 검증

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 203줄 | 63줄 (69% 감소) |
| **Props 개수** | 11개 | 7개 |
| **외부 의존성** | 13개 | 2개 |
| **styled 컴포넌트** | ✅ 2개 | ❌ |
| **useDefaultProps** | ✅ | ❌ |
| **useUtilityClasses** | ✅ | ❌ |
| **PropTypes** | ✅ (60줄) | ❌ |
| **FormControl 통합** | ✅ | ✅ (유지) |
| **color prop** | ✅ 다양한 색상 | ❌ primary 고정 |
| **component prop** | ✅ 변경 가능 | ❌ label 고정 |

---

## 학습 후 다음 단계

FormLabel을 이해했다면:

1. **InputLabel** - FormLabel을 확장하여 shrink 애니메이션 추가
2. **FormControl** - FormLabel에 상태를 제공하는 Context Provider
3. **FormHelperText** - FormControl과 연동하는 또 다른 컴포넌트

**예시: 기본 사용**
```javascript
<FormLabel>Username</FormLabel>
```

**예시: FormControl과 함께 사용**
```javascript
<FormControl error required>
  <FormLabel>Email</FormLabel>
  <Input />
  <FormHelperText>Required field</FormHelperText>
</FormControl>
// FormLabel은 자동으로 error, required 상태를 FormControl에서 읽음
```

**예시: 직접 상태 제어**
```javascript
<FormLabel error focused required>
  Password
</FormLabel>
// FormControl 없이 직접 props로 상태 전달
```
