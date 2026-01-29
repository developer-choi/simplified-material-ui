# NativeSelectInput 컴포넌트

> Material-UI의 NativeSelectInput 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

NativeSelectInput은 **네이티브 `<select>` 엘리먼트를 렌더링하고 Material-UI 스타일을 적용하는 내부 컴포넌트**입니다.

> **💡 작성 주의**: NativeSelectInput 자체가 하는 일만 작성하세요. NativeSelect 래퍼나 FormControl의 기능은 제외

### 핵심 기능
1. **Select 엘리먼트 렌더링** - 브라우저 네이티브 `<select>` 태그 출력
2. **드롭다운 아이콘 표시** - select 옆에 화살표 아이콘 렌더링 (multiple 제외)
3. **Variant 스타일링** - standard, outlined, filled 3가지 스타일 적용
4. **상태 기반 스타일** - disabled, error, multiple 상태에 따른 스타일링

---

## 내부 구조

### 1. 컴포넌트 계층 (렌더링 구조)

```javascript
// 위치: packages/mui-material/src/NativeSelect/NativeSelectInput.js (253줄)

NativeSelectInput
  └─> Fragment
       ├─> NativeSelectSelect (styled <select>)
       │    └─> {children} // <option> 엘리먼트들
       └─> NativeSelectIcon (styled <svg>) // multiple=false일 때만
```

### 2. styled 컴포넌트 구조

```javascript
StyledSelectSelect (기반 styled)
  └─> NativeSelectSelect (슬롯 styled, overridesResolver)
       └─> 실제 <select> 엘리먼트

StyledSelectIcon (기반 styled)
  └─> NativeSelectIcon (슬롯 styled, overridesResolver)
       └─> 실제 <svg> 엘리먼트
```

### 3. StyledSelectSelect (Select 스타일)

**역할**: 네이티브 `<select>` 엘리먼트의 기본 스타일 정의

```javascript
export const StyledSelectSelect = styled('select', {
  name: 'MuiNativeSelect',
})(({ theme }) => ({
  // 브라우저 기본 스타일 제거
  MozAppearance: 'none',
  WebkitAppearance: 'none',

  // 텍스트 선택 방지
  userSelect: 'none',

  // 기본 스타일
  borderRadius: 0,
  cursor: 'pointer',

  '&:focus': {
    borderRadius: 0, // Chrome 스타일 리셋
  },

  [`&.${nativeSelectClasses.disabled}`]: {
    cursor: 'default',
  },

  '&[multiple]': {
    height: 'auto',
  },

  // variant별 스타일 (variants 배열)
  variants: [
    {
      props: ({ ownerState }) =>
        ownerState.variant !== 'filled' && ownerState.variant !== 'outlined',
      style: {
        '&&&': {
          paddingRight: 24,
          minWidth: 16,
        },
      },
    },
    {
      props: { variant: 'filled' },
      style: {
        '&&&': {
          paddingRight: 32,
        },
      },
    },
    {
      props: { variant: 'outlined' },
      style: {
        borderRadius: (theme.vars || theme).shape.borderRadius,
        '&:focus': {
          borderRadius: (theme.vars || theme).shape.borderRadius,
        },
        '&&&': {
          paddingRight: 32,
        },
      },
    },
  ],
}));
```

**핵심 포인트**:
- **&&&**: CSS 특성 높이기를 위한 중첩 (MUI의 커스터마이징 대응)
- **variants 배열**: 조건부 스타일을 선언적으로 정의 (MUI v5 스타일 시스템)
- **MozAppearance/WebkitAppearance**: 브라우저 기본 화살표 제거

### 4. NativeSelectSelect (슬롯 오버라이드)

**역할**: StyledSelectSelect를 감싸고 overridesResolver로 테마 오버라이드 지원

```javascript
const NativeSelectSelect = styled(StyledSelectSelect, {
  name: 'MuiNativeSelect',
  slot: 'Select', // 슬롯 이름
  shouldForwardProp: rootShouldForwardProp,
  overridesResolver: (props, styles) => {
    const { ownerState } = props;
    return [
      styles.select,
      styles[ownerState.variant],
      ownerState.error && styles.error,
      { [`&.${nativeSelectClasses.multiple}`]: styles.multiple },
    ];
  },
})({});
```

**왜 2중 wrapped인가?**:
- `StyledSelectSelect`: 기본 스타일 정의
- `NativeSelectSelect`: 슬롯 시스템 연결 (테마 오버라이드)

### 5. StyledSelectIcon (아이콘 스타일)

**역할**: 드롭다운 화살표 아이콘의 스타일 정의

```javascript
export const StyledSelectIcon = styled('svg', {
  name: 'MuiNativeSelect',
})(({ theme }) => ({
  // 절대 위치로 select 위에 겹치기
  position: 'absolute',
  right: 0,
  top: 'calc(50% - .5em)',

  // 포인터 이벤트 무시 (select로 전달)
  pointerEvents: 'none',

  color: (theme.vars || theme).palette.action.active,

  [`&.${nativeSelectClasses.disabled}`]: {
    color: (theme.vars || theme).palette.action.disabled,
  },

  // open 상태 시 회전
  variants: [
    {
      props: ({ ownerState }) => ownerState.open,
      style: {
        transform: 'rotate(180deg)',
      },
    },
    {
      props: { variant: 'filled' },
      style: {
        right: 7,
      },
    },
    {
      props: { variant: 'outlined' },
      style: {
        right: 7,
      },
    },
  ],
}));
```

