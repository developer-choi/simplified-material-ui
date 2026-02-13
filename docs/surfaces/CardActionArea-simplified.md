# CardActionArea 컴포넌트

> ButtonBase를 확장하여 카드를 클릭 가능하게 만드는 단순한 래퍼

---

## 이 문서의 목적

**이 문서는 단순화된 코드의 "설명서"입니다.**

Material-UI는 라이브러리 코드라서 복잡합니다. 단순화했더라도 코드만 보고는 이해하기 어려울 수 있습니다.
이 문서는 코드의 **동작 원리, 핵심 패턴, 왜 이렇게 구현했는지**를 상세히 설명하여 학습을 돕습니다.

---

## 무슨 기능을 하는가?

수정된 CardActionArea는 **ButtonBase를 확장하여 카드 전체를 클릭 가능하게 만들고, hover/focus 시 시각적 피드백을 제공**하는 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **ButtonBase 래핑** - 클릭 가능 + 리플 효과 + 키보드 접근성
2. **FocusHighlight 오버레이** - hover 시 0.04 opacity, focus 시 0.12 opacity
3. **이벤트 핸들러 기반 상호작용** - onMouseEnter/Leave, onFocus/Blur로 opacity 제어
4. **인라인 스타일** - 고정된 스타일 객체 사용

---

## 핵심 학습 포인트

### 1. ButtonBase Extension Pattern - 최소한의 확장

```javascript
const CardActionArea = React.forwardRef(function CardActionArea(props, ref) {
  const {
    children,
    className,
    focusVisibleClassName,
    ...other
  } = props;

  return (
    <ButtonBase
      ref={ref}
      className={className}
      style={styles.root}
      focusVisibleClassName={focusVisibleClassName}
      onMouseEnter={...}
      onMouseLeave={...}
      onFocus={...}
      onBlur={...}
      {...other}
    >
      {children}
      <span data-focus-highlight style={styles.focusHighlight} />
    </ButtonBase>
  );
});
```

**학습 가치**:
- 기존 컴포넌트(ButtonBase)를 확장하는 가장 간단한 방법
- ButtonBase의 모든 기능(리플, 키보드 접근성, focus-visible)을 그대로 상속
- 추가로 필요한 것만 구현 (hover/focus 오버레이)

### 2. Overlay Pattern - 절대 위치 오버레이

```javascript
const styles = {
  root: {
    display: 'block',
    textAlign: 'inherit',
    borderRadius: 'inherit',
    width: '100%',
  },
  focusHighlight: {
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
    transition: 'opacity 250ms',
  },
};
```

**학습 가치**:
- `position: absolute` + `top/right/bottom/left: 0` - 부모 전체를 덮는 오버레이
- `pointerEvents: none` - 클릭 이벤트가 부모(ButtonBase)로 전달
- `opacity: 0` - 기본 투명, 이벤트로 변경
- `backgroundColor: currentcolor` - 현재 텍스트 색상 사용
- `transition: opacity 250ms` - 부드러운 애니메이션

### 3. Event-based Interaction - DOM 직접 조작

```javascript
onMouseEnter={(e) => {
  const highlight = e.currentTarget.querySelector('[data-focus-highlight]');
  if (highlight) highlight.style.opacity = '0.04';
}}
onMouseLeave={(e) => {
  const highlight = e.currentTarget.querySelector('[data-focus-highlight]');
  if (highlight) highlight.style.opacity = '0';
}}
onFocus={(e) => {
  const highlight = e.currentTarget.querySelector('[data-focus-highlight]');
  if (highlight) highlight.style.opacity = '0.12';
}}
onBlur={(e) => {
  const highlight = e.currentTarget.querySelector('[data-focus-highlight]');
  if (highlight) highlight.style.opacity = '0';
}}
```

**학습 가치**:
- CSS selector 대신 이벤트 핸들러로 상호작용 구현
- `querySelector('[data-focus-highlight]')` - data attribute로 요소 찾기
- `highlight.style.opacity` - 직접 DOM 조작
- hover: 0.04, focus: 0.12 - Material Design의 표준 opacity 값
- 상태 관리 없이 간단하게 구현

### 4. data-* Attribute - 요소 식별

```javascript
<span data-focus-highlight style={styles.focusHighlight} />
```

