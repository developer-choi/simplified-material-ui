# Portal 컴포넌트

> React Portal을 감싸서 자식 요소를 DOM 트리 외부(document.body)에 렌더링하는 유틸리티 컴포넌트

---

## 이 문서의 목적

**이 문서는 단순화된 코드의 "설명서"입니다.**

Material-UI는 라이브러리 코드라서 복잡합니다. 단순화했더라도 코드만 보고는 이해하기 어려울 수 있습니다.
이 문서는 코드의 **동작 원리, 핵심 패턴, 왜 이렇게 구현했는지**를 상세히 설명하여 학습을 돕습니다.

---

## 무슨 기능을 하는가?

수정된 Portal은 **자식 요소를 document.body에 렌더링**하는 단순한 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **document.body에 렌더링** - `ReactDOM.createPortal()` 사용
2. **Ref 전달** - forwardedRef를 mountNode(document.body)에 전달

### 왜 Portal이 필요한가?

```
일반 React 렌더링:
<App>
  <Parent style="overflow: hidden; z-index: 1">
    <Modal>  ← 부모의 overflow, z-index에 갇힘
  </Parent>
</App>

Portal 사용 시:
<App>
  <Parent style="overflow: hidden; z-index: 1">
    {/* Modal이 여기서 벗어남 */}
  </Parent>
</App>
<body>
  <Modal>  ← document.body의 직접 자식으로 렌더링
</body>
```

- **z-index 문제 해결**: 부모 컴포넌트의 stacking context에서 벗어남
- **overflow 문제 해결**: 부모의 `overflow: hidden`에 잘리지 않음
- **모달, 툴팁, 드롭다운**에 필수적

---

## 핵심 학습 포인트

### 1. ReactDOM.createPortal()

```javascript
return mountNode ? ReactDOM.createPortal(children, mountNode) : mountNode;
```

**학습 가치**:
- **첫 번째 인자**: 렌더링할 React 요소 (children)
- **두 번째 인자**: 렌더링 대상 DOM 노드 (mountNode = document.body)
- **반환값**: Portal은 일반 React 요소처럼 취급됨

```javascript
// React 내부적으로:
// children의 이벤트는 여전히 React 트리를 따라 버블링됨
// DOM 트리와 React 트리가 분리됨
```

### 2. useEnhancedEffect (SSR 안전한 useLayoutEffect)

```javascript
useEnhancedEffect(() => {
  setMountNode(document.body);
}, []);
```

**학습 가치**:
- `useLayoutEffect`는 SSR에서 경고 발생 (서버에는 DOM이 없음)
- `useEnhancedEffect`는 서버에서는 `useEffect`, 클라이언트에서는 `useLayoutEffect`로 동작
- **동기적 DOM 접근**: `useLayoutEffect`는 paint 전에 실행되어 깜빡임 방지

```javascript
// useEnhancedEffect 내부 구현 (간략화)
const useEnhancedEffect = typeof window !== 'undefined'
  ? useLayoutEffect
  : useEffect;
```

### 3. setRef 유틸리티

```javascript
useEnhancedEffect(() => {
  if (mountNode) {
    setRef(forwardedRef, mountNode);  // ref에 mountNode 할당
    return () => {
      setRef(forwardedRef, null);     // cleanup 시 null
    };
  }
}, [forwardedRef, mountNode]);
```

**학습 가치**:
- **ref 형태 추상화**: callback ref와 object ref를 모두 지원
- **안전한 할당**: null 체크 포함

```javascript
// setRef 내부 구현 (간략화)
function setRef(ref, value) {
  if (typeof ref === 'function') {
    ref(value);  // callback ref
  } else if (ref) {
    ref.current = value;  // object ref (useRef)
  }
}
```

---

## 내부 구조

### 1. 렌더링 구조

```
// 위치: packages/modal/Portal/Portal.tsx (84줄, 원본 90줄)

// React 컴포넌트 트리:
<App>
  <Modal>
    <Portal>
      <ModalContent />
    </Portal>
  </Modal>
</App>

// 실제 DOM 결과:
<body>
  <div id="root">
    <App>
      <Modal>
        {/* Portal은 여기에 아무것도 렌더링하지 않음 */}
      </Modal>
    </App>
  </div>
  <ModalContent />  ← Portal이 여기에 렌더링
</body>
```

### 2. 핵심 상태 (ref, state, 변수)

| 이름 | 타입 | 용도 |
|------|------|------|
| `mountNode` | state | Portal의 대상 DOM 노드 (document.body) |
| `forwardedRef` | ref | 외부에서 전달받은 ref, mountNode를 할당 |

### 3. 함수 역할

Portal 내부에는 별도 함수 정의 없이 useEffect 내에서 직접 로직 처리합니다.

### 4. 동작 흐름

#### 마운트 플로우차트

```
[Portal 마운트]
       ↓
┌─────────────────────────────────┐
│ 1. mountNode = null (초기 상태)  │
│    → 아무것도 렌더링하지 않음     │
└─────────────────────────────────┘
       ↓
┌─────────────────────────────────┐
│ 2. useEnhancedEffect 실행       │
│    setMountNode(document.body)  │
└─────────────────────────────────┘
       ↓
┌─────────────────────────────────┐
│ 3. 리렌더링 발생                 │
│    mountNode = document.body    │
└─────────────────────────────────┘
       ↓
┌─────────────────────────────────┐
│ 4. createPortal 실행            │
│    children을 body에 렌더링      │
└─────────────────────────────────┘
       ↓
┌─────────────────────────────────┐
│ 5. ref 설정                      │
│    setRef(forwardedRef, body)   │
└─────────────────────────────────┘
```

