# Grid 컴포넌트

> CSS Flexbox 기반 12-column 레이아웃 시스템, container/item 이중 역할 컴포넌트 (1,032줄 → 62줄)

---

## 이 문서의 목적

**이 문서는 단순화된 코드의 "상세 학습 가이드"입니다.**

라이브러리 코드는 복잡합니다. 단순화했더라도 코드만 보고는 이해하기 어려울 수 있습니다.
이 문서는 코드의 **동작 원리, 핵심 패턴, 왜 이렇게 구현했는지**를 상세히 설명하여 학습을 돕습니다.

> **원본 구조 파악**: 원본 코드의 빠른 이해는 `Grid-original.md` 참고

---

## 무슨 기능을 하는가?

수정된 Grid는 **하나의 컴포넌트가 container(flexbox 컨테이너)와 item(컬럼 아이템) 역할을 동시에 수행하는 12-column 레이아웃 시스템** 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **Container 역할** - `container` prop으로 flexbox 컨테이너 활성화, CSS `gap`으로 간격 관리
2. **Item 너비 계산** - `size` prop으로 12-column 기반 `calc()` 너비 계산 (gap 보정 포함)
3. **CSS 변수 상속** - container가 설정한 CSS custom properties를 item이 DOM 상속으로 자동 수신
4. **Offset** - `offset` prop으로 `marginLeft` 기반 아이템 위치 조정
5. **유연한 크기 모드** - `size` 값으로 고정 컬럼(number), 자동 크기('auto'), 남은 공간 채우기('grow') 지원

---

## 핵심 학습 포인트

이 컴포넌트에서 배울 수 있는 **핵심 개념과 패턴**을 코드와 함께 설명합니다.

### 1. CSS Custom Properties를 이용한 부모→자식 값 전달

```javascript
// Container가 CSS 변수를 inline style로 설정
...(container && {
  '--Grid-columns': columns,
  '--Grid-gap': gap,
})

// Item이 부모의 CSS 변수를 참조하여 너비 계산
...(typeof size === 'number' && {
  width: `calc(100% * ${size} / var(--Grid-columns) - ...)`,
})
```

**학습 가치**:
- CSS custom properties는 inline style에서 설정해도 자식 요소에 자동 상속됨
- React Context나 cloneElement 없이도 부모 → 자식 데이터 전달 가능
- CSS 자체의 상속 메커니즘을 활용하는 패턴으로, React 코드를 단순하게 유지할 수 있음
- 원본에서는 `> *` 셀렉터로 `--Grid-parent-columns`를 별도 설정했지만, CSS 상속만으로 동일한 효과 달성

### 2. Gap 보정이 포함된 12-column 너비 공식

```javascript
width: `calc(100% * ${size} / var(--Grid-columns)
  - (var(--Grid-columns) - ${size}) * var(--Grid-gap) / var(--Grid-columns))`
```

이 공식을 분해하면:
- `100% * size / columns` = 기본 비율 (예: 6/12 = 50%)
- `(columns - size) * gap / columns` = gap 보정값

**학습 가치**:
- CSS `gap`은 아이템 **사이에** 공간을 추가하므로, 아이템 너비를 그만큼 줄여야 함
- 12-column grid에서 `size=6`이면 한 행에 2개 아이템 → gap 1개 분의 공간을 2개가 나눠 가짐
- 이 공식은 size가 몇이든, columns가 몇이든 정확하게 동작하는 범용 공식
- 예시: `columns=12, size=4, gap=16px` → `calc(100% * 4/12 - (12-4) * 16px/12)` = `calc(33.33% - 10.67px)`

### 3. 하나의 컴포넌트로 Container/Item 이중 역할

```javascript
const style = {
  minWidth: 0,
  boxSizing: 'border-box',
  // container 역할일 때만 flex 컨테이너 스타일 적용
  ...(container && { display: 'flex', flexWrap: wrap, ... }),
  // size가 있으면 item 역할
  ...(typeof size === 'number' && { width: `calc(...)` }),
};
```

**학습 가치**:
- 같은 컴포넌트가 `container`와 `size`를 동시에 가질 수 있음 (container이면서 item)
- conditional spread (`...(condition && { ... })`)로 역할별 스타일을 깔끔하게 분리
- Grid v2에서는 `item` prop이 없어졌고, `size`를 주면 자동으로 item 역할을 수행

---

## 내부 구조

### 1. 렌더링 구조

```javascript
// 위치: packages/mui-material/src/Grid/Grid.js (62줄, 원본 1,032줄)

Grid (forwardRef)
  └─> <div>  ← inline style로 container/item 스타일 적용
       └─> children
```

