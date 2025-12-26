# Checkbox 컴포넌트

> Material-UI의 Checkbox 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

Checkbox는 **사용자가 여러 옵션 중 하나 이상을 선택할 수 있는 입력 컴포넌트**입니다.

### 핵심 기능
1. **2상태 관리** - checked/unchecked 상태 토글
2. **Indeterminate 상태** - 부분 선택 표현 (예: 트리 구조에서 일부 하위 항목만 선택)
3. **FormControl 통합** - FormControl 내부에서 disabled 상태 자동 상속
4. **커스터마이징** - 색상, 크기, 아이콘 변경 가능
5. **접근성** - ARIA 속성, 키보드 탐색, 포커스 관리

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/Checkbox/Checkbox.js (309줄)
Checkbox
  └─> CheckboxRoot (styled SwitchBase)
       └─> SwitchBase
            ├─> ButtonBase
            ├─> input[type="checkbox"]
            └─> Icon (조건부 렌더링)
                 ├─> CheckBoxOutlineBlankIcon (unchecked)
                 ├─> CheckBoxIcon (checked)
                 └─> IndeterminateCheckBoxIcon (indeterminate)
```

### 2. Slot 시스템

```javascript
// 위치: Checkbox.js (147-179줄)
const [RootSlot, rootSlotProps] = useSlot('root', {
  ref,
  elementType: CheckboxRoot,
  className: clsx(classes.root, className),
  shouldForwardComponentProp: true,
  externalForwardedProps: {
    slots,
    slotProps,
    ...other,
  },
  ownerState,
  additionalProps: {
    type: 'checkbox',
    icon: React.cloneElement(icon, {
      fontSize: icon.props.fontSize ?? size,
    }),
    checkedIcon: React.cloneElement(indeterminateIcon, {
      fontSize: indeterminateIcon.props.fontSize ?? size,
    }),
    disableRipple,
    slots,
    slotProps: {
      input: mergeSlotProps(
        typeof externalInputProps === 'function'
          ? externalInputProps(ownerState)
          : externalInputProps,
        {
          'data-indeterminate': indeterminate,
        },
      ),
    },
  },
});
```

**역할**:
- `useSlot` 훅으로 root/input 슬롯 커스터마이징 가능
- `mergeSlotProps`로 외부 props와 내부 props 병합
- `shouldForwardComponentProp`로 컴포넌트 prop 전달 제어

### 3. Indeterminate 상태 처리

```javascript
// 위치: Checkbox.js (132-133줄)
const icon = indeterminate ? indeterminateIconProp : iconProp;
const indeterminateIcon = indeterminate ? indeterminateIconProp : checkedIcon;

