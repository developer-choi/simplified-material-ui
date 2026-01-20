# FormHelperText 컴포넌트

> FormControl과 연동하여 상태에 따라 색상이 변하는 단순화된 도움말 텍스트

---

## 무슨 기능을 하는가?

수정된 FormHelperText는 **폼 요소 아래에 도움말 텍스트나 에러 메시지를 표시하고, FormControl Context를 통해 상태를 읽어 색상을 변경하는** 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **도움말 텍스트 표시** - 입력 필드에 대한 안내 메시지 렌더링
2. **에러 메시지 표시** - error 상태일 때 빨간색으로 색상 변경
3. **FormControl 통합** - 부모 FormControl의 상태(error, disabled 등)를 자동으로 읽어 반영
4. **공백 children 처리** - `' '` 전달 시 높이 유지용 빈 줄 렌더링

---

## 핵심 학습 포인트

### 1. FormControl Context 통합

```javascript
const muiFormControl = useFormControl();
const fcs = formControlState({
  props: inProps,
  muiFormControl,
  states: ['disabled', 'error', 'filled', 'focused', 'required'],
});
```

**학습 가치:**
- Context를 통한 부모-자식 상태 공유 패턴
- props와 context 값의 우선순위 병합 로직
- 폼 컴포넌트 간 상태 동기화 메커니즘

### 2. 상태 기반 동적 스타일링

```javascript
const getTextColor = () => {
  if (fcs.error) return '#d32f2f';           // error.main
  if (fcs.disabled) return 'rgba(0, 0, 0, 0.38)'; // text.disabled
  return 'rgba(0, 0, 0, 0.6)';               // text.secondary
};
```

**학습 가치:**
- 상태 우선순위에 따른 스타일 결정 (error > disabled > default)
- 인라인 스타일로 동적 색상 적용
- Material Design 색상 규칙 이해

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/mui-material/src/FormHelperText/FormHelperText.js (65줄, 원본 207줄)

FormHelperText (forwardRef)
  └─> <p style={rootStyle}>
       └─> children (text)
       └─> <span> (children === ' ' 일 때 zero-width space)
