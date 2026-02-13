# ImageListItem 컴포넌트

> Material-UI의 ImageListItem 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

ImageListItem은 **ImageList의 자식 아이템** 컴포넌트입니다.

### 핵심 기능

1. **그리드 크기 제어** - cols, rows prop으로 아이템이 차지할 그리드 크기 지정
2. **Context에서 부모 설정 읽기** - ImageListContext에서 rowHeight, gap, variant 가져오기
3. **높이 계산** - rowHeight * rows + gap * (rows - 1)
4. **variant별 스타일** - standard (flex column), woven (nth-of-type), masonry (breakInside)
5. **img 요소에 자동 className 추가** - React.Children.map + cloneElement로 img 찾아서 스타일 적용
6. **Fragment 검증** - dev 모드에서 Fragment 자식 경고

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/ImageListItem/ImageListItem.js (204줄)

ImageListItem
  ├─ useDefaultProps (테마에서 기본 props 가져오기)
  ├─ ImageListContext에서 rowHeight, gap, variant 읽기
  ├─ height 계산 (variant === 'woven' ? undefined : rowHeight * rows + gap * (rows - 1))
  ├─ useUtilityClasses (CSS 클래스 이름 생성)
  ├─ React.Children.map (img 요소 찾아서 className 추가)
  │
  └─ ImageListItemRoot (styled 'li')
       ├─ variant === 'standard' → display: flex, flexDirection: column
       ├─ variant === 'woven' → height: 100%, alignSelf: center, :nth-of-type(even) { height: 70% }
       └─ img 자식 → objectFit: cover, width: 100%, height: 100%
```

### 2. Styled Component (1개)

#### ImageListItemRoot (25-81줄)

```javascript
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
```

**기본 스타일**:
- `display: block` - 블록 레벨 요소
- `position: relative` - 자식의 절대 위치 기준

**img 자식 스타일** (`& .${imageListItemClasses.img}`):
- `objectFit: cover` - 이미지 비율 유지하며 크롭
- `width: 100%`, `height: 100%` - 부모 영역 채우기
- `display: block` - 이미지 하단 공백 제거

**Variant별 스타일**:

1. **standard**:
   - 아이템: `display: flex`, `flexDirection: column`
   - img: `height: auto`, `flexGrow: 1`
   - ImageListItemBar를 하단에 배치하기 위한 flex 레이아웃

2. **woven** (직조 패턴):
   - `height: 100%`, `alignSelf: center`
   - `:nth-of-type(even)` - 짝수 아이템은 `height: 70%`
   - 아이템 높이를 교대로 변경하여 직조 패턴 생성

3. **masonry, quilted**: 기본 스타일 사용

### 3. ImageListContext 사용

```javascript
const { rowHeight = 'auto', gap, variant } = React.useContext(ImageListContext);
```

부모 ImageList에서 전달한 값을 읽어서:
- **rowHeight** - 행 높이 (height 계산에 사용)
- **gap** - 아이템 간격 (height 계산, marginBottom에 사용)
- **variant** - 레이아웃 타입 (스타일 분기)

### 4. Height 계산 로직

```javascript
let height = 'auto';
if (variant === 'woven') {
  height = undefined;
} else if (rowHeight !== 'auto') {
  height = rowHeight * rows + gap * (rows - 1);
}
```

**계산 방식**:
- **woven**: `undefined` (CSS에서 제어)
- **rowHeight === 'auto'**: `'auto'` (이미지 원본 비율)
- **rowHeight이 숫자**: `rowHeight * rows + gap * (rows - 1)`
  - 예: rowHeight=100, rows=2, gap=4 → height = 100*2 + 4*1 = 204

**왜 gap * (rows - 1)?**
- rows=2일 때 gap은 1개만 필요 (아이템 사이)
- rows=3일 때 gap은 2개 (아이템1-아이템2, 아이템2-아이템3)

### 5. 인라인 스타일 (118-125줄)

```javascript
style={{
  height,
  gridColumnEnd: variant !== 'masonry' ? `span ${cols}` : undefined,
  gridRowEnd: variant !== 'masonry' ? `span ${rows}` : undefined,
  marginBottom: variant === 'masonry' ? gap : undefined,
  breakInside: variant === 'masonry' ? 'avoid' : undefined,
  ...style,
}}
```

**CSS Grid 제어** (masonry 제외):
- `gridColumnEnd: span ${cols}` - 열 개수만큼 차지
- `gridRowEnd: span ${rows}` - 행 개수만큼 차지

**Masonry 제어**:
- `marginBottom: gap` - CSS Columns에서는 gap이 자동 적용 안 됨
- `breakInside: avoid` - 컬럼 중간에서 아이템 분리 방지

### 6. React.Children.map으로 img 처리 (129-152줄)

```javascript
{React.Children.map(children, (child) => {
  if (!React.isValidElement(child)) {
    return null;
  }

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

  // img 요소에 className 추가
  if (child.type === 'img' || isMuiElement(child, ['Image'])) {
    return React.cloneElement(child, {
      className: clsx(classes.img, child.props.className),
    });
  }

  return child;
})}
```

**동작 방식**:
1. `React.Children.map`으로 모든 자식 순회
2. Fragment 검증 (dev 모드)
3. **img 요소 또는 Image 컴포넌트 찾기**
4. `React.cloneElement`로 className 추가 (기존 className 유지)
5. 나머지 자식은 그대로 반환

**왜 필요한가?**
- img에 `objectFit: cover`, `width: 100%` 등 스타일 적용
- ImageListItemBar와 함께 사용할 때 올바른 레이아웃
- 사용자가 `<img className="custom" />` 전달 시 className 병합

### 7. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `cols` | number | `1` | 차지할 열 개수 |
| `rows` | number | `1` | 차지할 행 개수 |
| `component` | elementType | `'li'` | 루트 엘리먼트 타입 |
| `children` | node | - | img 또는 ImageListItemBar |

**Cols/Rows 예시**:
```javascript
<ImageList cols={4} rowHeight={121}>
  <ImageListItem cols={2} rows={2}> {/* 2x2 크기 */}
    <img src="large.jpg" alt="Large" />
  </ImageListItem>
  <ImageListItem> {/* 1x1 크기 (기본) */}
    <img src="small.jpg" alt="Small" />
  </ImageListItem>
