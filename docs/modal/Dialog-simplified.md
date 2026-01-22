# Dialog 컴포넌트

> Modal을 감싸서 중앙 정렬된 대화상자 UI를 제공하는 래퍼 컴포넌트

---

## 이 문서의 목적

**이 문서는 단순화된 Dialog 코드의 "설명서"입니다.**

Dialog는 Modal 위에 얇은 레이어를 추가한 컴포넌트입니다. 단순화했더라도 왜 이렇게 구조화했는지, 각 부분이 어떤 역할을 하는지 이해해야 합니다.

> **💡 참고할 예시**: `docs/modal/FocusTrap-simplified.md` - 가장 상세하게 작성된 문서

---

## 무슨 기능을 하는가?

수정된 Dialog는 **Modal을 감싸서 중앙 정렬된 대화상자를 제공하는 단순한 래퍼**입니다.

### 핵심 기능 (남은 것)

1. **Modal 래핑** - Modal의 기능(Backdrop, FocusTrap, Portal)을 그대로 사용
2. **중앙 정렬** - DialogContainer로 화면 중앙에 배치
3. **Paper 스타일** - DialogPaper로 카드 형태 UI 제공
4. **ARIA 접근성** - `role="dialog"`, `aria-modal`, `aria-labelledby` 자동 설정

> **💡 주의**: ESC 키 닫기와 포커스 트랩은 **Modal의 기능**입니다. 단, **Backdrop 클릭 닫기는 Dialog가 직접 처리**합니다 (아래 설명 참고).

---

## 원본과 간소화 버전의 핵심 차이: Backdrop 클릭 처리

### 왜 Dialog가 Backdrop 클릭을 직접 처리해야 하는가?

**구조적 문제**: Dialog의 Container가 `height: 100%`로 전체 화면을 덮어서 Modal의 Backdrop에 클릭이 도달하지 않습니다.

```
┌─────────────────────────────────────┐
│ Modal (position: fixed)             │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Backdrop (z-index: -1)        │  │  ← 맨 뒤에 위치
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ FocusTrap                     │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │ Container (height:100%) │  │  │  ← 전체를 덮음, 클릭이 여기서 잡힘
│  │  │    ┌─────────────────┐  │  │  │
│  │  │    │     Paper       │  │  │  │
│  │  │    └─────────────────┘  │  │  │
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Backdrop의 z-index: -1 이유

Modal의 Backdrop은 `z-index: -1`로 설정되어 있습니다:

```javascript
// Modal.js (원본)
const ModalBackdrop = styled(Backdrop, {
  name: 'MuiModal',
  slot: 'Backdrop',
})({
  zIndex: -1,  // 형제 요소들 뒤에 배치
});
```

#### 왜 z-index: -1인가?

**목적**: Backdrop을 형제 요소(FocusTrap/children)보다 **확실히 뒤에** 배치하기 위해서입니다.

```
ModalRoot (stacking context 생성)
├── Backdrop (z-index: -1)  ← 형제들 중 맨 뒤
└── FocusTrap (z-index: auto = 0)  ← Backdrop보다 앞
    └── children
```

#### z-index: -1 없이도 동작하는가?

**동작합니다.** DOM 순서로도 같은 효과를 얻을 수 있습니다:

```jsx
<ModalRoot>
  <Backdrop />      {/* 먼저 렌더링 → 뒤에 배치 */}
  <FocusTrap>       {/* 나중에 렌더링 → 앞에 배치 */}
    {children}
  </FocusTrap>
