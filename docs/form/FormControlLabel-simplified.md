# FormControlLabel 컴포넌트

> HTML label 요소와 React.cloneElement로 구현한 control + label wrapper

---

## 이 문서의 목적

**이 문서는 단순화된 코드의 "설명서"입니다.**

FormControlLabel의 핵심은 "HTML label 요소로 control과 텍스트를 감싸고, React.cloneElement로 props를 주입"입니다. 이 문서는 이러한 패턴들이 어떻게 동작하는지 상세히 설명합니다.

---

## 무슨 기능을 하는가?

단순화된 FormControlLabel은 **HTML label 요소로 Checkbox, Radio, Switch 등의 control과 label 텍스트를 함께 표시하는** wrapper 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **HTML label 요소** - label 클릭 시 control도 클릭됨
2. **React.cloneElement** - control에 props 주입
3. **forEach로 props 선택적 전달** - control이 없는 props만 전달
4. **display: inline-flex** - control과 label 정렬

---

## 핵심 학습 포인트

### 1. HTML label 요소의 동작

```javascript
<label>
  <Checkbox />
  텍스트
</label>
```

**학습 가치**:
- **label 요소**: form control과 텍스트를 연결
- **클릭 동작**: label의 어디를 클릭해도 내부 control이 클릭됨
- **접근성**: 스크린 리더가 control과 label의 관계를 이해
- **for 속성 불필요**: control을 label 내부에 넣으면 for 속성 없이도 연결됨

**for 속성 방식 vs 내부 포함 방식**:
```html
<!-- for 속성 방식 -->
<label for="checkbox-id">텍스트</label>
<input id="checkbox-id" type="checkbox" />

<!-- 내부 포함 방식 (FormControlLabel 방식) -->
<label>
  <input type="checkbox" />
  텍스트
</label>
```

### 2. React.cloneElement로 props 주입

```javascript
const controlProps = {};

['checked', 'name', 'onChange', 'value', 'inputRef'].forEach((key) => {
  if (typeof control.props[key] === 'undefined' && typeof props[key] !== 'undefined') {
    controlProps[key] = props[key];
  }
});

return (
  <label>
    {React.cloneElement(control, controlProps)}
    {label}
  </label>
);
```

**학습 가치**:
- **React.cloneElement(element, props)**: 기존 React 요소를 복제하면서 props 추가
- **조건부 전달**: control이 이미 가지고 있지 않은 props만 전달
- **왜 필요한가**: FormControlLabel이 checked, onChange 등을 통합 관리하여 일관된 API 제공

**React.cloneElement 동작**:
```javascript
// 원본 control
<Checkbox disabled />

// FormControlLabel에 checked, onChange 전달
<FormControlLabel
  control={<Checkbox disabled />}
  checked={true}
  onChange={handleChange}
  label="동의"
/>

// React.cloneElement 결과
<Checkbox
  disabled        // 원래 있던 prop
  checked={true}  // 추가된 prop
  onChange={handleChange}  // 추가된 prop
/>
```

### 3. forEach로 props 선택적 전달

```javascript
['checked', 'name', 'onChange', 'value', 'inputRef'].forEach((key) => {
  if (typeof control.props[key] === 'undefined' && typeof props[key] !== 'undefined') {
    controlProps[key] = props[key];
  }
});
```

**학습 가치**:
- **조건**: `control.props[key] === 'undefined'` AND `props[key] !== 'undefined'`
- **의미**: control에 없고, FormControlLabel에 있는 props만 전달
- **왜 조건이 필요한가**: control이 이미 가진 props를 덮어쓰지 않기 위해

**예시**:
```javascript
// Case 1: control에 이미 checked가 있음
<FormControlLabel
  control={<Checkbox checked={false} />}
  checked={true}  // 무시됨 (control의 false 유지)
/>

// Case 2: control에 checked가 없음
<FormControlLabel
  control={<Checkbox />}
  checked={true}  // 전달됨
/>
```

### 4. display: inline-flex로 정렬

```javascript
const rootStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  cursor: 'pointer',
  verticalAlign: 'middle',
};
```

**학습 가치**:
- **display: inline-flex**: block이 아니라 inline처럼 동작하는 flex 컨테이너
- **alignItems: center**: 세로 중앙 정렬 (Checkbox와 텍스트 높이 맞춤)
- **cursor: pointer**: label 위에서 커서가 pointer로 변경 (클릭 가능함을 표시)
- **verticalAlign: middle**: 인라인 요소로서 주변 텍스트와 중앙 정렬

---

## 내부 구조

### 1. 렌더링 구조

```javascript
// 위치: packages/mui-material/src/FormControlLabel/FormControlLabel.js (46줄, 원본 308줄)

FormControlLabel (forwardRef)
  └─> label
       ├─> React.cloneElement(control, controlProps)
       └─> label (텍스트)
```

### 2. 핵심 상태 (ref, state, 변수)

