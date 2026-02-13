# CardActions 컴포넌트

> flex와 gap으로 간단하게 구현한 버튼 컨테이너

---

## 이 문서의 목적

**이 문서는 단순화된 코드의 "설명서"입니다.**

Material-UI는 라이브러리 코드라서 복잡합니다. 단순화했더라도 코드만 보고는 이해하기 어려울 수 있습니다.
이 문서는 코드의 **동작 원리, 핵심 패턴, 왜 이렇게 구현했는지**를 상세히 설명하여 학습을 돕습니다.

---

## 무슨 기능을 하는가?

수정된 CardActions는 **카드 하단에 버튼(액션)을 배치하는 간단한 flex 컨테이너**입니다.

### 핵심 기능 (남은 것)
1. **Flex 레이아웃** - 자식 요소들을 가로로 배치
2. **Gap 속성** - disableSpacing prop으로 자식 간격 제어
3. **Padding** - 8px padding
4. **Alignment** - alignItems: center로 수직 중앙 정렬

---

## 핵심 학습 포인트

### 1. Flex Gap Property - 현대적인 간격 제어

```javascript
const styles = {
  display: 'flex',
  alignItems: 'center',
  padding: 8,
  gap: disableSpacing ? 0 : 8,
};
```

**학습 가치**:
- `gap` 속성 - flexbox의 자식 요소 간 간격을 간단하게 제어
- CSS selector (`& > :not(style) ~ :not(style)`) 없이 간단하게 구현
- 조건부 값: disableSpacing에 따라 0 또는 8
- 모던 브라우저에서 잘 지원됨 (IE 제외)

**왜 gap을 사용하는가**:
- **간단함**: 복잡한 CSS selector나 JavaScript 없이 한 줄로 해결
- **직관적**: gap의 의미가 명확하게 드러남
- **유연함**: flex-direction이 바뀌어도 자동으로 적용

### 2. Conditional Inline Styles - 조건부 스타일

```javascript
gap: disableSpacing ? 0 : 8,
```

**학습 가치**:
- prop 값에 따라 스타일 값 동적 변경
- 삼항 연산자로 간결하게 표현
- styled variants나 CSS 클래스 없이 구현

### 3. Minimal Props - 필수만 남기기

```javascript
const { disableSpacing = false, className, ...other } = props;
```

**학습 가치**:
- disableSpacing - 간격 제어
- className - 외부 스타일링 허용
- ...other - 나머지 props는 div로 전달 (onClick 등)

---

## 내부 구조

### 1. 렌더링 구조

```javascript
// 위치: packages/mui-material/src/CardActions/CardActions.js (25줄, 원본 99줄)

CardActions
  └─> div
       ├─ display: flex
       ├─ alignItems: center
       ├─ padding: 8
       ├─ gap: 0 or 8 (조건부)
       └─ children (Button 등)
```

### 2. Props

| 이름 | 타입 | 기본값 | 용도 |
|------|------|--------|------|
| `disableSpacing` | boolean | `false` | 자식 요소 간 간격 비활성화 |
| `className` | string | - | CSS 클래스 |
| `...other` | any | - | div로 전달되는 모든 props |

### 3. 스타일 객체

```javascript
const styles = {
  display: 'flex',
  alignItems: 'center',
  padding: 8,
  gap: disableSpacing ? 0 : 8,
};
```

### 4. 동작 흐름

#### 기본 렌더링 플로우

```
CardActions 컴포넌트 호출
        ↓
props 구조 분해 (disableSpacing, className)
        ↓
styles 객체 생성
 ├─ display: 'flex'
 ├─ alignItems: 'center'
 ├─ padding: 8
 └─ gap: disableSpacing ? 0 : 8
        ↓
div 렌더링
 ├─ ref 전달
 ├─ className 전달
 ├─ style={styles} 적용
 └─ ...other props 전달
```

#### 시나리오 예시

**시나리오 1: 기본 사용 (disableSpacing=false)**
```javascript
<CardActions>
  <Button>공유</Button>
  <Button>더 보기</Button>
</CardActions>

// 결과:
// gap: 8
// [Button 1] [8px gap] [Button 2]
```

