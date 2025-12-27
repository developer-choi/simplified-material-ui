# ClickAwayListener 컴포넌트

> 단순화된 외부 클릭 감지 유틸리티 - 257줄에서 129줄로 (50% 감소)

---

## 무슨 기능을 하는가?

수정된 ClickAwayListener는 **자식 요소 외부에서 발생한 마우스 클릭을 감지하여 콜백을 실행하는 유틸리티** 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **외부 클릭 감지** - event.composedPath()로 클릭 위치 판단
2. **마우스 이벤트 지원** - onClick, onMouseDown, onMouseUp 중 선택 가능
3. **Portal 처리** - disableReactTree prop으로 React Portal 내부 클릭 처리 방식 선택
4. **Ref 병합** - useForkRef로 자식의 ref와 내부 ref 병합
5. **이벤트 위임** - document 레벨에서 이벤트 리스닝

---

## 핵심 학습 포인트

### 1. event.composedPath()로 외부 클릭 판단

```typescript
const handleClickAway = useEventCallback((event: MouseEvent) => {
  const insideReactTree = syntheticEventRef.current;
  syntheticEventRef.current = false;

  const doc = ownerDocument(nodeRef.current);

  if (!nodeRef.current) {
    return;
  }

  const insideDOM = event.composedPath().includes(nodeRef.current);

  if (!insideDOM && (disableReactTree || !insideReactTree)) {
    onClickAway(event);
  }
});
```

**학습 가치**:
- **composedPath()**: Shadow DOM을 포함한 이벤트 전파 경로 반환
- **외부 클릭 판단**: 경로에 자식 요소가 없으면 외부 클릭
- **조건부 실행**: DOM 외부 && (disableReactTree || React 트리 외부) 시 콜백 실행

### 2. useEventCallback으로 안정적인 콜백

```typescript
const handleClickAway = useEventCallback((event: MouseEvent) => {
  // ... 외부 클릭 판단 로직
  onClickAway(event);
});
```

**학습 가치**:
- **useEventCallback**: 최신 props를 참조하면서도 참조 안정성 유지
- **useEffect 의존성**: handleClickAway가 변하지 않아 불필요한 리스너 재등록 방지
- **메모이제이션 패턴**: 성능 최적화의 실용적 예시

### 3. useForkRef로 Ref 병합

```typescript
const nodeRef = React.useRef<Element>(null);
const handleRef = useForkRef(getReactElementRef(children), nodeRef);

return React.cloneElement(children, { ref: handleRef, ...childrenProps });
```

**학습 가치**:
- **Ref 병합**: 자식의 기존 ref와 내부 nodeRef 모두 유지
- **React.cloneElement**: 자식 요소에 props 주입
- **투명한 래핑**: 자식 요소의 ref를 침범하지 않음

### 4. Document 레벨 이벤트 리스닝

```typescript
React.useEffect(() => {
  if (mouseEvent !== false) {
    const mappedMouseEvent = mapEventPropToEvent(mouseEvent);  // 'click'
    const doc = ownerDocument(nodeRef.current);

    doc.addEventListener(mappedMouseEvent, handleClickAway);

    return () => {
      doc.removeEventListener(mappedMouseEvent, handleClickAway);
    };
  }

  return undefined;
}, [handleClickAway, mouseEvent]);
```

**학습 가치**:
- **이벤트 위임**: document 레벨에서 모든 클릭 감지
- **Cleanup 패턴**: useEffect cleanup에서 리스너 제거
- **메모리 누수 방지**: 컴포넌트 언마운트 시 정리

### 5. Synthetic Event 추적 (Portal 처리)

```typescript
const syntheticEventRef = React.useRef(false);

const createHandleSynthetic = (handlerName: string) => (event: React.SyntheticEvent) => {
  syntheticEventRef.current = true;  // React 트리 내부 이벤트 표시

  const childrenPropsHandler = children.props[handlerName];
  if (childrenPropsHandler) {
    childrenPropsHandler(event);
  }
};

// 자식 요소에 핸들러 주입
childrenProps[mouseEvent] = createHandleSynthetic(mouseEvent);
```

