# ImageListItem 컴포넌트

> ImageList의 자식 아이템을 담당하는 단순화된 컴포넌트

---

## 이 문서의 목적

**이 문서는 단순화된 코드의 "설명서"입니다.**

Material-UI는 라이브러리 코드라서 복잡합니다. 단순화했더라도 코드만 보고는 이해하기 어려울 수 있습니다.
이 문서는 코드의 **동작 원리, 핵심 패턴, 왜 이렇게 구현했는지**를 상세히 설명하여 학습을 돕습니다.

---

## 무슨 기능을 하는가?

단순화된 ImageListItem은 **ImageList의 자식 아이템으로, 그리드 크기를 제어하고 이미지를 올바르게 표시**하는 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **Context에서 부모 설정 읽기** - ImageListContext에서 rowHeight, gap, variant 가져오기
2. **동적 높이 계산** - rowHeight * rows + gap * (rows - 1)
3. **그리드 크기 제어** - cols, rows prop으로 gridColumnEnd, gridRowEnd 설정
4. **variant별 스타일** - standard (flex column), woven (height 100%), masonry (breakInside)
5. **img 자동 스타일 적용** - React.Children.map + cloneElement로 img에 style 추가
6. **Component 다형성** - component prop으로 li, div 등 선택 가능

### 변경된 기능
- ❌ **:nth-of-type(even)** (woven variant) 제거 - 인라인 스타일로 구현 불가
- ❌ **Fragment 검증** 제거 - dev only, 학습 목적상 불필요
- ❌ **isMuiElement, Image 컴포넌트 지원** 제거 - 복잡도 감소
- ✅ img에 className → style로 변경

---

## 핵심 학습 포인트

### 1. Context Consumer Pattern - 부모 설정 읽기

```javascript
const { rowHeight = 'auto', gap, variant } = React.useContext(ImageListContext);
```

**학습 가치**:
- 부모 ImageList의 설정을 Context로 받아옴
- prop drilling 없이 깊은 자식이 부모 설정 접근
- rowHeight, gap, variant를 기반으로 자신의 스타일 계산

### 2. Dynamic Height Calculation - 동적 높이 계산

```javascript
let height = 'auto';
if (variant === 'woven') {
  height = undefined;
} else if (rowHeight !== 'auto') {
  height = rowHeight * rows + gap * (rows - 1);
}
```

**학습 가치**:
- **woven**: `undefined` (CSS에서 제어)
- **rowHeight === 'auto'**: `'auto'` (이미지 원본 비율)
- **rowHeight이 숫자**: `rowHeight * rows + gap * (rows - 1)`
  - 예: rowHeight=100, rows=2, gap=4 → height = 100*2 + 4*1 = 204
- **왜 gap * (rows - 1)?** - rows=2일 때 gap은 1개만 필요 (아이템 사이)

### 3. Variant-based Style Composition - 조건부 스타일 합성

```javascript
const baseStyles = {
  display: variant === 'standard' ? 'flex' : 'block',
  flexDirection: variant === 'standard' ? 'column' : undefined,
  position: 'relative',
};

const wovenStyles = variant === 'woven' ? {
  height: '100%',
  alignSelf: 'center',
} : {};

const itemStyle = {
  ...baseStyles,
  ...wovenStyles,
  height,
  gridColumnEnd: variant !== 'masonry' ? `span ${cols}` : undefined,
  gridRowEnd: variant !== 'masonry' ? `span ${rows}` : undefined,
  marginBottom: variant === 'masonry' ? gap : undefined,
  breakInside: variant === 'masonry' ? 'avoid' : undefined,
  ...style,
};
```

**학습 가치**:
- 기본 스타일 + variant별 스타일 + 그리드 제어 + 사용자 스타일 순차 병합
- variant에 따라 완전히 다른 레이아웃
- **standard**: flex column (ImageListItemBar 하단 배치)
- **woven**: height 100%, alignSelf center
- **masonry**: marginBottom, breakInside

### 4. Children Manipulation Pattern - 자식 요소 조작

