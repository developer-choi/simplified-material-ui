# Backdrop 컴포넌트

> 학습 목적으로 단순화된 Backdrop - 고정 위치 오버레이의 핵심 개념에 집중

---

## 무슨 기능을 하는가?

수정된 Backdrop은 **Modal이나 Dialog가 열렸을 때 나타나는 반투명한 어두운 배경 오버레이** 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **화면 전체 오버레이** - position: fixed로 뷰포트 전체를 덮는 레이어 생성
2. **반투명 배경** - rgba(0, 0, 0, 0.5) 고정값으로 아래 콘텐츠가 약간 보이는 효과
3. **중앙 정렬 컨테이너** - Flexbox로 children을 화면 중앙에 배치

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
const Backdrop = React.forwardRef(function Backdrop(props, ref) {
  const { open, children, style, ...other } = props;

  if (!open) {
    return null;  // 즉시 언마운트
  }

  return <div>...</div>;
});
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
- Props drilling 없이 유연성 확보

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/mui-material/src/Backdrop/Backdrop.js (40줄, 원본 209줄)
Backdrop
  └─> div (inline styled)
       └─> children
```

**변경 사항**:
- ❌ TransitionSlot (Fade) 제거 → 즉시 표시/숨김
- ❌ BackdropRoot styled component 제거 → 일반 `div`
- ✅ 단순한 2단계 구조 (Backdrop → div → children)

### 2. 전체 코드

```javascript
'use client';
import * as React from 'react';