**학습 가치**:
- `data-focus-highlight` - 커스텀 data attribute로 요소 마킹
- `querySelector`로 쉽게 찾을 수 있음
- CSS 클래스보다 명확한 의미 전달

---

## 내부 구조

### 1. 렌더링 구조

```javascript
// 위치: packages/mui-material/src/CardActionArea/CardActionArea.js (66줄, 원본 164줄)

CardActionArea
  └─> ButtonBase
       ├─ style={styles.root} (display: block, width: 100%)
       ├─ onMouseEnter/Leave (opacity 0.04/0)
       ├─ onFocus/Blur (opacity 0.12/0)
       ├─ children
       └─ <span data-focus-highlight> (절대 위치 오버레이)
```

### 2. Props

| 이름 | 타입 | 기본값 | 용도 |
|------|------|--------|------|
| `children` | node | - | 카드 내용 |
| `className` | string | - | CSS 클래스 전달 |
| `focusVisibleClassName` | string | - | ButtonBase의 focus-visible 클래스 |
| `...other` | any | - | ButtonBase로 전달되는 모든 props |

**ButtonBase로부터 사용 가능한 Props**:
- `onClick`, `onFocus`, `onBlur` 등 이벤트 핸들러
- `disabled` - 비활성화
- `component` - 루트 엘리먼트 타입
- `centerRipple`, `disableRipple` - 리플 효과 제어
- `TouchRippleProps` - 리플 커스터마이징

### 3. 동작 흐름

#### 기본 렌더링 플로우

```
CardActionArea 컴포넌트 호출
        ↓
props 구조 분해 (children, className, focusVisibleClassName 추출)
        ↓
ButtonBase 렌더링
 ├─ ref, className, focusVisibleClassName 전달
 ├─ style={styles.root} 적용
 ├─ 이벤트 핸들러 등록 (onMouseEnter/Leave, onFocus/Blur)
 ├─ children 렌더링
 └─ <span data-focus-highlight> 오버레이 렌더링
```

#### 시나리오 예시

**시나리오 1: 마우스 hover**
```
1. 사용자가 마우스를 CardActionArea 위로 가져감
2. onMouseEnter 이벤트 발생
3. querySelector로 [data-focus-highlight] 요소 찾기
4. highlight.style.opacity = '0.04' 설정
5. transition으로 250ms 동안 부드럽게 변경
6. 반투명 오버레이 표시

마우스가 떠나면:
7. onMouseLeave 이벤트 발생
8. highlight.style.opacity = '0' 설정
9. 오버레이 사라짐
```

**시나리오 2: 키보드 focus**
```
1. 사용자가 Tab 키로 CardActionArea에 포커스
2. ButtonBase가 .focusVisible 클래스 추가 (키보드 포커스만)
3. onFocus 이벤트 발생
4. highlight.style.opacity = '0.12' 설정
5. focus 오버레이 표시 (hover보다 더 진함)

포커스가 떠나면:
6. onBlur 이벤트 발생
7. highlight.style.opacity = '0' 설정
8. 오버레이 사라짐
```

**시나리오 3: 클릭**
```
1. 사용자가 CardActionArea 클릭
2. ButtonBase의 리플 효과 발생 (물결 애니메이션)
3. onClick 핸들러 실행 (props로 전달된 경우)
4. 오버레이는 pointerEvents: none이므로 클릭 방해 안 함
```

---

## 주요 변경 사항 (원본 대비)

**원본과의 차이**:
- ❌ `useSlot()` 제거 → styled 컴포넌트 직접 사용
- ❌ `useDefaultProps()` 제거 → 함수 파라미터로 props 직접 받기
- ❌ `styled()` 시스템 제거 → 인라인 스타일 객체
- ❌ `memoTheme()` 제거 → 고정 opacity/duration 값
- ❌ `useUtilityClasses()`, `composeClasses()` 제거 → className 직접 전달
- ❌ `clsx()` 제거 → className 단순 전달
- ❌ CSS selector 기반 상호작용 제거 → 이벤트 핸들러
- ❌ `PropTypes` 제거 → 런타임 검증 제거
- ✅ ButtonBase 래핑 유지
- ✅ hover/focus 오버레이 효과 유지
- ✅ opacity 값 유지 (hover: 0.04, focus: 0.12)
- ✅ transition 유지 (250ms)
- ✅ ref 전달 유지

---

## 커밋 히스토리로 보는 단순화 과정

CardActionArea는 **4개의 커밋**을 통해 단순화되었습니다.

