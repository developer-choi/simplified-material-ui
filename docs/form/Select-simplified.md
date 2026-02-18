# Select 단순화 결과

> Select 컴포넌트 간소화 과정 및 최종 결과

---

## 간소화 전/후 비교

| 항목 | 원본 | 단순화 |
|------|------|--------|
| 줄 수 | 535줄 (2파일) | ~480줄 (2파일) |
| 제거 | forwardRef, useForkRef, useImperativeHandle, muiName, cloneElement, labelId DOM 이벤트 | - |

---

## 최종 코드 구조

### Select.js

```javascript
function Select(props) {
  const {
    autoWidth = false, children, defaultOpen = false, displayEmpty = false,
    IconComponent = ArrowDropDownIcon, id, inputProps, label, labelId,
    MenuProps, multiple = false, onClose, onOpen, open,
    renderValue, SelectDisplayProps, ...other
  } = props;

  return (
    <OutlinedInput
      label={label}
      inputComponent={SelectInput}
      inputProps={{
        children, IconComponent, variant: 'outlined', type: undefined,
        multiple, autoWidth, defaultOpen, displayEmpty, labelId,
        MenuProps, onClose, onOpen, open, renderValue,
        SelectDisplayProps: { id, ...SelectDisplayProps },
        ...inputProps,
      }}
      {...(displayEmpty ? { notched: true } : {})}
      {...other}
    />
  );
}
```

---

## 제거된 것들 (3단계)

| 단계 | 제거 대상 | 이유 |
|------|-----------|------|
| 1 (Select.js) | `forwardRef`, `muiName`, `React.cloneElement` | cloneElement → 직접 JSX; muiName은 내부 시스템 |
| 2 (SelectInput.js) | `forwardRef`, `useForkRef`, `useImperativeHandle`, `inputRefProp` | 외부 ref/focus API 학습 주제 분리 |
| 3 (SelectInput.js) | `labelId` DOM 이벤트, `className`, `delete other['aria-invalid']`, 빈 production 블록 | 학습에 불필요한 부가 기능 |

---

## 핵심 학습 포인트

### 1. cloneElement 패턴 → 직접 JSX (단순화)

```javascript
// 원본: 이상한 cloneElement 패턴
const InputComponent = <StyledOutlinedInput label={label} />;
return React.cloneElement(InputComponent, { inputComponent: SelectInput, ... });

// 단순화: 직접 JSX
return <OutlinedInput label={label} inputComponent={SelectInput} inputProps={{...}} />;
```

- `React.cloneElement`는 기존 React 엘리먼트에 props를 추가하는 API
- 직접 JSX로 쓰는 것이 훨씬 명확함
- 원본이 cloneElement를 쓴 이유: 과거 코드 호환성 유지 가능성

### 2. inputComponent 패턴 - 내부 input 교체

```javascript
<OutlinedInput
  inputComponent={SelectInput}   // <input> 대신 SelectInput을 렌더링
  inputProps={{ children, ... }} // SelectInput에 전달할 props
/>
```

- OutlinedInput은 내부적으로 `<input>` 엘리먼트를 렌더링
- `inputComponent`를 지정하면 그 컴포넌트로 교체됨
- SelectInput이 `<input>` 자리에서 실제 드롭다운 UI 담당

### 3. 이중 useControlled - value와 open 모두 제어

```javascript
const [value, setValueState] = useControlled({
  controlled: valueProp, default: defaultValue, name: 'Select',
});
const [openState, setOpenState] = useControlled({
  controlled: openProp, default: defaultOpen, name: 'Select',
});
```

- `value`는 선택된 항목 값 (controlled/uncontrolled)
- `open`은 메뉴 열림 상태 (controlled/uncontrolled)
- 두 상태 모두 외부에서 제어하거나 내부적으로 관리 가능

### 4. 함수형 ref로 displayNode 상태 동기화

```javascript
const handleDisplayRef = React.useCallback((node) => {
  displayRef.current = node;     // ref에 즉시 저장
  if (node) setDisplayNode(node); // state 업데이트 → 리렌더 트리거
}, []);

const anchorElement = displayNode?.parentNode; // Menu의 anchorEl
```

- `displayRef.current`는 동기적 접근용 (focus 등)
- `displayNode` state는 Menu의 `anchorEl`을 계산하기 위한 리렌더용
- 첫 렌더 시 `displayNode`가 null이므로 Menu가 열리지 않음 (안전)

### 5. handleItemClick - 합성 이벤트 target 재정의

```javascript
const handleItemClick = (child) => (event) => {
  // ...값 계산...

  // form 라이브러리 호환을 위해 clonedEvent.target 오버라이드
  const nativeEvent = event.nativeEvent || event;
  const clonedEvent = new nativeEvent.constructor(nativeEvent.type, nativeEvent);
  Object.defineProperty(clonedEvent, 'target', {
    writable: true,
    value: { value: newValue, name },
  });
  onChange(clonedEvent, child);
};
```

- `onChange(event, value)`에서 `event.target.value`와 `event.target.name`을 기대하는 form 라이브러리 호환
- 원래 이벤트를 수정하지 않고 복사본(clonedEvent)에만 오버라이드
- `new nativeEvent.constructor(...)` → MouseEvent, KeyboardEvent 등 정확한 타입으로 복제

### 6. 선택된 값 표시 계산

```javascript
let display, displaySingle;
const displayMultiple = [];
let computeDisplay = false;

if (isFilled({ value })) {
  if (renderValue) {
    display = renderValue(value);  // 커스텀 렌더링
  } else {
    computeDisplay = true;         // 자동 계산
  }
}

// children을 순회하며 selected 항목의 children 수집
if (multiple) {
  display = displayMultiple.reduce((output, child, index) => {
    output.push(child);
    if (index < displayMultiple.length - 1) output.push(', ');
    return output;
  }, []);
} else {
  display = displaySingle;
}
```

- `renderValue` 없으면 선택된 MenuItem의 `children`을 표시
- multiple이면 선택된 값들을 쉼표로 조인

### 7. displayEmpty → notched 연동

```javascript
// Select.js
{...(displayEmpty ? { notched: true } : {})}
```

- `displayEmpty=true` → 빈 값일 때도 OutlinedInput의 레이블 notch를 열어둠
- `notched` prop은 label이 위로 올라간 상태(레이블 notch 열림)를 강제