```javascript
{React.Children.map(children, (child) => {
  if (!React.isValidElement(child)) {
    return null;
  }

  if (child.type === 'img') {
    return React.cloneElement(child, {
      style: {
        ...imgStyles,
        ...child.props.style,
      },
    });
  }

  return child;
})}
```

**학습 가치**:
- `React.Children.map`으로 모든 자식 순회
- **img 요소 찾기** - `child.type === 'img'`
- `React.cloneElement`로 style 추가/병합
- 사용자가 전달한 img에 자동으로 스타일 적용
- **왜 필요한가?** - img에 `objectFit: cover`, `width: 100%` 등 스타일 적용하여 올바른 레이아웃

### 5. Grid Span Control - CSS Grid 크기 제어

```javascript
gridColumnEnd: variant !== 'masonry' ? `span ${cols}` : undefined,
gridRowEnd: variant !== 'masonry' ? `span ${rows}` : undefined,
```

**학습 가치**:
- `grid-column-end: span 2` - 2열 차지
- `grid-row-end: span 2` - 2행 차지
- quilted 레이아웃에서 아이템별 크기 다르게 설정
- masonry는 CSS Columns이므로 grid 속성 불필요

---

## 내부 구조

### 1. 렌더링 구조

```javascript
// 위치: packages/mui-material/src/ImageListItem/ImageListItem.js (76줄, 원본 204줄)

ImageListItem
  ├─ Props destructuring (cols=1, rows=1, component='li')
  ├─ ImageListContext에서 rowHeight, gap, variant 읽기
  ├─ height 계산 (동적)
  ├─ baseStyles (display, flexDirection, position)
  ├─ wovenStyles (variant === 'woven')
  ├─ itemStyle (병합)
  ├─ imgStyles (img 요소용)
  │
  └─> Component (component prop 값, 기본 'li')
       ├─ style={itemStyle}
       ├─ className, ref, ...other
       │
       └─ React.Children.map
            ├─ img 요소 찾아서 style 추가
            └─ 나머지 자식 그대로 반환
```

### 2. Props

| 이름 | 타입 | 기본값 | 용도 |
|------|------|--------|------|
| `cols` | number | `1` | 차지할 열 개수 |
| `rows` | number | `1` | 차지할 행 개수 |
| `component` | elementType | `'li'` | 루트 HTML 요소 타입 |
| `className` | string | - | CSS 클래스 |
| `style` | object | - | 인라인 스타일 (itemStyle과 병합) |
| `children` | node | - | img 또는 ImageListItemBar |

### 3. 스타일 객체들

#### baseStyles (17-21줄)
```javascript
const baseStyles = {
  display: variant === 'standard' ? 'flex' : 'block',
  flexDirection: variant === 'standard' ? 'column' : undefined,
  position: 'relative',
};
```

#### wovenStyles (23-26줄)
```javascript
const wovenStyles = variant === 'woven' ? {
  height: '100%',
  alignSelf: 'center',
} : {};
```

#### itemStyle (28-37줄)
```javascript
const itemStyle = {
  ...baseStyles,
  ...wovenStyles,
  height,
  gridColumnEnd: variant !== 'masonry' ? `span ${cols}` : undefined,
  gridRowEnd: variant !== 'masonry' ? `span ${rows}` : undefined,
  marginBottom: variant === 'masonry' ? gap : undefined,
  breakInside: variant === 'masonry' ? 'avoid' : undefined,
  ...style,
};
```

#### imgStyles (39-45줄)
```javascript
const imgStyles = {
  objectFit: 'cover',
  width: '100%',
  height: variant === 'standard' ? 'auto' : '100%',
  flexGrow: variant === 'standard' ? 1 : undefined,
  display: 'block',
};
```

### 4. 동작 흐름

#### 기본 렌더링 플로우

```
ImageListItem 컴포넌트 호출
        ↓
props 구조 분해 (cols, rows, component, children)
        ↓
ImageListContext에서 rowHeight, gap, variant 읽기
        ↓
height 계산 (variant, rowHeight, rows, gap 조합)
        ↓
baseStyles 생성 (variant === 'standard' ? flex : block)
        ↓
wovenStyles 생성 (variant === 'woven')
        ↓
itemStyle 병합 (baseStyles + wovenStyles + grid + masonry + style)
        ↓
imgStyles 생성 (img 요소용)
        ↓
Component 변수 할당
        ↓
렌더링
 ├─ Component에 ref, className, style, ...other 전달
 └─ React.Children.map으로 img 찾아서 style 추가
```