const Backdrop = React.forwardRef(function Backdrop(props, ref) {
  const {
    children,
    open,
    style,
    ...other
  } = props;

  if (!open) {
    return null;
  }

  return (
    <div
      ref={ref}
      aria-hidden="true"
      {...other}
      style={{
        position: 'fixed',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        right: 0,
        bottom: 0,
        top: 0,
        left: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
    >
      {children}
    </div>
  );
});

export default Backdrop;
```

> **💡 원본과의 차이**:
> - ❌ `useSlot()` 제거 → 고정된 구조
> - ❌ `styled()` 제거 → 인라인 스타일
> - ❌ `useDefaultProps()` 제거 → 함수 파라미터 기본값
> - ❌ `useUtilityClasses()` 제거 → 클래스 이름 불필요
> - ❌ Fade 애니메이션 제거 → 즉시 표시/숨김

### 3. Props (4개만 남음)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `open` | boolean | **required** | Backdrop 표시 여부 (false면 즉시 언마운트) |
| `children` | ReactNode | - | 중앙에 표시할 내용 (예: Spinner, Dialog) |
| `style` | object | - | 기본 스타일 덮어쓰기 (spread override) |
| `...other` | - | - | div에 전달되는 모든 props (className, onClick 등) |

**제거된 props** (8개):
- ❌ `invisible` - 항상 어두운 배경 (`rgba(0, 0, 0, 0.5)`)
- ❌ `component` - 항상 `div`
- ❌ `TransitionComponent` - 애니메이션 없음
- ❌ `transitionDuration` - 애니메이션 없음
- ❌ `slots` - 고정된 구조
- ❌ `slotProps` - 고정된 구조
- ❌ `components` (deprecated) - 제거
- ❌ `componentsProps` (deprecated) - 제거
- ❌ `classes` - 클래스 시스템 제거
- ❌ `sx` - Theme 시스템 제거

---

## 커밋 히스토리로 보는 단순화 과정

Backdrop은 **7개의 커밋**을 통해 단순화되었습니다.

### 1단계: Slot 시스템 삭제
- `28e4edbd` - [Backdrop 단순화 1/7] Slot 시스템 삭제

**왜 불필요한가**:
- **학습 목적**: Backdrop의 핵심은 "화면을 덮는 오버레이"이지 "커스터마이징 시스템"이 아님
- **복잡도**: `useSlot()` 훅 2번 호출, props 병합 로직, deprecated API 지원 등
- **일관성**: Dialog, Modal 등 다른 단순화된 컴포넌트에서도 Slot 제거

**삭제 대상**:
- `slots`, `slotProps` prop
- `components`, `componentsProps` (deprecated)
- `useSlot()` 훅 호출
- `externalForwardedProps`, `backwardCompatibleSlots` 객체

### 2단계: Transition/Animation 제거
- `34413dd8` - [Backdrop 단순화 2/7] Transition 제거

**왜 불필요한가**:
- **학습 목적**: Backdrop의 핵심은 "고정 위치 오버레이"이지 "애니메이션"이 아님
- **복잡도**: TransitionComponent prop 처리, transitionDuration 전달, Fade 컴포넌트 감싸기
- **일관성**: Dialog, Modal에서도 Transition 제거됨

**삭제 대상**:
- `TransitionComponent` prop
- `transitionDuration` prop
- `Fade` import
- TransitionSlot 사용
- → `open ? <BackdropRoot>...</BackdropRoot> : null` 패턴으로 변경

### 3단계: component prop 제거
- `a215ed0e` - [Backdrop 단순화 3/7] component prop 제거

**왜 불필요한가**:
- **학습 목적**: Backdrop의 역할은 시각적 레이어이지 시맨틱 요소가 아님
- **복잡도**: component prop을 styled() 시스템에 전달, elementType 결정 로직
- **현실**: 대부분 기본값(`div`) 사용, Backdrop에 시맨틱 의미 부여할 이유 없음

**삭제 대상**:
- `component` prop (기본값: `'div'`)
- ownerState에서 component 제거
- → 항상 `div`로 고정

### 4단계: invisible prop 제거
- `f7241d95` - [Backdrop 단순화 4/7] invisible prop 제거

**왜 불필요한가**:
- **학습 목적**: "Backdrop"의 사전적 의미는 배경막. 배경이 없으면 Backdrop이 아님
- **복잡도**: invisible에 따른 조건부 스타일 (variants), useUtilityClasses 처리
- **현실**: Modal/Dialog에서 `invisible={false}`가 일반적 (배경 있는 게 기본)

**삭제 대상**:
- `invisible` prop
- invisible 조건부 스타일 variants
- useUtilityClasses의 invisible 처리
- → backgroundColor 항상 `rgba(0, 0, 0, 0.5)` 고정

### 5단계: Theme 시스템 제거
- `2a3cb2ed` - [Backdrop 단순화 5/7] Theme 시스템 제거

**왜 불필요한가**:
- **학습 목적**: 테마 시스템은 Material-UI 전체의 주제로 Backdrop 학습에는 과함
- **복잡도**: useDefaultProps, useUtilityClasses, composeClasses, ownerState 등
- **대안**: 하드코딩된 값으로도 Backdrop 동작 완벽히 이해 가능

**삭제 대상**:
- `useDefaultProps()` 호출 → 함수 파라미터 기본값으로 대체
- `useUtilityClasses()` 함수 전체
- `composeClasses`, `getBackdropUtilityClass` import
- `ownerState` 객체
- `classes` prop 및 처리

### 6단계: Style 시스템 제거
- `bea23154` - [Backdrop 단순화 6/7] Style 시스템 제거

**왜 불필요한가**:
- **학습 목적**: 컴포넌트 구조를 배우는 것이지 CSS-in-JS를 배우는 게 아님
- **복잡도**: styled() API, overridesResolver, variants, className 병합 (clsx)
- **가독성**: 인라인 스타일이 JSX 내에서 바로 보여 이해하기 쉬움

**삭제 대상**:
- `styled()` 함수 사용
- `BackdropRoot` styled 컴포넌트 → 일반 `div`로 대체
- `styled`, `clsx` import
- `className` prop 병합 로직 → 그냥 전달만 (`{...other}`)
- `sx` prop

### 7단계: PropTypes 제거
- `620862e0` - [Backdrop 단순화 7/7] PropTypes 제거

**왜 불필요한가**:
- **학습 목적**: PropTypes는 타입 검증 도구이지 컴포넌트 로직이 아님
- **복잡도**: PropTypes 정의 약 100줄, 실제 로직(50줄)보다 많음
- **프로덕션**: TypeScript가 빌드 타임에 검증하므로 런타임 검증 불필요

**삭제 대상**:
- `PropTypes` import
- `Backdrop.propTypes` 전체 (약 100줄)
- JSDoc 주석

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 209줄 | 40줄 (81% 감소) |
| **Props 개수** | 12개 | 4개 (8개 제거) |
| **Import 개수** | 7개 | 1개 (React만) |
| **Slot 시스템** | ✅ useSlot() 2번 | ❌ 고정된 구조 |
| **Transition** | ✅ Fade 애니메이션 | ❌ 즉시 표시/숨김 |
| **Theme 통합** | ✅ useDefaultProps, classes | ❌ 하드코딩 |
| **Styled** | ✅ styled(), BackdropRoot | ❌ 인라인 style |
| **PropTypes** | ✅ 100줄 | ❌ 제거 |
| **invisible prop** | ✅ 투명 배경 가능 | ❌ 항상 rgba(0,0,0,0.5) |
| **component prop** | ✅ HTML 태그 변경 가능 | ❌ 항상 div |
| **커스터마이징** | ✅ 광범위 (slots, sx 등) | ✅ 최소 (style만) |

---

## 학습 후 다음 단계

Backdrop을 이해했다면:

1. **Modal** - Backdrop + Portal + FocusTrap 조합 패턴 학습
2. **Dialog** - Modal + Paper의 Composition 패턴 학습
3. **실전 응용** - 로딩 Spinner, 이미지 Lightbox 등 직접 만들어보기

**예시: 로딩 Backdrop**
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
