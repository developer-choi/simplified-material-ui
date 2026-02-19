# SnackbarContent 컴포넌트

> SnackbarContent 컴포넌트 원본 구조 빠른 파악

**⚠️ 이 문서의 목적**: 간소화 작업 **전에** 원본 코드를 빠르게 이해하기 위한 요약 문서입니다.

---

## 무슨 기능을 하는가?

SnackbarContent는 **Snackbar 안에 들어가는 콘텐츠 UI를 담당하는** 컴포넌트입니다. message와 action을 가로로 배치하고, `role="alert"`로 스크린 리더에 알림을 전달합니다.

### 핵심 기능
1. **message 표시** - 텍스트 메시지를 왼쪽에 표시
2. **action 표시** - 버튼 등 액션을 오른쪽에 표시 (선택)
3. **ARIA 접근성** - `role="alert"`로 스크린 리더에 즉시 알림

---

## 주요 코드 구조

### 파일 위치 및 크기

```
packages/mui-material/src/SnackbarContent/SnackbarContent.js (134줄)
```

### 렌더링 구조

```
SnackbarContent (SnackbarContentRoot = styled(Paper))
  └─> SnackbarContentMessage (styled div)
  └─> SnackbarContentAction (styled div, action 있을 때만)
```

### 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `message` | node | - | 표시할 메시지 |
| `action` | node | - | 오른쪽에 표시할 액션 (버튼 등) |
| `role` | string | `'alert'` | ARIA role |
| `classes` | object | - | 클래스 이름 오버라이드 |
| `className` | string | - | 루트 엘리먼트 className |
| `sx` | object | - | CSS-in-JS 스타일 |

### 핵심 로직 발췌

```javascript
const SnackbarContent = React.forwardRef(function SnackbarContent(inProps, ref) {
  const props = useDefaultProps({ props: inProps, name: 'MuiSnackbarContent' });
  const { action, className, message, role = 'alert', ...other } = props;
  const classes = useUtilityClasses(ownerState);

  return (
    <SnackbarContentRoot role={role} elevation={6} ref={ref} {...other}>
      <SnackbarContentMessage>{message}</SnackbarContentMessage>
      {action && <SnackbarContentAction>{action}</SnackbarContentAction>}
    </SnackbarContentRoot>
  );
});
```

---

## 복잡도의 이유

SnackbarContent는 **134줄**이며, 복잡한 이유는:

1. **styled 컴포넌트 3개** - Root(Paper 기반), Message, Action 각각 styled()로 정의, memoTheme + emphasize 색상 계산
2. **Theme 시스템** - useDefaultProps, useUtilityClasses, composeClasses, ownerState 패턴
3. **theme.vars 분기** - CSS 변수 모드와 일반 모드 두 가지 색상 계산

---

## 간소화 방향

이 컴포넌트를 간소화할 때 제거 고려 대상:

- **forwardRef + PropTypes** - ref 전달 및 런타임 타입 검증 제거
- **Theme 시스템** - useDefaultProps → 파라미터 기본값, useUtilityClasses/composeClasses 제거
- **styled 컴포넌트** - 3개의 styled div → 인라인 스타일로 대체, Paper → div
- **memoTheme + emphasize** - 하드코딩된 색상값(#323232, #fff)으로 대체

> 상세한 간소화 결과는 `SnackbarContent-simplified.md` 참고
