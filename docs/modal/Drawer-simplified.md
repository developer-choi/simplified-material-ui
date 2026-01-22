# Drawer 컴포넌트

> Modal을 감싸서 화면 가장자리에서 슬라이드되는 서랍 패널을 제공하는 래퍼 컴포넌트

---

## 이 문서의 목적

**이 문서는 단순화된 코드의 "설명서"입니다.**

Material-UI는 라이브러리 코드라서 복잡합니다. 단순화했더라도 코드만 보고는 이해하기 어려울 수 있습니다.
이 문서는 코드의 **동작 원리, 핵심 패턴, 왜 이렇게 구현했는지**를 상세히 설명하여 학습을 돕습니다.

---

## 무슨 기능을 하는가?

수정된 Drawer는 **Modal을 감싸서 왼쪽에서 나타나는 고정된 서랍을 제공하는 단순한 래퍼** 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **Modal 래핑** - Modal의 기능(포커스 트랩, ESC 닫기, 백드롭 클릭 닫기) 재사용
2. **Paper 스타일** - 고정된 서랍 UI (왼쪽, 전체 높이)
3. **ARIA 속성** - `role="dialog"`, `aria-modal="true"`로 접근성 확보

> Drawer 자체는 상태 관리나 이벤트 핸들링을 하지 않습니다. 모두 Modal에 위임합니다.

---

## 핵심 학습 포인트

### 1. Composition 패턴 (Modal 래퍼)

```javascript
<Modal
  ref={ref}
  className={className}
  open={open}
  onClose={onClose}
  style={{ zIndex: 1200 }}
  {...other}
>
  <Paper>
    {children}
  </Paper>
</Modal>
```

**학습 가치**:
- **코드 재사용**: Modal의 모든 기능(포커스 트랩, ESC 닫기, 백드롭 클릭)을 그대로 사용
- **관심사 분리**: Drawer는 "어떻게 보이는가"만 담당, "어떻게 동작하는가"는 Modal에 위임
- **유지보수 용이**: Modal 수정 시 Drawer도 자동으로 개선됨

### 2. Paper를 이용한 서랍 UI

```javascript
<Paper
  elevation={16}
  square
  role="dialog"
  aria-modal="true"
  style={{
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100%',
    // ...
  }}
>
```

**학습 가치**:
- **시각적 계층**: `elevation={16}`으로 그림자 효과, 콘텐츠 위에 떠있는 느낌
- **position: fixed**: 스크롤해도 고정 위치 유지
- **square**: 모서리 둥글림 제거 (화면 가장자리에 붙으므로 불필요)

### 3. 접근성 속성

```javascript
role="dialog"
aria-modal="true"
```

**학습 가치**:
- `role="dialog"`: 스크린 리더에게 "대화상자"임을 알림
- `aria-modal="true"`: 모달 뒤의 콘텐츠가 비활성화됨을 알림

---

## 내부 구조

### 1. 렌더링 구조

```
// 위치: packages/modal/Drawer/Drawer.js (50줄, 원본 453줄)

Drawer (래퍼, 로직 없음)
  └─> Modal (z-index: 1200)
       ├─> Backdrop (Modal 내부)
       └─> FocusTrap (Modal 내부)
            └─> Paper (position: fixed, left: 0)
                 └─> children (서랍 내용)
```

### 2. 핵심 상태 (ref, state, 변수)

| 이름 | 타입 | 용도 |
|------|------|------|
| - | - | Drawer 자체에는 상태가 없음. 모든 상태 관리는 Modal에 위임 |

### 3. 함수 역할

Drawer 내부에는 함수가 없습니다. 모든 이벤트 핸들링(ESC 키, 백드롭 클릭)은 Modal에서 처리됩니다.

### 4. 동작 흐름

#### 열기/닫기 플로우차트

```
[open={true}]
      ↓
┌─────────────────────────────────┐
│ Modal 렌더링                     │
│  - Portal로 body에 추가          │
│  - Backdrop 표시                 │
│  - FocusTrap 활성화              │
└─────────────────────────────────┘
      ↓
┌─────────────────────────────────┐
│ Paper 표시                       │
│  - 왼쪽에 고정 (left: 0)         │
│  - 전체 높이 (height: 100%)      │
└─────────────────────────────────┘
```

