# Backdrop 컴포넌트

> 화면 전체를 덮는 반투명 오버레이로, Modal/Dialog가 열렸을 때 아래 콘텐츠를 어둡게 가림

---

## 이 문서의 목적

**이 문서는 단순화된 코드의 "설명서"입니다.**

Material-UI는 라이브러리 코드라서 복잡합니다. 단순화했더라도 코드만 보고는 이해하기 어려울 수 있습니다.
이 문서는 코드의 **동작 원리, 핵심 패턴, 왜 이렇게 구현했는지**를 상세히 설명하여 학습을 돕습니다.

---

## 무슨 기능을 하는가?

수정된 Backdrop은 **Modal이나 Dialog가 열렸을 때 나타나는 반투명한 어두운 배경 오버레이** 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **화면 전체 오버레이** - `position: fixed`로 뷰포트 전체를 덮는 레이어 생성
2. **반투명 배경** - `rgba(0, 0, 0, 0.5)` 고정값으로 아래 콘텐츠가 약간 보이는 효과
3. **중앙 정렬 컨테이너** - Flexbox로 children을 화면 중앙에 배치

> Backdrop 자체는 클릭 핸들링을 하지 않습니다. Modal에서 Backdrop을 감싸면서 클릭 이벤트를 처리합니다.

---

## 핵심 학습 포인트

### 1. 고정 위치 오버레이 (Fixed Position Overlay)

```javascript
style={{
  position: 'fixed',
  right: 0,
  bottom: 0,
  top: 0,
  left: 0,
  // ...
}}
```

**학습 가치**:
- `position: fixed`는 뷰포트 기준으로 위치 고정
- 4방향을 모두 0으로 설정하면 화면 전체를 차지
- 스크롤해도 항상 같은 위치 유지
- z-index 없이도 일반 콘텐츠 위에 표시됨

### 2. Flexbox 중앙 정렬

```javascript
style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  // ...
}}
```

**학습 가치**:
- Flexbox는 자식 요소 정렬의 가장 간단한 방법
- `alignItems: center` → 세로 중앙
- `justifyContent: center` → 가로 중앙
- children이 화면 정중앙에 배치됨

### 3. 반투명 배경 (RGBA)

```javascript
backgroundColor: 'rgba(0, 0, 0, 0.5)'
```

**학습 가치**:
- `rgba(R, G, B, Alpha)`: Alpha는 0(투명) ~ 1(불투명)
- `0.5`는 50% 불투명도
- 아래 콘텐츠가 약간 보여 사용자에게 "덮여있다"는 느낌 전달
- 완전 불투명(1.0)보다 자연스러운 UI

### 4. 조건부 렌더링

```javascript
if (!open) {
  return null;  // 즉시 언마운트
}

return <div>...</div>;
```

**학습 가치**:
- React의 가장 기본적인 조건부 렌더링 패턴
- `null` 반환 시 DOM에서 완전히 제거
- 애니메이션 없이 즉시 나타나고 사라짐
- 단순하고 이해하기 쉬움

### 5. Spread Override 패턴

```javascript
style={{
  position: 'fixed',
  // ... 기본 스타일들
  ...style,  // 사용자 스타일이 기본값 덮어씀
}}
```

**학습 가치**:
- 기본 스타일 제공하면서 사용자 커스터마이징 허용
- `...style`이 마지막에 오면 사용자 스타일이 우선순위
- 다른 단순화된 컴포넌트(Modal, Dialog)와 동일한 패턴

---

## 내부 구조

### 1. 렌더링 구조

```
// 위치: packages/modal/Backdrop/Backdrop.js (40줄, 원본 209줄)

Backdrop
  └─> div (inline styled, position: fixed)
       └─> children (중앙 배치됨)
```

**변경 사항**:
- ❌ TransitionSlot (Fade) 제거 → 즉시 표시/숨김
- ❌ BackdropRoot styled component 제거 → 일반 `div`
- ✅ 단순한 2단계 구조 (Backdrop → div → children)

### 2. 핵심 상태 (ref, state, 변수)

| 이름 | 타입 | 용도 |
|------|------|------|
| - | - | Backdrop에는 내부 상태가 없음. `open` prop으로만 제어 |