### 1단계: Slot 시스템 제거

- `158ecd99` - [CardActionArea 단순화 1/4] Slot 시스템 제거

**삭제된 코드**:
```javascript
import useSlot from '../utils/useSlot';

const externalForwardedProps = {
  slots,
  slotProps,
};

const [RootSlot, rootProps] = useSlot('root', { ... });
const [FocusHighlightSlot, focusHighlightProps] = useSlot('focusHighlight', { ... });

return (
  <RootSlot {...rootProps}>
    {children}
    <FocusHighlightSlot {...focusHighlightProps} />
  </RootSlot>
);
```

**변경 후**:
```javascript
return (
  <CardActionAreaRoot ref={ref} className={clsx(classes.root, className)} {...other}>
    {children}
    <CardActionAreaFocusHighlight className={classes.focusHighlight} />
  </CardActionAreaRoot>
);
```

**왜 불필요한가**:
- **학습 목적**: Slot 시스템은 컴포넌트 교체 기능이지만 학습과 무관
- **복잡도**: 2개 useSlot 호출, externalForwardedProps 관리 불필요

### 2단계: useDefaultProps 제거

- `628f716a` - [CardActionArea 단순화 2/4] useDefaultProps 제거

**삭제된 코드**:
```javascript
import { useDefaultProps } from '../DefaultPropsProvider';

const CardActionArea = React.forwardRef(function CardActionArea(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuiCardActionArea' });
```

**변경 후**:
```javascript
const CardActionArea = React.forwardRef(function CardActionArea(props, ref) {
  const { children, className, focusVisibleClassName, ...other } = props;
```

**왜 불필요한가**:
- **학습 목적**: 테마 시스템의 defaultProps 병합은 개별 컴포넌트 학습과 무관
- **복잡도**: 테마 Context 구독 불필요

### 3단계: styled 시스템 및 memoTheme 제거

- `fdcbdfd5` - [CardActionArea 단순화 3/4] styled 시스템 및 memoTheme 제거

**삭제된 코드**:
```javascript
import { styled } from '../zero-styled';
import memoTheme from '../utils/memoTheme';

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
      '@media (hover: none)': { opacity: 0 },
    },
    [`&.${cardActionAreaClasses.focusVisible} .${cardActionAreaClasses.focusHighlight}`]: {
      opacity: (theme.vars || theme).palette.action.focusOpacity,
    },
  })),
);

const CardActionAreaFocusHighlight = styled('span', { ... })(...);
```

**변경 후**:
```javascript
import ButtonBase from '../../../form/ButtonBase';

const styles = {
  root: {
    display: 'block',
    textAlign: 'inherit',
    borderRadius: 'inherit',
    width: '100%',
  },
  focusHighlight: {
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
    transition: 'opacity 250ms',
  },
};

<ButtonBase
  ref={ref}
  style={styles.root}
  onMouseEnter={(e) => {
    const highlight = e.currentTarget.querySelector('[data-focus-highlight]');
    if (highlight) highlight.style.opacity = '0.04';
  }}
  onMouseLeave={(e) => {
    const highlight = e.currentTarget.querySelector('[data-focus-highlight]');
    if (highlight) highlight.style.opacity = '0';
  }}
  onFocus={(e) => {
    const highlight = e.currentTarget.querySelector('[data-focus-highlight]');
    if (highlight) highlight.style.opacity = '0.12';
  }}
  onBlur={(e) => {
    const highlight = e.currentTarget.querySelector('[data-focus-highlight]');
    if (highlight) highlight.style.opacity = '0';
  }}
  {...other}
>
  {children}
  <span data-focus-highlight style={styles.focusHighlight} />
</ButtonBase>
```

**왜 불필요한가**:
- **학습 목적**: CSS-in-JS 시스템 배우는 게 아님, 인라인 스타일이 더 직관적
- **복잡도**: CSS selector 기반 상호작용 대신 이벤트 핸들러가 더 명확
- **테마 의존성**: memoTheme 제거하여 테마 시스템 의존성 제거
- **고정 값**: opacity 0.04/0.12, transition 250ms 고정하여 단순화

### 4단계: useUtilityClasses, composeClasses, PropTypes 제거

- `e18e5100` - [CardActionArea 단순화 4/4] useUtilityClasses, composeClasses, PropTypes 제거