```
[사용자 액션] ESC 키 또는 백드롭 클릭
      ↓
┌─────────────────────────────────┐
│ Modal의 onClose 호출             │
│  - reason: 'escapeKeyDown' 또는  │
│           'backdropClick'       │
└─────────────────────────────────┘
      ↓
[부모 컴포넌트에서 open={false} 설정]
      ↓
[Modal 언마운트, 포커스 복원]
```

### 5. 핵심 패턴/플래그

Drawer는 단순 래퍼이므로 특수 플래그가 없습니다.

### 6. 주요 변경 사항 (원본 대비)

**원본과의 차이**:
- ❌ `variant` 제거 → `temporary` 고정 (permanent, persistent 불필요)
- ❌ `anchor` 제거 → `left` 고정 (right, top, bottom 불필요)
- ❌ `Slide` 애니메이션 제거 → 즉시 표시/숨김
- ❌ `elevation` prop 제거 → `16` 고정
- ❌ `hideBackdrop` 제거 → 항상 백드롭 표시
- ❌ `transitionDuration` 제거 → 애니메이션 없음
- ❌ Slot 시스템 제거 → 직접 컴포넌트 사용
- ❌ RTL(Right-to-Left) 지원 제거
- ✅ Modal 기능 유지 → 포커스 트랩, ESC 닫기, 백드롭 클릭 닫기

### 7. Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `open` | boolean | false | 서랍 표시 여부 |
| `onClose` | function | - | 닫기 콜백 (Modal에서 호출) |
| `children` | node | - | 서랍 내용 |
| `className` | string | - | Modal에 적용될 CSS 클래스 |

**제거된 Props**:
- ❌ `variant` - temporary만 사용
- ❌ `anchor` - left만 사용
- ❌ `elevation` - 16 고정
- ❌ `hideBackdrop` - 항상 표시
- ❌ `transitionDuration` - 애니메이션 없음
- ❌ `ModalProps` - 직접 props로 전달
- ❌ `PaperProps` - 고정 스타일 사용
- ❌ `SlideProps` - Slide 제거됨

---

## 고정된 스타일

**Modal**:
- `zIndex: 1200` (MUI theme.zIndex.drawer의 기본값)

**Paper**:
- `elevation: 16` (고정)
- `position: fixed`
- `top: 0`
- `left: 0` (항상 왼쪽)
- `height: 100%`
- `zIndex: 1200`
- `overflowY: auto`
- `display: flex`
- `flexDirection: column`
- `outline: 0`

---

## 커밋 히스토리로 보는 단순화 과정

Drawer는 **22개의 커밋**을 통해 단순화되었습니다.

### Phase 1: Variant Props 제거 (커밋 1-3)

**1. permanent variant 삭제**
```javascript
// REMOVED (319-321줄):
if (variant === 'permanent') {
  return <DockedSlot {...dockedSlotProps}>{drawer}</DockedSlot>;
}
```

**왜 불필요한가**:
- permanent variant는 항상 표시되는 서랍 (모달 아님)
- 학습 목적에는 temporary만으로 충분

**2. persistent variant 삭제**
```javascript
// REMOVED (322-324줄):
if (variant === 'persistent') {
  return <DockedSlot {...dockedSlotProps}>{slidingDrawer}</DockedSlot>;
}
```

**왜 불필요한가**:
- persistent variant는 백드롭 없는 서랍
- temporary와의 차이점 학습은 부가적

**3. variant prop 삭제 (temporary 고정)**
```javascript
// ADDED:
const variant = 'temporary';

// REMOVED:
DrawerDockedRoot styled 컴포넌트
useUtilityClasses variant 로직
```

### Phase 2: Anchor Props 제거 (커밋 4-6)

**4. top, bottom anchor 삭제**
```javascript
// REMOVED DrawerPaper variants:
{ props: { anchor: 'top' }, style: { ... } },
{ props: { anchor: 'bottom' }, style: { ... } }
```

**5. right anchor 삭제**
```javascript
// REMOVED:
{ props: { anchor: 'right' }, style: { right: 0 } }
```

**6. anchor prop 삭제 (left 고정)**
```javascript
// ADDED:
const anchor = 'left';

// REMOVED:
isHorizontal() 함수
getAnchor() 함수 (RTL 처리)
oppositeDirection 객체
```

### Phase 3: RTL 지원 제거 (커밋 7)

```javascript
// REMOVED:
import { useRtl } from '@mui/system/RtlProvider';
const isRtl = useRtl();
```

