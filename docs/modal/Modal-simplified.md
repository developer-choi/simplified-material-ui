# Modal 컴포넌트

> Material-UI Modal을 단순화한 버전 - 핵심 기능만 남김

---

## 무슨 기능을 하는가?

수정된 Modal은 **하위 컴포넌트를 조합하는 최소한의 컨테이너**입니다.

### Modal 컴포넌트가 실제로 담당하는 기능
1. **이벤트 처리**
   - ESC 키 닫기 (`disableEscapeKeyDown`으로 제어)
   - Backdrop 클릭 닫기 (mouseDown/Click 조합으로 정확한 클릭 감지)
2. **상태 관리**
   - open/close 상태 감지
   - exited 상태 관리 (렌더링 최적화용)
3. **컴포넌트 조합**
   - Portal, ModalRoot, ModalBackdrop, FocusTrap를 조합
   - tabIndex 자동 설정
4. **접근성**
   - role="presentation"은 없음 (단순화)
   - aria-hidden은 Backdrop이 설정

### 하위 컴포넌트가 담당하는 기능 (Modal이 직접 하지 않음)
- **Portal** - document.body에 렌더링
- **ModalRoot** - position:fixed, zIndex:1300, 전체 화면 덮기
- **ModalBackdrop** - 반투명 배경 표시, aria-hidden
- **FocusTrap** - 키보드 포커스를 모달 안에 가두기

### 제거된 기능
1. ❌ 다중 모달 관리 (ModalManager, isTopModal)
2. ❌ 스크롤 잠금
3. ❌ Transition/Animation 지원
4. ❌ 커스터마이징 (Slots, Components props)
5. ❌ 테마 통합
6. ❌ useModal 훅 (로직을 컴포넌트 내부로 통합)
7. ❌ 대부분의 props (20개 이상 제거)

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/mui-material/src/Modal/Modal.js (158줄, 원본 404줄)

Modal (루트 컴포넌트)
  └─> Portal (항상 document.body)
       └─> ModalRoot (position: fixed, zIndex: 1300)
            ├─> ModalBackdrop (rgba(0,0,0,0.5), zIndex: -1)
            └─> FocusTrap (기본 설정)
                 └─> children
