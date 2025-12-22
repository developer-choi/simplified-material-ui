# Badge 컴포넌트

> 자식 요소의 우측 상단에 배지(숫자)를 표시하는 간단한 래퍼 컴포넌트

---

## 무슨 기능을 하는가?

단순화된 Badge는 **자식 요소의 우측 상단에 작은 배지(숫자나 텍스트)를 표시**하는 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **배지 표시** - badgeContent로 숫자나 텍스트를 우측 상단에 표시
2. **상대 위치 지정** - position: relative로 자식 요소 기준 배치
3. **간단한 스타일링** - 인라인 스타일로 primary 색상 배지 표시

> **💡 작성 주의**: Badge 자체는 자식 요소를 래핑하여 배지를 추가하는 간단한 컨테이너입니다. 자식 요소(아이콘, 아바타 등)는 사용자가 제공합니다.

---

## 핵심 학습 포인트

### 1. position: relative + absolute 패턴

```javascript
const Badge = React.forwardRef(function Badge(props, ref) {
  const { className, children, badgeContent, ...other } = props;

  const rootStyle = {
    position: 'relative',  // 자식의 기준점
    display: 'inline-flex',
    verticalAlign: 'middle',
    flexShrink: 0,
  };

  const badgeStyle = {
    position: 'absolute',  // rootStyle 기준으로 배치
    top: 0,
    right: 0,
    transform: 'scale(1) translate(50%, -50%)',  // 우측 상단으로
    // ... 기타 스타일
  };

  return (
    <span ref={ref} style={rootStyle} {...other}>
      {children}
      <span style={badgeStyle}>{badgeContent}</span>
    </span>
  );
});
```

**학습 가치**:
- `position: relative`로 기준점을 만들고 `position: absolute`로 정확한 위치 지정
- `transform: translate(50%, -50%)`로 배지를 우측 상단 모서리에 정확히 배치
- `forwardRef`로 ref를 루트 요소에 전달하여 외부에서 제어 가능

### 2. transform을 이용한 정밀 배치

```javascript
const badgeStyle = {
  top: 0,
  right: 0,
  transform: 'scale(1) translate(50%, -50%)',
  transformOrigin: '100% 0%',
};
```

**학습 가치**:
- `top: 0, right: 0`으로 우측 상단 모서리에 배치
- `translate(50%, -50%)`로 배지의 중심이 모서리에 오도록 이동
  - X축으로 자신의 50% 이동 (우측으로)
  - Y축으로 자신의 -50% 이동 (위로)
- `transformOrigin: 100% 0%`로 변환 기준점을 우측 상단으로 설정

### 3. 간단한 Props 구조 분해

```javascript
const {
  className,
  children,
  badgeContent,
  ...other
} = props;
```

**학습 가치**:
- 필요한 props만 추출하고 나머지는 `...other`로 spread
- `badgeContent`를 직접 사용하여 로직 단순화
- 복잡한 훅이나 유틸리티 함수 없이 순수 JavaScript만 사용

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/mui-material/src/Badge/Badge.js (60줄, 원본 485줄)
Badge (forwardRef)
  └─> span (rootStyle - position: relative)
       ├─> children (사용자 제공 요소: 아이콘, 아바타 등)
       └─> span (badgeStyle - position: absolute)
            └─> badgeContent (배지 내용: 숫자, 텍스트)
```

### 2. 간소화된 스타일링

**원본**: styled component + memoTheme + variants + theme.palette + transitions
**수정본**: 인라인 style 객체

```javascript
const rootStyle = {
  position: 'relative',
  display: 'inline-flex',
  verticalAlign: 'middle',
  flexShrink: 0,
};

