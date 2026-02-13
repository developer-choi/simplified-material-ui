# Breadcrumbs 컴포넌트

> Material-UI의 Breadcrumbs 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

Breadcrumbs는 **브레드크럼 네비게이션 UI를 렌더링하는 컴포넌트**입니다.

### 핵심 기능
1. **아이템 사이에 구분자 삽입** - insertSeparators 함수로 구현
2. **Collapse 기능** - maxItems 초과 시 일부 아이템 숨김
3. **확장 기능** - BreadcrumbCollapsed 버튼 클릭 시 모든 아이템 표시
4. **커스터마이징** - separator, CollapsedIcon 등 커스터마이징 가능
5. **접근성** - aria-label, focus 관리

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/Breadcrumbs/Breadcrumbs.js (280줄)

Breadcrumbs
  └─> BreadcrumbsRoot (styled Typography as nav)
       └─> BreadcrumbsOl (styled ol)
            └─> insertSeparators([
                 expanded || allItems.length <= maxItems
                   ? allItems
                   : renderItemsBeforeAndAfter(allItems)
               ])
                 ├─> <li>{child}</li>
                 └─> <BreadcrumbsSeparator>{separator}</BreadcrumbsSeparator>
```

**renderItemsBeforeAndAfter**:
```
[item1, item2, item3, item4, item5, item6, item7, item8, item9, item10]
                    ↓ (maxItems=8, itemsBeforeCollapse=1, itemsAfterCollapse=1)
[item1, <BreadcrumbCollapsed />, item10]
```

### 2. Styled 컴포넌트 (3개)

#### BreadcrumbsRoot
```javascript
const BreadcrumbsRoot = styled(Typography, {
  name: 'MuiBreadcrumbs',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    return [{ [`& .${breadcrumbsClasses.li}`]: styles.li }, styles.root];
  },
})({});
```

**특징**:
- Typography 기반 (nav 엘리먼트로 렌더링)
- 빈 스타일 객체
- overridesResolver로 테마 오버라이드 지원

#### BreadcrumbsOl
```javascript
const BreadcrumbsOl = styled('ol', {
  name: 'MuiBreadcrumbs',
  slot: 'Ol',
})({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  padding: 0,
  margin: 0,
  listStyle: 'none',
});
```

**특징**:
- ol 엘리먼트
- flex 레이아웃으로 아이템 가로 배치
- 기본 list 스타일 제거

#### BreadcrumbsSeparator
```javascript
const BreadcrumbsSeparator = styled('li', {
  name: 'MuiBreadcrumbs',
  slot: 'Separator',
})({
  display: 'flex',
  userSelect: 'none',
  marginLeft: 8,
  marginRight: 8,
});
```

**특징**:
- li 엘리먼트
- userSelect: 'none'으로 선택 방지
- 좌우 마진으로 간격 조정

### 3. 주요 함수

#### insertSeparators
```javascript
function insertSeparators(items, className, separator, ownerState) {
  return items.reduce((acc, current, index) => {
    if (index < items.length - 1) {
      acc = acc.concat(
        current,
        <BreadcrumbsSeparator
          aria-hidden
          key={`separator-${index}`}
          className={className}
          ownerState={ownerState}
        >
          {separator}
        </BreadcrumbsSeparator>,
      );
    } else {
      acc.push(current);
    }
    return acc;
  }, []);
}
```

**역할**: 아이템 사이에 구분자 삽입
- reduce로 배열 순회
- 마지막 아이템 제외하고 구분자 삽입
- aria-hidden으로 스크린 리더에서 숨김

#### renderItemsBeforeAndAfter
```javascript
const renderItemsBeforeAndAfter = (allItems) => {
  const handleClickExpand = () => {
    setExpanded(true);
    // Focus 관리: 클릭된 요소가 DOM에서 제거되므로
    // 포커스를 다른 요소로 이동
    const focusable = listRef.current.querySelector('a[href],button,[tabindex]');
    if (focusable) {
      focusable.focus();
    }
  };

  // 유효성 검증
  if (itemsBeforeCollapse + itemsAfterCollapse >= allItems.length) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(/* ... */);
    }
    return allItems;
  }

  return [
    ...allItems.slice(0, itemsBeforeCollapse),
    <BreadcrumbCollapsed
      aria-label={expandText}
      key="ellipsis"
      slots={{ CollapsedIcon: slots.CollapsedIcon }}
      slotProps={{ collapsedIcon: collapsedIconSlotProps }}
      onClick={handleClickExpand}
    />,
    ...allItems.slice(allItems.length - itemsAfterCollapse, allItems.length),
  ];
};
```

**역할**: maxItems 초과 시 일부 아이템만 표시
- itemsBeforeCollapse: 앞에 표시할 아이템 수
- BreadcrumbCollapsed: collapse 버튼 (...)
- itemsAfterCollapse: 뒤에 표시할 아이템 수
- handleClickExpand: 확장 버튼 클릭 시 모든 아이템 표시 + focus 관리

### 4. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | node | - | 자식 요소들 (브레드크럼 아이템) |
| `separator` | node | '/' | 구분자 |
| `maxItems` | number | 8 | 최대 표시 항목 수 |
| `itemsBeforeCollapse` | number | 1 | collapse 전 표시 항목 수 |
| `itemsAfterCollapse` | number | 1 | collapse 후 표시 항목 수 |
| `expandText` | string | 'Show path' | 확장 버튼 라벨 |
| `component` | elementType | 'nav' | 루트 엘리먼트 |
| `slots` | object | {} | CollapsedIcon 커스터마이징 |
| `slotProps` | object | {} | collapsedIcon props |
| `classes` | object | - | 클래스 오버라이드 |
| `className` | string | - | 추가 클래스 |
| `sx` | object | - | 시스템 스타일 |

### 5. 상태 관리

```javascript
const [expanded, setExpanded] = React.useState(false);
```

**역할**: collapse 상태 관리
- 초기값: false (collapsed)
- BreadcrumbCollapsed 클릭 시 true로 변경
- expanded === true면 모든 아이템 표시

### 6. Children 처리

```javascript
const allItems = React.Children.toArray(children)
  .filter((child) => {
    if (process.env.NODE_ENV !== 'production') {
      if (isFragment(child)) {
        console.error(
          "MUI: The Breadcrumbs component doesn't accept a Fragment as a child."
        );
      }
    }
    return React.isValidElement(child);
  })
  .map((child, index) => (
    <li className={classes.li} key={`child-${index}`}>
      {child}
    </li>
  ));
