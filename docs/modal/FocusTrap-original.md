# FocusTrap 컴포넌트

> 포커스를 특정 영역 안에 가두는 접근성 유틸리티

---

## 무슨 기능을 하는가?

FocusTrap은 **키보드 포커스가 특정 컨테이너(모달, 대화상자 등) 밖으로 나가지 못하도록 막는** 접근성 컴포넌트입니다.

### 핵심 기능
1. **포커스 가두기** - Tab 키로 순환하되, 컨테이너 밖으로 못 나감
2. **초기 포커스** - 컨테이너가 열릴 때 자동으로 내부에 포커스
3. **포커스 복원** - 컨테이너가 닫힐 때 원래 위치로 포커스 복귀
4. **Sentinel 노드** - 경계를 감지하는 보이지 않는 요소
5. **브라우저 호환성** - IE11, Edge, Safari, Firefox 등 오래된 브라우저 지원
6. **라디오 버튼 처리** - 라디오 그룹 내 포커스 로빙(roving)
7. **동적 콘텐츠 대응** - interval로 주기적 체크

---

## 내부 구조

### 1. 렌더링 구조

```javascript
// 위치: packages/mui-material/src/Unstable_TrapFocus/FocusTrap.tsx (428줄)

<React.Fragment>
  {/* 시작 Sentinel - Tab으로 여기 오면 마지막 요소로 이동 */}
  <div
    tabIndex={open ? 0 : -1}
    onFocus={handleFocusSentinel}
    ref={sentinelStart}
  />

  {/* 실제 콘텐츠 */}
  {React.cloneElement(children, { ref: handleRef, onFocus })}

  {/* 끝 Sentinel - Tab으로 여기 오면 첫 번째 요소로 이동 */}
  <div
    tabIndex={open ? 0 : -1}
    onFocus={handleFocusSentinel}
    ref={sentinelEnd}
  />
</React.Fragment>
```

### 2. Sentinel 노드의 역할

**Sentinel**은 "보초병"이라는 뜻으로, 포커스 경계를 감지하는 빈 div입니다.

```
[sentinelStart] → [Button] → [Input] → [Button] → [sentinelEnd]
       ↑                                              ↓
       └──────────────── Tab 순환 ─────────────────┘
```

**동작 원리**:
1. 사용자가 마지막 Button에서 Tab 누름
2. 자연스럽게 `sentinelEnd`로 포커스 이동
3. `handleFocusSentinel` 또는 `contain` 함수 실행
4. 강제로 첫 번째 Button으로 포커스 이동

### 3. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `open` | boolean | **required** | FocusTrap 활성화 여부 |
| `children` | element | **required** | 포커스를 가둘 컨테이너 |
| `disableAutoFocus` | boolean | false | 자동 포커스 비활성화 |
| `disableEnforceFocus` | boolean | false | 포커스 강제 비활성화 |
| `disableRestoreFocus` | boolean | false | 포커스 복원 비활성화 |
| `getTabbable` | function | defaultGetTabbable | 포커스 가능한 요소 찾는 함수 |
| `isEnabled` | function | () => true | FocusTrap 활성화 여부 동적 결정 |

### 4. getTabbable: 포커스 가능한 요소 찾기

**candidatesSelector** (14-24줄):
```javascript
const candidatesSelector = [
  'input',
  'select',
  'textarea',
  'a[href]',
  'button',
  '[tabindex]',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
].join(',');
```

**defaultGetTabbable** (90-118줄):
```javascript
function defaultGetTabbable(root: HTMLElement): HTMLElement[] {
  const regularTabNodes: HTMLElement[] = [];  // tabIndex=0
  const orderedTabNodes: OrderedTabNode[] = [];  // tabIndex>0

  Array.from(root.querySelectorAll(candidatesSelector)).forEach((node, i) => {
    const nodeTabIndex = getTabIndex(node as HTMLElement);

    // disabled, hidden, 특수 radio 등 제외
    if (nodeTabIndex === -1 || !isNodeMatchingSelectorFocusable(node)) {
      return;
    }

    if (nodeTabIndex === 0) {
      regularTabNodes.push(node);
    } else {
      orderedTabNodes.push({
        documentOrder: i,
        tabIndex: nodeTabIndex,
        node: node,
      });
    }
  });

  // tabIndex 순서대로 정렬 후, regularTabNodes 추가
  return orderedTabNodes
    .sort((a, b) =>
      a.tabIndex === b.tabIndex
        ? a.documentOrder - b.documentOrder
        : a.tabIndex - b.tabIndex,
    )
    .map((a) => a.node)
    .concat(regularTabNodes);
}
```

