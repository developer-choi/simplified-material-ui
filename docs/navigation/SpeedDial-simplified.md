# SpeedDial 컴포넌트

> 메인 Fab 버튼 클릭/hover 시 SpeedDialAction들이 순차적으로 펼쳐지는 오케스트레이터

---

## 이 문서의 목적

**이 문서는 단순화된 코드의 "상세 학습 가이드"입니다.**

라이브러리 코드는 복잡합니다. 단순화했더라도 코드만 보고는 이해하기 어려울 수 있습니다.
이 문서는 코드의 **동작 원리, 핵심 패턴, 왜 이렇게 구현했는지**를 상세히 설명하여 학습을 돕습니다.

> **원본 구조 파악**: 원본 코드의 빠른 이해는 `SpeedDial-original.md` 참고

---

## 무슨 기능을 하는가?

수정된 SpeedDial은 **메인 Fab 버튼의 open/close 상태를 관리하고, children(SpeedDialAction)에 delay/open/id를 자동 주입하여 순차 애니메이션을 오케스트레이션하는** 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **open/close 상태 관리** - 클릭 토글, hover/focus 열기, blur/mouseleave 닫기 (setTimeout 디바운싱)
2. **children에 props 자동 주입** - React.cloneElement로 SpeedDialAction에 delay, open, id 전달
3. **순차 등장 애니메이션 계산** - `delay: 30 * (open ? index : allItems.length - index)` 수식
4. **Escape 키로 닫기** - 접근성 키보드 지원
5. **Zoom 입장 애니메이션** - hidden prop으로 메인 Fab의 Zoom 트랜지션 제어
6. **SpeedDialIcon 연동** - icon에 open prop을 전달하여 회전 애니메이션 연동

---

## 핵심 학습 포인트

이 컴포넌트에서 배울 수 있는 **핵심 개념과 패턴**을 코드와 함께 설명합니다.

### 1. blur/focus 이벤트 디바운싱 (setTimeout(fn, 0))

```javascript
const handleClose = (event) => {
  clearTimeout(timerRef.current);
  if (event.type === 'blur') {
    timerRef.current = setTimeout(() => {
      setOpenState(false);
      // ...
    }, 0);  // ← 0ms setTimeout!
  } else {
    setOpenState(false);
  }
};

const handleOpen = (event) => {
  clearTimeout(timerRef.current);
  if (!open) {
    timerRef.current = setTimeout(() => {
      setOpenState(true);
      // ...
    }, 0);
  }
};
```

**학습 가치**:
- **문제**: SpeedDial 내에서 포커스를 이동할 때 (예: Fab → SpeedDialAction), blur 이벤트가 먼저 발생하고 바로 뒤에 focus 이벤트가 발생합니다. blur에서 즉시 close하면 잠깐 닫혔다 열리는 깜빡임이 발생합니다.
- **해결**: `setTimeout(fn, 0)`으로 close를 microtask 뒤로 지연시키면, 바로 뒤따르는 focus 이벤트의 `clearTimeout`이 close를 취소합니다. 이 "이벤트 디바운싱" 패턴은 blur/focus 체인이 있는 모든 UI에서 활용 가능합니다.
- **패턴**: 항상 `clearTimeout`을 먼저 호출하여 이전 타이머를 취소한 뒤 새 타이머를 등록합니다.

### 2. React.cloneElement를 이용한 암시적 props 주입

```javascript
const children = allItems.map((child, index) => {
  return React.cloneElement(child, {
    delay: 30 * (open ? index : allItems.length - index),
    open,
    id: `${id}-action-${index}`,
  });
});
```

**학습 가치**:
- **오케스트레이터 패턴**: 부모 컴포넌트가 children의 props를 계산하여 주입하는 패턴. SpeedDialAction은 직접 delay나 open을 알 필요 없이, SpeedDial이 자동으로 계산하여 전달합니다.
- **순차 delay 수식**: `30 * (open ? index : allItems.length - index)` → open 시 0ms, 30ms, 60ms... (순차 등장), close 시 역순 (마지막부터 사라짐). 이 단순한 수식으로 자연스러운 캐스케이드 애니메이션이 만들어집니다.
- **ID 자동 생성**: `${id}-action-${index}`로 접근성 ID를 부모가 일관되게 관리합니다.

### 3. ariaLabel을 ID로 변환하는 패턴

```javascript
const id = ariaLabel.replace(/^[^a-z]+|[^\w:.-]+/gi, '');
```