### 2. 핵심 상태 (ref, state, 변수)

| 이름 | 타입 | 용도 |
|------|------|------|
| `gap` | 변수 | spacing 값을 CSS 단위 문자열로 변환 (예: `2` → `'16px'`) |
| `style` | 변수 | container/item 역할에 따른 완성된 inline style 객체 |

### 3. 함수 역할

Grid는 함수를 별도로 정의하지 않습니다. 모든 로직이 렌더링 시점에 style 객체를 구성하는 것으로 완결됩니다.

### 4. 동작 흐름

#### 스타일 결정 플로우차트

```
Grid 렌더링
        ↓
┌─────────────────────────────────┐
│ container === true?              │──→ YES → display:flex, gap 설정,
└─────────────────────────────────┘         CSS 변수(--Grid-columns, --Grid-gap) 설정
        ↓ NO (또는 동시에)
┌─────────────────────────────────┐
│ size === 'grow'?                 │──→ YES → flexGrow:1, flexBasis:0
└─────────────────────────────────┘
        ↓ NO
┌─────────────────────────────────┐
│ size === 'auto'?                 │──→ YES → width:auto, flexGrow:0
└─────────────────────────────────┘
        ↓ NO
┌─────────────────────────────────┐
│ typeof size === 'number'?        │──→ YES → width: calc() 공식 적용
└─────────────────────────────────┘
        ↓
┌─────────────────────────────────┐
│ offset 설정?                     │──→ YES → marginLeft 계산
└─────────────────────────────────┘
        ↓
<div style={style}> 렌더링
```

#### 시나리오 예시

**시나리오 1: 기본 2열 레이아웃**
```
<Grid container spacing={2}>      → display:flex, gap:16px, --Grid-columns:12
  <Grid size={6}>Item 1</Grid>    → width: calc(50% - 8px)
  <Grid size={6}>Item 2</Grid>    → width: calc(50% - 8px)
</Grid>
```
- gap 16px가 아이템 사이에 추가되므로, 각 아이템이 8px씩 양보

**시나리오 2: 비대칭 3열 레이아웃**
```
<Grid container spacing={3}>      → display:flex, gap:24px, --Grid-columns:12
  <Grid size={2}>Side</Grid>      → width: calc(16.67% - 20px)
  <Grid size={8}>Main</Grid>      → width: calc(66.67% - 8px)
  <Grid size={2}>Side</Grid>      → width: calc(16.67% - 20px)
</Grid>
```

**시나리오 3: offset 사용**
```
<Grid container spacing={2}>
  <Grid size={4} offset={4}>      → width: calc(33.33% - ...), marginLeft: calc(33.33% + ...)
    센터 정렬
  </Grid>
</Grid>
```

### 5. 핵심 패턴/플래그

#### CSS Custom Properties 상속 패턴

- **비유**: "부모가 칠판에 규칙을 적으면, 자식들은 자동으로 그 규칙을 따르는 것"
- **역할**: Container가 `--Grid-columns`와 `--Grid-gap`을 설정하면, 모든 자식 Grid 아이템이 DOM 상속을 통해 자동으로 이 값을 참조

**왜 필요한가?**

```javascript
// CSS 변수 없이 하려면:
// Item이 부모의 columns/spacing을 알 수 없음
<Grid container columns={12} spacing={2}>
  <Grid size={6}>
    {/* size=6인데, 총 몇 컬럼이고 gap이 몇인지 모름 → 너비 계산 불가 */}
  </Grid>
</Grid>
```

**CSS 변수가 있으면:**

```javascript
// Container가 CSS 변수를 설정
'--Grid-columns': 12,
'--Grid-gap': '16px',

// Item은 var()로 부모 값을 자동으로 참조
width: `calc(100% * 6 / var(--Grid-columns) - ...)`
// → calc(100% * 6 / 12 - ...) = 정확한 너비
```

#### Conditional Spread 패턴

- **비유**: "역할 카드를 가진 사람만 해당 복장을 입는 것"
- **역할**: `container`와 `size` prop의 유무에 따라 스타일을 조건부로 적용

```javascript
const style = {
  minWidth: 0,                      // 항상 적용 (기본 복장)
  ...(container && { ... }),          // container 카드 있으면 (flex 복장)
  ...(typeof size === 'number' && { ... }),  // size 카드 있으면 (너비 복장)
};
```

### 6. 주요 변경 사항 (원본 대비)

