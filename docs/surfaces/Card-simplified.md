# Card 컴포넌트

> Paper에 overflow hidden만 추가한 단순한 래퍼

---

## 이 문서의 목적

**이 문서는 단순화된 코드의 "설명서"입니다.**

Material-UI는 라이브러리 코드라서 복잡합니다. 단순화했더라도 코드만 보고는 이해하기 어려울 수 있습니다.
이 문서는 코드의 **동작 원리, 핵심 패턴, 왜 이렇게 구현했는지**를 상세히 설명하여 학습을 돕습니다.

---

## 무슨 기능을 하는가?

수정된 Card는 **Paper 컴포넌트를 래핑하여 overflow: hidden 스타일만 추가한 단순한 컨테이너**입니다.

### 핵심 기능 (남은 것)
1. **Paper 래핑** - Paper의 모든 props를 그대로 전달
2. **Overflow Hidden** - 카드 경계 밖으로 콘텐츠가 삐져나가지 않도록 숨김
3. **Raised 단축키** - `raised={true}` 시 elevation 8, `false` 시 elevation 1

---

## 핵심 학습 포인트

### 1. Component Wrapper Pattern - 최소한의 확장

```javascript
const Card = React.forwardRef(function Card(props, ref) {
  const { className, raised = false, style, ...other } = props;

  return (
    <Paper
      ref={ref}
      className={className}
      style={{ overflow: 'hidden', ...style }}
      elevation={raised ? 8 : 1}
      {...other}
    />
  );
});
```

**학습 가치**:
- 기존 컴포넌트(Paper)를 확장하는 가장 간단한 방법
- 단 하나의 스타일(`overflow: hidden`)만 추가하고 나머지는 전부 위임
- ref도 그대로 전달하여 Paper의 기능을 100% 유지

### 2. Convenience Props - 사용 편의성

```javascript
elevation={raised ? 8 : 1}
```

**학습 가치**:
- `raised` prop은 실제로는 elevation 값을 결정하는 단축키
- `raised={true}` = "강조된 카드" = `elevation={8}`
- `raised={false}` = "일반 카드" = `elevation={1}`
- API를 단순화하면서도 일반적인 사용 패턴을 쉽게 만듦

### 3. Style Composition - 인라인 스타일 병합

```javascript
style={{ overflow: 'hidden', ...style }}
```

**학습 가치**:
- `overflow: 'hidden'`은 Card의 고정 스타일
- `...style`로 사용자가 전달한 추가 스타일을 뒤에 병합
- 사용자가 `style={{ overflow: 'visible' }}`를 전달하면 오버라이드 가능

---

## 내부 구조

### 1. 렌더링 구조

```javascript
// 위치: packages/mui-material/src/Card/Card.js (19줄, 원본 91줄)

Card
  └─> Paper
       ├─ overflow: 'hidden' (고정 스타일)
       ├─ elevation={raised ? 8 : 1}
       └─ ...other props 전달
```

### 2. Props

| 이름 | 타입 | 기본값 | 용도 |
|------|------|--------|------|
| `raised` | boolean | `false` | elevation 단축키 (false=1, true=8) |
| `className` | string | - | CSS 클래스 전달 |
| `style` | object | - | 인라인 스타일 (overflow와 병합) |
| `...other` | any | - | Paper로 전달되는 모든 props |

**Paper로부터 사용 가능한 Props**:
- `elevation` (0-24) - raised와 함께 사용 시 raised가 우선
- `variant` ('elevation' | 'outlined')
- `square` (boolean)
- `children` (node)

### 3. 동작 흐름

#### 기본 렌더링 플로우

```
Card 컴포넌트 호출
        ↓
props 구조 분해 (className, raised, style 추출)
        ↓
Paper 렌더링
 ├─ ref 전달
 ├─ className 전달
 ├─ style={ overflow: 'hidden', ...style } 병합
 ├─ elevation={raised ? 8 : 1} 계산
 └─ ...other props 전달
```

#### 시나리오 예시

**시나리오 1: 기본 카드**
```javascript
<Card>
  <CardContent>Hello</CardContent>
</Card>

// 결과: elevation={1}, overflow='hidden'
```

**시나리오 2: Raised 카드**
```javascript
<Card raised>
  <CardContent>Hello</CardContent>
</Card>

// 결과: elevation={8}, overflow='hidden'
```

**시나리오 3: Outlined 카드**
```javascript
<Card variant="outlined">
  <CardContent>Hello</CardContent>
</Card>

// 결과: elevation={1} (무시됨), variant='outlined', overflow='hidden'
// outlined는 테두리만 있고 그림자 없음
```

---

## 주요 변경 사항 (원본 대비)

**원본과의 차이**:
- ❌ `useDefaultProps()` 제거 → 함수 파라미터 기본값으로 대체
- ❌ `styled()` 시스템 제거 → Paper 직접 사용 + 인라인 스타일
- ❌ `useUtilityClasses()`, `composeClasses()` 제거 → className 직접 전달
- ❌ `ownerState` 제거 → 불필요한 중간 객체
- ❌ `clsx()` 제거 → className 단순 전달
- ❌ `PropTypes` 제거 → 런타임 검증 약 37줄 제거
- ✅ Paper 래핑 유지
- ✅ `raised` prop 동작 유지
- ✅ `overflow: hidden` 스타일 유지
- ✅ ref 전달 유지

---

## 커밋 히스토리로 보는 단순화 과정

Card는 **4개의 실질적인 커밋**을 통해 단순화되었습니다 (1, 2번은 Skip).

### 1단계: Slot 시스템 제거