### 3. 함수 역할

Backdrop 내부에는 별도 함수가 없습니다. 조건부 렌더링만 수행합니다.

### 4. 동작 흐름

#### 렌더링 플로우차트

```
[Backdrop 렌더링]
       ↓
┌─────────────────────────────────┐
│ open prop 확인                   │
└─────────────────────────────────┘
       ↓
   open === false?
       ↓
  YES ─┼─ NO
       │    ↓
return null │
       │ ┌──────────────────────────┐
       │ │ <div> 렌더링              │
       │ │  - position: fixed       │
       │ │  - 4방향 0 (전체 화면)    │
       │ │  - flexbox 중앙 정렬      │
       │ │  - 반투명 배경            │
       │ └──────────────────────────┘
       │    ↓
       │ [children 중앙에 표시]
```

#### 시나리오 예시

**시나리오 1: Modal 열기**
```
open={true} 전달 → Backdrop 렌더링 → 화면 전체 어두워짐 → children 중앙 표시
```

**시나리오 2: Modal 닫기**
```
open={false} 전달 → return null → DOM에서 제거 → 화면 원상복구
```

### 5. 핵심 패턴/플래그

#### aria-hidden="true"

```javascript
<div
  ref={ref}
  aria-hidden="true"  // 스크린 리더가 무시
  {...other}
>
```

**왜 필요한가?**
- Backdrop은 시각적 효과만 담당
- 스크린 리더 사용자에게는 의미 없는 요소
- 실제 콘텐츠(Dialog 등)에만 접근성 제공

### 6. 주요 변경 사항 (원본 대비)

**원본과의 차이**:
- ❌ `invisible` prop 제거 → 항상 어두운 배경 (`rgba(0, 0, 0, 0.5)`)
- ❌ `component` prop 제거 → 항상 `div`
- ❌ `TransitionComponent` 제거 → 애니메이션 없음
- ❌ `transitionDuration` 제거 → 즉시 표시/숨김
- ❌ Slot 시스템 제거 → 고정된 구조
- ❌ Theme 시스템 제거 → 하드코딩된 스타일
- ❌ `classes`, `sx` 제거 → `style` prop만 사용
- ✅ `open`, `children`, `style` 유지

### 7. Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `open` | boolean | **required** | Backdrop 표시 여부 (false면 즉시 언마운트) |
| `children` | ReactNode | - | 중앙에 표시할 내용 (예: Spinner, Dialog) |
| `style` | object | - | 기본 스타일 덮어쓰기 (spread override) |
| `...other` | - | - | div에 전달되는 모든 props (className, onClick 등) |

**제거된 Props** (8개):
- ❌ `invisible` - 항상 어두운 배경
- ❌ `component` - 항상 `div`
- ❌ `TransitionComponent` - 애니메이션 없음
- ❌ `transitionDuration` - 애니메이션 없음
- ❌ `slots`, `slotProps` - 고정된 구조
- ❌ `classes` - 클래스 시스템 제거
- ❌ `sx` - Theme 시스템 제거

---

## 커밋 히스토리로 보는 단순화 과정

Backdrop은 **7개의 커밋**을 통해 단순화되었습니다.

### 1단계: Slot 시스템 삭제

- `28e4edbd` - [Backdrop 단순화 1/7] Slot 시스템 삭제

```javascript
// REMOVED:
const [RootSlot, rootSlotProps] = useSlot('root', { ... });
const [TransitionSlot, transitionSlotProps] = useSlot('transition', { ... });
```

**왜 불필요한가**:
- Backdrop의 핵심은 "화면을 덮는 오버레이"이지 "커스터마이징 시스템"이 아님
- `useSlot()` 훅 2번 호출, props 병합 로직 등 복잡도 증가

### 2단계: Transition/Animation 제거

- `34413dd8` - [Backdrop 단순화 2/7] Transition 제거

```javascript
// REMOVED:
import Fade from '../Fade';
<TransitionSlot in={open}><BackdropRoot /></TransitionSlot>

// CHANGED to:
if (!open) return null;
return <div>...</div>;
```

