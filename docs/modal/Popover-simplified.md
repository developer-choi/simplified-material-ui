# Popover 컴포넌트

> anchorEl 기반 위치 지정으로 요소 옆에 떠있는 콘텐츠를 표시하는 컴포넌트

---

## 무슨 기능을 하는가?

수정된 Popover는 **특정 앵커 요소를 기준으로 동적 위치 계산하여 콘텐츠를 표시하는** 컴포넌트입니다.

### 핵심 기능

1. **앵커 기반 위치 지정** - `anchorEl` prop으로 지정한 요소의 위치를 기준으로 Popover 표시
2. **동적 위치 계산** - `anchorOrigin`과 `transformOrigin`을 조합하여 4가지 모서리 위치 지원
3. **화면 경계 처리** - `marginThreshold`로 화면 밖으로 나가지 않도록 자동 조정
4. **반응형 위치 업데이트** - 윈도우 리사이즈 시 자동으로 위치 재계산

> **💡 작성 주의**: Modal이 제공하는 백드롭, 포커스 트랩, 포탈 렌더링은 Modal의 기능이므로 여기서 제외합니다.

---

## 핵심 학습 포인트

### 1. 위치 계산 시스템

```javascript
// getAnchorOffset: 앵커 요소의 기준점 좌표
const getAnchorOffset = () => {
  const anchorRect = anchorElement.getBoundingClientRect();
  return {
    top: anchorRect.top + getOffsetTop(anchorRect, anchorOrigin.vertical),
    left: anchorRect.left + getOffsetLeft(anchorRect, anchorOrigin.horizontal),
  };
};

// getTransformOrigin: Popover 자체의 기준점
const getTransformOrigin = (elemRect) => {
  return {
    vertical: getOffsetTop(elemRect, transformOrigin.vertical),
    horizontal: getOffsetLeft(elemRect, transformOrigin.horizontal),
  };
};

// 최종 위치 = 앵커 기준점 - Popover 기준점
let top = anchorOffset.top - elemTransformOrigin.vertical;
let left = anchorOffset.left - elemTransformOrigin.horizontal;
```

**학습 가치**:
- 두 요소 간 상대적 위치 계산 방법
- `getBoundingClientRect()`를 활용한 좌표 시스템 이해
- CSS `transform-origin`과 자바스크립트 위치 계산의 관계

### 2. 화면 경계 처리 (marginThreshold)

```javascript
// 화면 위쪽/왼쪽으로 벗어나는 경우
if (marginThreshold !== null && top < marginThreshold) {
  const diff = top - marginThreshold;
  top -= diff;  // 위치 조정
  elemTransformOrigin.vertical += diff;  // transform-origin도 같이 조정
}

// 화면 아래쪽/오른쪽으로 벗어나는 경우
else if (marginThreshold !== null && bottom > heightThreshold) {
  const diff = bottom - heightThreshold;
  top -= diff;
  elemTransformOrigin.vertical += diff;
}
```

**학습 가치**:
- 뷰포트 제약 조건 내에서 UI 배치하는 실전 패턴
- `transform-origin` 동적 조정으로 자연스러운 배치 유지
- 엣지 케이스 처리 방법

### 3. useCallback을 활용한 성능 최적화

```javascript
const getPositioningStyle = React.useCallback(
  (element) => {
    // ... 위치 계산 로직
  },
  [anchorEl, getAnchorOffset, getTransformOrigin, marginThreshold],
);

const setPositioningStyles = React.useCallback(() => {
  const positioning = getPositioningStyle(element);
  element.style.top = positioning.top;
  element.style.left = positioning.left;
  element.style.transformOrigin = positioning.transformOrigin;
}, [getPositioningStyle]);
```

**학습 가치**:
- 복잡한 계산 함수를 메모이제이션하여 불필요한 재계산 방지
- useEffect 의존성 배열과의 관계 이해
- DOM 직접 조작 시 성능 고려 사항

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/mui-material/src/Popover/Popover.js (252줄, 원본 699줄)
Modal (hideBackdrop={true})
  └─> PaperBase (elevation={8})
       └─> {children}
```

### 2. 위치 지정 로직

#### anchorOrigin + transformOrigin 조합

원본은 9가지 조합(top/center/bottom × left/center/right)을 지원했지만, 단순화 버전은 **4가지 모서리 조합**만 지원합니다:

```javascript
// getOffsetTop: vertical이 'top' 또는 'bottom'만 처리
export function getOffsetTop(rect, vertical) {
  if (vertical === 'bottom') {
    return rect.height;
  }
  return 0;  // 'top'
}

