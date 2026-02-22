# ToggleButton (Simplified)

## 간소화 결과

```jsx
'use client';
import * as React from 'react';
import ToggleButtonGroupContext from '../ToggleButtonGroup/ToggleButtonGroupContext';
import isValueSelected from '../ToggleButtonGroup/isValueSelected';

const selectedColors = {
  standard:  { color: 'rgba(0,0,0,0.87)', backgroundColor: 'rgba(0,0,0,0.08)' },
  primary:   { color: '#1976d2',          backgroundColor: 'rgba(25,118,210,0.08)' },
  secondary: { color: '#9c27b0',          backgroundColor: 'rgba(156,39,176,0.08)' },
  error:     { color: '#d32f2f',          backgroundColor: 'rgba(211,47,47,0.08)' },
  warning:   { color: '#ed6c02',          backgroundColor: 'rgba(237,108,2,0.08)' },
  info:      { color: '#0288d1',          backgroundColor: 'rgba(2,136,209,0.08)' },
  success:   { color: '#2e7d32',          backgroundColor: 'rgba(46,125,50,0.08)' },
};

const sizePaddingMap = { small: 7, medium: 11, large: 15 };

const ToggleButton = React.forwardRef(function ToggleButton(props, ref) {
  const {
    children,
    className,
    color: colorProp,
    disabled: disabledProp,
    fullWidth: fullWidthProp,
    onChange: onChangeProp,
    onClick,
    selected: selectedProp,
    size: sizeProp,
    style,
    value,
    ...other
  } = props;

  const { value: contextValue, ...groupContext } = React.useContext(ToggleButtonGroupContext);
  const color    = colorProp    ?? groupContext.color    ?? 'standard';
  const disabled = disabledProp ?? groupContext.disabled ?? false;
  const fullWidth = fullWidthProp ?? groupContext.fullWidth ?? false;
  const size     = sizeProp     ?? groupContext.size     ?? 'medium';
  const onChange = groupContext.onChange ?? onChangeProp;
  const selected = selectedProp !== undefined ? selectedProp : isValueSelected(value, contextValue);

  const handleChange = (event) => {
    if (onClick) {
      onClick(event, value);
      if (event.defaultPrevented) return;
    }
    if (onChange) onChange(event, value);
  };

  const selColor = selectedColors[color] ?? selectedColors.primary;

  return (
    <button
      className={className}
      ref={ref}
      disabled={disabled}
      aria-pressed={selected}
      onClick={handleChange}
      value={value}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxSizing: 'border-box',
        outline: 0,
        margin: 0,
        appearance: 'none',
        cursor: disabled ? 'default' : 'pointer',
        textDecoration: 'none',
        userSelect: 'none',
        verticalAlign: 'middle',
        border: '1px solid rgba(0,0,0,0.12)',
        borderRadius: 4,
        padding: sizePaddingMap[size] ?? 11,
        fontFamily: 'inherit',
        fontSize: size === 'small' ? '0.8125rem' : size === 'large' ? '0.9375rem' : '0.875rem',
        fontWeight: 500,
        lineHeight: 1.75,
        letterSpacing: '0.02857em',
        textTransform: 'uppercase',
        color: disabled ? 'rgba(0,0,0,0.38)' : selected ? selColor.color : 'rgba(0,0,0,0.54)',
        backgroundColor: selected && !disabled ? selColor.backgroundColor : 'transparent',
        ...(fullWidth && { width: '100%' }),
        ...style,
      }}
      {...other}
    >
      {children}
    </button>
  );
});

export default ToggleButton;
```

**305줄 → 95줄 (−69%)**

## 제거 항목 요약

| 항목 | 제거 이유 |
|------|---------|
| `ToggleButtonRoot` styled(ButtonBase) | `<button>` + inline style로 대체 |
| `ButtonBase` import | 직접 button으로 교체 |
| `styled`, `memoTheme`, `createSimplePaletteValueFilter` | styled 제거 |
| `resolveProps` | `??` 연산자로 직접 context merge |
| `color` 동적 팔레트 순회 variants | `selectedColors` 7개 하드코딩 map으로 대체 |
| `ToggleButtonGroupButtonContext` | position className → class 없으므로 효과 없음 |
| `disableFocusRipple` prop | ripple 없음 (ButtonBase 전용) |
| `useUtilityClasses`, `composeClasses`, `capitalize`, `clsx` | 클래스 시스템 제거 |
| `useDefaultProps`, `PropTypes`, `ownerState` | 테마/타입 시스템 제거 |

