# Container 컴포넌트

> 중앙 정렬 + 최대 너비 제한을 제공하는 레이아웃 컨테이너

---

## 이 문서의 목적

**이 문서는 단순화된 코드의 "설명서"입니다.**

Container의 핵심은 "중앙 정렬 + 최대 너비 제한"입니다. 이 문서는 margin: 0 auto와 maxWidth를 사용해 어떻게 콘텐츠를 중앙에 배치하는지 상세히 설명합니다.

---

## 무슨 기능을 하는가?

단순화된 Container는 **margin: 0 auto로 콘텐츠를 중앙 정렬하고, maxWidth로 최대 너비를 1200px로 제한하는** 레이아웃 컨테이너입니다.

### 핵심 기능 (남은 것)
1. **중앙 정렬** - margin: 0 auto
2. **최대 너비 제한** - maxWidth: 1200px
3. **좌우 padding** - paddingLeft/Right: 16px
4. **boxSizing** - border-box로 padding 포함 계산

---

## 핵심 학습 포인트

### 1. 중앙 정렬 패턴

```javascript
const rootStyle = {
  width: '100%',
  marginLeft: 'auto',
  marginRight: 'auto',
  maxWidth: '1200px',
};
```

**학습 가치**:
- **width: '100%'**: 부모 요소 전체 너비 사용
- **margin: 0 auto**: 좌우 마진을 자동으로 균등 분배 → 중앙 정렬
- **maxWidth: '1200px'**: 너비가 1200px를 초과하지 않도록 제한
  - 작은 화면: width 100% (fluid)
  - 큰 화면: maxWidth 1200px 제한 (중앙 정렬 유지)

### 2. boxSizing: border-box

```javascript
const rootStyle = {
  boxSizing: 'border-box',
  paddingLeft: '16px',
  paddingRight: '16px',
  maxWidth: '1200px',
};
```

**학습 가치**:
- **기본값 (content-box)**:
  - width = 콘텐츠만
  - 실제 너비 = width + padding + border
- **border-box**:
  - width = 콘텐츠 + padding + border
  - 실제 너비 = width
  - 레이아웃 계산이 훨씬 간단

**예시**:
```javascript
// content-box (기본값)
maxWidth: 1200px, padding: 16px
→ 실제 너비 = 1200 + 16 + 16 = 1232px (의도와 다름!)

// border-box
maxWidth: 1200px, padding: 16px
→ 실제 너비 = 1200px (padding 포함, 의도대로!)
```

### 3. Padding 역할

```javascript
paddingLeft: '16px',
paddingRight: '16px',
```

**학습 가치**:
- 콘텐츠가 화면 가장자리에 붙지 않도록 여백 제공
- mobile에서 특히 중요 (텍스트가 화면 끝까지 가지 않도록)

---

## 내부 구조

### 1. 렌더링 구조

```javascript
// 위치: packages/mui-material/src/Container/Container.js (36줄, 원본 262줄)

Container (forwardRef)
  └─> div
       └─> children
```

### 2. 핵심 상태 (ref, state, 변수)

| 이름 | 타입 | 용도 |
|------|------|------|
| `rootStyle` | 객체 | 하드코딩된 스타일 |

### 3. 주요 변경 사항 (원본 대비)

**원본과의 차이**:
- ❌ `createContainer` 팩토리 패턴 제거 → 직접 구현
- ❌ `maxWidth` prop 제거 → 1200px 고정
- ❌ `fixed` prop 제거 → false 고정
- ❌ `disableGutters` prop 제거 → padding 항상 적용
- ❌ `component` prop 제거 → div 고정
- ❌ `sx` prop 제거
- ❌ breakpoint별 반응형 padding 제거 → 16px 고정
- ❌ Theme 시스템 (theme.spacing, theme.breakpoints) 제거
- ❌ styled 시스템 (약 100줄) → 인라인 스타일 (9줄)
- ❌ useUtilityClasses, composeClasses 제거
- ❌ PropTypes (12줄) 제거
- ✅ forwardRef 유지
- ✅ 중앙 정렬 로직 유지
- ✅ maxWidth 제한 유지

### 4. Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|---------|
| `children` | ReactNode | - | 자식 요소 |
| `className` | string | - | 추가 CSS 클래스 |
| `style` | object | - | 인라인 스타일 |
| `...other` | any | - | 기타 HTML 속성 |

**제거된 Props**:
- ❌ `maxWidth`, `fixed`, `disableGutters`, `component`, `sx` - 모두 고정값 또는 제거

---

## 커밋 히스토리로 보는 단순화 과정