// data-indeterminate 속성 추가
slotProps: {
  input: mergeSlotProps(externalInputProps, {
    'data-indeterminate': indeterminate,  // 174줄
  }),
}
```

**Indeterminate 상태의 특징**:
- **3상태 지원**: unchecked, checked, **indeterminate**
- **아이콘 조건부 렌더링**: indeterminate일 때 IndeterminateCheckBoxIcon 사용
- **data 속성**: input 요소에 `data-indeterminate` 속성 설정
- **CSS 클래스**: `indeterminate` 클래스 추가로 스타일링

**사용 사례**:
- 트리 구조에서 부모 항목의 일부 자식만 선택된 경우
- "전체 선택" 체크박스에서 일부만 선택된 상태 표시

### 4. Styled Component (CheckboxRoot)

```javascript
// 위치: Checkbox.js (40-109줄)
const CheckboxRoot = styled(SwitchBase, {
  shouldForwardProp: (prop) => rootShouldForwardProp(prop) || prop === 'classes',
  name: 'MuiCheckbox',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      styles.root,
      ownerState.indeterminate && styles.indeterminate,
      styles[`size${capitalize(ownerState.size)}`],
      ownerState.color !== 'default' && styles[`color${capitalize(ownerState.color)}`],
    ];
  },
})(
  memoTheme(({ theme }) => ({
    color: (theme.vars || theme).palette.text.secondary,
    variants: [
      // 1. default color + hover
      {
        props: { color: 'default', disableRipple: false },
        style: {
          '&:hover': {
            backgroundColor: theme.alpha(
              (theme.vars || theme).palette.action.active,
              (theme.vars || theme).palette.action.hoverOpacity,
            ),
          },
        },
      },
      // 2. 각 palette 색상별 hover (동적 생성)
      ...Object.entries(theme.palette)
        .filter(createSimplePaletteValueFilter())
        .map(([color]) => ({
          props: { color, disableRipple: false },
          style: {
            '&:hover': {
              backgroundColor: theme.alpha(
                (theme.vars || theme).palette[color].main,
                (theme.vars || theme).palette.action.hoverOpacity,
              ),
            },
          },
        })),
      // 3. checked/indeterminate/disabled 색상 (동적 생성)
      ...Object.entries(theme.palette)
        .filter(createSimplePaletteValueFilter())
        .map(([color]) => ({
          props: { color },
          style: {
            [`&.${checkboxClasses.checked}, &.${checkboxClasses.indeterminate}`]: {
              color: (theme.vars || theme).palette[color].main,
            },
            [`&.${checkboxClasses.disabled}`]: {
              color: (theme.vars || theme).palette.action.disabled,
            },
          },
        })),
      // 4. 터치 장치 hover 리셋
      {
        props: { disableRipple: false },
        style: {
          '&:hover': {
            '@media (hover: none)': {
              backgroundColor: 'transparent',
            },
          },
        },
      },
    ],
  })),
);
```

**복잡도 분석**:
- **동적 색상 생성**: `Object.entries(theme.palette).filter()` 2번 사용
- **Variants**: 총 3가지 variants 그룹 (default hover, palette hover, checked/indeterminate)
- **조건부 스타일**: color, disableRipple, checked, indeterminate, disabled 조합

### 5. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `checked` | boolean | - | 체크 상태 (controlled) |
| `defaultChecked` | boolean | - | 초기 체크 상태 (uncontrolled) |
| `indeterminate` | boolean | false | **[Checkbox 특화]** 불확정 상태 |
| `icon` | node | CheckBoxOutlineBlankIcon | 체크 해제 아이콘 |
| `checkedIcon` | node | CheckBoxIcon | 체크 아이콘 |
| `indeterminateIcon` | node | IndeterminateCheckBoxIcon | **[Checkbox 특화]** 불확정 아이콘 |
| `color` | string | 'primary' | 색상 (primary/secondary/error/info/success/warning/default) |
| `size` | string | 'medium' | 크기 (small/medium) |
| `disabled` | boolean | false | 비활성화 |
| `disableRipple` | boolean | false | Ripple 효과 비활성화 |
| `onChange` | function | - | 상태 변경 콜백 |
| `inputProps` | object | - | input 요소 속성 (deprecated) |
| `slots` | object | {} | 슬롯 커스터마이징 |
| `slotProps` | object | {} | 슬롯 props |
| `className` | string | - | 추가 CSS 클래스 |
| `value` | any | - | 값 |

### 6. Theme 시스템 통합

```javascript
// 1. useDefaultProps로 테마 기본값 적용 (116줄)
const props = useDefaultProps({ props: inProps, name: 'MuiCheckbox' });

// 2. useUtilityClasses로 동적 클래스 생성 (20-38줄)
const useUtilityClasses = (ownerState) => {
  const { classes, indeterminate, color, size } = ownerState;

  const slots = {
    root: [
      'root',
      indeterminate && 'indeterminate',
      `color${capitalize(color)}`,
      `size${capitalize(size)}`,
    ],
  };

  const composedClasses = composeClasses(slots, getCheckboxUtilityClass, classes);

  return {
    ...classes,
    ...composedClasses,
  };
};

