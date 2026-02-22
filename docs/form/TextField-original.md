# TextField (Original)

## 역할

`FormControl + InputLabel + Input + FormHelperText`의 **편의 래퍼(convenience wrapper)**.
80% 케이스를 커버하며, 더 세밀한 제어가 필요하면 하위 컴포넌트를 직접 사용.

---

## 구조

```
TextFieldRoot (styled(FormControl) — 스타일 없음 {})
  ├─ [label] InputLabelSlot (InputLabel)
  ├─ select=false: InputSlot (Input | FilledInput | OutlinedInput)
  ├─ select=true:  SelectSlot (Select) → input={InputElement}
  └─ [helperText] FormHelperTextSlot (FormHelperText)
```

---

## 주요 props

| prop | 역할 |
|------|------|
| `variant` | `'outlined'`(기본) / `'filled'` / `'standard'` |
| `label` | InputLabel 텍스트 |
| `helperText` | FormHelperText 텍스트 |
| `id` | 접근성 id (label ↔ input 연결) |
| `error` | 오류 상태 |
| `disabled` | 비활성화 |
| `fullWidth` | 전체 너비 |
| `multiline` | textarea 전환 |
| `select` | Select 컴포넌트 사용 |
| `InputProps` | Input 컴포넌트에 전달할 props |
| `InputLabelProps` | InputLabel에 전달할 props |
| `inputProps` | `<input>` 엘리먼트에 전달할 HTML 속성 |
| `FormHelperTextProps` | FormHelperText에 전달할 props |
| `SelectProps` | Select에 전달할 props |

---

## 복잡도 원인

### 1. TextFieldRoot styled(FormControl) — 빈 스타일

```js
const TextFieldRoot = styled(FormControl, {
  name: 'MuiTextField',
  slot: 'Root',
})({});  // 스타일 없음
```

FormControl을 직접 사용하면 되지만, MUI 테마 오버라이드(`components.MuiTextField.styleOverrides`)를 지원하기 위해 styled 래퍼 유지.

### 2. 6개 useSlot

```js
const [RootSlot, rootProps] = useSlot('root', { elementType: TextFieldRoot, ... });
const [InputSlot, inputProps] = useSlot('input', { elementType: InputComponent, ... });
const [InputLabelSlot, inputLabelProps] = useSlot('inputLabel', { ... });
const [HtmlInputSlot, htmlInputProps] = useSlot('htmlInput', { ... });
const [FormHelperTextSlot, formHelperTextProps] = useSlot('formHelperText', { ... });
const [SelectSlot, selectProps] = useSlot('select', { ... });
```

### 3. slotProps 병합 — deprecated props → slotProps 통합

```js
const externalForwardedProps = {
  slots,
  slotProps: {
    input: InputPropsProp,           // InputProps (deprecated)
    inputLabel: InputLabelPropsProp, // InputLabelProps (deprecated)
    htmlInput: inputPropsProp,       // inputProps (deprecated)
    formHelperText: FormHelperTextPropsProp, // FormHelperTextProps (deprecated)
    select: SelectPropsProp,         // SelectProps (deprecated)
    ...slotProps,                    // 새 slotProps로 override
  },
};
```

기존 `InputProps`, `InputLabelProps` 등의 named props를 슬롯 시스템으로 통합.

---

## id 연결 로직

```js
const id = useId(idOverride);  // idOverride 있으면 그대로, 없으면 자동 생성
const helperTextId = helperText && id ? `${id}-helper-text` : undefined;
const inputLabelId = label && id ? `${id}-label` : undefined;
```

| ID | 사용처 |
|----|--------|
| `id` | `<input id={id}>` + `<InputLabel htmlFor={id}>` |
| `helperTextId` | `<input aria-describedby={helperTextId}>` + `<FormHelperText id={helperTextId}>` |
| `inputLabelId` | `<Select labelId={inputLabelId}>` + `<InputLabel id={inputLabelId}>` |

---

## outlined notched 동기화

```js
if (variant === 'outlined') {
  if (inputLabelSlotProps?.shrink !== undefined) {
    inputAdditionalProps.notched = inputLabelSlotProps.shrink;
  }
  inputAdditionalProps.label = label;
}
```

`OutlinedInput`의 `notched` prop은 라벨이 상단으로 올라갔는지(shrink)에 따라 테두리 노치 크기를 조정.
`InputLabel.shrink`와 반드시 동기화해야 시각적으로 일치.

---

## variantComponent 맵

```js
const variantComponent = {
  standard: Input,
  filled: FilledInput,
  outlined: OutlinedInput,
};
```

`variant` prop으로 3가지 input 스타일 선택.
