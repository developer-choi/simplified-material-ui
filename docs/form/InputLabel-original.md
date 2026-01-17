# InputLabel 컴포넌트

> Material-UI의 InputLabel 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

InputLabel은 **TextField, Select 등의 입력 필드에 라벨을 표시하고, 입력 필드의 상태에 따라 위치와 크기가 변하는 애니메이션을 제공하는 컴포넌트**입니다.

### 핵심 기능
1. **Variant별 위치 지정** - filled, outlined, standard 세 가지 variant에 따라 서로 다른 초기 위치에 라벨 배치
2. **Shrink 애니메이션** - 입력 필드에 값이 있거나 포커스될 때 라벨이 작아지며 위로 이동
3. **FormControl 통합** - 부모 FormControl의 variant, size, focused, filled, required 상태를 자동으로 읽어 스타일 조정
4. **크기 조절** - size prop(small, medium)에 따라 transform 값 미세 조정
5. **Required 표시** - FormControl이 required일 때 asterisk(*) 표시 (FormLabel 상속)

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/InputLabel/InputLabel.js (304줄)

<InputLabelRoot  // styled(FormLabel)
  data-shrink={shrink}
  ref={ref}
  className={clsx(classes.root, className)}
  ownerState={ownerState}
  classes={classes}
  {...other}
>
  {children}
  {required && <span aria-hidden className="asterisk">*</span>}  // FormLabel에서 처리
</InputLabelRoot>
```

### 2. 하위 컴포넌트가 담당하는 기능

- **InputLabelRoot** - FormLabel을 styled()로 래핑한 컴포넌트, variant별 transform 스타일 제공
- **FormLabel** - 기본 라벨 기능 (color, disabled, error, focused 상태 처리 및 asterisk 렌더링)

### 3. Theme 시스템 통합

DefaultPropsProvider를 통한 전역 기본값 주입:

```javascript
// 177줄
const props = useDefaultProps({ name: 'MuiInputLabel', props: inProps });
```

**역할:**
- theme.components.MuiInputLabel.defaultProps에 정의된 값을 자동으로 병합
- 전역적으로 disableAnimation, variant 등의 기본값 설= 가능

### 4. FormControl 통합

FormControl 컨텍스트에서 variant, size, focused, filled, required 상태 읽기:

```javascript
// 187-198줄
const muiFormControl = useFormControl();

// shrink 자동 계산
let shrink = shrinkProp;
if (typeof shrink === 'undefined' && muiFormControl) {
  shrink = muiFormControl.filled || muiFormControl.focused || muiFormControl.adornedStart;
}

