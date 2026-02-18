# RadioGroup 단순화 결과

> RadioGroup 컴포넌트 간소화 과정 및 최종 결과

---

## 간소화 전/후 비교

| 항목 | 원본 | 단순화 |
|------|------|--------|
| 줄 수 | 134줄 | ~55줄 |
| 의존성 | PropTypes, clsx, composeClasses, useForkRef 등 8개 | 4개 (FormGroup, useControlled, RadioGroupContext, useId) |

---

## 최종 코드

```javascript
'use client';
import * as React from 'react';
import FormGroup from '../../../form/FormGroup';
import useControlled from '../utils/useControlled';
import RadioGroupContext from './RadioGroupContext';
import useId from '../utils/useId';

function RadioGroup(props) {
  const {
    children,
    defaultValue,
    name: nameProp,
    onChange,
    value: valueProp,
    ...other
  } = props;

  const [value, setValueState] = useControlled({
    controlled: valueProp,
    default: defaultValue,
    name: 'RadioGroup',
  });

  const name = useId(nameProp);

  const contextValue = React.useMemo(
    () => ({
      name,
      onChange(event) {
        setValueState(event.target.value);
        if (onChange) {
          onChange(event, event.target.value);
        }
      },
      value,
    }),
    [name, onChange, setValueState, value],
  );

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <FormGroup
        role="radiogroup"
        {...other}
      >
        {children}
      </FormGroup>
    </RadioGroupContext.Provider>
  );
}

export default RadioGroup;
```

---

## 제거된 것들 (4단계)

| 단계 | 제거 대상 | 이유 |
|------|-----------|------|
| 1 | PropTypes (~35줄) | 학습 목적에 불필요 |
| 2 | `useUtilityClasses/className/classes` + clsx/composeClasses/getRadioGroupUtilityClass | 인라인 스타일 불필요 (FormGroup 유지) |
| 3 | `actions` + `useImperativeHandle` + `rootRef` | 프로그래밍적 포커스 API는 고급 패턴 |
| 4 | `forwardRef` + `useForkRef` | 외부 ref 전달 학습 주제 분리 |

---

## 핵심 학습 포인트

### 1. useControlled 패턴 (controlled/uncontrolled 통합)

```javascript
const [value, setValueState] = useControlled({
  controlled: valueProp,   // value prop이 있으면 controlled
  default: defaultValue,   // value prop 없으면 defaultValue로 uncontrolled
  name: 'RadioGroup',      // 경고 메시지용
});
```

- `value` prop이 있으면 → **controlled** (부모가 상태 관리)
- `defaultValue`만 있으면 → **uncontrolled** (내부에서 상태 관리)
- 두 방식을 하나의 훅으로 통합

### 2. Context로 자식에게 값 전달 (Context API 패턴)

```javascript
// RadioGroup에서 Context 제공
const contextValue = { name, onChange, value };
<RadioGroupContext.Provider value={contextValue}>
  {children}  // 자식 Radio 버튼들
</RadioGroupContext.Provider>

// 자식 Radio 버튼에서 Context 소비 (useRadioGroup 훅)
const radioGroup = React.useContext(RadioGroupContext);
// radioGroup.name, radioGroup.onChange, radioGroup.value 사용
```

- 부모 → 자식으로 props drilling 없이 값 전달
- Radio 버튼들이 RadioGroup의 상태를 자동으로 구독

### 3. useId - 고유 ID 자동 생성

```javascript
const name = useId(nameProp);
// nameProp이 있으면 그대로 사용
// nameProp이 없으면 ':r0:', ':r1:' 같은 고유 ID 자동 생성
```

- `name` prop은 form 제출 시 radio input의 name 속성으로 사용
- 같은 name을 가진 radio들이 하나의 그룹으로 동작

### 4. useMemo로 contextValue 최적화

```javascript
const contextValue = React.useMemo(
  () => ({ name, onChange: ..., value }),
  [name, onChange, setValueState, value],
);
```

- Context value가 매 렌더마다 새 객체로 생성되면 모든 자식이 리렌더됨
- `useMemo`로 의존성이 바뀔 때만 새 객체 생성 → 불필요한 리렌더 방지

### 5. useImperativeHandle 패턴 (원본에서 제거됨)

```javascript
// actions ref를 통해 외부에서 focus() 메서드 호출 가능
React.useImperativeHandle(actions, () => ({
  focus: () => {
    let input = rootRef.current.querySelector('input:not(:disabled):checked');
    if (!input) input = rootRef.current.querySelector('input:not(:disabled)');
    if (input) input.focus();
  },
}), []);

// 사용 예시
const actionsRef = React.useRef();
<RadioGroup actions={actionsRef} />
actionsRef.current.focus();  // 프로그래밍적으로 포커스
```

- `querySelector('input:not(:disabled):checked')` → 체크된 활성 input 우선 포커스
- 없으면 → 첫 번째 활성 input 포커스
