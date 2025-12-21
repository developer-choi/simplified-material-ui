# Modal 컴포넌트

> Material-UI의 Modal 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

Modal은 **오버레이 컴포넌트를 조합하고 제어하는 컨테이너**로, Dialog, Drawer, Menu, Popover 등의 기반이 됩니다.

### Modal/useModal이 실제로 담당하는 기능
1. **이벤트 처리**
   - ESC 키 닫기 (disableEscapeKeyDown으로 제어)
   - Backdrop 클릭 닫기 감지
2. **상태 관리**
   - open/close 상태 감지
   - exited 상태 관리 (애니메이션 종료 여부)
   - Transition 생명주기 추적
3. **다중 모달 관리** (useModal + ModalManager)
   - 여러 모달의 우선순위 관리 (isTopModal)
   - 스크롤 잠금 조정
   - z-index 자동 계산
4. **컴포넌트 조합**
   - Portal, ModalRoot, Backdrop, FocusTrap를 조합
   - Props를 각 하위 컴포넌트에 전달
   - Slot 시스템으로 커스터마이징 지원
5. **접근성**
   - ARIA 속성 설정 (role="presentation")
   - tabIndex 자동 설정

### 하위 컴포넌트가 담당하는 기능 (Modal이 직접 하지 않음)
- **Portal** - document.body에 렌더링
- **ModalRoot** - position:fixed, 전체 화면 덮기
- **Backdrop** - 반투명 배경 표시
- **FocusTrap** - 키보드 포커스를 모달 안에 가두기
- **Transition** - 애니메이션 효과

---

## 내부 구조

### 1. 주요 컴포넌트

```javascript
// 위치: packages/mui-material/src/Modal/Modal.js

Modal (루트 컴포넌트)
  └─> Portal (document.body에 렌더링)
       └─> ModalRoot (position: fixed, 전체 화면 덮기)
            ├─> ModalBackdrop (반투명 배경, zIndex: -1)
            └─> FocusTrap (포커스 가두기)
                 └─> children (실제 모달 콘텐츠)
```

### 2. 핵심 로직: useModal 훅

Modal의 실제 동작은 `useModal` 훅이 담당합니다.

**위치**: `packages/mui-material/src/Modal/useModal.ts`

**주요 책임**:
- **ESC 키 처리** - `createHandleKeyDown()`
- **Backdrop 클릭 처리** - `createHandleBackdropClick()`
- **ModalManager 연동** - 다중 모달 관리
- **스크롤 잠금** - body 스크롤 제어
- **ARIA 속성 생성** - 접근성

```javascript
const {
  getRootProps,          // root div의 props 생성
  getBackdropProps,      // backdrop의 props 생성
  getTransitionProps,    // transition의 props 생성
  isTopModal,           // 최상위 모달인지 확인
  exited,              // 애니메이션 종료 여부
  hasTransition,       // Transition 컴포넌트 사용 여부
} = useModal({...});
```

### 3. ModalManager (싱글톤)

**역할**: 여러 모달을 동시에 관리

```javascript
const manager = new ModalManager();

// 모달이 열릴 때
manager.add(modal, container);           // 모달 등록
manager.mount(modal, { disableScrollLock }); // 마운트 (스크롤 잠금)

// 모달이 닫힐 때
manager.remove(modal, ariaHiddenProp);   // 모달 제거
```

**주요 기능**:
- z-index 자동 계산
- body 스크롤 잠금 관리
- ARIA hidden 속성 관리 (모달 외부 요소 숨김)

### 4. Styled Components

```javascript
const ModalRoot = styled('div')({
  position: 'fixed',
  zIndex: theme.zIndex.modal,  // 테마에서 가져옴
  right: 0,
  bottom: 0,
  top: 0,
  left: 0,
  visibility: !open && exited ? 'hidden' : undefined,
});

const ModalBackdrop = styled(Backdrop)({
  zIndex: -1,  // ModalRoot 뒤에 표시
});
```

### 5. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `open` | boolean | **required** | 모달 표시 여부 |
| `onClose` | function | - | 닫기 콜백 (reason: 'escapeKeyDown' \| 'backdropClick') |
| `children` | element | **required** | 모달 콘텐츠 |
| `BackdropComponent` | elementType | ModalBackdrop | Backdrop 커스터마이징 |
| `BackdropProps` | object | - | Backdrop에 전달할 props |
| `container` | HTMLElement \| function | document.body | Portal container |
| `disableEscapeKeyDown` | boolean | false | ESC 키 비활성화 |
| `disableAutoFocus` | boolean | false | 자동 포커스 비활성화 |
| `disableEnforceFocus` | boolean | false | 포커스 강제 비활성화 |
| `disableRestoreFocus` | boolean | false | 포커스 복원 비활성화 |
| `disableScrollLock` | boolean | false | 스크롤 잠금 비활성화 |
| `hideBackdrop` | boolean | false | Backdrop 숨기기 |
| `keepMounted` | boolean | false | 닫혀있을 때도 DOM에 유지 |
| `closeAfterTransition` | boolean | false | Transition 종료 후 닫기 |

