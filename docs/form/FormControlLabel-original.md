# FormControlLabel 컴포넌트

> FormControlLabel 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

FormControlLabel은 **Checkbox, Radio, Switch 등의 control과 label 텍스트를 함께 표시하는 wrapper** 컴포넌트입니다.

### 핵심 기능
1. **HTML label 요소** - label 클릭 시 control도 클릭됨
2. **React.cloneElement** - control에 props 주입 (checked, name, onChange 등)
3. **4가지 labelPlacement** - end(오른쪽), start(왼쪽), top(위), bottom(아래)
4. **Typography 자동 감싸기** - label을 Typography로 감싸서 일관된 스타일
5. **FormControl context 연동** - disabled, error 상태 공유
6. **required + asterisk** - 필수 필드에 * 표시

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/FormControlLabel/FormControlLabel.js (308줄)

FormControlLabel (forwardRef)
  └─> FormControlLabelRoot (styled('label'))
       ├─> control (React.cloneElement로 props 주입)
       └─> label (Typography로 감싸기) 또는 asterisk 포함 div
```

### 2. React.cloneElement로 props 전달

```javascript
const controlProps = {
  disabled,
  required,
};

['checked', 'name', 'onChange', 'value', 'inputRef'].forEach((key) => {
  if (typeof control.props[key] === 'undefined' && typeof props[key] !== 'undefined') {
    controlProps[key] = props[key];
  }
});

// control에 props 주입
{React.cloneElement(control, controlProps)}
```

**학습 포인트**:
- **React.cloneElement**: 기존 React 요소를 복제하면서 props 추가
- **조건부 props 전달**: control이 이미 가지고 있지 않은 props만 전달
- **왜 필요한가**: FormControlLabel이 checked, onChange 등을 관리하여 일관된 API 제공

### 3. labelPlacement로 위치 조정

```javascript
variants: [
  {
    props: { labelPlacement: 'start' },
    style: {
      flexDirection: 'row-reverse',  // label이 왼쪽
      marginRight: -11,
    },
  },
  {
    props: { labelPlacement: 'top' },
    style: {
      flexDirection: 'column-reverse',  // label이 위쪽
    },
  },
  {
    props: { labelPlacement: 'bottom' },
    style: {
      flexDirection: 'column',  // label이 아래쪽
    },
  },
  // 기본값 'end'는 row (label이 오른쪽)
],
```

**학습 포인트**:
- **flexDirection**: row vs row-reverse vs column vs column-reverse
- **4가지 조합**: end(row), start(row-reverse), top(column-reverse), bottom(column)

### 4. Typography 자동 감싸기

```javascript
let label = labelProp;
if (label != null && label.type !== Typography && !disableTypography) {
  label = (
    <TypographySlot
      component="span"
      {...typographySlotProps}
      className={clsx(classes.label, typographySlotProps?.className)}
    >
      {label}
    </TypographySlot>
  );
}
```

**학습 포인트**:
- label이 문자열이거나 Typography가 아니면 자동으로 Typography로 감싸기
- **disableTypography**: true면 감싸지 않음
- **일관된 스타일**: 모든 label이 동일한 typography 적용

### 5. FormControl context 연동

```javascript
const muiFormControl = useFormControl();

const disabled = disabledProp ?? control.props.disabled ?? muiFormControl?.disabled;
const required = requiredProp ?? control.props.required;