**학습 가치**:
- **React Synthetic Event**: React 이벤트 시스템을 통한 이벤트 추적
- **Portal 처리**: React Portal 내부 클릭과 외부 클릭 구분
- **이벤트 전파**: React 트리와 DOM 트리의 차이 이해

---

## 내부 구조

### 1. 컴포넌트 구조

```typescript
// 위치: packages/mui-material/src/ClickAwayListener/ClickAwayListener.tsx (129줄, 원본 257줄)
ClickAwayListener (함수 컴포넌트)
  - useRef: nodeRef, syntheticEventRef
  - useForkRef: 자식 ref + nodeRef 병합
  - useEventCallback: handleClickAway
  - useEffect: 마우스 이벤트 리스너 등록/해제
  - React.cloneElement: 자식에 props 주입
    └─> children (ref + 이벤트 핸들러 추가)
```

### 2. 단순한 로직

**원본과의 차이**:
- ❌ `touchEvent` prop 제거 → 마우스 전용
- ❌ `movedRef` 제거 → 터치 이동 감지 불필요
- ❌ `activatedRef` 제거 → 즉시 활성화
- ❌ `clickedRootScrollbar` 제거 → 스크롤바 클릭 예외 처리 제거
- ❌ composedPath 폴백 제거 → 최신 브라우저만 지원
- ❌ PropTypes 제거 → TypeScript로 타입 안정성 확보
- ❌ Pointer Events 제거 → onClick, onMouseDown, onMouseUp만 지원
- ✅ `disableReactTree` 유지 → Portal 처리 필수
- ✅ event.composedPath() 사용 → 간결한 외부 클릭 판단
- ✅ useEventCallback 유지 → 안정적인 콜백

### 3. Props (4개만 남음)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | ReactElement | - | 감싸질 단일 자식 요소 (필수) |
| `onClickAway` | (event: MouseEvent) => void | - | 외부 클릭 시 실행될 콜백 (필수) |
| `mouseEvent` | 'onClick' \| 'onMouseDown' \| 'onMouseUp' \| false | 'onClick' | 마우스 이벤트 타입 선택 |
| `disableReactTree` | boolean | false | React 트리 무시, DOM 트리만 확인 (Portal 처리용) |

**제거된 Props**:
- ❌ `touchEvent`: 터치 이벤트 타입 선택

---

## 커밋 히스토리로 보는 단순화 과정

ClickAwayListener는 **6개의 커밋**을 통해 단순화되었습니다.

### 1단계: Touch 이벤트 지원 제거
- `443cdeae` - [ClickAwayListener 단순화 1/6] Touch 이벤트 지원 제거
  - `touchEvent` prop 제거
  - `ClickAwayTouchEventHandler` 타입 제거
  - `movedRef` useRef 제거 (터치 이동 감지용)
  - touchmove 감지 로직 제거
  - touch 이벤트 useEffect 제거 (라인 171-190, 20줄)
  - touch 이벤트 PropTypes 제거
  - onClickAway 타입을 `MouseEvent | TouchEvent` → `MouseEvent`로 변경

**이 기능이 불필요한 이유**:
- **학습 목적**: ClickAwayListener의 핵심은 "외부 클릭 감지"이지 "모바일 터치 이벤트"가 아님
- **복잡도**: movedRef 추적, touchmove 리스너, 터치 이벤트 useEffect 등 24줄의 터치 전용 로직
- **현실**: 대부분 데스크톱 환경에서 학습하며, 마우스 이벤트만으로도 개념 충분히 이해 가능

### 2단계: Pointer 이벤트 제거
- `8c835f39` - [ClickAwayListener 단순화 2/6] Pointer 이벤트 제거
  - `onPointerDown`, `onPointerUp` 타입 제거
  - PropTypes에서 pointer 옵션 제거
  - ClickAwayMouseEventHandler를 5개 → 3개 옵션으로 단순화
  - mapEventPropToEvent 반환 타입에서 pointer 이벤트 제거

