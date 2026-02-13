# CardMedia 컴포넌트

> component prop으로 다형성을 지원하는 미디어 표시 컴포넌트

---

## 이 문서의 목적

**이 문서는 단순화된 코드의 "설명서"입니다.**

Material-UI는 라이브러리 코드라서 복잡합니다. 단순화했더라도 코드만 보고는 이해하기 어려울 수 있습니다.
이 문서는 코드의 **동작 원리, 핵심 패턴, 왜 이렇게 구현했는지**를 상세히 설명하여 학습을 돕습니다.

---

## 무슨 기능을 하는가?

수정된 CardMedia는 **카드에 이미지, 비디오, 오디오 등의 미디어 콘텐츠를 표시**하는 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **Component 다형성** - component prop으로 div, img, video 등 자유롭게 선택
2. **이미지 표시 방식 선택** - background-image (div) 또는 img 요소
3. **미디어 타입별 스타일** - MEDIA_COMPONENTS, IMAGE_COMPONENTS로 구분
4. **조건부 스타일 병합** - 타입에 따라 적절한 스타일 적용

---

## 핵심 학습 포인트

### 1. Component Polymorphism Pattern - 다형성

```javascript
const Component = component;

return (
  <Component
    ref={ref}
    className={className}
    role={!isMediaComponent && image ? 'img' : undefined}
    style={composedStyle}
    src={isMediaComponent ? image || src : undefined}
    {...other}
  >
    {children}
  </Component>
);
```

**학습 가치**:
- component prop 값을 변수에 할당하여 JSX에서 동적으로 사용
- `<Component />` - 런타임에 div, img, video 등으로 변환
- 하나의 컴포넌트로 다양한 HTML 요소 렌더링 가능

### 2. Type-based Conditional Logic - 타입별 분기

```javascript
const MEDIA_COMPONENTS = ['video', 'audio', 'picture', 'iframe', 'img'];
const IMAGE_COMPONENTS = ['picture', 'img'];

const isMediaComponent = MEDIA_COMPONENTS.includes(component);
const isImageComponent = IMAGE_COMPONENTS.includes(component);
```

**학습 가치**:
- 타입을 상수 배열로 정의하여 명확한 분류
- `includes()` 메서드로 간단한 타입 체크
- isMediaComponent - src attribute를 사용하는 요소들
- isImageComponent - objectFit을 적용할 이미지 요소들

### 3. Conditional Style Composition - 조건부 스타일 병합

```javascript
const composedStyle = {
  ...styles.root,
  ...(isMediaComponent && styles.media),
  ...(isImageComponent && styles.img),
  ...(!isMediaComponent && image && { backgroundImage: `url("${image}")` }),
  ...style,
};
```

**학습 가치**:
- spread 연산자로 여러 스타일 객체 병합
- `...(condition && object)` - 조건이 true일 때만 스타일 추가
- 우선순위: root → media → img → backgroundImage → 사용자 style
- 나중에 오는 스타일이 이전 스타일 오버라이드

### 4. Conditional Prop Mapping - 조건부 prop 전달

```javascript
<Component
  role={!isMediaComponent && image ? 'img' : undefined}
  src={isMediaComponent ? image || src : undefined}
  {...other}
>
```

**학습 가치**:
- **role="img"**: 배경 이미지로 표시될 때 접근성을 위해 추가
- **src attribute**: media 컴포넌트일 때만 전달 (image 또는 src prop 사용)
- `undefined` 전달 시 HTML에 해당 attribute가 렌더링되지 않음

---

## 내부 구조

### 1. 렌더링 구조

```javascript
// 위치: packages/mui-material/src/CardMedia/CardMedia.js (53줄, 원본 143줄)

CardMedia
  └─> Component (component prop 값)
       ├─ ref 전달
       ├─ className 전달
       ├─ role (조건부)
       ├─ style (조건부 병합)
       ├─ src (조건부)
       └─ children
```

### 2. Props