```javascript
// 원본: createGrid() factory로 컴포넌트 생성
const Grid = createGrid({
  createStyledComponent: styled('div', { name: 'MuiGrid', slot: 'Root' }),
  useThemeProps: (inProps) => useDefaultProps({ props: inProps, name: 'MuiGrid' }),
  useTheme,
});

// 단순화: React.forwardRef 직접 정의
const Grid = React.forwardRef(function Grid(props, ref) {
  // 모든 로직이 여기에 직접 포함
});
```

**원본과의 차이**:
- ❌ `createGrid()` factory → 직접 forwardRef 컴포넌트 (7개 파일 → 1개 파일)
- ❌ `traverseBreakpoints` → 단일값만 지원 (미디어 쿼리 반응형 제거)
- ❌ `parseResponsiveProp` → 배열/객체 입력 형태 제거
- ❌ `unstable_level` + `isMuiElement` → 네스팅 감지 제거
- ❌ `rowSpacing`/`columnSpacing` → `spacing`으로 통합
- ❌ `> *` 자식 셀렉터 → CSS 변수 상속으로 대체
- ❌ `component` prop → 항상 div
- ❌ `deleteLegacyGridProps` → v1 마이그레이션 불필요
- ✅ CSS 변수 기반 container→item 값 전달 유지
- ✅ `calc()` 너비 공식 유지 (gap 보정 포함)
- ✅ `size` 3가지 모드 유지 (number, 'auto', 'grow')
- ✅ `offset` 유지

### 7. Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | ReactNode | - | 자식 요소 |
| `className` | string | - | CSS 클래스 |
| `container` | boolean | `false` | flexbox 컨테이너 역할 활성화 |
| `size` | number \| 'auto' \| 'grow' | - | 12-column 기준 아이템 너비 |
| `spacing` | number \| string | `0` | 아이템 간 gap 간격 (number: 8px 배수) |
| `columns` | number | `12` | 총 컬럼 수 |
| `offset` | number \| 'auto' | - | marginLeft 오프셋 |
| `direction` | string | `'row'` | flex-direction |
| `wrap` | string | `'wrap'` | flex-wrap |

**제거된 Props**:
- ❌ `rowSpacing` / `columnSpacing` - `spacing`으로 통합 (행/열 간격을 분리할 필요 없음)
- ❌ `unstable_level` - 네스팅 레벨 자동 감지 제거
- ❌ `component` - 항상 div 렌더링
- ❌ `sx` - styled 시스템 의존 제거
- ❌ `slots` / `slotProps` - 슬롯 커스터마이징 불필요

---

## 커밋 히스토리로 보는 단순화 과정

Grid는 **5개의 커밋**을 통해 단순화되었습니다.

### 1단계: Factory 패턴 + 반응형 + 네스팅 제거

- `f29eaa42ab` - [Grid 단순화 1/5] Factory 패턴 + 반응형 + 네스팅 제거

**삭제된 코드**:
```javascript
// createGrid() factory - Joy UI/Material UI 공유를 위한 팩토리 패턴
const Grid = createGrid({
  createStyledComponent: styled('div', { name: 'MuiGrid', slot: 'Root' }),
  useThemeProps: (inProps) => useDefaultProps({ ... }),
  useTheme,
});

// traverseBreakpoints - 반응형 breakpoint 순회
traverseBreakpoints(theme.breakpoints, ownerState.size, (appendStyle, value) => { ... });

// parseResponsiveProp - 배열/객체 → breakpoint 맵 변환
if (Array.isArray(propValue)) { ... }
else if (typeof propValue === 'object') { ... }

// 네스팅 감지 - container Grid 자식 감지
if (isMuiElement(child, ['Grid']) && container && child.props.container) {
  return React.cloneElement(child, { unstable_level: level + 1 });
}
```

**왜 불필요한가**:
- **학습 목적**: Grid의 핵심은 "12-column flexbox + gap + calc()"이지 factory/responsive/nesting이 아님
- **복잡도**: 7개 파일 1,032줄 → 1개 파일로 통합. traverseBreakpoints(58줄), parseResponsiveProp, gridGenerator 7개 함수, deleteLegacyGridProps(54줄) 모두 제거

### 2단계: useUtilityClasses 제거

- `61d67403c7` - [Grid 단순화 2/5] useUtilityClasses 제거

**삭제된 코드**:
```javascript
const useUtilityClasses = (ownerState) => {
  const slots = { root: ['root', container && 'container', ...] };
  return composeClasses(slots, (slot) => generateUtilityClass('MuiGrid', slot), {});
};
```

