# StepLabel (Original)

## 핵심 역할

Stepper 내 각 Step의 라벨 영역. StepIcon(번호/체크/에러)과 텍스트 라벨을 가로로 배치한다.
두 Context를 소비해 상태를 파악하고, Slot 시스템으로 내부 컴포넌트를 교체 가능하게 한다.

## 복잡도 요소

### 1. 4개 styled 컴포넌트 + memoTheme

```js
const StepLabelRoot = styled('span')({ display: 'flex', ... });
const StepLabelLabel = styled('span')(memoTheme(({ theme }) => ({
  ...theme.typography.body2,           // body2 폰트 통째로 주입
  color: theme.palette.text.primary,   // 상태에 따라 클래스로 오버라이드
})));
const StepLabelIconContainer = styled('span')({ flexShrink: 0, paddingRight: 8 });
const StepLabelLabelContainer = styled('span')(memoTheme(({ theme }) => ({
  color: theme.palette.text.secondary, // 기본 회색
})));
```

### 2. Slot 시스템 3개

```js
// root, label, stepIcon 3개 슬롯을 각각 useSlot으로 처리
const [RootSlot, rootProps] = useSlot('root', { elementType: StepLabelRoot, ... });
const [LabelSlot, labelProps] = useSlot('label', { elementType: StepLabelLabel, ... });
const [StepIconSlot, stepIconProps] = useSlot('stepIcon', { elementType: StepIconComponent, ... });
```

`useSlot`은 내부적으로 externalForwardedProps(slots, slotProps)를 병합해 최종 컴포넌트와 props를 결정한다.

### 3. deprecated props → slotProps 병합

```js
const externalForwardedProps = {
  slots,
  slotProps: {
    stepIcon: StepIconProps,  // deprecated prop → slotProps로 병합
    ...componentsProps,       // deprecated prop → slotProps로 병합
    ...slotProps,
  },
};
```

3세대에 걸친 API 변경의 흔적 (componentsProps → StepIconProps → slotProps).

### 4. StepIconComponent 결정 로직

```js
let StepIconComponent = StepIconComponentProp;  // deprecated prop
if (icon && !StepIconComponent) {
  StepIconComponent = StepIcon;  // 기본값
}
// → 이후 useSlot('stepIcon', { elementType: StepIconComponent })으로 추가 오버라이드 가능
```

### 5. alternativeLabel 분기

```js
// 아이콘 아래 라벨 모드에서:
// - root: flexDirection: 'column'
// - iconContainer: paddingRight: 0
// - labelContainer: textAlign: 'center'
// - label: marginTop: 16
```

### 6. 클래스 상태 조합

active, completed, error, disabled, alternativeLabel 5가지 상태가 root/label/iconContainer/labelContainer 4개 요소에 각각 적용 → 20가지 조합.
