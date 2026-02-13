# ImageList 컴포넌트

> 이미지 그리드 레이아웃을 제공하는 단순화된 컨테이너

---

## 이 문서의 목적

**이 문서는 단순화된 코드의 "설명서"입니다.**

Material-UI는 라이브러리 코드라서 복잡합니다. 단순화했더라도 코드만 보고는 이해하기 어려울 수 있습니다.
이 문서는 코드의 **동작 원리, 핵심 패턴, 왜 이렇게 구현했는지**를 상세히 설명하여 학습을 돕습니다.

---

## 무슨 기능을 하는가?

단순화된 ImageList는 **이미지를 다양한 레이아웃으로 표시하는 그리드 컨테이너**입니다.

### 핵심 기능 (남은 것)
1. **Variant별 레이아웃** - masonry (CSS Columns) vs standard (CSS Grid)
2. **열 개수 제어** - cols prop으로 그리드 열 수 지정
3. **간격 제어** - gap prop으로 아이템 간격 지정
4. **Context 전달** - ImageListContext로 rowHeight, gap, variant를 자식에게 전달
5. **Component 다형성** - component prop으로 ul, div 등 선택 가능

### 유지된 기능
- ✅ **variant별 레이아웃** - masonry는 CSS Columns, 나머지는 CSS Grid
- ✅ **cols, gap, rowHeight props** - 레이아웃 제어
- ✅ **ImageListContext** - 자식 컴포넌트에게 값 전달
- ✅ **Component 다형성** - ul, div 등 선택 가능

---

## 핵심 학습 포인트

### 1. Variant-based Layout Pattern - 조건부 레이아웃

```javascript
const baseStyles = {
  display: variant === 'masonry' ? 'block' : 'grid',
  overflowY: 'auto',
  listStyle: 'none',
  padding: 0,
  WebkitOverflowScrolling: 'touch',
};

const layoutStyle =
  variant === 'masonry'
    ? { columnCount: cols, columnGap: gap }
    : { gridTemplateColumns: `repeat(${cols}, 1fr)`, gap };
```

**학습 가치**:
- variant에 따라 완전히 다른 CSS 레이아웃 사용
- **masonry**: CSS Columns (`display: block`, `columnCount`) - 세로로 쌓기, 높이 자동 조정
- **standard**: CSS Grid (`display: grid`, `gridTemplateColumns`) - 균등 분할
- 조건부 스타일을 명시적으로 병합하여 최종 스타일 생성

### 2. Context Provider Pattern - 자식에게 데이터 전달

```javascript
const contextValue = React.useMemo(
  () => ({ rowHeight, gap, variant }),
  [rowHeight, gap, variant],
);

<ImageListContext.Provider value={contextValue}>
  {children}
</ImageListContext.Provider>
```

**학습 가치**:
- ImageListItem이 부모의 설정(rowHeight, gap, variant)을 알아야 올바르게 렌더링 가능
- prop drilling 없이 깊은 자식에게 데이터 전달
- `useMemo`로 context 값 메모이제이션 → 불필요한 리렌더링 방지

### 3. Style Object Composition - 스타일 합성

```javascript
const finalStyle = {
  ...baseStyles,
  ...layoutStyle,
  ...styleProp,
};
```

**학습 가치**:
- 기본 스타일 + 레이아웃 스타일 + 사용자 스타일을 순차적으로 병합
- Object spread로 스타일 오버라이드 가능
- styleProp이 마지막이므로 사용자가 모든 스타일 커스터마이즈 가능

### 4. CSS Grid vs CSS Columns

**CSS Grid (standard, quilted, woven)**:
```javascript
gridTemplateColumns: `repeat(${cols}, 1fr)`
gap: gap
```
- 균등하게 열 분할
- 행/열 모두 정렬
- 아이템 높이가 비슷할 때 적합

**CSS Columns (masonry)**:
```javascript
columnCount: cols
columnGap: gap
```
- 세로로 아이템 쌓기
- 높이 자동 조정
- 아이템 높이가 다를 때 적합 (Pinterest 스타일)