## 유지 항목 및 이유

| 항목 | 유지 이유 |
|------|---------|
| `ToggleButtonGroupContext` | group에서 color/size/fullWidth/disabled/onChange/value 수신 |
| `isValueSelected` | group value에서 selected 상태 계산 |
| `handleChange` | onClick + onChange를 value와 함께 묶는 패턴 |
| `aria-pressed={selected}` | 접근성 |
| `selected`, `value` props | 단독 사용 시 직접 제어 |

## 핵심 학습 포인트

### 1. resolveProps → ?? 연산자로 직접 구현

```js
// 원본: resolveProps가 context props vs inProps 우선순위 처리
const resolvedProps = resolveProps(
  { ...contextProps, selected: isValueSelected(inProps.value, contextValue) },
  inProps,
);

// 간소화: ?? 연산자로 동일한 우선순위 구현
// inProps.colorProp이 정의되어 있으면 사용, 없으면 groupContext.color, 없으면 기본값
const color = colorProp ?? groupContext.color ?? 'standard';
```

`resolveProps`가 하던 "undefined이면 fallback" 로직을 `??` (nullish coalescing)으로 직접 표현.

### 2. selectedColors map — 팔레트 순회 대체

```js
// 원본: theme.palette 전체를 런타임에 순회해서 selected 스타일 생성
...Object.entries(theme.palette)
  .filter(createSimplePaletteValueFilter())
  .map(([color]) => ({ props: { color }, style: { ... } }))

// 간소화: 7가지 semantic 색상 하드코딩
const selectedColors = {
  standard: { color: 'rgba(0,0,0,0.87)', backgroundColor: 'rgba(0,0,0,0.08)' },
  primary:  { color: '#1976d2',          backgroundColor: 'rgba(25,118,210,0.08)' },
  // ...
};
// selectedOpacity = 0.08 → backgroundColor = rgba(main, 0.08)
```

### 3. selected 상태 → 인라인 스타일 직접 반영

```js
// 원본: CSS 클래스(`.Mui-selected`) 선택자로 처리
[`&.${toggleButtonClasses.selected}`]: {
  color: theme.palette[color].main,
  backgroundColor: theme.alpha(theme.palette[color].main, selectedOpacity),
}

// 간소화: selected 변수를 인라인 스타일에서 직접 읽음
color: disabled ? 'rgba(0,0,0,0.38)' : selected ? selColor.color : 'rgba(0,0,0,0.54)',
backgroundColor: selected && !disabled ? selColor.backgroundColor : 'transparent',
```

### 4. isValueSelected — exclusive vs multi-select 판별

```js
// ToggleButtonGroup exclusive=true 모드: group value는 string
<ToggleButtonGroup exclusive value="bold">
  <ToggleButton value="bold" />  // selected = "bold" === "bold" → true
  <ToggleButton value="italic" /> // selected = "italic" === "bold" → false
</ToggleButtonGroup>

// exclusive=false 모드: group value는 string[]
<ToggleButtonGroup value={['bold', 'italic']}>
  <ToggleButton value="bold" />   // selected = ['bold','italic'].includes('bold') → true
  <ToggleButton value="center" /> // selected = ['bold','italic'].includes('center') → false
</ToggleButtonGroup>
```

`isValueSelected`가 두 모드를 모두 처리: `Array.isArray(candidate)` 분기.

### 5. handleChange — value 전달 + defaultPrevented 패턴

```js
const handleChange = (event) => {
  if (onClick) {
    onClick(event, value);           // onClick에 value 함께 전달
    if (event.defaultPrevented) return; // onClick에서 preventDefault() 호출 시 onChange 차단
  }
  if (onChange) onChange(event, value); // ToggleButtonGroup의 handleChange/handleExclusiveChange
};
```

`event.defaultPrevented` 체크: 커스텀 onClick에서 `e.preventDefault()`를 호출하면
group value 업데이트를 차단할 수 있음.

### 6. 하드코딩 값 근거

| 항목 | 값 | 출처 |
|------|---|------|
| border | `rgba(0,0,0,0.12)` | palette.divider |
| 기본 color | `rgba(0,0,0,0.54)` | palette.action.active |
| disabled color | `rgba(0,0,0,0.38)` | palette.action.disabled |
| borderRadius | `4px` | shape.borderRadius 기본값 |
| selectedOpacity | `0.08` | palette.action.selectedOpacity |
| medium padding | `11px` | typography.button + 패딩 |
