# ImageList 컴포넌트

> Material-UI의 ImageList 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

ImageList는 **이미지를 그리드 레이아웃으로 표시하는 컨테이너** 컴포넌트입니다.

### 핵심 기능

1. **다양한 레이아웃 variant** - standard, masonry, quilted, woven
2. **Grid/Masonry 레이아웃** - CSS Grid 또는 CSS Columns 사용
3. **열 개수 제어** - cols prop으로 열 개수 지정
4. **간격 제어** - gap prop으로 아이템 간격 지정
5. **Context 전달** - ImageListContext로 rowHeight, gap, variant를 자식에게 전달

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/ImageList/ImageList.js (155줄)

ImageList
  ├─ useDefaultProps (테마에서 기본 props 가져오기)
  ├─ useUtilityClasses (CSS 클래스 이름 생성)
  ├─ ImageListContext.Provider (자식에게 context 전달)
  │
  └─ ImageListRoot (styled 'ul')
       ├─ variant === 'masonry' → display: block, columnCount, columnGap
       └─ variant !== 'masonry' → display: grid, gridTemplateColumns, gap
```

### 2. Styled Component (1개)

#### ImageListRoot (22-47줄)

```javascript
const ImageListRoot = styled('ul', {
  name: 'MuiImageList',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;
    return [styles.root, styles[ownerState.variant]];
  },
})({
  display: 'grid',
  overflowY: 'auto',
  listStyle: 'none',
  padding: 0,
  WebkitOverflowScrolling: 'touch',
  variants: [
    {
      props: { variant: 'masonry' },
      style: { display: 'block' },
    },
  ],
});
```

**특징**:
- `display: grid` - 기본 CSS Grid 레이아웃
- `overflowY: auto` - 세로 스크롤 가능
- `listStyle: none` - ul의 기본 리스트 스타일 제거
- `padding: 0` - ul의 기본 padding 제거
- `WebkitOverflowScrolling: touch` - iOS 모멘텀 스크롤링
- **variants**: masonry일 때 `display: block`으로 변경

### 3. Variant별 레이아웃

#### Standard (CSS Grid)

```javascript
const style = {
  gridTemplateColumns: `repeat(${cols}, 1fr)`,
  gap,
  ...styleProp,
};
```

- CSS Grid 사용
- `repeat(${cols}, 1fr)` - 열 개수만큼 균등 분할
- `gap` - 그리드 간격

#### Masonry (CSS Columns)

```javascript
const style = {
  columnCount: cols,
  columnGap: gap,
  ...styleProp,
};
```

- CSS Columns 사용
- `columnCount` - 열 개수
- `columnGap` - 열 간격
- 아이템이 세로로 쌓이며 높이에 따라 자동 배치

### 4. ImageListContext

```javascript
const contextValue = React.useMemo(
  () => ({ rowHeight, gap, variant }),
  [rowHeight, gap, variant],
);

<ImageListContext.Provider value={contextValue}>
  {children}
</ImageListContext.Provider>
```

- **rowHeight** - ImageListItem이 높이 계산에 사용
- **gap** - ImageListItem이 간격 계산에 사용
- **variant** - ImageListItem이 레이아웃 결정에 사용
- `useMemo`로 불필요한 리렌더링 방지

### 5. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `cols` | number | `2` | 열 개수 |
| `gap` | number | `4` | 아이템 간격 (px) |
| `rowHeight` | number \| 'auto' | `'auto'` | 행 높이 |
| `variant` | string | `'standard'` | 레이아웃 타입 |
| `component` | elementType | `'ul'` | 루트 엘리먼트 타입 |
| `children` | node | - | ImageListItem들 |

**Variant 옵션**:
- `'standard'` - 기본 그리드 (균등 분할)
- `'masonry'` - 벽돌 레이아웃 (높이 가변)
- `'quilted'` - 퀼트 패턴 (아이템별 cols/rows)
- `'woven'` - 직조 패턴

### 6. useUtilityClasses

```javascript
const useUtilityClasses = (ownerState) => {
  const { classes, variant } = ownerState;

  const slots = {
    root: ['root', variant],
  };

  return composeClasses(slots, getImageListUtilityClass, classes);
};
```

- root 슬롯에 variant별 클래스 추가
- 예: `MuiImageList-root`, `MuiImageList-masonry`

---

## 렌더링 로직

```javascript
const ImageList = React.forwardRef(function ImageList(inProps, ref) {
  // 1. 테마 기본 props
  const props = useDefaultProps({
    props: inProps,
    name: 'MuiImageList',
  });

  // 2. props 구조 분해
  const {
    children,
    className,
    cols = 2,
    component = 'ul',
    rowHeight = 'auto',
    gap = 4,
    style: styleProp,
    variant = 'standard',
    ...other
  } = props;

  // 3. Context 값 생성 (메모이제이션)
  const contextValue = React.useMemo(
    () => ({ rowHeight, gap, variant }),
    [rowHeight, gap, variant],
  );

  // 4. variant별 스타일 계산
  const style =
    variant === 'masonry'
      ? { columnCount: cols, columnGap: gap, ...styleProp }
      : { gridTemplateColumns: `repeat(${cols}, 1fr)`, gap, ...styleProp };

  // 5. ownerState, classes
  const ownerState = { ...props, component, gap, rowHeight, variant };
  const classes = useUtilityClasses(ownerState);

  // 6. 렌더링
  return (
    <ImageListRoot
      as={component}
      className={clsx(classes.root, classes[variant], className)}
      ref={ref}
      style={style}
      ownerState={ownerState}
      {...other}
    >
      <ImageListContext.Provider value={contextValue}>
        {children}
      </ImageListContext.Provider>
    </ImageListRoot>
  );
});
```

---

## 설계 패턴

### 1. Variant-based Layout Pattern

```javascript
const style =
  variant === 'masonry'
    ? { columnCount: cols, columnGap: gap, ...styleProp }
    : { gridTemplateColumns: `repeat(${cols}, 1fr)`, gap, ...styleProp };