```

**처리 과정**:
1. React.Children.toArray로 배열 변환
2. filter: Fragment 체크 및 유효한 React 엘리먼트만 선택
3. map: 각 child를 li 엘리먼트로 감싸기

### 7. 렌더링 로직

```javascript
<BreadcrumbsRoot
  ref={ref}
  component={component}
  color="textSecondary"
  className={clsx(classes.root, className)}
  ownerState={ownerState}
  {...other}
>
  <BreadcrumbsOl className={classes.ol} ref={listRef} ownerState={ownerState}>
    {insertSeparators(
      expanded || (maxItems && allItems.length <= maxItems)
        ? allItems
        : renderItemsBeforeAndAfter(allItems),
      classes.separator,
      separator,
      ownerState,
    )}
  </BreadcrumbsOl>
</BreadcrumbsRoot>
```

**조건부 렌더링**:
- expanded === true 또는 allItems.length <= maxItems: 모든 아이템 표시
- 그 외: renderItemsBeforeAndAfter로 일부만 표시

---

## BreadcrumbCollapsed 컴포넌트

### 위치
`packages/mui-material/src/Breadcrumbs/BreadcrumbCollapsed.js` (82줄)

### 구조

```javascript
function BreadcrumbCollapsed(props) {
  const { slots = {}, slotProps = {}, ...otherProps } = props;
  const ownerState = props;

  return (
    <li>
      <BreadcrumbCollapsedButton focusRipple {...otherProps} ownerState={ownerState}>
        <BreadcrumbCollapsedIcon
          as={slots.CollapsedIcon}
          ownerState={ownerState}
          {...slotProps.collapsedIcon}
        />
      </BreadcrumbCollapsedButton>
    </li>
  );
}
```

### Styled 컴포넌트

#### BreadcrumbCollapsedButton
```javascript
const BreadcrumbCollapsedButton = styled(ButtonBase, {
  name: 'MuiBreadcrumbCollapsed',
})(
  memoTheme(({ theme }) => ({
    display: 'flex',
    marginLeft: `calc(${theme.spacing(1)} * 0.5)`,
    marginRight: `calc(${theme.spacing(1)} * 0.5)`,
    ...(theme.palette.mode === 'light'
      ? { backgroundColor: theme.palette.grey[100], color: theme.palette.grey[700] }
      : { backgroundColor: theme.palette.grey[700], color: theme.palette.grey[100] }),
    borderRadius: 2,
    '&:hover, &:focus': {
      ...(theme.palette.mode === 'light'
        ? { backgroundColor: theme.palette.grey[200] }
        : { backgroundColor: theme.palette.grey[600] }),
    },
    '&:active': {
      boxShadow: theme.shadows[0],
      ...(theme.palette.mode === 'light'
        ? { backgroundColor: emphasize(theme.palette.grey[200], 0.12) }
        : { backgroundColor: emphasize(theme.palette.grey[600], 0.12) }),
    },
  })),
);
```

**특징**:
- ButtonBase 기반
- memoTheme으로 테마 통합
- light/dark 모드 대응
- hover, focus, active 상태

#### BreadcrumbCollapsedIcon
```javascript
const BreadcrumbCollapsedIcon = styled(MoreHorizIcon)({
  width: 24,
  height: 16,
});
```

**특징**:
- MoreHorizIcon (... 아이콘)
- 고정 크기 (24x16)

---

## 설계 패턴

1. **Separator Insertion Pattern** (구분자 삽입)
   - reduce로 아이템 사이에 구분자 삽입
   - 마지막 아이템에는 구분자 없음

2. **Collapse/Expand Pattern** (접기/펼치기)
   - maxItems 초과 시 일부만 표시
   - BreadcrumbCollapsed 버튼으로 확장
   - useState로 expanded 상태 관리

3. **Focus Management** (포커스 관리)
   - 확장 버튼 클릭 시 버튼이 DOM에서 제거됨
   - 포커스를 다른 요소로 이동하여 접근성 유지
   - listRef.current.querySelector로 포커스 가능한 요소 찾기

4. **Slot Pattern** (컴포넌트 교체)
   - CollapsedIcon을 slots prop으로 교체 가능
   - useSlotProps 훅 사용

5. **Children Filtering** (자식 필터링)
   - React.Children.toArray로 배열 변환
   - Fragment 체크 (개발 환경에서만)
   - React.isValidElement로 유효한 엘리먼트만 선택

---

## 복잡도의 이유

Breadcrumbs는 **280줄**이며, 복잡한 이유는:

1. **PropTypes (75줄)**
   - 203-277줄: 모든 props에 대한 런타임 타입 검증
   - Breadcrumbs.js: 75줄, BreadcrumbCollapsed.js: 21줄

2. **Collapse/Expand 로직**
   - renderItemsBeforeAndAfter 함수 (약 40줄)
   - expanded 상태 관리
   - handleClickExpand 함수 (focus 관리 포함)
   - 유효성 검증 (개발 환경 에러 메시지)

3. **Slot 시스템**
   - useSlotProps 호출
   - slots, slotProps props
   - BreadcrumbCollapsedIcon의 as prop

4. **스타일 시스템**
   - useUtilityClasses (약 12줄)
   - composeClasses 호출
   - clsx 사용

5. **테마 시스템**
   - memoTheme (BreadcrumbCollapsed)
   - emphasize 함수
   - light/dark 모드 분기

6. **개발 환경 에러 메시지**
   - isFragment 체크
   - itemsBeforeCollapse + itemsAfterCollapse >= allItems.length 체크

7. **Focus 관리**
   - listRef 사용
   - querySelector로 포커스 가능한 요소 찾기
   - 접근성 유지

---

## 예시 사용법

**기본 사용**:

```javascript
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