</ImageList>
```

### 8. useUtilityClasses

```javascript
const useUtilityClasses = (ownerState) => {
  const { classes, variant } = ownerState;

  const slots = {
    root: ['root', variant],
    img: ['img'],
  };

  return composeClasses(slots, getImageListItemUtilityClass, classes);
};
```

**생성되는 클래스**:
- root: `MuiImageListItem-root`, `MuiImageListItem-{variant}`
- img: `MuiImageListItem-img`

---

## 렌더링 로직

```javascript
const ImageListItem = React.forwardRef(function ImageListItem(inProps, ref) {
  // 1. 테마 기본 props
  const props = useDefaultProps({
    props: inProps,
    name: 'MuiImageListItem',
  });

  // 2. props 구조 분해
  const { children, className, cols = 1, component = 'li', rows = 1, style, ...other } = props;

  // 3. Context에서 부모 설정 읽기
  const { rowHeight = 'auto', gap, variant } = React.useContext(ImageListContext);

  // 4. height 계산
  let height = 'auto';
  if (variant === 'woven') {
    height = undefined;
  } else if (rowHeight !== 'auto') {
    height = rowHeight * rows + gap * (rows - 1);
  }

  // 5. ownerState, classes
  const ownerState = { ...props, cols, component, gap, rowHeight, rows, variant };
  const classes = useUtilityClasses(ownerState);

  // 6. 렌더링
  return (
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
      {/* 7. Children 처리: img에 className 추가 */}
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) {
          return null;
        }

        if (process.env.NODE_ENV !== 'production') {
          if (isFragment(child)) {
            console.error(...);
          }
        }

        if (child.type === 'img' || isMuiElement(child, ['Image'])) {
          return React.cloneElement(child, {
            className: clsx(classes.img, child.props.className),
          });
        }

        return child;
      })}
    </ImageListItemRoot>
  );
});
```

---

## 설계 패턴

### 1. Context Consumer Pattern

```javascript
const { rowHeight = 'auto', gap, variant } = React.useContext(ImageListContext);
```

- 부모 ImageList의 설정을 Context로 받아옴
- prop drilling 없이 데이터 전달
- rowHeight, gap, variant를 기반으로 자신의 스타일 계산

### 2. Children Manipulation Pattern

```javascript
React.Children.map(children, (child) => {
  if (child.type === 'img' || isMuiElement(child, ['Image'])) {
    return React.cloneElement(child, {
      className: clsx(classes.img, child.props.className),
    });
  }
  return child;
});
```

- 자식 요소를 순회하며 특정 타입(img) 찾기
- `React.cloneElement`로 props 추가/병합
- 사용자가 전달한 img에 자동으로 스타일 적용

### 3. Variant-based Style Pattern

```javascript
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
]
```

- variant에 따라 완전히 다른 레이아웃
- standard: flex column (ImageListItemBar 하단 배치)
- woven: nth-of-type으로 교대 높이

### 4. Dynamic Height Calculation

```javascript
let height = 'auto';
if (variant === 'woven') {
  height = undefined;
} else if (rowHeight !== 'auto') {
  height = rowHeight * rows + gap * (rows - 1);
}
```

- variant, rowHeight, rows, gap 조합으로 높이 계산
- quilted 레이아웃에서 rows=2일 때 2배 높이

---

## 복잡도의 이유

ImageListItem은 **204줄**이며, 복잡한 이유는:

1. **styled 컴포넌트** (약 57줄)
   - ImageListItemRoot
   - overridesResolver
   - variants (standard, woven)
   - img 자식 스타일

2. **Children.map + cloneElement** (약 24줄)
   - img 요소 찾기
   - Fragment 검증 (dev)
   - className 병합

3. **Context + height 계산** (약 10줄)
   - ImageListContext 읽기
   - variant별 height 분기

4. **useUtilityClasses + composeClasses** (약 9줄)
   - variant별 CSS 클래스 생성

5. **PropTypes** (약 44줄, 157-201)
   - 런타임 타입 검증

실제 핵심 로직은 **60줄 정도**입니다.

---

## 사용 예시

### Standard (기본)

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

### Quilted (아이템별 크기 다름)

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

### ImageListItemBar와 함께

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

---

## 핵심 동작 원리

### ImageListContext와의 상호작용

```
ImageList (rowHeight=121, gap=4, variant='quilted')
    ↓ ImageListContext
