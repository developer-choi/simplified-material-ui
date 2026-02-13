# Breadcrumbs 컴포넌트 단순화 분석 (Simplified Version)

> 이 문서는 `packages/mui-material/src/Breadcrumbs/Breadcrumbs.js` (166줄)와 `BreadcrumbCollapsed.js` (45줄)의 **단순화 후** 상태를 분석합니다.

## 목차
- [개요](#개요)
- [단순화 결과](#단순화-결과)
- [주요 변경사항](#주요-변경사항)
- [컴포넌트 구조](#컴포넌트-구조)
- [Props 분석](#props-분석)
- [핵심 로직](#핵심-로직)
- [스타일 컴포넌트](#스타일-컴포넌트)
- [BreadcrumbCollapsed 컴포넌트](#breadcrumbcollapsed-컴포넌트)
- [학습 포인트](#학습-포인트)

---

## 개요

**Breadcrumbs 컴포넌트**는 브레드크럼 네비게이션 UI를 렌더링하는 컴포넌트입니다.

### 단순화 목표
Material-UI의 복잡한 기능들을 제거하고, **핵심 브레드크럼 기능에 집중**하여 학습 난이도를 낮춤:
- 아이템 사이 구분자 삽입
- maxItems 초과 시 collapse 기능
- 확장 버튼 클릭 시 모든 아이템 표시
- 접근성 지원 (aria-label, focus 관리)

### 파일 정보
- **파일**: `packages/mui-material/src/Breadcrumbs/Breadcrumbs.js`
- **줄 수**: 166줄 (원본 280줄에서 **41% 감소**)
- **보조 파일**: `BreadcrumbCollapsed.js` - 45줄 (원본 82줄에서 **45% 감소**)
- **전체**: 211줄 (원본 362줄에서 **42% 감소**)

---

## 단순화 결과

### 제거된 기능 (6개 커밋)

| 커밋 | 제거 항목 | 이유 |
|------|-----------|------|
| 1 | **PropTypes** | 런타임 타입 검증은 컴포넌트 로직 학습에 불필요 |
| 2 | **Slot 시스템** | 고정된 아이콘으로도 브레드크럼 개념 이해 가능 |
| 3 | **useDefaultProps** | 함수 파라미터 기본값으로 충분 |
| 4 | **스타일 시스템** | 클래스 병합 로직이 복잡도 증가 |
| 5 | **overridesResolver** | 스타일 오버라이드는 학습 목표가 아님 |
| 6 | **테마 시스템** | 하드코딩된 값으로도 동작 이해 가능 |

### 유지된 핵심 기능

✅ **insertSeparators** - 아이템 사이 구분자 삽입 로직
✅ **Collapse/Expand** - maxItems 초과 시 일부 아이템 숨김 및 확장
✅ **BreadcrumbCollapsed** - collapse 버튼 컴포넌트
✅ **접근성** - aria-label, focus 관리
✅ **개발 환경 경고** - Fragment 감지, invalid props 경고

---

## 주요 변경사항

### 1. PropTypes 제거 (Commit 1)

**Before (280줄)**:
```javascript
import PropTypes from 'prop-types';
import integerPropType from '@mui/utils/integerPropType';

Breadcrumbs.propTypes = {
  children: PropTypes.node,
  classes: PropTypes.object,
  className: PropTypes.string,
  component: PropTypes.elementType,
  expandText: PropTypes.string,
  itemsAfterCollapse: integerPropType,
  itemsBeforeCollapse: integerPropType,
  maxItems: integerPropType,
  separator: PropTypes.node,
  slotProps: PropTypes.shape({
    collapsedIcon: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  }),
  slots: PropTypes.shape({
    CollapsedIcon: PropTypes.elementType,
  }),
  sx: PropTypes.oneOfType([...]),
};
```

**After (166줄)**:
```javascript
// PropTypes 완전 제거 (약 75줄 감소)
```

### 2. Slot 시스템 제거 (Commit 2)

**Before**:
```javascript
import useSlotProps from '@mui/utils/useSlotProps';

const {
  slots = {},
  slotProps = {},
  // ...
} = props;

const collapsedIconSlotProps = useSlotProps({
  elementType: slots.CollapsedIcon,
  externalSlotProps: slotProps.collapsedIcon,
  ownerState,
});

<BreadcrumbCollapsed
  slots={{ CollapsedIcon: slots.CollapsedIcon }}
  slotProps={{ collapsedIcon: collapsedIconSlotProps }}
  onClick={handleClickExpand}
/>

// BreadcrumbCollapsed.js
function BreadcrumbCollapsed(props) {
  const { slots = {}, slotProps = {}, ...otherProps } = props;
  return (
    <BreadcrumbCollapsedIcon
      as={slots.CollapsedIcon}
      {...slotProps.collapsedIcon}
    />
  );
}
```

**After**:
```javascript
// useSlotProps import 제거
// slots, slotProps props 제거

<BreadcrumbCollapsed
  aria-label={expandText}
  key="ellipsis"
  onClick={handleClickExpand}
/>

// BreadcrumbCollapsed.js
function BreadcrumbCollapsed(props) {
  const ownerState = props;
  return (
    <BreadcrumbCollapsedIcon ownerState={ownerState} />
  );
}
```

### 3. useDefaultProps 제거 (Commit 3)

**Before**:
```javascript
import { useDefaultProps } from '../DefaultPropsProvider';

const Breadcrumbs = React.forwardRef(function Breadcrumbs(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuiBreadcrumbs' });
  const {
    children,
    className,
    component = 'nav',
    // ...
  } = props;
```

**After**:
```javascript
// useDefaultProps import 제거

const Breadcrumbs = React.forwardRef(function Breadcrumbs(props, ref) {
  const {
    children,
    className,
    component = 'nav',
    expandText = 'Show path',
    itemsAfterCollapse = 1,
    itemsBeforeCollapse = 1,
    maxItems = 8,
    separator = '/',
    // ...
  } = props;
```

### 4. 스타일 시스템 제거 (Commit 4)

**Before**:
```javascript
import clsx from 'clsx';
import composeClasses from '@mui/utils/composeClasses';
import breadcrumbsClasses, { getBreadcrumbsUtilityClass } from './breadcrumbsClasses';

const useUtilityClasses = (ownerState) => {
  const { classes } = ownerState;
  const slots = {
    root: ['root'],
    li: ['li'],
    ol: ['ol'],
    separator: ['separator'],
  };
  return composeClasses(slots, getBreadcrumbsUtilityClass, classes);
};

const classes = useUtilityClasses(ownerState);

<li className={classes.li}>
<BreadcrumbsRoot className={clsx(classes.root, className)}>
<BreadcrumbsOl className={classes.ol}>
<BreadcrumbsSeparator className={classes.separator}>
```

**After**:
```javascript
// clsx, composeClasses, breadcrumbsClasses import 제거
// useUtilityClasses() 함수 제거
// classes 계산 제거

<li key={`child-${index}`}>
<BreadcrumbsRoot className={className}>
<BreadcrumbsOl ref={listRef}>
<BreadcrumbsSeparator aria-hidden>
```

### 5. overridesResolver 제거 (Commit 5)

**Before**:
```javascript
const BreadcrumbsRoot = styled(Typography, {
  name: 'MuiBreadcrumbs',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    return [{ [`& .${breadcrumbsClasses.li}`]: styles.li }, styles.root];
  },
})({});
```

**After**:
```javascript
const BreadcrumbsRoot = styled(Typography, {
  name: 'MuiBreadcrumbs',
  slot: 'Root',
})({});
```

### 6. 테마 시스템 제거 (Commit 6, BreadcrumbCollapsed.js)

**Before**:
```javascript
import { emphasize } from '@mui/system/colorManipulator';
import memoTheme from '../utils/memoTheme';

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

**After**:
```javascript
// emphasize, memoTheme import 제거

const BreadcrumbCollapsedButton = styled(ButtonBase, {
  name: 'MuiBreadcrumbCollapsed',
})({
  display: 'flex',
  marginLeft: '4px',
  marginRight: '4px',
  backgroundColor: '#f5f5f5',
  color: '#616161',
  borderRadius: 2,
  '&:hover, &:focus': {
    backgroundColor: '#eeeeee',
  },
  '&:active': {
    boxShadow: 'none',
    backgroundColor: '#e0e0e0',
  },
});
```

**하드코딩된 값**:
- `theme.spacing(1) * 0.5` → `'4px'`
- `theme.palette.grey[100]` → `'#f5f5f5'`
- `theme.palette.grey[200]` → `'#eeeeee'`
- `theme.palette.grey[700]` → `'#616161'`
- `emphasize(grey[200], 0.12)` → `'#e0e0e0'`
- `theme.shadows[0]` → `'none'`

---

## 컴포넌트 구조

### Import 의존성

```javascript
'use client';
import * as React from 'react';
import { isFragment } from 'react-is';
import { styled } from '../zero-styled';
import Typography from '../Typography';
import BreadcrumbCollapsed from './BreadcrumbCollapsed';
```

**6개 import만 사용** (원본 11개에서 감소):
- `React` - 핵심 React API
- `isFragment` - Fragment 감지 (개발 환경 경고용)
- `styled` - 스타일 컴포넌트 생성
- `Typography` - Root 컴포넌트 베이스
- `BreadcrumbCollapsed` - Collapse 버튼 컴포넌트

---

## Props 분석

### Props 구조 분해

```javascript
const {
  children,            // 브레드크럼 아이템들
  className,           // 추가 CSS 클래스
  component = 'nav',   // 루트 엘리먼트 타입
  expandText = 'Show path',        // 확장 버튼 라벨
  itemsAfterCollapse = 1,          // collapse 후 표시 항목 수
  itemsBeforeCollapse = 1,         // collapse 전 표시 항목 수
  maxItems = 8,                    // 최대 표시 항목 수
  separator = '/',                 // 구분자
  ...other             // 나머지 HTML 속성
} = props;
```

### Props 비교

| Props | 원본 | 단순화 후 | 설명 |
|-------|------|-----------|------|
| `children` | ✅ | ✅ | 브레드크럼 아이템들 |
| `className` | ✅ | ✅ | 추가 CSS 클래스 |
| `component` | ✅ | ✅ | 루트 엘리먼트 (기본값: 'nav') |
| `expandText` | ✅ | ✅ | 확장 버튼 라벨 |
| `itemsAfterCollapse` | ✅ | ✅ | collapse 후 표시 항목 수 |
| `itemsBeforeCollapse` | ✅ | ✅ | collapse 전 표시 항목 수 |
| `maxItems` | ✅ | ✅ | 최대 표시 항목 수 |
| `separator` | ✅ | ✅ | 구분자 (기본값: '/') |
| `slots` | ✅ | ❌ | Slot 시스템 제거 |
| `slotProps` | ✅ | ❌ | Slot 시스템 제거 |
| `classes` | ✅ | ❌ | 스타일 시스템 제거 |

**핵심 Props 모두 유지**, 학습에 불필요한 Props만 제거

---

## 핵심 로직

### 1. insertSeparators 함수 (35-54번 줄)

**역할**: 아이템 사이에 구분자를 삽입

```javascript
function insertSeparators(items, separator, ownerState) {
  return items.reduce((acc, current, index) => {
    if (index < items.length - 1) {
      // 마지막 아이템이 아니면 구분자 추가
      acc = acc.concat(
        current,
        <BreadcrumbsSeparator
          aria-hidden
          key={`separator-${index}`}
          ownerState={ownerState}
        >
          {separator}
        </BreadcrumbsSeparator>,
      );
    } else {
      // 마지막 아이템은 구분자 없이 추가
      acc.push(current);
    }
    return acc;
  }, []);
}
```

**변경사항**:
- ~~`className` 파라미터 제거~~ (스타일 시스템 제거)
- `separator`, `ownerState` 파라미터만 사용

**예시**:
```javascript
// 입력: [<Link>Home</Link>, <Link>Catalog</Link>, <Typography>Product</Typography>]
// 출력: [
//   <Link>Home</Link>,
//   <BreadcrumbsSeparator>/</BreadcrumbsSeparator>,
//   <Link>Catalog</Link>,
//   <BreadcrumbsSeparator>/</BreadcrumbsSeparator>,
//   <Typography>Product</Typography>
// ]
```

### 2. renderItemsBeforeAndAfter 함수 (83-120번 줄)

**역할**: maxItems 초과 시 일부 아이템을 collapse하고, 확장 버튼을 추가

```javascript
const renderItemsBeforeAndAfter = (allItems) => {
  const handleClickExpand = () => {
    setExpanded(true);

    // Focus 관리: 클릭된 버튼이 DOM에서 제거되므로,
    // focus를 다른 요소로 이동하여 접근성 유지
    const focusable = listRef.current.querySelector('a[href],button,[tabindex]');
    if (focusable) {
      focusable.focus();
    }
  };

  // 유효성 검증: itemsBeforeCollapse + itemsAfterCollapse >= allItems.length이면
  // collapse할 필요 없으므로 모든 아이템 반환
  if (itemsBeforeCollapse + itemsAfterCollapse >= allItems.length) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        [
          'MUI: You have provided an invalid combination of props to the Breadcrumbs.',
          `itemsAfterCollapse={${itemsAfterCollapse}} + itemsBeforeCollapse={${itemsBeforeCollapse}} >= maxItems={${maxItems}}`,
        ].join('\n'),
      );
    }
    return allItems;
  }

  // Collapse: itemsBeforeCollapse 개수만큼 앞에서 가져오고,
  // 중간에 BreadcrumbCollapsed 버튼 삽입,
  // itemsAfterCollapse 개수만큼 뒤에서 가져옴
  return [
    ...allItems.slice(0, itemsBeforeCollapse),
    <BreadcrumbCollapsed
      aria-label={expandText}
      key="ellipsis"
      onClick={handleClickExpand}
    />,
    ...allItems.slice(allItems.length - itemsAfterCollapse, allItems.length),
  ];
};
```

**예시** (itemsBeforeCollapse=1, itemsAfterCollapse=1, maxItems=3):
```javascript
// 입력: [Home, Category, Subcategory, Product, Detail] (5개)
// 출력: [Home, <BreadcrumbCollapsed />, Detail]
//       (첫 1개 + collapse 버튼 + 마지막 1개)
```

**Focus 관리**:
- 확장 버튼 클릭 시, 버튼이 DOM에서 제거됨
- Focus가 사라지지 않도록 `listRef.current`에서 포커스 가능한 요소를 찾아 focus 이동
- 접근성 향상: NVDA 등 스크린 리더에서 announcement 가능

### 3. allItems 생성 (122-141번 줄)

**역할**: children을 필터링하고 `<li>` 태그로 감싸기

```javascript
const allItems = React.Children.toArray(children)
  .filter((child) => {
    // Fragment 감지 (개발 환경)
    if (process.env.NODE_ENV !== 'production') {
      if (isFragment(child)) {
        console.error(
          [
            "MUI: The Breadcrumbs component doesn't accept a Fragment as a child.",
            'Consider providing an array instead.',
          ].join('\n'),
        );
      }
    }

    // 유효한 React 엘리먼트만 포함
    return React.isValidElement(child);
  })
  .map((child, index) => (
    <li key={`child-${index}`}>
      {child}
    </li>
  ));
```

**변경사항**:
- ~~`className={classes.li}` 제거~~ (스타일 시스템 제거)
- `key` 속성만 유지

### 4. 렌더링 로직 (143-162번 줄)

```javascript
return (
  <BreadcrumbsRoot
    ref={ref}
    component={component}
    color="textSecondary"
    className={className}
    ownerState={ownerState}
    {...other}
  >
    <BreadcrumbsOl ref={listRef} ownerState={ownerState}>
      {insertSeparators(
        expanded || (maxItems && allItems.length <= maxItems)
          ? allItems                        // 확장 모드 또는 maxItems 이하
          : renderItemsBeforeAndAfter(allItems),  // collapse 모드
        separator,
        ownerState,
      )}
    </BreadcrumbsOl>
  </BreadcrumbsRoot>
);
```

**조건부 렌더링**:
1. `expanded === true` → 모든 아이템 표시
2. `maxItems && allItems.length <= maxItems` → maxItems 이하이면 모든 아이템 표시
3. 그 외 → `renderItemsBeforeAndAfter(allItems)` 호출 (collapse 모드)

---

## 스타일 컴포넌트

### 1. BreadcrumbsRoot (8-11번 줄)

```javascript
const BreadcrumbsRoot = styled(Typography, {
  name: 'MuiBreadcrumbs',
  slot: 'Root',
})({});
```

- **베이스**: `Typography` 컴포넌트
- **스타일**: 빈 객체 (Typography의 기본 스타일 사용)
- **Props**: `component`, `color`, `className`, `ownerState`, `ref`

### 2. BreadcrumbsOl (13-23번 줄)

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

- **베이스**: `ol` 태그
- **스타일**: Flexbox 레이아웃
  - `display: flex` - 가로 배치
  - `flexWrap: wrap` - 너비 초과 시 줄바꿈
  - `alignItems: center` - 세로 중앙 정렬
  - `listStyle: none` - 리스트 마커 제거

### 3. BreadcrumbsSeparator (25-33번 줄)

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

- **베이스**: `li` 태그
- **스타일**:
  - `display: flex` - Flexbox 레이아웃
  - `userSelect: none` - 텍스트 선택 불가
  - `marginLeft/Right: 8` - 좌우 8px 여백

---

## BreadcrumbCollapsed 컴포넌트

### 전체 코드 (BreadcrumbCollapsed.js, 45줄)

```javascript
'use client';
import { styled } from '../zero-styled';
import MoreHorizIcon from '../internal/svg-icons/MoreHoriz';
import ButtonBase from '../../../form/ButtonBase';

const BreadcrumbCollapsedButton = styled(ButtonBase, {
  name: 'MuiBreadcrumbCollapsed',
})({
  display: 'flex',
  marginLeft: '4px',
  marginRight: '4px',
  backgroundColor: '#f5f5f5',
  color: '#616161',
  borderRadius: 2,
  '&:hover, &:focus': {
    backgroundColor: '#eeeeee',
  },
  '&:active': {
    boxShadow: 'none',
    backgroundColor: '#e0e0e0',
  },
});

const BreadcrumbCollapsedIcon = styled(MoreHorizIcon)({
  width: 24,
  height: 16,
});

function BreadcrumbCollapsed(props) {
  const ownerState = props;

  return (
    <li>
      <BreadcrumbCollapsedButton focusRipple {...props} ownerState={ownerState}>
        <BreadcrumbCollapsedIcon ownerState={ownerState} />
      </BreadcrumbCollapsedButton>
    </li>
  );
}

export default BreadcrumbCollapsed;
```

### 스타일 분석

**BreadcrumbCollapsedButton**:
- `display: flex` - 아이콘 중앙 정렬
- `marginLeft/Right: 4px` - 좌우 4px 여백
- `backgroundColor: #f5f5f5` - 밝은 회색 배경
- `color: #616161` - 어두운 회색 텍스트
- `borderRadius: 2` - 2px 모서리 둥글기
- **Hover/Focus**: `backgroundColor: #eeeeee` (더 밝은 회색)
- **Active**: `backgroundColor: #e0e0e0` (클릭 시 더 어두운 회색)

**BreadcrumbCollapsedIcon**:
- `width: 24px`, `height: 16px` - 아이콘 크기

### Props 전달

```javascript
<BreadcrumbCollapsed
  aria-label={expandText}
  key="ellipsis"
  onClick={handleClickExpand}
/>
```

- `aria-label` - 접근성 레이블 (스크린 리더용)
- `onClick` - 확장 버튼 클릭 핸들러
- `focusRipple` - ButtonBase의 ripple 효과

---

## 학습 포인트

### 1. Array.reduce()를 사용한 insertSeparators

```javascript
function insertSeparators(items, separator, ownerState) {
  return items.reduce((acc, current, index) => {
    if (index < items.length - 1) {
      acc = acc.concat(current, <BreadcrumbsSeparator>...</BreadcrumbsSeparator>);
    } else {
      acc.push(current);
    }
    return acc;
  }, []);
}
```

**학습 포인트**:
- `reduce()` - 배열을 순회하며 새로운 배열 생성
- `acc.concat()` - 배열에 여러 요소 추가 (아이템 + 구분자)
- `acc.push()` - 배열에 단일 요소 추가 (마지막 아이템)

### 2. React.Children.toArray()와 isValidElement()

```javascript
const allItems = React.Children.toArray(children)
  .filter((child) => React.isValidElement(child))
  .map((child, index) => <li key={`child-${index}`}>{child}</li>);
```

**학습 포인트**:
- `React.Children.toArray()` - children을 배열로 변환 (key 자동 할당)
- `React.isValidElement()` - 유효한 React 엘리먼트인지 확인
- `isFragment()` - Fragment인지 확인 (개발 환경 경고)

### 3. Array.slice()를 사용한 Collapse 로직

```javascript
return [
  ...allItems.slice(0, itemsBeforeCollapse),        // 첫 N개
  <BreadcrumbCollapsed key="ellipsis" />,           // 확장 버튼
  ...allItems.slice(allItems.length - itemsAfterCollapse, allItems.length),  // 마지막 M개
];
```

**학습 포인트**:
- `slice(0, N)` - 첫 N개 요소 추출
- `slice(length - M, length)` - 마지막 M개 요소 추출
- Spread operator (`...`) - 배열 평탄화

### 4. Focus 관리 (접근성)

```javascript
const handleClickExpand = () => {
  setExpanded(true);

  // 클릭된 버튼이 DOM에서 제거되므로, focus를 다른 요소로 이동
  const focusable = listRef.current.querySelector('a[href],button,[tabindex]');
  if (focusable) {
    focusable.focus();
  }
};
```

**학습 포인트**:
- `querySelector()` - CSS 선택자로 DOM 요소 찾기
- `focus()` - 포커스 이동
- `a[href], button, [tabindex]` - 포커스 가능한 요소 선택자
- **접근성**: 키보드 사용자와 스크린 리더 사용자를 위한 focus 관리

### 5. 조건부 렌더링

```javascript
{insertSeparators(
  expanded || (maxItems && allItems.length <= maxItems)
    ? allItems                        // 확장 모드 또는 maxItems 이하
    : renderItemsBeforeAndAfter(allItems),  // collapse 모드
  separator,
  ownerState,
)}
```

**학습 포인트**:
- 삼항 연산자 - 조건부 렌더링
- `expanded === true` - 확장 모드
- `maxItems && allItems.length <= maxItems` - maxItems 이하 (collapse 불필요)

### 6. ownerState 패턴

```javascript
const ownerState = {
  ...props,
  component,
  expanded,
  expandText,
  itemsAfterCollapse,
  itemsBeforeCollapse,
  maxItems,
  separator,
};

<BreadcrumbsRoot ownerState={ownerState} />
<BreadcrumbsOl ownerState={ownerState} />
<BreadcrumbsSeparator ownerState={ownerState} />
```

**학습 포인트**:
- `ownerState` - 컴포넌트 상태를 styled 컴포넌트에 전달
- 스타일 컴포넌트에서 동적 스타일링에 활용 가능
- 단순화 후에는 사용하지 않지만, 확장성을 위해 유지

### 7. 개발 환경 경고

```javascript
if (process.env.NODE_ENV !== 'production') {
  if (isFragment(child)) {
    console.error("MUI: The Breadcrumbs component doesn't accept a Fragment as a child.");
  }
}

if (process.env.NODE_ENV !== 'production') {
  if (itemsBeforeCollapse + itemsAfterCollapse >= allItems.length) {
    console.error('MUI: You have provided an invalid combination of props to the Breadcrumbs.');
  }
}
```

**학습 포인트**:
- `process.env.NODE_ENV` - 개발/프로덕션 환경 구분
- 개발 환경에서만 경고 메시지 출력 (프로덕션 번들 크기 감소)
- Fragment 감지, invalid props 검증

---

## 사용 예시

### 1. 기본 사용

```javascript
<Breadcrumbs>
  <Link href="/">Home</Link>
  <Link href="/catalog">Catalog</Link>
  <Typography>Product</Typography>
</Breadcrumbs>
```

**렌더링 결과**:
```
Home / Catalog / Product
```

### 2. 커스텀 구분자

```javascript
<Breadcrumbs separator=">">
  <Link href="/">Home</Link>
  <Link href="/catalog">Catalog</Link>
  <Typography>Product</Typography>
</Breadcrumbs>
```

**렌더링 결과**:
```
Home > Catalog > Product
```

### 3. Collapse 기능

```javascript
<Breadcrumbs maxItems={3} itemsBeforeCollapse={1} itemsAfterCollapse={1}>
  <Link href="/">Home</Link>
  <Link href="/category">Category</Link>
  <Link href="/subcategory">Subcategory</Link>
  <Link href="/product">Product</Link>
  <Typography>Detail</Typography>
</Breadcrumbs>
```

**렌더링 결과** (collapse 모드):
```
Home / ... / Detail
```

**클릭 후** (expanded 모드):
```
Home / Category / Subcategory / Product / Detail
```

### 4. 확장 텍스트 커스터마이징

```javascript
<Breadcrumbs expandText="전체 경로 보기">
  {/* 5개 이상의 아이템 */}
</Breadcrumbs>
```

**접근성**: `aria-label="전체 경로 보기"` 적용

---

## 요약

### 단순화 효과

| 항목 | 원본 | 단순화 후 | 변화 |
|------|------|-----------|------|
| **Breadcrumbs.js** | 280줄 | 166줄 | **-41%** |
| **BreadcrumbCollapsed.js** | 82줄 | 45줄 | **-45%** |
| **전체** | 362줄 | 211줄 | **-42%** |
| **Import 수** | 11개 | 6개 | **-45%** |
| **Props 수** | 11개 | 8개 | **-27%** |

### 핵심 기능 100% 유지

✅ **insertSeparators** - 아이템 사이 구분자 삽입
✅ **Collapse/Expand** - maxItems 초과 시 일부 아이템 숨김 및 확장
✅ **BreadcrumbCollapsed** - collapse 버튼 컴포넌트
✅ **접근성** - aria-label, focus 관리
✅ **개발 환경 경고** - Fragment 감지, invalid props 경고

### 제거된 복잡도

❌ **PropTypes** (75줄) - 런타임 타입 검증
❌ **Slot 시스템** (18줄) - CollapsedIcon 커스터마이징
❌ **useDefaultProps** (3줄) - 테마 기반 기본 props
❌ **스타일 시스템** (24줄) - useUtilityClasses, composeClasses, clsx
❌ **overridesResolver** (3줄) - 스타일 오버라이드
❌ **테마 시스템** (24줄) - memoTheme, emphasize

### 학습 효과

단순화를 통해 **핵심 로직에 집중**할 수 있게 되었습니다:

1. **Array 메서드 활용**: `reduce()`, `slice()`, `filter()`, `map()`
2. **React API**: `React.Children.toArray()`, `React.isValidElement()`, `isFragment()`
3. **Collapse 패턴**: 배열 분할 및 조건부 렌더링
4. **접근성**: Focus 관리, aria-label
5. **개발 환경 경고**: `process.env.NODE_ENV` 활용
6. **styled 컴포넌트**: 간결한 스타일링
7. **ButtonBase**: 하드코딩된 스타일로 버튼 구현

Material-UI의 복잡한 추상화 없이, **순수한 React와 CSS로 브레드크럼을 구현하는 방법**을 학습할 수 있습니다.
