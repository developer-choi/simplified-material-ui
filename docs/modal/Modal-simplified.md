# Modal 컴포넌트

> Portal + Backdrop + FocusTrap을 조합하여 오버레이 UI의 기반을 제공하는 컴포넌트

---

## 이 문서의 목적

**이 문서는 단순화된 Modal 코드의 "설명서"입니다.**

Modal은 Dialog, Drawer, Menu 등 오버레이 UI의 기반이 되는 핵심 컴포넌트입니다. 하위 컴포넌트들을 어떻게 조합하고, 이벤트를 어떻게 처리하는지 상세히 설명합니다.

> **💡 참고할 예시**: `docs/modal/FocusTrap-simplified.md` - 가장 상세하게 작성된 문서

---

## 무슨 기능을 하는가?

수정된 Modal은 **하위 컴포넌트(Portal, Backdrop, FocusTrap)를 조합하는 컨테이너**입니다.

### 핵심 기능 (남은 것)

1. **Portal 렌더링** - children을 document.body에 렌더링
2. **Backdrop 표시** - 반투명 오버레이로 뒤 콘텐츠 가림
3. **FocusTrap 활성화** - 포커스가 Modal 밖으로 나가지 않게 가둠
4. **ESC 키 닫기** - `disableEscapeKeyDown`으로 제어 가능
5. **Backdrop 클릭 닫기** - 클릭 시 `onClose` 호출

> **💡 주의**: Modal은 "조합자(Compositor)" 역할입니다. 실제 포커스 트래핑은 FocusTrap이, 포탈 렌더링은 Portal이 담당합니다.

---

## 핵심 학습 포인트

### 1. 컴포넌트 조합 패턴 (Composition)

```javascript
return (
  <Portal>                    {/* 1. document.body에 렌더링 */}
    <ModalRoot>               {/* 2. 전체 화면 고정 컨테이너 */}
      <ModalBackdrop />       {/* 3. 반투명 배경 */}
      <FocusTrap open={open}> {/* 4. 포커스 가두기 */}
        {children}
      </FocusTrap>
    </ModalRoot>
  </Portal>
);
```

**학습 가치**:
- **관심사 분리**: 각 컴포넌트가 한 가지 역할만 수행
- **재사용성**: Portal, Backdrop, FocusTrap을 다른 곳에서도 사용 가능
- **테스트 용이**: 각 컴포넌트를 독립적으로 테스트 가능

### 2. Backdrop 클릭 감지 - mouseDown + click 조합

```javascript
const backdropClickRef = React.useRef(false);

const handleBackdropMouseDown = React.useCallback((event) => {
  // mouseDown 시점에 backdrop인지 체크
  backdropClickRef.current = event.target === event.currentTarget;
}, []);

const handleBackdropClick = React.useCallback((event) => {
  if (!backdropClickRef.current) {
    return;  // mouseDown이 backdrop이 아니었으면 무시
  }
  backdropClickRef.current = false;

  if (event.target !== event.currentTarget) {
    return;  // click도 backdrop이어야 함
  }

  if (onClose) {
    onClose(event, 'backdropClick');
  }
}, [onClose]);
```

**학습 가치**:
- **드래그 방지**: 모달 안에서 드래그 시작 → 밖에서 마우스 놓으면 닫히지 않음
- **정확한 클릭 감지**: mouseDown과 click 둘 다 backdrop에서 발생해야 함
- **ref로 상태 전달**: 두 이벤트 핸들러 간 정보 공유

### 3. ESC 키 처리

```javascript
const handleKeyDown = React.useCallback((event) => {
  // IME 입력 중이면 무시 (한글 등)
  if (event.key !== 'Escape' || event.which === 229) {
    return;
  }

  if (!disableEscapeKeyDown && onClose) {
    event.stopPropagation();  // 부모로 이벤트 전파 방지
    onClose(event, 'escapeKeyDown');
  }
}, [disableEscapeKeyDown, onClose]);
```

**학습 가치**:
- **IME 처리**: `event.which === 229`는 IME 조합 중을 의미 (한글, 일본어 등)
- **이벤트 전파 방지**: 중첩 모달에서 최상위 모달만 닫히도록
- **reason 전달**: `onClose`에 왜 닫혔는지 정보 제공

### 4. exited 상태 관리

```javascript
const [exited, setExited] = React.useState(!open);

React.useEffect(() => {
  if (open) {
    setExited(false);
  } else {
    setExited(true);
  }
}, [open]);

// 렌더링 조건
if (!open && exited) {
  return null;  // 완전히 닫힘
}
```

**학습 가치**:
- **Transition 지원 준비**: 원본에서는 애니메이션 완료 후 exited가 true가 됨
- **단순화 버전**: open이 false면 바로 exited도 true (즉시 언마운트)
- **조건부 렌더링**: 닫혔으면 DOM에서 완전히 제거