**이 기능이 불필요한 이유**:
- **학습 목적**: Pointer Events는 통합 이벤트 모델이지만 학습에는 과함
- **복잡도**: onClick, onMouseDown, onMouseUp만으로 충분히 개념 설명 가능
- **단순함**: 5개 옵션 → 3개 옵션으로 인지 부담 감소

### 3단계: 스크롤바 클릭 감지 제거
- `313a0dbc` - [ClickAwayListener 단순화 3/6] 스크롤바 클릭 감지 제거
  - `clickedRootScrollbar` 함수 제거 (라인 18-23)
  - clientX/clientY 좌표 비교 로직 제거
  - handleClickAway에서 스크롤바 확인 조건 제거

**이 기능이 불필요한 이유**:
- **학습 목적**: 외부 클릭 감지의 핵심 개념이 아닌 엣지 케이스 처리
- **복잡도**: clientX/clientY 좌표와 documentElement.clientWidth/Height 비교
- **현실**: 스크롤바 클릭도 외부 클릭으로 처리해도 큰 문제 없음

### 4단계: composedPath 폴백 제거
- `55ca5593` - [ClickAwayListener 단순화 4/6] composedPath 폴백 제거
  - composedPath 조건 분기 제거
  - 폴백 로직 전체 제거 (라인 136-145, 9줄)
  - documentElement.contains, nodeRef.current.contains 호출 제거
  - composedPath만 사용하도록 단순화

**이 기능이 불필요한 이유**:
- **학습 목적**: 최신 브라우저에서 학습하므로 폴백 불필요
- **복잡도**: 조건 분기, contains() 기반 폴백 로직 (9줄)
- **현실**: composedPath는 모든 최신 브라우저에서 지원 (Chrome 50+, Firefox 52+, Safari 10+)

### 5단계: 활성화 지연 제거
- `f2cef206` - [ClickAwayListener 단순화 5/6] 활성화 지연 제거
  - `activatedRef` useRef 제거
  - setTimeout useEffect 제거 (라인 86-95, 10줄)
  - handleClickAway에서 activatedRef 확인 제거
  - React 버그 우회 로직 제거

**이 기능이 불필요한 이유**:
- **학습 목적**: React 19 관련 특정 버그 우회 로직으로 기본 개념 학습에 불필요
- **복잡도**: activatedRef, setTimeout, cleanup 로직
- **현실**: https://github.com/facebook/react/issues/20074 특정 버그 우회용, 학습 환경에서는 거의 발생하지 않음

### 6단계: PropTypes 및 exactProp 제거
- `2d8fa17d` - [ClickAwayListener 단순화 6/6] PropTypes 및 exactProp 제거
  - `PropTypes` import 제거
  - `elementAcceptingRef` import 제거
  - `exactProp` import 제거
  - `ClickAwayListener.propTypes` 전체 제거 (라인 214-250, 37줄)
  - exactProp 검증 코드 제거 (라인 252-255)

**이 기능이 불필요한 이유**:
- **학습 목적**: TypeScript로 타입 안정성 제공, PropTypes는 런타임 검증이지 핵심 로직이 아님
- **복잡도**: PropTypes 정의 37줄, elementAcceptingRef 커스텀 validator, exactProp 검증
- **일관성**: 모든 단순화된 컴포넌트에서 PropTypes 제거

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 257줄 | 129줄 (50% 감소) |
| **Props 개수** | 5개 (children, onClickAway, mouseEvent, touchEvent, disableReactTree) | 4개 (children, onClickAway, mouseEvent, disableReactTree) |
| **이벤트 지원** | ✅ 마우스 (5개) + 터치 (2개) | ❌ 마우스 (3개)만 |
| **Pointer Events** | ✅ onPointerDown, onPointerUp | ❌ 제거 |
| **터치 이동 감지** | ✅ movedRef 추적 | ❌ 제거 |
| **스크롤바 클릭 감지** | ✅ clickedRootScrollbar | ❌ 제거 |
| **composedPath 폴백** | ✅ contains() 기반 | ❌ composedPath만 사용 |
| **활성화 지연** | ✅ setTimeout 사용 | ❌ 즉시 활성화 |
| **PropTypes** | ✅ 37줄 | ❌ 제거 |
| **useRef 개수** | 4개 (nodeRef, movedRef, activatedRef, syntheticEventRef) | 2개 (nodeRef, syntheticEventRef) |
| **useEffect 개수** | 3개 (활성화 지연, 터치, 마우스) | 1개 (마우스만) |

