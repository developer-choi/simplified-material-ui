# ClickAwayListener 컴포넌트

> Material-UI의 ClickAwayListener 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

ClickAwayListener는 **자식 요소 외부에서 발생한 클릭/터치 이벤트를 감지하여 콜백을 실행하는 유틸리티** 컴포넌트입니다.

> **💡 작성 주의**: ClickAwayListener는 시각적 렌더링을 하지 않으며, 단일 자식 요소를 감싸고 외부 클릭 감지만 담당합니다. 메뉴 닫기, 드롭다운 숨기기 등의 UI 로직은 사용자가 onClickAway 콜백에서 구현합니다.

### 핵심 기능
1. **외부 클릭 감지** - DOM 트리와 React 트리를 확인하여 클릭이 자식 요소 외부에서 발생했는지 판단
2. **마우스/터치 이벤트 지원** - 5개 마우스 이벤트 (onClick, onMouseDown, onMouseUp, onPointerDown, onPointerUp) 및 2개 터치 이벤트 (onTouchStart, onTouchEnd) 선택 가능
3. **Portal 처리** - disableReactTree prop으로 React Portal 내부의 클릭을 외부로 간주할지 선택
4. **엣지 케이스 처리** - 스크롤바 클릭 무시, 터치 이동 감지, 활성화 지연 등

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/mui-material/src/ClickAwayListener/ClickAwayListener.tsx (257줄)
ClickAwayListener (함수 컴포넌트)
  - useRef: nodeRef, movedRef, activatedRef, syntheticEventRef
  - useEffect: 활성화 지연 (setTimeout)
  - useForkRef: 자식 ref 병합
  - useEventCallback: handleClickAway 콜백
  - useEffect: 터치 이벤트 리스너 등록/해제
  - useEffect: 마우스 이벤트 리스너 등록/해제
  - React.cloneElement: 자식에 props 주입
    └─> children (사용자 제공 요소에 ref + 이벤트 핸들러 추가)
