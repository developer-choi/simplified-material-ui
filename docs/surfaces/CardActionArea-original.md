# CardActionArea 컴포넌트

> Material-UI의 CardActionArea 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

CardActionArea는 **카드 전체를 클릭 가능한 영역으로 만들고, hover/focus 시 시각적 피드백을 제공**하는 컴포넌트입니다.

### 핵심 기능

1. **ButtonBase 확장** - 카드를 클릭 가능한 버튼처럼 만듦 (리플 효과 포함)
2. **FocusHighlight 오버레이** - hover/focus 시 카드 전체에 반투명 오버레이 표시
3. **Slot 시스템** - root, focusHighlight 슬롯으로 커스터마이징 가능
4. **테마 기반 opacity** - hover/focus 시 테마의 action.hoverOpacity/focusOpacity 사용

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/CardActionArea/CardActionArea.js (164줄)

CardActionArea
  ├─ useDefaultProps (테마에서 기본 props 가져오기)
  ├─ useUtilityClasses (CSS 클래스 이름 생성)
  ├─ 2개 useSlot 호출 (root, focusHighlight)
  │
  └─ RootSlot (CardActionAreaRoot, ButtonBase)
       ├─ children
       └─ FocusHighlightSlot (CardActionAreaFocusHighlight, span)
```

### 2. Styled Components (2개)

#### CardActionAreaRoot (24-43줄)

```javascript
const CardActionAreaRoot = styled(ButtonBase, {
  name: 'MuiCardActionArea',
  slot: 'Root',
})(
  memoTheme(({ theme }) => ({
    display: 'block',
    textAlign: 'inherit',
    borderRadius: 'inherit',
    width: '100%',
    [`&:hover .${cardActionAreaClasses.focusHighlight}`]: {
      opacity: (theme.vars || theme).palette.action.hoverOpacity,
      '@media (hover: none)': {
        opacity: 0,
      },
    },
    [`&.${cardActionAreaClasses.focusVisible} .${cardActionAreaClasses.focusHighlight}`]: {
      opacity: (theme.vars || theme).palette.action.focusOpacity,
    },
  })),
);
```

**특징**:
- ButtonBase를 상속하여 클릭 가능 + 리플 효과
- `display: block` - 블록 레벨 요소
- `width: 100%` - 카드 전체 너비 차지
- `borderRadius: inherit` - 부모(Card)의 border-radius 상속
- hover 시 `.focusHighlight`의 opacity를 `theme.palette.action.hoverOpacity`로 변경
- `@media (hover: none)` - 터치 디바이스에서는 hover 효과 없음
- focus 시 `.focusHighlight`의 opacity를 `theme.palette.action.focusOpacity`로 변경

#### CardActionAreaFocusHighlight (45-64줄)

```javascript
const CardActionAreaFocusHighlight = styled('span', {
  name: 'MuiCardActionArea',
  slot: 'FocusHighlight',
})(
  memoTheme(({ theme }) => ({
    overflow: 'hidden',
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 'inherit',
    opacity: 0,
    backgroundColor: 'currentcolor',
    transition: theme.transitions.create('opacity', {
      duration: theme.transitions.duration.short,
    }),
  })),
);
```

**특징**:
- `position: absolute` + `top/right/bottom/left: 0` - 부모 전체를 덮는 오버레이
- `pointerEvents: none` - 클릭 이벤트가 부모(ButtonBase)로 전달
- `opacity: 0` - 기본 상태에서 투명
- `backgroundColor: currentcolor` - 현재 텍스트 색상 사용
- `transition` - opacity 변경 시 부드러운 애니메이션 (theme.transitions.duration.short)
- `borderRadius: inherit` - 부모의 border-radius 상속

### 3. Slot 시스템 (2개)

```javascript
const externalForwardedProps = {
  slots,
  slotProps,
};