| 이름 | 타입 | 기본값 | 용도 |
|------|------|--------|------|
| `component` | elementType | `'div'` | 루트 HTML 요소 타입 |
| `image` | string | - | 배경 이미지 URL (background-image) |
| `src` | string | - | 미디어 소스 URL (src attribute) |
| `children` | node | - | 자식 요소 (오버레이 등) |
| `className` | string | - | CSS 클래스 |
| `style` | object | - | 인라인 스타일 |
| `...other` | any | - | Component로 전달되는 모든 props |

### 3. 상수

```javascript
const MEDIA_COMPONENTS = ['video', 'audio', 'picture', 'iframe', 'img'];
const IMAGE_COMPONENTS = ['picture', 'img'];

const styles = {
  root: {
    display: 'block',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  },
  media: {
    width: '100%',
  },
  img: {
    objectFit: 'cover',
  },
};
```

### 4. 동작 흐름

#### 기본 렌더링 플로우

```
CardMedia 컴포넌트 호출
        ↓
props 구조 분해 (component, image, src 등)
        ↓
타입 판별
 ├─ isMediaComponent = MEDIA_COMPONENTS.includes(component)
 └─ isImageComponent = IMAGE_COMPONENTS.includes(component)
        ↓
조건부 스타일 병합
 ├─ root 스타일
 ├─ isMediaComponent → media 스타일 추가
 ├─ isImageComponent → img 스타일 추가
 ├─ !isMediaComponent && image → backgroundImage 추가
 └─ 사용자 style 병합
        ↓
Component 변수에 component prop 할당
        ↓
렌더링
 ├─ ref, className 전달
 ├─ role (조건부)
 ├─ style (조건부 병합)
 ├─ src (조건부)
 └─ children
```

#### 시나리오 예시

**시나리오 1: 배경 이미지 (div)**
```javascript
<CardMedia
  image="/image.jpg"
  style={{ height: 140 }}
/>

// 결과:
// - component = 'div'
// - isMediaComponent = false
// - isImageComponent = false
// - composedStyle = {
//     ...styles.root,
//     backgroundImage: 'url("/image.jpg")',
//     height: 140,
//   }
// - role = 'img'
// - src = undefined
```

**시나리오 2: img 요소**
```javascript
<CardMedia
  component="img"
  image="/image.jpg"
  alt="설명"
/>

// 결과:
// - component = 'img'
// - isMediaComponent = true
// - isImageComponent = true
// - composedStyle = {
//     ...styles.root,
//     ...styles.media,  // width: 100%
//     ...styles.img,    // objectFit: cover
//   }
// - role = undefined (img는 자체적으로 role 가짐)
// - src = '/image.jpg'
```

**시나리오 3: video 요소**
```javascript
<CardMedia
  component="video"
  src="/video.mp4"
  controls
/>

// 결과:
// - component = 'video'
// - isMediaComponent = true
// - isImageComponent = false
// - composedStyle = {
//     ...styles.root,
//     ...styles.media,  // width: 100%
//   }
// - role = undefined
// - src = '/video.mp4'
// - controls attribute 전달됨
```

**시나리오 4: iframe (YouTube)**
```javascript
<CardMedia
  component="iframe"
  src="https://www.youtube.com/embed/..."
  style={{ height: 315 }}
/>

// 결과:
// - component = 'iframe'
// - isMediaComponent = true
// - isImageComponent = false
// - composedStyle = {
//     ...styles.root,
//     ...styles.media,  // width: 100%
//     height: 315,
//   }
// - role = undefined
// - src = 'https://www.youtube.com/embed/...'
```

---

## 주요 변경 사항 (원본 대비)

**원본과의 차이**:
- ❌ `useDefaultProps()` 제거 → 함수 파라미터로 props 직접 받기
- ❌ `styled()` 시스템 제거 → 인라인 스타일 객체
- ❌ styled variants 제거 → 조건부 스타일 병합
- ❌ `as` prop 제거 → Component 변수 사용
- ❌ `ownerState` 제거 → 불필요한 중간 객체
- ❌ `useUtilityClasses()`, `composeClasses()` 제거 → className 직접 전달
- ❌ `clsx()` 제거 → className 단순 전달
- ❌ `PropTypes` 제거 → 런타임 검증 제거
- ✅ component 다형성 유지
- ✅ MEDIA_COMPONENTS, IMAGE_COMPONENTS 로직 유지
- ✅ image → backgroundImage 변환 유지
- ✅ src → src attribute 전달 유지
- ✅ role="img" 접근성 유지
- ✅ ref 전달 유지

