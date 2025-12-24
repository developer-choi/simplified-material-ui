# Radio 컴포넌트

> Material-UI의 Radio 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

Radio는 **여러 옵션 중 하나를 선택할 수 있는 입력 컨트롤**을 제공하는 컴포넌트입니다.

> **💡 작성 주의**: Radio 자체는 선택 가능한 옵션을 렌더링하는 역할만 담당합니다. 여러 Radio를 그룹화하는 기능(RadioGroup)과 Form 통합(FormControl)은 별도 컴포넌트와의 통합입니다.

### 핵심 기능
1. **선택 상태 표시** - checked prop으로 선택 여부를 시각적으로 표시
2. **상태 변경 처리** - onChange 콜백으로 사용자 선택을 부모에게 전달
3. **RadioGroup 통합** - useRadioGroup으로 RadioGroup의 value/name/onChange 자동 연결
4. **FormControl 통합** - useFormControl로 FormControl의 disabled 자동 연결

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/Radio/Radio.js (331줄)
Radio (forwardRef)
  └─> RadioRoot (styled SwitchBase)
       ├─> input (type="radio")
       └─> RadioButtonIcon (checked prop에 따라 아이콘 변경)
            ├─> RadioButtonIconRoot (span)
            │    ├─> RadioButtonIconBackground (RadioButtonUncheckedIcon - 항상 표시)
            │    └─> RadioButtonIconDot (RadioButtonCheckedIcon - checked일 때만 scale(1))
```

### 2. 하위 컴포넌트가 담당하는 기능

- **SwitchBase** - ButtonBase 기반 공통 스위치 로직 (Checkbox, Radio, Switch 공통)
  - input 요소 렌더링
  - Ripple 효과 (ButtonBase 상속)
  - checked state 관리 (useControlled)
  - onChange 이벤트 처리
  - edge prop으로 margin 조정

- **RadioButtonIcon** - Radio 아이콘 렌더링
  - 체크되지 않은 상태: 빈 원 (RadioButtonUncheckedIcon)
  - 체크된 상태: 빈 원 + 가운데 점 (RadioButtonCheckedIcon, scale(1) 애니메이션)

### 3. RadioRoot (Styled SwitchBase)

**RadioRoot** (라인 34-102)
- SwitchBase를 styled()로 래핑
- color, size에 따라 스타일 적용
- variants 배열로 조건부 스타일 정의

```javascript
const RadioRoot = styled(SwitchBase, {
  shouldForwardProp: (prop) => rootShouldForwardProp(prop) || prop === 'classes',
  name: 'MuiRadio',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;
    return [
      styles.root,
      ownerState.size !== 'medium' && styles[`size${capitalize(ownerState.size)}`],
      styles[`color${capitalize(ownerState.color)}`],
    ];
  },
})(
  memoTheme(({ theme }) => ({
    color: (theme.vars || theme).palette.text.secondary,
    [`&.${radioClasses.disabled}`]: {
      color: (theme.vars || theme).palette.action.disabled,
    },
    variants: [
      // color='default' hover 스타일
      {
        props: { color: 'default', disabled: false, disableRipple: false },
        style: { '&:hover': { backgroundColor: ... } },
      },
      // 동적 색상 생성 (primary/secondary/error/info/success/warning)
      ...Object.entries(theme.palette)
        .filter(createSimplePaletteValueFilter())
        .map(([color]) => ({
          props: { color, disabled: false, disableRipple: false },
          style: { '&:hover': { backgroundColor: ... } },
        })),
      // checked 상태 색상
      ...Object.entries(theme.palette)
        .filter(createSimplePaletteValueFilter())
        .map(([color]) => ({
          props: { color, disabled: false },
          style: { [`&.${radioClasses.checked}`]: { color: ... } },
        })),
      // 터치 디바이스에서 hover 제거
      {
        props: { disableRipple: false },
        style: { '&:hover': { '@media (hover: none)': { backgroundColor: 'transparent' } } },
      },
    ],
  })),
);
```

**학습 포인트**:
- `Object.entries(theme.palette).filter()` - 동적으로 색상 variants 생성 (2번 반복)
- `createSimplePaletteValueFilter()` - primary/secondary/error 등 6개 색상만 필터링
- variants 배열 - color, disabled, disableRipple 조합에 따라 다른 스타일 적용
- memoTheme - 테마 기반 스타일 메모이제이션

### 4. RadioButtonIcon (Styled Components)

**RadioButtonIcon.js** (87줄)
- 3개의 styled components로 구성

```javascript
// 1. RadioButtonIconRoot - 컨테이너
const RadioButtonIconRoot = styled('span', {
  name: 'MuiRadioButtonIcon',
  shouldForwardProp: rootShouldForwardProp,
})({
  position: 'relative',
  display: 'flex',
});

// 2. RadioButtonIconBackground - 항상 표시되는 빈 원
const RadioButtonIconBackground = styled(RadioButtonUncheckedIcon, {
  name: 'MuiRadioButtonIcon',
})({
  transform: 'scale(1)', // Safari 정렬 문제 방지
});