<Breadcrumbs>
   <Link href="/">Home</Link>
   <Link href="/catalog">Catalog</Link>
   <Typography>Product</Typography>
</Breadcrumbs>

// 렌더링 결과:
// Home / Catalog / Product
```

**커스텀 구분자**:
```javascript
<Breadcrumbs separator=">">
  <Link href="/">Home</Link>
  <Link href="/catalog">Catalog</Link>
  <Typography>Product</Typography>
</Breadcrumbs>

// 렌더링 결과:
// Home > Catalog > Product
```

**Collapse 기능**:
```javascript
<Breadcrumbs maxItems={3} itemsBeforeCollapse={1} itemsAfterCollapse={1}>
  <Link href="/">Home</Link>
  <Link href="/getting-started">Getting Started</Link>
  <Link href="/components">Components</Link>
  <Link href="/breadcrumbs">Breadcrumbs</Link>
  <Typography>API</Typography>
</Breadcrumbs>

// 렌더링 결과 (5개 > 3개):
// Home / ... / API
// (... 클릭 시 모든 아이템 표시)
```

**확장 텍스트 커스터마이징**:
```javascript
<Breadcrumbs expandText="전체 경로 보기">
  {/* 많은 아이템 */}
</Breadcrumbs>

// ... 버튼의 aria-label이 "전체 경로 보기"로 설정됨
```

**커스텀 아이콘**:
```javascript
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

