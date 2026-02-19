# Grid 컴포넌트

> Grid 컴포넌트 원본 구조 빠른 파악

**⚠️ 이 문서의 목적**: 간소화 작업 **전에** 원본 코드를 빠르게 이해하기 위한 요약 문서입니다.

---

## 무슨 기능을 하는가?

Grid는 **Flexbox 기반 12-column 레이아웃 시스템으로, container/item 이중 역할을 하는 하나의 컴포넌트**입니다.

### 핵심 기능
1. **Container/Item 이중 역할** - `container` prop으로 flexbox 컨테이너, `size` prop으로 아이템 역할 수행
2. **12-column 너비 계산** - `size` prop 값에 따라 `calc()` 공식으로 정확한 너비 계산 (gap 보정 포함)
3. **CSS 변수 기반 값 전달** - `--Grid-columns`, `--Grid-parent-columns` 등 CSS 변수로 container → item 값 전달
4. **반응형 props** - 모든 주요 prop이 단일값/배열/객체 형태를 지원하여 breakpoint별 레이아웃 가능
5. **네스팅 지원** - Grid 안의 Grid를 감지하여 `unstable_level` 자동 증가, parent/self CSS 변수 분리
6. **gap 기반 spacing** - CSS `gap` 속성으로 아이템 간 간격 관리
7. **offset** - `marginLeft` 기반 오프셋으로 아이템 위치 조정

---

## 주요 코드 구조

### 파일 위치 및 크기

```
packages/mui-material/src/Grid/Grid.tsx (282줄) - createGrid() 래퍼
packages/mui-system/src/Grid/createGrid.tsx (253줄) - Factory 핵심 구현
packages/mui-system/src/Grid/gridGenerator.ts (227줄) - 스타일 생성 함수 7개
packages/mui-system/src/Grid/traverseBreakpoints.ts (58줄) - 반응형 breakpoint 순회
packages/mui-system/src/Grid/deleteLegacyGridProps.ts (54줄) - v1→v2 마이그레이션 헬퍼
packages/mui-system/src/Grid/GridProps.ts (117줄) - 타입 정의
packages/mui-material/src/Grid/gridClasses.ts (41줄) - 클래스 정의
총 ~1,032줄 (7개 파일)
```

### 렌더링 구조

```
Grid (forwardRef) ← createGrid() factory로 생성
  └─> GridRoot (styled div) ← 7개 generator 함수로 스타일 생성
       └─> children ← container Grid인 자식을 감지하여 unstable_level 자동 주입
```

### 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `container` | boolean | `false` | flexbox 컨테이너 역할 활성화 |
| `size` | ResponsiveStyleValue | `{}` | 12-column 기준 너비 (number\|'auto'\|'grow') |
| `spacing` | ResponsiveStyleValue | `0` | 아이템 간 gap 간격 |
| `columns` | ResponsiveStyleValue | `12` | 총 컬럼 수 |
| `offset` | ResponsiveStyleValue | `{}` | marginLeft 오프셋 |
| `direction` | ResponsiveStyleValue | `'row'` | flex-direction |
| `wrap` | string | `'wrap'` | flex-wrap |
| `rowSpacing` | ResponsiveStyleValue | spacing | 세로 간격 (spacing 오버라이드) |
| `columnSpacing` | ResponsiveStyleValue | spacing | 가로 간격 (spacing 오버라이드) |
| `unstable_level` | number | `0` | 네스팅 레벨 (내부용) |
| `component` | elementType | `'div'` | 렌더링할 HTML 요소 |

### 핵심 로직 발췌

```javascript
// 1. Factory 패턴: createGrid()가 옵션을 받아 컴포넌트 생성
const Grid = createGrid({
  createStyledComponent: styled('div', { name: 'MuiGrid', slot: 'Root' }),
  useThemeProps: (inProps) => useDefaultProps({ props: inProps, name: 'MuiGrid' }),
  useTheme,
});
```

```javascript
// 2. 너비 계산 공식 (CSS 변수 + calc)
width: `calc(100% * ${value} / var(${parentColumnsVar})
  - (var(${parentColumnsVar}) - ${value})
  * (var(${getParentSpacingVar('column')}) / var(${parentColumnsVar})))`;
```

```javascript
// 3. traverseBreakpoints: 반응형 값을 미디어 쿼리로 변환
traverseBreakpoints(theme.breakpoints, ownerState.size, (appendStyle, value) => {
  // value: 각 breakpoint에서의 size 값
  // appendStyle: 미디어 쿼리로 감싸서 스타일 추가
});
```

```javascript
// 4. 네스팅 감지: container Grid 자식의 level 자동 증가
if (isMuiElement(child, ['Grid']) && container && child.props.container) {
  return React.cloneElement(child, {
    unstable_level: child.props.unstable_level ?? level + 1,
  });
}
```

---

## 복잡도의 이유

Grid는 **~1,032줄 (7개 파일)**이며, 복잡한 이유는:

1. **Factory 패턴** - createGrid()가 createStyledComponent, useThemeProps, useTheme, componentName 4개 옵션을 받아 컴포넌트를 동적으로 생성 (Joy UI/Material UI 공유 목적)
2. **7개 스타일 생성 함수** - generateGridStyles, generateGridSizeStyles, generateGridColumnsStyles, generateGridColumnSpacingStyles, generateGridRowSpacingStyles, generateGridDirectionStyles, generateGridOffsetStyles 각각이 traverseBreakpoints를 호출하는 중첩 콜백 패턴
3. **traverseBreakpoints** - 단일값/배열/객체 3가지 입력 형태를 breakpoint 미디어 쿼리로 변환하는 순회 함수 (58줄)
4. **CSS 변수 이중 시스템** - self 변수(`--Grid-columns`)와 parent 변수(`--Grid-parent-columns`)를 `> *` 자식 셀렉터로 분리하여 네스팅 지원
5. **Legacy props 마이그레이션** - v1의 `item`, `zeroMinWidth`, `xs/sm/md/lg/xl` props를 감지하여 삭제 + 경고
6. **parseResponsiveProp** - 3가지 입력 형태(값/배열/객체)를 breakpoint 맵으로 변환
7. **2개 패키지 분산** - 핵심 로직이 `@mui/system`, 래퍼가 `@mui/material`에 위치

---

## 간소화 방향

이 컴포넌트를 간소화할 때 제거 고려 대상:

- **Factory 패턴** - createGrid() → React.forwardRef 직접 정의, 7개 파일 → 1개 파일
- **반응형 props** - traverseBreakpoints, parseResponsiveProp 제거, 단일값만 지원
- **네스팅 시스템** - unstable_level, isMuiElement 감지, parent/self CSS 변수 분리 제거
- **Legacy props** - deleteLegacyGridProps 제거 (v1→v2 마이그레이션 불필요)
- **useUtilityClasses** - 클래스 생성 인프라 제거
- **Theme 시스템** - useDefaultProps, useTheme, theme.spacing 제거
- **styled** - inline styles로 변환 (CSS 변수는 inline style에서도 동작)
- **PropTypes** - 런타임 타입 검증 제거

> 상세한 간소화 결과는 `Grid-simplified.md` 참고