```

### 2. 주요 Ref 및 상태 관리

**4개의 useRef** (라인 81-84):

```typescript
const movedRef = React.useRef(false);           // 터치 이동 감지용
const nodeRef = React.useRef<Element>(null);    // 자식 요소 DOM 참조
const activatedRef = React.useRef(false);       // 활성화 상태 (지연 처리용)
const syntheticEventRef = React.useRef(false);  // React 트리 내부 이벤트 추적
```

- **movedRef**: 터치 이동(touchmove) 발생 시 true로 설정되어, touchend를 클릭으로 간주하지 않음 (라인 124-128)
- **nodeRef**: 자식 요소의 DOM 노드 참조, 클릭 위치 판단에 사용
- **activatedRef**: React 19 버그 우회용, setTimeout으로 지연 활성화 (라인 86-95)
- **syntheticEventRef**: React synthetic event 발생 시 true, DOM 트리와 React 트리 구분용 (라인 108-109, 147)

### 3. 외부 클릭 판단 로직

**handleClickAway 함수** (라인 105-150):

```typescript
const handleClickAway = useEventCallback((event: MouseEvent | TouchEvent) => {
  const insideReactTree = syntheticEventRef.current;
  syntheticEventRef.current = false;

  const doc = ownerDocument(nodeRef.current);

  // 조기 반환 조건
  if (
    !activatedRef.current ||              // 아직 활성화되지 않음
    !nodeRef.current ||                    // 자식 요소 없음
    ('clientX' in event && clickedRootScrollbar(event, doc))  // 스크롤바 클릭
  ) {
    return;
  }

  // 터치 이동 감지
  if (movedRef.current) {
    movedRef.current = false;
    return;
  }

  // 클릭 위치 판단
  let insideDOM;
  if (event.composedPath) {
    insideDOM = event.composedPath().includes(nodeRef.current);
  } else {
    // 폴백 로직 (IE11 등)
    insideDOM = !doc.documentElement.contains(event.target) ||
                nodeRef.current.contains(event.target);
  }

  // 외부 클릭이면 콜백 실행
  if (!insideDOM && (disableReactTree || !insideReactTree)) {
    onClickAway(event);
  }
});
```

**핵심 개념**:
1. **composedPath()**: Shadow DOM을 포함한 이벤트 경로 반환 (최신 브라우저)
2. **contains()**: DOM 노드 포함 관계 확인 (폴백용)
3. **insideReactTree vs insideDOM**: Portal 처리 시 구분 필요

### 4. 유틸 함수

**mapEventPropToEvent** (라인 12-16):
```typescript
// 'onClick' → 'click', 'onTouchEnd' → 'touchend'
function mapEventPropToEvent(
  eventProp: ClickAwayMouseEventHandler | ClickAwayTouchEventHandler
): 'click' | 'mousedown' | 'mouseup' | 'touchstart' | 'touchend' | 'pointerdown' | 'pointerup' {
  return eventProp.substring(2).toLowerCase() as any;
}
```

**clickedRootScrollbar** (라인 18-23):
```typescript
// 스크롤바 클릭 감지 (브라우저 스크롤바 영역 클릭 시 true)
function clickedRootScrollbar(event: MouseEvent, doc: Document) {
  return (
    doc.documentElement.clientWidth < event.clientX ||   // 세로 스크롤바
    doc.documentElement.clientHeight < event.clientY     // 가로 스크롤바
  );
}
```

**createHandleSynthetic** (라인 153-160):
```typescript
// React synthetic event 발생 시 syntheticEventRef 업데이트 + 자식 핸들러 호출
const createHandleSynthetic = (handlerName: string) => (event: React.SyntheticEvent) => {
  syntheticEventRef.current = true;

  const childrenPropsHandler = children.props[handlerName];
  if (childrenPropsHandler) {
    childrenPropsHandler(event);
  }
};
```

### 5. 이벤트 리스너 등록

**터치 이벤트 useEffect** (라인 171-190):

```typescript
React.useEffect(() => {
  if (touchEvent !== false) {
    const mappedTouchEvent = mapEventPropToEvent(touchEvent);  // 'touchend'
    const doc = ownerDocument(nodeRef.current);

    const handleTouchMove = () => {
      movedRef.current = true;  // 터치 이동 감지
    };

    doc.addEventListener(mappedTouchEvent, handleClickAway);
    doc.addEventListener('touchmove', handleTouchMove);

    return () => {
      doc.removeEventListener(mappedTouchEvent, handleClickAway);
      doc.removeEventListener('touchmove', handleTouchMove);
    };
  }

  return undefined;
}, [handleClickAway, touchEvent]);
```

**마우스 이벤트 useEffect** (라인 196-209):

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

**차이점**:
- 터치: touchmove 이벤트 별도 추적 (스크롤과 탭 구분)
- 마우스: 이동 감지 불필요

### 6. Ref 병합 및 Props 주입

**useForkRef로 ref 병합** (라인 97):
```typescript
const handleRef = useForkRef(getReactElementRef(children), nodeRef);
```
- 자식의 기존 ref와 내부 nodeRef를 병합
- 자식이 ref를 사용해도 nodeRef에도 DOM 노드가 할당됨

**childrenProps 구성** (라인 162-194):
```typescript
const childrenProps: { ref: React.Ref<Element> } & Pick<...> = { ref: handleRef };

if (touchEvent !== false) {
  childrenProps[touchEvent] = createHandleSynthetic(touchEvent);
}