</ModalRoot>
```

하지만 원본 MUI는 **명시적 보장**을 위해 `z-index: -1`을 사용합니다. DOM 순서가 바뀌어도 항상 Backdrop이 뒤에 위치하도록요.

#### z-index: -1의 효과

| children 위치 | 클릭 대상 | 설명 |
|---------------|-----------|------|
| children이 있는 영역 | children | z-index가 높아서 앞에 있음 |
| children이 없는 영역 | Backdrop | 그 위치에 Backdrop만 있으므로 클릭 가능 |

**Drawer에서 이게 중요한 이유**: Drawer 패널이 화면 일부만 차지하므로, 나머지 영역에서 Backdrop 클릭이 가능해야 합니다.

**Dialog에서는 의미 없는 이유**: Container가 `height: 100%`로 전체를 덮어서 Backdrop에 클릭이 도달하지 않습니다. 그래서 Dialog는 Container에서 직접 클릭을 처리합니다.

### Dialog vs Drawer: Backdrop 클릭 처리 방식 차이

| 컴포넌트 | Container 크기 | Backdrop 노출 | 클릭 처리 |
|----------|----------------|---------------|-----------|
| **Drawer** | 화면 일부 (예: 왼쪽 250px) | ✅ 나머지 영역 노출 | Modal에 위임 |
| **Dialog** | `height: 100%` 전체 덮음 | ❌ Container에 가려짐 | **직접 처리 필수** |

**Drawer 구조** (Backdrop 클릭 가능):
```
┌────────────────────────────────┐
│ Modal                          │
│  ┌──────────────────────────┐  │
│  │ Backdrop                 │◀─┼── 이 영역 클릭 가능
│  └──────────────────────────┘  │
│  ┌────────┐                    │
│  │ Drawer │ (width: 250px)     │
│  │ Panel  │                    │
│  └────────┘                    │
└────────────────────────────────┘
```

**Dialog 구조** (Backdrop 클릭 불가):
```
┌────────────────────────────────┐
│ Modal                          │
│  ┌──────────────────────────┐  │
│  │ Backdrop (z-index: -1)   │  │  ← 가려져서 클릭 안됨
│  └──────────────────────────┘  │
│  ┌──────────────────────────┐  │
│  │ Container (height: 100%) │◀─┼── 여기서 클릭 감지해야 함
│  │    ┌──────────────┐      │  │
│  │    │    Paper     │      │  │
│  │    └──────────────┘      │  │
│  └──────────────────────────┘  │
└────────────────────────────────┘
```

### 원본 Dialog의 Backdrop 클릭 처리 코드

```javascript
// Dialog.js (원본)
const backdropClick = React.useRef();

// Container에서 mouseDown 감지
const handleMouseDown = (event) => {
  backdropClick.current = event.target === event.currentTarget;
};

// Modal에 전달된 onClick에서 처리
const handleBackdropClick = (event) => {
  if (!backdropClick.current) {
    return;
  }
  backdropClick.current = null;

  if (onClose) {
    onClose(event, 'backdropClick');
  }
};

return (
  <Modal
    onClick={handleBackdropClick}  // ← Modal의 onClick으로 전달
    ...
  >
    <DialogContainer
      onMouseDown={handleMouseDown}  // ← Container에서 mouseDown 감지
    >
      <DialogPaper>
        {children}
      </DialogPaper>
    </DialogContainer>
  </Modal>
);
```

### 왜 mouseDown + click 조합을 사용하는가?

**드래그 오작동 방지**: Paper 안에서 텍스트 드래그를 시작해서 Container에서 마우스를 놓아도 닫히지 않게 합니다.

```
// mouseDown만 체크하면:
Paper에서 드래그 시작 → Container에서 mouseUp → 닫히지 않음 ✅

// click만 체크하면:
Paper에서 드래그 시작 → Container에서 mouseUp → click 이벤트 발생 → 닫힘 ❌
```

### 간소화 버전에서의 선택

간소화 버전에서는 두 가지 선택지가 있습니다:

**옵션 1: 원본처럼 Dialog가 직접 처리**
- Dialog에 `handleMouseDown` + `handleBackdropClick` 구현
- Modal은 Backdrop 클릭 처리 없음 (또는 Drawer용으로만)

**옵션 2: Modal에 위임 (현재 간소화 버전)**
- Dialog는 UI만 담당
- 단, Container가 Backdrop을 가리므로 `pointer-events` 조정 필요
- 또는 Container에서 이벤트를 Modal로 전파

> **⚠️ 현재 간소화 버전의 한계**: "Modal에 위임"으로 단순화했지만, 이는 원본과 다른 구조입니다. 원본 동작을 정확히 재현하려면 옵션 1을 사용해야 합니다.

---

## 핵심 학습 포인트

### 1. Composition 패턴 - Modal 위에 레이어 쌓기

```javascript
const Dialog = React.forwardRef(function Dialog(inProps, ref) {
  // ...
  return (
    <Modal ...>              {/* 기반 기능 제공 */}
      <DialogContainer>      {/* 중앙 정렬 */}
        <DialogPaper>        {/* 카드 스타일 */}
          {children}
        </DialogPaper>
      </DialogContainer>
    </Modal>
  );
});
```

**학습 가치**:
- **관심사 분리**: Modal은 "열림/닫힘 + 오버레이", Dialog는 "UI 구조"
- **재사용성**: Modal을 직접 수정하지 않고 래핑으로 확장
- **단일 책임**: 각 컴포넌트가 한 가지 역할만 수행

### 2. 내부 컴포넌트 분리 - DialogContainer와 DialogPaper

```javascript
// DialogContainer: 중앙 정렬 담당
const DialogContainer = React.forwardRef(function DialogContainer(props, ref) {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',  // Flexbox 중앙 정렬
      }}
    >
      {children}
    </div>
  );
});

