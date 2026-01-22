# FormGroup 컴포넌트

> Material-UI의 FormGroup 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

FormGroup는 **Checkbox, Switch 같은 폼 컨트롤을 그룹으로 묶어 레이아웃하는 래퍼 컴포넌트**입니다.

### 핵심 기능
1. **Flexbox 레이아웃** - 자식 컨트롤들을 column 또는 row 방향으로 배치
2. **row 모드** - `row={true}`로 가로 배치 전환
3. **FormControl 연동** - 부모 FormControl의 error 상태를 동기화

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/FormGroup/FormGroup.js (109줄)
FormGroup (React.forwardRef)
  └─> FormGroupRoot (styled div)
       └─> children (Checkbox, Switch 등)
```

### 2. useUtilityClasses

```javascript
const useUtilityClasses = (ownerState) => {
  const { classes, row, error } = ownerState;

  const slots = {
    root: ['root', row && 'row', error && 'error'],
  };

  return composeClasses(slots, getFormGroupUtilityClass, classes);
};
```

조건에 따라 CSS 클래스 생성:
- `MuiFormGroup-root`
- `MuiFormGroup-row` (row={true}일 때)
- `MuiFormGroup-error` (error 상태일 때)

### 3. FormGroupRoot (styled 컴포넌트)

```javascript
const FormGroupRoot = styled('div', {
  name: 'MuiFormGroup',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;
    return [styles.root, ownerState.row && styles.row];
  },
})({
  display: 'flex',
  flexDirection: 'column',
  flexWrap: 'wrap',
  variants: [
    {
      props: { row: true },
      style: {
        flexDirection: 'row',
      },
    },
  ],
});
```

- 기본: `flexDirection: 'column'` (세로 배치)
- `row={true}`: `flexDirection: 'row'` (가로 배치)
- `flexWrap: 'wrap'`으로 넘치면 줄바꿈

### 4. FormControl 연동

```javascript
const muiFormControl = useFormControl();
const fcs = formControlState({
  props,
  muiFormControl,
  states: ['error'],
});

const ownerState = { ...props, row, error: fcs.error };
```

- `useFormControl()`: 부모 FormControl Context에서 상태 가져오기
- `formControlState()`: props와 Context 상태를 병합 (props 우선)
- `error` 상태만 동기화 (disabled, required 등은 사용하지 않음)

### 5. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | ReactNode | - | 그룹 내 컨트롤 (Checkbox, Switch 등) |
| `classes` | object | - | CSS 클래스 오버라이드 |
| `className` | string | - | 외부 클래스 |
| `row` | boolean | false | 가로 배치 여부 |
| `sx` | object | - | 시스템 스타일 |

---

## 설계 패턴

1. **Wrapper 패턴**
   - 자식 컴포넌트를 감싸서 레이아웃만 담당
   - 자식의 동작에는 관여하지 않음

2. **Context 연동 패턴**
   - FormControl Context를 구독하여 상태 동기화
   - `formControlState`로 props와 Context 병합

---

## 복잡도의 이유

FormGroup은 **109줄**이며, 비교적 단순한 편입니다:

1. **Theme 시스템** (약 30줄)
   - useDefaultProps
   - useUtilityClasses
   - styled 컴포넌트

2. **PropTypes** (약 32줄)
   - 런타임 타입 검증

3. **FormControl 연동** (약 10줄)
   - useFormControl
   - formControlState

---

## FormGroup vs RadioGroup

| 기능 | FormGroup | RadioGroup |
|------|-----------|------------|
| 용도 | Checkbox, Switch 그룹 | Radio 그룹 |
| 값 관리 | 없음 (개별 관리) | value/onChange로 단일 선택 관리 |
| Context | FormControl error만 동기화 | RadioGroup Context 제공 |

> Radio를 그룹화할 때는 FormGroup이 아닌 RadioGroup을 사용해야 합니다.
