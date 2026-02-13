# Container 컴포넌트

> Container 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

Container는 **중앙 정렬 + 최대 너비 제한을 제공하는 레이아웃 컨테이너** 컴포넌트입니다.

### 핵심 기능
1. **중앙 정렬** - margin: 0 auto로 콘텐츠를 화면 중앙에 배치
2. **반응형 maxWidth** - breakpoint별로 다른 최대 너비 (xs: 444, sm: 600, md: 900, lg: 1200, xl: 1536)
3. **반응형 padding** - mobile 16px, desktop 24px
4. **fixed 모드** - breakpoint별 고정 너비
5. **disableGutters** - padding 제거 옵션

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/Container/Container.js (78줄)
// 실제 구현: packages/mui-system/src/Container/createContainer.tsx (184줄)

createContainer({
  createStyledComponent,  // styled('div') 팩토리
  useThemeProps,          // useDefaultProps 래퍼
}) → Container 컴포넌트 반환

Container (forwardRef)
  └─> ContainerRoot (styled('div'))
       └─> children
```

### 2. createContainer 팩토리 패턴

Box와 동일한 팩토리 패턴 사용:

```javascript
export default function createContainer(options = {}) {
  const {
    createStyledComponent = defaultCreateStyledComponent,
    useThemeProps = useThemePropsDefault,
    componentName = 'MuiContainer',
  } = options;

  const ContainerRoot = createStyledComponent(
    // 3개의 스타일 함수
  );

  const Container = React.forwardRef(function Container(inProps, ref) {
    const props = useThemeProps(inProps);
    // ...
    return <ContainerRoot as={component} ownerState={ownerState} />;
  });

  return Container;
}
```

**팩토리 패턴의 목적**:
- @mui/material과 @mui/joy에서 재사용
- 커스텀 styled 함수 주입 가능
- Theme 시스템 커스터마이징 가능

### 3. 3단계 스타일 함수

ContainerRoot는 3개의 스타일 함수로 구성:

#### 1단계: 기본 스타일 + padding

```javascript
({ theme, ownerState }) => ({
  width: '100%',
  marginLeft: 'auto',
  boxSizing: 'border-box',
  marginRight: 'auto',
  ...(!ownerState.disableGutters && {
    paddingLeft: theme.spacing(2),   // 16px
    paddingRight: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      paddingLeft: theme.spacing(3),  // 24px
      paddingRight: theme.spacing(3),
    },
  }),
})
```

**학습 포인트**:
- width: '100%' + margin: 0 auto = 중앙 정렬
- boxSizing: border-box = padding 포함 계산
- theme.spacing(2) = 8 × 2 = 16px
- breakpoint별 다른 padding

#### 2단계: fixed 모드 (선택적)

```javascript
({ theme, ownerState }) =>
  ownerState.fixed &&
  Object.keys(theme.breakpoints.values).reduce((acc, breakpoint) => {
    const value = theme.breakpoints.values[breakpoint];
    if (value !== 0) {
      acc[theme.breakpoints.up(breakpoint)] = {
        maxWidth: `${value}${theme.breakpoints.unit}`,
      };
    }
    return acc;
  }, {})
```

**학습 포인트**:
- fixed=true일 때만 적용
- 각 breakpoint에서 maxWidth = breakpoint 값 (예: sm에서 600px)
- 일반 모드는 maxWidth가 특정 breakpoint에서만 적용

#### 3단계: maxWidth (breakpoint별)

```javascript
({ theme, ownerState }) => ({
  ...(ownerState.maxWidth === 'xs' && {
    [theme.breakpoints.up('xs')]: {
      maxWidth: Math.max(theme.breakpoints.values.xs, 444),
    },
  }),
  ...(ownerState.maxWidth && ownerState.maxWidth !== 'xs' && {
    [theme.breakpoints.up(ownerState.maxWidth)]: {
      maxWidth: `${theme.breakpoints.values[ownerState.maxWidth]}${theme.breakpoints.unit}`,
    },
  }),
})
```

**학습 포인트**:
- maxWidth='lg'이면 lg breakpoint (1200px) 이상에서만 maxWidth: 1200px 적용
- 그 미만 화면에서는 width: 100% (fluid)
- xs는 특수 케이스: 최소 444px

### 4. Breakpoint 값

```javascript
theme.breakpoints.values = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
}
```

### 5. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `maxWidth` | 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| false | 'lg' | 최대 너비 breakpoint |
| `fixed` | boolean | false | breakpoint별 고정 너비 모드 |
| `disableGutters` | boolean | false | padding 제거 |
| `component` | elementType | 'div' | 루트 요소 타입 |
| `sx` | object | - | styled-system |

---

## 설계 패턴

1. **Factory Pattern**
   - createContainer로 컴포넌트 생성
   - 재사용성과 커스터마이징 가능

2. **Responsive CSS Pattern**
   - breakpoint별 조건부 스타일
   - mobile-first 접근 (기본 16px, sm 이상 24px)

3. **Fluid to Fixed Pattern**
   - 작은 화면: width 100% (fluid)
   - 큰 화면: maxWidth 제한 (fixed)
   - 항상 중앙 정렬 (margin: 0 auto)

4. **Styled-components with Multiple Style Functions**
   - 3개의 스타일 함수를 순차적으로 병합
   - 각 함수는 특정 기능 담당

---

## 복잡도의 이유

Container는 **262줄** (Container.js 78줄 + createContainer.tsx 184줄)이며, 복잡한 이유는:

1. **createContainer 팩토리 패턴 (184줄)**
   - Box와 동일한 재사용성 패턴
   - styled-system 주입, theme 주입, ownerState 전달

2. **3단계 스타일 함수 (약 80줄)**
   - 기본 스타일 + padding
   - fixed 모드 (Object.keys().reduce())
   - maxWidth (breakpoint별 조건)

3. **Breakpoint 시스템 (약 40줄)**
   - theme.breakpoints.up() 조건부 스타일
   - 5개 breakpoint 각각 처리
   - unit 변환 (px)

4. **useUtilityClasses (12줄)**
   - maxWidth, fixed, disableGutters별 조건부 className

5. **PropTypes (17줄)**
   - 타입 검증

---

## 비교: 직접 CSS vs Container

| 기능 | 직접 CSS | Container |
|------|---------|-----------|
| **중앙 정렬** | `margin: 0 auto` | ✅ 자동 |
| **maxWidth** | 하드코딩 (1200px) | ✅ breakpoint별 |
| **반응형 padding** | 미디어 쿼리 수동 작성 | ✅ 자동 |
| **fixed 모드** | 복잡한 CSS | ✅ prop 하나 |
| **Theme 통합** | 없음 | ✅ theme.breakpoints |
| **번들 크기** | 0 KB | ~6 KB |

**Container의 장점**:
- breakpoint별 자동 반응형
- Theme 시스템 통합
- fixed 모드 간편 전환

**Container의 단점**:
- 팩토리 패턴 복잡도
- styled-system 의존
- 번들 크기 증가
