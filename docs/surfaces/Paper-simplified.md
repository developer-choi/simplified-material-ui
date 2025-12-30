# Paper 컴포넌트

> Paper를 최소한의 기능만 남기고 단순화 - 인라인 스타일로 전환

---

## 무슨 기능을 하는가?

단순화된 Paper는 **elevation(그림자)으로 깊이감을 표현하는 단순한 표면 컨테이너**입니다.

### 핵심 기능 (남은 것)

1. **Elevation 시스템 (0-8)**
   - elevation prop으로 그림자 깊이 조절
   - SHADOWS 배열에 하드코딩된 9단계 그림자
   - 0-8 범위로 제한 (Material Design 실제 사용 범위)

2. **Rounded corners** (고정)
   - borderRadius: 4px 고정
   - square prop 제거, 항상 둥근 모서리

3. **기본 스타일**
   - 흰색 배경 (#fff)
   - 검은색 텍스트 (rgba(0, 0, 0, 0.87))
   - 인라인 스타일로 적용

4. **ref 전달**
   - React.forwardRef 지원

---

## 핵심 학습 포인트

### 1. Elevation 범위 제한

```javascript
// Limit elevation to 0-8
const validElevation = Math.min(Math.max(0, elevation), 8);
```

**학습 가치**:
- 입력값 검증 및 제한
- Material Design 실전 사용 범위 (0-8)
- Math.min, Math.max 조합

### 2. Hardcoded Shadows 배열

```javascript
const SHADOWS = [
  'none',
  '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
  '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
  // ... elevation 2-8
];
```

**학습 가치**:
- Material Design shadow spec
- 3개의 레이어 shadow (umbra, penumbra, ambient)
- 테마 시스템 없이도 동작 가능

### 3. 인라인 스타일 병합

```javascript
const rootStyle = {
  backgroundColor: '#fff',
  color: 'rgba(0, 0, 0, 0.87)',
  borderRadius: 4,
  boxShadow: SHADOWS[validElevation],
  ...style, // 사용자 스타일 병합
};
```

**학습 가치**:
- 객체 spread로 스타일 오버라이드
- elevation에 따른 동적 boxShadow
- 사용자 커스터마이징 허용

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/mui-material/src/Paper/Paper.js (44줄, 원본 202줄)
Paper (forwardRef)
 ├─ SHADOWS 배열 (4-15줄) - elevation 0-8 하드코딩
 └─ Paper (17-42줄)
     ├─ validElevation 계산 (elevation 0-8로 제한)
     ├─ rootStyle 객체 (인라인 스타일)
     └─ div (일반 HTML div 엘리먼트)
          └─ children
```

### 2. SHADOWS 배열 (4-15줄)

```javascript
const SHADOWS = [
  'none',                                          // elevation 0
  '0px 2px 1px -1px rgba(0,0,0,0.2),...',        // elevation 1
  '0px 3px 1px -2px rgba(0,0,0,0.2),...',        // elevation 2
  '0px 3px 3px -2px rgba(0,0,0,0.2),...',        // elevation 3
  '0px 2px 4px -1px rgba(0,0,0,0.2),...',        // elevation 4
  '0px 3px 5px -1px rgba(0,0,0,0.2),...',        // elevation 5
  '0px 3px 5px -1px rgba(0,0,0,0.2),...',        // elevation 6
  '0px 4px 5px -2px rgba(0,0,0,0.2),...',        // elevation 7
  '0px 5px 5px -3px rgba(0,0,0,0.2),...',        // elevation 8
];
```

**Material Design Shadow 구조**:
- 각 shadow는 3개 레이어 조합: `shadow1, shadow2, shadow3`
- Umbra (0.2): 주요 그림자
- Penumbra (0.14): 중간 그림자
- Ambient (0.12): 주변 그림자

> **💡 원본과의 차이**:
> - ❌ elevation 9-24 제거 → 0-8만 (실제 사용 범위)
> - ❌ theme.shadows 의존성 제거 → 하드코딩
> - ✅ 간단하고 예측 가능한 동작

### 3. Elevation 검증 및 제한

```javascript
// Limit elevation to 0-8
const validElevation = Math.min(Math.max(0, elevation), 8);
```

**동작**:
- `elevation < 0` → 0으로 제한
- `0 <= elevation <= 8` → 그대로 사용
- `elevation > 8` → 8로 제한

> **💡 원본과의 차이**:
> - ❌ PropTypes 검증 제거
> - ❌ 개발 모드 console.error 제거
> - ✅ 런타임 범위 제한으로 대체

### 4. Props (4개만 남음)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | node | - | 내부 콘텐츠 |
| `className` | string | - | CSS 클래스 (옵션) |
| `elevation` | number (0-8) | 1 | 그림자 깊이 (0-8로 자동 제한) |
| `style` | object | - | 인라인 스타일 오버라이드 (옵션) |

---

## 커밋 히스토리로 보는 단순화 과정

Paper는 **10개의 커밋**을 통해 단순화되었습니다. (Commit 1은 Paper가 slot 시스템을 사용하지 않아 skip)

### 1단계: Component 다형성 제거 (Commit 2)

- `7c2b5c1b0a` - [Paper 단순화 2/11] component prop 제거
  - component prop 제거 (div 고정)
  - `as={component}` 제거
  - ownerState에서 component 제거
  - **이유**: Paper의 핵심은 "elevation과 shadow"이지 "루트 태그 변경"이 아님

### 2단계: Props 단순화 (Commit 3-4)

- `2b8d71cb7d` - [Paper 단순화 3/11] square prop 제거 (rounded 고정)
  - square prop 제거
  - 항상 borderRadius 적용
  - useUtilityClasses, overridesResolver, variants에서 조건부 제거
  - **이유**: Material Design 기본은 rounded corners, square는 특수 케이스

- `3374f82d8e` - [Paper 단순화 4/11] variant prop 제거 (elevation 고정)
  - variant: elevation/outlined → elevation 고정
  - outlined 스타일 블록 제거
  - useUtilityClasses에서 variant 처리 제거
  - style 객체에서 `variant === 'elevation'` 조건 제거
  - **이유**: Paper의 핵심은 elevation(그림자), outlined는 부수적

### 3단계: Dark Mode 제거 (Commit 6)

- `d37e56c84b` - [Paper 단순화 6/11] Dark mode overlay 제거
  - getOverlayAlpha import 제거
  - alpha (colorManipulator) import 제거
  - backgroundImage: 'var(--Paper-overlay)' 제거
  - dark mode overlay 계산 로직 제거 (lines 120-129)
  - **이유**: Light mode만으로도 elevation 개념 이해 충분, dark mode는 고급 주제

### 4단계: Theme 시스템 제거 (Commit 7-9)

- `0f17e501a1` - [Paper 단순화 7/11] useDefaultProps 제거
  - useDefaultProps import 제거
  - `const props = useDefaultProps(...)` 제거
  - 함수 파라미터 직접 사용
  - **이유**: ES6 기본 매개변수로 충분

- `7a788c55e1` - [Paper 단순화 8/11] useUtilityClasses, composeClasses 제거
  - useUtilityClasses 함수 전체 제거 (15줄)
  - composeClasses, getPaperUtilityClass import 제거
  - clsx 제거
  - className={clsx(classes.root, className)} → className={className}
  - **이유**: 인라인 스타일에서는 CSS 클래스 생성 시스템 불필요

- `daab20598f` - [Paper 단순화 9/11] memoTheme 제거 및 스타일 하드코딩 (elevation 0-8)
  - memoTheme import 제거
  - useTheme 제거
  - SHADOWS 배열 하드코딩 (elevation 0-8)
  - theme.palette.background.paper → '#fff'
  - theme.palette.text.primary → 'rgba(0, 0, 0, 0.87)'
  - theme.shape.borderRadius → 4
  - theme.shadows[elevation] → SHADOWS[validElevation]
  - 개발 모드 경고 제거
  - **이유**: 하드코딩된 값으로도 Paper 개념 이해 가능, elevation 0-8로 실용적 범위 제한

### 5단계: Styled Components 제거 (Commit 10)

- `9ebc7cb120` - [Paper 단순화 10/11] Styled Components 제거
  - PaperRoot styled component 제거 (30줄)
  - overridesResolver 제거 (8줄)
  - styled import 제거
  - ownerState 객체 제거
  - 인라인 rootStyle 객체로 대체
  - `<PaperRoot>` → `<div>`
  - **이유**: CSS-in-JS는 별도 주제, 인라인 스타일로도 똑같이 동작

### 6단계: PropTypes 제거 (Commit 11)

- `321622c03f` - [Paper 단순화 11/11] PropTypes 및 메타데이터 제거
  - PropTypes import 제거
  - integerPropType, chainPropTypes import 제거
  - Paper.propTypes 전체 제거 (62줄)
  - JSDoc 주석 제거
  - **이유**: TypeScript가 더 나은 타입 체킹 제공

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 202줄 | 44줄 (78% 감소) |
| **Props 개수** | 8개 | 4개 |
| **Import 수** | 12개 | 1개 (React) |
| **Elevation 범위** | 0-24 (25단계) | 0-8 (9단계) |
| **Component prop** | ✅ div/section/etc | ❌ div 고정 |
| **Square prop** | ✅ true/false | ❌ 항상 rounded |
| **Variant** | ✅ elevation/outlined | ❌ elevation 고정 |
| **Dark mode overlay** | ✅ | ❌ |
| **Styled Components** | ✅ PaperRoot | ❌ 인라인 스타일 |
| **Theme 통합** | ✅ useDefaultProps, useTheme | ❌ |
| **Class 생성** | ✅ useUtilityClasses | ❌ |
| **PropTypes** | ✅ | ❌ |
| **핵심 기능** | ✅ elevation, shadow, rounded | ✅ 유지 |

---

## 학습 후 다음 단계

Paper를 이해했다면:

1. **Card** - Paper를 확장하여 카드 레이아웃 제공 (CardHeader, CardContent, CardActions)
2. **Dialog** - Paper와 Modal을 조합한 대화상자
3. **실전 응용** - elevation을 활용한 UI 계층 구조 만들기

### 예시: 기본 사용

```javascript
import Paper from './Paper';

// 기본 Paper (elevation 1)
<Paper>
  <h2>제목</h2>
  <p>내용</p>
</Paper>

// Elevation 변경
<Paper elevation={0}>평면</Paper>
<Paper elevation={2}>낮은 그림자</Paper>
<Paper elevation={8}>높은 그림자</Paper>

// 스타일 커스터마이징
<Paper
  elevation={4}
  style={{ padding: 16, margin: 8 }}
>
  커스텀 패딩
</Paper>
```

### 예시: UI 계층 구조

```javascript
function Dashboard() {
  return (
    <div style={{ padding: 20, backgroundColor: '#f5f5f5' }}>
      {/* AppBar - elevation 4 */}
      <Paper elevation={4} style={{ padding: 16, marginBottom: 20 }}>
        <h1>Dashboard</h1>
      </Paper>

      {/* Card - elevation 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Paper elevation={1} style={{ padding: 16 }}>
          <h3>통계</h3>
          <p>사용자: 1,234명</p>
        </Paper>

        <Paper elevation={1} style={{ padding: 16 }}>
          <h3>활동</h3>
          <p>오늘 방문: 567회</p>
        </Paper>
      </div>

      {/* Modal - elevation 8 (가장 위) */}
      <Paper
        elevation={8}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          padding: 24,
          minWidth: 300,
        }}
      >
        <h2>알림</h2>
        <p>새로운 메시지가 있습니다.</p>
        <button>확인</button>
      </Paper>
    </div>
  );
}
```

### 예시: 커스터마이징 (style prop)

```javascript
// 색상 커스터마이징
<Paper
  elevation={2}
  style={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}
