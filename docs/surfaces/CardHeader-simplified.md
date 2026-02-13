# CardHeader 컴포넌트

> 4개 영역을 flex 레이아웃으로 배치하는 카드 헤더

---

## 이 문서의 목적

**이 문서는 단순화된 코드의 "설명서"입니다.**

Material-UI는 라이브러리 코드라서 복잡합니다. 단순화했더라도 코드만 보고는 이해하기 어려울 수 있습니다.
이 문서는 코드의 **동작 원리, 핵심 패턴, 왜 이렇게 구현했는지**를 상세히 설명하여 학습을 돕습니다.

---

## 무슨 기능을 하는가?

수정된 CardHeader는 **카드 상단에 avatar, title/subheader, action 4개 영역을 flex 레이아웃으로 배치하는** 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **Flex 레이아웃** - avatar(왼쪽), content(중앙), action(오른쪽) 배치
2. **Typography 자동 래핑** - title/subheader를 자동으로 Typography로 감싸기
3. **Component 다형성** - component prop으로 루트 엘리먼트 변경 가능

---

## 핵심 학습 포인트

### 1. Conditional Typography Wrapping - 똑똑한 자동 래핑

```javascript
let title = titleProp;
if (title != null && title.type !== Typography && !disableTypography) {
  title = (
    <Typography variant={avatar ? 'body2' : 'h5'} component="span">
      {title}
    </Typography>
  );
}
```

**학습 가치**:
- **타입 체크**: `title.type !== Typography` - 이미 Typography면 래핑 안 함
- **조건부 래핑**: 문자열이나 다른 컴포넌트만 래핑
- **사용자 제어**: `disableTypography={true}`로 비활성화 가능
- **컨텍스트 기반 variant**: avatar가 있으면 작게(body2), 없으면 크게(h5)

### 2. Flex Layout Pattern - 3영역 레이아웃

```javascript
const styles = {
  root: {
    display: 'flex',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    flex: '0 0 auto',      // 고정 크기
    marginRight: 16,
  },
  content: {
    flex: '1 1 auto',      // 남은 공간 차지
  },
  action: {
    flex: '0 0 auto',      // 고정 크기
    alignSelf: 'flex-start',  // 상단 정렬
  },
};
```

**학습 가치**:
- **flex: 0 0 auto**: 콘텐츠 크기만큼만 차지 (늘어나거나 줄어들지 않음)
- **flex: 1 1 auto**: 남은 공간을 모두 차지
- **alignSelf: flex-start**: action만 상단 정렬 (나머지는 center)
- 이 패턴은 앱바, 툴바 등 많은 곳에서 재사용 가능

### 3. Component Polymorphism - 동적 컴포넌트

```javascript
const Component = component;

return (
  <Component ref={ref} style={styles.root} {...other}>
    ...
  </Component>
);
```

**학습 가치**:
- `component` prop을 변수에 할당 후 JSX에서 사용
- `<div>`, `<header>`, `<section>` 등 어떤 HTML 요소로도 렌더링 가능
- 컴포넌트 이름은 대문자로 시작해야 함 (React 규칙)

---

## 내부 구조

### 1. 렌더링 구조

```javascript
// 위치: packages/mui-material/src/CardHeader/CardHeader.js (78줄, 원본 273줄)

CardHeader
  └─> Component (기본값 'div')
       ├─> div (avatar 영역)
       │   └─ avatar
       ├─> div (content 영역)
       │   ├─ title (Typography로 래핑될 수 있음)
       │   └─ subheader (Typography로 래핑될 수 있음)
       └─> div (action 영역)
           └─ action
```

### 2. 핵심 상태 (ref, state, 변수)

| 이름 | 타입 | 용도 |
|------|------|------|
| `title` | 변수 | titleProp을 조건부로 Typography 래핑 |
| `subheader` | 변수 | subheaderProp을 조건부로 Typography 래핑 |
| `Component` | 변수 | component prop을 대문자 변수로 저장 |

