# StepButton (Original)

## 핵심 역할

Stepper의 각 Step을 클릭 가능한 버튼으로 만드는 컴포넌트.
내부적으로 `styled(ButtonBase)`를 감싸고, `StepLabel`을 렌더링한다.
nonLinear Stepper에서 사용자가 임의 순서로 Step을 탐색할 수 있게 한다.

## 복잡도 요소

### 1. styled(ButtonBase)

```js
const StepButtonRoot = styled(ButtonBase, {
  name: 'MuiStepButton',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    return [
      { [`& .${stepButtonClasses.touchRipple}`]: styles.touchRipple },
      styles.root,
      styles[ownerState.orientation],  // horizontal/vertical 분기
    ];
  },
})({
  width: '100%',
  padding: '24px 16px',
  margin: '-24px -16px',
  boxSizing: 'content-box',
  [`& .${stepButtonClasses.touchRipple}`]: { color: 'rgba(0, 0, 0, 0.3)' },
  variants: [
    { props: { orientation: 'vertical' }, style: { justifyContent: 'flex-start', padding: '8px', margin: '-8px' } },
  ],
});
```

ButtonBase를 styled로 감싸 MUI 테마 오버라이드, 클래스 기반 스타일, 터치 리플 색상 제어.

### 2. isMuiElement + cloneElement 분기

```js
const child = isMuiElement(children, ['StepLabel']) ? (
  React.cloneElement(children, childProps)  // 이미 StepLabel이면 props 주입
) : (
  <StepLabel {...childProps}>{children}</StepLabel>  // 아니면 StepLabel로 래핑
);
```

사용자가 `<StepLabel>`을 직접 전달했는지 감지해 cloneElement로 props 병합.
3세대 유연성 API이지만 실제로 두 방식 모두 지원하려다 생긴 복잡도.

### 3. touchRipple slot

```js
const slots = {
  root: ['root', orientation],
  touchRipple: ['touchRipple'],  // ButtonBase 내부 ripple에 클래스 주입용
};
```

`TouchRippleProps={{ className: classes.touchRipple }}`로 ripple 색상을 클래스로 제어.

### 4. focusRipple + TouchRippleProps

```jsx
<StepButtonRoot
  focusRipple
  TouchRippleProps={{ className: classes.touchRipple }}
  ...
>
```

ButtonBase 전용 props. 포커스 시 ripple 애니메이션 표시 + ripple 색상 오버라이드.