```

### 2. 핵심 상태 (ref, state, 변수)

| 이름 | 용도 |
|------|------|
| `muiFormControl` | FormControlContext에서 가져온 상위 폼 상태 |
| `fcs` | formControlState 병합 결과 (props와 context 병합) |
| `rootStyle` | 동적 색상이 적용된 인라인 스타일 객체 |

### 3. 함수 역할

#### getTextColor()
- **역할**: 현재 상태(error, disabled)에 따라 텍스트 색상 반환
- **호출 시점**: rootStyle 객체 생성 시
- **핵심 로직**:
```javascript
const getTextColor = () => {
  if (fcs.error) return '#d32f2f';           // 에러: 빨간색
  if (fcs.disabled) return 'rgba(0, 0, 0, 0.38)'; // 비활성화: 연한 회색
  return 'rgba(0, 0, 0, 0.6)';               // 기본: 진한 회색
};
```

### 4. 인라인 스타일 (styled 대체)

```javascript
const rootStyle = {
  color: getTextColor(),
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  fontWeight: 400,
  fontSize: '0.75rem',
  lineHeight: 1.66,
  letterSpacing: '0.03333em',
  textAlign: 'left',
  marginTop: 3,
  marginRight: 0,
  marginBottom: 0,
  marginLeft: 0,
};
```

> **원본과의 차이:**
> - ❌ `styled('p')` → `<p style={...}>`
> - ❌ `memoTheme` → 직접 스타일 객체
> - ❌ `theme.typography.caption` → 인라인으로 동일한 값 하드코딩
> - ❌ `variants` 배열 → `getTextColor()` 함수로 단순화

### 5. 공백 children 처리 (유지됨)

```javascript
{children === ' ' ? (
  <span className="notranslate" aria-hidden>
    &#8203;
  </span>
) : (
  children
)}
```

**목적**: `children=' '` 전달 시 zero-width space로 높이 유지 (나중에 에러 메시지 표시할 공간 확보)

### 6. Props (7개만 남음)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | `node` | - | 도움말 텍스트. `' '`이면 높이 유지용 빈 줄 |
| `className` | `string` | - | CSS 클래스 |
| `disabled` | `boolean` | - | 비활성화 상태 |
| `error` | `boolean` | - | 에러 상태 |
| `filled` | `boolean` | - | 채워진 상태 |
| `focused` | `boolean` | - | 포커스 상태 |
| `required` | `boolean` | - | 필수 상태 |

> **제거된 Props:**
> - ❌ `component` - p 고정
> - ❌ `classes` - 클래스 시스템 제거
> - ❌ `sx` - styled 시스템 제거
> - ❌ `margin` - 스타일 변형 제거
> - ❌ `variant` - 스타일 변형 제거

---

## 커밋 히스토리로 보는 단순화 과정

FormHelperText는 **4개의 커밋**을 통해 단순화되었습니다.

### 1단계: useDefaultProps 제거
- `89399faf` - [FormHelperText 단순화 1/4] useDefaultProps 제거
- 테마에서 기본 props를 가져오는 기능 제거
- 함수 파라미터 기본값으로 충분함 (학습 시 테마 시스템은 별도 주제)

### 2단계: useUtilityClasses, composeClasses 제거
- `6e3dd53a` - [FormHelperText 단순화 2/4] useUtilityClasses, composeClasses 제거
- 동적 클래스 이름 생성 시스템 제거
- 인라인 스타일 사용으로 클래스 불필요

### 3단계: styled 시스템 제거
- `8327b185` - [FormHelperText 단순화 3/4] styled 시스템 제거
- CSS-in-JS 스타일링 제거
- 일반 `<p>` 엘리먼트 + 인라인 스타일로 대체

### 4단계: PropTypes 제거
- `667216e1` - [FormHelperText 단순화 4/4] PropTypes 제거
- 런타임 타입 검증 제거
- TypeScript 사용 시 빌드 타임에 검증

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 207줄 | 65줄 (69% 감소) |
| **Props 개수** | 12개 | 7개 |
| **외부 의존성** | 10개 | 2개 |
| **styled 컴포넌트** | ✅ FormHelperTextRoot | ❌ |
| **useDefaultProps** | ✅ | ❌ |
| **useUtilityClasses** | ✅ | ❌ |
| **PropTypes** | ✅ (65줄) | ❌ |
| **FormControl 통합** | ✅ | ✅ (유지) |
| **공백 children 처리** | ✅ | ✅ (유지) |
| **component prop** | ✅ 변경 가능 | ❌ p 고정 |
| **variant prop** | ✅ 스타일 변형 | ❌ 고정 |

---

## 학습 후 다음 단계

FormHelperText를 이해했다면:

1. **FormLabel** - FormControl과 연동하는 라벨 컴포넌트 (같은 패턴)
2. **FormControl** - FormHelperText에 상태를 제공하는 Context Provider
3. **InputLabel** - FormLabel을 확장하여 shrink 애니메이션 추가

**예시: 기본 사용**
```javascript
<FormHelperText>Enter your email address</FormHelperText>
```

**예시: FormControl과 함께 사용**
```javascript
<FormControl error>
  <InputLabel>Email</InputLabel>
  <Input />
  <FormHelperText>Invalid email format</FormHelperText>
</FormControl>
// FormHelperText는 자동으로 error 상태를 FormControl에서 읽어 빨간색으로 표시
```

**예시: 높이 유지용 공백**
```javascript
<FormControl>
  <InputLabel>Username</InputLabel>
  <Input />
  <FormHelperText> </FormHelperText>
</FormControl>
// 에러 발생 전까지 빈 공간 유지 → 레이아웃 점프 방지
```

**예시: 직접 상태 제어**
```javascript
<FormHelperText error disabled>
  This field has an error
</FormHelperText>
// FormControl 없이 직접 props로 상태 전달
```
