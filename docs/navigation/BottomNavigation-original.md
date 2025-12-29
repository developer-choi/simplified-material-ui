# BottomNavigation 컴포넌트

> Material-UI의 BottomNavigation 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

BottomNavigation은 **모바일 앱의 하단에 위치하는 주요 탐색 메뉴를 제공하는** 컴포넌트입니다.

### 핵심 기능
1. **자식 관리** - 여러 BottomNavigationAction을 담는 컨테이너 역할
2. **선택 상태 관리** - value prop으로 현재 선택된 아이템 추적
3. **Props 주입** - 자식 컴포넌트에 selected, showLabel, onChange 등을 자동으로 전달
4. **레이아웃 제공** - flex 레이아웃으로 자식들을 가로로 정렬

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// BottomNavigation 위치: packages/mui-material/src/BottomNavigation/BottomNavigation.js (141줄)
BottomNavigation (div)
  └─> BottomNavigationAction (ButtonBase)
       ├─> icon (React.ReactNode)
       └─> label (span)

// BottomNavigationAction 위치: packages/mui-material/src/BottomNavigationAction/BottomNavigationAction.js (236줄)
```

### 2. 하위 컴포넌트가 담당하는 기능

- **BottomNavigationAction** - 개별 탐색 아이템 (아이콘 + 라벨)을 렌더링하고 클릭 이벤트를 처리

### 3. BottomNavigation의 Children Mapping

```javascript
React.Children.map(children, (child, childIndex) => {
  if (!React.isValidElement(child)) {
    return null;
  }

  // Fragment 감지 (개발 모드 경고)
  if (process.env.NODE_ENV !== 'production') {
    if (isFragment(child)) {
      console.error("MUI: The BottomNavigation component doesn't accept a Fragment as a child.");
    }
  }

  // value 기본값으로 index 사용
  const childValue = child.props.value === undefined ? childIndex : child.props.value;

  // 자식에게 props 주입
  return React.cloneElement(child, {
    selected: childValue === value,
    showLabel: child.props.showLabel !== undefined ? child.props.showLabel : showLabels,
    value: childValue,
    onChange,
  });
});
```

**주요 로직**:
- `React.Children.map`으로 자식들을 순회
- 각 자식의 `value`가 없으면 인덱스를 사용
- 부모의 `value`와 비교하여 `selected` 결정
- `showLabel`은 자식의 prop이 우선, 없으면 부모의 `showLabels` 사용
- `onChange` 콜백을 모든 자식에게 전달

### 4. BottomNavigationAction의 Slot 시스템

```javascript
// externalForwardedProps 생성
const externalForwardedProps = {
  slots,
  slotProps,
};

// Root 컴포넌트 커스터마이징
const [RootSlot, rootProps] = useSlot('root', {
  elementType: BottomNavigationActionRoot,  // 기본 컴포넌트
  externalForwardedProps: { ...externalForwardedProps, ...other },
  shouldForwardComponentProp: true,
  ownerState,
  ref,
  className: clsx(classes.root, className),
  additionalProps: { focusRipple: true },
  getSlotProps: (handlers) => ({
    ...handlers,
    onClick: (event) => {
      handlers.onClick?.(event);
      handleChange(event);
    },
  }),
});

// Label 컴포넌트 커스터마이징
const [LabelSlot, labelProps] = useSlot('label', {
  elementType: BottomNavigationActionLabel,
  externalForwardedProps,
  ownerState,
  className: classes.label,
});

// 렌더링
return (
  <RootSlot {...rootProps}>
    {icon}
    <LabelSlot {...labelProps}>{label}</LabelSlot>
  </RootSlot>
);
```

**특징**:
- `slots.root`와 `slots.label`로 커스텀 컴포넌트 주입 가능
- `slotProps.root`와 `slotProps.label`로 각 슬롯에 props 전달
- `useSlot` 훅이 컴포넌트 선택 및 props 병합 처리

### 5. 주요 Props

**BottomNavigation**:
| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | node | - | BottomNavigationAction 자식들 |
| `className` | string | - | 커스텀 클래스 이름 |
| `classes` | object | - | 스타일 오버라이드 |
| `component` | elementType | 'div' | 루트 엘리먼트 타입 |
| `onChange` | func | - | 값 변경 콜백 (event, value) |
| `showLabels` | bool | false | 모든 라벨 표시 여부 |
| `value` | any | - | 현재 선택된 값 |
| `sx` | object/func/array | - | 시스템 스타일링 |

**BottomNavigationAction**:
| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `icon` | node | - | 표시할 아이콘 |
| `label` | node | - | 라벨 텍스트 |
| `showLabel` | bool | 부모에서 상속 | 라벨 표시 여부 오버라이드 |
| `value` | any | index | 이 아이템의 고유 값 |
| `selected` | bool | - | (내부) 선택 상태 |
| `onChange` | func | - | (내부) 변경 콜백 |
| `onClick` | func | - | 클릭 이벤트 핸들러 |
| `slots` | object | {} | 슬롯 컴포넌트 (root, label) |
| `slotProps` | object | {} | 슬롯 props |
| `classes` | object | - | 스타일 오버라이드 |
| `className` | string | - | 커스텀 클래스 |
| `sx` | object/func/array | - | 시스템 스타일링 |

### 6. Styled Components 구조

**BottomNavigationRoot** (div):
```javascript
styled('div', {
  name: 'MuiBottomNavigation',
  slot: 'Root',
})(
  memoTheme(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    height: 56,
    backgroundColor: (theme.vars || theme).palette.background.paper,
  })),
);
```

**BottomNavigationActionRoot** (ButtonBase):
```javascript
styled(ButtonBase, {
  name: 'MuiBottomNavigationAction',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;
    return [styles.root, !ownerState.showLabel && !ownerState.selected && styles.iconOnly];
  },
})(
  memoTheme(({ theme }) => ({
    transition: theme.transitions.create(['color', 'padding-top'], {
      duration: theme.transitions.duration.short,
    }),
    padding: '0px 12px',
    minWidth: 80,
    maxWidth: 168,
    color: (theme.vars || theme).palette.text.secondary,
    flexDirection: 'column',
    flex: '1',
    [`&.${bottomNavigationActionClasses.selected}`]: {
      color: (theme.vars || theme).palette.primary.main,
    },
    variants: [
      { props: ({ showLabel, selected }) => !showLabel && !selected, style: { paddingTop: 14 } },
      { props: ({ showLabel, selected, label }) => !showLabel && !selected && !label, style: { paddingTop: 0 } },
    ],
  })),
);
```

**BottomNavigationActionLabel** (span):
```javascript
styled('span', {
  name: 'MuiBottomNavigationAction',
  slot: 'Label',
})(
  memoTheme(({ theme }) => ({
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.pxToRem(12),
    opacity: 1,
    transition: 'font-size 0.2s, opacity 0.2s',
    transitionDelay: '0.1s',
    [`&.${bottomNavigationActionClasses.selected}`]: {
      fontSize: theme.typography.pxToRem(14),
    },
    variants: [
      {
        props: ({ showLabel, selected }) => !showLabel && !selected,
        style: { opacity: 0, transitionDelay: '0s' },
      },
    ],
  })),
);
```

### 7. 이벤트 처리 메커니즘

```javascript
// BottomNavigationAction 내부
const handleChange = (event) => {
  if (onChange) {
    onChange(event, value);  // 부모의 onChange 호출
  }

  if (onClick) {
    onClick(event);  // 추가 onClick 핸들러 호출
  }
};