#### 언마운트 플로우차트

```
[Portal 언마운트]
       ↓
┌─────────────────────────────────┐
│ 1. useEnhancedEffect cleanup    │
│    setRef(forwardedRef, null)   │
└─────────────────────────────────┘
       ↓
┌─────────────────────────────────┐
│ 2. createPortal 제거            │
│    children이 body에서 제거됨    │
└─────────────────────────────────┘
```

### 5. 핵심 패턴/플래그

#### mountNode 상태의 2단계 초기화

- **비유**: "집 주소를 먼저 확인하고 나서 이삿짐을 옮기는 것"

**왜 useState + useEffect 조합인가?**

```javascript
// ❌ 직접 할당하면 SSR에서 에러
const mountNode = document.body;  // 서버에는 document가 없음!

// ✅ useEffect에서 할당하면 클라이언트에서만 실행
const [mountNode, setMountNode] = useState(null);
useEnhancedEffect(() => {
  setMountNode(document.body);  // 브라우저에서만 실행
}, []);
```

### 6. 주요 변경 사항 (원본 대비)

**원본과의 차이**:
- ❌ `container` prop 제거 → `document.body` 고정
- ❌ `disablePortal` prop 제거 → 항상 Portal 사용
- ❌ SSR 함수 지원 제거 → 단순화
- ❌ `useForkRef` 제거 → `setRef`만 사용
- ❌ `getReactElementRef` 제거 → 단순화
- ✅ PropTypes 유지 (MUI 빌드 시스템 호환)

### 7. Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | ReactNode | - | Portal을 통해 렌더링할 콘텐츠 |

**제거된 Props**:
- ❌ `container` - document.body 고정
- ❌ `disablePortal` - 항상 Portal 활성화

---

## 커밋 히스토리로 보는 단순화 과정

Portal은 **간단한 컴포넌트**라 대규모 리팩토링 없이 props만 제거했습니다.

### 1단계: container prop 제거

```javascript
// REMOVED:
const { children, container, disablePortal = false } = props;

function getContainer(container) {
  return typeof container === 'function' ? container() : container;
}

useEnhancedEffect(() => {
  if (!disablePortal) {
    setMountNode(getContainer(container) || document.body);
  }
}, [container, disablePortal]);

// CHANGED to:
const { children } = props;

useEnhancedEffect(() => {
  setMountNode(document.body);
}, []);
```

**왜 불필요한가**:
- Modal/Dialog/Drawer는 항상 body에 렌더링
- 커스텀 container 지정은 학습 목적에 불필요

### 2단계: disablePortal prop 제거

```javascript
// REMOVED:
if (disablePortal) {
  if (React.isValidElement(children)) {
    const newProps = { ref: handleRef };
    return React.cloneElement(children, newProps);
  }
  return children;
}

// CHANGED to:
// 항상 createPortal 사용 (조건 분기 제거)
return mountNode ? ReactDOM.createPortal(children, mountNode) : mountNode;
```

**왜 불필요한가**:
- Portal을 비활성화하는 경우는 학습 범위 밖

### 3단계: ref 처리 단순화

```javascript
// REMOVED:
import useForkRef from '@mui/utils/useForkRef';
import getReactElementRef from '@mui/utils/getReactElementRef';

const handleRef = useForkRef(
  React.isValidElement(children) ? getReactElementRef(children) : null,
  forwardedRef
);

// CHANGED to:
// forwardedRef만 처리 (children의 ref 병합 제거)
setRef(forwardedRef, mountNode);
```

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 90줄 | 84줄 |
| **Props 개수** | 3개 | 1개 |
| **container 지정** | ✅ (함수/요소) | ❌ (항상 document.body) |
| **disablePortal** | ✅ | ❌ |
| **SSR 함수 지원** | ✅ | ❌ |
| **useForkRef** | ✅ | ❌ |
| **PropTypes** | ✅ | ✅ (그대로 유지) |

---

## 학습 후 다음 단계

Portal을 이해했다면:

1. **Modal** - Portal을 사용하는 대표적인 컴포넌트
2. **FocusTrap** - Portal로 렌더링된 요소의 포커스 관리
3. **React 공식 문서** - [Portals](https://react.dev/reference/react-dom/createPortal)

**예시: 기본 사용**
```javascript
import Portal from './Portal';

function App() {
  return (
    <div>
      <h1>앱 콘텐츠</h1>
      <Portal>
        <div style={{ position: 'fixed', top: 0, left: 0 }}>
          이 요소는 body 바로 아래에 렌더링됩니다
        </div>
      </Portal>
    </div>
  );
}
```

**예시: Modal에서의 사용**
```javascript
// Modal 내부에서 Portal 사용
function Modal({ open, children }) {
  if (!open) return null;

  return (
    <Portal>
      <div className="modal-backdrop">
        <div className="modal-content">
          {children}
        </div>
      </div>
    </Portal>
  );
}
```

**이벤트 버블링 주의**
```javascript
// Portal을 통해 렌더링해도 React 이벤트는 컴포넌트 트리를 따름
<div onClick={() => console.log('Parent clicked')}>
  <Portal>
    <button onClick={() => console.log('Button clicked')}>
      Click me
    </button>
    {/* 버튼 클릭 시: "Button clicked" → "Parent clicked" (버블링) */}
  </Portal>
</div>
```