#### 시나리오 예시

**시나리오 1: Standard Grid (기본)**
```javascript
<ImageList cols={3} rowHeight={164}>
  <ImageListItem>
    <img src="image1.jpg" alt="1" />
  </ImageListItem>
  <ImageListItem>
    <img src="image2.jpg" alt="2" />
  </ImageListItem>
</ImageList>

// ImageListItem 내부:
// rowHeight=164, gap=4, variant='standard' (Context에서 읽음)
// cols=1, rows=1 (기본값)
// height = 164*1 + 4*0 = 164
// display: flex, flexDirection: column
// img: objectFit: cover, width: 100%, height: auto, flexGrow: 1
```

**시나리오 2: Quilted (아이템별 크기 다름)**
```javascript
<ImageList cols={4} rowHeight={121} variant="quilted">
  <ImageListItem cols={2} rows={2}>
    <img src="large.jpg" alt="Large" />
  </ImageListItem>
  <ImageListItem>
    <img src="small.jpg" alt="Small" />
  </ImageListItem>
</ImageList>

// Large 아이템:
// rowHeight=121, gap=4, variant='quilted' (Context)
// cols=2, rows=2
// height = 121*2 + 4*1 = 246
// gridColumnEnd: span 2
// gridRowEnd: span 2

// Small 아이템:
// cols=1, rows=1 (기본값)
// height = 121*1 + 4*0 = 121
// gridColumnEnd: span 1
// gridRowEnd: span 1
```

**시나리오 3: Masonry**
```javascript
<ImageList variant="masonry" cols={3} gap={8}>
  <ImageListItem>
    <img src="tall-image.jpg" alt="Tall" />
  </ImageListItem>
</ImageList>

// ImageListItem 내부:
// variant='masonry' (Context)
// gridColumnEnd: undefined (masonry는 CSS Columns)
// gridRowEnd: undefined
// marginBottom: 8 (CSS Columns에서는 gap 수동 추가)
// breakInside: avoid (컬럼 중간에서 아이템 분리 방지)
```

**시나리오 4: img에 style 자동 추가**
```javascript
<ImageListItem>
  <img src="image.jpg" alt="Image" style={{ borderRadius: 8 }} />
</ImageListItem>

// React.Children.map 내부:
// child.type === 'img' 탐지
// React.cloneElement(img, {
//   style: {
//     ...imgStyles,  // objectFit: cover, width: 100%, ...
//     ...{ borderRadius: 8 },  // 사용자 스타일
//   }
// })

// 결과:
// <img
//   src="image.jpg"
//   alt="Image"
//   style={{
//     objectFit: 'cover',
//     width: '100%',
//     height: '100%',
//     display: 'block',
//     borderRadius: 8,  // 사용자 스타일 유지
//   }}
// />
```

---

## 주요 변경 사항 (원본 대비)

**원본과의 차이**:
- ❌ `useDefaultProps()` 제거 → 함수 파라미터 기본값
- ❌ `styled()` 시스템 제거 → 인라인 스타일 (baseStyles, wovenStyles, itemStyle, imgStyles)
- ❌ `useUtilityClasses()`, `composeClasses()` 제거 → className 직접 전달
- ❌ `clsx()` 제거 → className 단순 전달
- ❌ `ownerState` 제거 → 불필요한 중간 객체
- ❌ `:nth-of-type(even)` (woven variant) 제거 → 인라인 스타일로 구현 불가
- ❌ `Fragment 검증` 제거 → dev only, 학습 목적상 불필요
- ❌ `isMuiElement`, `Image 컴포넌트 지원` 제거 → 복잡도 감소
- ❌ `PropTypes` 제거 → 런타임 검증 제거
- ✅ ImageListContext 읽기 유지
- ✅ height 계산 로직 유지
- ✅ cols, rows props 유지 (gridColumnEnd, gridRowEnd)
- ✅ variant별 스타일 유지 (standard, woven, masonry)
- ✅ img 자동 스타일 적용 유지 (Children.map + cloneElement)
- ✅ Component 다형성 유지
- 🔄 img에 className → style로 변경