- **작업**: Skip (Card는 Slot 시스템 미사용)

### 2단계: Deprecated props 제거

- **작업**: Skip (deprecated props 없음)

### 3단계: useDefaultProps 제거

- `af94f459` - [Card 단순화 3/6] useDefaultProps 제거

**삭제된 코드**:
```javascript
import { useDefaultProps } from '../DefaultPropsProvider';

const props = useDefaultProps({
  props: inProps,
  name: 'MuiCard',
});
```

**변경 후**:
```javascript
const Card = React.forwardRef(function Card(props, ref) {
  const { raised = false, ... } = props;
```

**왜 불필요한가**:
- **학습 목적**: 테마 시스템의 defaultProps 병합은 개별 컴포넌트 학습과 무관
- **복잡도**: 테마 Context 구독 불필요, 단순 기본값 할당으로 충분

### 4단계: styled 시스템 제거

- `83ed4016` - [Card 단순화 4/6] styled 시스템 제거

**삭제된 코드**:
```javascript
import { styled } from '../zero-styled';

const CardRoot = styled(Paper, {
  name: 'MuiCard',
  slot: 'Root',
})({
  overflow: 'hidden',
});

<CardRoot ownerState={ownerState} elevation={raised ? 8 : undefined} ... />
```

**변경 후**:
```javascript
<Paper
  style={{ overflow: 'hidden', ...style }}
  elevation={raised ? 8 : 1}
  {...other}
/>
```

**왜 불필요한가**:
- **학습 목적**: CSS-in-JS 시스템 배우는 게 아님, 인라인 스타일이 더 직관적
- **복잡도**: `overflow: hidden` 하나 적용하는데 styled() API 불필요
- `elevation={raised ? 8 : undefined}` → `1`로 변경하여 기본 elevation 명시

### 5단계: useUtilityClasses, composeClasses 제거

- `41850cbb` - [Card 단순화 5/6] useUtilityClasses, composeClasses 제거

**삭제된 코드**:
```javascript
import clsx from 'clsx';
import composeClasses from '@mui/utils/composeClasses';
import { getCardUtilityClass } from './cardClasses';

const useUtilityClasses = (ownerState) => {
  const { classes } = ownerState;
  const slots = { root: ['root'] };
  return composeClasses(slots, getCardUtilityClass, classes);
};

const ownerState = { ...props, raised };
const classes = useUtilityClasses(ownerState);

<Paper className={clsx(classes.root, className)} ... />
```

**변경 후**:
```javascript
<Paper className={className} ... />
```

**왜 불필요한가**:
- **학습 목적**: CSS 클래스 기반 스타일링은 테마 시스템의 일부, 컴포넌트 동작과 무관
- **복잡도**: 단일 'root' 슬롯만 사용하는데 추상화 레이어 불필요

### 6단계: PropTypes 제거

- `9e1f698f` - [Card 단순화 6/6] PropTypes 제거

**삭제된 코드**:
```javascript
import PropTypes from 'prop-types';
import chainPropTypes from '@mui/utils/chainPropTypes';

Card.propTypes = {
  children: PropTypes.node,
  classes: PropTypes.object,
  className: PropTypes.string,
  raised: chainPropTypes(PropTypes.bool, (props) => {
    if (props.raised && props.variant === 'outlined') {
      return new Error('MUI: Combining `raised={true}` with `variant="outlined"` has no effect.');
    }
    return null;
  }),
  sx: PropTypes.oneOfType([...]),
};
```

**왜 불필요한가**:
- **학습 목적**: PropTypes는 런타임 타입 검증 도구, TypeScript가 빌드 타임에 더 강력하게 검증
- **복잡도**: 실제 로직(19줄)보다 PropTypes(37줄)가 더 많았음

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 91줄 | 19줄 (79% 감소) |
| **Import 개수** | 7개 | 2개 |
| **styled 컴포넌트** | 1개 (CardRoot) | ❌ |
| **useDefaultProps** | ✅ | ❌ |
| **useUtilityClasses** | ✅ | ❌ |
| **clsx** | ✅ | ❌ |
| **PropTypes** | ✅ 37줄 | ❌ |
| **Paper 래핑** | ✅ | ✅ 동일 |
| **overflow hidden** | ✅ | ✅ 동일 |
| **raised prop** | ✅ | ✅ 동일 |

---

## 학습 후 다음 단계

Card를 이해했다면:

1. **Paper** - Card의 기반 컴포넌트. elevation, variant 이해
2. **CardContent** - 카드 내부의 콘텐츠 영역 (padding 적용)
3. **CardActions** - 카드 하단의 버튼 영역 (flex 레이아웃)
4. **CardHeader** - 카드 상단의 제목/아바타 영역

**예시: 기본 사용**
```javascript
<Card>
  <CardContent>
    <Typography variant="h5">카드 제목</Typography>
    <Typography>카드 내용</Typography>
  </CardContent>
</Card>
```

**예시: Raised 카드**
```javascript
<Card raised>
  <CardContent>강조된 카드</CardContent>
</Card>
```

**예시: Outlined 카드**
```javascript
<Card variant="outlined">
  <CardContent>테두리 카드</CardContent>
</Card>
```

**예시: 완전한 카드 구성**
```javascript
<Card>
  <CardHeader
    title="제목"
    subheader="부제목"
  />
  <CardMedia
    component="img"
    image="/image.jpg"
    alt="설명"
  />
  <CardContent>
    <Typography>본문 내용</Typography>
  </CardContent>
  <CardActions>
    <Button>액션 1</Button>
    <Button>액션 2</Button>
  </CardActions>
</Card>
```
