# SnackbarContent 컴포넌트

> message + action을 가로로 배치하는 Snackbar 콘텐츠 UI

---

## 이 문서의 목적

**이 문서는 단순화된 코드의 "상세 학습 가이드"입니다.**

라이브러리 코드는 복잡합니다. 단순화했더라도 코드만 보고는 이해하기 어려울 수 있습니다.
이 문서는 코드의 **동작 원리, 핵심 패턴, 왜 이렇게 구현했는지**를 상세히 설명하여 학습을 돕습니다.

> **원본 구조 파악**: 원본 코드의 빠른 이해는 `SnackbarContent-original.md` 참고

---

## 무슨 기능을 하는가?

수정된 SnackbarContent는 **Snackbar 안에 들어가는 메시지와 액션 버튼을 가로로 배치하는** 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **message 표시** - 왼쪽에 텍스트 메시지 렌더링
2. **action 표시** - action이 있을 때만 오른쪽에 렌더링
3. **ARIA 접근성** - `role="alert"`로 스크린 리더에 즉시 알림 전달

---

## 핵심 학습 포인트

### 1. `role="alert"` - 스크린 리더 즉시 알림

```javascript
<div role="alert" ...>
  {message}
</div>
```

**학습 가치**:
- `role="alert"`는 WAI-ARIA live region의 일종으로, 콘텐츠가 DOM에 추가되는 순간 스크린 리더가 즉시 읽어줌
- 일반 `role="status"`와 달리 `aria-live="assertive"` 동작 → 현재 읽고 있는 내용을 중단하고 알림을 우선 읽음
- Snackbar처럼 "지금 당장 사용자가 알아야 할 정보"에 적합한 패턴

### 2. message/action 분리 구조

```javascript
function SnackbarContent({ action, message, role = 'alert', ...other }) {
  return (
    <div role={role} style={{ display: 'flex', alignItems: 'center', ... }}>
      <div style={{ padding: '8px 0' }}>
        {message}
      </div>
      {action ? (
        <div style={{ marginLeft: 'auto', ... }}>
          {action}
        </div>
      ) : null}
    </div>
  );
}
```

**학습 가치**:
- `marginLeft: 'auto'`로 action을 오른쪽 끝으로 밀어내는 flexbox 패턴
- message와 action을 별도 div로 분리하여 각자 독립적으로 스타일링 가능
- action이 없을 때(`null`)는 렌더링하지 않는 조건부 렌더링

---

## 내부 구조

### 1. 렌더링 구조

```javascript
// 위치: packages/mui-material/src/SnackbarContent/SnackbarContent.js (36줄, 원본 134줄)

SnackbarContent
  └─> div[role="alert"]  ← 컨테이너, flex 레이아웃
       ├─> div            ← message 영역 (왼쪽)
       └─> div            ← action 영역 (오른쪽, action 있을 때만)
```

### 2. 핵심 상태 (ref, state, 변수)

이 컴포넌트는 state나 ref가 없는 **순수 UI 컴포넌트**입니다. 렌더링만 담당합니다.

### 3. 함수 역할

별도 함수 없음. 렌더링 로직만 존재합니다.

### 4. 동작 흐름

```
부모(Snackbar)가 SnackbarContent 렌더링
        ↓
message prop 전달 → 왼쪽 div에 렌더링
        ↓
action prop 전달? → YES → 오른쪽 div에 렌더링
                 → NO  → action div 생략
```

### 5. 주요 변경 사항 (원본 대비)

```javascript
// 원본
const SnackbarContentRoot = styled(Paper, { name: 'MuiSnackbarContent', slot: 'Root' })(
  memoTheme(({ theme }) => ({
    color: theme.vars ? theme.vars.palette.SnackbarContent.color
      : theme.palette.getContrastText(emphasize(theme.palette.background.default, emphasis)),
    backgroundColor: theme.vars ? theme.vars.palette.SnackbarContent.bg
      : emphasize(theme.palette.background.default, emphasis),
    ...
  }))
);

// 단순화 후
<div style={{ backgroundColor: '#323232', color: '#fff', ... }}>
```

**원본과의 차이**:
- ❌ `forwardRef` 제거 → 일반 함수 컴포넌트
- ❌ `PropTypes` 제거 → 런타임 타입 검증 없음
- ❌ `useDefaultProps` 제거 → 파라미터 기본값으로 대체
- ❌ `useUtilityClasses` / `composeClasses` 제거 → className 없음
- ❌ `styled(Paper)` 제거 → `<div>` + inline style
- ❌ `memoTheme` / `emphasize` 색상 계산 제거 → `#323232`, `#fff` 하드코딩
- ❌ `className` prop 제거
- ✅ `role="alert"` 유지 → 스크린 리더 접근성 필수
- ✅ `message`, `action` 구조 유지 → 핵심 UI 패턴