// 1. RootSlot - CardActionAreaRoot (ButtonBase) 기본
const [RootSlot, rootProps] = useSlot('root', {
  elementType: CardActionAreaRoot,
  externalForwardedProps: {
    ...externalForwardedProps,
    ...other,
  },
  shouldForwardComponentProp: true,
  ownerState,
  ref,
  className: clsx(classes.root, className),
  additionalProps: {
    focusVisibleClassName: clsx(focusVisibleClassName, classes.focusVisible),
  },
});

// 2. FocusHighlightSlot - CardActionAreaFocusHighlight (span) 기본
const [FocusHighlightSlot, focusHighlightProps] = useSlot('focusHighlight', {
  elementType: CardActionAreaFocusHighlight,
  externalForwardedProps,
  ownerState,
  ref,
  className: classes.focusHighlight,
});
```

### 4. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | node | - | 카드 내용 |
| `focusVisibleClassName` | string | - | focus-visible 시 적용될 클래스 이름 |
| `slots` | object | `{}` | 2개 슬롯 커스터마이징 (root, focusHighlight) |
| `slotProps` | object | `{}` | 슬롯별 props 전달 |
| `classes` | object | - | CSS 클래스 오버라이드 |
| `className` | string | - | 추가 CSS 클래스 |
| `sx` | object | - | 시스템 props |

**ButtonBase로부터 상속받은 Props**:
- `onClick`, `onFocus`, `onBlur` 등 이벤트 핸들러
- `disabled` - 비활성화
- `component` - 루트 엘리먼트 타입
- `centerRipple`, `disableRipple` - 리플 효과 제어
- `TouchRippleProps` - 리플 커스터마이징

### 5. useUtilityClasses

```javascript
const useUtilityClasses = (ownerState) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
    focusHighlight: ['focusHighlight'],
  };

  return composeClasses(slots, getCardActionAreaUtilityClass, classes);
};
```

- 2개 슬롯 각각에 대한 CSS 클래스 생성
- 테마의 classes prop과 병합

---

## 렌더링 로직

```javascript
const CardActionArea = React.forwardRef(function CardActionArea(inProps, ref) {
  // 1. 테마 기본 props
  const props = useDefaultProps({ props: inProps, name: 'MuiCardActionArea' });

  // 2. props 구조 분해
  const {
    children,
    className,
    focusVisibleClassName,
    slots = {},
    slotProps = {},
    ...other
  } = props;

  // 3. ownerState, classes
  const ownerState = props;
  const classes = useUtilityClasses(ownerState);

  // 4. externalForwardedProps
  const externalForwardedProps = {
    slots,
    slotProps,
  };

  // 5. RootSlot (ButtonBase 기반)
  const [RootSlot, rootProps] = useSlot('root', {
    elementType: CardActionAreaRoot,
    externalForwardedProps: { ...externalForwardedProps, ...other },
    shouldForwardComponentProp: true,
    ownerState,
    ref,
    className: clsx(classes.root, className),
    additionalProps: {
      focusVisibleClassName: clsx(focusVisibleClassName, classes.focusVisible),
    },
  });

  // 6. FocusHighlightSlot
  const [FocusHighlightSlot, focusHighlightProps] = useSlot('focusHighlight', {
    elementType: CardActionAreaFocusHighlight,
    externalForwardedProps,
    ownerState,
    ref,
    className: classes.focusHighlight,
  });

  // 7. 렌더링
  return (
    <RootSlot {...rootProps}>
      {children}
      <FocusHighlightSlot {...focusHighlightProps} />
    </RootSlot>
  );
});
```

---

## 설계 패턴

### 1. ButtonBase Extension Pattern
- ButtonBase를 확장하여 클릭 가능 + 리플 효과
- ButtonBase의 모든 props와 기능 상속

### 2. Overlay Pattern
- FocusHighlight를 절대 위치 오버레이로 배치
- `pointerEvents: none`으로 클릭 이벤트는 ButtonBase로 전달
- CSS selector를 통해 부모의 hover/focus 상태에 따라 opacity 변경

### 3. CSS Selector Based Interaction
```css
&:hover .${cardActionAreaClasses.focusHighlight} {
  opacity: hoverOpacity;
}