**학습 가치**:
- **이중 용도**: 하나의 prop(ariaLabel)이 접근성 라벨과 고유 ID 생성 두 가지 목적으로 사용됩니다. 별도의 id prop 없이도 유효한 HTML id를 생성할 수 있습니다.
- **정규식**: 유효하지 않은 ID 문자를 제거하여 `aria-controls`와 `id` 속성에 안전하게 사용합니다.

---

## 내부 구조

### 1. 렌더링 구조

```javascript
// 위치: packages/mui-material/src/SpeedDial/SpeedDial.js (156줄, 원본 627줄)

SpeedDial (forwardRef)
  └─> div (root)  ← 이벤트 핸들러 (keydown, blur, focus, mouseenter, mouseleave)
       ├─> Zoom  ← hidden 제어, enter 225ms / exit 195ms
       │    └─> Fab  ← 메인 버튼, onClick 토글, aria-* 접근성
       │         └─> icon  ← cloneElement(icon, { open })로 SpeedDialIcon에 open 전달
       └─> div (actions)  ← role="menu", open에 따라 pointerEvents 변경
            └─> children  ← cloneElement로 delay/open/id 주입
```

### 2. 핵심 상태 (ref, state, 변수)

| 이름 | 타입 | 용도 |
|------|------|------|
| `open` | state | SpeedDial의 열림/닫힘 상태 |
| `timerRef` | ref | blur/focus 디바운싱용 setTimeout ID 저장 |
| `fabRef` | ref | 메인 Fab 버튼 DOM 참조 (Escape 시 focus 복원) |
| `id` | 변수 | ariaLabel에서 파생된 HTML 유효 ID |
| `allItems` | 변수 | childrenProp에서 유효한 React 엘리먼트만 필터링 |
| `children` | 변수 | allItems에 delay/open/id를 주입한 최종 children |

### 3. 함수 역할

#### handleKeyDown()

- **역할**: Escape 키로 SpeedDial 닫기 + Fab으로 포커스 복원
- **호출 시점**: root div의 onKeyDown
- **핵심 로직**:

```javascript
const handleKeyDown = (event) => {
  if (event.key === 'Escape') {
    setOpenState(false);        // 1. 닫기
    fabRef.current?.focus();     // 2. 메인 Fab으로 포커스 복원
    onClose?.(event, 'escapeKeyDown');  // 3. 콜백 알림
  }
};
```

- **왜 이렇게 구현했는지**: Escape로 닫은 뒤 포커스가 사라지면 접근성 문제가 됩니다. fabRef로 메인 버튼에 포커스를 돌려놓아 키보드 사용자가 계속 탐색할 수 있게 합니다.

#### handleClose()

- **역할**: blur 또는 mouseleave 시 SpeedDial 닫기
- **호출 시점**: root div의 onBlur, onMouseLeave
- **핵심 로직**:

```javascript
const handleClose = (event) => {
  clearTimeout(timerRef.current);  // 1. 기존 타이머 취소
  if (event.type === 'blur') {
    // blur는 디바운싱 (focus가 뒤따르면 취소됨)
    timerRef.current = setTimeout(() => {
      setOpenState(false);
      onClose?.(event, 'blur');
    }, 0);
  } else {
    // mouseleave는 즉시 닫기
    setOpenState(false);
    onClose?.(event, 'mouseLeave');
  }
};
```

- **왜 이렇게 구현했는지**: blur는 포커스 이동 시에도 발생하므로 디바운싱이 필수. mouseleave는 디바운싱 없이 즉시 닫아도 안전합니다.

#### handleClick()

- **역할**: 메인 Fab 클릭으로 open/close 토글
- **호출 시점**: Fab의 onClick
- **핵심 로직**:

```javascript
const handleClick = (event) => {
  clearTimeout(timerRef.current);  // 1. 진행 중인 open/close 타이머 취소
  if (open) {
    setOpenState(false);           // 2a. 열려있으면 닫기
    onClose?.(event, 'toggle');
  } else {
    setOpenState(true);            // 2b. 닫혀있으면 열기
    onOpen?.(event, 'toggle');
  }
};
```

- **왜 이렇게 구현했는지**: 클릭은 의도적인 사용자 액션이므로 디바운싱 없이 즉시 반응합니다. `clearTimeout`으로 진행 중인 blur 타이머를 취소하여 충돌을 방지합니다.

#### handleOpen()

- **역할**: focus 또는 mouseenter 시 SpeedDial 열기
- **호출 시점**: root div의 onFocus, onMouseEnter
- **핵심 로직**:

```javascript
const handleOpen = (event) => {
  clearTimeout(timerRef.current);  // 1. blur 타이머 취소 (핵심!)
  if (!open) {
    timerRef.current = setTimeout(() => {
      setOpenState(true);          // 2. 디바운스된 열기
      onOpen?.(event, eventMap[event.type]);
    }, 0);
  }
};
```

- **왜 이렇게 구현했는지**: `clearTimeout`이 먼저 실행되어 이전 handleClose의 blur 타이머를 취소합니다. 이것이 blur→focus 체인에서 깜빡임을 방지하는 핵심입니다.

### 4. 동작 흐름

#### open/close 이벤트 흐름

```
[이벤트] 발생
        ↓
┌─────────────────────────────────┐
│ Click 이벤트?                    │──→ YES → clearTimeout → toggle → 콜백
└─────────────────────────────────┘
        ↓ NO
┌─────────────────────────────────┐
│ Escape 키?                       │──→ YES → close → fabRef.focus() → 콜백
└─────────────────────────────────┘
        ↓ NO
┌─────────────────────────────────┐
│ blur / mouseleave?               │──→ YES → clearTimeout → setTimeout(close, 0)
└─────────────────────────────────┘       (mouseleave는 즉시 close)
        ↓ NO
┌─────────────────────────────────┐
│ focus / mouseenter?              │──→ YES → clearTimeout → setTimeout(open, 0)
└─────────────────────────────────┘
```

#### 시나리오 예시

**시나리오 1: 마우스로 열고 닫기**
```
mouseenter → clearTimeout → setTimeout(open, 0) → open=true → children에 open/delay 주입 → 순차 등장
mouseleave → clearTimeout(open 취소될 수도) → close → open=false → children에 open=false → 역순 사라짐
```

**시나리오 2: blur→focus 체인 (포커스 이동)**
```
Fab blur → clearTimeout → setTimeout(close, 0) [예약]
SpeedDialAction focus → clearTimeout [close 취소!] → setTimeout(open, 0) → 깜빡임 없이 열린 상태 유지
```

**시나리오 3: 클릭 토글**
```
Fab click → clearTimeout → open=true → 순차 등장
Fab click → clearTimeout → open=false → 역순 사라짐
```

### 5. 핵심 패턴/플래그

#### timerRef를 이용한 이벤트 디바운싱

- **비유**: "은행 대기 번호표 - 새 번호표를 받으면 이전 번호표는 무효"
- **역할**: blur와 focus가 연속 발생할 때 마지막 이벤트만 실행되도록 보장

**왜 필요한가?**

```
// timerRef 없을 때:
blur 발생 → close() 즉시 실행 → open=false (UI 깜빡)
focus 발생 → open() 실행 → open=true

// 결과: 닫혔다 열리는 깜빡임!
```

**timerRef가 있으면:**

```
// timerRef 있을 때:
blur 발생 → timerRef = setTimeout(close, 0) [예약만]
focus 발생 → clearTimeout(timerRef) [close 취소!] → setTimeout(open, 0)

// 결과: 열린 상태 유지, 깜빡임 없음!
```

#### open 기반 순차 delay 수식

- **비유**: "도미노 - 열 때는 처음부터, 닫을 때는 끝부터"
- **역할**: `30 * (open ? index : allItems.length - index)` 하나의 수식으로 열기/닫기 양방향 캐스케이드

```javascript
// 3개 액션일 때:
// open = true  → delay: 0ms, 30ms, 60ms    (순차 등장)
// open = false → delay: 90ms, 60ms, 30ms   (역순 사라짐)
```

### 6. 주요 변경 사항 (원본 대비)

```javascript
// 원본: useControlled + useTimeout + 4방향 + 화살표 키 + styled + slot + ...
// 단순화: useState + setTimeout + 'up' 고정 + Escape만 + inline styles
```

**원본과의 차이**:
- ❌ `Slot 시스템` 제거 → div, Zoom, Fab 직접 사용
- ❌ `direction` 제거 → 'up' 고정 (column-reverse)
- ❌ `화살표 키 내비게이션` 제거 → Escape만 유지
- ❌ `useControlled` 제거 → React.useState (uncontrolled만)
- ❌ `useTimeout` 제거 → useRef + setTimeout/clearTimeout
- ❌ `isMuiElement` 제거 → React.isValidElement만으로 판별
- ❌ `FabProps`, `TransitionComponent`, `TransitionProps` 제거
- ❌ `styled`, `memoTheme`, `useDefaultProps`, `useTheme` 제거
- ✅ `blur/focus 디바운싱` 유지 → 핵심 UX 패턴
- ✅ `cloneElement props 주입` 유지 → 오케스트레이터 핵심 동작
- ✅ `Zoom 트랜지션` 유지 → hidden prop으로 제어