<Breadcrumbs
  separator={<NavigateNextIcon fontSize="small" />}
  aria-label="breadcrumb"
>
  <Link href="/">Home</Link>
  <Link href="/catalog">Catalog</Link>
  <Typography>Product</Typography>
</Breadcrumbs>
```

**CollapsedIcon 교체**:
```javascript
import MoreVertIcon from '@mui/icons-material/MoreVert';

<Breadcrumbs
  maxItems={3}
  slots={{ CollapsedIcon: MoreVertIcon }}
>
  {/* 아이템들 */}
</Breadcrumbs>
```

---

## insertSeparators 함수 상세

```javascript
function insertSeparators(items, className, separator, ownerState) {
  return items.reduce((acc, current, index) => {
    if (index < items.length - 1) {
      acc = acc.concat(
        current,
        <BreadcrumbsSeparator
          aria-hidden
          key={`separator-${index}`}
          className={className}
          ownerState={ownerState}
        >
          {separator}
        </BreadcrumbsSeparator>,
      );
    } else {
      acc.push(current);
    }

    return acc;
  }, []);
}
```

**동작 원리**:

입력: `[<li>Home</li>, <li>Catalog</li>, <li>Product</li>]`

처리:
1. index=0 (Home): `acc = [<li>Home</li>, <BreadcrumbsSeparator>/</BreadcrumbsSeparator>]`
2. index=1 (Catalog): `acc = [..., <li>Catalog</li>, <BreadcrumbsSeparator>/</BreadcrumbsSeparator>]`
3. index=2 (Product, 마지막): `acc = [..., <li>Product</li>]` (구분자 없음)

출력: `[<li>Home</li>, <sep>/</sep>, <li>Catalog</li>, <sep>/</sep>, <li>Product</li>]`

---

## Collapse 로직 상세

### maxItems=3, itemsBeforeCollapse=1, itemsAfterCollapse=1

**입력**: 5개 아이템
```
[Home, Getting Started, Components, Breadcrumbs, API]
```

**처리**:
1. `allItems.slice(0, 1)` → `[Home]`
2. `<BreadcrumbCollapsed />`
3. `allItems.slice(5 - 1, 5)` → `[API]`

**출력**:
```
[Home, <BreadcrumbCollapsed />, API]
```

**렌더링**:
```
Home / ... / API
```

### expanded === true 시

**출력**:
```
[Home, Getting Started, Components, Breadcrumbs, API]
```

**렌더링**:
```
Home / Getting Started / Components / Breadcrumbs / API
```

---

## 접근성 (Accessibility)

1. **aria-label="pagination navigation"**
   - BreadcrumbsRoot에 설정
   - 스크린 리더가 "pagination navigation"으로 읽음

2. **aria-hidden on separators**
   - BreadcrumbsSeparator에 aria-hidden
   - 스크린 리더가 구분자 무시

3. **aria-label on BreadcrumbCollapsed**
   - expandText prop으로 설정 (기본값: "Show path")
   - 스크린 리더가 "Show path button"으로 읽음

4. **Focus management**
   - 확장 버튼 클릭 시 포커스를 다른 요소로 이동
   - 접근성 유지

---

## 단순화 전략

Breadcrumbs는 **6단계 단순화**:

1. **PropTypes 제거** (75줄 + 21줄) - Breadcrumbs.js와 BreadcrumbCollapsed.js
2. **Slot 시스템 제거** - CollapsedIcon 고정
3. **useDefaultProps 제거** - 파라미터 기본값으로 대체
4. **스타일 시스템 제거** - useUtilityClasses, composeClasses, clsx
5. **overridesResolver 제거** - 테마 오버라이드 시스템
6. **테마 시스템 제거** - BreadcrumbCollapsed의 memoTheme 하드코딩

**단순화 후 예상 줄 수**: 약 150줄 (Breadcrumbs.js) + 약 40줄 (BreadcrumbCollapsed.js)

**유지할 핵심 기능**:
- insertSeparators 함수
- collapse/expand 로직
- renderItemsBeforeAndAfter 함수
- 접근성 (aria-label, focus 관리)
- children 필터링

---

## 결론

Breadcrumbs는 **브레드크럼 네비게이션의 표준 구현**으로, insertSeparators와 collapse/expand 로직이 핵심입니다. 단순화를 통해 학습에 불필요한 PropTypes, Slot 시스템, 테마 통합 등을 제거하여 핵심 브레드크럼 로직에 집중할 수 있습니다.