if (mouseEvent !== false) {
  childrenProps[mouseEvent] = createHandleSynthetic(mouseEvent);
}
```

**React.cloneElement로 주입** (라인 211):
```typescript
return React.cloneElement(children, childrenProps);
```
- 자식 요소에 ref + 이벤트 핸들러 추가
- 원본 자식의 다른 props는 유지

### 7. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | ReactElement | - | 감싸질 단일 자식 요소 (필수) |
| `onClickAway` | (event) => void | - | 외부 클릭 시 실행될 콜백 (필수) |
| `mouseEvent` | 'onClick' \| 'onMouseDown' \| 'onMouseUp' \| 'onPointerDown' \| 'onPointerUp' \| false | 'onClick' | 마우스 이벤트 타입 선택 |
| `touchEvent` | 'onTouchStart' \| 'onTouchEnd' \| false | 'onTouchEnd' | 터치 이벤트 타입 선택 |
| `disableReactTree` | boolean | false | React 트리 무시, DOM 트리만 확인 (Portal 처리용) |

### 8. @mui/utils 의존성

**6개 유틸 함수 사용** (라인 4-9):

1. **ownerDocument** (라인 4):
   - `(node && node.ownerDocument) || document`
   - 노드가 속한 document 반환 (iframe 대응)

2. **useForkRef** (라인 5):
   - 여러 ref를 하나로 병합
   - 71줄 - ref 배열 순회하며 모두 호출

3. **useEventCallback** (라인 6):
   - 안정적인 콜백 ref 생성
   - 29줄 - useRef로 최신 콜백 유지

4. **elementAcceptingRef** (라인 7):
   - PropTypes validator
   - 66줄 - ref를 받을 수 있는 요소인지 검증

5. **exactProp** (라인 8):
   - PropTypes validator
   - 28줄 - 알 수 없는 prop 경고

6. **getReactElementRef** (라인 9):
   - React 요소에서 ref 추출
   - 19줄 - React 19+ vs 이전 버전 호환

---

## 설계 패턴

1. **Render Props / Children as Function 변형**
   - children을 cloneElement로 감싸서 props 주입
   - 투명하게 동작 (시각적 변화 없음)

2. **Ref Forwarding**
   - useForkRef로 자식의 ref와 내부 ref 병합
   - 사용자가 자식에 ref를 사용해도 내부 로직 동작

3. **Event Delegation**
   - document 레벨에서 이벤트 리스닝
   - 모든 클릭을 감지하고 내부/외부 판단

4. **Synthetic Event Tracking**
   - React synthetic event를 추적하여 React 트리 판단
   - Portal 처리 시 필요

5. **Cleanup Pattern**
   - useEffect cleanup에서 이벤트 리스너 제거
   - 메모리 누수 방지

---

## 복잡도의 이유

ClickAwayListener는 **257줄**이며, 복잡한 이유는:

1. **마우스/터치 이벤트 모두 지원**
   - 5개 마우스 이벤트 옵션 (onClick, onMouseDown, onMouseUp, onPointerDown, onPointerUp)
   - 2개 터치 이벤트 옵션 (onTouchStart, onTouchEnd)
   - mouseEvent, touchEvent prop으로 선택 가능
   - 24줄의 터치 전용 로직 (movedRef, touchmove 리스너)

2. **Portal 지원 (disableReactTree)**
   - React Portal 내부의 클릭을 외부로 간주할지 선택
   - syntheticEventRef로 React 트리 추적 (라인 84, 108-109, 154)
   - createHandleSynthetic 함수 (라인 153-160)
   - 조건부 로직 추가 (라인 147)

3. **스크롤바 클릭 감지**
   - clickedRootScrollbar 함수 (라인 18-23)
   - clientX/clientY 좌표 비교
   - 브라우저 스크롤바 영역 클릭 시 외부 클릭으로 간주하지 않음

4. **composedPath 폴백**
   - event.composedPath() 미지원 브라우저 대응 (IE11)
   - 조건 분기 (라인 133-145)
   - contains() 기반 폴백 로직 (9줄)

5. **활성화 지연 (React 버그 우회)**
   - activatedRef + setTimeout (라인 83, 86-95)
   - https://github.com/facebook/react/issues/20074 우회
   - React 19 동기 활성화 문제 해결

6. **PropTypes 검증**
   - PropTypes 정의 (라인 214-250, 37줄)
   - elementAcceptingRef 커스텀 validator (라인 222)
   - exactProp 검증 (라인 252-255)

7. **4개의 useRef + 3개의 useEffect**
   - movedRef, nodeRef, activatedRef, syntheticEventRef
   - 활성화 지연 useEffect
   - 터치 이벤트 useEffect
   - 마우스 이벤트 useEffect
   - 복잡한 상태 및 이벤트 관리

8. **6개 외부 유틸 의존성**
   - ownerDocument, useForkRef, useEventCallback, elementAcceptingRef, exactProp, getReactElementRef
   - @mui/utils 패키지 의존

---

## 비교: ClickAwayListener vs 직접 구현

| 기능 | ClickAwayListener | 직접 document.addEventListener |
|------|------------------|-------------------------------|
| **외부 클릭 감지** | 자동 (composedPath 사용) | 수동으로 contains() 확인 필요 |
| **Portal 처리** | disableReactTree prop | 수동 구현 필요 |
| **터치 이벤트** | touchEvent prop | 별도 리스너 등록 필요 |
| **스크롤바 클릭** | 자동 무시 | 수동 좌표 확인 필요 |
| **터치 이동 감지** | 자동 (movedRef) | touchmove 리스너 별도 관리 |
| **Ref 병합** | useForkRef로 자동 | 수동 ref callback 구현 |
| **Cleanup** | useEffect cleanup | 수동 removeEventListener |
| **코드 복잡도** | 257줄 (재사용 가능) | 간단하지만 반복 작성 |
| **엣지 케이스** | 다수 처리 | 직접 처리 필요 |