// useSlot으로 onClick 래핑
getSlotProps: (handlers) => ({
  ...handlers,
  onClick: (event) => {
    handlers.onClick?.(event);  // 슬롯의 onClick
    handleChange(event);         // 우리의 handleChange
  },
}),
```

**흐름**:
1. 사용자가 BottomNavigationAction 클릭
2. `RootSlot`의 `onClick` 트리거
3. `handleChange` 호출
4. 부모의 `onChange(event, value)` 호출
5. 추가 `onClick` 핸들러 호출 (있으면)

---

## 설계 패턴

1. **Composition Pattern**
   - BottomNavigation이 여러 BottomNavigationAction을 조합
   - `React.Children.map`과 `React.cloneElement`로 자식 제어

2. **Slot Pattern**
   - BottomNavigationAction에서 `slots`와 `slotProps`로 컴포넌트 교체 가능
   - `useSlot` 훅으로 커스텀 컴포넌트와 props 병합

3. **Theme Integration**
   - `useDefaultProps`로 테마에서 기본 props 가져오기
   - `memoTheme`으로 테마 의존 스타일 메모이제이션
   - `useUtilityClasses`와 `composeClasses`로 동적 클래스 생성

4. **Styled Component Pattern**
   - `styled()` API로 CSS-in-JS 구현
   - `variants` 배열로 조건부 스타일
   - `overridesResolver`로 테마 오버라이드 지원

---

## 복잡도의 이유

전체 **377줄** (BottomNavigation 141줄 + BottomNavigationAction 236줄)이며, 복잡한 이유는:

1. **Slot 시스템** - `useSlot` 훅으로 컴포넌트 커스터마이징 (BottomNavigationAction만)
   - externalForwardedProps 객체 생성
   - 두 번의 useSlot 호출 (root, label)
   - props 병합 및 이벤트 핸들러 래핑

2. **Theme 통합** - useDefaultProps, useUtilityClasses, composeClasses, memoTheme
   - DefaultPropsProvider Context 구독
   - 동적 클래스 이름 생성 및 조합
   - 테마 값 메모이제이션

3. **Styled Components** - styled() API와 variants
   - `memoTheme` 래퍼로 성능 최적화
   - variants 배열로 조건부 스타일 (3개의 조건)
   - overridesResolver로 스타일 오버라이드 지원

4. **Transition 애니메이션**
   - color, padding-top: 250ms transition
   - font-size, opacity: 200ms transition + delay

5. **Props 전달 및 병합**
   - 부모 → 자식 props 주입 (React.cloneElement)
   - showLabel 우선순위 처리 (자식 > 부모)
   - value 기본값 처리 (index fallback)

6. **Fragment 감지** - react-is 라이브러리로 개발 모드 경고

7. **PropTypes** - 런타임 타입 검증 (60줄+)

8. **component prop** - 루트 엘리먼트 타입 커스터마이징

---

## 비교: BottomNavigation vs Tabs

Material-UI의 유사한 탐색 컴포넌트 비교:

| 기능 | BottomNavigation | Tabs |
|------|-----------------|------|
| 위치 | 화면 하단 (모바일) | 화면 상단 또는 중간 |
| 항목 수 | 3-5개 (권장) | 제한 없음 |
| 라벨 | 아이콘 + 선택적 라벨 | 필수 텍스트 (아이콘 선택) |
| 시각적 피드백 | 색상 변경, 라벨 나타남 | 밑줄 인디케이터 |
| 선택 상태 | selected prop | value prop |
| Slot 시스템 | BottomNavigationAction만 | Tabs와 Tab 모두 지원 |
| Scrolling | 지원 안 함 (고정) | scrollButtons 지원 |
