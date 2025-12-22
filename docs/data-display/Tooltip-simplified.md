# Tooltip 컴포넌트

> 단순화된 Tooltip 컴포넌트 - 호버/포커스/터치 시 텍스트 팝업 표시의 핵심만 남김

---

## 무슨 기능을 하는가?

단순화된 Tooltip는 **사용자가 요소에 호버, 포커스, 터치할 때 설명 텍스트를 팝업으로 표시**하는 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **멀티 이벤트 감지** - 마우스 호버(필수), 키보드 포커스, 터치(long-press) 지원
2. **타이머 기반 표시** - enterDelay, enterTouchDelay로 딜레이 후 표시
3. **Portal 렌더링** - Tooltip을 document.body에 렌더링하여 부모의 overflow 제약 없이 표시
4. **제어/비제어 모드** - open prop으로 제어 컴포넌트로 사용 가능

---

## 핵심 학습 포인트

### 1. Portal 패턴

```javascript
{open && childNode && ReactDOM.createPortal(
  <div style={{ position: 'absolute', top: tooltipPosition.top, ... }}>
    <div>{title}</div>
  </div>,
  document.body
)}
```

**학습 가치**:
- Portal을 사용하면 부모 컴포넌트의 DOM 계층 구조 밖에서 렌더링 가능
- 부모의 `overflow: hidden` 제약을 벗어나 자유로운 위치 지정 가능
- 모달, 드롭다운, 툴팁 등 오버레이 UI에서 필수적인 패턴

### 2. getBoundingClientRect()로 위치 계산

```javascript
const rect = childNode.getBoundingClientRect();
const scrollY = window.pageYOffset || document.documentElement.scrollTop;
const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
setTooltipPosition({
  top: rect.top + scrollY,
  left: rect.left + scrollX + rect.width / 2,
});
```

**학습 가치**:
- `getBoundingClientRect()`는 뷰포트 기준 위치를 반환
- 스크롤 오프셋을 더해 문서 기준 절대 위치 계산
- 중앙 정렬을 위한 `rect.width / 2` 오프셋 활용

### 3. Timer 패턴 (useTimeout 훅)

```javascript
const enterTimer = useTimeout();

const handleMouseOver = (event) => {
  enterTimer.clear();
  if (enterDelay) {
    enterTimer.start(enterDelay, () => {
      handleOpen(event);
    });
  } else {
    handleOpen(event);
  }
};
```

**학습 가치**:
- 타이머를 clear/start로 관리하는 패턴
- 이벤트 중복 방지 (기존 타이머 clear 후 새로 start)
- 조건부 딜레이 처리

### 4. React.cloneElement로 이벤트 핸들러 주입

```javascript
const childrenProps = {
  ...other,
  ...children.props,
  onMouseOver: handleMouseOver,
  onMouseLeave: handleMouseLeave,
  ref: setChildNode,
};

return (
  <React.Fragment>
    {React.cloneElement(children, childrenProps)}
    {/* Tooltip Portal */}
  </React.Fragment>
);
```

**학습 가치**:
- `React.cloneElement`로 자식 컴포넌트에 props 주입
- 자식의 기존 props와 병합 (`...children.props`)
- ref 전달로 DOM 노드 접근 가능

### 5. 제어/비제어 컴포넌트 패턴

```javascript
const [openState, setOpenState] = useControlled({
  controlled: openProp,
  default: false,
  name: 'Tooltip',
  state: 'open',
});
```

**학습 가치**:
- `open` prop이 있으면 제어 컴포넌트, 없으면 비제어
- 내부 상태와 외부 제어를 하나의 패턴으로 통합

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/mui-material/src/Tooltip/Tooltip.js (335줄, 원본 999줄)
React.Fragment
  ├─> React.cloneElement(children, childrenProps)  // 이벤트 핸들러 주입
  │     └─> onMouseOver, onMouseLeave, onFocus, onBlur, onTouchStart, onTouchEnd
  │
  └─> ReactDOM.createPortal(
        <div>                              // 포지셔닝 컨테이너
          <div>{title}</div>               // Tooltip 박스
        </div>,
        document.body
      )
```

### 2. 이벤트 핸들링

```javascript
// 마우스 호버 (항상 활성)
childrenProps.onMouseOver = handleMouseOver;
childrenProps.onMouseLeave = handleMouseLeave;

// 포커스 (조건부)
if (!disableFocusListener) {
  childrenProps.onFocus = handleFocus;
  childrenProps.onBlur = handleBlur;
}

