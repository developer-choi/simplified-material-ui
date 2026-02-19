# Snackbar 컴포넌트

> open/close 제어, autoHide 타이머, ESC/ClickAway 닫기를 가진 알림 컴포넌트

---

## 이 문서의 목적

**이 문서는 단순화된 코드의 "상세 학습 가이드"입니다.**

라이브러리 코드는 복잡합니다. 단순화했더라도 코드만 보고는 이해하기 어려울 수 있습니다.
이 문서는 코드의 **동작 원리, 핵심 패턴, 왜 이렇게 구현했는지**를 상세히 설명하여 학습을 돕습니다.

> **원본 구조 파악**: 원본 코드의 빠른 이해는 `Snackbar-original.md` 참고

---

## 무슨 기능을 하는가?

수정된 Snackbar는 **open prop으로 표시/숨김을 제어하며, autoHideDuration 타이머·ESC 키·외부 클릭으로 onClose를 호출하는** 알림 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **open 제어** - `open`이 false면 null 반환, true면 렌더링
2. **autoHideDuration 타이머** - 지정 시간 후 `onClose(null, 'timeout')` 호출
3. **ESC 키 닫기** - document keydown 리스너로 감지, `onClose(event, 'escapeKeyDown')`
4. **ClickAway 닫기** - 외부 클릭 시 `onClose(event, 'clickaway')`
5. **anchorOrigin 위치 지정** - vertical(top/bottom) × horizontal(left/center/right)

---

## 핵심 학습 포인트

### 1. onClose의 reason 패턴

```javascript
// 닫히는 이유를 reason으로 구분
onClose?.(event, 'escapeKeyDown');   // ESC 키
onClose?.(event, 'clickaway');       // 외부 클릭
onClose(null, 'timeout');            // 타이머
```

**학습 가치**:
- 하나의 콜백(onClose)으로 다양한 닫기 이유를 처리하는 패턴
- 사용자가 reason에 따라 다른 로직을 실행할 수 있음 (예: 'clickaway'는 무시하고 'timeout'만 처리)
- 이 패턴은 Dialog, Menu 등 MUI 전반에서 동일하게 사용됨

### 2. useEffect를 이용한 이벤트 리스너 + 타이머 관리

```javascript
// ESC 키 - open이 변할 때마다 리스너를 등록/해제
React.useEffect(() => {
  if (!open) return undefined;

  function handleKeyDown(nativeEvent) {
    if (!nativeEvent.defaultPrevented && nativeEvent.key === 'Escape') {
      onClose?.(nativeEvent, 'escapeKeyDown');
    }
  }

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [open, onClose]);

// autoHideDuration 타이머 - open이나 duration이 바뀌면 타이머 재설정
React.useEffect(() => {
  if (!open || autoHideDuration == null || !onClose) return undefined;

  const timer = setTimeout(() => {
    onClose(null, 'timeout');
  }, autoHideDuration);

  return () => clearTimeout(timer);
}, [open, autoHideDuration, onClose]);
```

**학습 가치**:
- useEffect의 cleanup 함수(`return () => ...`)로 메모리 누수 방지
- `open`을 dependency에 포함하여 닫혔을 때 리스너/타이머 자동 정리
- 타이머는 `open`이나 `autoHideDuration`이 변경될 때마다 재설정됨 (이전 타이머 cancel → 새 타이머 시작)

### 3. anchorOrigin 위치 계산 함수

```javascript
function getPositionStyle(vertical, horizontal) {
  const style = {
    position: 'fixed',
    zIndex: 1400,
    display: 'flex',
    left: 8,
    right: 8,
    justifyContent: 'center',
    alignItems: 'center',
  };

  if (vertical === 'top') {
    style.top = 8;
  } else {
    style.bottom = 8;
  }

  if (horizontal === 'left') {
    style.justifyContent = 'flex-start';
    style.left = 24;
    style.right = 'auto';
  } else if (horizontal === 'right') {
    style.justifyContent = 'flex-end';
    style.right = 24;
    style.left = 'auto';
  } else if (horizontal === 'center') {
    style.left = '50%';
    style.right = 'auto';
    style.transform = 'translateX(-50%)';
  }

  return style;
}
```

**학습 가치**:
- `position: 'fixed'`로 viewport 기준 위치 지정
- `left: 8; right: 8`으로 전체 너비 사용 (모바일), `left: 24; right: 'auto'`로 고정 너비 (데스크톱)
- center 정렬은 `left: '50%' + translateX(-50%)` 트릭 사용
- flexbox의 `justifyContent`로 수평 정렬 제어