const badgeStyle = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'center',
  alignContent: 'center',
  alignItems: 'center',
  position: 'absolute',
  boxSizing: 'border-box',
  fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
  fontWeight: 500,
  fontSize: '0.75rem',
  minWidth: '20px',
  lineHeight: 1,
  padding: '0 6px',
  height: '20px',
  borderRadius: '10px',
  zIndex: 1,
  backgroundColor: '#1976d2',  // primary 색상
  color: '#fff',
  top: 0,
  right: 0,
  transform: 'scale(1) translate(50%, -50%)',
  transformOrigin: '100% 0%',
};
```

> **💡 원본과의 차이**:
> - ❌ `styled()` 시스템 제거 → 인라인 스타일로 대체
> - ❌ `memoTheme()` 제거 → 하드코딩된 값 사용
> - ❌ `theme.palette.primary.main` 제거 → #1976d2 직접 사용
> - ❌ `theme.transitions` 제거 → 애니메이션 없음
> - ❌ variants 배열 제거 (8개 위치, 7개 색상, dot 등)

### 3. 제거된 기능들

**anchorOrigin 제거 (8가지 → 1가지)**:
- ❌ top/bottom × left/right × rectangular/circular = 8개 variants
- ✅ top-right-rectangular만 고정

**overlap 제거**:
- ❌ circular (14% offset) vs rectangular (0% offset)
- ✅ rectangular만 고정

**variant 제거**:
- ❌ standard (숫자) vs dot (점)
- ✅ standard만 고정

**color 제거 (7가지 → 1가지)**:
- ❌ default, primary, secondary, error, info, success, warning
- ✅ primary (#1976d2)만 고정

**max prop 제거**:
- ❌ useBadge 훅의 max 처리 로직 (99+ 표시)
- ✅ badgeContent를 그대로 표시

**showZero, invisible props 제거**:
- ❌ useBadge의 invisible 계산 로직
- ❌ usePreviousProps로 이전 값 추적
- ❌ transform scale(0) 애니메이션
- ✅ 항상 배지 표시

**useBadge 훅 제거**:
- ❌ 별도 파일 useBadge.ts
- ❌ max, showZero, invisible 처리 로직
- ✅ `const badgeContent = badgeContentProp;` 한 줄로 단순화

**Theme 시스템 제거**:
- ❌ `useDefaultProps` 제거
- ❌ `useUtilityClasses` 제거
- ❌ `composeClasses` 제거
- ❌ `capitalize` 유틸리티 제거

**Slot 시스템 제거**:
- ❌ `useSlot()` 훅 2번 호출 (root, badge)
- ❌ slots, slotProps, components, componentsProps 제거
- ✅ 일반 span 태그 직접 사용

### 4. Props (3개만 남음)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | node | - | 배지를 붙일 대상 요소 |
| `badgeContent` | node | - | 배지에 표시할 내용 (숫자, 텍스트) |
| `className` | string | - | 추가 CSS 클래스 |

---

## 커밋 히스토리로 보는 단순화 과정

Badge는 **13개의 커밋**을 통해 단순화되었습니다.

### 1단계: 커스터마이징 시스템 제거 (Commit 1-2)
- `d8c34a9d` - Slot 시스템 제거
  - **이유**: 커스터마이징 배우는 게 아니라 Badge의 핵심 개념(배지 표시)을 배우는 것. useSlot() 훅, externalForwardedProps 병합 로직 등 복잡도 제거.
- `132c29ed` - component prop 제거
  - **이유**: Badge의 핵심은 "배지 표시"이지 "루트 태그 변경"이 아님. span으로 고정해도 충분히 동작.

### 2단계: Props 단순화 (Commit 3-6)
- `6d72b58c` - anchorOrigin을 top-right 고정
  - **이유**: 8가지 위치(top/bottom × left/right × rectangular/circular)는 학습에 과함. 하나의 위치(top-right)만 있어도 개념 이해 충분.
- `53d151cd` - overlap을 rectangular 고정
  - **이유**: circular와 rectangular의 차이(14% vs 0%)는 세부 스타일링. rectangular 하나로도 Badge 개념 이해 충분.
- `602299e8` - variant를 standard 고정 (dot 삭제)
  - **이유**: Badge의 핵심은 "숫자 표시". dot(점)은 추가 기능으로 학습에 불필요.
- `dbf08ab8` - color를 primary 고정
  - **이유**: 7가지 색상은 학습에 과함. 하나의 색상(primary)만 있어도 충분.

### 3단계: 조건부 로직 제거 (Commit 7-9)
- `16fe2e21` - max prop 제거
  - **이유**: Badge의 핵심은 "숫자 표시". max 처리(99+)는 부가 기능. 실제 숫자 그대로 표시해도 충분.
- `fda23d50` - showZero, invisible props 제거
  - **이유**: Badge의 핵심은 "배지 표시". 조건부 숨김은 부가 기능. 항상 표시하는 것이 더 단순.
- `39877e2e` - usePreviousProps 및 애니메이션 제거
  - **이유**: Badge의 핵심은 "배지 표시"이지 "애니메이션 전환"이 아님. 애니메이션 없이도 기능은 똑같음.

### 4단계: 훅 인라인화 (Commit 10)
- `b5c4daa4` - useBadge 훅 인라인화
  - **이유**: max, showZero, invisible 제거로 로직이 단순해져서 훅으로 분리할 필요 없음. 인라인이 더 이해하기 쉬움.

### 5단계: 시스템 제거 (Commit 11-13)
- `d57ab1d0` - Theme 시스템 제거
  - **이유**: useDefaultProps, useUtilityClasses, composeClasses 등 테마 시스템은 Material-UI 전체의 주제. 하드코딩된 값으로도 Badge 동작 이해 가능.
- `fcb95ea2` - Styled component 시스템 제거
  - **이유**: CSS-in-JS는 별도 학습 주제. 인라인 스타일로도 똑같이 동작하며 코드 가독성 향상.
- `17032bc6` - PropTypes 제거
  - **이유**: PropTypes는 타입 검증 도구이지 컴포넌트 로직이 아님. TypeScript로 타입 검증 가능.

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 485줄 | 60줄 (87.6% 감소) |
| **Props 개수** | 14개+ | 3개 |
| **anchorOrigin** | ✅ 8가지 위치 | ❌ top-right 고정 |
| **overlap** | ✅ rectangular/circular | ❌ rectangular 고정 |
| **variant** | ✅ standard/dot | ❌ standard 고정 |
| **color** | ✅ 7가지 색상 | ❌ primary (#1976d2) 고정 |
| **max** | ✅ 99+ 표시 | ❌ |
| **showZero** | ✅ 0일 때 숨김 옵션 | ❌ 항상 표시 |
| **invisible** | ✅ 조건부 숨김 | ❌ 항상 표시 |
| **애니메이션** | ✅ scale(1) ↔ scale(0) | ❌ |
| **useBadge 훅** | ✅ 별도 파일 | ❌ 인라인화 |
| **Theme 시스템** | ✅ useDefaultProps 등 | ❌ |
| **styled() 시스템** | ✅ CSS-in-JS | ❌ 인라인 스타일 |
| **PropTypes** | ✅ 120줄 | ❌ |

---

## 학습 후 다음 단계

Badge를 이해했다면:

1. **Avatar** - Badge와 함께 자주 사용되는 컴포넌트. 프로필 이미지에 알림 배지 추가 패턴 학습
2. **IconButton** - 아이콘 버튼에 Badge를 추가하여 알림 표시 패턴 학습
3. **position: absolute 심화** - 복잡한 레이아웃에서 정확한 위치 지정 방법 학습
4. **실전 응용** - 커스텀 배지 만들기 (다양한 위치, 모양, 애니메이션)

**예시: 기본 사용법**
```javascript
import Badge from './Badge';
import MailIcon from '@mui/icons-material/Mail';

function NotificationIcon() {
  return (
    <Badge badgeContent={4}>
      <MailIcon />
    </Badge>
  );
}
```

**예시: 아바타와 함께**
```javascript
import Badge from './Badge';
import Avatar from '@mui/material/Avatar';

function UserAvatar() {
  return (
    <Badge badgeContent="5">
      <Avatar src="/user.jpg" />
    </Badge>
  );
}
```

**예시: 커스터마이징**
```javascript
<Badge
  badgeContent="NEW"
  className="custom-badge"
>
  <MailIcon />
</Badge>

<style>
  .custom-badge span:last-child {
    background-color: #ff5722;  /* deep orange */
    font-size: 0.6rem;
    padding: 0 4px;
  }
</style>
```

**예시: 여러 자식 요소와 함께**
```javascript
<Badge badgeContent={99}>
  <div style={{
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px'
  }}>
    알림함
  </div>
</Badge>
```