// 터치 (조건부)
if (!disableTouchListener) {
  childrenProps.onTouchStart = handleTouchStart;
  childrenProps.onTouchEnd = handleTouchEnd;
}
```

> **💡 원본과의 차이**:
> - ❌ `composeEventHandler` 제거 → 자식의 기존 핸들러 보존 안 함
> - ❌ `disableHoverListener` 제거 → 호버는 항상 활성화

### 3. 위치 계산 (Portal + absolute positioning)

```javascript
const [tooltipPosition, setTooltipPosition] = React.useState({ top: 0, left: 0 });

React.useLayoutEffect(() => {
  if (open && childNode) {
    const rect = childNode.getBoundingClientRect();
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    setTooltipPosition({
      top: rect.top + scrollY,
      left: rect.left + scrollX + rect.width / 2,
    });
  }
}, [open, childNode]);
```

> **💡 원본과의 차이**:
> - ❌ Popper.js (305줄) 제거 → 간단한 `getBoundingClientRect()` 사용
> - ❌ 15가지 placement 제거 → bottom 위치만 고정 (`translate(-50%, -100%)`)

### 4. 타이머 시스템

```javascript
const enterTimer = useTimeout();  // 호버 딜레이
const touchTimer = useTimeout();  // 터치 long-press 딜레이
```

> **💡 원본과의 차이**:
> - ❌ `hystersisTimer` 제거 → 빠른 전환 최적화 없음
> - ❌ `leaveTimer`, `closeTimer` 제거 → 즉시 닫힘

### 5. Props (11개만 남음)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | ReactElement | - | **필수**. Tooltip을 붙일 대상 요소 |
| `title` | ReactNode | - | **필수**. Tooltip에 표시할 내용 |
| `open` | boolean | undefined | 제어 컴포넌트 모드 (제공 시 외부에서 제어) |
| `enterDelay` | number | 100 | 호버 후 표시 딜레이 (ms) |
| `enterTouchDelay` | number | 700 | 터치 후 표시 딜레이 (ms) |
| `leaveTouchDelay` | number | 1500 | 터치 종료 후 숨김 딜레이 (ms) |
| `disableFocusListener` | boolean | false | 포커스 이벤트 비활성화 |
| `disableTouchListener` | boolean | false | 터치 이벤트 비활성화 |
| `onOpen` | function | - | 열림 콜백 |
| `onClose` | function | - | 닫힘 콜백 |
| `id` | string | auto | ARIA ID |

---

## 커밋 히스토리로 보는 단순화 과정

Tooltip는 **15개의 커밋**을 통해 단순화되었습니다.

### 1단계: 시스템 제거 (Commit 1-3)
- `15019a1962` - [Tooltip 단순화 1/15] Slot 시스템 제거
  - Material-UI v5의 4개 슬롯 시스템 제거
  - **왜 불필요**: Tooltip의 핵심은 "호버 시 팝업 표시"이지 "컴포넌트 커스터마이징"이 아님
- `532147d714` - [Tooltip 단순화 2/15] Transition/Animation 제거
  - Grow transition 컴포넌트 제거
  - **왜 불필요**: 애니메이션 없이 즉시 나타나도 기능 이해 가능
- `dc9901dd54` - [Tooltip 단순화 3/15] Popper 시스템 제거 및 absolute positioning으로 변경
  - Popper.js (305줄) 의존성 제거
  - **왜 불필요**: 간단한 `position: absolute`로도 Tooltip 개념 이해 충분

### 2단계: 시각적 기능 제거 (Commit 4-5)
- `be76d897ce` - [Tooltip 단순화 4/15] Arrow 기능 제거
  - 화살표 표시 기능 제거
  - **왜 불필요**: 화살표는 시각적 장식일 뿐 핵심 기능 아님
- `7273756e35` - [Tooltip 단순화 5/15] Placement를 bottom 고정 (15가지 → 1가지)
  - 15가지 placement를 'bottom' 하나로 고정
  - **왜 불필요**: 한 가지 위치로도 Tooltip 개념 이해 충분

### 3단계: 고급 기능 제거 (Commit 6-9)
- `b1ae85bf3c` - [Tooltip 단순화 6/15] followCursor 제거
  - 마우스 커서 따라다니기 제거
  - **왜 불필요**: 일반적인 Tooltip은 요소 위에 고정
- `b43be4d6c2` - [Tooltip 단순화 7/15] 타이머 시스템 단순화 (hysteresis 제거)
  - 5개 타이머를 2개로 단순화
  - **왜 불필요**: hysteresis는 UX 최적화일 뿐 핵심 기능 아님
- `ce646c7a0c` - [Tooltip 단순화 8/15] disableInteractive 제거
  - Tooltip 위에 마우스 올렸을 때 열린 상태 유지 제거
  - **왜 불필요**: 특수한 UX 최적화 기능
- `d848a4b751` - [Tooltip 단순화 9/15] disableHoverListener 제거 및 Hover만 남기기
  - 호버 이벤트 비활성화 옵션 제거, composeEventHandler 제거
  - **왜 불필요**: Tooltip의 기본 동작은 호버 시 표시

### 4단계: 국제화 및 접근성 단순화 (Commit 10-11)
- `bcd583f2ca` - [Tooltip 단순화 10/15] RTL 지원 제거
  - Right-to-Left 언어 지원 제거
  - **왜 불필요**: RTL은 국제화 고급 주제, LTR만으로 충분
- `a4a180c7d1` - [Tooltip 단순화 11/15] 접근성 Props 단순화 (ARIA 제거)
  - 복잡한 ARIA 속성 계산 제거
  - **왜 불필요**: 접근성은 고급 주제, 기본 title 속성으로 충분

### 5단계: 인프라 제거 (Commit 12-15)
- `049756b19a` - [Tooltip 단순화 12/15] Theme 시스템 제거
  - useDefaultProps, useTheme, useUtilityClasses, composeClasses 제거
  - **왜 불필요**: 테마 시스템은 전체 프레임워크 주제, 하드코딩으로 충분
- `bd9c47459c` - [Tooltip 단순화 13/15] Styled component 시스템 제거
  - styled() API를 인라인 스타일로 변경
  - **왜 불필요**: CSS-in-JS 대신 인라인 스타일로도 동작 이해 가능
- `bd1d8a0e87` - [Tooltip 단순화 14/15] 복잡한 Ref 처리 제거
  - useForkRef, getReactElementRef 제거
  - **왜 불필요**: ref 병합은 React 고급 주제, 단순한 ref로 충분
- `1d1b2c234c` - [Tooltip 단순화 15/15] PropTypes 제거
  - 런타임 타입 검증 시스템 제거 (200줄)
  - **왜 불필요**: PropTypes는 검증 도구이지 컴포넌트 로직 아님

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 999줄 | 335줄 (66.5% 감소) |
| **Props 개수** | 40+개 | 11개 |
| **Popper.js** | ✅ 305줄 | ❌ getBoundingClientRect 사용 |
| **Placement** | ✅ 15가지 | ❌ bottom 고정 |
| **Animation** | ✅ Grow transition | ❌ 즉시 표시 |
| **Arrow** | ✅ 화살표 표시 | ❌ 제거 |
| **Timer** | ✅ 5개 타이머 | ✅ 2개 타이머 |
| **followCursor** | ✅ 커서 따라다니기 | ❌ 제거 |
| **disableHoverListener** | ✅ 호버 비활성화 | ❌ 항상 활성 |
| **RTL** | ✅ Right-to-Left 지원 | ❌ LTR만 |
| **ARIA** | ✅ 복잡한 속성 | ❌ 최소한만 |
| **Theme** | ✅ 테마 시스템 | ❌ 하드코딩 |
| **Styled** | ✅ styled() API | ❌ 인라인 스타일 |
| **PropTypes** | ✅ 200줄 | ❌ 제거 |

---

## 학습 후 다음 단계

Tooltip를 이해했다면:

1. **Popper** - Tooltip의 위치 계산을 담당하는 하위 레벨 컴포넌트 (원본에서 사용)
2. **Popover** - Tooltip과 유사하지만 더 많은 콘텐츠를 담을 수 있는 컴포넌트
3. **실전 응용** - 커스텀 Tooltip 만들기

**예시: 기본 사용**
```javascript
import Tooltip from './Tooltip';

function App() {
  return (
    <Tooltip title="저장하기">
      <button>Save</button>
    </Tooltip>
  );
}
```

**예시: 제어 컴포넌트**
```javascript
function ControlledTooltip() {
  const [open, setOpen] = React.useState(false);

  return (
    <Tooltip
      title="제어된 Tooltip"
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
    >
      <button>Hover me</button>
    </Tooltip>
  );
}
```

**예시: 딜레이 커스터마이징**
```javascript
<Tooltip
  title="3초 후 표시됩니다"
  enterDelay={3000}
  leaveTouchDelay={500}
>
  <span>Delayed tooltip</span>
</Tooltip>
```
