# FormLabel 컴포넌트

> Material-UI의 FormLabel 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

FormLabel은 **폼 요소에 라벨을 표시하고, FormControl과 연동하여 상태(disabled, error, focused 등)에 따라 스타일이 변하는 기본 라벨 컴포넌트**입니다.

### 핵심 기능
1. **라벨 텍스트 표시** - 폼 요소에 대한 설명 텍스트 렌더링
2. **Required 표시** - 필수 입력 필드에 별표(*) 자동 표시
3. **FormControl 통합** - 부모 FormControl의 상태를 자동으로 읽어 스타일 조정
4. **상태별 색상 변경** - focused, disabled, error 상태에 따라 색상 자동 변경

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/FormLabel/FormLabel.js (203줄)

<FormLabelRoot           // styled('label')
  as={component}
  ownerState={ownerState}
  className={clsx(classes.root, className)}
  ref={ref}
  {...other}
>
  {children}
  {fcs.required && (
    <AsteriskComponent   // styled('span')
      ownerState={ownerState}
      aria-hidden
      className={classes.asterisk}
    >
      &thinsp;{'*'}
    </AsteriskComponent>
  )}
</FormLabelRoot>
```

### 2. Theme 시스템 통합

DefaultPropsProvider를 통한 전역 기본값 주입:

```javascript
// 89줄
const props = useDefaultProps({ props: inProps, name: 'MuiFormLabel' });
```

**역할:**
- theme.components.MuiFormLabel.defaultProps에 정의된 값을 자동으로 병합
- 전역적으로 color 등의 기본값 설정 가능

### 3. FormControl 통합

FormControl 컨텍스트에서 상태 읽기:

```javascript
// 103-108줄
const muiFormControl = useFormControl();
const fcs = formControlState({
  props,
  muiFormControl,
  states: ['color', 'required', 'focused', 'disabled', 'error', 'filled'],
});
```

**formControlState 동작:**
1. props에 값이 있으면 props 값 사용
2. props에 값이 없고 muiFormControl이 있으면 FormControl 값 사용
3. 둘 다 없으면 undefined

### 4. Styled 시스템 - FormLabelRoot

```javascript
// 33-75줄
export const FormLabelRoot = styled('label', {
  name: 'MuiFormLabel',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;
    return [
      styles.root,
      ownerState.color === 'secondary' && styles.colorSecondary,
      ownerState.filled && styles.filled,
    ];
  },
})(
  memoTheme(({ theme }) => ({
    color: (theme.vars || theme).palette.text.secondary,
    ...theme.typography.body1,
    lineHeight: '1.4375em',
    padding: 0,
    position: 'relative',
    variants: [
      // 동적 color variants (primary, secondary, error, info, success, warning)
      ...Object.entries(theme.palette)
        .filter(createSimplePaletteValueFilter())
        .map(([color]) => ({
          props: { color },
          style: {
            [`&.${formLabelClasses.focused}`]: {
              color: (theme.vars || theme).palette[color].main,
            },
          },
        })),
      // disabled, error 상태
      {
        props: {},
        style: {
          [`&.${formLabelClasses.disabled}`]: {
            color: (theme.vars || theme).palette.text.disabled,
          },
          [`&.${formLabelClasses.error}`]: {
            color: (theme.vars || theme).palette.error.main,
          },
        },
      },
    ],
  })),
);
```

**핵심 스타일:**
- 기본 색상: `palette.text.secondary` (rgba(0, 0, 0, 0.6))
- focused 색상: `palette[color].main` (예: primary → #1976d2)
- disabled 색상: `palette.text.disabled` (rgba(0, 0, 0, 0.38))
- error 색상: `palette.error.main` (#d32f2f)

### 5. Styled 시스템 - AsteriskComponent

```javascript
// 77-86줄
const AsteriskComponent = styled('span', {
  name: 'MuiFormLabel',
  slot: 'Asterisk',
})(
  memoTheme(({ theme }) => ({
    [`&.${formLabelClasses.error}`]: {
      color: (theme.vars || theme).palette.error.main,
    },
  })),
);
```

**역할:**
- Required 필드에 표시되는 별표(*)
- error 상태일 때 빨간색으로 변경

### 6. Utility Classes 시스템

```javascript
// 15-31줄
const useUtilityClasses = (ownerState) => {
  const { classes, color, focused, disabled, error, filled, required } = ownerState;
  const slots = {
    root: [
      'root',
      `color${capitalize(color)}`,     // colorPrimary, colorSecondary
      disabled && 'disabled',
      error && 'error',
      filled && 'filled',
      focused && 'focused',
      required && 'required',
    ],
    asterisk: ['asterisk', error && 'error'],
  };

  return composeClasses(slots, getFormLabelUtilityClasses, classes);
};
```

**생성되는 클래스 이름:**
- `MuiFormLabel-root`
- `MuiFormLabel-colorPrimary`, `MuiFormLabel-colorSecondary`
- `MuiFormLabel-focused`
- `MuiFormLabel-disabled`
- `MuiFormLabel-error`
- `MuiFormLabel-filled`
- `MuiFormLabel-required`
- `MuiFormLabel-asterisk`

### 7. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | `node` | - | 라벨 텍스트 또는 요소 |
| `className` | `string` | - | CSS 클래스 |
| `color` | `'primary' \| 'secondary' \| ...` | `'primary'` | 색상 테마 |
| `component` | `elementType` | `'label'` | 렌더링할 HTML 요소 |
| `disabled` | `boolean` | - | 비활성화 상태 |
| `error` | `boolean` | - | 에러 상태 |
| `filled` | `boolean` | - | 채워진 상태 |
| `focused` | `boolean` | - | 포커스 상태 |
| `required` | `boolean` | - | 필수 표시 |
| `classes` | `object` | - | 스타일 오버라이드 |
| `sx` | `SxProps<Theme>` | - | 시스템 스타일 |

---

## 설계 패턴

1. **Context Pattern (컨텍스트)**
   - useFormControl()로 FormControlContext 구독
   - 부모 FormControl의 상태를 자동으로 전파받음
   - 개별 props 전달 없이도 상태 동기화

2. **Styled Components Pattern**
   - styled() API로 동적 스타일 생성
   - ownerState 기반 조건부 스타일
   - variants 배열로 상태별 스타일 처리

3. **Theme Integration Pattern**
   - useDefaultProps()로 테마 기본값 주입
   - memoTheme()로 테마 변경 시에만 재계산
   - theme.palette로 일관된 색상 적용

4. **Utility Classes Pattern**
   - 상태별로 클래스 이름 자동 생성
   - CSS 모듈이나 테마 오버라이드 지원
   - composeClasses()로 클래스 병합

---

## 복잡도의 이유

FormLabel은 **203줄**이며, 복잡한 이유는:

1. **Styled 시스템 오버헤드 (53줄)**
   - FormLabelRoot styled 컴포넌트 (33-75줄, 43줄)
   - AsteriskComponent styled 컴포넌트 (77-86줄, 10줄)
   - overridesResolver 로직
   - variants 배열로 동적 색상 처리
   - memoTheme 래퍼

2. **Theme 통합 복잡도**
   - useDefaultProps (테마 기본값 병합)
   - createSimplePaletteValueFilter (팔레트 필터링)
   - Object.entries(theme.palette) 순회

3. **Utility Classes 시스템 (17줄)**
   - useUtilityClasses 함수 (15-31줄)
   - composeClasses 호출
   - 8개 클래스 이름 생성

4. **PropTypes (60줄)**
   - PropTypes 선언 (141-200줄)
   - JSDoc 주석 포함
   - 실제 컴포넌트 로직보다 많음

5. **FormControl 통합 로직**
   - useFormControl 구독
   - formControlState 유틸리티
   - 6개 상태 동기화 (color, required, focused, disabled, error, filled)

6. **다양한 유틸리티 의존성**
   - composeClasses, clsx (클래스 병합)
   - capitalize (문자열 변환)
   - formControlState (상태 도출)

---

## 비교: FormLabel vs InputLabel

| 기능 | FormLabel | InputLabel |
|------|-----------|------------|
| **목적** | 일반 폼 라벨 (RadioGroup, FormGroup 등) | 입력 필드 전용 라벨 (TextField, Select) |
| **위치** | 정적 (항상 고정) | 동적 (shrink 애니메이션) |
| **Variant** | ❌ 없음 | ✅ filled, outlined, standard |
| **Transform** | ❌ 없음 | ✅ variant별 transform |
| **Shrink** | ❌ 없음 | ✅ 자동 계산 및 수동 제어 |
| **Required 표시** | ✅ asterisk 렌더링 | ✅ FormLabel 상속 |
| **코드 라인** | 203줄 | 304줄 |

**관계:**
- InputLabel은 FormLabel을 `styled(FormLabel)`로 확장
- FormLabel의 기본 기능(color, disabled, error, asterisk)을 상속
- InputLabel은 여기에 variant, shrink, size, disableAnimation 기능 추가
