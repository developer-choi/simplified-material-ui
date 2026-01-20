# FormHelperText 컴포넌트

> Material-UI의 FormHelperText 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

FormHelperText는 **폼 요소 아래에 도움말 텍스트나 에러 메시지를 표시하는** 컴포넌트입니다.

### 핵심 기능
1. **도움말 텍스트 표시** - 입력 필드에 대한 안내 메시지 렌더링
2. **에러 메시지 표시** - 유효성 검증 실패 시 에러 상태로 색상 변경
3. **FormControl 통합** - 부모 FormControl의 상태(error, disabled, focused 등)를 자동으로 읽어 반영
4. **상태별 스타일 변형** - disabled, error, focused, required 등 상태에 따라 스타일 변경

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/FormHelperText/FormHelperText.js (207줄)
FormHelperText (forwardRef)
  └─> FormHelperTextRoot (styled p)
       └─> children (text or span for empty content)
```

### 2. useUtilityClasses 함수

```javascript
const useUtilityClasses = (ownerState) => {
  const { classes, contained, size, disabled, error, filled, focused, required } = ownerState;
  const slots = {
    root: [
      'root',
      disabled && 'disabled',
      error && 'error',
      size && `size${capitalize(size)}`,
      contained && 'contained',
      focused && 'focused',
      filled && 'filled',
      required && 'required',
    ],
  };

  return composeClasses(slots, getFormHelperTextUtilityClasses, classes);
};
```

**역할**: ownerState 기반으로 동적 클래스 이름 생성 (예: `MuiFormHelperText-root`, `MuiFormHelperText-error`)

### 3. FormHelperTextRoot (styled 컴포넌트)

```javascript
const FormHelperTextRoot = styled('p', {
  name: 'MuiFormHelperText',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;
    return [
      styles.root,
      ownerState.size && styles[`size${capitalize(ownerState.size)}`],
      ownerState.contained && styles.contained,
      ownerState.filled && styles.filled,
    ];
  },
})(
  memoTheme(({ theme }) => ({
    color: (theme.vars || theme).palette.text.secondary,
    ...theme.typography.caption,
    textAlign: 'left',
    marginTop: 3,
    marginRight: 0,
    marginBottom: 0,
    marginLeft: 0,
    [`&.${formHelperTextClasses.disabled}`]: {
      color: (theme.vars || theme).palette.text.disabled,
    },
    [`&.${formHelperTextClasses.error}`]: {
      color: (theme.vars || theme).palette.error.main,
    },
    variants: [
      {
        props: { size: 'small' },
        style: { marginTop: 4 },
      },
      {
        props: ({ ownerState }) => ownerState.contained,
        style: { marginLeft: 14, marginRight: 14 },
      },
    ],
  })),
);
```

**역할**:
- 테마 기반 스타일링 (색상, 타이포그래피)
- 상태별 클래스 스타일 (`.MuiFormHelperText-disabled`, `.MuiFormHelperText-error`)
- variants로 조건부 스타일 (size, contained)

### 4. FormControl 통합

```javascript
const muiFormControl = useFormControl();
const fcs = formControlState({
  props,
  muiFormControl,
  states: ['variant', 'size', 'disabled', 'error', 'filled', 'focused', 'required'],
});
```

**역할**:
- `useFormControl()` - FormControlContext 구독
- `formControlState()` - props와 context 값 병합 (props 우선)

### 5. ownerState 생성

```javascript
const ownerState = {
  ...props,
  component,
  contained: fcs.variant === 'filled' || fcs.variant === 'outlined',
  variant: fcs.variant,
  size: fcs.size,
  disabled: fcs.disabled,
  error: fcs.error,
  filled: fcs.filled,
  focused: fcs.focused,
  required: fcs.required,
};
```

**역할**: FormControl 상태를 ownerState로 변환하여 styled 컴포넌트에 전달

### 6. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | node | - | 도움말 텍스트. `' '` (공백)이면 높이 유지용 빈 줄 |
| `classes` | object | - | 스타일 오버라이드용 클래스 |
| `className` | string | - | CSS 클래스명 |
| `component` | elementType | `'p'` | 루트 요소 타입 |
| `disabled` | boolean | - | 비활성화 상태 |
| `error` | boolean | - | 에러 상태 |
| `filled` | boolean | - | 채워진 상태 |
| `focused` | boolean | - | 포커스 상태 |
| `margin` | `'dense'` | - | 수직 간격 조절 (dense: 더 촘촘) |
| `required` | boolean | - | 필수 상태 |
| `sx` | object | - | CSS-in-JS 스타일 |
| `variant` | `'filled'` \| `'outlined'` \| `'standard'` | - | 폼 변형 스타일 |

### 7. 공백 children 처리

```javascript
{children === ' ' ? (
  // notranslate needed while Google Translate will not fix zero-width space issue
  <span className="notranslate" aria-hidden>
    &#8203;
  </span>
) : (
  children
)}
```

**역할**: `children=' '` 일 때 zero-width space로 높이 유지 (나중에 에러 메시지 표시할 공간 확보)

---

## 설계 패턴

1. **Composition Pattern**
   - FormControl Context를 통해 상위 컴포넌트와 상태 공유
   - props와 context 값을 formControlState로 병합

2. **Slot Pattern**
   - `overridesResolver`로 테마 스타일 오버라이드 지원
   - `ownerState`를 통해 styled 컴포넌트에 상태 전달

3. **Controlled/Uncontrolled Pattern**
   - props로 직접 제어 가능 (Controlled)
   - FormControl에서 자동으로 상태 상속 (Uncontrolled)

---

## 복잡도의 이유

FormHelperText는 **207줄**이며, 복잡한 이유는:

1. **테마 시스템 통합** - styled, memoTheme, variants로 테마 기반 스타일링
2. **클래스 시스템** - useUtilityClasses, composeClasses로 동적 클래스 생성
3. **FormControl 연동** - 7가지 상태(variant, size, disabled, error, filled, focused, required)를 context에서 읽고 병합
4. **PropTypes 정의** - 65줄의 런타임 타입 검증
5. **스타일 변형** - size, contained, variant에 따른 조건부 스타일

---

## 의존성 분석

```javascript
// 외부 라이브러리
import PropTypes from 'prop-types';      // 런타임 타입 검증
import clsx from 'clsx';                 // 클래스명 병합

// MUI 유틸리티
import composeClasses from '@mui/utils/composeClasses';  // 클래스 조합
import capitalize from '../utils/capitalize';            // 문자열 대문자화

// 스타일링
import { styled } from '../zero-styled';                 // CSS-in-JS
import memoTheme from '../utils/memoTheme';              // 스타일 메모이제이션

// 테마/기본값
import { useDefaultProps } from '../DefaultPropsProvider';  // 테마 기본 props

// FormControl 연동
import formControlState from '../../../form/FormControl/formControlState';
import useFormControl from '../../../form/FormControl/useFormControl';

// 클래스 정의
import formHelperTextClasses, { getFormHelperTextUtilityClasses } from './formHelperTextClasses';
```

**총 10개의 import** - 단순화 시 대부분 제거 예정
