# CardHeader 컴포넌트

> Material-UI의 CardHeader 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

CardHeader는 **카드 상단에 제목, 부제목, 아바타, 액션 버튼을 배치하는 헤더** 컴포넌트입니다.

### 핵심 기능

1. **4개 영역 배치** - avatar(왼쪽), title/subheader(중앙), action(오른쪽) flex 레이아웃
2. **Typography 자동 래핑** - title/subheader를 자동으로 Typography로 감싸기
3. **Slot 시스템** - 6개 슬롯으로 모든 내부 요소 교체 가능
4. **Component 다형성** - component prop으로 루트 엘리먼트 변경

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/CardHeader/CardHeader.js (273줄)

CardHeader
  ├─ useDefaultProps (테마에서 기본 props 가져오기)
  ├─ useUtilityClasses (CSS 클래스 이름 생성)
  ├─ 6개 useSlot 호출 (title, subheader, root, avatar, content, action)
  │
  └─ RootSlot (CardHeaderRoot, div)
       ├─ AvatarSlot (CardHeaderAvatar, div)
       │   └─ avatar
       ├─ ContentSlot (CardHeaderContent, div)
       │   ├─ TitleSlot (Typography)
       │   │   └─ title
       │   └─ SubheaderSlot (Typography)
       │       └─ subheader
       └─ ActionSlot (CardHeaderAction, div)
           └─ action
```

### 2. Styled Components (4개)

#### CardHeaderRoot (26-40줄)
```javascript
const CardHeaderRoot = styled('div', {
  name: 'MuiCardHeader',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    return [
      { [`& .${cardHeaderClasses.title}`]: styles.title },
      { [`& .${cardHeaderClasses.subheader}`]: styles.subheader },
      styles.root,
    ];
  },
})({
  display: 'flex',
  alignItems: 'center',
  padding: 16,
});
```

#### CardHeaderAvatar (42-49줄)
```javascript
const CardHeaderAvatar = styled('div')({
  display: 'flex',
  flex: '0 0 auto',
  marginRight: 16,
});
```

#### CardHeaderAction (51-60줄)
```javascript
const CardHeaderAction = styled('div')({
  flex: '0 0 auto',
  alignSelf: 'flex-start',
  marginTop: -4,
  marginRight: -8,
  marginBottom: -4,
});
```

#### CardHeaderContent (62-73줄)
```javascript
const CardHeaderContent = styled('div')({
  flex: '1 1 auto',
  [`.${typographyClasses.root}:where(& .${cardHeaderClasses.title})`]: {
    display: 'block',
  },
  [`.${typographyClasses.root}:where(& .${cardHeaderClasses.subheader})`]: {
    display: 'block',
  },
});
```

### 3. Slot 시스템 (6개)

```javascript
const externalForwardedProps = {
  slots,
  slotProps: {
    title: titleTypographyProps,      // deprecated prop 병합
    subheader: subheaderTypographyProps,  // deprecated prop 병합
    ...slotProps,
  },
};

// 1. TitleSlot - Typography 기본, 커스터마이징 가능
const [TitleSlot, titleSlotProps] = useSlot('title', {
  className: classes.title,
  elementType: Typography,
  externalForwardedProps,
  ownerState,
  additionalProps: {
    variant: avatar ? 'body2' : 'h5',
    component: 'span',
  },
});

// 2. SubheaderSlot - Typography 기본
const [SubheaderSlot, subheaderSlotProps] = useSlot('subheader', {
  className: classes.subheader,
  elementType: Typography,
  externalForwardedProps,
  ownerState,
  additionalProps: {
    variant: avatar ? 'body2' : 'body1',
    color: 'textSecondary',
    component: 'span',
  },
});

// 3. RootSlot - CardHeaderRoot 기본
const [RootSlot, rootSlotProps] = useSlot('root', { ... });

// 4. AvatarSlot - CardHeaderAvatar 기본
const [AvatarSlot, avatarSlotProps] = useSlot('avatar', { ... });

// 5. ContentSlot - CardHeaderContent 기본
const [ContentSlot, contentSlotProps] = useSlot('content', { ... });

// 6. ActionSlot - CardHeaderAction 기본
const [ActionSlot, actionSlotProps] = useSlot('action', { ... });
```

### 4. Typography 자동 래핑 로직

```javascript
let title = titleProp;
if (title != null && title.type !== Typography && !disableTypography) {
  // 문자열이거나 다른 컴포넌트면 Typography로 래핑
  title = <TitleSlot {...titleSlotProps}>{title}</TitleSlot>;
}