**왜 불필요한가**:
- **학습 목적**: MUI 내부 인프라, Grid 레이아웃 학습과 무관
- **복잡도**: generateSizeClassNames, generateSpacingClassNames, generateDirectionClasses 3개 함수 + composeClasses 유틸 제거

### 3단계: Theme 시스템 제거

- `4f286dc0ed` - [Grid 단순화 3/5] Theme 시스템 제거

**삭제된 코드**:
```javascript
import { useDefaultProps } from '../DefaultPropsProvider';
import useTheme from '../styles/useTheme';

// theme.spacing(value) → 하드코딩
const gap = theme.spacing(ownerState.spacing);  // → `${spacing * 8}px`

// useDefaultProps → props 직접 사용
const props = useDefaultProps({ props: inProps, name: 'MuiGrid' });
```

**왜 불필요한가**:
- **학습 목적**: 테마 인프라 제거해도 Grid 레이아웃 동작 동일
- **복잡도**: `theme.spacing()` 함수를 `${value * 8}px`로 하드코딩하면 의존성 제거

### 4단계: styled → inline styles

- `60068cca12` - [Grid 단순화 4/5] styled → inline styles

**삭제된 코드**:
```javascript
import { styled } from '../styles';

const GridRoot = styled('div')(({ ownerState }) => {
  // ... 스타일 객체 반환
});

// ownerState 전달
<GridRoot ownerState={ownerState} ... />
```

**대체된 코드**:
```javascript
// inline style 직접 계산
const style = { minWidth: 0, ...(container && { display: 'flex', ... }) };
<div style={style} ... />
```

**왜 불필요한가**:
- **학습 목적**: styled API는 CSS-in-JS 인프라이지 Grid 레이아웃 로직이 아님
- **핵심 발견**: CSS custom properties는 inline style에서 설정해도 자식에게 상속됨 → `> *` 셀렉터 없이도 container→item 값 전달 가능

### 5단계: PropTypes 제거

- `68e9bb31cf` - [Grid 단순화 5/5] PropTypes 제거

**삭제된 코드**:
```javascript
Grid.propTypes = { children: PropTypes.node, columns: PropTypes.number, ... };
```

**왜 불필요한가**:
- **학습 목적**: 런타임 타입 검증 메타데이터, 컴포넌트 동작과 무관

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 1,032줄 (7개 파일) | 62줄 (1개 파일, 94% 감소) |
| **Props 개수** | 13개 | 9개 |
| **Factory 패턴** | ✅ createGrid() | ❌ 직접 forwardRef |
| **반응형 props** | ✅ 배열/객체/단일값 | ❌ 단일값만 |
| **네스팅** | ✅ unstable_level 자동 감지 | ❌ 제거 |
| **CSS 변수** | ✅ parent/self 분리 + `> *` 셀렉터 | ✅ 단일 변수 + 상속 |
| **너비 공식** | ✅ calc() + CSS 변수 | ✅ 동일 |
| **size 모드** | ✅ number/auto/grow | ✅ 동일 |
| **offset** | ✅ | ✅ 동일 |
| **direction/wrap** | ✅ 반응형 | ✅ 단일값 |
| **styled 시스템** | ✅ 7개 generator 함수 | ❌ inline styles |

---

## 학습 후 다음 단계

Grid를 이해했다면:

1. **Container** - Grid가 flex container로 동작할 때의 기본 설정이 `display: flex; flex-wrap: wrap; gap`임을 이해
2. **Box** - Grid보다 단순한 레이아웃 컴포넌트, sx prop 기반
3. **실전 응용** - CSS custom properties + calc()를 활용한 자체 그리드 시스템 구축

**예시: 기본 사용**
```jsx
<Grid container spacing={2}>
  <Grid size={4}>왼쪽 (4/12)</Grid>
  <Grid size={8}>오른쪽 (8/12)</Grid>
</Grid>
```

**예시: 복잡한 레이아웃**
```jsx
<Grid container spacing={3} columns={12}>
  <Grid size={12}>헤더 (전체 너비)</Grid>
  <Grid size={3}>사이드바 (3/12)</Grid>
  <Grid size={6}>메인 콘텐츠 (6/12)</Grid>
  <Grid size={3}>위젯 (3/12)</Grid>
  <Grid size={4} offset={4}>중앙 정렬 푸터 (offset으로 밀기)</Grid>
</Grid>
```

**예시: 유연한 크기**
```jsx
<Grid container spacing={2}>
  <Grid size={3}>고정 3컬럼</Grid>
  <Grid size="grow">나머지 공간 채움</Grid>
  <Grid size="auto">콘텐츠 크기만큼</Grid>
</Grid>
```
