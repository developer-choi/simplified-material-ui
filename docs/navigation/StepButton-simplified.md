# StepButton (Simplified)

## 간소화 결과

```jsx
'use client';
import * as React from 'react';
import StepLabel from '../StepLabel';
import StepContext from '../Step/StepContext';
import StepperContext from '../Stepper/StepperContext';

const StepButton = React.forwardRef(function StepButton(props, ref) {
  const { children, className, icon, optional, style, ...other } = props;

  const { disabled, active } = React.useContext(StepContext);
  const { orientation } = React.useContext(StepperContext);

  return (
    <button
      className={className}
      ref={ref}
      disabled={disabled}
      aria-current={active ? 'step' : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: orientation === 'vertical' ? 'flex-start' : 'center',
        background: 'none',
        border: 0,
        cursor: 'inherit',
        outline: 0,
        padding: 0,
        textDecoration: 'none',
        width: '100%',
        boxSizing: 'content-box',
        ...(orientation === 'vertical'
          ? { padding: '8px', margin: '-8px' }
          : { padding: '24px 16px', margin: '-24px -16px' }),
        ...style,
      }}
      {...other}
    >
      <StepLabel icon={icon} optional={optional}>{children}</StepLabel>
    </button>
  );
});

export default StepButton;
```

**132줄 → 43줄 (−67%)**

## 제거 항목 요약

| 항목 | 제거 이유 |
|------|---------|
| `StepButtonRoot` styled(ButtonBase) | `<button>` + inline style로 대체 |
| `ButtonBase` import | styled 제거로 불필요 |
| `styled` import | styled 제거 |
| `stepButtonClasses` import | styled 내부에서만 사용됨 |
| `isMuiElement` import + 조건 분기 | 항상 `<StepLabel>`로 고정 |
| `focusRipple` prop | ButtonBase 전용 |
| `TouchRippleProps` prop | ButtonBase 전용 |
| `useUtilityClasses`, `composeClasses` | 클래스 시스템 제거 |
| `getStepButtonUtilityClass` import | 클래스 시스템 제거 |
| `useDefaultProps`, `PropTypes`, `ownerState` | 테마/타입 시스템 제거 |

## 유지 항목 및 이유

| 항목 | 유지 이유 |
|------|---------|
| `StepContext` 소비 (`disabled`, `active`) | disabled 전달, aria-current 설정 |
| `StepperContext` 소비 (`orientation`) | 수평/수직 패딩·마진 결정 |
| `<StepLabel icon optional>` | children 래핑 핵심 동작 |
| `aria-current={active ? 'step' : undefined}` | 접근성 |
| `icon`, `optional` props | StepLabel로 전달 |

## 핵심 학습 포인트

### 1. styled(ButtonBase) → `<button>` + 브라우저 기본값 리셋

```jsx
// ButtonBase가 제공하던 스타일을 직접 명시
style={{
  display: 'inline-flex',
  alignItems: 'center',
  background: 'none',
  border: 0,
  cursor: 'inherit',
  outline: 0,
  padding: 0,
  textDecoration: 'none',
}}
```

브라우저 `<button>` 기본값(border, background, padding 등)을 리셋해야 ButtonBase와 동일한 시각적 결과.

### 2. isMuiElement 제거 → 항상 StepLabel 래핑

```jsx
// 원본: isMuiElement로 감지 후 분기
const child = isMuiElement(children, ['StepLabel'])
  ? React.cloneElement(children, childProps)
  : <StepLabel {...childProps}>{children}</StepLabel>;

// 간소화: 항상 StepLabel로 래핑
<StepLabel icon={icon} optional={optional}>{children}</StepLabel>
```

"StepLabel을 직접 전달" API는 복잡도에 비해 실용성이 낮음.

### 3. 수평/수직 패딩 분기

```jsx
...(orientation === 'vertical'
  ? { padding: '8px', margin: '-8px' }
  : { padding: '24px 16px', margin: '-24px -16px' }),
```

음수 마진(negative margin)은 클릭 영역을 레이아웃 바깥까지 확장하는 기법.
`boxSizing: 'content-box'`와 함께 사용해 패딩으로 늘어난 크기가 흐름에 영향 안 줌.

### 4. aria-current

```jsx
aria-current={active ? 'step' : undefined}
```

현재 활성 step을 스크린 리더에 알리는 WAI-ARIA 속성.
`undefined`를 전달하면 속성 자체가 DOM에 추가되지 않음.

### 5. DOM 구조

```
<button>           ← StepButton root (클릭 가능)
                     display:inline-flex, width:100%
                     negative margin으로 클릭 영역 확장
  <StepLabel>      ← 아이콘 + 텍스트 라벨
    <StepIcon />
    <span>{children}</span>
  </StepLabel>
</button>
```