// DialogPaper: 카드 스타일 담당
const DialogPaper = React.forwardRef(function DialogPaper(props, ref) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        maxWidth: '600px',
        backgroundColor: '#fff',
        borderRadius: 4,
        boxShadow: '...',  // elevation 24
      }}
    >
      {children}
    </div>
  );
});
```

**학습 가치**:
- **역할 분리**: Container는 "위치", Paper는 "외관"
- **가독성**: 인라인으로 모든 스타일을 넣는 것보다 컴포넌트로 분리하면 의도가 명확
- **Spread Override 패턴**: `...style`로 사용자 커스터마이징 허용

### 3. useId를 활용한 접근성 ID 자동 생성

```javascript
import useId from '@mui/utils/useId';

const Dialog = React.forwardRef(function Dialog(inProps, ref) {
  const {
    'aria-labelledby': ariaLabelledbyProp,  // 사용자 지정 가능
    // ...
  } = inProps;

  const ariaLabelledby = useId(ariaLabelledbyProp);  // 없으면 자동 생성

  return (
    <Modal ...>
      <DialogContainer>
        <DialogPaper aria-labelledby={ariaLabelledby}>
          {children}
        </DialogPaper>
      </DialogContainer>
    </Modal>
  );
});
```

**학습 가치**:
- **useId 훅**: React 18+에서 SSR-safe한 고유 ID 생성
- **접근성**: 스크린 리더가 Dialog 제목을 읽을 수 있게 연결
- **유연성**: 사용자가 ID를 지정하면 그 값 사용, 아니면 자동 생성

---

## 내부 구조

### 1. 렌더링 구조

```javascript
// 위치: packages/modal/Dialog/Dialog.js (94줄, 원본 548줄)

Dialog
  └─> Modal  ← Portal, Backdrop, FocusTrap 제공
       └─> DialogContainer  ← height:100%, Flexbox 중앙 정렬
            └─> DialogPaper  ← role="dialog", 카드 스타일
                 └─> children
```

### 2. 핵심 상태 (ref, state, 변수)

| 이름 | 타입 | 용도 |
|------|------|------|
| `ariaLabelledby` | 변수 | `useId()`로 생성된 접근성 ID |

> Dialog는 상태가 거의 없습니다. 열림/닫힘 상태는 **Modal이 관리**합니다.

### 3. 함수 역할

Dialog 자체에는 함수가 없습니다. 모든 이벤트 처리는 Modal에 위임합니다.

#### Props 전달 흐름

```javascript
// Dialog가 받은 props를 Modal에 그대로 전달
<Modal
  ref={ref}
  className={className}
  disableEscapeKeyDown={disableEscapeKeyDown}  // ESC 키 처리
  onClose={onClose}                            // 닫기 콜백
  open={open}                                  // 열림 상태
  {...other}                                   // 나머지 props
>
```

**왜 이렇게 구현했는지**: Dialog는 UI 구조만 담당하고, 모든 동작 로직은 Modal에 맡깁니다. 이것이 **Thin Wrapper 패턴**입니다.

### 4. 동작 흐름

#### Dialog 열림 흐름

```
open={true} 전달
        ↓
Modal이 Portal로 document.body에 렌더링
        ↓
Modal이 Backdrop 표시
        ↓
Modal이 FocusTrap 활성화
        ↓
DialogContainer가 Flexbox로 중앙 정렬
        ↓
DialogPaper가 카드 형태로 children 표시
```

#### Dialog 닫힘 흐름

```
사용자 액션 (ESC 키 또는 Backdrop 클릭)
        ↓
