# ToggleButtonGroup (Simplified)

## 간소화 결과

```jsx
'use client';
import * as React from 'react';
import ToggleButtonGroupContext from './ToggleButtonGroupContext';

const ToggleButtonGroup = React.forwardRef(function ToggleButtonGroup(props, ref) {
  const {
    children,
    className,
    color = 'standard',
    disabled = false,
    exclusive = false,
    fullWidth = false,
    onChange,
    orientation = 'horizontal',
    size = 'medium',
    style,
    value,
    ...other
  } = props;

  const handleChange = React.useCallback(
    (event, buttonValue) => {
      if (!onChange) return;
      const index = value && value.indexOf(buttonValue);
      let newValue;
      if (value && index >= 0) {
        newValue = value.slice();
        newValue.splice(index, 1);
      } else {
        newValue = value ? value.concat(buttonValue) : [buttonValue];
      }
      onChange(event, newValue);
    },
    [onChange, value],
  );

  const handleExclusiveChange = React.useCallback(
    (event, buttonValue) => {
      if (!onChange) return;
      onChange(event, value === buttonValue ? null : buttonValue);
    },
    [onChange, value],
  );

  const context = React.useMemo(
    () => ({
      onChange: exclusive ? handleExclusiveChange : handleChange,
      value,
      size,
      fullWidth,
      color,
      disabled,
    }),
    [exclusive, handleExclusiveChange, handleChange, value, size, fullWidth, color, disabled],
  );

  return (
    <div
      role="group"
      className={className}
      ref={ref}
      style={{
        display: 'inline-flex',
        borderRadius: 4,
        ...(orientation === 'vertical' && { flexDirection: 'column' }),
        ...(fullWidth && { width: '100%' }),
        ...style,
      }}
      {...other}
    >
      <ToggleButtonGroupContext.Provider value={context}>
        {children}
      </ToggleButtonGroupContext.Provider>
    </div>
  );
});

export default ToggleButtonGroup;
```

**339줄 → 70줄 (−79%)**

## 제거 항목 요약

| 항목 | 제거 이유 |
|------|---------|
| `ToggleButtonGroupRoot` styled('div') | `<div>` + inline style로 대체 |
| `styled`, `memoTheme` | styled 제거 |
| `ToggleButtonGroupButtonContext.Provider` 래핑 | ToggleButton이 이미 읽지 않음 |
| `ToggleButtonGroupButtonContext` import | 미사용 |
| `getValidReactChildren` + `validChildren.map` | Provider 래핑 제거로 불필요 |
| `isFragment` import + Fragment 검사 | map 제거로 불필요 |
| `toggleButtonClasses` import | 미사용 |
| `className: classes.grouped` (context 내) | classes 제거로 불필요 |
| `useUtilityClasses`, `composeClasses`, `capitalize`, `clsx` | 클래스 시스템 제거 |
| `useDefaultProps`, `PropTypes`, `ownerState` | 테마/타입 시스템 제거 |

## 유지 항목 및 이유

| 항목 | 유지 이유 |
|------|---------|
| `ToggleButtonGroupContext.Provider` | 자식 ToggleButton에 상태 주입 |
| `handleChange` / `handleExclusiveChange` | multi-select / exclusive 선택 로직 |
| `React.useMemo`(context) | 불필요한 자식 리렌더 방지 |
| `exclusive`, `value`, `onChange` | 핵심 상태 제어 |
| `color`, `size`, `fullWidth`, `disabled` | context를 통해 자식에 전달 |
| `orientation` | `flexDirection` 전환 |
| `role="group"` | 접근성 |

## 핵심 학습 포인트

### 1. handleChange — multi-select 토글 로직

```js
const handleChange = React.useCallback((event, buttonValue) => {
  if (!onChange) return;
  const index = value && value.indexOf(buttonValue);
  let newValue;
  if (value && index >= 0) {
    // 이미 선택된 값: 배열에서 제거
    newValue = value.slice();
    newValue.splice(index, 1);
  } else {
    // 미선택: 배열에 추가
    newValue = value ? value.concat(buttonValue) : [buttonValue];
  }
  onChange(event, newValue);
}, [onChange, value]);
```

`value`가 `string[]`. 버튼 클릭 시 해당 값이 배열에 있으면 제거, 없으면 추가.
**불변성 유지**: `value.slice()` + `splice()` (원본 배열 복사 후 수정).

### 2. handleExclusiveChange — exclusive(단일 선택) 토글 로직

```js
const handleExclusiveChange = React.useCallback((event, buttonValue) => {
  if (!onChange) return;
  onChange(event, value === buttonValue ? null : buttonValue);
}, [onChange, value]);
```

`value`가 `string | null`. 이미 선택된 값 클릭 → `null`(선택 해제).
다른 값 클릭 → 해당 값으로 교체.

### 3. ToggleButtonGroupButtonContext 제거의 영향

```jsx
// 원본: 각 자식을 ToggleButtonGroupButtonContext.Provider로 래핑
{validChildren.map((child, index) => (
  <ToggleButtonGroupButtonContext.Provider key={index} value={getButtonPositionClassName(index)}>
    {child}
  </ToggleButtonGroupButtonContext.Provider>
))}

// 간소화: 직접 children 렌더링
{children}
```

제거로 인해 position 기반 border-radius 조정이 없어진다:
- firstButton: 오른쪽 모서리 미조정
- lastButton: 왼쪽 모서리 미조정
- 인접 selected 버튼 사이 border 제거 없음

시각적 트레이드오프지만 ToggleButton에서도 이미 이 Context를 읽지 않으므로 일관성 유지.

### 4. React.useMemo로 context 메모이제이션

```js
const context = React.useMemo(
  () => ({
    onChange: exclusive ? handleExclusiveChange : handleChange,
    value, size, fullWidth, color, disabled,
  }),
  [exclusive, handleExclusiveChange, handleChange, value, size, fullWidth, color, disabled],
);
```

context 객체가 매 렌더마다 새로 생성되면 모든 자식 ToggleButton이 불필요하게 리렌더됨.
`useMemo`로 의존성이 바뀔 때만 새 객체 생성 → 자식 리렌더 최소화.

### 5. 선택 모드 비교

| 모드 | `exclusive` | `value` 타입 | 동작 |
|------|------------|------------|------|
| multi-select | `false` (기본) | `string[]` | 여러 버튼 동시 선택 가능 |
| exclusive | `true` | `string \| null` | 한 번에 하나만 선택 |

```jsx
// multi-select: 볼드+이탤릭 동시 선택 가능
<ToggleButtonGroup value={['bold', 'italic']} onChange={handleChange}>
  <ToggleButton value="bold">B</ToggleButton>
  <ToggleButton value="italic">I</ToggleButton>
</ToggleButtonGroup>

// exclusive: 정렬 중 하나만 선택
<ToggleButtonGroup exclusive value="left" onChange={handleChange}>
  <ToggleButton value="left">Left</ToggleButton>
  <ToggleButton value="center">Center</ToggleButton>
  <ToggleButton value="right">Right</ToggleButton>
</ToggleButtonGroup>
```