const fcs = formControlState({
  props,
  muiFormControl,
  states: ['size', 'variant', 'required', 'focused'],
});
```

**shrink 자동 결정 로직:**
1. shrink prop이 명시적으로 전달되면 그 값 사용
2. 없으면 FormControl 상태 기반 자동 계산:
   - `filled`: 입력 필드에 값이 있음
   - `focused`: 입력 필드가 포커스됨
   - `adornedStart`: InputAdornment가 앞에 있음

### 5. Styled 시스템 - Variant별 Transform

InputLabelRoot의 variants 배열 (63-172줄):

```javascript
const InputLabelRoot = styled(FormLabel, {
  shouldForwardProp: (prop) => rootShouldForwardProp(prop) || prop === 'classes',
  name: 'MuiInputLabel',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;
    return [
      { [`& .${formLabelClasses.asterisk}`]: styles.asterisk },
      styles.root,
      ownerState.formControl && styles.formControl,
      ownerState.size === 'small' && styles.sizeSmall,
      ownerState.shrink && styles.shrink,
      !ownerState.disableAnimation && styles.animated,
      ownerState.focused && styles.focused,
      styles[ownerState.variant],
    ];
  },
})(
  memoTheme(({ theme }) => ({
    display: 'block',
    transformOrigin: 'top left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
    variants: [
      // 1. formControl 내부일 때 절대 위치
      {
        props: ({ ownerState }) => ownerState.formControl,
        style: {
          position: 'absolute',
          left: 0,
          top: 0,
          transform: 'translate(0, 20px) scale(1)',  // standard variant 기본
        },
      },
      // 2. size='small'일 때 transform 조정
      {
        props: { size: 'small' },
        style: {
          transform: 'translate(0, 17px) scale(1)',
        },
      },
      // 3. shrink 상태일 때
      {
        props: ({ ownerState }) => ownerState.shrink,
        style: {
          transform: 'translate(0, -1.5px) scale(0.75)',
          transformOrigin: 'top left',
          maxWidth: '133%',  // 축소 시 텍스트가 잘리지 않도록
        },
      },
      // 4. 애니메이션 (transition)
      {
        props: ({ ownerState }) => !ownerState.disableAnimation,
        style: {
          transition: theme.transitions.create(['color', 'transform', 'max-width'], {
            duration: theme.transitions.duration.shorter,
            easing: theme.transitions.easing.easeOut,
          }),
        },
      },
      // 5-8. filled variant (4개)
      {
        props: { variant: 'filled' },
        style: {
          zIndex: 1,
          pointerEvents: 'none',
          transform: 'translate(12px, 16px) scale(1)',
          maxWidth: 'calc(100% - 24px)',
        },
      },
      {
        props: { variant: 'filled', size: 'small' },
        style: {
          transform: 'translate(12px, 13px) scale(1)',
        },
      },
      {
        props: ({ variant, ownerState }) => variant === 'filled' && ownerState.shrink,
        style: {
          userSelect: 'none',
          pointerEvents: 'auto',
          transform: 'translate(12px, 7px) scale(0.75)',
          maxWidth: 'calc(133% - 24px)',
        },
      },
      {
        props: ({ variant, ownerState, size }) =>
          variant === 'filled' && ownerState.shrink && size === 'small',
        style: {
          transform: 'translate(12px, 4px) scale(0.75)',
        },
      },
      // 9-11. outlined variant (3개)
      {
        props: { variant: 'outlined' },
        style: {
          zIndex: 1,
          pointerEvents: 'none',
          transform: 'translate(14px, 16px) scale(1)',
          maxWidth: 'calc(100% - 24px)',
        },
      },
      {
        props: { variant: 'outlined', size: 'small' },
        style: {
          transform: 'translate(14px, 9px) scale(1)',
        },
      },
      {
        props: ({ variant, ownerState }) => variant === 'outlined' && ownerState.shrink,
        style: {
          userSelect: 'none',
          pointerEvents: 'auto',
          maxWidth: 'calc(133% - 32px)',
          transform: 'translate(14px, -9px) scale(0.75)',
        },
      },
    ],
  }))
);
```

**Variant별 Transform 값 정리:**

| Variant | Size | Shrink | Transform |
|---------|------|--------|-----------|
| standard | medium | ❌ | `translate(0, 20px) scale(1)` |
| standard | medium | ✅ | `translate(0, -1.5px) scale(0.75)` |
| standard | small | ❌ | `translate(0, 17px) scale(1)` |
| filled | medium | ❌ | `translate(12px, 16px) scale(1)` |
| filled | medium | ✅ | `translate(12px, 7px) scale(0.75)` |
| filled | small | ❌ | `translate(12px, 13px) scale(1)` |
| filled | small | ✅ | `translate(12px, 4px) scale(0.75)` |
| outlined | medium | ❌ | `translate(14px, 16px) scale(1)` |
| outlined | medium | ✅ | `translate(14px, -9px) scale(0.75)` |
| outlined | small | ❌ | `translate(14px, 9px) scale(1)` |

### 6. Utility Classes 시스템

클래스 이름 자동 생성 및 병합:

```javascript
// 16-36줄
const useUtilityClasses = (ownerState) => {
  const { classes, formControl, size, shrink, disableAnimation, variant, required } = ownerState;
  const slots = {
    root: [
      'root',
      formControl && 'formControl',
      !disableAnimation && 'animated',
      shrink && 'shrink',
      size && size !== 'medium' && `size${capitalize(size)}`,
      variant,
    ],
    asterisk: [required && 'asterisk'],
  };

  const composedClasses = composeClasses(slots, getInputLabelUtilityClasses, classes);

  return {
    ...classes,  // FormLabel의 focused, disabled 등 클래스 전파
    ...composedClasses,
  };
};
```

**생성되는 클래스 이름 (inputLabelClasses.ts):**
- `MuiInputLabel-root`
- `MuiInputLabel-focused`
- `MuiInputLabel-disabled`
- `MuiInputLabel-error`
- `MuiInputLabel-required`
- `MuiInputLabel-asterisk`
- `MuiInputLabel-formControl`
- `MuiInputLabel-sizeSmall`
- `MuiInputLabel-shrink`
- `MuiInputLabel-animated`
- `MuiInputLabel-standard`
- `MuiInputLabel-filled`
- `MuiInputLabel-outlined`

### 7. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | `node` | - | 라벨 텍스트 또는 요소 |
| `className` | `string` | - | CSS 클래스 |
| `disableAnimation` | `boolean` | `false` | 트랜지션 애니메이션 비활성화 |
| `shrink` | `boolean` | 자동* | 라벨 축소 상태 |
| `variant` | `'filled' \| 'outlined' \| 'standard'` | - | 입력 필드 스타일 (FormControl에서 상속) |
| `size` | `'small' \| 'medium'` | `'medium'` | 컴포넌트 크기 (FormControl에서 상속) |
| `margin` | `'dense'` | - | 마진 조정 (FormControl에서 상속) |
| `color` | `string` | - | 색상 (FormLabel 상속) |
| `disabled` | `boolean` | - | 비활성화 상태 (FormLabel 상속) |
| `error` | `boolean` | - | 에러 상태 (FormLabel 상속) |
| `focused` | `boolean` | - | 포커스 상태 (FormLabel 상속) |
| `required` | `boolean` | - | 필수 표시 (FormLabel 상속) |
| `classes` | `object` | - | 스타일 오버라이드 |
| `sx` | `SxProps<Theme>` | - | 시스템 스타일 |

*shrink 자동 결정: `muiFormControl.filled || muiFormControl.focused || muiFormControl.adornedStart`

---

## 설계 패턴

1. **Composition Pattern (컴포지션)**
   - FormLabel을 styled()로 래핑하여 확장
   - FormLabel의 기본 기능 상속 (color, disabled, error, asterisk 등)
   - InputLabel 고유 기능 추가 (variant, shrink, size, disableAnimation)

2. **Context Pattern (컨텍스트)**
   - useFormControl()로 FormControlContext 구독
   - 부모 FormControl의 상태를 자동으로 전파받음
   - 개별 입력 컴포넌트에 props를 일일이 전달할 필요 없음

3. **Styled Components Pattern**
   - styled() API로 동적 스타일 생성
   - ownerState 기반 조건부 스타일
   - variants 배열로 복잡한 조합 처리

4. **Theme Integration Pattern**
   - useDefaultProps()로 테마 기본값 주입
   - memoTheme()로 테마 변경 시에만 재계산
   - theme.transitions로 일관된 애니메이션

5. **Utility Classes Pattern**
   - 상태별로 클래스 이름 자동 생성
   - CSS 모듈이나 테마 오버라이드 지원
   - composeClasses()로 클래스 병합

---

## 복잡도의 이유

InputLabel은 **304줄**이며, 복잡한 이유는:

1. **Styled 시스템 오버헤드 (138줄)**
   - InputLabelRoot styled 컴포넌트 정의 (38-174줄)
   - overridesResolver 로직 (7줄)
   - variants 배열 11개 (110줄)
   - memoTheme 래퍼

2. **Variant × Size 조합 (11개 variants)**
   - standard variant: 3개 (기본, small, shrink)
   - filled variant: 4개 (기본, small, shrink, shrink+small)
   - outlined variant: 3개 (기본, small, shrink)
   - 애니메이션: 1개

3. **Theme 통합 복잡도**
   - useDefaultProps (테마 기본값 병합)
   - memoTheme (테마 변경 감지)
   - theme.transitions.create() (애니메이션 설정)

4. **Utility Classes 시스템 (21줄)**
   - useUtilityClasses 함수 (16-36줄)
   - composeClasses 호출
   - 13개 클래스 이름 생성

5. **PropTypes (77줄)**
   - PropTypes 선언 (225-301줄)
   - JSDoc 주석 포함
   - 실제 컴포넌트 로직(48줄)보다 많음

6. **FormControl 통합 로직**
   - useFormControl 구독
   - formControlState 유틸리티
   - shrink 자동 계산 로직
   - variant, size, required, focused 상태 전파

7. **다양한 유틸리티 의존성**
   - composeClasses, clsx (클래스 병합)
   - capitalize (문자열 변환)
   - rootShouldForwardProp (prop 필터링)
   - formControlState (상태 도출)

---

## 핵심 메커니즘 상세

### Shrink 애니메이션의 원리

InputLabel의 핵심은 "라벨이 입력 필드 위를 떠다니다가, 값이 입력되거나 포커스되면 작아지며 위로 이동"하는 것입니다.

**1. 초기 상태 (shrink=false):**
- standard: `translate(0, 20px) scale(1)` - 입력 필드 안쪽 중간
- filled: `translate(12px, 16px) scale(1)` - 입력 필드 안쪽, 왼쪽 여백 12px
- outlined: `translate(14px, 16px) scale(1)` - 테두리 안쪽, 왼쪽 여백 14px

**2. Shrink 상태 (shrink=true):**
- standard: `translate(0, -1.5px) scale(0.75)` - 입력 필드 위로 이동
- filled: `translate(12px, 7px) scale(0.75)` - 위로 이동, 왼쪽 위치 유지
- outlined: `translate(14px, -9px) scale(0.75)` - 테두리 밖으로 이동 (음수 y)

**3. 애니메이션:**
```javascript
transition: theme.transitions.create(['color', 'transform', 'max-width'], {
  duration: theme.transitions.duration.shorter,  // 200ms
  easing: theme.transitions.easing.easeOut,
});
```

**4. 자동 shrink 트리거:**
- 입력 필드에 값이 있음 (`muiFormControl.filled`)
- 입력 필드가 포커스됨 (`muiFormControl.focused`)
- 앞쪽에 InputAdornment가 있음 (`muiFormControl.adornedStart`)

이 메커니즘으로 라벨이 플레이스홀더처럼 동작하다가 자연스럽게 위로 올라가는 Material Design의 시그니처 효과를 구현합니다.

---

## 비교: FormLabel vs InputLabel

| 기능 | FormLabel | InputLabel |
|------|-----------|------------|
| **목적** | 일반 폼 라벨 (RadioGroup, FormGroup 등) | 입력 필드 전용 라벨 (TextField, Select) |
| **위치** | 정적 (항상 고정) | 동적 (shrink 애니메이션) |
| **Variant** | ❌ 없음 | ✅ filled, outlined, standard |
| **Transform** | ❌ 없음 | ✅ variant별 transform |
| **Size** | ❌ 없음 | ✅ small, medium |
| **Shrink** | ❌ 없음 | ✅ 자동 계산 및 수동 제어 |
| **FormControl 통합** | ✅ color, disabled, error, focused | ✅ FormLabel + variant, size, filled, adornedStart |
| **Asterisk** | ✅ required 표시 | ✅ FormLabel 상속 |
| **코드 라인** | ~150줄 | 304줄 |

**핵심 차이점:**
- FormLabel은 "정적 라벨" → 항상 같은 위치
- InputLabel은 "동적 라벨" → 상태에 따라 위치와 크기 변화
- InputLabel은 FormLabel을 확장하여 애니메이션 기능 추가