&.${cardActionAreaClasses.focusVisible} .${cardActionAreaClasses.focusHighlight} {
  opacity: focusOpacity;
}
```

- 부모의 상태(`:hover`, `.focusVisible`)에 따라 자식(.focusHighlight)의 스타일 변경
- JavaScript 이벤트 핸들러 없이 CSS만으로 구현

### 4. Theme-based Values
- `theme.palette.action.hoverOpacity` - hover 시 오버레이 불투명도
- `theme.palette.action.focusOpacity` - focus 시 오버레이 불투명도
- `theme.transitions.duration.short` - 애니메이션 지속 시간
- 테마를 통해 일관된 시각적 피드백 제공

### 5. Slot Pattern
- root 슬롯으로 ButtonBase 교체 가능
- focusHighlight 슬롯으로 오버레이 커스터마이징 가능

---

## 복잡도의 이유

CardActionArea는 **164줄**이며, 복잡한 이유는:

1. **useSlot 2회 호출** (약 30줄)
   - root, focusHighlight
   - 각 슬롯마다 elementType, externalForwardedProps, ownerState 전달

2. **Styled Components 2개** (약 40줄)
   - CardActionAreaRoot (ButtonBase 확장)
   - CardActionAreaFocusHighlight (오버레이)
   - memoTheme로 테마 값 메모이제이션

3. **memoTheme 사용** (약 10줄)
   - 테마 값 변경 시에만 리렌더링
   - palette.action, transitions 접근

4. **useUtilityClasses + composeClasses** (약 10줄)
   - 2개 슬롯 CSS 클래스 생성

5. **PropTypes** (약 46줄, 116-161)
   - 런타임 타입 검증
   - slots, slotProps 타입 정의

실제 핵심 로직은 **40줄 미만**입니다.

---

## 사용 예시

### 기본 사용
```javascript
<Card>
  <CardActionArea>
    <CardContent>
      <Typography>클릭 가능한 카드</Typography>
    </CardContent>
  </CardActionArea>
</Card>
```

### onClick 핸들러
```javascript
<CardActionArea onClick={() => console.log('clicked')}>
  <CardMedia
    component="img"
    height="140"
    image="/image.jpg"
  />
  <CardContent>
    <Typography variant="h5">제목</Typography>
  </CardContent>
</CardActionArea>
```

### disabled 상태
```javascript
<CardActionArea disabled>
  <CardContent>
    <Typography>비활성화된 카드</Typography>
  </CardContent>
</CardActionArea>
```

### 리플 효과 커스터마이징
```javascript
<CardActionArea
  disableRipple
  TouchRippleProps={{
    center: true,
  }}
>
  <CardContent>
    <Typography>커스텀 리플</Typography>
  </CardContent>
</CardActionArea>
```

---

## 핵심 동작 원리

### hover/focus 시각 효과 메커니즘

1. **기본 상태**:
   - FocusHighlight의 opacity = 0 (투명)

2. **hover 시**:
   - CSS selector `&:hover .focusHighlight`가 활성화
   - FocusHighlight의 opacity = theme.palette.action.hoverOpacity (보통 0.04)
   - transition으로 부드럽게 변경

3. **focus 시**:
   - ButtonBase가 `.focusVisible` 클래스 추가
   - CSS selector `&.focusVisible .focusHighlight`가 활성화
   - FocusHighlight의 opacity = theme.palette.action.focusOpacity (보통 0.12)

4. **터치 디바이스**:
   - `@media (hover: none)` 쿼리로 hover 효과 비활성화
   - focus 효과만 유지

### ButtonBase 통합

CardActionArea는 ButtonBase의 기능을 모두 상속:
- **리플 효과** - 클릭 시 물결 효과
- **키보드 접근성** - Enter/Space로 클릭 가능
- **focus-visible** - 키보드 포커스만 표시
- **터치 지원** - 터치 이벤트 최적화
- **장애인 접근성** - role="button" 등 ARIA 속성