**삭제된 코드**:
```javascript
import PropTypes from 'prop-types';
import clsx from 'clsx';
import composeClasses from '@mui/utils/composeClasses';
import cardActionAreaClasses, { getCardActionAreaUtilityClass } from './cardActionAreaClasses';

const useUtilityClasses = (ownerState) => {
  const { classes } = ownerState;
  const slots = {
    root: ['root'],
    focusHighlight: ['focusHighlight'],
  };
  return composeClasses(slots, getCardActionAreaUtilityClass, classes);
};

const ownerState = props;
const classes = useUtilityClasses(ownerState);

<ButtonBase
  className={clsx(classes.root, className)}
  focusVisibleClassName={clsx(focusVisibleClassName, classes.focusVisible)}
  ...
>
  <span ... className={classes.focusHighlight} />
</ButtonBase>

CardActionArea.propTypes = { ... }; // 29줄
```

**변경 후**:
```javascript
<ButtonBase
  className={className}
  focusVisibleClassName={focusVisibleClassName}
  ...
>
  <span data-focus-highlight style={styles.focusHighlight} />
</ButtonBase>
```

**왜 불필요한가**:
- **학습 목적**: CSS 클래스 기반 스타일링은 테마 시스템의 일부, 컴포넌트 동작과 무관
- **복잡도**: 단순한 className 전달에 추상화 레이어 불필요
- **PropTypes**: 실제 로직(66줄)보다 PropTypes(29줄)가 거의 절반

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 164줄 | 66줄 (60% 감소) |
| **Import 개수** | 10개 | 2개 |
| **styled 컴포넌트** | 2개 (Root, FocusHighlight) | ❌ |
| **useSlot** | 2개 | ❌ |
| **useDefaultProps** | ✅ | ❌ |
| **useUtilityClasses** | ✅ | ❌ |
| **memoTheme** | ✅ | ❌ |
| **clsx** | ✅ | ❌ |
| **PropTypes** | ✅ 29줄 | ❌ |
| **ButtonBase 래핑** | ✅ | ✅ 동일 |
| **hover 효과** | ✅ CSS selector | ✅ 이벤트 핸들러 |
| **focus 효과** | ✅ CSS selector | ✅ 이벤트 핸들러 |
| **opacity 값** | ✅ 테마 기반 | ✅ 고정 (0.04/0.12) |
| **transition** | ✅ 테마 기반 | ✅ 고정 (250ms) |

---

## 학습 후 다음 단계

CardActionArea를 이해했다면:

1. **ButtonBase** - CardActionArea의 기반 컴포넌트. 리플 효과, 키보드 접근성 이해
2. **Card** - CardActionArea와 함께 사용하는 컨테이너
3. **CardContent** - 카드 내용 영역 (padding 적용)
4. **CardMedia** - 카드 이미지/비디오 영역

**예시: 기본 사용**
```javascript
<Card>
  <CardActionArea>
    <CardContent>
      <Typography variant="h5">클릭 가능한 카드</Typography>
      <Typography>카드 내용</Typography>
    </CardContent>
  </CardActionArea>
</Card>
```

**예시: onClick 핸들러**
```javascript
<Card>
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
</Card>
```

**예시: disabled 상태**
```javascript
<Card>
  <CardActionArea disabled>
    <CardContent>
      <Typography>비활성화된 카드</Typography>
    </CardContent>
  </CardActionArea>
</Card>
```

**예시: 커스텀 리플**
```javascript
<Card>
  <CardActionArea
    centerRipple
    TouchRippleProps={{
      style: { color: 'red' },
    }}
  >
    <CardContent>
      <Typography>빨간 리플 효과</Typography>
    </CardContent>
  </CardActionArea>
</Card>
```

---

## 핵심 요약

CardActionArea는:
1. **ButtonBase의 단순 확장** - 리플, 키보드 접근성 모두 상속
2. **이벤트 기반 상호작용** - hover/focus 시 opacity 변경
3. **절대 위치 오버레이** - pointerEvents: none으로 클릭 방해 안 함
4. **고정 값 사용** - opacity 0.04/0.12, transition 250ms

**가장 중요한 학습 포인트**:
- 기존 컴포넌트를 확장할 때 필요한 것만 추가하고 나머지는 위임
- 오버레이 패턴으로 시각적 피드백 제공
- 이벤트 핸들러로 직접 DOM 조작하여 간단하게 구현