### 3. Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `title` | node | - | 제목 (문자열 또는 컴포넌트) |
| `subheader` | node | - | 부제목 (문자열 또는 컴포넌트) |
| `avatar` | node | - | 아바타 요소 (주로 Avatar 컴포넌트) |
| `action` | node | - | 액션 요소 (주로 IconButton) |
| `disableTypography` | boolean | `false` | Typography 자동 래핑 비활성화 |
| `component` | elementType | `'div'` | 루트 엘리먼트 타입 |

### 4. 동작 흐름

#### Typography 래핑 플로우차트

```
title prop 전달됨
        ↓
┌─────────────────────────────────┐
│ title이 null/undefined?         │──→ YES → title 그대로 사용
└─────────────────────────────────┘
        ↓ NO
┌─────────────────────────────────┐
│ disableTypography=true?         │──→ YES → title 그대로 사용
└─────────────────────────────────┘
        ↓ NO
┌─────────────────────────────────┐
│ title이 이미 Typography?         │──→ YES → title 그대로 사용
└─────────────────────────────────┘
        ↓ NO
Typography로 래핑
 ├─ variant: avatar 있으면 body2, 없으면 h5
 └─ component: span
```

#### 시나리오 예시

**시나리오 1: 문자열 title**
```javascript
<CardHeader title="카드 제목" />

// 결과: <Typography variant="h5" component="span">카드 제목</Typography>
```

**시나리오 2: 이미 Typography인 title**
```javascript
<CardHeader title={<Typography variant="h3">큰 제목</Typography>} />

// 결과: 래핑 안 함, 그대로 렌더링
```

**시나리오 3: Avatar와 함께**
```javascript
<CardHeader avatar={<Avatar>R</Avatar>} title="Recipe" />

// 결과: <Typography variant="body2" component="span">Recipe</Typography>
// (아바타가 있으면 제목을 작게)
```

**시나리오 4: disableTypography**
```javascript
<CardHeader title="Plain Text" disableTypography />

// 결과: Typography 래핑 안 함, "Plain Text" 문자열 그대로
```

### 5. Flex Layout 상세

#### Root Container
```javascript
root: {
  display: 'flex',        // flex 레이아웃 활성화
  alignItems: 'center',   // 수직 중앙 정렬
  padding: 16,            // 모든 방향 16px 패딩
}
```

#### Avatar (왼쪽)
```javascript
avatar: {
  display: 'flex',        // Avatar 내부 정렬을 위해
  flex: '0 0 auto',       // 크기 고정 (grow 안 함, shrink 안 함)
  marginRight: 16,        // 오른쪽 content와 간격
}
```

#### Content (중앙)
```javascript
content: {
  flex: '1 1 auto',       // 남은 공간 모두 차지
}
```
- **flex-grow: 1** - 남은 공간을 차지
- **flex-shrink: 1** - 공간 부족 시 줄어들 수 있음
- **flex-basis: auto** - 콘텐츠 크기 기준

#### Action (오른쪽)
```javascript
action: {
  flex: '0 0 auto',       // 크기 고정
  alignSelf: 'flex-start', // 상단 정렬 (나머지는 center)
  marginTop: -4,          // 위로 4px 올림
  marginRight: -8,        // 오른쪽으로 8px 확장
  marginBottom: -4,       // 아래로 4px 확장
}
```
- **alignSelf: flex-start** - 이 요소만 상단 정렬
- **음수 마진** - 패딩을 상쇄하여 버튼을 경계까지 확장

---

## 주요 변경 사항 (원본 대비)