---

## 커밋 히스토리로 보는 단순화 과정

CardMedia는 **3개의 커밋**을 통해 단순화되었습니다 (Slot 시스템 없음).

### 1단계: useDefaultProps 제거

- `87e8e3f3` - [CardMedia 단순화 1/3] useDefaultProps 제거

**삭제된 코드**:
```javascript
import { useDefaultProps } from '../DefaultPropsProvider';

const CardMedia = React.forwardRef(function CardMedia(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuiCardMedia' });
```

**변경 후**:
```javascript
const CardMedia = React.forwardRef(function CardMedia(props, ref) {
  const { children, className, component = 'div', image, src, style, ...other } = props;
```

**왜 불필요한가**:
- **학습 목적**: 테마 시스템의 defaultProps 병합은 개별 컴포넌트 학습과 무관
- **복잡도**: 테마 Context 구독 불필요

### 2단계: styled 시스템 제거

- `a19eb450` - [CardMedia 단순화 2/3] styled 시스템 제거

**삭제된 코드**:
```javascript
import { styled } from '../zero-styled';

const CardMediaRoot = styled('div', {
  name: 'MuiCardMedia',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;
    const { isMediaComponent, isImageComponent } = ownerState;
    return [styles.root, isMediaComponent && styles.media, isImageComponent && styles.img];
  },
})({
  display: 'block',
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  variants: [
    {
      props: { isMediaComponent: true },
      style: { width: '100%' },
    },
    {
      props: { isImageComponent: true },
      style: { objectFit: 'cover' },
    },
  ],
});

<CardMediaRoot
  className={clsx(classes.root, className)}
  as={component}
  role={!isMediaComponent && image ? 'img' : undefined}
  ref={ref}
  style={composedStyle}
  ownerState={ownerState}
  src={isMediaComponent ? image || src : undefined}
  {...other}
>
  {children}
</CardMediaRoot>
```

**변경 후**:
```javascript
const MEDIA_COMPONENTS = ['video', 'audio', 'picture', 'iframe', 'img'];
const IMAGE_COMPONENTS = ['picture', 'img'];

const styles = {
  root: {
    display: 'block',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  },
  media: {
    width: '100%',
  },
  img: {
    objectFit: 'cover',
  },
};

const isMediaComponent = MEDIA_COMPONENTS.includes(component);
const isImageComponent = IMAGE_COMPONENTS.includes(component);

const composedStyle = {
  ...styles.root,
  ...(isMediaComponent && styles.media),
  ...(isImageComponent && styles.img),
  ...(!isMediaComponent && image && { backgroundImage: `url("${image}")` }),
  ...style,
};

const Component = component;

<Component
  ref={ref}
  className={clsx(classes.root, className)}
  role={!isMediaComponent && image ? 'img' : undefined}
  style={composedStyle}
  src={isMediaComponent ? image || src : undefined}
  {...other}
>
  {children}
</Component>
```

**왜 불필요한가**:
- **학습 목적**: CSS-in-JS 시스템 배우는 게 아님, 인라인 스타일이 더 직관적
- **복잡도**: styled variants 대신 조건부 스타일 병합이 더 명확
- **as prop**: Component 변수로 충분히 다형성 구현 가능

### 3단계: useUtilityClasses, composeClasses, PropTypes 제거

- `aad3ab1b` - [CardMedia 단순화 3/3] useUtilityClasses, composeClasses, PropTypes 제거

**삭제된 코드**:
```javascript
import PropTypes from 'prop-types';
import clsx from 'clsx';
import chainPropTypes from '@mui/utils/chainPropTypes';
import composeClasses from '@mui/utils/composeClasses';
import { getCardMediaUtilityClass } from './cardMediaClasses';

const useUtilityClasses = (ownerState) => {
  const { classes, isMediaComponent, isImageComponent } = ownerState;

  const slots = {
    root: ['root', isMediaComponent && 'media', isImageComponent && 'img'],
  };

  return composeClasses(slots, getCardMediaUtilityClass, classes);
};

const ownerState = {
  ...props,
  component,
  isMediaComponent,
  isImageComponent,
};

const classes = useUtilityClasses(ownerState);

className={clsx(classes.root, className)}

// PropTypes 블록 (~54줄)
CardMedia.propTypes = { ... };
```