---

## 내부 구조

### 1. 렌더링 구조

```javascript
// 위치: packages/mui-material/src/Snackbar/Snackbar.js (90줄, 원본 570줄)

Snackbar
  └─> null (open=false)  또는
  └─> ClickAwayListener  ← 외부 클릭 감지
       └─> div[role="presentation"]  ← 위치 지정 (position: fixed)
            └─> children 또는 SnackbarContent  ← 실제 콘텐츠
```

### 2. 핵심 상태 (ref, state, 변수)

이 컴포넌트에는 별도의 state가 없습니다. `open` prop이 직접 표시/숨김을 제어합니다.

| 이름 | 타입 | 용도 |
|------|------|------|
| `open` | prop | 렌더링 여부 제어 |
| `autoHideDuration` | prop | 자동 닫기 타이머(ms) |
| `anchorOrigin` | prop | 화면 위치 (vertical + horizontal) |

### 3. 함수 역할

#### getPositionStyle(vertical, horizontal)

- **역할**: anchorOrigin을 CSS inline style 객체로 변환
- **호출 시점**: 렌더링 시 매번 계산
- **핵심 로직**: vertical → top/bottom, horizontal → left/right/center 스타일

#### handleClickAway(event)

- **역할**: 외부 클릭 시 `onClose(event, 'clickaway')` 호출
- **호출 시점**: ClickAwayListener가 외부 클릭 감지 시

### 4. 동작 흐름

#### 열기 플로우

```
부모 컴포넌트가 open=true로 변경
        ↓
Snackbar 렌더링 (null → JSX)
        ↓
useEffect 실행
  ├─> ESC keydown 리스너 등록
  └─> autoHideDuration 타이머 시작 (설정된 경우)
```

#### 닫기 플로우

```
닫기 트리거 발생
  ├─> ESC 키 → onClose(event, 'escapeKeyDown')
  ├─> 외부 클릭 → onClose(event, 'clickaway')
  └─> 타이머 만료 → onClose(null, 'timeout')
        ↓
부모가 open=false로 변경
        ↓
Snackbar → null 반환 (DOM에서 제거)
        ↓
useEffect cleanup 실행
  ├─> ESC 리스너 제거
  └─> 타이머 취소
```

#### 시나리오 예시

**시나리오 1: autoHideDuration으로 자동 닫기**
```
open=true → Snackbar 렌더링
→ setTimeout(3000ms) 시작
→ 3초 후 onClose(null, 'timeout') 호출
→ 부모: setOpen(false)
→ open=false → null 반환
→ setTimeout cleanup
```

**시나리오 2: ESC 키로 닫기**
```
open=true → keydown 리스너 등록
→ 사용자 ESC 키 입력
→ handleKeyDown: key === 'Escape'
→ onClose(event, 'escapeKeyDown')
→ 부모: setOpen(false)
```

**시나리오 3: 외부 클릭으로 닫기**
```
open=true → ClickAwayListener 활성
→ 사용자가 Snackbar 밖 클릭
→ handleClickAway(event)
→ onClose(event, 'clickaway')
→ 부모: setOpen(false)
```

### 5. 주요 변경 사항 (원본 대비)

**원본과의 차이**:
- ❌ `useSlot` (4개) 제거 → 직접 컴포넌트 사용
- ❌ `Grow` 트랜지션 제거 → `open ? 렌더링 : null` 즉시 표시
- ❌ `exited` state 제거 → 트랜지션 없어서 불필요
- ❌ `TransitionComponent`, `TransitionProps`, `transitionDuration` props 제거
- ❌ `ClickAwayListenerProps`, `ContentProps` deprecated props 제거
- ❌ `disableWindowBlurListener`, `resumeHideDuration` props 제거 (pause/resume 제거)
- ❌ `useSnackbar` 훅 제거 → 인라인 useEffect로 통합
- ❌ `useDefaultProps`, `useUtilityClasses`, `composeClasses` 제거
- ❌ `styled` 컴포넌트 → `getPositionStyle` 함수 + inline style
- ✅ `anchorOrigin` 유지 → 화면 위치 지정 핵심 기능
- ✅ `autoHideDuration` 유지 → 자동 닫기 핵심 기능
- ✅ ESC 키 닫기 유지 → 접근성 필수
- ✅ ClickAway 닫기 유지 → UX 핵심
- ✅ `role="presentation"` 유지 → ClickAwayListener와의 onClick 충돌 방지