>
  파란색 Paper
</Paper>

// 크기 및 형태 커스터마이징
<Paper
  elevation={0}
  style={{
    width: 300,
    height: 200,
    borderRadius: 16, // 더 둥글게
    border: '2px solid #1976d2',
  }}
>
  커스텀 모양
</Paper>

// 호버 효과 (추가 로직 필요)
function HoverPaper({ children }) {
  const [elevation, setElevation] = React.useState(1);

  return (
    <Paper
      elevation={elevation}
      style={{ padding: 16, transition: 'box-shadow 0.3s' }}
      onMouseEnter={() => setElevation(8)}
      onMouseLeave={() => setElevation(1)}
    >
      {children}
    </Paper>
  );
}
```

### Material Design Elevation 가이드

| Elevation | 용도 | 예시 |
|-----------|------|------|
| 0 | 평면, 배경과 같은 레벨 | Disabled 요소 |
| 1 | 카드, 칩 등 기본 표면 | Card, Chip |
| 2 | 버튼 (resting) | Button |
| 4 | App bar, 상단 바 | AppBar |
| 6 | FAB (resting) | Floating Action Button |
| 8 | Modal, Dialog (최상단) | Dialog, Menu |

**시각적 효과**:
- elevation ↑ → shadow 크기, blur, 거리 증가
- 깊이감으로 UI 계층 구조 표현
- 사용자 주의를 더 높은 elevation으로 유도