// 3. RadioButtonIconDot - checked일 때만 보이는 가운데 점
const RadioButtonIconDot = styled(RadioButtonCheckedIcon, {
  name: 'MuiRadioButtonIcon',
})(
  memoTheme(({ theme }) => ({
    left: 0,
    position: 'absolute',
    transform: 'scale(0)', // 기본값: 숨김
    transition: theme.transitions.create('transform', {
      easing: theme.transitions.easing.easeIn,
      duration: theme.transitions.duration.shortest,
    }),
    variants: [
      {
        props: { checked: true },
        style: {
          transform: 'scale(1)', // checked: 표시
          transition: theme.transitions.create('transform', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.shortest,
          }),
        },
      },
    ],
  })),
);
```

**학습 포인트**:
- 2개 아이콘 레이어 (Background는 항상, Dot는 checked일 때만)
- `position: absolute` + `transform: scale()` - 애니메이션 효과
- `theme.transitions.create()` - 테마 기반 transition 생성
- easing 변화 - easeIn (숨김) vs easeOut (표시)

### 5. RadioGroup 통합 (useRadioGroup)

**RadioGroup 통합** (라인 156-169)
- RadioGroup Context로 여러 Radio를 그룹화
- checked, name, onChange를 자동으로 설정

```javascript
const radioGroup = useRadioGroup();

let checked = checkedProp;
const onChange = createChainedFunction(onChangeProp, radioGroup && radioGroup.onChange);
let name = nameProp;

if (radioGroup) {
  // RadioGroup의 value와 Radio의 value 비교하여 checked 자동 설정
  if (typeof checked === 'undefined') {
    checked = areEqualValues(radioGroup.value, props.value);
  }
  // RadioGroup의 name을 Radio에 자동 설정
  if (typeof name === 'undefined') {
    name = radioGroup.name;
  }
}

// areEqualValues - 객체 비교 지원
function areEqualValues(a, b) {
  if (typeof b === 'object' && b !== null) {
    return a === b;
  }
  return String(a) === String(b); // DOM은 문자열로 변환
}
```

**학습 포인트**:
- `useRadioGroup()` - RadioGroup의 Context 구독
- `areEqualValues()` - value 비교 (객체 참조 vs 문자열 변환)
- `createChainedFunction()` - Radio와 RadioGroup의 onChange 병합
- RadioGroup이 없으면 checked/name을 직접 prop으로 제어

### 6. FormControl 통합 (useFormControl)

**FormControl 통합** (라인 135-145)
- FormControl Context로 disabled 자동 설정

```javascript
const muiFormControl = useFormControl();

let disabled = disabledProp;

if (muiFormControl) {
  if (typeof disabled === 'undefined') {
    disabled = muiFormControl.disabled;
  }
}

disabled ??= false; // nullish coalescing - undefined/null이면 false
```

**학습 포인트**:
- `useFormControl()` - FormControl의 Context 구독
- FormControl의 disabled를 Radio에 자동 전달
- `??=` (nullish coalescing assignment) - undefined/null일 때만 할당

### 7. Slot 시스템

**useSlot 사용** (라인 173-209)
- root 슬롯 1개
- 이벤트 핸들러 병합 및 props 전달

```javascript
const externalForwardedProps = {
  slots: {
    transition: TransitionComponentProp,
    ...slots,
  },
  slotProps: {
    content: ContentPropsProp,
    clickAwayListener: ClickAwayListenerPropsProp,
    transition: TransitionPropsProp,
    ...slotProps,
  },
};

const [RootSlot, rootSlotProps] = useSlot('root', {
  ref,
  elementType: RadioRoot,
  className: clsx(classes.root, className),
  shouldForwardComponentProp: true,
  externalForwardedProps: {
    slots,
    slotProps,
    ...other,
  },
  getSlotProps: (handlers) => ({
    ...handlers,
    onChange: (event, ...args) => {
      handlers.onChange?.(event, ...args);
      onChange(event, ...args); // RadioGroup의 onChange 병합
    },
  }),
  ownerState,
  additionalProps: {
    type: 'radio',
    icon: React.cloneElement(icon, { fontSize: icon.props.fontSize ?? size }),
    checkedIcon: React.cloneElement(checkedIcon, {
      fontSize: checkedIcon.props.fontSize ?? size,
    }),
    disabled,
    name,
    checked,
    slots,
    slotProps: {
      input:
        typeof externalInputProps === 'function'
          ? externalInputProps(ownerState)
          : externalInputProps,
    },
  },
});

