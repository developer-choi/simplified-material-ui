# MobileStepper 단순화 결과

> MobileStepper 컴포넌트 간소화 과정 및 최종 결과

---

## 간소화 전/후 비교

| 항목 | 원본 | 단순화 |
|------|------|--------|
| 줄 수 | 326줄 | ~75줄 |
| 의존성 | Paper, styled, memoTheme, useSlot 등 9개 | LinearProgress 1개 |
| 스타일링 | CSS-in-JS (4개 styled 컴포넌트 + variants) | 인라인 style |
| 슬롯 시스템 | useSlot + slots/slotProps | 없음 |

---

## 최종 코드

```javascript
'use client';
import * as React from 'react';
import LinearProgress from '../LinearProgress';

function MobileStepper(props) {
  const {
    activeStep = 0,
    backButton,
    nextButton,
    position = 'bottom',
    steps,
    variant = 'dots',
    ...other
  } = props;

  let value;
  if (variant === 'progress') {
    if (steps === 1) {
      value = 100;
    } else {
      value = Math.ceil((activeStep / (steps - 1)) * 100);
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 8,
        ...(position !== 'static' && {
          position: 'fixed',
          left: 0,
          right: 0,
          zIndex: 1000,
          ...(position === 'top' ? { top: 0 } : { bottom: 0 }),
        }),
      }}
      {...other}
    >
      {backButton}
      {variant === 'text' && (
        <React.Fragment>
          {activeStep + 1} / {steps}
        </React.Fragment>
      )}
      {variant === 'dots' && (
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          {[...new Array(steps)].map((_, index) => (
            <div
              key={index}
              style={{
                borderRadius: '50%',
                width: 8,
                height: 8,
                margin: '0 2px',
                backgroundColor: index === activeStep ? '#1976d2' : 'rgba(0,0,0,0.26)',
              }}
            />
          ))}
        </div>
      )}
      {variant === 'progress' && (
        <LinearProgress variant="determinate" value={value} style={{ width: '50%' }} />
      )}
      {nextButton}
    </div>
  );
}

export default MobileStepper;
```

---

## 제거된 것들 (6단계)

| 단계 | 제거 대상 | 이유 |
|------|-----------|------|
| 1 | PropTypes (~76줄) | 학습 목적에 불필요 |
| 2 | `useDefaultProps` | 함수 파라미터 기본값으로 충분 |
| 3 | `className/classes/useUtilityClasses` + 관련 imports 4개 | 인라인 스타일로 대체 |
| 4 | `useSlot/slots/slotProps/LinearProgressProps` | styled 컴포넌트 직접 사용으로 대체 |
| 5 | `forwardRef` | 외부 ref 전달 학습 주제 분리 |
| 6 | 4개 styled 컴포넌트 (MobileStepperRoot/Dots/Dot/Progress) + Paper/styled/memoTheme | 핵심은 렌더링 로직 자체 |

---

## 핵심 학습 포인트

### 1. 3가지 variant 분기 렌더링

```javascript
{variant === 'text' && <span>{activeStep + 1} / {steps}</span>}
{variant === 'dots' && <div>...</div>}
{variant === 'progress' && <LinearProgress ... />}
```

- 하나의 컴포넌트가 3가지 완전히 다른 UI를 렌더링
- `variant` prop으로 조건부 렌더링 분기

### 2. progress 값 계산

```javascript
let value;
if (variant === 'progress') {
  if (steps === 1) {
    value = 100;  // 전체가 1단계면 100%
  } else {
    value = Math.ceil((activeStep / (steps - 1)) * 100);
  }
}
```

- `steps - 1`로 나누는 이유: activeStep이 0부터 시작, 마지막 단계가 `steps - 1`이므로 마지막에 100%가 됨
- `Math.ceil`로 소수점 올림 처리

### 3. dots 렌더링 패턴

```javascript
{[...new Array(steps)].map((_, index) => (
  <div
    key={index}
    style={{
      backgroundColor: index === activeStep ? '#1976d2' : 'rgba(0,0,0,0.26)',
    }}
  />
))}
```

- `new Array(steps)`로 빈 배열 생성, 스프레드로 iterable하게 만든 후 map
- `index === activeStep` 조건으로 활성 dot 색상 분기

### 4. position 조건부 고정 스타일

```javascript
...(position !== 'static' && {
  position: 'fixed',
  left: 0,
  right: 0,
  zIndex: 1000,
  ...(position === 'top' ? { top: 0 } : { bottom: 0 }),
}),
```

- 스프레드 연산자로 조건부 스타일 객체 합성
- `&&` 단락 평가: `false && obj` → `false` (스프레드해도 무시됨)
- 중첩된 조건부 스타일로 top/bottom 위치 결정

### 5. useSlot 패턴 (원본에서 제거됨)

```javascript
// 원본: useSlot으로 슬롯 시스템 구현
const [RootSlot, rootSlotProps] = useSlot('root', {
  elementType: MobileStepperRoot,
  externalForwardedProps: { slots, slotProps, ...other },
  ownerState,
});
<RootSlot {...rootSlotProps}>...</RootSlot>

// 단순화: styled 컴포넌트 직접 사용
<MobileStepperRoot ownerState={ownerState} {...other}>...</MobileStepperRoot>
```

- useSlot은 외부에서 내부 컴포넌트(슬롯)를 교체할 수 있게 해주는 MUI 고급 패턴
- `slots.root`에 커스텀 컴포넌트를 넣으면 MobileStepperRoot 대신 그것이 렌더링됨