const fcs = formControlState({
  props,
  muiFormControl,
  states: ['error'],
});
```

**학습 포인트**:
- **useFormControl()**: 부모 FormControl의 context 가져오기
- **disabled 우선순위**: prop → control.props → FormControl context
- **error 상태**: FormControl의 error 상태 공유

### 6. required + asterisk

```javascript
{required ? (
  <div>
    {label}
    <AsteriskComponent ownerState={ownerState} aria-hidden className={classes.asterisk}>
      &thinsp;{'*'}
    </AsteriskComponent>
  </div>
) : (
  label
)}
```

**학습 포인트**:
- required=true일 때 label 뒤에 * 표시
- **&thinsp;**: 얇은 공백 (thin space)
- **aria-hidden**: 스크린 리더에서 숨김 (required는 input에서 이미 전달됨)

### 7. slots/slotProps 시스템

```javascript
const [TypographySlot, typographySlotProps] = useSlot('typography', {
  elementType: Typography,
  externalForwardedProps,
  ownerState,
});
```

**학습 포인트**:
- **useSlot**: slots와 slotProps를 병합하여 커스터마이징 가능한 슬롯 제공
- **TypographySlot**: 기본 Typography 또는 커스텀 컴포넌트

### 8. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `control` | element (required) | - | Checkbox, Radio, Switch 등 |
| `label` | node | - | 텍스트 또는 ReactNode |
| `labelPlacement` | 'end' \| 'start' \| 'top' \| 'bottom' | 'end' | label 위치 |
| `disabled` | boolean | - | 비활성화 상태 |
| `required` | boolean | - | 필수 필드 (asterisk 표시) |
| `disableTypography` | boolean | false | Typography 자동 감싸기 제거 |
| `checked` | boolean | - | control에 전달 |
| `onChange` | function | - | control에 전달 |
| `name` | string | - | control에 전달 |
| `value` | any | - | control에 전달 |

---

## 설계 패턴

1. **Wrapper Pattern**
   - control을 받아서 label과 함께 감싸기
   - HTML label 요소의 의미론적 이점 활용

2. **Props Injection Pattern**
   - React.cloneElement로 control에 props 주입
   - FormControlLabel이 checked, onChange 등을 통합 관리

3. **Context Integration Pattern**
   - useFormControl로 FormControl의 상태 공유
   - disabled, error 등을 자동 적용

4. **Conditional Wrapping Pattern**
   - Typography 자동 감싸기 (disableTypography로 제어)
   - required일 때 asterisk 포함 div로 감싸기

---

## 복잡도의 이유

FormControlLabel은 **308줄**이며, 복잡한 이유는:

1. **labelPlacement 4가지 (약 50줄)**
   - variants 배열 4개
   - flexDirection, margin 조합

2. **Typography 자동 감싸기 (약 30줄)**
   - useSlot으로 TypographySlot 생성
   - label.type !== Typography 체크
   - disableTypography 조건 분기

3. **FormControl context 연동 (약 30줄)**
   - useFormControl()
   - formControlState()
   - disabled, error 상태 처리

4. **required + asterisk (약 20줄)**
   - AsteriskComponent styled 컴포넌트
   - 조건부 렌더링 (div vs label 직접)

5. **styled 시스템 (약 60줄)**
   - FormControlLabelRoot, AsteriskComponent
   - memoTheme, variants 배열
   - ownerState 전달

6. **useUtilityClasses (약 20줄)**
   - disabled, labelPlacement, error, required별 조건부 className

7. **PropTypes (약 92줄)**
   - 타입 검증

---

## 비교: 직접 label vs FormControlLabel

| 기능 | 직접 label | FormControlLabel |
|------|-----------|------------------|
| **기본 사용** | `<label><Checkbox />텍스트</label>` | `<FormControlLabel control={<Checkbox />} label="텍스트" />` |
| **label 위치** | flexDirection 수동 설정 | ✅ labelPlacement prop |
| **Typography** | 수동으로 감싸기 | ✅ 자동 감싸기 |
| **FormControl 연동** | 수동으로 props 전달 | ✅ 자동 연동 |
| **required asterisk** | 수동으로 추가 | ✅ required prop |
| **번들 크기** | 0 KB | ~8 KB |

**FormControlLabel의 장점**:
- Typography 자동 감싸기
- FormControl context 자동 연동
- labelPlacement로 간편한 위치 조정
- required asterisk 자동 표시

**FormControlLabel의 단점**:
- 복잡한 내부 구조
- styled 시스템 의존
- slots/slotProps 시스템
- 번들 크기 증가