let subheader = subheaderProp;
if (subheader != null && subheader.type !== Typography && !disableTypography) {
  // 문자열이거나 다른 컴포넌트면 Typography로 래핑
  subheader = <SubheaderSlot {...subheaderSlotProps}>{subheader}</SubheaderSlot>;
}
```

**조건**:
- `title`이나 `subheader`가 이미 `<Typography>`면 래핑 안 함
- `disableTypography={true}`면 래핑 안 함
- 그 외 경우(문자열, 다른 컴포넌트)는 Typography로 래핑

### 5. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `title` | node | - | 제목 (문자열 또는 컴포넌트) |
| `subheader` | node | - | 부제목 (문자열 또는 컴포넌트) |
| `avatar` | node | - | 아바타 요소 (주로 Avatar 컴포넌트) |
| `action` | node | - | 액션 요소 (주로 IconButton) |
| `disableTypography` | boolean | `false` | Typography 자동 래핑 비활성화 |
| `component` | elementType | `'div'` | 루트 엘리먼트 타입 |
| `slots` | object | `{}` | 6개 슬롯 커스터마이징 |
| `slotProps` | object | `{}` | 슬롯별 props 전달 |

**Deprecated Props**:
- `titleTypographyProps` → `slotProps.title`로 대체됨
- `subheaderTypographyProps` → `slotProps.subheader`로 대체됨

### 6. useUtilityClasses

```javascript
const useUtilityClasses = (ownerState) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
    avatar: ['avatar'],
    action: ['action'],
    content: ['content'],
    title: ['title'],
    subheader: ['subheader'],
  };

  return composeClasses(slots, getCardHeaderUtilityClass, classes);
};
```

- 6개 슬롯 각각에 대한 CSS 클래스 생성
- 테마의 classes prop과 병합

---

## 렌더링 로직

```javascript
const CardHeader = React.forwardRef(function CardHeader(inProps, ref) {
  // 1. 테마 기본 props
  const props = useDefaultProps({ props: inProps, name: 'MuiCardHeader' });

  // 2. props 구조 분해
  const {
    action,
    avatar,
    component = 'div',
    disableTypography = false,
    subheader: subheaderProp,
    title: titleProp,
    titleTypographyProps,      // deprecated
    subheaderTypographyProps,  // deprecated
    slots = {},
    slotProps = {},
    ...other
  } = props;

  // 3. ownerState, classes
  const ownerState = { ...props, component, disableTypography };
  const classes = useUtilityClasses(ownerState);

  // 4. externalForwardedProps (deprecated props 병합)
  const externalForwardedProps = {
    slots,
    slotProps: {
      title: titleTypographyProps,
      subheader: subheaderTypographyProps,
      ...slotProps,
    },
  };

  // 5. Title 래핑
  let title = titleProp;
  const [TitleSlot, titleSlotProps] = useSlot('title', { ... });
  if (title != null && title.type !== Typography && !disableTypography) {
    title = <TitleSlot {...titleSlotProps}>{title}</TitleSlot>;
  }

  // 6. Subheader 래핑
  let subheader = subheaderProp;
  const [SubheaderSlot, subheaderSlotProps] = useSlot('subheader', { ... });
  if (subheader != null && subheader.type !== Typography && !disableTypography) {
    subheader = <SubheaderSlot {...subheaderSlotProps}>{subheader}</SubheaderSlot>;
  }

  // 7. 나머지 슬롯
  const [RootSlot, rootSlotProps] = useSlot('root', { ... });
  const [AvatarSlot, avatarSlotProps] = useSlot('avatar', { ... });
  const [ContentSlot, contentSlotProps] = useSlot('content', { ... });
  const [ActionSlot, actionSlotProps] = useSlot('action', { ... });

  // 8. 렌더링
  return (
    <RootSlot {...rootSlotProps}>
      {avatar && <AvatarSlot {...avatarSlotProps}>{avatar}</AvatarSlot>}
      <ContentSlot {...contentSlotProps}>
        {title}
        {subheader}
      </ContentSlot>
      {action && <ActionSlot {...actionSlotProps}>{action}</ActionSlot>}
    </RootSlot>
  );
});
```

---

## 설계 패턴

1. **Slot Pattern**
   - 6개 내부 요소를 모두 교체 가능
   - `slots.title`, `slots.root` 등으로 커스터마이징
   - `slotProps.title`, `slotProps.root`로 props 전달

2. **Conditional Typography Wrapping**
   - 문자열 title → 자동으로 `<Typography variant="h5">`로 래핑
   - 이미 `<Typography>`면 래핑 안 함
   - `disableTypography={true}`로 비활성화 가능

3. **Deprecated Props Migration**
   - `titleTypographyProps` → `slotProps.title`
   - 두 가지 API를 병합하여 하위 호환성 유지

4. **Flex Layout**
   - Root: `display: flex`
   - Avatar: `flex: 0 0 auto, marginRight: 16`
   - Content: `flex: 1 1 auto` (남은 공간 차지)
   - Action: `flex: 0 0 auto, alignSelf: flex-start`

---

## 복잡도의 이유

CardHeader는 **273줄**이며, 복잡한 이유는:

1. **useSlot 6회 호출** (약 60줄)
   - title, subheader, root, avatar, content, action
   - 각 슬롯마다 elementType, additionalProps, externalForwardedProps 전달

2. **Styled Components 4개** (약 48줄)
   - CardHeaderRoot, Avatar, Action, Content
   - overridesResolver로 테마 오버라이드 지원

3. **Typography 자동 래핑 로직** (약 30줄)
   - title, subheader 각각 조건 검사 및 래핑
   - `.type !== Typography` 체크

4. **Deprecated Props 병합** (약 10줄)
   - titleTypographyProps, subheaderTypographyProps
   - externalForwardedProps에 병합

5. **useUtilityClasses + composeClasses** (약 15줄)
   - 6개 슬롯 CSS 클래스 생성

6. **PropTypes** (약 86줄, 184-270)
   - 런타임 타입 검증
   - slots, slotProps 타입 정의

실제 핵심 로직은 **50줄 미만**입니다.

---

## 사용 예시

### 기본 사용
```javascript
<CardHeader
  title="카드 제목"
  subheader="2024년 1월"
/>
```

### Avatar + Action 포함
```javascript
<CardHeader
  avatar={<Avatar>R</Avatar>}
  action={<IconButton><MoreVertIcon /></IconButton>}
  title="Recipe Title"
  subheader="September 14, 2016"
/>
```

### disableTypography 사용
```javascript
<CardHeader
  title={<Typography variant="h3">Custom Title</Typography>}
  disableTypography
/>
```