**시나리오 2: disableSpacing=true**
```javascript
<CardActions disableSpacing>
  <Button>공유</Button>
  <Button>더 보기</Button>
</CardActions>

// 결과:
// gap: 0
// [Button 1][Button 2] (간격 없음)
```

**시나리오 3: justifyContent 변경**
```javascript
<CardActions style={{ justifyContent: 'flex-end' }}>
  <Button>취소</Button>
  <Button>확인</Button>
</CardActions>

// 결과:
// 버튼이 오른쪽 정렬됨
// [       ] [취소] [8px] [확인]
```

---

## 주요 변경 사항 (원본 대비)

**원본과의 차이**:
- ❌ `useDefaultProps()` 제거 → 함수 파라미터 기본값
- ❌ `styled()` 시스템 제거 → 인라인 스타일
- ❌ styled variants 제거 → 조건부 gap 값
- ❌ CSS selector (`& > :not(style) ~ :not(style)`) 제거 → gap 속성
- ❌ `ownerState` 제거 → 불필요한 중간 객체
- ❌ `useUtilityClasses()`, `composeClasses()` 제거 → className 직접 전달
- ❌ `clsx()` 제거 → className 단순 전달
- ❌ `PropTypes` 제거 → 런타임 검증 제거
- ✅ flex 레이아웃 유지
- ✅ disableSpacing prop 동작 유지
- ✅ alignItems: center 유지
- ✅ padding: 8 유지
- ✅ ref 전달 유지

---

## 커밋 히스토리로 보는 단순화 과정

CardActions는 **3개의 커밋**을 통해 단순화되었습니다.

### 1단계: useDefaultProps 제거

- `8aa2159e` - [CardActions 단순화 1/3] useDefaultProps 제거

**삭제된 코드**:
```javascript
import { useDefaultProps } from '../DefaultPropsProvider';

const CardActions = React.forwardRef(function CardActions(inProps, ref) {
  const props = useDefaultProps({
    props: inProps,
    name: 'MuiCardActions',
  });
```

**변경 후**:
```javascript
const CardActions = React.forwardRef(function CardActions(props, ref) {
  const { disableSpacing = false, className, ...other } = props;
```

**왜 불필요한가**:
- **학습 목적**: 테마 시스템의 defaultProps 병합은 개별 컴포넌트 학습과 무관
- **복잡도**: 테마 Context 구독 불필요

### 2단계: styled 시스템 제거

- `e096727e` - [CardActions 단순화 2/3] styled 시스템 제거

**삭제된 코드**:
```javascript
import { styled } from '../zero-styled';

const CardActionsRoot = styled('div', {
  name: 'MuiCardActions',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;
    return [styles.root, !ownerState.disableSpacing && styles.spacing];
  },
})({
  display: 'flex',
  alignItems: 'center',
  padding: 8,
  variants: [
    {
      props: { disableSpacing: false },
      style: {
        '& > :not(style) ~ :not(style)': {
          marginLeft: 8,
        },
      },
    },
  ],
});

<CardActionsRoot
  className={clsx(classes.root, className)}
  ownerState={ownerState}
  ref={ref}
  {...other}
/>
```

**변경 후**:
```javascript
const styles = {
  display: 'flex',
  alignItems: 'center',
  padding: 8,
  gap: disableSpacing ? 0 : 8,
};

<div
  ref={ref}
  className={clsx(classes.root, className)}
  style={styles}
  {...other}
/>
```

**왜 불필요한가**:
- **학습 목적**: CSS-in-JS 시스템 배우는 게 아님, 인라인 스타일이 더 직관적
- **복잡도**: CSS selector (`& > :not(style) ~ :not(style)`) 대신 gap 속성이 훨씬 간단
- **모던**: gap은 flexbox의 표준 속성으로 간격 제어의 현대적 방법

### 3단계: useUtilityClasses, composeClasses, PropTypes 제거

- `b6a7942a` - [CardActions 단순화 3/3] useUtilityClasses, composeClasses, PropTypes 제거

