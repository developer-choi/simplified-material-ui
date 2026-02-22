# StepContent (Original)

## 핵심 역할

수직 스테퍼(orientation="vertical") 전용 컨텐츠 영역.
active 상태일 때 Collapse 애니메이션으로 내용을 펼치고,
`last` step이 아닐 때 왼쪽에 세로 구분선을 표시한다.

## 복잡도 요소

### 1. 2개 styled 컴포넌트 + memoTheme

```js
const StepContentRoot = styled('div')(memoTheme(({ theme }) => ({
  marginLeft: 12,
  paddingLeft: 20,
  paddingRight: 8,
  borderLeft: `1px solid ${theme.palette.grey[400]}`,  // #bdbdbd
})));

const StepContentTransition = styled(Collapse)({ display: 'block' });
```

`StepContentRoot`은 테마에서 border 색상을 가져오고,
`StepContentTransition`은 Collapse를 styled로 감싸 display 고정.

### 2. Slot 시스템 (transition slot)

```js
const [TransitionSlot, transitionProps] = useSlot('transition', {
  elementType: TransitionComponent,
  externalForwardedProps,
  ownerState,
});
// <TransitionSlot in={active || expanded} timeout={transitionDuration} unmountOnExit>
```

`slots.transition`, `slotProps.transition`으로 Collapse를 교체 가능.
`TransitionComponent`(deprecated), `TransitionProps`(deprecated)도 병합.

### 3. expanded context 소비

```js
const { active, last, expanded } = React.useContext(StepContext);
// in={active || expanded}
```

`expanded` prop으로 active 아닌데도 강제로 펼칠 수 있었음.
Step 간소화에서 `expanded`를 StepContext에서 제거했으므로 불필요.

### 4. orientation 소비 (dev 경고용)

```js
const { orientation } = React.useContext(StepperContext);
// if (orientation !== 'vertical') console.error(...)
```

수직 스테퍼에서만 사용하도록 경고. 동작에는 영향 없음.

### 5. transitionDuration

```js
transitionDuration = 'auto'  // 기본값
// Collapse의 timeout prop으로 전달
// 'auto' → height 기반 자동 계산
```

애니메이션 속도를 숫자(ms) 또는 'auto'로 제어.