ImageListItem (cols=2, rows=2)
    ↓
height 계산: 121*2 + 4*1 = 246
gridColumnEnd: span 2
gridRowEnd: span 2
```

### img 요소에 자동 스타일 적용

```
사용자 코드:
<ImageListItem>
  <img src="image.jpg" alt="Image" />
</ImageListItem>

    ↓ React.Children.map

내부 처리:
React.cloneElement(img, {
  className: clsx('MuiImageListItem-img', undefined)
})

    ↓

결과:
<img
  src="image.jpg"
  alt="Image"
  className="MuiImageListItem-img"
  style={{ objectFit: 'cover', width: '100%', height: '100%', ... }}
/>
```

### Variant별 레이아웃

**Standard** (ImageListItemBar 하단 배치):
```css
display: flex;
flex-direction: column;

img {
  height: auto;
  flex-grow: 1; /* 나머지 공간 차지 */
}
```

**Woven** (교대 높이):
```css
height: 100%;
align-self: center;

&:nth-of-type(even) {
  height: 70%; /* 짝수 아이템만 작게 */
}
```

**Masonry** (CSS Columns):
```css
margin-bottom: gap; /* 컬럼 간격 수동 추가 */
break-inside: avoid; /* 아이템 분리 방지 */
```

---

## 핵심 요약

ImageListItem은:
1. **ImageList의 자식 아이템** - Context로 부모 설정 받아옴
2. **동적 높이 계산** - rowHeight * rows + gap * (rows - 1)
3. **cols, rows로 그리드 크기 제어** - quilted 레이아웃
4. **img 자동 처리** - Children.map + cloneElement로 className 추가
5. **variant별 레이아웃** - standard (flex), woven (nth-of-type), masonry (breakInside)

**가장 중요한 학습 포인트**:
- **Context 소비**: 부모 설정을 읽어서 자신의 스타일 계산
- **Children 조작**: img 찾아서 자동으로 스타일 적용
- **동적 계산**: rowHeight, rows, gap 조합으로 정확한 높이 계산
- **Grid 제어**: cols, rows로 `grid-column-end`, `grid-row-end` 설정