**정렬 로직**:
1. `tabIndex > 0` 요소들을 tabIndex 순서대로 정렬
2. 같은 tabIndex면 DOM 순서대로
3. 마지막에 `tabIndex=0` 요소들 추가

### 5. getTabIndex: 브라우저 호환성 처리

```javascript
function getTabIndex(node: HTMLElement): number {
  const tabindexAttr = parseInt(node.getAttribute('tabindex') || '', 10);

  if (!Number.isNaN(tabindexAttr)) {
    return tabindexAttr;
  }

  // contentEditable은 속성이 없으면 0
  if (node.contentEditable === 'true') {
    return 0;
  }

  // Chrome: <audio controls>, <video controls>, <details>는
  // tabindex 속성이 없어도 tabIndex=-1을 반환하지만
  // 실제로는 tab order에 포함됨
  if (
    (node.nodeName === 'AUDIO' ||
     node.nodeName === 'VIDEO' ||
     node.nodeName === 'DETAILS') &&
    node.getAttribute('tabindex') === null
  ) {
    return 0;
  }

  return node.tabIndex;
}
```

### 6. isNonTabbableRadio: 라디오 버튼 특수 처리

```javascript
function isNonTabbableRadio(node: HTMLInputElement): boolean {
  if (node.tagName !== 'INPUT' || node.type !== 'radio') {
    return false;
  }

  if (!node.name) {
    return false;
  }

  // 같은 name의 라디오 그룹에서 checked된 것 찾기
  const getRadio = (selector: string) =>
    node.ownerDocument.querySelector(`input[type="radio"]${selector}`);

  let roving = getRadio(`[name="${node.name}"]:checked`);

  if (!roving) {
    roving = getRadio(`[name="${node.name}"]`);  // 첫 번째 라디오
  }

  // roving 라디오만 tab으로 접근 가능
  return roving !== node;
}
```

**라디오 그룹 포커스 로빙**:
- 같은 name의 라디오 중 **하나만** tab으로 접근 가능
- checked된 것, 없으면 첫 번째 것

### 7. contain: 포커스 강제 함수

**핵심 로직** (235-302줄):
```javascript
const contain = () => {
  const rootElement = rootRef.current;

  if (rootElement === null) return;

  const activeEl = getActiveElement(doc);

  // 문서가 포커스를 잃었거나, 무시 플래그가 켜져있으면 패스
  if (!doc.hasFocus() || !isEnabled() || ignoreNextEnforceFocus.current) {
    ignoreNextEnforceFocus.current = false;
    return;
  }

  // 포커스가 이미 모달 안에 있으면 OK
  if (rootElement.contains(activeEl)) {
    return;
  }

  // disableEnforceFocus가 켜져있고,
  // Sentinel 노드도 아니면 패스 (외부 포커스 허용)
  if (
    disableEnforceFocus &&
    activeEl !== sentinelStart.current &&
    activeEl !== sentinelEnd.current
  ) {
    return;
  }

  // React 이벤트 트리 체크 (복잡한 로직, 생략)
  if (activeEl !== reactFocusEventTarget.current) {
    reactFocusEventTarget.current = null;
  } else if (reactFocusEventTarget.current !== null) {
    return;
  }

  if (!activated.current) {
    return;
  }

  let tabbable: ReadonlyArray<HTMLElement> = [];

  // Sentinel 노드에 포커스가 갔을 때만 tabbable 요소 계산
  if (activeEl === sentinelStart.current || activeEl === sentinelEnd.current) {
    tabbable = getTabbable(rootRef.current!);
  }

  if (tabbable.length > 0) {
    const isShiftTab = Boolean(
      lastKeydown.current?.shiftKey && lastKeydown.current?.key === 'Tab',
    );

    const focusNext = tabbable[0];
    const focusPrevious = tabbable[tabbable.length - 1];

    if (isShiftTab) {
      focusPrevious.focus();  // Shift+Tab: 마지막으로
    } else {
      focusNext.focus();      // Tab: 첫 번째로
    }
  } else {
    // 포커스 가능한 요소가 없으면 root에 포커스
    rootElement.focus();
  }
};
```