### 6. Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `open` | boolean | - | 표시 여부 |
| `onClose` | func | - | 닫기 콜백 (event, reason) |
| `autoHideDuration` | number | `null` | 자동 닫기 시간(ms), null이면 비활성 |
| `message` | ReactNode | - | SnackbarContent에 전달할 메시지 |
| `action` | ReactNode | - | SnackbarContent에 전달할 액션 |
| `anchorOrigin` | object | `{vertical:'bottom', horizontal:'left'}` | 화면 위치 |
| `children` | ReactElement | - | SnackbarContent 대신 커스텀 콘텐츠 |

**제거된 Props**:
- ❌ `slots` / `slotProps` - 슬롯 커스터마이징
- ❌ `TransitionComponent` / `TransitionProps` / `transitionDuration` - 애니메이션
- ❌ `ClickAwayListenerProps` / `ContentProps` - deprecated
- ❌ `disableWindowBlurListener` - window blur 시 타이머 중단 옵션
- ❌ `resumeHideDuration` - hover 후 재개 대기 시간
- ❌ `onBlur` / `onFocus` / `onMouseEnter` / `onMouseLeave` - pause/resume 이벤트
- ❌ `classes` / `className` / `sx` - 스타일 관련

---

## 커밋 히스토리로 보는 단순화 과정

Snackbar는 **7개의 커밋**을 통해 단순화되었습니다.

### 1단계: Slot 시스템 제거

- `07391e2a` - [Snackbar 단순화 1/7] Slot 시스템 제거

**삭제된 코드**:
```javascript
import useSlot from '../utils/useSlot';

const [Root, rootProps] = useSlot('root', { ref, elementType: SnackbarRoot, ... });
const [ClickAwaySlot, clickAwayListenerProps] = useSlot('clickAwayListener', { ... });
const [ContentSlot, contentSlotProps] = useSlot('content', { elementType: SnackbarContent, ... });
const [TransitionSlot, transitionProps] = useSlot('transition', { elementType: Grow, ... });
```

**왜 불필요한가**:
- **학습 목적**: 슬롯 시스템은 커스터마이징 도구, 핵심 동작과 무관
- **복잡도**: useSlot 4회 호출, externalForwardedProps 병합 로직 제거로 대폭 단순화

### 2단계: Transition 제거

- `0a8f945d` - [Snackbar 단순화 2/7] Transition(Grow) 제거

**삭제된 코드**:
```javascript
const [exited, setExited] = React.useState(true);
const handleExited = (node) => { setExited(true); };
const handleEnter = (node, isAppearing) => { setExited(false); };
// if (!open && exited) return null;
<Grow in={open} timeout={transitionDuration} appear={true}>...</Grow>
```

**왜 불필요한가**:
- **학습 목적**: 핵심은 "언제 표시되는가"이지 "어떻게 등장하는가"가 아님
- **복잡도**: exited state + 두 핸들러 + Grow 컴포넌트 제거

### 3단계: deprecated props 제거

- `cde347c7` - [Snackbar 단순화 3/7] deprecated props 제거

**삭제된 코드**:
```javascript
TransitionComponent: TransitionComponentProp,
ClickAwayListenerProps: ClickAwayListenerPropsProp,
ContentProps: ContentPropsProp,
TransitionProps: TransitionPropsProp,
// 각각을 slots/slotProps와 병합하는 로직
```

**왜 불필요한가**:
- **학습 목적**: deprecated API는 학습에 불필요, 최신 패턴만 이해하면 충분

### 4단계: Pause/Resume 로직 제거

- `c4ff81eb` - [Snackbar 단순화 4/7] Pause/Resume 로직 제거

**삭제된 코드 (useSnackbar.ts)**:
```javascript
const handlePause = timerAutoHide.clear;
const handleResume = React.useCallback(() => {
  if (autoHideDuration != null) {
    setAutoHideTimer(resumeHideDuration ?? autoHideDuration * 0.5);
  }
}, [...]);
const createHandleBlur = (otherHandlers) => (event) => { handleResume(); };
const createHandleFocus = (otherHandlers) => (event) => { handlePause(); };
const createMouseEnter = (otherHandlers) => (event) => { handlePause(); };
const createMouseLeave = (otherHandlers) => (event) => { handleResume(); };
// window.addEventListener('focus', handleResume);
// window.addEventListener('blur', handlePause);
```

**왜 불필요한가**:
- **학습 목적**: autoHide 핵심 개념은 pause 없이도 이해 가능. pause/resume은 UX 개선 기능
- **복잡도**: 이벤트 핸들러 6개 + window 리스너 제거

### 5단계: useSnackbar 훅 인라인화