**삭제된 코드**:
```javascript
import PropTypes from 'prop-types';
import clsx from 'clsx';
import composeClasses from '@mui/utils/composeClasses';
import { getCardActionsUtilityClass } from './cardActionsClasses';

const useUtilityClasses = (ownerState) => {
  const { classes, disableSpacing } = ownerState;

  const slots = {
    root: ['root', !disableSpacing && 'spacing'],
  };

  return composeClasses(slots, getCardActionsUtilityClass, classes);
};

const ownerState = { ...props, disableSpacing };
const classes = useUtilityClasses(ownerState);

className={clsx(classes.root, className)}

// PropTypes 블록 (~30줄)
CardActions.propTypes = { ... };
```

**변경 후**:
```javascript
// className 직접 사용, PropTypes 제거
className={className}
```

**왜 불필요한가**:
- **학습 목적**: CSS 클래스 기반 스타일링은 테마 시스템의 일부, 컴포넌트 동작과 무관
- **복잡도**: 단순한 className 전달에 추상화 레이어 불필요
- **PropTypes**: 실제 로직(25줄)보다 PropTypes(30줄)가 더 많았음

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 99줄 | 25줄 (75% 감소) |
| **Import 개수** | 6개 | 1개 |
| **styled 컴포넌트** | 1개 (CardActionsRoot) | ❌ |
| **CSS selector** | `& > :not(style) ~ :not(style)` | ❌ |
| **간격 구현** | CSS selector | `gap` 속성 |
| **styled variants** | ✅ | ❌ |
| **useDefaultProps** | ✅ | ❌ |
| **useUtilityClasses** | ✅ | ❌ |
| **clsx** | ✅ | ❌ |
| **PropTypes** | ✅ 30줄 | ❌ |
| **flex 레이아웃** | ✅ | ✅ 동일 |
| **disableSpacing** | ✅ | ✅ 동일 |
| **alignItems: center** | ✅ | ✅ 동일 |
| **padding: 8** | ✅ | ✅ 동일 |

---

## 학습 후 다음 단계

CardActions를 이해했다면:

1. **Card** - CardActions의 컨테이너
2. **CardContent** - 카드 내용 영역
3. **Button** - CardActions 안에 배치되는 버튼
4. **IconButton** - 아이콘 버튼

**예시: 기본 사용**
```javascript
<Card>
  <CardContent>
    <Typography variant="h5">카드 제목</Typography>
    <Typography>카드 내용</Typography>
  </CardContent>
  <CardActions>
    <Button size="small">공유</Button>
    <Button size="small">더 보기</Button>
  </CardActions>
</Card>
```

**예시: disableSpacing**
```javascript
<CardActions disableSpacing>
  <Button>버튼 1</Button>
  <Button>버튼 2</Button>
</CardActions>
```

**예시: 오른쪽 정렬**
```javascript
<CardActions style={{ justifyContent: 'flex-end' }}>
  <Button>취소</Button>
  <Button>확인</Button>
</CardActions>
```

**예시: 중앙 정렬**
```javascript
<CardActions style={{ justifyContent: 'center' }}>
  <Button>액션</Button>
</CardActions>
```

**예시: 양쪽 정렬**
```javascript
<CardActions style={{ justifyContent: 'space-between' }}>
  <Button>뒤로</Button>
  <Button>다음</Button>
</CardActions>
```

**예시: IconButton 사용**
```javascript
<CardActions>
  <IconButton>
    <FavoriteIcon />
  </IconButton>
  <IconButton>
    <ShareIcon />
  </IconButton>
</CardActions>
```

---

## 핵심 요약

CardActions는:
1. **flex 컨테이너** - 자식 요소를 가로로 배치
2. **gap 속성** - 현대적인 간격 제어 방법
3. **조건부 스타일** - disableSpacing prop으로 gap 값 제어
4. **최소 코드** - 25줄로 모든 기능 구현

**가장 중요한 학습 포인트**:
- **gap 속성의 위력**: CSS selector 없이 간격을 간단하게 제어
- **flex의 유연성**: justifyContent 등으로 배치를 쉽게 변경 가능
- **조건부 인라인 스타일**: props에 따라 스타일 값을 동적으로 변경

**gap vs CSS selector 비교**:

원본 (복잡):
```css
& > :not(style) ~ :not(style) {
  margin-left: 8px;
}
```

단순화 (간단):
```javascript
gap: disableSpacing ? 0 : 8
```

gap 속성이 훨씬 **간단하고, 읽기 쉽고, 유지보수하기 쉽습니다**!
