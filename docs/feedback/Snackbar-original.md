# Snackbar 컴포넌트

> Snackbar 컴포넌트 원본 구조 빠른 파악

**⚠️ 이 문서의 목적**: 간소화 작업 **전에** 원본 코드를 빠르게 이해하기 위한 요약 문서입니다.

---

## 무슨 기능을 하는가?

Snackbar는 **화면 하단(기본)에 일시적인 알림 메시지를 표시하고 자동 또는 사용자 액션으로 닫히는** 컴포넌트입니다.

### 핵심 기능
1. **open 제어** - `open` prop으로 표시/숨김, 애니메이션이 끝날 때까지 DOM에 유지
2. **자동 닫기** - `autoHideDuration`으로 타이머 후 `onClose` 호출
3. **ESC 키 닫기** - keydown 이벤트 리스너로 ESC 감지
4. **ClickAway 닫기** - 외부 클릭 시 `onClose` 호출
5. **타이머 일시정지** - hover/focus 시 타이머 중단, 떠날 때 재개
6. **window blur 감지** - 창이 비활성화되면 타이머 중단
7. **위치 지정** - `anchorOrigin`으로 화면 6개 위치 중 선택

---

## 주요 코드 구조

### 파일 위치 및 크기

```
packages/mui-material/src/Snackbar/Snackbar.js (417줄)
packages/mui-material/src/Snackbar/useSnackbar.ts (153줄)
```

### 렌더링 구조

```
Snackbar
  └─> ClickAwayListener  ← 외부 클릭 감지
       └─> SnackbarRoot (styled div)  ← 위치 지정 (fixed)
            └─> Grow (transition)  ← 등장/사라짐 애니메이션
                 └─> children 또는 SnackbarContent
```

### 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `open` | boolean | - | 표시 여부 |
| `onClose` | func | - | 닫기 콜백 (reason: 'timeout'\|'clickaway'\|'escapeKeyDown') |
| `autoHideDuration` | number | `null` | 자동 닫기 시간(ms) |
| `message` | node | - | SnackbarContent에 전달할 메시지 |
| `action` | node | - | SnackbarContent에 전달할 액션 |
| `anchorOrigin` | object | `{vertical:'bottom', horizontal:'left'}` | 화면 위치 |
| `resumeHideDuration` | number | `autoHideDuration/2` | hover 후 재개 시 대기 시간 |
| `disableWindowBlurListener` | boolean | `false` | window blur 감지 비활성화 |
| `TransitionComponent` | elementType | `Grow` | 전환 컴포넌트 (deprecated) |
| `slots` | object | `{}` | 슬롯 컴포넌트 커스터마이징 |
| `slotProps` | object | `{}` | 슬롯 props 커스터마이징 |

### 핵심 로직 발췌

```javascript
// useSnackbar.ts - 핵심 타이머 로직
const setAutoHideTimer = useEventCallback((autoHideDurationParam) => {
  if (!onClose || autoHideDurationParam == null) return;
  timerAutoHide.start(autoHideDurationParam, () => {
    handleClose(null, 'timeout');
  });
});

// hover 시 타이머 일시정지
const handlePause = timerAutoHide.clear;

// hover 떠날 때 재개
const handleResume = React.useCallback(() => {
  if (autoHideDuration != null) {
    setAutoHideTimer(resumeHideDuration ?? autoHideDuration * 0.5);
  }
}, [autoHideDuration, resumeHideDuration, setAutoHideTimer]);
```

```javascript
// Snackbar.js - exited 상태로 애니메이션 완료까지 DOM 유지
const [exited, setExited] = React.useState(true);
if (!open && exited) {
  return null;  // 닫혔고 애니메이션도 끝나면 제거
}
```

---

## 복잡도의 이유

Snackbar + useSnackbar는 **570줄**이며, 복잡한 이유는:

1. **Slot 시스템** - 4개 슬롯(root, clickAwayListener, content, transition) 각각 useSlot 호출 + externalForwardedProps 병합
2. **useSnackbar 훅 분리** - ESC 키, 타이머, hover/focus/blur pause/resume, window blur, getRootProps 추상화
3. **Transition 통합** - exited 상태 + handleEnter/handleExited로 애니메이션 생명주기 관리
4. **deprecated props 병합** - TransitionComponent/TransitionProps/ClickAwayListenerProps/ContentProps를 slots/slotProps와 병합
5. **styled variants** - anchorOrigin 6가지 조합 × breakpoints 반응형 스타일

---

## 간소화 방향

이 컴포넌트를 간소화할 때 제거 고려 대상:

- **Slot 시스템** - 4개 useSlot 호출, externalForwardedProps → 직접 컴포넌트 사용
- **Transition(Grow)** - exited state + handleEnter/handleExited + transitionDuration → `{open && ...}` 단순 조건부 렌더링
- **deprecated props** - TransitionComponent, TransitionProps, ClickAwayListenerProps, ContentProps
- **Pause/Resume 로직** - hover/focus/window blur 타이머 일시정지 → 항상 타이머 실행
- **useSnackbar 훅** - 인라인화하여 직접 Snackbar 내부에서 setTimeout/addEventListener 사용
- **Theme 시스템** - useDefaultProps, useTheme, useUtilityClasses, composeClasses
- **styled 컴포넌트** - SnackbarRoot → div + inline style

> 상세한 간소화 결과는 `Snackbar-simplified.md` 참고