---

## 내부 구조

### 1. 렌더링 구조

```javascript
// 위치: packages/mui-material/src/ImageList/ImageList.js (57줄, 원본 155줄)

ImageList
  ├─ Props destructuring (cols=2, gap=4, rowHeight='auto', variant='standard')
  ├─ contextValue (useMemo)
  ├─ baseStyles (display, overflowY, listStyle, padding, WebkitOverflowScrolling)
  ├─ layoutStyle (variant별 조건부)
  ├─ finalStyle (병합)
  │
  └─> Component (component prop 값, 기본 'ul')
       ├─ style={finalStyle}
       ├─ className, ref, ...other
       │
       └─ ImageListContext.Provider
            └─ {children}
```

### 2. Props

| 이름 | 타입 | 기본값 | 용도 |
|------|------|--------|------|
| `cols` | number | `2` | 열 개수 |
| `gap` | number | `4` | 아이템 간격 (px) |
| `rowHeight` | number \| 'auto' | `'auto'` | 행 높이 (ImageListItem이 사용) |
| `variant` | string | `'standard'` | 레이아웃 타입 |
| `component` | elementType | `'ul'` | 루트 HTML 요소 타입 |
| `className` | string | - | CSS 클래스 |
| `style` | object | - | 인라인 스타일 (finalStyle과 병합) |
| `children` | node | - | ImageListItem들 |

**Variant 옵션**:
- `'standard'` - 기본 그리드 (균등 분할)
- `'masonry'` - 벽돌 레이아웃 (높이 가변, Pinterest 스타일)
- `'quilted'` - 퀼트 패턴 (아이템별 cols/rows, ImageListItem에서 처리)
- `'woven'` - 직조 패턴

### 3. 동작 흐름

#### 기본 렌더링 플로우

```
ImageList 컴포넌트 호출
        ↓
props 구조 분해 (cols, gap, rowHeight, variant, component, children)
        ↓
contextValue 생성 (useMemo)
        ↓
baseStyles 생성 (display, overflowY, listStyle, padding, WebkitOverflowScrolling)
        ↓
layoutStyle 생성 (variant === 'masonry' ? columns : grid)
        ↓
finalStyle 병합 (baseStyles + layoutStyle + styleProp)
        ↓
Component 변수 할당
        ↓
렌더링
 ├─ Component에 ref, className, style, ...other 전달
 └─ ImageListContext.Provider로 자식에게 context 전달
```

#### 시나리오 예시

**시나리오 1: Standard Grid (기본)**
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

// 결과 스타일:
// display: grid
// gridTemplateColumns: repeat(3, 1fr)
// gap: 8
```

**시나리오 2: Masonry Layout**
```javascript
<ImageList variant="masonry" cols={3} gap={8}>
  <ImageListItem>
    <img src="tall-image.jpg" alt="Tall" />
  </ImageListItem>
  <ImageListItem>
    <img src="short-image.jpg" alt="Short" />
  </ImageListItem>
</ImageList>

// 결과 스타일:
// display: block
// columnCount: 3
// columnGap: 8
// → 높이가 다른 이미지들이 자동으로 배치됨 (Pinterest 스타일)
```

**시나리오 3: Context 전달**
```javascript
<ImageList cols={4} rowHeight={121} variant="quilted">
  {/* ImageListItem이 context에서 rowHeight, gap, variant를 읽어서 사용 */}
  <ImageListItem cols={2} rows={2}>
    <img src="large.jpg" alt="Large" />
  </ImageListItem>
  <ImageListItem>
    <img src="small.jpg" alt="Small" />
  </ImageListItem>
</ImageList>