---

## 내부 구조

### 1. 렌더링 구조

```javascript
// 위치: packages/modal/Modal/Modal.js (158줄, 원본 404줄)

Modal
  └─> Portal  ← document.body에 렌더링
       └─> ModalRoot  ← position:fixed, zIndex:1300
            ├─> ModalBackdrop  ← zIndex:-1, rgba(0,0,0,0.5)
            └─> FocusTrap  ← 포커스 가두기
                 └─> children (with tabIndex)
```

### 2. 핵심 상태 (ref, state, 변수)

| 이름 | 타입 | 용도 |
|------|------|------|
| `exited` | state | 모달이 완전히 닫혔는지 (렌더링 조건) |
| `backdropClickRef` | ref | mouseDown이 backdrop에서 발생했는지 저장 |

### 3. 함수 역할

#### handleKeyDown()

- **역할**: ESC 키 감지 및 onClose 호출
- **호출 시점**: ModalRoot에서 keyDown 이벤트 발생 시
- **핵심 로직**:

```javascript
const handleKeyDown = React.useCallback((event) => {
  // 1. ESC 키가 아니거나 IME 조합 중이면 무시
  if (event.key !== 'Escape' || event.which === 229) {
    return;
  }

  // 2. disableEscapeKeyDown이 false면 onClose 호출
  if (!disableEscapeKeyDown && onClose) {
    event.stopPropagation();
    onClose(event, 'escapeKeyDown');
  }
}, [disableEscapeKeyDown, onClose]);
```

#### handleBackdropMouseDown()

- **역할**: 클릭 시작 위치가 backdrop인지 기록
- **호출 시점**: ModalBackdrop에서 mouseDown 이벤트 발생 시
- **핵심 로직**:

```javascript
const handleBackdropMouseDown = React.useCallback((event) => {
  // event.target === event.currentTarget 이면 backdrop 자체를 클릭한 것
  backdropClickRef.current = event.target === event.currentTarget;
}, []);
```

#### handleBackdropClick()

- **역할**: 유효한 backdrop 클릭인지 확인 후 onClose 호출
- **호출 시점**: ModalBackdrop에서 click 이벤트 발생 시
- **핵심 로직**:

```javascript
const handleBackdropClick = React.useCallback((event) => {
  // 1. mouseDown이 backdrop이 아니었으면 무시
  if (!backdropClickRef.current) {
    return;
  }
  backdropClickRef.current = false;

  // 2. click도 backdrop이어야 함
  if (event.target !== event.currentTarget) {
    return;
  }

  // 3. onClose 호출
  if (onClose) {
    onClose(event, 'backdropClick');
  }
}, [onClose]);
```

### 4. 동작 흐름

#### Modal 열림 흐름

```
open={true} 전달
        ↓
exited를 false로 설정
        ↓
Portal이 document.body에 ModalRoot 렌더링
        ↓
ModalBackdrop 표시 (hideBackdrop이 false면)
        ↓
FocusTrap 활성화 (포커스 가두기 시작)
        ↓
children에 tabIndex 자동 설정
```

#### Backdrop 클릭 닫힘 흐름

```
사용자가 Backdrop 위에서 mouseDown
        ↓
handleBackdropMouseDown 실행
        ↓
┌─────────────────────────────────┐
│ event.target === currentTarget? │
└─────────────────────────────────┘
        ↓ YES
backdropClickRef.current = true
        ↓
사용자가 마우스 놓음 (click)
        ↓
handleBackdropClick 실행
        ↓
┌─────────────────────────────────┐
│ backdropClickRef.current?       │──→ NO → return (무시)
└─────────────────────────────────┘
        ↓ YES
┌─────────────────────────────────┐
│ event.target === currentTarget? │──→ NO → return (무시)
└─────────────────────────────────┘
        ↓ YES
onClose(event, 'backdropClick') 호출
```

#### 드래그 시나리오 (닫히지 않는 경우)

```
사용자가 모달 콘텐츠 위에서 mouseDown (텍스트 선택 등)
        ↓
handleBackdropMouseDown에서:
  event.target (콘텐츠) !== event.currentTarget (backdrop)
        ↓
backdropClickRef.current = false
        ↓
사용자가 드래그하여 Backdrop 위에서 마우스 놓음
        ↓
handleBackdropClick에서:
  backdropClickRef.current가 false
        ↓
return (onClose 호출 안 함) ✅
```

### 5. 핵심 패턴/플래그

#### 왜 disableBackdropClick prop이 없는가?

**히스토리**: `disableBackdropClick`은 원래 있었지만 **MUI v5에서 제거**되었습니다.

**제거 이유**: MUI 팀은 이 prop이 "redundant(중복)"이라고 판단했습니다. `onClose(event, reason)`의 reason으로 처리할 수 있기 때문입니다.