// getOffsetLeft: horizontal이 'left' 또는 'right'만 처리
export function getOffsetLeft(rect, horizontal) {
  if (horizontal === 'right') {
    return rect.width;
  }
  return 0;  // 'left'
}
```

**지원하는 4가지 조합**:
1. `anchorOrigin={{ vertical: 'top', horizontal: 'left' }}`
2. `anchorOrigin={{ vertical: 'top', horizontal: 'right' }}`
3. `anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}`
4. `anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}`

> **원본과의 차이**:
> - ❌ `center` 옵션 제거 (9가지 → 4가지)
> - ❌ 숫자값(px) 지원 제거
> - ❌ `anchorPosition` 절대 좌표 모드 제거
> - ❌ `anchorReference='none'` 모드 제거

#### 위치 스타일 적용

```javascript
// useEffect로 open 될 때마다 위치 재계산
React.useEffect(() => {
  if (open) {
    setPositioningStyles();
  }
});

// 윈도우 리사이즈 시에도 위치 재계산
React.useEffect(() => {
  if (!open) return undefined;

  const handleResize = debounce(() => {
    setPositioningStyles();
  });

  const containerWindow = ownerWindow(resolveAnchorEl(anchorEl));
  containerWindow.addEventListener('resize', handleResize);
  return () => {
    handleResize.clear();
    containerWindow.removeEventListener('resize', handleResize);
  };
}, [anchorEl, open, setPositioningStyles]);
```

### 3. 스타일 시스템

#### Styled Components → 인라인 스타일

```javascript
// ❌ 원본: styled() API로 정의
export const PopoverPaper = styled(PaperBase, {
  name: 'MuiPopover',
  slot: 'Paper',
})({
  position: 'absolute',
  overflowY: 'auto',
  // ...
});

// ✅ 수정본: 인라인 style 직접 전달
<PaperBase
  ref={paperRef}
  elevation={8}
  style={{
    position: 'absolute',
    overflowY: 'auto',
    overflowX: 'hidden',
    minWidth: 16,
    minHeight: 16,
    maxWidth: 'calc(100% - 32px)',
    maxHeight: 'calc(100% - 32px)',
    outline: 0,
  }}