### 7. Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `ariaLabel` | string (필수) | - | 접근성 라벨 + ID 생성 기준 |
| `children` | ReactNode | - | SpeedDialAction 컴포넌트들 |
| `className` | string | - | root div에 적용할 CSS 클래스 |
| `hidden` | boolean | `false` | Zoom 트랜지션으로 전체 숨김 |
| `icon` | ReactNode | - | 메인 Fab 아이콘 (SpeedDialIcon 권장) |
| `onClose` | function | - | 닫힐 때 콜백 `(event, reason)` |
| `onOpen` | function | - | 열릴 때 콜백 `(event, reason)` |

**제거된 Props**:
- ❌ `direction` - 'up' 고정 (4방향 레이아웃 복잡도 제거)
- ❌ `open` - 내부 state만 사용 (controlled 모드 제거)
- ❌ `openIcon` - 원본에서도 미사용
- ❌ `FabProps` - deprecated, Fab 직접 제어
- ❌ `slots` / `slotProps` - Slot 시스템 제거
- ❌ `TransitionComponent` / `TransitionProps` - Zoom 고정
- ❌ `transitionDuration` - `{ enter: 225, exit: 195 }` 고정
- ❌ `classes` - MUI 클래스 시스템 제거
- ❌ `sx` - styled 시스템 제거

---

## 커밋 히스토리로 보는 단순화 과정

SpeedDial은 **8개의 커밋**을 통해 단순화되었습니다.

### 1단계: Slot 시스템 + deprecated props 제거

- `c351247430` - [SpeedDial 단순화 1/8] Slot 시스템 + deprecated props 제거

**삭제된 코드**:
```javascript
// useSlot 2개 + backwardCompatible 변환 + getSlotProps 콜백
const backwardCompatibleSlots = { transition: TransitionComponentProp, ...slots };
const [RootSlot, rootSlotProps] = useSlot('root', { elementType: SpeedDialRoot, ... });
const [TransitionSlot, transitionProps] = useSlot('transition', { ... });
```

**왜 불필요한가**:
- **학습 목적**: 슬롯 커스터마이징이 아닌 open/close 동작을 배우는 것
- **복잡도**: useSlot 2회 + deprecated → slot 변환 레이어 (~35줄)

### 2단계: direction 고정 (up)

- `710416da97` - [SpeedDial 단순화 2/8] direction 고정 (up)

**삭제된 코드**:
```javascript
// 4방향 variants + getOrientation + tooltipPlacement 계산
function getOrientation(direction) { ... }
variants: [
  { props: { direction: 'up' }, style: { flexDirection: 'column-reverse', ... } },
  { props: { direction: 'down' }, ... },
  { props: { direction: 'left' }, ... },
  { props: { direction: 'right' }, ... },
]
```

**왜 불필요한가**:
- **학습 목적**: 핵심 동작(open/close + 순차 애니메이션)은 방향과 무관
- **복잡도**: 4방향 variants + getOrientation + tooltipPlacement 자동 계산 (~70줄)

### 3단계: 키보드 내비게이션 단순화

- `bd47fb0653` - [SpeedDial 단순화 3/8] 키보드 내비게이션 단순화

**삭제된 코드**:
```javascript
// ref 3개 + 팩토리 함수 + 화살표 키 로직
const focusedAction = React.useRef(0);
const nextItemArrowKey = React.useRef();
const actions = React.useRef([]);
const createHandleSpeedDialActionButtonRef = (...) => { ... };
// handleKeyDown에서 getOrientation + clamp 조합 로직
```

**왜 불필요한가**:
- **학습 목적**: 단순화된 SpeedDialAction이 `tabIndex={-1}`이라 화살표 키 포커스 이동이 실질적으로 불필요
- **복잡도**: ref 3개 + 팩토리 함수 + useEffect 리셋 + clamp (~80줄)

### 4단계: 유틸리티 훅 단순화

- `521d775cea` - [SpeedDial 단순화 4/8] 유틸리티 훅 단순화

**삭제된 코드**:
```javascript
import useControlled from '../utils/useControlled';
import useTimeout from '@mui/utils/useTimeout';
import { isFragment } from 'react-is';
import isMuiElement from '../utils/isMuiElement';
```