```javascript
// v4 (과거)
<Modal disableBackdropClick onClose={handleClose} />

// v5 (현재) - reason으로 직접 처리
<Modal
  onClose={(event, reason) => {
    if (reason === 'backdropClick') return;  // Backdrop 클릭 무시
    handleClose();
  }}
/>
```

**일관성 없는 부분**: 같은 논리라면 `disableEscapeKeyDown`도 제거해야 하는데, 이건 아직 남아있습니다. [GitHub issue #27306](https://github.com/mui/material-ui/issues/27306)에서 제거 제안이 있었지만 유지 중입니다.

**참고 링크**:
- [Remove disableBackdropClick PR #23607](https://github.com/mui/material-ui/pull/23607)

#### backdropClickRef - 드래그 오작동 방지

- **비유**: "시작점 기억" - mouseDown 위치를 기억해서 click과 비교
- **역할**: 모달 안에서 시작한 드래그가 밖에서 끝나도 닫히지 않게 방지

**왜 필요한가?**

```
// ref 없이 click만 체크하면:
모달 안에서 텍스트 드래그 시작 → Backdrop에서 마우스 놓음 → 모달 닫힘 ❌

// ref로 mouseDown 위치 체크하면:
모달 안에서 텍스트 드래그 시작 → mouseDown이 backdrop 아님 → 클릭 무시 ✅
```

#### event.which === 229 - IME 조합 감지

- **비유**: "아직 입력 중" - 한글 등 조합형 문자 입력 중에는 ESC 무시
- **역할**: 한글 입력 중 ESC로 조합 취소할 때 모달이 닫히지 않게 함

### 6. 주요 변경 사항 (원본 대비)

```javascript
// 원본: useModal 훅 사용
import useModal from './useModal';
const { ... } = useModal(props);

// 수정본: 로직 내재화
const [exited, setExited] = React.useState(!open);
const backdropClickRef = React.useRef(false);
// ... 직접 구현
```

**원본과의 차이**:
- ❌ `useModal` 훅 제거 → 로직을 컴포넌트에 직접 구현
- ❌ `ModalManager` 제거 → 다중 모달 관리 없음
- ❌ `disableScrollLock` 제거 → 스크롤 잠금 기능 없음
- ❌ `disablePortal` 제거 → 항상 Portal 사용
- ❌ `keepMounted` 제거 → 닫히면 항상 언마운트
- ❌ `container` prop 제거 → 항상 document.body
- ❌ Transition 지원 제거 → 즉시 표시/숨김
- ✅ `disableEscapeKeyDown` 유지 → ESC 키 제어

### 7. Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `open` | boolean | **필수** | 모달 표시 여부 |
| `onClose` | function | - | 닫기 콜백 `(event, reason) => void` |
| `children` | ReactElement | **필수** | 모달 콘텐츠 (단일 요소) |
| `disableEscapeKeyDown` | boolean | `false` | ESC 키로 닫기 비활성화 |
| `hideBackdrop` | boolean | `false` | Backdrop 숨기기 |
| `className` | string | - | ModalRoot에 전달할 CSS 클래스 |

**제거된 Props**:
- ❌ `disablePortal` - 항상 Portal 사용
- ❌ `disableScrollLock` - 스크롤 잠금 기능 없음
- ❌ `keepMounted` - 닫히면 항상 언마운트
- ❌ `container` - 항상 document.body
- ❌ `BackdropComponent` - 고정된 ModalBackdrop 사용
- ❌ `BackdropProps` - 커스터마이징 제거
- ❌ `closeAfterTransition` - Transition 없음
- ❌ `slots`, `slotProps` - Slot 시스템 제거

---

## 커밋 히스토리로 보는 단순화 과정

Modal은 **11개의 커밋**을 통해 단순화되었습니다.

### 1단계: 다중 모달 관리 제거

- `6caa9de1` - disableScrollLock, ModalManager 삭제

**삭제된 코드**:
```javascript
import ModalManager from './ModalManager';
const manager = new ModalManager();
// 모달 스택 관리, 스크롤 잠금 등
```

**왜 불필요한가**:
- **학습 목적**: 단일 모달 동작 이해가 목표
- **복잡도**: ModalManager는 100줄 이상의 별도 클래스

### 2단계: 수많은 Props 제거

- `11cd6c97` - 어차피 true나 false 한쪽으로 고정되는 온갖 props를 전부 삭제

**삭제된 Props**:
```javascript
disableAutoFocus = false,      // 항상 자동 포커스
disableEnforceFocus = false,   // 항상 포커스 강제
disableRestoreFocus = false,   // 항상 포커스 복원
disablePortal = false,         // 항상 Portal 사용
keepMounted = false,           // 닫히면 항상 언마운트
closeAfterTransition = false,  // Transition 없음
```

**왜 불필요한가**:
- **학습 목적**: 기본 동작만 이해하면 충분
- **복잡도**: 각 prop마다 조건부 로직 필요

### 3단계: Slot 시스템 제거

- `9d977255` - 모달에 Slot 삭제

**삭제된 코드**:
```javascript
const [BackdropSlot, backdropSlotProps] = useSlot('backdrop', { ... });
const [RootSlot, rootSlotProps] = useSlot('root', { ... });
```

**왜 불필요한가**:
- **학습 목적**: 커스터마이징 시스템은 별도 주제
- **복잡도**: useSlot 훅, props 병합 로직 제거

### 4단계: Utility Classes 제거

- `7f4edd06` - UtilityClasses 관련 코드 모두 삭제

**왜 불필요한가**:
- **학습 목적**: CSS 클래스 시스템은 테마와 관련된 별도 주제

### 5단계: Transition 제거

- `62baf555` - Transition 다 삭제

**삭제된 코드**:
```javascript
onTransitionEnter,
onTransitionExited,
closeAfterTransition,
// hasTransition 체크 로직
```

**왜 불필요한가**:
- **학습 목적**: 애니메이션은 별도 컴포넌트에서 학습
- **복잡도**: Transition 상태 관리 로직 제거

### 6단계: 스타일 시스템 제거

- `310770cb` - Modal 구조 단순화 및 스타일 의존성 제거

**삭제된 코드**:
```javascript
import { styled } from '../zero-styled';
const ModalRoot = styled('div', { ... });
const ModalBackdrop = styled(Backdrop, { ... });
```

**왜 불필요한가**:
- **학습 목적**: CSS-in-JS는 별도 주제
- **가독성**: 인라인 스타일이 더 직관적

### 7단계: useModal 훅 제거

- `cf811faa` - Modal 컴포넌트 useModal 로직 내재화 및 단순화

**변경 내용**:
```javascript
// 원본: 훅으로 분리
const { exited, ... } = useModal(props);

// 수정본: 컴포넌트에 직접 구현
const [exited, setExited] = React.useState(!open);
```

**왜 이렇게 변경했나**:
- **학습 목적**: 모든 로직을 한 파일에서 볼 수 있게
- **복잡도**: 훅 파일을 오가며 이해할 필요 없음

### 8단계: 내부 컴포넌트 재도입

- `ac8e9a10` - Modal.js에 ModalRoot 및 ModalBackdrop 컴포넌트 재도입

**왜 이렇게 변경했나**:
- styled 제거 후 인라인 스타일이 복잡해짐
- 가독성을 위해 내부 컴포넌트로 분리

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 404줄 | 158줄 (61% 감소) |
| **Props 개수** | 25개 | 6개 |
| **Import 개수** | 15개 | 3개 (React, FocusTrap, Portal) |
| **useModal 훅** | ✅ | ❌ 로직 내재화 |
| **ModalManager** | ✅ | ❌ 다중 모달 미지원 |
| **Transition** | ✅ | ❌ 즉시 표시/숨김 |
| **Slot 시스템** | ✅ | ❌ 고정된 구조 |
| **스크롤 잠금** | ✅ | ❌ |
| **styled 사용** | ✅ | ❌ 인라인 스타일 |
| **keepMounted** | ✅ | ❌ 항상 언마운트 |
| **disablePortal** | ✅ | ❌ 항상 Portal 사용 |

---

## 학습 후 다음 단계

Modal을 이해했다면:

1. **FocusTrap** - Modal이 사용하는 포커스 관리 컴포넌트
2. **Portal** - Modal이 사용하는 렌더링 컴포넌트
3. **Backdrop** - Modal이 사용하는 오버레이 컴포넌트 (참고용)
4. **Dialog** - Modal을 래핑한 대화상자 컴포넌트
5. **Drawer** - Modal을 래핑한 사이드 패널 컴포넌트

**예시: 기본 사용**
```javascript
function SimpleModal() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Open Modal</button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <div style={{ background: 'white', padding: 20 }}>
          <h2>Modal Title</h2>
          <p>Modal content here</p>
          <button onClick={() => setOpen(false)}>Close</button>
        </div>
      </Modal>
    </>
  );
}
```

**예시: Backdrop 클릭 무시**
```javascript
<Modal
  open={open}
  onClose={(event, reason) => {
    if (reason === 'backdropClick') return;  // Backdrop 클릭 무시
    setOpen(false);
  }}
>
  {/* ... */}
</Modal>
```

**예시: ESC 키 비활성화**
```javascript
<Modal
  open={open}
  onClose={() => setOpen(false)}
  disableEscapeKeyDown  // ESC 키로 닫기 비활성화
>
  {/* ... */}
</Modal>
```
