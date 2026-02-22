# Switch (Original)

## 핵심 역할

토글 형태의 체크박스 컴포넌트. `checked` prop으로 on/off 상태를 제어하고,
`size`로 크기를, `color`로 테마 팔레트 색상을, `edge`로 마진 정렬을 지원한다.
내부적으로 `SwitchBase`(ButtonBase 기반)를 사용해 ripple, 포커스, 키보드 접근성을 제공한다.

## 복잡도 요소

### 1. styled 컴포넌트 4개 + SwitchBase 조합

```js
// 4개의 styled 컴포넌트가 서로 CSS 클래스로 연결
const SwitchRoot = styled('span', ...)({ ... });        // 외부 컨테이너
const SwitchSwitchBase = styled(SwitchBase, ...)(...);  // input + ripple + 이동
const SwitchTrack = styled('span', ...)(...);           // 배경 트랙
const SwitchThumb = styled('span', ...)(...);           // 흰 원형 thumb

// CSS 클래스로 checked/disabled 상태 연결
[`&.${switchClasses.checked}`]: { transform: 'translateX(20px)' },
[`&.${switchClasses.checked} + .${switchClasses.track}`]: { opacity: 0.5 },
[`&.${switchClasses.disabled} + .${switchClasses.track}`]: { opacity: 0.12 },
```

상태(checked, disabled)가 CSS 클래스를 통해 시각적 상태(위치, 색상, 불투명도)와 연결됨.
자바스크립트에서 상태를 직접 읽지 않고 CSS만으로 처리.

### 2. memoTheme + 동적 팔레트 순회 (color prop 지원)

```js
const SwitchSwitchBase = styled(SwitchBase, ...)(
  memoTheme(({ theme }) => ({
    color: theme.vars.palette.Switch.defaultColor,  // 테마에서 thumb 기본색
    transition: theme.transitions.create(['left', 'transform'], { ... }),
    variants: [
      ...Object.entries(theme.palette)
        .filter(createSimplePaletteValueFilter(['light']))
        .map(([color]) => ({
          props: { color },
          style: {
            [`&.${switchClasses.checked}`]: {
              color: theme.palette[color].main,           // checked thumb 색
              [`& + .${switchClasses.track}`]: {
                backgroundColor: theme.palette[color].main, // checked track 색
              },
            },
          },
        })),
    ],
  })),
);
```

팔레트 전체를 런타임에 순회하여 primary, secondary, error, warning, info, success 등
모든 색상의 checked 상태 스타일을 자동 생성.

### 3. slot 시스템 (useSlot × 3)

```js
const [RootSlot, rootSlotProps] = useSlot('root', {
  className: clsx(classes.root, className),
  elementType: SwitchRoot,
  externalForwardedProps,
  ownerState,
  additionalProps: { sx },
});

const [ThumbSlot, thumbSlotProps] = useSlot('thumb', { ... });
const icon = <ThumbSlot {...thumbSlotProps} />;

const [TrackSlot, trackSlotProps] = useSlot('track', { ... });
```

`slots`, `slotProps` prop으로 각 내부 요소(root, thumb, track, switchBase, input)를
외부에서 교체·확장 가능.

### 4. SwitchBase (ButtonBase 기반)

```js
<SwitchSwitchBase
  type="checkbox"
  icon={icon}
  checkedIcon={icon}
  ref={ref}
  ownerState={ownerState}
  classes={{
    ...classes,
    root: classes.switchBase,
  }}
  slots={{
    ...(slots.switchBase && { root: slots.switchBase }),
    ...(slots.input && { input: slots.input }),
  }}
  slotProps={{
    input: { role: 'switch' },
    ...(slotProps.switchBase && { root: ... }),
    ...(slotProps.input && { input: ... }),
  }}
/>
```

`SwitchBase`가 실제 `<input type="checkbox">`와 ripple 효과, 포커스 처리를 담당.
`icon`/`checkedIcon`으로 thumb를 전달.

### 5. size 분기 — CSS 클래스 기반

```js
// SwitchRoot 내부 variants
{
  props: { size: 'small' },
  style: {
    width: 40,
    height: 24,
    padding: 7,
    [`& .${switchClasses.thumb}`]: { width: 16, height: 16 },
    [`& .${switchClasses.switchBase}`]: {
      padding: 4,
      [`&.${switchClasses.checked}`]: { transform: 'translateX(16px)' },
    },
  },
},
```

size 분기를 CSS 클래스 선택자 중첩으로 처리. 상위 요소의 class가 하위 요소 스타일까지 제어.