**핵심 포인트**:
- **pointerEvents: 'none'**: 아이콘 클릭을 select로 전달 (중요!)
- **position: absolute**: select 오른쪽에 겹쳐서 표시

### 6. useUtilityClasses (클래스 생성)

**역할**: ownerState를 기반으로 CSS 클래스 이름 생성

```javascript
const useUtilityClasses = (ownerState) => {
  const { classes, variant, disabled, multiple, open, error } = ownerState;

  const slots = {
    select: [
      'select',
      variant,
      disabled && 'disabled',
      multiple && 'multiple',
      error && 'error'
    ],
    icon: [
      'icon',
      `icon${capitalize(variant)}`,
      open && 'iconOpen',
      disabled && 'disabled'
    ],
  };

  return composeClasses(slots, getNativeSelectUtilityClasses, classes);
};
```

**왜 필요한가?**:
- 테마 오버라이드: 사용자가 `classes={{ select: 'my-select' }}`로 커스터마이징
- 조건부 클래스: disabled, error 등 상태에 따른 클래스 추가

### 7. NativeSelectInput (메인 컴포넌트)

**렌더링 로직**:

```javascript
const NativeSelectInput = React.forwardRef(function NativeSelectInput(props, ref) {
  const {
    className,
    disabled,
    error,
    IconComponent,
    inputRef,
    variant = 'standard',
    ...other
  } = props;

  const ownerState = {
    ...props,
    disabled,
    variant,
    error,
  };

  const classes = useUtilityClasses(ownerState);

  return (
    <React.Fragment>
      <NativeSelectSelect
        ownerState={ownerState}
        className={clsx(classes.select, className)}
        disabled={disabled}
        ref={inputRef || ref} // inputRef 우선, 없으면 ref 사용
        {...other}
      />
      {props.multiple ? null : (
        <NativeSelectIcon
          as={IconComponent} // 동적 컴포넌트 (ArrowDropDownIcon 등)
          ownerState={ownerState}
          className={classes.icon}
        />
      )}
    </React.Fragment>
  );
});
```

**핵심 포인트**:
- **Fragment**: 추가 DOM 레이어 없이 여러 엘리먼트 렌더링
- **inputRef || ref**: 하위 호환성을 위한 ref 병합 (deprecated)
- **as prop**: IconComponent를 styled 컴포넌트로 렌더링 (polymorphic 컴포넌트 패턴)
- **multiple 체크**: 다중 선택일 때는 아이콘 숨김

### 8. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | node | - | `<option>` 엘리먼트들 |
| `classes` | object | - | 커스텀 CSS 클래스 오버라이드 |
| `className` | string | - | select 엘리먼트의 클래스 이름 |
| `disabled` | bool | - | 비활성화 상태 |
| `error` | bool | - | 에러 상태 |
| `IconComponent` | elementType | - | 아이콘 컴포넌트 (예: ArrowDropDownIcon) |
| `inputRef` | ref | - | **deprecated**: select 엘리먼트에 전달할 ref |
| `multiple` | bool | - | 다중 선택 여부 |
| `name` | string | - | name 속성 |
| `onChange` | func | - | 선택 변경 이벤트 핸들러 |
| `value` | any | - | 선택된 값 |
| `variant` | 'standard' \| 'outlined' \| 'filled' | 'standard' | 스타일 변형 |

---

## 설계 패턴

1. **2중 styled 컴포넌트** (StyledSelectSelect → NativeSelectSelect)
   - 기본 스타일과 슬롯 시스템 분리
   - 테마 오버라이드 지원

2. **슬롯 시스템** (slot: 'Select')
   - `overridesResolver`로 테마의 스타일을 컴포넌트에 연결
   - 사용자가 `theme.components.MuiNativeSelect.variants`로 커스터마이징

3. **Polymorphic 컴포넌트** (as prop)
   - `as={IconComponent}`로 동적으로 컴포넌트 교체
   - MUI v5의 패턴

4. **ownerState 패턴**
   - props를 `ownerState`로 묶어서 styled에 전달
   - styled 내부에서 `props.ownerState.variant` 등으로 접근

5. **variants 배열** (MUI v5 스타일 시스템)
   - 조건부 스타일을 선언적으로 정의
   - `props: ({ ownerState }) => ownerState.variant === 'filled'`

---

## 복잡도의 이유

NativeSelectInput은 **253줄**이며, 복잡한 이유는:

1. **Variant 시스템** - standard, outlined, filled 3가지 스타일 (variants 배열)
2. **슬롯 시스템** - 테마 오버라이드 지원 (overridesResolver)
3. **클래스 시스템** - useUtilityClasses, composeClasses로 클래스 생성
4. **2중 styled** - StyledSelectSelect → NativeSelectSelect 구조
5. **Polymorphic 컴포넌트** - as prop으로 IconComponent 동적 교체
6. **하위 호환성** - inputRef deprecated prop 지원

---

## 비교: NativeSelectInput vs SelectInput

| 기능 | NativeSelectInput | SelectInput |
|------|-------------------|-------------|
| 기반 엘리먼트 | `<select>` (네이티브) | div + Menu (커스텀) |
| 드롭다운 | 브라우저 네이티브 | Material-UI Menu 컴포넌트 |
| 스타일링 | styled-components | styled-components |
| 아이콘 | SVG | SVG |
| 다중 선택 | 네이티브 지원 | MenuList에서 처리 |
| 번들 사이즈 | 작음 | 큼 (Menu 의존) |

**핵심 차이**:
- NativeSelectInput: 브라우저 네이티브 `<select>` 사용 (가볍고 단순)
- SelectInput: 커스텀 드롭다운 구현 (풍부한 UI, 무거움)