---

## 커밋 히스토리로 보는 단순화 과정

ImageListItem은 **3개의 커밋**을 통해 단순화되었습니다.

### 1단계: useDefaultProps 제거

- `479855f4` - [ImageListItem 단순화 1/3] useDefaultProps 제거

**삭제된 코드**:
```javascript
import { useDefaultProps } from '../DefaultPropsProvider';

const ImageListItem = React.forwardRef(function ImageListItem(inProps, ref) {
  const props = useDefaultProps({
    props: inProps,
    name: 'MuiImageListItem',
  });

  const { children, className, cols = 1, component = 'li', rows = 1, style, ...other } = props;
```

**변경 후**:
```javascript
const ImageListItem = React.forwardRef(function ImageListItem(props, ref) {
  const { children, className, cols = 1, component = 'li', rows = 1, style, ...other } = props;
```

**왜 불필요한가**:
- **학습 목적**: 테마 시스템의 defaultProps 병합은 개별 컴포넌트 학습과 무관
- **복잡도**: 테마 Context 구독 불필요
- props destructuring에 이미 기본값 존재

### 2단계: styled 시스템 제거

- `17e8435c` - [ImageListItem 단순화 2/3] styled 시스템 제거

**삭제된 코드**:
```javascript
import { styled } from '../zero-styled';
import imageListItemClasses from './imageListItemClasses';

const ImageListItemRoot = styled('li', {
  name: 'MuiImageListItem',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;
    return [
      { [`& .${imageListItemClasses.img}`]: styles.img },
      styles.root,
      styles[ownerState.variant],
    ];
  },
})({
  display: 'block',
  position: 'relative',
  [`& .${imageListItemClasses.img}`]: {
    objectFit: 'cover',
    width: '100%',
    height: '100%',
    display: 'block',
  },
  variants: [
    {
      props: { variant: 'standard' },
      style: {
        display: 'flex',
        flexDirection: 'column',
      },
    },
    {
      props: { variant: 'woven' },
      style: {
        height: '100%',
        alignSelf: 'center',
        '&:nth-of-type(even)': {
          height: '70%',
        },
      },
    },
    {
      props: { variant: 'standard' },
      style: {
        [`& .${imageListItemClasses.img}`]: {
          height: 'auto',
          flexGrow: 1,
        },
      },
    },
  ],
});

<ImageListItemRoot
  as={component}
  className={clsx(classes.root, classes[variant], className)}
  ref={ref}
  style={{
    height,
    gridColumnEnd: variant !== 'masonry' ? `span ${cols}` : undefined,
    gridRowEnd: variant !== 'masonry' ? `span ${rows}` : undefined,
    marginBottom: variant === 'masonry' ? gap : undefined,
    breakInside: variant === 'masonry' ? 'avoid' : undefined,
    ...style,
  }}
  ownerState={ownerState}
  {...other}
>
```

**변경 후**:
```javascript
const baseStyles = {
  display: variant === 'standard' ? 'flex' : 'block',
  flexDirection: variant === 'standard' ? 'column' : undefined,
  position: 'relative',
};

const wovenStyles = variant === 'woven' ? {
  height: '100%',
  alignSelf: 'center',
} : {};

const itemStyle = {
  ...baseStyles,
  ...wovenStyles,
  height,
  gridColumnEnd: variant !== 'masonry' ? `span ${cols}` : undefined,
  gridRowEnd: variant !== 'masonry' ? `span ${rows}` : undefined,
  marginBottom: variant === 'masonry' ? gap : undefined,
  breakInside: variant === 'masonry' ? 'avoid' : undefined,
  ...style,
};

const imgStyles = {
  objectFit: 'cover',
  width: '100%',
  height: variant === 'standard' ? 'auto' : '100%',
  flexGrow: variant === 'standard' ? 1 : undefined,
  display: 'block',
};

const Component = component;

<Component
  ref={ref}
  className={clsx(classes.root, classes[variant], className)}
  style={itemStyle}
  {...other}
>
```