### 6. Slot 시스템

MUI는 **Slot 시스템**으로 고도의 커스터마이징을 지원합니다.

```javascript
<Modal
  slots={{
    root: CustomRoot,
    backdrop: CustomBackdrop,
  }}
  slotProps={{
    root: { className: 'custom-root' },
    backdrop: { timeout: 500 },
  }}
>
  {children}
</Modal>
```

**내부 구현**:
```javascript
const [RootSlot, rootProps] = useSlot('root', {
  elementType: ModalRoot,
  externalForwardedProps,
  getSlotProps: getRootProps,
  ownerState,
});
```

### 7. Utility Classes

**테마 기반 클래스명 생성**:

```javascript
const useUtilityClasses = (ownerState) => {
  const { open, exited, classes } = ownerState;

  const slots = {
    root: ['root', !open && exited && 'hidden'],
    backdrop: ['backdrop'],
  };

  return composeClasses(slots, getModalUtilityClass, classes);
};
```

생성되는 클래스명:
- `.MuiModal-root`
- `.MuiModal-hidden` (닫혀있고 애니메이션 종료됨)
- `.MuiModal-backdrop`

### 8. Transition 처리

```javascript
// children이 Transition 컴포넌트인지 감지
if (hasTransition) {
  const { onEnter, onExited } = getTransitionProps();
  childProps.onEnter = onEnter;  // 열릴 때
  childProps.onExited = onExited; // 닫힐 때
}

// Transition 종료 감지
const getTransitionProps = () => ({
  onEnter: () => setExited(false),
  onExited: () => {
    setExited(true);
    if (closeAfterTransition) {
      handleClose();
    }
  },
});
```

### 9. 이벤트 처리

**ESC 키**:
```javascript
const createHandleKeyDown = (otherHandlers) => (event) => {
  if (event.key !== 'Escape' || event.which === 229) return;

  if (!disableEscapeKeyDown && isTopModal()) {
    event.stopPropagation();
    onClose(event, 'escapeKeyDown');
  }
};
```

**Backdrop 클릭**:
```javascript
const createHandleBackdropClick = (otherHandlers) => (event) => {
  if (event.target !== event.currentTarget) return;

  onClose(event, 'backdropClick');
};
```

---

## 설계 철학

### 1. 계층적 구조
- **Low-level API**: Modal (최대한의 유연성)
- **High-level API**: Dialog, Drawer (특정 용도에 최적화)

### 2. 관심사의 분리
- **useModal**: 로직 (이벤트, 상태 관리)
- **Modal**: 구조 (렌더링, 컴포지션)
- **ModalManager**: 다중 모달 관리

### 3. 커스터마이징 우선
- Slots로 모든 요소 교체 가능
- Props로 세밀한 동작 제어
- Theme 통합 (zIndex, classes 등)

### 4. 접근성 완벽 지원
- `role="presentation"` (Modal root)
- `aria-hidden="true"` (Backdrop)
- FocusTrap으로 포커스 관리
- 포커스 복원

---

## 복잡도의 이유

원본 Modal은 **404줄**이며, 복잡한 이유는 다음과 같습니다:

1. **범용성** - Dialog, Drawer, Menu, Popover 모두를 지원
2. **커스터마이징** - 15개 이상의 props, Slot 시스템
3. **다중 모달** - ModalManager로 여러 모달 동시 관리
4. **브라우저 호환성** - IE11, Edge 등 오래된 브라우저 지원
5. **테마 통합** - MUI 테마 시스템과 완벽히 통합
6. **Transition 지원** - 다양한 애니메이션 효과
7. **PropTypes** - 런타임 타입 검증 (150줄 이상)

---

## 핵심 코드 발췌

### Modal 렌더링 (206-221줄)
```javascript
return (
  <Portal ref={portalRef} container={container} disablePortal={disablePortal}>
    <RootSlot {...rootProps}>
      {!hideBackdrop && BackdropComponent ? <BackdropSlot {...backdropProps} /> : null}
      <FocusTrap
        disableEnforceFocus={disableEnforceFocus}
        disableAutoFocus={disableAutoFocus}
        disableRestoreFocus={disableRestoreFocus}
        isEnabled={isTopModal}
        open={open}
      >
        {React.cloneElement(children, childProps)}
      </FocusTrap>
    </RootSlot>
  </Portal>
);
```

### useModal의 핵심 로직
```javascript
React.useEffect(() => {
  if (open && resolvedContainer) {
    handleMounted();  // ModalManager에 등록, 스크롤 잠금
  } else if (!open) {
    handleClose();    // ModalManager에서 제거
  }
}, [open, handleMounted, handleClose]);
```