Modal이 onClose 콜백 호출
        ↓
┌─────────────────────────────────┐
│ 부모 컴포넌트가 open을 false로  │
└─────────────────────────────────┘
        ↓
Modal이 FocusTrap 비활성화 + 포커스 복원
        ↓
전체 트리 언마운트
```

### 5. 핵심 패턴/플래그

#### role="presentation" vs role="dialog"

```javascript
// DialogContainer
<div role="presentation" ...>  // 시맨틱 의미 없음, 레이아웃용

// DialogPaper
<div role="dialog" aria-modal="true" ...>  // 진짜 대화상자
```

**왜 필요한가?**

- `role="presentation"`: 스크린 리더에게 "이건 그냥 레이아웃 컨테이너야"라고 알림
- `role="dialog"`: 스크린 리더에게 "여기가 대화상자야, 집중해"라고 알림
- 둘을 분리해야 스크린 리더가 정확한 위치를 인식

### 6. 주요 변경 사항 (원본 대비)

```javascript
// 원본: styled() + 복잡한 props
const DialogPaper = styled(Paper, {
  name: 'MuiDialog',
  slot: 'Paper',
  overridesResolver: (props, styles) => { ... },
})(memoTheme(({ theme, ownerState }) => ({
  // 테마 기반 동적 스타일
  maxWidth: theme.breakpoints.values[ownerState.maxWidth],
  // ...
})));

// 수정본: 인라인 스타일 + 고정값
const DialogPaper = React.forwardRef(function DialogPaper(props, ref) {
  return (
    <div
      style={{
        maxWidth: '600px',  // 고정
        backgroundColor: '#fff',  // 고정
        // ...
      }}
    >
      {children}
    </div>
  );
});
```

**원본과의 차이**:
- ❌ `styled()` 제거 → 인라인 스타일
- ❌ `maxWidth` prop (xs/sm/md/lg/xl) 제거 → 600px 고정
- ❌ `fullWidth` prop 제거 → 고정 너비
- ❌ `fullScreen` prop 제거 → 항상 카드 형태
- ❌ `scroll` prop 제거 → 항상 paper 스크롤 모드
- ❌ `TransitionComponent` 제거 → 즉시 표시
- ❌ `DialogContext` 제거 → 하위 컴포넌트와 통신 불가
- ✅ `aria-labelledby` 유지 → 접근성 필수

### 7. Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `open` | boolean | **필수** | 대화상자 표시 여부 |
| `onClose` | function | - | 닫기 콜백 `(event, reason) => void` |
| `children` | ReactNode | - | 대화상자 내용 |
| `disableEscapeKeyDown` | boolean | `false` | ESC 키로 닫기 비활성화 |
| `aria-labelledby` | string | 자동생성 | 제목 요소 ID |
| `aria-describedby` | string | - | 설명 요소 ID |
| `className` | string | - | Modal에 전달할 CSS 클래스 |

**제거된 Props**:
- ❌ `maxWidth` - 600px 고정으로 충분
- ❌ `fullWidth` - 학습 목적에 불필요
- ❌ `fullScreen` - 학습 목적에 불필요
- ❌ `scroll` - paper 모드로 고정
- ❌ `TransitionComponent` - 애니메이션은 별도 학습
- ❌ `PaperComponent` - 커스터마이징 제거
- ❌ `BackdropComponent` - 커스터마이징 제거

---

## 커밋 히스토리로 보는 단순화 과정

Dialog는 **17개의 커밋**을 통해 단순화되었습니다.

### 1단계: Slot 시스템 제거

- `9e72205c` - Dialog에 Slot 삭제

**삭제된 코드**:
```javascript
// slots, slotProps, components, componentsProps
const [PaperSlot, paperSlotProps] = useSlot('paper', { ... });
const [BackdropSlot, backdropSlotProps] = useSlot('backdrop', { ... });
```

**왜 불필요한가**:
- **학습 목적**: Dialog 핵심은 "Modal + 중앙 정렬"이지 "커스터마이징 시스템"이 아님
- **복잡도**: useSlot() 훅, props 병합 로직 등 제거

### 2단계: Transition 제거

- `88c1b472` - Dialog에서 Transition 다 삭제

**삭제된 코드**:
```javascript
import Fade from '../Fade';
const TransitionComponent = Fade;
// transitionDuration, TransitionProps 등
```

**왜 불필요한가**:
- **학습 목적**: 애니메이션은 Transition 컴포넌트에서 별도 학습
- **복잡도**: 81줄 감소

### 3단계: Component Props 제거

- `8bc8941d` - BackdropComponent 고정
- `b00786739b` - PaperComponent 고정

**왜 불필요한가**:
- **학습 목적**: 기본 구조 이해가 목표, 커스터마이징은 고급 주제

### 4단계: Layout Props 제거

- `ea2b00cc` - fullScreen prop 삭제
- `a8629a88` - fullWidth prop 삭제
- `1dd9a04d` - maxWidth prop 삭제
- `5ff021ec` - scroll prop 삭제

**삭제된 코드**:
```javascript
// 반응형 breakpoint 처리
maxWidth: theme.breakpoints.values[ownerState.maxWidth],