**왜 불필요한가**:
- **학습 목적**: CSS-in-JS 시스템 배우는 게 아님, 인라인 스타일이 더 직관적
- **복잡도**: styled variants 대신 조건부 스타일로 명시적 구현
- **가독성**: baseStyles, wovenStyles, itemStyle, imgStyles 분리로 역할 명확화
- **:nth-of-type(even)**: 인라인 스타일로 구현 불가, 학습 목적상 기본 woven 스타일만으로 충분

### 3단계: useUtilityClasses, composeClasses, Fragment 검증, PropTypes 제거

- `cebbd4d0` - [ImageListItem 단순화 3/3] useUtilityClasses, composeClasses, Fragment 검증, PropTypes 제거

**삭제된 코드**:
```javascript
import PropTypes from 'prop-types';
import clsx from 'clsx';
import composeClasses from '@mui/utils/composeClasses';
import integerPropType from '@mui/utils/integerPropType';
import { isFragment } from 'react-is';
import isMuiElement from '../utils/isMuiElement';
import { getImageListItemUtilityClass } from './imageListItemClasses';

const useUtilityClasses = (ownerState) => {
  const { classes, variant } = ownerState;

  const slots = {
    root: ['root', variant],
    img: ['img'],
  };

  return composeClasses(slots, getImageListItemUtilityClass, classes);
};

const ownerState = {
  ...props,
  cols,
  component,
  gap,
  rowHeight,
  rows,
  variant,
};

const classes = useUtilityClasses(ownerState);

className={clsx(classes.root, classes[variant], className)}

// Fragment 검증 (dev only)
if (process.env.NODE_ENV !== 'production') {
  if (isFragment(child)) {
    console.error(
      [
        "MUI: The ImageListItem component doesn't accept a Fragment as a child.",
        'Consider providing an array instead.',
      ].join('\n'),
    );
  }
}

// img className 추가
if (child.type === 'img' || isMuiElement(child, ['Image'])) {
  return React.cloneElement(child, {
    className: clsx(classes.img, child.props.className),
  });
}

// PropTypes 블록 (~44줄)
ImageListItem.propTypes = { ... };
```

**변경 후**:
```javascript
// className 직접 사용
className={className}

// img에 style 직접 추가 (className 대신)
if (child.type === 'img') {
  return React.cloneElement(child, {
    style: {
      ...imgStyles,
      ...child.props.style,
    },
  });
}
```

**왜 불필요한가**:
- **학습 목적**: CSS 클래스 기반 스타일링은 테마 시스템의 일부, 컴포넌트 동작과 무관
- **복잡도**: 단순한 className 전달에 추상화 레이어 불필요
- **Fragment 검증**: dev only, 학습 목적상 불필요
- **isMuiElement**: Image 컴포넌트 지원 제거로 복잡도 감소
- **PropTypes**: 실제 로직(76줄)보다 PropTypes(44줄)가 많았음
- **img 처리**: className 대신 style 직접 전달로 단순화

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 204줄 | 76줄 (63% 감소) |
| **Import 개수** | 10개 | 2개 |
| **styled 컴포넌트** | 1개 (ImageListItemRoot) | ❌ |
| **인라인 스타일** | style (1개 객체) | baseStyles + wovenStyles + itemStyle + imgStyles (4개 객체) |
| **useDefaultProps** | ✅ | ❌ |
| **useUtilityClasses** | ✅ | ❌ |
| **clsx** | ✅ | ❌ |
| **ownerState** | ✅ | ❌ |
| **:nth-of-type(even)** | ✅ (woven) | ❌ |
| **Fragment 검증** | ✅ (dev only) | ❌ |
| **isMuiElement** | ✅ (Image 지원) | ❌ |
| **PropTypes** | ✅ 44줄 | ❌ |
| **ImageListContext** | ✅ | ✅ 동일 |
| **height 계산** | ✅ | ✅ 동일 |
| **cols, rows props** | ✅ | ✅ 동일 |
| **variant별 스타일** | ✅ | ✅ 동일 (standard, woven, masonry) |
| **img 자동 처리** | ✅ className | ✅ style |
| **Component 다형성** | ✅ as | ✅ Component 변수 |
| **ref 전달** | ✅ | ✅ 동일 |