// ImageListItem 내부:
// const { rowHeight, gap } = useContext(ImageListContext);
// → 부모의 설정에 따라 높이 계산
```

---

## 주요 변경 사항 (원본 대비)

**원본과의 차이**:
- ❌ `useDefaultProps()` 제거 → 함수 파라미터 기본값
- ❌ `styled()` 시스템 제거 → 인라인 스타일 (baseStyles + layoutStyle + finalStyle)
- ❌ `useUtilityClasses()`, `composeClasses()` 제거 → className 직접 전달
- ❌ `clsx()` 제거 → className 단순 전달
- ❌ `ownerState` 제거 → 불필요한 중간 객체
- ❌ `PropTypes` 제거 → 런타임 검증 제거
- ✅ variant별 레이아웃 유지 (masonry vs standard)
- ✅ ImageListContext 유지 (자식에게 context 전달)
- ✅ cols, gap, rowHeight props 유지
- ✅ Component 다형성 유지

---

## 커밋 히스토리로 보는 단순화 과정

ImageList는 **3개의 커밋**을 통해 단순화되었습니다.

### 1단계: useDefaultProps 제거

- `68609d6c` - [ImageList 단순화 1/3] useDefaultProps 제거

**삭제된 코드**:
```javascript
import { useDefaultProps } from '../DefaultPropsProvider';