>
```

### 4. Props (8개만 남음)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `anchorEl` | HTMLElement \| (() => HTMLElement) | - | **필수**. Popover를 표시할 기준 요소 |
| `open` | boolean | - | **필수**. Popover 표시 여부 |
| `children` | ReactNode | - | **필수**. Popover 내부 콘텐츠 |
| `onClose` | (event, reason) => void | - | 닫기 이벤트 핸들러 |
| `className` | string | - | Modal에 전달할 커스텀 클래스 |
| `marginThreshold` | number | `16` | 화면 경계로부터 최소 거리(px) |
| `anchorOrigin` | { vertical, horizontal } | `{ vertical: 'top', horizontal: 'left' }` | 앵커 기준점 (4가지 조합) |
| `transformOrigin` | { vertical, horizontal } | `{ vertical: 'top', horizontal: 'left' }` | Popover 기준점 (4가지 조합) |

---

## 커밋 히스토리로 보는 단순화 과정

Popover는 **12개의 커밋**을 통해 단순화되었습니다.

### 1단계: Slot 시스템 제거
- `c20bfb6f` - [Popover 단순화 1/12] Slot 시스템 제거
- Material-UI v5의 `slots`, `slotProps` 커스터마이징 시스템 제거
- `useSlot()` 훅 3번 호출, `mergeSlotProps()` 등의 복잡도 제거
- 학습 목적: Popover 핵심은 "위치 지정"이지 "커스터마이징"이 아님

### 2단계: Transition/Animation 제거
- `b1824c33` - [Popover 단순화 2/12] Transition/Animation 제거
- Grow 애니메이션, TransitionComponent, transitionDuration 제거
- isPositioned 상태 및 handleEntering/handleExited 콜백 제거
- 학습 목적: 애니메이션은 Transition 컴포넌트의 책임, 즉시 표시로도 기능 이해 가능

### 3-4단계: anchorPosition/anchorReference 모드 제거
- `9c5f10ef` - [Popover 단순화 3-4/12] anchorPosition, anchorReference='anchorPosition/none' 모드 제거
- 절대 좌표(`anchorPosition`) 및 위치 지정 없는 모드(`anchorReference='none'`) 제거
- 학습 목적: Popover의 핵심은 "요소 기준 위치 지정", 특수 케이스는 제외

### 5단계: origin 숫자값 지원 제거
- `e348d1cf` - [Popover 단순화 5/12] anchorOrigin/transformOrigin 숫자값 지원 제거
- vertical/horizontal에 px 단위 숫자 대신 키워드(top/bottom/left/right)만 지원
- `getOffsetTop()`, `getOffsetLeft()`에서 number 타입 처리 제거
- 학습 목적: 키워드만으로도 충분, 픽셀 조정은 고급 기능

### 6단계: center origin 제거
- `ecc2d348` - [Popover 단순화 6/12] center origin 제거 (4가지 조합만 지원)
- center 옵션 제거로 9가지 조합 → 4가지 모서리 조합으로 단순화
- 학습 목적: Menu는 4가지 모서리만 사용, 모서리 기준이 더 직관적

### 7단계: action API 제거
- `5335828a` - [Popover 단순화 7/12] action (명령형 API) 제거
- `useImperativeHandle()`을 통한 `updatePosition()` 메서드 제거
- 학습 목적: 선언적 props만으로 충분, 명령형 API는 고급 사용 사례

### 8단계: disableScrollLock, container props 제거
- `3eb752f3` - [Popover 단순화 8/12] disableScrollLock, container 제거
- 항상 스크롤 잠금, container는 anchorEl의 body로 고정
- 학습 목적: Modal의 기본 동작만으로 충분

### 9단계: elevation prop 제거
- `25e298db` - [Popover 단순화 9/12] elevation 제거
- Material Design 스펙에 따라 elevation을 8로 고정
- 학습 목적: Popover는 항상 elevation 8 사용

### 10단계: Theme 시스템 제거
- `41e8093a` - [Popover 단순화 10/12] Theme 시스템 제거
- `useDefaultProps()`, `useUtilityClasses()`, `composeClasses()` 제거
- `ownerState`, `classes` 객체 제거
- 학습 목적: 테마 시스템은 전체 라이브러리 주제, 하드코딩된 값으로 충분

### 11단계: Styled Components 제거
- `126b4277` - [Popover 단순화 11/12] Styled Components 제거
- `styled()` API로 생성된 PopoverRoot, PopoverPaper 제거
- Modal, PaperBase를 인라인 스타일과 함께 직접 사용
- 학습 목적: CSS-in-JS 대신 구조 학습에 집중

### 12단계: PropTypes 제거
- `b73280e9` - [Popover 단순화 12/12] PropTypes 제거
- 런타임 타입 검증 시스템 전체 제거 (약 207줄)
- 학습 목적: TypeScript가 빌드 타임에 검증, PropTypes는 로직이 아님

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 699줄 | 252줄 (64% 감소) |
| **Props 개수** | 25개+ | 8개 |
| **Slot 시스템** | ✅ | ❌ |
| **Transition** | ✅ Grow | ❌ 즉시 표시 |
| **anchorPosition** | ✅ | ❌ anchorEl만 지원 |
| **origin 조합** | 9가지 (+ 숫자값) | 4가지 (모서리만) |
| **action API** | ✅ | ❌ |
| **elevation** | 커스터마이징 가능 | 8 고정 |
| **Theme 시스템** | ✅ | ❌ |
| **Styled Components** | ✅ | ❌ 인라인 스타일 |
| **PropTypes** | ✅ | ❌ |

---

## 학습 후 다음 단계

Popover를 이해했다면:

1. **Menu** - Popover를 사용하여 메뉴 구현, 키보드 네비게이션 추가
2. **Tooltip** - 비슷한 위치 지정 로직이지만 호버 이벤트 기반
3. **실전 응용** - 드롭다운, 컨텍스트 메뉴, 사용자 프로필 팝오버 등

**예시: 기본 사용**
```javascript
function BasicPopover() {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <button onClick={handleClick}>Open Popover</button>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <div style={{ padding: 16 }}>
          Popover 내용
        </div>
      </Popover>
    </>
  );
}
```

**예시: 다양한 위치 조합**
```javascript
// 버튼 위쪽에 표시
<Popover
  anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
  transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
>

// 버튼 오른쪽에 표시
<Popover
  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
  transformOrigin={{ vertical: 'top', horizontal: 'left' }}
>

// 버튼 아래 오른쪽 정렬
<Popover
  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
>
```