**원본과의 차이**:
- ❌ `useSlot()` 6회 호출 제거 → 직접 div, Typography 사용
- ❌ Slot 시스템 제거 → `slots`, `slotProps` props 제거
- ❌ Deprecated props 제거 → `titleTypographyProps`, `subheaderTypographyProps`
- ❌ `useDefaultProps()` 제거 → 함수 파라미터 기본값
- ❌ 4개 `styled()` 컴포넌트 제거 → 인라인 스타일 객체
- ❌ `useUtilityClasses()`, `composeClasses()` 제거 → className 시스템 제거
- ❌ `ownerState` 제거 → 불필요한 중간 객체
- ❌ `PropTypes` 제거 → 86줄 제거
- ✅ Typography 자동 래핑 유지
- ✅ `disableTypography` prop 유지
- ✅ Component 다형성 유지
- ✅ Flex 레이아웃 유지

---

## 커밋 히스토리로 보는 단순화 과정

CardHeader는 **4개의 커밋**을 통해 단순화되었습니다.

### 1단계: Slot 시스템 제거

- `850872b3` - [CardHeader 단순화 1/4] Slot 시스템 제거

**삭제된 코드**:
```javascript
import useSlot from '../utils/useSlot';

const externalForwardedProps = {
  slots,
  slotProps: {
    title: titleTypographyProps,
    subheader: subheaderTypographyProps,
    ...slotProps,
  },
};

// 6개 useSlot 호출
const [TitleSlot, titleSlotProps] = useSlot('title', { ... });
const [SubheaderSlot, subheaderSlotProps] = useSlot('subheader', { ... });
const [RootSlot, rootSlotProps] = useSlot('root', { ... });
const [AvatarSlot, avatarSlotProps] = useSlot('avatar', { ... });
const [ContentSlot, contentSlotProps] = useSlot('content', { ... });
const [ActionSlot, actionSlotProps] = useSlot('action', { ... });
```

**변경 후**:
```javascript
// styled 컴포넌트 직접 사용
<CardHeaderRoot ref={ref} as={component} {...other}>
  {avatar && <CardHeaderAvatar>{avatar}</CardHeaderAvatar>}
  <CardHeaderContent>
    {title}
    {subheader}
  </CardHeaderContent>
  {action && <CardHeaderAction>{action}</CardHeaderAction>}
</CardHeaderRoot>
```

**왜 불필요한가**:
- **학습 목적**: Slot 시스템은 컴포넌트 교체 기능이지만 핵심 동작 이해와 무관
- **복잡도**: 6개 useSlot 호출로 약 70줄 제거

### 2단계: Deprecated props 및 useDefaultProps 제거

- `b1b66d10` - [CardHeader 단순화 2/4] Deprecated props 및 useDefaultProps 제거

**삭제된 코드**:
```javascript
import { useDefaultProps } from '../DefaultPropsProvider';

const props = useDefaultProps({ props: inProps, name: 'MuiCardHeader' });

const {
  titleTypographyProps,      // deprecated
  subheaderTypographyProps,  // deprecated
  ...
} = props;

// deprecated props를 Typography에 전달
<Typography {...titleTypographyProps}>
  {title}
</Typography>
```

**변경 후**:
```javascript
const CardHeader = React.forwardRef(function CardHeader(props, ref) {
  const {
    action,
    avatar,
    component = 'div',
    disableTypography = false,
    subheader: subheaderProp,
    title: titleProp,
    ...other
  } = props;
```

**왜 불필요한가**:
- **학습 목적**: deprecated props는 하위 호환용, 학습에 불필요
- **복잡도**: useDefaultProps는 테마 시스템 의존성

### 3단계: styled 시스템 제거

- `7f6e3f5a` - [CardHeader 단순화 3/4] styled 시스템 제거

**삭제된 코드**:
```javascript
import { styled } from '../zero-styled';

const CardHeaderRoot = styled('div', {
  name: 'MuiCardHeader',
  slot: 'Root',
  overridesResolver: (props, styles) => { ... },
})({
  display: 'flex',
  alignItems: 'center',
  padding: 16,
});

const CardHeaderAvatar = styled('div', { ... })({ ... });
const CardHeaderAction = styled('div', { ... })({ ... });
const CardHeaderContent = styled('div', { ... })({ ... });
```