const ImageList = React.forwardRef(function ImageList(inProps, ref) {
  const props = useDefaultProps({
    props: inProps,
    name: 'MuiImageList',
  });
```

**변경 후**:
```javascript
const ImageList = React.forwardRef(function ImageList(props, ref) {
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
```

**왜 불필요한가**:
- **학습 목적**: 테마 시스템의 defaultProps 병합은 개별 컴포넌트 학습과 무관
- **복잡도**: 테마 Context 구독 불필요

### 2단계: styled 시스템 제거

- `6b31d799` - [ImageList 단순화 2/3] styled 시스템 제거

**삭제된 코드**:
```javascript
import { styled } from '../zero-styled';

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

// 기존 style 로직:
const style =
  variant === 'masonry'
    ? { columnCount: cols, columnGap: gap, ...styleProp }
    : { gridTemplateColumns: `repeat(${cols}, 1fr)`, gap, ...styleProp };

<ImageListRoot
  as={component}
  className={clsx(classes.root, classes[variant], className)}
  ref={ref}
  style={style}
  ownerState={ownerState}
  {...other}
>
```

**변경 후**:
```javascript
const baseStyles = {
  display: variant === 'masonry' ? 'block' : 'grid',
  overflowY: 'auto',
  listStyle: 'none',
  padding: 0,
  WebkitOverflowScrolling: 'touch',
};

const layoutStyle =
  variant === 'masonry'
    ? { columnCount: cols, columnGap: gap }
    : { gridTemplateColumns: `repeat(${cols}, 1fr)`, gap };

const finalStyle = {
  ...baseStyles,
  ...layoutStyle,
  ...styleProp,
};

const Component = component;

<Component
  ref={ref}
  className={clsx(classes.root, classes[variant], className)}
  style={finalStyle}
  {...other}
>
```

**왜 불필요한가**:
- **학습 목적**: CSS-in-JS 시스템 배우는 게 아님, 인라인 스타일이 더 직관적
- **복잡도**: styled variants 대신 조건부 스타일로 명시적 구현
- **가독성**: baseStyles + layoutStyle 분리로 레이아웃 로직 명확화

### 3단계: useUtilityClasses, composeClasses, PropTypes 제거

- `30083d28` - [ImageList 단순화 3/3] useUtilityClasses, composeClasses, PropTypes 제거

**삭제된 코드**:
```javascript
import PropTypes from 'prop-types';
import clsx from 'clsx';
import composeClasses from '@mui/utils/composeClasses';
import integerPropType from '@mui/utils/integerPropType';
import { getImageListUtilityClass } from './imageListClasses';

const useUtilityClasses = (ownerState) => {
  const { classes, variant } = ownerState;

  const slots = {
    root: ['root', variant],
  };

  return composeClasses(slots, getImageListUtilityClass, classes);
};

const ownerState = { ...props, component, gap, rowHeight, variant };
const classes = useUtilityClasses(ownerState);

className={clsx(classes.root, classes[variant], className)}

// PropTypes 블록 (~58줄)
ImageList.propTypes = { ... };
```

**변경 후**:
```javascript
// className 직접 사용, PropTypes 제거
className={className}
```

**왜 불필요한가**:
- **학습 목적**: CSS 클래스 기반 스타일링은 테마 시스템의 일부, 컴포넌트 동작과 무관
- **복잡도**: 단순한 className 전달에 추상화 레이어 불필요
- **PropTypes**: 실제 로직(57줄)보다 PropTypes(58줄)가 더 많았음

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 155줄 | 57줄 (63% 감소) |
| **Import 개수** | 7개 | 2개 |
| **styled 컴포넌트** | 1개 (ImageListRoot) | ❌ |
| **인라인 스타일** | style (1개 변수) | baseStyles + layoutStyle + finalStyle (3개 변수) |
| **useDefaultProps** | ✅ | ❌ |
| **useUtilityClasses** | ✅ | ❌ |
| **clsx** | ✅ | ❌ |
| **ownerState** | ✅ | ❌ |
| **PropTypes** | ✅ 58줄 | ❌ |
| **variant 레이아웃** | ✅ | ✅ 동일 (masonry vs grid) |
| **ImageListContext** | ✅ | ✅ 동일 |
| **cols, gap, rowHeight** | ✅ | ✅ 동일 |
| **Component 다형성** | ✅ as | ✅ Component 변수 |
| **ref 전달** | ✅ | ✅ 동일 |

---

## 학습 후 다음 단계

ImageList를 이해했다면:

1. **ImageListItem** - ImageList의 자식 아이템
2. **ImageListItemBar** - ImageListItem의 오버레이 바
3. **ImageListContext** - Context 정의 (간단한 파일)

**예시: 기본 사용 (Standard Grid)**
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

**예시: Masonry Layout**
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

**예시: Quilted Pattern (ImageListItem에서 cols/rows 사용)**
```javascript
<ImageList variant="quilted" cols={4} rowHeight={121}>
  <ImageListItem cols={2} rows={2}>
    <img src="large.jpg" alt="Large" />
  </ImageListItem>
  <ImageListItem>
    <img src="small.jpg" alt="Small" />
  </ImageListItem>
</ImageList>
```

**예시: 커스텀 스타일**
```javascript
<ImageList
  cols={3}
  gap={16}
  style={{ maxHeight: 500, borderRadius: 8 }}
>
  <ImageListItem>
    <img src="image1.jpg" alt="1" />
  </ImageListItem>
</ImageList>
```

**예시: div 요소 사용**
```javascript
<ImageList component="div" cols={4}>
  <ImageListItem>
    <img src="image1.jpg" alt="1" />
  </ImageListItem>
</ImageList>
```

---

## 핵심 요약

ImageList는:
1. **Variant-based Layout** - masonry (CSS Columns) vs standard (CSS Grid)
2. **Context Provider** - ImageListContext로 자식에게 rowHeight, gap, variant 전달
3. **Style Composition** - baseStyles + layoutStyle + styleProp 병합
4. **57줄의 간결함** - 불필요한 복잡도 제거 (155줄 → 57줄, 63% 감소)

**가장 중요한 학습 포인트**:
- **조건부 레이아웃**: variant에 따라 CSS Grid vs CSS Columns 선택
- **Context 전달**: 자식이 부모 설정(rowHeight, gap, variant)을 알아야 올바르게 렌더링
- **스타일 합성**: baseStyles + layoutStyle + styleProp 순차 병합으로 커스터마이즈 가능
- **CSS Grid vs Columns**: 높이가 같은 아이템은 Grid, 다른 아이템은 Columns (masonry)

**CSS Grid vs Columns 요약**:
- **CSS Grid** (standard, quilted, woven): 균등 분할, 행/열 정렬, 높이 비슷할 때
- **CSS Columns** (masonry): 세로 쌓기, 높이 자동 조정, Pinterest 스타일

ImageList는 **레이아웃 선택과 Context 전달**의 조화를 보여주는 컴포넌트입니다!