// fullScreen 처리
...(ownerState.fullScreen && {
  margin: 0,
  width: '100%',
  maxWidth: '100%',
  // ...
}),
```

**왜 불필요한가**:
- **학습 목적**: 기본 형태(600px 중앙 정렬)로도 Dialog 개념 충분히 이해 가능
- **복잡도**: breakpoint 계산, 조건부 스타일 등 제거

### 5단계: 테마 시스템 제거

- `87da2fa6` - useDefaultProps 삭제
- `91ff3513` - useUtilityClasses, composeClasses 삭제
- `59795afe` - memoTheme 삭제

**왜 불필요한가**:
- **학습 목적**: 테마 시스템은 Material-UI 전체 주제, Dialog 학습과 분리

### 6단계: 스타일 단순화

- `0321935f` - classes, sx, ownerState 삭제
- `d0b0d671` - styled 제거, 인라인 스타일로 전환
- `e204177d` - DialogContainer, DialogPaper 컴포넌트 재도입

**왜 이렇게 변경했나**:
- styled() 제거 후 인라인 스타일이 복잡해짐
- 가독성을 위해 내부 컴포넌트로 분리

### 7단계: Context 제거

- `58a1b606` - DialogContext 기능 삭제

**삭제된 코드**:
```javascript
import DialogContext from './DialogContext';
// DialogTitle, DialogContent 등과 통신하는 Context
<DialogContext.Provider value={{ titleId: ariaLabelledby }}>
```

**왜 불필요한가**:
- **학습 목적**: Context 통신은 고급 주제
- **대안**: aria-labelledby를 직접 전달

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 548줄 | 94줄 (83% 감소) |
| **Props 개수** | 15개 | 7개 |
| **styled 사용** | ✅ 4개 컴포넌트 | ❌ 인라인 스타일 |
| **테마 통합** | ✅ | ❌ 하드코딩 |
| **Transition** | ✅ Fade | ❌ 즉시 표시 |
| **DialogContext** | ✅ | ❌ |
| **maxWidth** | xs/sm/md/lg/xl | ❌ 600px 고정 |
| **fullWidth** | ✅ | ❌ |
| **fullScreen** | ✅ | ❌ |
| **scroll 모드** | paper/body | ❌ paper 고정 |
| **Slot 시스템** | ✅ | ❌ |

---

## 학습 후 다음 단계

Dialog를 이해했다면:

1. **Modal** - Dialog가 감싸는 기반 컴포넌트, 핵심 로직 학습
2. **FocusTrap** - Modal 내부의 포커스 관리 메커니즘
3. **Drawer** - Dialog와 비슷하게 Modal을 래핑하지만 다른 UI (사이드 패널)
4. **실전 응용** - 확인 대화상자, 폼 대화상자 직접 만들기

**예시: 기본 사용**
```javascript
function ConfirmDialog({ open, onClose, onConfirm }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <h2 id="dialog-title">확인</h2>
      <p>정말 삭제하시겠습니까?</p>
      <button onClick={onClose}>취소</button>
      <button onClick={onConfirm}>확인</button>
    </Dialog>
  );
}
```

**예시: aria-labelledby 사용**
```javascript
<Dialog
  open={open}
  onClose={onClose}
  aria-labelledby="my-dialog-title"
  aria-describedby="my-dialog-description"
>
  <h2 id="my-dialog-title">제목</h2>
  <p id="my-dialog-description">설명 텍스트</p>
</Dialog>
```