**왜 불필요한가**:
- anchor가 'left' 고정이므로 RTL 처리 불필요

### Phase 4: Transition 제거 (커밋 8-9)

**8. transitionDuration prop 삭제**
```javascript
// REMOVED:
transitionDuration = defaultTransitionDuration,
```

**9. Slide transition 삭제**
```javascript
// REMOVED:
import Slide from '../Slide';
const slidingDrawer = <TransitionSlot>{drawer}</TransitionSlot>;

// CHANGED to:
return <RootSlot>{drawer}</RootSlot>;  // 즉시 표시
```

**왜 불필요한가**:
- 애니메이션은 UX 향상일 뿐, Modal의 핵심 동작 학습과 무관
- 코드 복잡도 대폭 감소

### Phase 5: Deprecated Props 제거 (커밋 10)

```javascript
// REMOVED:
BackdropProps,
PaperProps = {},
```

### Phase 6: Slot 시스템 제거 (커밋 11)

```javascript
// REMOVED:
import useSlot from '../utils/useSlot';
const [RootSlot, rootSlotProps] = useSlot('root', { ... });
const [PaperSlot, paperSlotProps] = useSlot('paper', { ... });

// CHANGED to direct JSX:
<DrawerRoot>
  <DrawerPaper>
    {children}
  </DrawerPaper>
</DrawerRoot>
```

### Phase 7: Props 단순화 (커밋 12-14)

```javascript
// REMOVED:
elevation = 16,  // → 고정
hideBackdrop = false,  // → Modal 기본값 사용
ModalProps,  // → ...other로 대체
```

### Phase 8: 테마 시스템 제거 (커밋 15-17)

```javascript
// REMOVED:
import { useTheme } from '../zero-styled';
const theme = useTheme();

// CHANGED:
zIndex: theme.zIndex.drawer  // → zIndex: 1200
```

### Phase 9: Styled 제거 (커밋 18)

```javascript
// REMOVED:
const DrawerRoot = styled(Modal, { ... })({ zIndex: 1200 });
const DrawerPaper = styled(Paper, { ... })({ ... });

// CHANGED to inline styles:
<Modal style={{ zIndex: 1200 }}>
  <Paper style={{ position: 'fixed', ... }}>
```

**코드 감소**: 51줄 제거 (가장 큰 감소)

### Phase 10: 메타데이터 제거 (커밋 19-21)

```javascript
// REMOVED:
const ownerState = { ... };
const classes = useUtilityClasses(ownerState);
```

**21. PropTypes 삭제**
```javascript
// REMOVED (117줄):
Drawer.propTypes = { ... };
```

**22. 불필요한 import 정리**

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 453줄 | 50줄 (89% 감소) |
| **Props 개수** | 14개 | 4개 |
| **variant** | temporary/persistent/permanent | temporary (고정) |
| **anchor** | left/right/top/bottom | left (고정) |
| **RTL 지원** | ✅ | ❌ |
| **Transition** | ✅ Slide | ❌ (즉시 표시) |
| **Slot 시스템** | ✅ 5개 슬롯 | ❌ |
| **테마 통합** | ✅ | ❌ |
| **Styled 컴포넌트** | ✅ 3개 | ❌ (inline style) |
| **Utility Classes** | ✅ | ❌ |
| **PropTypes** | ✅ 117줄 | ❌ |

---

## 학습 후 다음 단계

Drawer를 이해했다면:

1. **Modal** - Drawer가 사용하는 핵심 컴포넌트. 포커스 트랩, 백드롭 클릭 등의 동작 원리 학습
2. **Dialog** - 또 다른 Modal 래퍼. Drawer와 비교하며 Composition 패턴 이해
3. **FocusTrap** - Modal 내부의 포커스 관리 메커니즘

**예시: 기본 사용**
```javascript
function App() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Open Drawer</button>
      <Drawer open={open} onClose={() => setOpen(false)}>
        <nav>
          <a href="/home">Home</a>
          <a href="/about">About</a>
        </nav>
      </Drawer>
    </>
  );
}
```

**예시: 닫기 이유 구분**
```javascript
<Drawer
  open={open}
  onClose={(event, reason) => {
    if (reason === 'backdropClick') {
      console.log('백드롭 클릭으로 닫힘');
    } else if (reason === 'escapeKeyDown') {
      console.log('ESC 키로 닫힘');
    }
    setOpen(false);
  }}
>
  {/* ... */}
</Drawer>
```
