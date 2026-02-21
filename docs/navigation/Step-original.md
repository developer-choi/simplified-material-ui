# Step (Original)

## 핵심 역할

Stepper 내 개별 단계 컨테이너. 두 가지 핵심 역할:
1. `StepperContext`에서 `activeStep`을 읽어 **active/completed/disabled 상태 자동 계산**
2. `StepContext.Provider`로 **하위 컴포넌트(StepLabel, StepContent 등)에 상태 전달**

또한 `connector` (StepConnector)를 step 사이에 렌더링하는 책임도 맡는다.

## 원본 코드 (핵심 부분)

```js
const Step = React.forwardRef(function Step(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuiStep' });
  const {
    active: activeProp,      // 자동 계산 오버라이드 가능
    completed: completedProp,
    disabled: disabledProp,
    expanded = false,        // 수직 스테퍼에서 강제 확장
    component = 'div',
    connector,               // ← StepperContext에서 읽어옴
    alternativeLabel,        // ← StepperContext에서 읽어옴
    nonLinear,               // ← StepperContext에서 읽어옴
    ...
  } = props;

  // active/completed/disabled 계산 (prop 오버라이드 포함)
  let [active = false, completed = false, disabled = false] = [activeProp, completedProp, disabledProp];
  if (activeStep === index) {
    active = activeProp !== undefined ? activeProp : true;
  } else if (!nonLinear && activeStep > index) {
    completed = completedProp !== undefined ? completedProp : true;
  } else if (!nonLinear && activeStep < index) {
    disabled = disabledProp !== undefined ? disabledProp : true;
  }

  // StepContext 제공
  const contextValue = useMemo(
    () => ({ index, last, expanded, icon: index + 1, active, completed, disabled }),
    [...]
  );

  // 렌더링: alternativeLabel에 따라 connector 위치가 달라짐
  const newChildren = (
    <StepRoot as={component} ownerState={ownerState} ...>
      {connector && alternativeLabel && index !== 0 ? connector : null}  // ← alternativeLabel: connector를 Step 안에
      {children}
    </StepRoot>
  );

  return (
    <StepContext.Provider value={contextValue}>
      {connector && !alternativeLabel && index !== 0 ? (
        <React.Fragment>
          {connector}   // ← 표준: connector를 Step 앞에
          {newChildren}
        </React.Fragment>
      ) : newChildren}
    </StepContext.Provider>
  );
});
```

## 복잡도 요소

### 1. active/completed/disabled 삼중 오버라이드
```js
// 자동 계산 + prop 오버라이드 + nonLinear 고려
if (activeStep === index) {
  active = activeProp !== undefined ? activeProp : true;
} else if (!nonLinear && activeStep > index) {
  completed = completedProp !== undefined ? completedProp : true;
} else if (!nonLinear && activeStep < index) {
  disabled = disabledProp !== undefined ? disabledProp : true;
}
// nonLinear=true면 아무 것도 자동 계산하지 않음 → 모두 prop으로 직접 제어
```

### 2. alternativeLabel에 따른 이중 렌더링 구조
```
// 표준 (alternativeLabel=false):
[StepConnector] [StepRoot > children]

// alternativeLabel (아이콘 아래 라벨):
[StepRoot > StepConnector + children]
// ← connector가 Step 안에 절대 위치로 배치됨
```

### 3. connector 소비 패턴
`connector`는 Stepper가 Context를 통해 제공 (`defaultConnector = <StepConnector />`).
Step은 이를 읽어서 알맞은 위치에 렌더링.

### 4. StepRoot styled 컴포넌트
```js
const StepRoot = styled('div')({
  variants: [
    { props: { orientation: 'horizontal' }, style: { paddingLeft: 8, paddingRight: 8 } },
    { props: { alternativeLabel: true }, style: { flex: 1, position: 'relative' } },
    // ↑ alternativeLabel일 때 flex: 1 → 모든 Step이 동일한 너비로 균등 분배
  ],
});
```

### 5. ownerState 전파
`active`, `orientation`, `alternativeLabel`, `completed`, `disabled`, `expanded`, `component` 모두 `ownerState`에 담아 styled에 전달.
