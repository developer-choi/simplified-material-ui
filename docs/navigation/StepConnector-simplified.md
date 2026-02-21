# StepConnector (Simplified)

## 간소화 결과

```js
'use client';
import * as React from 'react';
import StepperContext from '../Stepper/StepperContext';
import StepContext from '../Step/StepContext';

const StepConnector = React.forwardRef(function StepConnector(props, ref) {
  const { className, style, ...other } = props;

  const { orientation = 'horizontal' } = React.useContext(StepperContext);
  const { active, completed } = React.useContext(StepContext);

  const lineColor = (active || completed) ? '#1976d2' : '#bdbdbd';

  return (
    <div
      className={className}
      ref={ref}
      style={{
        flex: '1 1 auto',
        ...(orientation === 'vertical' && { marginLeft: 12 }),
        ...style,
      }}
      {...other}
    >
      <span
        style={{
          display: 'block',
          borderColor: lineColor,
          ...(orientation === 'horizontal'
            ? { borderTopStyle: 'solid', borderTopWidth: 1 }
            : { borderLeftStyle: 'solid', borderLeftWidth: 1, minHeight: 24 }
          ),
        }}
      />
    </div>
  );
});

export default StepConnector;
```

**147줄 → 38줄 (−74%)**

## 제거 항목 요약

| 항목 | 제거 이유 |
|------|---------|
| `StepConnectorRoot` styled 컴포넌트 | `div` + inline style로 대체 |
| `StepConnectorLine` styled 컴포넌트 | `span` + inline style로 대체 |
| `memoTheme` | 색상 하드코딩(`#bdbdbd`)으로 대체 |
| `alternativeLabel` 스타일 분기 | Stepper Context에서 이미 제거됨 |
| `useUtilityClasses`, `composeClasses` | 클래스 시스템 제거 |
| `capitalize` | 클래스명 생성에만 사용 |
| `disabled` 상태 소비 | 연결선 스타일에 영향 없음 |
| `useDefaultProps` | 파라미터 기본값으로 대체 |
| `PropTypes` | 학습 목적에 불필요 |
| `ownerState` | styled 제거로 불필요 |

## 유지 항목 및 이유

| 항목 | 유지 이유 |
|------|---------|
| `StepperContext` 소비 (`orientation`) | horizontal 가로선 / vertical 세로선 분기 핵심 |
| `StepContext` 소비 (`active`, `completed`) | 완료 단계 선 색상 시각적 구분 |
| `active \|\| completed` → `#1976d2` | 진행 상태를 선 색상으로 표현 — 핵심 UX |

## 핵심 학습 포인트

### 1. Context 이중 소비 패턴
```js
// Stepper가 제공하는 값 소비
const { orientation = 'horizontal' } = React.useContext(StepperContext);
// 형제 Step이 제공하는 값 소비
const { active, completed } = React.useContext(StepContext);
```
StepConnector는 Stepper의 자식이자, Step의 형제로 렌더링되어 두 컨텍스트를 모두 소비한다.

### 2. active/completed 상태 → 선 색상
```js
// 완료된 단계까지의 선은 파란색, 아직 안 된 선은 회색
const lineColor = (active || completed) ? '#1976d2' : '#bdbdbd';
```

### 3. orientation에 따른 선 방향
```js
// horizontal: 위 테두리 (가로선)
// vertical: 왼쪽 테두리 (세로선)
...(orientation === 'horizontal'
  ? { borderTopStyle: 'solid', borderTopWidth: 1 }
  : { borderLeftStyle: 'solid', borderLeftWidth: 1, minHeight: 24 }
)
```