---

## 학습 후 다음 단계

ClickAwayListener를 이해했다면:

1. **useEventCallback** - 안정적인 콜백 패턴
2. **useForkRef** - Ref 병합 패턴
3. **Portal** - React Portal과 이벤트 전파
4. **실전 응용** - 메뉴, 드롭다운, 모달 등에 외부 클릭 감지 적용

**예시: 기본 사용법**
```typescript
import { ClickAwayListener } from '@mui/material';

function SimpleMenu() {
  const [open, setOpen] = React.useState(false);

  const handleClickAway = () => {
    setOpen(false);
  };

  return (
    <div>
      <button onClick={() => setOpen(true)}>메뉴 열기</button>
      {open && (
        <ClickAwayListener onClickAway={handleClickAway}>
          <div style={{ border: '1px solid', padding: 16 }}>
            <p>메뉴 항목 1</p>
            <p>메뉴 항목 2</p>
            <p>메뉴 항목 3</p>
          </div>
        </ClickAwayListener>
      )}
    </div>
  );
}
```

**예시: 마우스 이벤트 변경**
```typescript
<ClickAwayListener
  onClickAway={handleClickAway}
  mouseEvent="onMouseDown"
>
  <div>마우스 다운 시 외부 클릭 감지</div>
</ClickAwayListener>
```

**예시: 이벤트 비활성화**
```typescript
<ClickAwayListener
  onClickAway={handleClickAway}
  mouseEvent={false}
>
  <div>외부 클릭 감지 비활성화</div>
</ClickAwayListener>
```

**예시: Portal과 함께 사용 (disableReactTree)**
```typescript
import { Portal } from '@mui/material';

<ClickAwayListener
  onClickAway={handleClickAway}
  disableReactTree
>
  <div>
    <button>버튼</button>
    <Portal>
      <div>Portal 내부도 외부 클릭으로 간주</div>
    </Portal>
  </div>
</ClickAwayListener>
```

**예시: 드롭다운 메뉴**
```typescript
function Dropdown() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <button onClick={handleClick}>
        드롭다운 열기
      </button>
      {anchorEl && (
        <ClickAwayListener onClickAway={handleClose}>
          <div
            style={{
              position: 'absolute',
              top: anchorEl.offsetTop + anchorEl.offsetHeight,
              left: anchorEl.offsetLeft,
              border: '1px solid #ccc',
              backgroundColor: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              zIndex: 1000,
            }}
          >
            <div style={{ padding: 8, cursor: 'pointer' }} onClick={handleClose}>
              항목 1
            </div>
            <div style={{ padding: 8, cursor: 'pointer' }} onClick={handleClose}>
              항목 2
            </div>
            <div style={{ padding: 8, cursor: 'pointer' }} onClick={handleClose}>
              항목 3
            </div>
          </div>
        </ClickAwayListener>
      )}
    </>
  );
}
```

**예시: 모달 배경 클릭 시 닫기**
```typescript
function Modal({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <ClickAwayListener onClickAway={onClose}>
        <div style={{
          backgroundColor: 'white',
          padding: 24,
          borderRadius: 8
        }}>
          {children}
        </div>
      </ClickAwayListener>
    </div>
  );
}
```