// 3. ownerState로 스타일 props 전달 (135-141줄)
const ownerState = {
  ...props,
  disableRipple,
  color,
  indeterminate,
  size,
};
```

---

## 설계 패턴

1. **Composition Pattern**
   - SwitchBase를 베이스 컴포넌트로 재사용
   - ButtonBase → SwitchBase → Checkbox 계층 구조
   - 각 계층에서 특화 기능 추가

2. **Slot Pattern**
   - `useSlot` 훅으로 root/input 슬롯 커스터마이징
   - 사용자가 컴포넌트를 교체하거나 props 추가 가능

3. **Theme Pattern**
   - `useDefaultProps`로 테마 기본값 자동 적용
   - `memoTheme`으로 테마 기반 스타일 메모이제이션
   - `variants` 배열로 조건부 스타일 적용

4. **Controlled/Uncontrolled Pattern**
   - `checked` prop으로 제어 모드
   - `defaultChecked` prop으로 비제어 모드
   - SwitchBase가 `useControlled` 훅으로 상태 관리

---

## 복잡도의 이유

Checkbox는 **309줄**이며, 복잡한 이유는:

1. **Indeterminate 상태** - Checkbox만의 3상태 지원 (unchecked, checked, indeterminate)
   - 조건부 아이콘 렌더링 로직
   - data-indeterminate 속성 처리
   - indeterminate 클래스 추가

2. **동적 색상 시스템** - 7가지 색상 × 4가지 상태 조합 = 28가지 variants
   - `Object.entries(theme.palette).filter()` 2번 사용
   - createSimplePaletteValueFilter 유틸리티
   - hover/checked/indeterminate/disabled 각각 처리

3. **Slot 시스템** - useSlot 훅으로 유연한 커스터마이징
   - mergeSlotProps로 props 병합
   - externalForwardedProps 처리
   - getSlotProps로 이벤트 핸들러 병합

4. **Theme 통합** - Material-UI 테마 시스템과 완전 통합
   - useDefaultProps로 기본값 적용
   - useUtilityClasses로 동적 클래스 생성
   - ownerState로 스타일 props 전달

5. **PropTypes** - 런타임 타입 검증 (125줄)

---

## 비교: Radio vs Checkbox

| 기능 | Radio | Checkbox |
|------|-------|----------|
| **코드 라인** | 71줄 (단순화 후) | 309줄 |
| **상태** | 2상태 (checked/unchecked) | **3상태 (+ indeterminate)** |
| **아이콘** | 2개 (icon, checkedIcon) | **3개 (+ indeterminateIcon)** |
| **그룹 통합** | RadioGroup (useRadioGroup) | 없음 |
| **FormControl 통합** | O | O |
| **Styled Component** | 없음 (단순화 후) | CheckboxRoot (69줄) |
| **color variants** | 없음 (단순화 후) | 동적 생성 (2번 filter) |
| **사용 사례** | 단일 선택 | 다중 선택, **부분 선택** |

**주요 차이점**:
- Checkbox는 **indeterminate** 상태로 인해 Radio보다 복잡
- Radio는 RadioGroup과 통합되지만, Checkbox는 독립적
- Checkbox의 styled component는 color variants가 더 복잡

---

## 핵심 학습 포인트

### 1. Indeterminate 상태의 이해

Checkbox만의 특징인 **indeterminate** 상태는:
- **언제 사용?** 부분 선택 상태 표현 (트리 구조의 부모 항목 등)
- **어떻게 구현?** 조건부 아이콘 렌더링 + data-indeterminate 속성
- **왜 필요?** 사용자에게 "일부만 선택됨"을 시각적으로 표시

### 2. Slot 시스템의 유연성

`useSlot` 훅으로:
- **root 슬롯**: CheckboxRoot 컴포넌트 교체 가능
- **input 슬롯**: input 요소에 props 추가 가능
- **mergeSlotProps**: 여러 소스의 props 병합

### 3. Theme 기반 동적 스타일링

`Object.entries(theme.palette).filter()`로:
- palette의 모든 색상에 대해 자동으로 variants 생성
- hover, checked, indeterminate, disabled 상태별 색상 적용
- createSimplePaletteValueFilter로 필터링