```

- variant에 따라 완전히 다른 CSS 레이아웃 사용
- masonry: CSS Columns (세로 쌓기)
- 그 외: CSS Grid (균등 분할)

### 2. Context Provider Pattern

```javascript
<ImageListContext.Provider value={contextValue}>
  {children}
</ImageListContext.Provider>
```

- 자식 컴포넌트(ImageListItem)에게 값 전달
- prop drilling 없이 깊은 자식에게 데이터 전달
- rowHeight, gap, variant를 ImageListItem이 사용

### 3. Memoized Context Value

```javascript
const contextValue = React.useMemo(
  () => ({ rowHeight, gap, variant }),
  [rowHeight, gap, variant],
);
```

- context 값이 변경되지 않으면 동일 객체 참조 유지
- 불필요한 자식 리렌더링 방지
- 성능 최적화

---

## 복잡도의 이유

ImageList는 **155줄**이며, 복잡한 이유는:

1. **styled 컴포넌트** (약 26줄)
   - ImageListRoot
   - overridesResolver
   - variants

2. **variant별 스타일 로직** (약 5줄)
   - masonry vs 그 외 분기
   - columnCount vs gridTemplateColumns

3. **Context 관리** (약 5줄)
   - useMemo
   - Provider

4. **useUtilityClasses + composeClasses** (약 8줄)
   - variant별 CSS 클래스 생성

5. **PropTypes** (약 58줄, 95-152)
   - 런타임 타입 검증
   - variant, cols, gap 등

실제 핵심 로직은 **50줄 미만**입니다.

---

## 사용 예시

### Standard (기본 그리드)

```javascript
<ImageList cols={3} gap={8}>
  <ImageListItem>
    <img src="image1.jpg" alt="1" />
  </ImageListItem>
  <ImageListItem>
    <img src="image2.jpg" alt="2" />
  </ImageListItem>
  <ImageListItem>
    <img src="image3.jpg" alt="3" />
  </ImageListItem>
</ImageList>
```

### Masonry (벽돌 레이아웃)

```javascript
<ImageList variant="masonry" cols={3} gap={8}>
  <ImageListItem>
    <img src="tall-image.jpg" alt="Tall" />
  </ImageListItem>
  <ImageListItem>
    <img src="short-image.jpg" alt="Short" />
  </ImageListItem>
  <ImageListItem>
    <img src="medium-image.jpg" alt="Medium" />
  </ImageListItem>
</ImageList>
```

높이가 다른 이미지들이 자동으로 배치됨

### Quilted (퀼트 패턴)

```javascript
<ImageList variant="quilted" cols={4} rowHeight={121}>
  <ImageListItem cols={2} rows={2}>
    <img src="image1.jpg" alt="1" />
  </ImageListItem>
  <ImageListItem>
    <img src="image2.jpg" alt="2" />
  </ImageListItem>
  <ImageListItem>
    <img src="image3.jpg" alt="3" />
  </ImageListItem>
</ImageList>
```

---

## 핵심 동작 원리

### CSS Grid vs CSS Columns

**CSS Grid (standard)**:
```css
display: grid;
grid-template-columns: repeat(3, 1fr);
gap: 8px;
```
- 균등하게 열 분할
- 행/열 모두 정렬
- 아이템 높이가 같을 때 적합

**CSS Columns (masonry)**:
```css
display: block;
column-count: 3;
column-gap: 8px;
```
- 세로로 아이템 쌓기
- 높이 자동 조정
- 아이템 높이가 다를 때 적합

### Context를 통한 데이터 전달

```
ImageList (rowHeight, gap, variant)
    ↓ ImageListContext
ImageListItem (context 값 사용)
    ↓
이미지 크기/위치 계산
```

ImageListItem이 부모의 설정을 알아야 올바르게 렌더링 가능