Container는 **8개의 커밋**을 통해 단순화되었습니다.

### Commit 1: createContainer 팩토리 제거

- `6001159f` - createContainer.tsx 로직을 Container.js에 인라인

**이유**: 팩토리 패턴은 재사용성을 위한 것. 단일 Container 학습에는 불필요한 추상화.

### Commit 2: maxWidth 고정

- `8c73ce0e` - maxWidth를 'lg'(1200px)로 고정

**이유**: breakpoint별 maxWidth는 반응형 시스템의 복잡도. 고정값으로도 Container 개념 이해 충분.

### Commit 3: fixed 고정

- `e2ddb45c` - fixed를 false로 고정

**이유**: fixed 모드는 특수한 레이아웃 케이스. 기본 fluid 동작만으로 충분.

### Commit 4: disableGutters 고정

- `bfd36fca` - disableGutters를 false로 고정

**이유**: padding은 Container의 핵심 기능. 제거 옵션은 예외 케이스.

### Commit 5: component prop 제거

- `80c1f616` - component prop 제거, div로 고정

**이유**: Container의 핵심은 레이아웃이지 다형성이 아님.

### Commit 6: sx prop 제거

- `0b140385` - sx prop 제거

**이유**: sx는 styled-system의 일부. style prop으로 충분.

### Commit 7: Theme 시스템 제거

- `ef24b238` - useDefaultProps, useUtilityClasses, theme.spacing, theme.breakpoints 제거

**이유**: Theme 시스템은 Material-UI 전체 주제. 하드코딩된 값으로도 동작 이해 가능.

### Commit 8: Styled 시스템 및 PropTypes 제거

- `343431df` - styled를 일반 div로 변경, PropTypes 제거, 반응형 padding 제거

**이유**: CSS-in-JS는 별도 학습 주제. 인라인 스타일로 충분. 반응형 padding은 복잡도 증가.

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 262줄 (Container 78 + createContainer 184) | 36줄 (86.3% 감소) |
| **Props 개수** | 7개 | 3개 (children, className, style) |
| **maxWidth** | ✅ 5가지 breakpoint | ❌ 1200px 고정 |
| **fixed** | ✅ breakpoint별 고정 너비 | ❌ false 고정 |
| **disableGutters** | ✅ padding 제거 옵션 | ❌ padding 항상 적용 |
| **component** | ✅ 다형성 | ❌ div 고정 |
| **반응형 padding** | ✅ mobile 16px, desktop 24px | ❌ 16px 고정 |
| **styled 시스템** | ✅ ~100줄 | ❌ 인라인 스타일 9줄 |
| **중앙 정렬** | ✅ | ✅ (유지) |
| **maxWidth 제한** | ✅ | ✅ (유지) |

---

## 학습 후 다음 단계

Container를 이해했다면:

1. **Grid** - 그리드 레이아웃 시스템 (flexbox 기반)
2. **Stack** - 간단한 1차원 레이아웃 (flexbox)
3. **CSS Layout 심화** - flexbox, grid, positioning
4. **실전 응용** - 커스텀 레이아웃 시스템 만들기

**예시: 기본 사용**
```javascript
import Container from './Container';

function App() {
  return (
    <Container>
      <h1>제목</h1>
      <p>콘텐츠가 중앙 정렬되고 1200px로 제한됩니다.</p>
    </Container>
  );
}
```

**예시: 커스텀 maxWidth**
```javascript
<Container style={{ maxWidth: '800px' }}>
  <p>좁은 컨테이너</p>
</Container>
```

**예시: 반응형 padding 추가**
```javascript
<Container
  style={{
    paddingLeft: '24px',
    paddingRight: '24px',
  }}
>
  <p>더 넓은 padding</p>
</Container>

{/* 또는 CSS 미디어 쿼리로 */}
<Container className="custom-container" />

<style>{`
  .custom-container {
    padding: 16px;
  }
  @media (min-width: 600px) {
    .custom-container {
      padding: 24px;
    }
  }
`}</style>
```

---

## 결론

단순화된 Container의 핵심은:
- ✅ **중앙 정렬**: margin: 0 auto
- ✅ **maxWidth**: 최대 너비 제한
- ✅ **boxSizing: border-box**: padding 포함 계산
- ✅ **fluid to fixed**: 작은 화면은 100%, 큰 화면은 maxWidth 제한

**핵심 교훈**: 복잡한 팩토리 패턴, breakpoint 시스템, styled 시스템을 제거해도, 간단한 CSS만으로 충분히 효과적인 중앙 정렬 컨테이너를 만들 수 있습니다.