### 8. loopFocus: Tab 키 처리

```javascript
const loopFocus = (nativeEvent: KeyboardEvent) => {
  lastKeydown.current = nativeEvent;

  if (disableEnforceFocus || !isEnabled() || nativeEvent.key !== 'Tab') {
    return;
  }

  // activeElement가 root이고 Shift+Tab이면
  // sentinelEnd로 포커스 이동
  if (activeElement === rootRef.current && nativeEvent.shiftKey) {
    ignoreNextEnforceFocus.current = true;
    if (sentinelEnd.current) {
      sentinelEnd.current.focus();
    }
  }
};
```

### 9. 이벤트 리스너 등록

```javascript
React.useEffect(() => {
  if (!open || !rootRef.current) return;

  const doc = ownerDocument(rootRef.current);

  // focusin 이벤트로 포커스 이동 감지
  doc.addEventListener('focusin', contain);

  // keydown 이벤트로 Tab 키 감지
  doc.addEventListener('keydown', loopFocus, true);

  // Edge, Safari, Firefox: 일부 케이스에서 focusin이 안 날아옴
  // → 50ms마다 강제로 체크
  const interval = setInterval(() => {
    const activeEl = getActiveElement(doc);
    if (activeEl && activeEl.tagName === 'BODY') {
      contain();
    }
  }, 50);

  return () => {
    clearInterval(interval);
    doc.removeEventListener('focusin', contain);
    doc.removeEventListener('keydown', loopFocus, true);
  };
}, [disableAutoFocus, disableEnforceFocus, disableRestoreFocus, isEnabled, open, getTabbable]);
```

**왜 interval이 필요한가?**
- Edge, Safari, Firefox에서 BODY로 포커스가 돌아갈 때 `focusin` 이벤트가 발생하지 않음
- Spec에는 정의되어 있지만 구현이 완벽하지 않음
- 50ms마다 강제로 체크해서 보완

### 10. 포커스 복원

```javascript
React.useEffect(() => {
  if (!open || !rootRef.current) return;

  return () => {
    // 모달이 닫힐 때 (cleanup)
    if (!disableRestoreFocus) {
      if (nodeToRestore.current && (nodeToRestore.current as HTMLElement).focus) {
        ignoreNextEnforceFocus.current = true;
        (nodeToRestore.current as HTMLElement).focus();
      }
      nodeToRestore.current = null;
    }
  };
}, [open]);
```

### 11. Ref 처리 (useForkRef)

```javascript
const rootRef = React.useRef<HTMLElement>(null);
const handleRef = useForkRef(getReactElementRef(children), rootRef);

// 렌더링 시
{React.cloneElement(children, { ref: handleRef, onFocus })}
```

**useForkRef**:
- 여러 ref를 하나로 합침
- `children`의 원래 ref + `rootRef` 모두 업데이트

---

## 설계 패턴

### 1. Sentinel Node Pattern
- 보이지 않는 경계 노드로 포커스 순환 감지
- DOM의 자연스러운 포커스 흐름 이용

### 2. Defensive Programming
- 브라우저 버그 우회 (interval)
- IE11 호환성 체크 (`focus` 메서드 존재 확인)
- 다양한 엣지 케이스 처리

### 3. Separation of Concerns
- `getTabbable`: 포커스 가능한 요소 찾기
- `contain`: 포커스 강제
- `loopFocus`: Tab 키 처리
- 각 함수가 독립적

---

## 복잡도의 이유

FocusTrap은 **428줄**이며, 복잡한 이유는:

1. **브라우저 호환성** - IE11, Edge, Safari 버그 우회
2. **라디오 버튼 처리** - 포커스 로빙 로직
3. **tabIndex 정렬** - 복잡한 정렬 알고리즘
4. **React 이벤트 트리** - reactFocusEventTarget 추적
5. **interval 체크** - focusin 이벤트 미발생 대응
6. **Ref 병합** - useForkRef, getReactElementRef
7. **다양한 Props** - 6개의 옵션 props