**변경 후**:
```javascript
// className 직접 사용, PropTypes 제거
className={className}
```

**왜 불필요한가**:
- **학습 목적**: CSS 클래스 기반 스타일링은 테마 시스템의 일부, 컴포넌트 동작과 무관
- **복잡도**: 단순한 className 전달에 추상화 레이어 불필요
- **ownerState**: isMediaComponent, isImageComponent를 직접 계산하므로 ownerState 객체 불필요
- **PropTypes**: 실제 로직(53줄)보다 PropTypes(54줄)가 비슷한 비중

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 143줄 | 53줄 (63% 감소) |
| **Import 개수** | 7개 | 1개 |
| **styled 컴포넌트** | 1개 (CardMediaRoot) | ❌ |
| **styled variants** | ✅ | ❌ |
| **useDefaultProps** | ✅ | ❌ |
| **useUtilityClasses** | ✅ | ❌ |
| **clsx** | ✅ | ❌ |
| **chainPropTypes** | ✅ | ❌ |
| **PropTypes** | ✅ 54줄 | ❌ |
| **component 다형성** | ✅ as prop | ✅ Component 변수 |
| **타입별 스타일** | ✅ variants | ✅ 조건부 병합 |
| **image → backgroundImage** | ✅ | ✅ 동일 |
| **src attribute** | ✅ | ✅ 동일 |
| **role="img"** | ✅ | ✅ 동일 |

---

## 학습 후 다음 단계

CardMedia를 이해했다면:

1. **Card** - CardMedia의 컨테이너
2. **CardContent** - 카드 내용 영역
3. **CardActions** - 카드 하단 버튼 영역
4. **CardActionArea** - 카드를 클릭 가능하게 만드는 래퍼

**예시: 배경 이미지**
```javascript
<Card>
  <CardMedia
    image="/image.jpg"
    style={{ height: 140 }}
  />
  <CardContent>
    <Typography variant="h5">제목</Typography>
    <Typography>내용</Typography>
  </CardContent>
</Card>
```

**예시: img 요소**
```javascript
<Card>
  <CardMedia
    component="img"
    height="140"
    image="/image.jpg"
    alt="설명"
  />
  <CardContent>
    <Typography>내용</Typography>
  </CardContent>
</Card>
```

**예시: video 요소**
```javascript
<Card>
  <CardMedia
    component="video"
    src="/video.mp4"
    controls
    style={{ height: 300 }}
  />
  <CardContent>
    <Typography>비디오 설명</Typography>
  </CardContent>
</Card>
```

**예시: iframe (YouTube)**
```javascript
<Card>
  <CardMedia
    component="iframe"
    src="https://www.youtube.com/embed/VIDEO_ID"
    title="YouTube video"
    style={{ height: 315 }}
  />
  <CardContent>
    <Typography>동영상 제목</Typography>
  </CardContent>
</Card>
```

**예시: 오버레이**
```javascript
<Card>
  <CardMedia
    image="/image.jpg"
    style={{ height: 200, position: 'relative' }}
  >
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      color: 'white',
      padding: '10px',
    }}>
      <Typography>오버레이 텍스트</Typography>
    </div>
  </CardMedia>
</Card>
```

---

## 핵심 요약

CardMedia는:
1. **Component 다형성** - component prop으로 다양한 HTML 요소 렌더링
2. **조건부 스타일 병합** - 타입에 따라 적절한 스타일 적용
3. **조건부 prop 매핑** - image/src prop을 backgroundImage 또는 src attribute로 변환
4. **접근성 고려** - 배경 이미지 사용 시 role="img" 추가

**가장 중요한 학습 포인트**:
- Component 다형성 패턴으로 하나의 컴포넌트로 여러 HTML 요소 렌더링
- 타입별 분기 로직으로 미디어 타입에 맞는 처리
- spread 연산자를 활용한 조건부 스타일 병합
- 조건부 prop 전달로 HTML attribute 제어