### 6. Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `message` | ReactNode | - | 표시할 메시지 |
| `action` | ReactNode | - | 오른쪽에 표시할 액션 (버튼 등) |
| `role` | string | `'alert'` | ARIA role |

**제거된 Props**:
- ❌ `classes` - 클래스 이름 오버라이드 (Theme 시스템과 함께 제거)
- ❌ `className` - 루트 className (간소화로 불필요)
- ❌ `sx` - CSS-in-JS 스타일 prop
- ❌ `ref` - forwardRef 제거와 함께

---

## 커밋 히스토리로 보는 단순화 과정

SnackbarContent는 **3개의 커밋**을 통해 단순화되었습니다.

### 1단계: 메타데이터 제거 + forwardRef 제거

- `2c09fafc` - [SnackbarContent 단순화 1/3] PropTypes 제거 + forwardRef 제거

**삭제된 코드**:
```javascript
import PropTypes from 'prop-types';
const SnackbarContent = React.forwardRef(function SnackbarContent(inProps, ref) {
  // ...
  return <SnackbarContentRoot ref={ref} ... />;
});
SnackbarContent.propTypes = { action: PropTypes.node, ... };
```

**왜 불필요한가**:
- **학습 목적**: PropTypes는 TypeScript가 대체, ref 전달은 고급 패턴으로 핵심 개념과 무관
- **복잡도**: 40줄 감소

### 2단계: Theme 시스템 제거

- `f0b11f22` - [SnackbarContent 단순화 2/3] Theme 시스템 제거

**삭제된 코드**:
```javascript
import composeClasses from '@mui/utils/composeClasses';
import { useDefaultProps } from '../DefaultPropsProvider';
import { getSnackbarContentUtilityClass } from './snackbarContentClasses';

const useUtilityClasses = (ownerState) => {
  const slots = { root: ['root'], action: ['action'], message: ['message'] };
  return composeClasses(slots, getSnackbarContentUtilityClass, classes);
};

const props = useDefaultProps({ props: inProps, name: 'MuiSnackbarContent' });
const ownerState = props;
const classes = useUtilityClasses(ownerState);
```

**왜 불필요한가**:
- **학습 목적**: 테마 연동은 라이브러리 전체 주제, 개별 컴포넌트 학습에 불필요
- **복잡도**: Context 구독, 클래스 이름 조합 로직 제거

### 3단계: styled → inline styles

- `73fc6411` - [SnackbarContent 단순화 3/3] styled 컴포넌트 → inline styles

**삭제된 코드**:
```javascript
import { emphasize } from '@mui/system/colorManipulator';
import memoTheme from '../utils/memoTheme';
import Paper from '../../../surfaces/Paper';

const SnackbarContentRoot = styled(Paper, { name: 'MuiSnackbarContent', slot: 'Root' })(
  memoTheme(({ theme }) => {
    const emphasis = theme.palette.mode === 'light' ? 0.8 : 0.98;
    return {
      color: theme.vars ? ... : theme.palette.getContrastText(emphasize(..., emphasis)),
      backgroundColor: theme.vars ? ... : emphasize(..., emphasis),
      [theme.breakpoints.up('sm')]: { flexGrow: 'initial', minWidth: 288 },
    };
  })
);
```

**왜 불필요한가**:
- **학습 목적**: CSS-in-JS 학습 아님, 인라인 스타일로 동일하게 동작
- **복잡도**: memoTheme + emphasize 색상 계산 + theme.vars 분기 → `#323232`, `#fff` 하드코딩으로 대체

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 134줄 | 36줄 (73% 감소) |
| **Props 개수** | 6개 | 3개 |
| **forwardRef** | ✅ | ❌ |
| **PropTypes** | ✅ | ❌ |
| **Theme 시스템** | ✅ | ❌ |
| **styled 컴포넌트** | ✅ (3개) | ❌ inline style |
| **role="alert"** | ✅ | ✅ |
| **message/action 구조** | ✅ | ✅ |

---

## 학습 후 다음 단계

SnackbarContent를 이해했다면:

1. **Snackbar** - SnackbarContent를 실제로 사용하는 부모 컴포넌트. autoHideDuration, ESC 키, ClickAway 등 동작 로직 학습
2. **Alert** - 비슷한 역할이지만 severity(error/warning/info/success)를 지원하는 컴포넌트

**예시: 기본 사용**
```javascript
<SnackbarContent
  message="파일이 저장되었습니다"
  action={<button onClick={handleClose}>닫기</button>}
/>
```

**예시: message만 (action 없이)**
```javascript
<SnackbarContent message="네트워크 연결이 끊겼습니다" />
// → action div는 렌더링되지 않음
```