```

### 2. 간소화된 컴포넌트

**ModalRoot** (6-26줄):
```javascript
const ModalRoot = React.forwardRef(function ModalRoot(props, ref) {
  const { className, style, children, ...other } = props;
  return (
    <div
      ref={ref}
      className={className}
      {...other}
      style={{
        position: 'fixed',
        zIndex: 1300,  // 하드코딩
        right: 0,
        bottom: 0,
        top: 0,
        left: 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
});
```

**ModalBackdrop** (28-48줄):
```javascript
const ModalBackdrop = React.forwardRef(function ModalBackdrop(props, ref) {
  const { style, ...other } = props;
  return (
    <div
      ref={ref}
      aria-hidden="true"
      {...other}
      style={{
        zIndex: -1,
        position: 'fixed',
        right: 0,
        bottom: 0,
        top: 0,
        left: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',  // 고정
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
    />
  );
});
```

### 3. Props (5개만 남음)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `open` | boolean | **required** | 모달 표시 여부 |
| `onClose` | function | - | 닫기 콜백 |
| `children` | element | **required** | 모달 콘텐츠 |
| `disableEscapeKeyDown` | boolean | false | ESC 키 비활성화 |
| `hideBackdrop` | boolean | false | Backdrop 숨기기 |

### 4. 상태 관리 (컴포넌트 내부)

useModal 훅을 제거하고 Modal 컴포넌트 내부에 직접 구현:

```javascript
const [exited, setExited] = React.useState(!open);
const backdropClickRef = React.useRef(false);

// Open 상태 변경
React.useEffect(() => {
  if (open) {
    setExited(false);
  } else {
    setExited(true);
  }
}, [open]);
```

### 5. 이벤트 핸들러

**ESC 키** (88-97줄):
```javascript
const handleKeyDown = React.useCallback((event) => {
  if (event.key !== 'Escape' || event.which === 229) {
    return;
  }

  if (!disableEscapeKeyDown && onClose) {
    event.stopPropagation();
    onClose(event, 'escapeKeyDown');
  }
}, [disableEscapeKeyDown, onClose]);
```

**Backdrop 클릭** (100-117줄):
```javascript
const handleBackdropMouseDown = React.useCallback((event) => {
  // mouseDown 시점에 backdrop인지 체크
  backdropClickRef.current = event.target === event.currentTarget;
}, []);

const handleBackdropClick = React.useCallback((event) => {
  if (!backdropClickRef.current) {
    return;
  }
  backdropClickRef.current = false;

  if (event.target !== event.currentTarget) {
    return;
  }

  if (onClose) {
    onClose(event, 'backdropClick');
  }
}, [onClose]);
```

### 6. 렌더링

```javascript
if (!open && exited) {
  return null;  // 완전히 닫혔으면 렌더링 안 함
}

return (
  <Portal>
    <ModalRoot
      ref={ref}
      onKeyDown={handleKeyDown}
      className={className}
      {...other}
      style={{
        visibility: !open && exited ? 'hidden' : undefined,
        ...other.style,
      }}
    >
      {!hideBackdrop && (
        <ModalBackdrop
          onMouseDown={handleBackdropMouseDown}
          onClick={handleBackdropClick}
        />
      )}

      <FocusTrap open={open}>
        {React.cloneElement(children, childProps)}
      </FocusTrap>
    </ModalRoot>
  </Portal>
);
```

---

## 커밋 히스토리로 보는 단순화 과정

### 1단계: 기능 제거
- `d90a5ef9` - 다중 모달 가정 제거 (isTopModal → true)
- `6caa9de1` - ModalManager, disableScrollLock 삭제
- `11cd6c97` - 20개 이상의 props 삭제

### 2단계: 시스템 제거
- `9d977255` - Slot 시스템 삭제
- `7f4edd06` - UtilityClasses 삭제
- `62baf555` - Transition 전부 삭제

### 3단계: 스타일 단순화
- `310770cb` - styled-components 제거, 인라인 스타일로 전환

### 4단계: 로직 내재화
- `8eb5333c` - useModal 훅 제거, 컴포넌트 내부에 직접 구현
- `a8aa7552` - ModalRoot, ModalBackdrop 재도입 (가독성 향상)

### 5단계: Portal 단순화
- `3c814252` - container prop 제거, 항상 document.body 사용

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 404줄 | 158줄 (61% 감소) |
| **Props 개수** | 25개 | 5개 |
| **Dependencies** | 15개 import | 3개 import |
| **styled 사용** | ✅ | ❌ (인라인 스타일) |
| **테마 통합** | ✅ | ❌ |
| **PropTypes** | 150줄 이상 | ❌ 삭제 |
| **useModal 훅** | ✅ | ❌ (로직 내재화) |
| **ModalManager** | ✅ | ❌ |
| **Transition** | ✅ | ❌ |
| **Slot 시스템** | ✅ | ❌ |
| **다중 모달** | ✅ | ❌ |
| **스크롤 잠금** | ✅ | ❌ |

---

## 설계 철학의 변화

### 원본: "유연성과 완성도"
- 모든 사용 사례 지원
- 무한한 커스터마이징
- 프로덕션 레벨 안정성

### 수정본: "단순함과 명확함"
- 핵심 기능만 지원
- 고정된 구현
- 학습과 이해 우선

---

## 제한 사항

1. **커스터마이징 불가** - Backdrop, Root 스타일 고정
2. **다중 모달 미지원** - 하나의 모달만 사용 가능
3. **애니메이션 없음** - 즉시 열고 닫음
4. **스크롤 잠금 없음** - body 스크롤이 그대로 작동
5. **테마 독립적** - MUI 테마 시스템 미사용

---

## 사용 예시

```javascript
import Modal from './Modal';

function App() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Open Modal</button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        disableEscapeKeyDown={false}
        hideBackdrop={false}
      >
        <div style={{
          background: 'white',
          padding: 20,
          margin: '100px auto',
          maxWidth: 500
        }}>
          <h2>Modal Content</h2>
          <button onClick={() => setOpen(false)}>Close</button>
        </div>
      </Modal>
    </>
  );
}
```

---

## 장단점

### 장점
- ✅ 코드 이해도 높음 (158줄)
- ✅ 디버깅 쉬움
- ✅ 번들 크기 작음
- ✅ 학습 곡선 낮음
- ✅ 테마 시스템 독립적

### 단점
- ❌ 유연성 부족
- ❌ 고급 기능 없음
- ❌ 프로덕션 부적합
- ❌ 기존 MUI API와 호환 안 됨

---

*분석 일자: 2025-12-07*
*브랜치: fix/modal*
*파일: packages/mui-material/src/Modal/Modal.js*
*커밋 수: 11개*
*코드 감소: 246줄 (-61%)*