- `b5d86674` - [Snackbar 단순화 5/7] useSnackbar 훅 인라인화

**삭제된 코드**:
```javascript
import useSnackbar from './useSnackbar';
// useTimeout, useEventCallback, extractEventHandlers 유틸 의존성 모두 제거

const { getRootProps, onClickAway } = useSnackbar(ownerState);
```

**대체**:
```javascript
// 직접 useEffect로 ESC, 타이머 처리
// handleClickAway 함수 직접 정의
```

**왜 불필요한가**:
- **학습 목적**: 훅 분리는 재사용 목적, 한 곳에 인라인하면 읽기 쉬움
- **복잡도**: useTimeout, useEventCallback, extractEventHandlers 제거

### 6단계: Theme 시스템 제거

- `9c1c7844` - [Snackbar 단순화 6/7] Theme 시스템 제거

**삭제된 코드**:
```javascript
import { useDefaultProps } from '../DefaultPropsProvider';
import composeClasses from '@mui/utils/composeClasses';
import capitalize from '../utils/capitalize';
import { getSnackbarUtilityClass } from './snackbarClasses';
import PropTypes from 'prop-types';

const useUtilityClasses = (ownerState) => { ... };
const props = useDefaultProps({ props: inProps, name: 'MuiSnackbar' });
const classes = useUtilityClasses(ownerState);
Snackbar.propTypes = { ... };
```

**왜 불필요한가**:
- **학습 목적**: 테마 연동과 클래스 이름 생성은 컴포넌트 핵심 동작과 무관
- **복잡도**: 여러 import + useDefaultProps + 클래스 생성 로직 제거

### 7단계: styled → inline styles

- `f6367e69` - [Snackbar 단순화 7/7] styled 컴포넌트 → inline styles

**삭제된 코드**:
```javascript
import { styled } from '../zero-styled';
import memoTheme from '../utils/memoTheme';

const SnackbarRoot = styled('div')(
  memoTheme(({ theme }) => ({
    zIndex: (theme.vars || theme).zIndex.snackbar,
    variants: [
      { props: ..., style: { top: 8, [theme.breakpoints.up('sm')]: { top: 24 } } },
      // 5개 variant
    ],
  }))
);
```

**대체**:
```javascript
function getPositionStyle(vertical, horizontal) { /* 조건문으로 계산 */ }
// zIndex: 1400 하드코딩
```

**왜 불필요한가**:
- **학습 목적**: CSS-in-JS 학습 목적 아님. getPositionStyle 함수로 더 명확하게 표현
- **복잡도**: memoTheme + styled API + variants 배열 제거

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 570줄 (Snackbar+useSnackbar) | 90줄 (84% 감소) |
| **Props 개수** | 15개 이상 | 7개 |
| **Slot 시스템** | ✅ (4개) | ❌ |
| **Grow 트랜지션** | ✅ | ❌ 즉시 표시/숨김 |
| **autoHideDuration** | ✅ | ✅ |
| **ESC 키 닫기** | ✅ | ✅ |
| **ClickAway 닫기** | ✅ | ✅ |
| **Pause/Resume** | ✅ hover/focus/window blur | ❌ |
| **anchorOrigin** | ✅ 반응형 breakpoint | ✅ 고정 px |
| **useSnackbar 훅** | ✅ 분리 | ❌ 인라인 |

---

## 학습 후 다음 단계

Snackbar를 이해했다면:

1. **Alert** - severity(error/warning/info/success)를 지원하는 알림 컴포넌트. Snackbar 안에 넣어 사용
2. **Dialog** - 비슷한 open/onClose 패턴, FocusTrap + Portal 학습
3. **ClickAwayListener** - Snackbar에서 사용한 외부 클릭 감지 컴포넌트 학습

**예시: 기본 사용**
```javascript
function App() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>알림 열기</button>
      <Snackbar
        open={open}
        onClose={(event, reason) => setOpen(false)}
        autoHideDuration={3000}
        message="저장되었습니다"
      />
    </>
  );
}
```

**예시: reason에 따라 다르게 처리**
```javascript
<Snackbar
  open={open}
  onClose={(event, reason) => {
    if (reason === 'clickaway') return; // 외부 클릭은 무시
    setOpen(false); // timeout, escapeKeyDown만 닫기
  }}
  autoHideDuration={5000}
  message="중요한 알림입니다"
/>
```

**예시: anchorOrigin으로 위치 지정**
```javascript
<Snackbar
  open={open}
  onClose={() => setOpen(false)}
  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
  message="상단 가운데에 표시"
/>
```
