# SpeedDial 컴포넌트

> SpeedDial 컴포넌트 원본 구조 빠른 파악

**⚠️ 이 문서의 목적**: 간소화 작업 **전에** 원본 코드를 빠르게 이해하기 위한 요약 문서입니다.

---

## 무슨 기능을 하는가?

SpeedDial은 **메인 Fab 버튼을 클릭/hover하면 SpeedDialAction들이 순차 애니메이션으로 펼쳐지는 오케스트레이터** 컴포넌트입니다.

### 핵심 기능
1. **open/close 상태 관리** - 클릭 토글, hover/focus 열기, blur/mouseleave 닫기 (useControlled + useTimeout 디바운싱)
2. **children에 props 자동 주입** - React.cloneElement로 SpeedDialAction에 delay, open, id, tooltipPlacement 전달
3. **순차 등장 애니메이션** - delay 계산 (`30 * (open ? index : allItems.length - index)`)으로 순차 등장/역순 사라짐
4. **4방향 레이아웃** - direction prop (up/down/left/right)에 따른 flexDirection, margin, padding, tooltipPlacement 자동 계산
5. **키보드 내비게이션** - 화살표 키로 액션 간 포커스 이동, Escape로 닫기
6. **Zoom 입장 애니메이션** - hidden prop으로 메인 Fab의 Zoom 트랜지션 제어
7. **SpeedDialIcon 감지** - isMuiElement로 아이콘이 SpeedDialIcon이면 open prop 전달 (회전 애니메이션)

---

## 주요 코드 구조

### 파일 위치 및 크기

```
packages/mui-material/src/SpeedDial/SpeedDial.js (627줄)
packages/mui-material/src/SpeedDial/speedDialClasses.ts (41줄)
```

### 렌더링 구조

```
SpeedDial (forwardRef)
  └─> RootSlot (styled div)  ← 이벤트 핸들러 (keydown, blur, focus, mouse)
       ├─> TransitionSlot (Zoom)  ← hidden/transitionDuration 제어
       │    └─> SpeedDialFab (styled Fab)  ← 메인 버튼, onClick 토글
       │         └─> icon  ← SpeedDialIcon이면 cloneElement(icon, { open })
       └─> SpeedDialActions (styled div)  ← role="menu"
            └─> children  ← cloneElement로 delay/open/id/tooltipPlacement 주입
```

### 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `ariaLabel` | string (필수) | - | 접근성 라벨 + ID 생성 기준 |
| `children` | ReactNode | - | SpeedDialAction 컴포넌트들 |
| `direction` | 'up'\|'down'\|'left'\|'right' | `'up'` | 액션 펼침 방향 |
| `hidden` | boolean | `false` | Zoom 트랜지션으로 전체 숨김 |
| `icon` | ReactNode | - | 메인 Fab 아이콘 (SpeedDialIcon 권장) |
| `open` | boolean | - | controlled 모드 열림 상태 |
| `onClose` | function | - | 닫힐 때 콜백 (event, reason) |
| `onOpen` | function | - | 열릴 때 콜백 (event, reason) |
| `FabProps` | object | `{}` | Fab에 전달할 props (deprecated) |
| `slots` | object | `{}` | root, transition 슬롯 |
| `slotProps` | object | `{}` | 슬롯별 props |
| `TransitionComponent` | elementType | `Zoom` | 트랜지션 컴포넌트 (deprecated) |
| `transitionDuration` | number\|object | theme 기반 | 트랜지션 시간 |

### 핵심 로직 발췌

```javascript
// 1. 이벤트 디바운싱: blur/focus 체인에서 불필요한 close/open 방지
const eventTimer = useTimeout();

const handleClose = (event) => {
  eventTimer.clear();
  if (event.type === 'blur') {
    // setTimeout(0)으로 다음 focus 이벤트가 취소할 기회 제공
    eventTimer.start(0, () => { setOpenState(false); onClose?.(event, 'blur'); });
  } else {
    setOpenState(false);
    onClose?.(event, 'mouseLeave');
  }
};

const handleOpen = (event) => {
  eventTimer.clear();
  if (!open) {
    eventTimer.start(0, () => { setOpenState(true); onOpen?.(event, ...); });
  }
};
```

```javascript
// 2. children에 props 자동 주입 (순차 delay 계산)
const children = allItems.map((child, index) => {
  return React.cloneElement(child, {
    delay: 30 * (open ? index : allItems.length - index),
    open,
    tooltipPlacement,
    id: `${id}-action-${index}`,
  });
});
```

```javascript
// 3. SpeedDialIcon 감지 → open prop 전달
{React.isValidElement(icon) && isMuiElement(icon, ['SpeedDialIcon'])
  ? React.cloneElement(icon, { open })
  : icon}
```

```javascript
// 4. 화살표 키 포커스 이동
const actionStep = key === nextItemArrowKeyCurrent ? 1 : -1;
const nextAction = clamp(focusedAction.current + actionStep, 0, actions.current.length - 1);
actions.current[nextAction].focus();
```

---

## 복잡도의 이유

SpeedDial은 **627줄**이며, 복잡한 이유는:

1. **Slot 시스템** - useSlot 2번(root, transition) + getSlotProps 콜백으로 이벤트 핸들러 간접 주입 + backwardCompatible 변환
2. **4방향 레이아웃** - getOrientation 함수, 4개 styled variants(flexDirection, margin, padding), direction별 tooltipPlacement/aria-orientation
3. **키보드 내비게이션** - focusedAction/nextItemArrowKey/actions ref 3개, createHandleSpeedDialActionButtonRef 팩토리, clamp/getOrientation 조합
4. **이벤트 디바운싱** - useTimeout으로 blur/focus 체인 처리, handleClose/handleOpen/handleClick 3개 핸들러 각각 eventTimer 관리
5. **controlled/uncontrolled 양쪽 지원** - useControlled 훅으로 open 상태 추상화
6. **styled 컴포넌트 3개** - SpeedDialRoot, SpeedDialFab, SpeedDialActions 각각 theme 의존 스타일 + variants
7. **deprecated props 호환** - FabProps, TransitionComponent, TransitionProps → slots/slotProps 변환 레이어

---

## 간소화 방향

이 컴포넌트를 간소화할 때 제거 고려 대상:

- **Slot 시스템** - useSlot + externalForwardedProps → div, Zoom, Fab 직접 사용
- **direction prop** - 4방향 → 'up' 고정, getOrientation/variants 제거
- **화살표 키 내비게이션** - Escape만 유지, ref 배열/팩토리 함수 제거
- **useControlled** - useState로 대체 (uncontrolled만 지원)
- **useTimeout** - useRef + setTimeout으로 대체
- **react-is + isMuiElement** - React.isValidElement만으로 단순화
- **useUtilityClasses + classes** - MUI 클래스 인프라 제거
- **Theme 시스템** - 스타일 값 하드코딩
- **styled 컴포넌트** - inline styles로 변환
- **PropTypes** - 메타데이터 제거

> 상세한 간소화 결과는 `SpeedDial-simplified.md` 참고
