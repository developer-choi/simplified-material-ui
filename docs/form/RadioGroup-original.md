# RadioGroup 컴포넌트

> RadioGroup 컴포넌트 원본 구조 빠른 파악

**⚠️ 이 문서의 목적**: 간소화 작업 **전에** 원본 코드를 빠르게 이해하기 위한 요약 문서입니다.

---

## 무슨 기능을 하는가?

RadioGroup은 **여러 Radio 버튼을 하나의 그룹으로 묶고, Context를 통해 값을 자식에게 전달**하는 컴포넌트입니다.

### 핵심 기능
1. **controlled/uncontrolled 통합** - `useControlled`로 `value`/`defaultValue` 두 방식 모두 지원
2. **Context 전달** - `RadioGroupContext.Provider`로 자식 Radio에 `name`, `onChange`, `value` 전달
3. **name 자동 생성** - `useId`로 `name` prop이 없어도 고유 ID 자동 생성
4. **actions imperative API** - `actions.focus()`로 프로그래밍적으로 포커스 이동 가능

---

## 주요 코드 구조

### 파일 위치 및 크기

```
packages/mui-material/src/RadioGroup/RadioGroup.js (134줄)
```

### 렌더링 구조

```
RadioGroup
  └─> RadioGroupContext.Provider    ← name/onChange/value 자식에게 전달
       └─> FormGroup (role="radiogroup")
            └─> children (Radio 버튼들)
```

### 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `value` | any | - | (controlled) 현재 선택값 |
| `defaultValue` | any | - | (uncontrolled) 초기값 |
| `name` | string | (자동생성) | radio input name 속성 |
| `onChange` | func | - | 값 변경 콜백 `(event, value)` |
| `children` | node | - | Radio 버튼들 |
| `actions` | ref | - | (private) imperative focus API |

### 핵심 로직 발췌

```javascript
// useControlled: controlled/uncontrolled 통합
const [value, setValueState] = useControlled({
  controlled: valueProp,
  default: defaultValue,
  name: 'RadioGroup',
});

// useId: name 없으면 자동 생성
const name = useId(nameProp);

// Context로 자식 Radio에 값 전달 (useMemo로 최적화)
const contextValue = React.useMemo(
  () => ({
    name,
    onChange(event) {
      setValueState(event.target.value);
      if (onChange) onChange(event, event.target.value);
    },
    value,
  }),
  [name, onChange, setValueState, value],
);

// useImperativeHandle: actions.focus() 구현
React.useImperativeHandle(actions, () => ({
  focus: () => {
    let input = rootRef.current.querySelector('input:not(:disabled):checked');
    if (!input) input = rootRef.current.querySelector('input:not(:disabled)');
    if (input) input.focus();
  },
}), []);
```

---

## 복잡도의 이유

RadioGroup은 **134줄**이며, 복잡한 이유는:

1. **useControlled** - controlled/uncontrolled 두 방식을 통합하는 MUI 커스텀 훅
2. **useImperativeHandle + actions** - 외부에서 focus() 메서드를 호출하는 imperative 패턴
3. **useForkRef** - external ref와 internal rootRef를 합쳐서 ForwardRef 전달
4. **useUtilityClasses** - row/error 상태에 따른 동적 클래스 생성
5. **PropTypes** - ~35줄

---

## 간소화 방향

이 컴포넌트를 간소화할 때 제거 고려 대상:

- **PropTypes** - 35줄
- **useUtilityClasses/className/classes** - clsx/composeClasses/getRadioGroupUtilityClass 제거
- **actions + useImperativeHandle + rootRef** - 프로그래밍적 포커스 API 제거
- **forwardRef + useForkRef** - 외부 ref 전달 불필요
- **FormGroup 유지** - 레이아웃 래퍼 역할 (제거 대상 아님)

> 상세한 간소화 결과는 `RadioGroup-simplified.md` 참고