return <RootSlot {...rootSlotProps} classes={classes} />;
```

**학습 포인트**:
- `useSlot()` - 슬롯 커스터마이징 시스템
- `getSlotProps` - 이벤트 핸들러 병합 (onChange)
- `React.cloneElement()` - icon/checkedIcon에 fontSize 주입
- `externalForwardedProps` - slots/slotProps와 deprecated props 병합

### 8. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `checked` | boolean | - | Radio 체크 여부 |
| `onChange` | function | - | 상태 변경 콜백 |
| `value` | any | - | Radio의 값 (RadioGroup과 비교) |
| `name` | string | - | input의 name 속성 |
| `disabled` | boolean | false | 비활성화 여부 |
| `color` | 'default' \| 'primary' \| 'secondary' \| ... | 'primary' | 색상 |
| `size` | 'small' \| 'medium' | 'medium' | 크기 |
| `icon` | node | `<RadioButtonIcon />` | 체크되지 않은 아이콘 |
| `checkedIcon` | node | `<RadioButtonIcon checked />` | 체크된 아이콘 |
| `disableRipple` | boolean | false | Ripple 효과 비활성화 |
| `slots` | object | {} | 슬롯 커스터마이징 |
| `slotProps` | object | {} | 슬롯 props |
| `inputProps` | object | - | input 요소의 props (deprecated) |
| `inputRef` | ref | - | input 요소의 ref (deprecated) |
| `className` | string | - | 추가 클래스 |
| `id` | string | - | input의 id |
| `required` | boolean | false | 필수 여부 |

---

## 설계 패턴

1. **Composition (조합)**
   - SwitchBase를 베이스로 사용하여 공통 로직 재사용
   - RadioButtonIcon으로 아이콘 렌더링 분리

2. **Slot System**
   - useSlot()으로 root 슬롯 커스터마이징
   - slots/slotProps로 내부 컴포넌트 교체 가능

3. **Styled Component System**
   - styled() API로 테마 기반 스타일
   - ownerState로 props를 스타일에 전달
   - variants 배열로 조건부 스타일 정의
   - memoTheme으로 테마 기반 스타일 메모이제이션

4. **Utility Classes**
   - useUtilityClasses로 상태별 클래스명 생성
   - composeClasses로 클래스 병합
   - color/size에 따른 클래스 (colorPrimary, sizeSmall 등)

5. **Context Integration**
   - useRadioGroup으로 RadioGroup과 통합
   - useFormControl로 FormControl과 통합
   - Context로 props 자동 전달 (checked, name, disabled)

6. **Controlled Component**
   - checked prop으로 선택 상태 제어
   - onChange로 상태 변경 통지
   - RadioGroup이 value를 관리하고 Radio는 표시만 담당

---

## 복잡도의 이유

Radio는 **331줄**이며, 복잡한 이유는:

1. **테마 시스템 통합**
   - useDefaultProps로 테마 기본값 병합
   - useUtilityClasses로 클래스명 자동 생성
   - memoTheme()로 테마 기반 스타일 메모이제이션

2. **Styled Component 시스템**
   - styled() API로 RadioRoot 생성 (68줄)
   - overridesResolver로 테마 오버라이드 지원
   - variants 배열로 조건부 스타일 정의 (5개)
   - RadioButtonIcon의 3개 styled components (87줄 별도 파일)

3. **다양한 Props 지원**
   - 17개의 props (color, size, icon, checkedIcon, disableRipple 등)
   - color 7가지 × disabled 2가지 × disableRipple 2가지 = 28가지 조합
   - PropTypes 114줄

4. **Slot 시스템**
   - useSlot() 훅 호출
   - externalForwardedProps 병합 로직
   - getSlotProps로 이벤트 핸들러 병합
   - slots/slotProps와 deprecated props (inputProps) 병행 지원

5. **동적 색상 생성**
   - Object.entries(theme.palette).filter() - 테마의 색상을 동적으로 variants에 추가
   - createSimplePaletteValueFilter() - primary/secondary/error/info/success/warning 필터링
   - 색상별 hover/checked 스타일 생성 (2번 반복)

6. **Context 통합**
   - useRadioGroup - RadioGroup의 value/name/onChange 자동 연결
   - useFormControl - FormControl의 disabled 자동 연결
   - areEqualValues - value 비교 로직
   - createChainedFunction - onChange 병합

7. **복잡한 icon 처리**
   - React.cloneElement로 icon/checkedIcon에 fontSize 주입
   - defaultCheckedIcon, defaultIcon 상수
   - RadioButtonIcon의 transition 애니메이션

8. **SwitchBase 의존성**
   - SwitchBase (별도 파일, ButtonBase 기반)
   - input 요소, Ripple 효과, edge prop 등 추가 복잡도

---

## 비교: Radio vs `<input type="radio">`

| 기능 | Radio | `<input type="radio">` |
|------|-------|------------------------|
| **테마 통합** | 자동 (color, transitions) | 수동 CSS 필요 |
| **아이콘** | RadioButtonIcon (커스터마이징 가능) | 브라우저 기본 스타일 |
| **Ripple 효과** | ButtonBase 상속 (Material Design) | 없음 |
| **RadioGroup 통합** | useRadioGroup으로 자동 | 직접 name, onChange 관리 |
| **FormControl 통합** | useFormControl로 자동 disabled | 직접 disabled 전달 |
| **색상/크기** | color, size props | 직접 CSS 작성 |
| **애니메이션** | scale transition | 없음 |
| **코드 복잡도** | 331줄 + RadioButtonIcon 87줄 | 간단하지만 반복 필요 |
| **커스터마이징** | slots, sx, styled 등 다양 | CSS만 가능 |
