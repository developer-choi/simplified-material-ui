# Tab (Simplified)

## 간소화 결과

```jsx
'use client';
import * as React from 'react';

const tabSelectedColor = { primary: '#1976d2', secondary: '#9c27b0' };

const Tab = React.forwardRef(function Tab(props, ref) {
  const {
    className,
    disabled = false,
    fullWidth,
    icon: iconProp,
    iconPosition = 'top',
    indicator,
    label,
    onChange,
    onClick,
    onFocus,
    selected,
    selectionFollowsFocus,
    style,
    textColor = 'inherit',
    value,
    wrapped = false,
    ...other
  } = props;

  const handleClick = (event) => {
    if (!selected && onChange) onChange(event, value);
    if (onClick) onClick(event);
  };

  const handleFocus = (event) => {
    if (selectionFollowsFocus && !selected && onChange) onChange(event, value);
    if (onFocus) onFocus(event);
  };

  const hasIconAndLabel = !!iconProp && !!label;
  const iconEl = hasIconAndLabel
    ? <span style={{
        ...(iconPosition === 'top'    && { marginBottom: 6 }),
        ...(iconPosition === 'bottom' && { marginTop: 6 }),
        ...(iconPosition === 'start'  && { marginRight: 8 }),
        ...(iconPosition === 'end'    && { marginLeft: 8 }),
      }}>{iconProp}</span>
    : iconProp;

  const textColorStyle = textColor === 'inherit'
    ? { color: 'inherit', opacity: disabled ? 0.38 : selected ? 1 : 0.6 }
    : { color: disabled ? 'rgba(0,0,0,0.38)' : selected
        ? (tabSelectedColor[textColor] ?? 'rgba(0,0,0,0.87)')
        : 'rgba(0,0,0,0.6)' };

  return (
    <button
      className={className}
      ref={ref}
      role="tab"
      aria-selected={selected}
      disabled={disabled}
      onClick={handleClick}
      onFocus={handleFocus}
      tabIndex={selected ? 0 : -1}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxSizing: 'border-box',
        outline: 0,
        margin: 0,
        appearance: 'none',
        border: 0,
        backgroundColor: 'transparent',
        cursor: disabled ? 'default' : 'pointer',
        textDecoration: 'none',
        userSelect: 'none',
        verticalAlign: 'middle',
        maxWidth: fullWidth ? 'none' : 360,
        minWidth: 90,
        minHeight: hasIconAndLabel ? 72 : 48,
        flexShrink: fullWidth ? 1 : 0,
        ...(fullWidth && { flexGrow: 1, flexBasis: 0 }),
        padding: hasIconAndLabel ? '9px 16px' : '12px 16px',
        overflow: 'hidden',
        whiteSpace: 'normal',
        textAlign: 'center',
        lineHeight: 1.25,
        flexDirection: hasIconAndLabel && (iconPosition === 'top' || iconPosition === 'bottom')
          ? 'column' : 'row',
        fontFamily: 'inherit',
        fontSize: wrapped ? '0.75rem' : '0.875rem',
        fontWeight: 500,
        letterSpacing: '0.02857em',
        textTransform: 'uppercase',
        ...textColorStyle,
        ...style,
      }}
      {...other}
    >
      {iconPosition === 'top' || iconPosition === 'start' ? (
        <React.Fragment>{iconEl}{label}</React.Fragment>
      ) : (
        <React.Fragment>{label}{iconEl}</React.Fragment>
      )}
      {indicator}
    </button>
  );
});

export default Tab;
```

**369줄 → 110줄 (−70%)**

## 제거 항목 요약

| 항목 | 제거 이유 |
|------|---------|
| `TabRoot` styled(ButtonBase) | `<button>` + inline style로 대체 |
| `ButtonBase` import | 직접 button으로 교체 |
| `styled`, `memoTheme` | styled 제거 |
| `cloneElement(iconProp, { className })` | `<span>` wrapper로 icon 마진 처리 |
| `disableFocusRipple` prop | ripple 없음 (ButtonBase 전용) |
| `unsupportedProp` | PropTypes 제거로 불필요 |
| `useUtilityClasses`, `composeClasses`, `capitalize`, `tabClasses`, `getTabUtilityClass`, `clsx` | 클래스 시스템 제거 |
| `useDefaultProps`, `PropTypes`, `ownerState` | 테마/타입 시스템 제거 |

## 유지 항목 및 이유