**왜 불필요한가**:
- **학습 목적**: useState, setTimeout이 MUI 유틸리티보다 직관적
- **복잡도**: 4개 외부 의존성 제거, React 기본 API만 사용

### 5단계: useUtilityClasses 및 classes prop 제거

- `57a7f72333` - [SpeedDial 단순화 5/8] useUtilityClasses 및 classes prop 제거

**왜 불필요한가**:
- **학습 목적**: MUI 클래스 인프라는 컴포넌트 동작과 무관
- **복잡도**: useUtilityClasses + composeClasses + speedDialClasses + clsx (~25줄)

### 6단계: Theme 시스템 제거

- `216e92a366` - [SpeedDial 단순화 6/8] Theme 시스템 제거

**삭제된 코드**:
```javascript
const theme = useTheme();
const defaultTransitionDuration = {
  enter: theme.transitions.duration.enteringScreen, // → 225
  exit: theme.transitions.duration.leavingScreen,    // → 195
};
// zIndex: (theme.vars || theme).zIndex.speedDial → 1050
```

**왜 불필요한가**:
- **학습 목적**: 테마 인프라 없이도 동일한 동작
- **복잡도**: useDefaultProps + useTheme + memoTheme (~15줄)

### 7단계: styled 컴포넌트 → inline styles

- `881868782e` - [SpeedDial 단순화 7/8] styled 컴포넌트 → inline styles

**왜 불필요한가**:
- **학습 목적**: styled API보다 inline style이 직관적
- **복잡도**: styled 컴포넌트 3개 + ownerState + variants (~50줄)

### 8단계: PropTypes 제거

- `582730894b` - [SpeedDial 단순화 8/8] PropTypes 제거

**왜 불필요한가**:
- **학습 목적**: 런타임 타입 메타데이터, 동작과 무관
- **복잡도**: PropTypes 블록 (~140줄)

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 627줄 | 156줄 (75% 감소) |
| **Props 개수** | 20+개 | 7개 |
| **direction** | 4방향 (up/down/left/right) | ❌ 'up' 고정 |
| **키보드 내비게이션** | 화살표 키 + Escape | Escape만 |
| **상태 관리** | controlled + uncontrolled | uncontrolled만 |
| **이벤트 디바운싱** | useTimeout (MUI 유틸) | setTimeout/clearTimeout |
| **SpeedDialIcon 감지** | isMuiElement | React.isValidElement |
| **Slot 시스템** | ✅ root, transition | ❌ 제거 |
| **Theme 시스템** | ✅ useTheme, useDefaultProps | ❌ 하드코딩 |
| **styled 컴포넌트** | ✅ 3개 | ❌ inline styles |
| **PropTypes** | ✅ 140줄 | ❌ 제거 |

---

## 학습 후 다음 단계

SpeedDial을 이해했다면:

1. **SpeedDialIcon** (`SpeedDialIcon-simplified.md`) - SpeedDial이 전달하는 `open` prop으로 회전 애니메이션하는 아이콘
2. **SpeedDialAction** (`SpeedDialAction-simplified.md`) - SpeedDial이 전달하는 `delay`, `open`, `id`로 순차 scale 애니메이션하는 액션 버튼
3. **실전 응용** - 세 컴포넌트를 조합하여 완전한 SpeedDial UI 구성

**예시: 기본 사용**
```jsx
import SpeedDial from './SpeedDial';
import SpeedDialIcon from './SpeedDialIcon';
import SpeedDialAction from './SpeedDialAction';

function MySpeedDial() {
  return (
    <SpeedDial
      ariaLabel="actions"
      icon={<SpeedDialIcon />}
      onOpen={(e, reason) => console.log('opened by', reason)}
      onClose={(e, reason) => console.log('closed by', reason)}
    >
      <SpeedDialAction icon={<CopyIcon />} tooltipTitle="Copy" />
      <SpeedDialAction icon={<PrintIcon />} tooltipTitle="Print" />
      <SpeedDialAction icon={<ShareIcon />} tooltipTitle="Share" />
    </SpeedDial>
  );
}
```

**예시: hidden으로 조건부 표시**
```jsx
function ConditionalSpeedDial({ visible }) {
  return (
    <SpeedDial
      ariaLabel="actions"
      icon={<SpeedDialIcon />}
      hidden={!visible}  // Zoom 애니메이션으로 나타남/사라짐
    >
      <SpeedDialAction icon={<EditIcon />} tooltipTitle="Edit" />
    </SpeedDial>
  );
}
```