**변경 후**:
```javascript
const styles = {
  root: { display: 'flex', alignItems: 'center', padding: 16 },
  avatar: { display: 'flex', flex: '0 0 auto', marginRight: 16 },
  action: { flex: '0 0 auto', alignSelf: 'flex-start', marginTop: -4, marginRight: -8, marginBottom: -4 },
  content: { flex: '1 1 auto' },
};

<div ref={ref} style={styles.root} {...other}>
  {avatar && <div style={styles.avatar}>{avatar}</div>}
  <div style={styles.content}>
    {title}
    {subheader}
  </div>
  {action && <div style={styles.action}>{action}</div>}
</div>
```

**왜 불필요한가**:
- **학습 목적**: CSS-in-JS 시스템 배우는 게 아님, 인라인 스타일이 더 직관적
- **복잡도**: 4개 styled 컴포넌트를 단순 div + 인라인 스타일로 대체

### 4단계: useUtilityClasses, composeClasses, PropTypes 제거

- `1516ff94` - [CardHeader 단순화 4/4] useUtilityClasses, composeClasses, PropTypes 제거

**삭제된 코드**:
```javascript
import PropTypes from 'prop-types';
import composeClasses from '@mui/utils/composeClasses';
import { getCardHeaderUtilityClass } from './cardHeaderClasses';

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

const ownerState = { ...props, component, disableTypography };
const classes = useUtilityClasses(ownerState);

// PropTypes 블록 (~86줄)
CardHeader.propTypes = { ... };
```

**변경 후**:
```javascript
// className 시스템 제거, PropTypes 제거
<Component ref={ref} style={styles.root} {...other}>
  {avatar && <div style={styles.avatar}>{avatar}</div>}
  ...
</Component>
```

**왜 불필요한가**:
- **학습 목적**: CSS 클래스 기반 스타일링은 테마 시스템의 일부
- **복잡도**: useUtilityClasses 15줄 + PropTypes 86줄 제거

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 273줄 | 78줄 (71% 감소) |
| **Import 개수** | 7개 | 2개 |
| **styled 컴포넌트** | 4개 | ❌ (인라인 스타일) |
| **useSlot 호출** | 6개 | ❌ |
| **useDefaultProps** | ✅ | ❌ |
| **useUtilityClasses** | ✅ | ❌ |
| **PropTypes** | ✅ 86줄 | ❌ |
| **Deprecated props** | 2개 | ❌ |
| **Typography 래핑** | ✅ | ✅ 동일 |
| **disableTypography** | ✅ | ✅ 동일 |
| **component prop** | ✅ | ✅ 동일 |
| **Flex 레이아웃** | ✅ | ✅ 동일 |

---

## 학습 후 다음 단계

CardHeader를 이해했다면:

1. **Card** - CardHeader의 컨테이너
2. **CardContent** - 본문 콘텐츠 영역
3. **CardActions** - 하단 버튼 영역
4. **Typography** - title/subheader 래핑에 사용되는 컴포넌트

**예시: 기본 사용**
```javascript
<CardHeader
  title="카드 제목"
  subheader="2024년 1월"
/>
```

**예시: Avatar + Action**
```javascript
<CardHeader
  avatar={<Avatar>R</Avatar>}
  action={<IconButton><MoreVertIcon /></IconButton>}
  title="Recipe Title"
  subheader="September 14, 2016"
/>
```

**예시: 커스텀 Typography**
```javascript
<CardHeader
  title={<Typography variant="h3">큰 제목</Typography>}
  subheader="자동 래핑되지 않음"
/>
```

**예시: disableTypography 사용**
```javascript
<CardHeader
  title={<div><strong>Bold Title</strong></div>}
  disableTypography
/>
```

**예시: component 변경**
```javascript
<CardHeader
  component="header"
  title="Semantic HTML"
/>
// 결과: <header> 요소로 렌더링됨
```