| 항목 | 유지 이유 |
|------|---------|
| `handleClick` | selected 아닐 때만 onChange 호출 |
| `handleFocus` | `selectionFollowsFocus` 키보드 접근성 |
| `role="tab"`, `aria-selected`, `tabIndex` | ARIA 탭 패턴 접근성 |
| `indicator` prop | Tabs 부모가 주입하는 선택 표시선 |
| `iconPosition` | icon 위치에 따른 flexDirection + margin |
| `textColor` | inherit/primary/secondary 색상 분기 |
| `wrapped`, `fullWidth` | 텍스트 줄바꿈, 균등 너비 |

## 핵심 학습 포인트

### 1. cloneElement → span wrapper 패턴 전환

```jsx
// 원본: cloneElement로 icon에 CSS 클래스 주입 → CSS 선택자로 마진 적용
const icon = iconProp && label && React.isValidElement(iconProp)
  ? React.cloneElement(iconProp, {
      className: clsx(classes.icon, iconProp.props.className),
    })
  : iconProp;
// styled에서: [& > .MuiTab-icon] { marginBottom: 6px }

// 간소화: span으로 감싸서 inline style로 직접 마진 적용
const iconEl = hasIconAndLabel
  ? <span style={{ ...(iconPosition === 'top' && { marginBottom: 6 }), ... }}>{iconProp}</span>
  : iconProp;
```

cloneElement가 prop 주입(className)을 위해 사용되는 경우, wrapper span으로 대체 가능.
단, 이 방식은 DOM에 span이 추가되어 구조가 약간 달라짐.

### 2. textColor 삼중 상태 (normal/selected/disabled)

```js
const textColorStyle = textColor === 'inherit'
  ? { color: 'inherit', opacity: disabled ? 0.38 : selected ? 1 : 0.6 }
  : { color: disabled ? 'rgba(0,0,0,0.38)' : selected
      ? (tabSelectedColor[textColor] ?? 'rgba(0,0,0,0.87)')
      : 'rgba(0,0,0,0.6)' };
```

- `inherit` 모드: `color: inherit` + opacity로 투명도 조절 (배경/부모 색 활용)
- `primary`/`secondary` 모드: color 직접 변경 (텍스트 색 전환)

| 모드 | normal | selected | disabled |
|------|--------|---------|---------|
| inherit | color:inherit, 0.6 | opacity:1 | opacity:0.38 |
| primary | rgba(0,0,0,0.6) | #1976d2 | rgba(0,0,0,0.38) |
| secondary | rgba(0,0,0,0.6) | #9c27b0 | rgba(0,0,0,0.38) |

### 3. icon+label 동시 존재 시 레이아웃 변화

```js
const hasIconAndLabel = !!iconProp && !!label;

// minHeight: 48 → 72 (더 여유 있는 높이)
// padding: '12px 16px' → '9px 16px' (세로 여백 축소)
// flexDirection: top/bottom → 'column', start/end → 'row'

// icon 렌더 순서 (iconPosition 기반):
{iconPosition === 'top' || iconPosition === 'start' ? (
  <>{iconEl}{label}</>
) : (
  <>{label}{iconEl}</>  // bottom, end: 레이블이 먼저
)}
```

### 4. handleClick — 이미 선택된 탭은 onChange 미호출

```js
const handleClick = (event) => {
  if (!selected && onChange) onChange(event, value);  // selected이면 스킵
  if (onClick) onClick(event);  // onClick은 항상 호출
};
```

탭 특성: 이미 활성화된 탭 재클릭은 의미 없음 → onChange 불필요.
하지만 `onClick` 커스텀 핸들러는 항상 실행.

### 5. tabIndex — 키보드 네비게이션

```js
tabIndex={selected ? 0 : -1}
```

ARIA 탭 패턴: 선택된 탭만 Tab 키로 접근 가능(`tabIndex=0`).
나머지 탭은 방향키(`ArrowLeft`/`ArrowRight`)로 이동 — Tabs 부모가 키 이벤트 처리.

### 6. selectionFollowsFocus

```js
const handleFocus = (event) => {
  if (selectionFollowsFocus && !selected && onChange) onChange(event, value);
  if (onFocus) onFocus(event);
};
```

ARIA 탭 패턴에는 두 가지 키보드 모드:
- **Manual selection**: 방향키로 포커스 이동, Enter/Space로 선택
- **Automatic selection** (`selectionFollowsFocus=true`): 방향키로 포커스 이동하면 자동 선택

Tabs 부모에서 이 prop을 주입해 모드를 결정.