---

## 학습 후 다음 단계

ImageListItem을 이해했다면:

1. **ImageList** - ImageListItem의 부모 컨테이너
2. **ImageListItemBar** - ImageListItem 위에 오버레이되는 타이틀 바
3. **ImageListContext** - Context 정의 (간단한 파일)

**예시: 기본 사용 (Standard)**
```javascript
<ImageList cols={3} rowHeight={164}>
  <ImageListItem>
    <img src="image1.jpg" alt="1" />
  </ImageListItem>
  <ImageListItem>
    <img src="image2.jpg" alt="2" />
  </ImageListItem>
</ImageList>
```

**예시: Quilted (아이템별 크기 다름)**
```javascript
<ImageList cols={4} rowHeight={121} variant="quilted">
  <ImageListItem cols={2} rows={2}>
    <img src="large.jpg" alt="Large" />
  </ImageListItem>
  <ImageListItem>
    <img src="small1.jpg" alt="Small 1" />
  </ImageListItem>
  <ImageListItem>
    <img src="small2.jpg" alt="Small 2" />
  </ImageListItem>
</ImageList>
```

**예시: Masonry**
```javascript
<ImageList variant="masonry" cols={3} gap={8}>
  <ImageListItem>
    <img src="tall-image.jpg" alt="Tall" />
  </ImageListItem>
  <ImageListItem>
    <img src="short-image.jpg" alt="Short" />
  </ImageListItem>
</ImageList>
```

**예시: ImageListItemBar와 함께**
```javascript
<ImageList cols={3}>
  <ImageListItem>
    <img src="image.jpg" alt="Image" />
    <ImageListItemBar
      title="Title"
      subtitle="Author"
    />
  </ImageListItem>
</ImageList>
```

**예시: 커스텀 스타일**
```javascript
<ImageListItem
  cols={2}
  rows={2}
  style={{ borderRadius: 8, overflow: 'hidden' }}
>
  <img
    src="image.jpg"
    alt="Image"
    style={{ filter: 'brightness(0.8)' }}
  />
</ImageListItem>
```

**예시: div 요소 사용**
```javascript
<ImageList component="div" cols={4}>
  <ImageListItem component="div">
    <img src="image1.jpg" alt="1" />
  </ImageListItem>
</ImageList>
```

---

## 핵심 요약

ImageListItem은:
1. **Context Consumer** - ImageListContext에서 부모 설정 읽기
2. **동적 높이 계산** - rowHeight * rows + gap * (rows - 1)
3. **그리드 크기 제어** - cols, rows로 gridColumnEnd, gridRowEnd 설정
4. **variant별 레이아웃** - standard (flex), woven (height 100%), masonry (breakInside)
5. **img 자동 처리** - Children.map + cloneElement로 style 추가
6. **76줄의 간결함** - 불필요한 복잡도 제거 (204줄 → 76줄, 63% 감소)

**가장 중요한 학습 포인트**:
- **Context 소비**: 부모 ImageList의 설정을 읽어서 자신의 스타일 계산
- **동적 계산**: rowHeight, rows, gap 조합으로 정확한 높이 계산
- **Children 조작**: img 찾아서 자동으로 스타일 적용 (objectFit, width, height)
- **Grid 제어**: cols, rows로 CSS Grid에서 차지할 영역 지정
- **스타일 합성**: baseStyles + wovenStyles + itemStyle + imgStyles 분리로 역할 명확화

**height 계산 공식 요약**:
- **woven**: `undefined` (CSS 제어)
- **rowHeight === 'auto'**: `'auto'` (원본 비율)
- **rowHeight이 숫자**: `rowHeight * rows + gap * (rows - 1)`

**variant별 핵심 차이**:
- **standard**: flex column (ImageListItemBar 하단 배치), img { height: auto, flexGrow: 1 }
- **woven**: height: 100%, alignSelf: center
- **masonry**: marginBottom: gap, breakInside: avoid

ImageListItem은 **Context 소비와 Children 조작**의 조화를 보여주는 컴포넌트입니다!