| 이름 | 타입 | 용도 |
|------|------|------|
| `controlProps` | 객체 | control에 주입할 props |
| `rootStyle` | 객체 | label 요소 스타일 |

### 3. 주요 변경 사항 (원본 대비)

**원본과의 차이**:
- ❌ `labelPlacement` prop 제거 → 'end'로 고정 (label이 오른쪽)
- ❌ `disabled` prop 제거 → false로 고정
- ❌ `required` prop 제거 → false로 고정, asterisk 제거
- ❌ `disableTypography` prop 제거 → Typography 자동 감싸기 제거
- ❌ `slots`, `slotProps`, `componentsProps` 제거
- ❌ useFormControl, formControlState 제거 → FormControl context 제거
- ❌ Typography import 및 자동 감싸기 제거
- ❌ AsteriskComponent 제거
- ❌ Theme 시스템 (useDefaultProps, useUtilityClasses) 제거
- ❌ styled 시스템 (FormControlLabelRoot, variants) 제거
- ❌ PropTypes (92줄) 제거
- ✅ forwardRef 유지
- ✅ React.cloneElement 패턴 유지
- ✅ forEach 조건부 props 전달 유지

### 4. Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `control` | element | - | Checkbox, Radio, Switch 등 |
| `label` | ReactNode | - | 텍스트 또는 ReactNode |
| `checked` | boolean | - | control에 전달 |
| `name` | string | - | control에 전달 |
| `onChange` | function | - | control에 전달 |
| `value` | any | - | control에 전달 |
| `inputRef` | ref | - | control에 전달 |
| `className` | string | - | 추가 CSS 클래스 |
| `style` | object | - | 인라인 스타일 |
| `...other` | any | - | 기타 HTML label 속성 |

**제거된 Props**:
- ❌ `labelPlacement`, `disabled`, `required`, `disableTypography` - 모두 제거
- ❌ `slots`, `slotProps`, `componentsProps` - slots 시스템 제거

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 308줄 | 46줄 (85.1% 감소) |
| **Props 개수** | 14개 | 10개 (checked, name, onChange, value, inputRef, control, label, className, style, other) |
| **labelPlacement** | ✅ 4가지 | ❌ end 고정 |
| **disabled** | ✅ FormControl 연동 | ❌ false 고정 |
| **required** | ✅ asterisk 표시 | ❌ false 고정 |
| **Typography** | ✅ 자동 감싸기 | ❌ 제거 |
| **FormControl** | ✅ context 연동 | ❌ 제거 |
| **slots** | ✅ 커스터마이징 | ❌ 제거 |
| **styled 시스템** | ✅ ~100줄 | ❌ 인라인 스타일 9줄 |
| **label 요소** | ✅ | ✅ (유지) |
| **React.cloneElement** | ✅ | ✅ (유지) |

---

## 학습 후 다음 단계

FormControlLabel을 이해했다면:

1. **Checkbox, Radio, Switch** - FormControlLabel과 함께 사용되는 control 컴포넌트
2. **FormControl, FormGroup** - 여러 FormControlLabel을 그룹화
3. **React.cloneElement** - 고급 패턴, 언제 사용해야 하는지
4. **실전 응용** - 커스텀 form control wrapper 만들기

**예시: 기본 사용**
```javascript
import FormControlLabel from './FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

function App() {
  const [checked, setChecked] = React.useState(false);

  return (
    <FormControlLabel
      control={<Checkbox />}
      label="동의합니다"
      checked={checked}
      onChange={(e) => setChecked(e.target.checked)}
    />
  );
}
```

**예시: control에 직접 props 주기**
```javascript
// control에 이미 props가 있으면 FormControlLabel의 props는 무시됨
<FormControlLabel
  control={<Checkbox checked={true} onChange={handleChange} />}
  label="동의"
  // 아래 props는 무시됨 (control에 이미 있음)
  checked={false}
  onChange={() => {}}
/>
```

**예시: 여러 FormControlLabel**
```javascript
<div>
  <FormControlLabel
    control={<Checkbox />}
    label="옵션 1"
    name="option1"
  />
  <FormControlLabel
    control={<Checkbox />}
    label="옵션 2"
    name="option2"
  />
</div>
```

**예시: 커스텀 스타일**
```javascript
<FormControlLabel
  control={<Checkbox />}
  label="동의"
  style={{
    marginLeft: 0,  // 기본 -11px 제거
    marginRight: 32,  // 기본 16px → 32px
  }}
/>
```

---

## 결론

단순화된 FormControlLabel의 핵심은:
- ✅ **HTML label 요소**: label 클릭 시 control 클릭
- ✅ **React.cloneElement**: control에 props 주입
- ✅ **forEach 조건부 전달**: control이 없는 props만 전달
- ✅ **display: inline-flex**: control과 label 정렬

**핵심 교훈**: 복잡한 FormControl context, Typography 자동 감싸기, slots 시스템을 제거해도, HTML label 요소와 React.cloneElement만으로 충분히 효과적인 control + label wrapper를 만들 수 있습니다.
