# TextField (Simplified)

## 제거 항목 요약

| 항목 | 제거 이유 |
|------|---------|
| `TextFieldRoot styled(FormControl)({})` | 빈 스타일 → `FormControl` 직접 사용 |
| 6개 `useSlot` | 직접 JSX로 대체 |
| `slots`, `slotProps` props | 슬롯 시스템 제거 |
| `externalForwardedProps` | useSlot 중간 객체 |
| `clsx` | 클래스 합성 유틸 |
| `useUtilityClasses`, `composeClasses` | CSS 클래스 시스템 제거 |
| `getTextFieldUtilityClass` | 클래스 시스템 일부 |
| `classes` prop | 클래스 오버라이드 제거 |
| `useDefaultProps` | 기본값 직접 처리 |
| `ownerState` | styled 변형 시스템 제거 |
| `PropTypes`, `refType` | 런타임 타입 검사 제거 |
| `useId` (커스텀) | `React.useId()` (React 18 내장)으로 대체 |

---

## 유지 항목 및 이유

| 항목 | 유지 이유 |
|------|---------|
| `variantComponent` 맵 | 핵심 로직 (variant → InputComponent) |
| `React.useId()` | id/label/helperText 접근성 연결 |
| `inputAdditionalProps` 로직 | outlined notched 동기화, select 분기 |
| `InputProps`, `InputLabelProps` 등 named props | 공개 API 유지 |
| 6개 하위 컴포넌트 imports | 복합 컴포넌트 구성 |

---

## 핵심 학습 포인트

### 1. convenience wrapper 패턴

```
TextField
  = FormControl + InputLabel + Input + FormHelperText
```

여러 컴포넌트를 하나의 편의 인터페이스로 묶음.
복잡한 케이스는 하위 컴포넌트를 직접 조합.

### 2. id — 3개의 접근성 연결

```js
const generatedId = React.useId();
const rootId = idOverride || generatedId;
const helperTextId = helperText && rootId ? `${rootId}-helper-text` : undefined;
const inputLabelId = label && rootId ? `${rootId}-label` : undefined;
```

| 연결 | 방식 | 역할 |
|------|------|------|
| label ↔ input | `<InputLabel htmlFor={rootId}>` + `<input id={rootId}>` | 클릭 시 포커스 이동 |
| input ↔ helperText | `<input aria-describedby={helperTextId}>` + `<FormHelperText id={helperTextId}>` | 스크린 리더 설명 |
| label ↔ Select | `<InputLabel id={inputLabelId}>` + `<Select labelId={inputLabelId}>` | Select 접근성 레이블 |

### 3. outlined notched 동기화

```js
if (variant === 'outlined') {
  if (InputLabelProps && typeof InputLabelProps.shrink !== 'undefined') {
    inputAdditionalProps.notched = InputLabelProps.shrink;
  }
  inputAdditionalProps.label = label;
}
```

`OutlinedInput`의 테두리에는 라벨이 들어가는 **노치(notch)** 가 있음.
라벨이 shrink(위로 이동)하면 노치를 열고, 아니면 닫음.
`InputLabelProps.shrink`를 강제로 설정한 경우 notched도 동기화 필요.

```
shrink=true:  [____label____]  → notched=true  → 노치 열림
shrink=false: [             ]  → notched=false → 노치 닫힘
```

### 4. select=true — InputElement를 Select의 input으로

```jsx
// select=false: Input 직접 렌더
InputElement

// select=true: Select가 Input을 내부에서 사용
<Select
  input={InputElement}  // Input을 Select의 트리거 UI로
  {...SelectProps}
>
  {children}  // <MenuItem>들
</Select>
```

Select의 `input` prop은 드롭다운을 열기 위한 UI 엘리먼트.
TextField는 Input을 만들어서 Select에 넘겨줌 — **조합 패턴**.

`select=true`일 때 `InputElement`에서 id와 aria-describedby를 제거하는 이유:
```js
if (select) {
  inputAdditionalProps.id = undefined;           // Select가 id 관리
  inputAdditionalProps['aria-describedby'] = undefined;  // Select가 aria 관리
}
```

### 5. variantComponent 맵 — 객체로 switch 대체

```js
const variantComponent = {
  standard: Input,
  filled: FilledInput,
  outlined: OutlinedInput,
};

const InputComponent = variantComponent[variant];
```

`switch(variant)` 대신 객체 맵으로 컴포넌트 선택.
새 variant 추가 시 맵에 항목만 추가하면 됨.

### 6. label 조건 체크

```jsx
{label != null && label !== '' && (
  <InputLabel ...>{label}</InputLabel>
)}
```

`null`, `undefined`, `''` 모두 체크:
- `label={null}` → label 없음 (기본값)
- `label={undefined}` → label 없음
- `label=""` → 빈 문자열도 label 없음 처리 (노치 필요 없음)
- `label={0}` → `0 != null && 0 !== ''` → true (숫자 0도 label로 표시)