**왜 불필요한가**:
- Backdrop의 핵심은 "고정 위치 오버레이"이지 "애니메이션"이 아님
- 즉시 표시/숨김으로 단순화

### 3단계: component prop 제거

- `a215ed0e` - [Backdrop 단순화 3/7] component prop 제거

**왜 불필요한가**:
- Backdrop은 시각적 레이어이지 시맨틱 요소가 아님
- 대부분 기본값(`div`) 사용

### 4단계: invisible prop 제거

- `f7241d95` - [Backdrop 단순화 4/7] invisible prop 제거

```javascript
// REMOVED:
invisible ? 'transparent' : 'rgba(0, 0, 0, 0.5)'

// CHANGED to:
backgroundColor: 'rgba(0, 0, 0, 0.5)'  // 항상 고정
```

**왜 불필요한가**:
- "Backdrop"의 의미는 배경막. 배경이 없으면 Backdrop이 아님

### 5단계: Theme 시스템 제거

- `2a3cb2ed` - [Backdrop 단순화 5/7] Theme 시스템 제거

```javascript
// REMOVED:
import { useDefaultProps } from '../DefaultPropsProvider';
const props = useDefaultProps({ props: inProps, name: 'MuiBackdrop' });
const classes = useUtilityClasses(ownerState);
```

**왜 불필요한가**:
- 테마 시스템은 MUI 전체 주제로 Backdrop 학습에는 과함
- 하드코딩된 값으로도 동작 완벽히 이해 가능

### 6단계: Style 시스템 제거

- `bea23154` - [Backdrop 단순화 6/7] Style 시스템 제거

```javascript
// REMOVED:
const BackdropRoot = styled('div', { ... })({ ... });

// CHANGED to:
<div style={{ position: 'fixed', ... }}>
```

**왜 불필요한가**:
- 컴포넌트 구조를 배우는 것이지 CSS-in-JS를 배우는 게 아님
- 인라인 스타일이 JSX 내에서 바로 보여 이해하기 쉬움

### 7단계: PropTypes 제거

- `620862e0` - [Backdrop 단순화 7/7] PropTypes 제거

```javascript
// REMOVED (약 100줄):
Backdrop.propTypes = { ... };
```

**왜 불필요한가**:
- PropTypes 정의가 실제 로직(40줄)보다 많음
- TypeScript가 빌드 타임에 검증

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 209줄 | 40줄 (81% 감소) |
| **Props 개수** | 12개 | 4개 |
| **Import 개수** | 7개 | 1개 (React만) |
| **Slot 시스템** | ✅ useSlot() 2번 | ❌ 고정된 구조 |
| **Transition** | ✅ Fade 애니메이션 | ❌ 즉시 표시/숨김 |
| **Theme 통합** | ✅ useDefaultProps, classes | ❌ 하드코딩 |
| **Styled** | ✅ styled(), BackdropRoot | ❌ 인라인 style |
| **PropTypes** | ✅ 100줄 | ❌ 제거 |
| **invisible prop** | ✅ 투명 배경 가능 | ❌ 항상 rgba(0,0,0,0.5) |
| **component prop** | ✅ HTML 태그 변경 가능 | ❌ 항상 div |

---

## 학습 후 다음 단계

Backdrop을 이해했다면:

1. **Modal** - Backdrop + Portal + FocusTrap 조합 패턴 학습
2. **Dialog** - Modal + Paper의 Composition 패턴 학습
3. **실전 응용** - 로딩 Spinner, 이미지 Lightbox 등 직접 만들어보기

**예시: 기본 사용**
```javascript
<Backdrop open={isLoading}>
  <CircularProgress />
</Backdrop>
```

**예시: 커스텀 배경색**
```javascript
<Backdrop
  open={true}
  style={{ backgroundColor: 'rgba(255, 0, 0, 0.3)' }}  // 빨간 배경
>
  <div>Custom Content</div>
</Backdrop>
```

**예시: 클릭으로 닫기**
```javascript
<Backdrop
  open={open}
  onClick={() => setOpen(false)}
>
  <div onClick={(e) => e.stopPropagation()}>
    {/* 이 영역 클릭은 닫히지 않음 */}
    <p>Content</p>
  </div>
</Backdrop>
```
