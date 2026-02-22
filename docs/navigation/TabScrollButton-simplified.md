# TabScrollButton (Simplified)

## 간소화 결과

```jsx
'use client';
import * as React from 'react';

const KeyboardArrowLeft = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    style={{ display: 'block', width: '1em', height: '1em', fill: 'currentColor' }}
  >
    <path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z" />
  </svg>
);

const KeyboardArrowRight = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    style={{ display: 'block', width: '1em', height: '1em', fill: 'currentColor' }}
  >
    <path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z" />
  </svg>
);

const TabScrollButton = React.forwardRef(function TabScrollButton(props, ref) {
  const {
    className,
    direction,
    disabled = false,
    orientation,
    style,
    ...other
  } = props;

  const isVertical = orientation === 'vertical';

  return (
    <div
      ref={ref}
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        width: isVertical ? '100%' : 40,
        height: isVertical ? 40 : undefined,
        opacity: disabled ? 0 : 0.8,
        cursor: disabled ? 'default' : 'pointer',
        ...style,
      }}
      {...other}
    >
      <span style={{ display: 'block', transform: isVertical ? 'rotate(90deg)' : undefined }}>
        {direction === 'left' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </span>
    </div>
  );
});

export default TabScrollButton;
```

**182줄 → 60줄 (−67%)**

---

## 제거 항목 요약

| 항목 | 제거 이유 |
|------|---------|
| `styled(ButtonBase)` | inline style로 대체 |
| `ButtonBase` | `component="div"` 사용했으므로 `<div>` 직접 사용 |
| `useRtl()` | RTL 지원 제거 |
| `useSlotProps`, `slots`, `slotProps` | 슬롯 시스템 제거 |
| CSS 변수 `--TabScrollButton-svgRotate` | inline transform으로 직접 대체 |
| `KeyboardArrowLeft`/`Right` import (createSvgIcon) | 인라인 SVG로 대체 |
| `useUtilityClasses`, `composeClasses` | CSS 클래스 시스템 제거 |
| `getTabScrollButtonUtilityClass`, `tabScrollButtonClasses` | 클래스 시스템 일부 |
| `clsx` | 클래스 합성 유틸 |
| `classes` prop | 클래스 오버라이드 제거 |
| `useDefaultProps` | 기본값 직접 처리 |
| `ownerState` | styled 변형 시스템 제거 |
| `PropTypes` | 런타임 타입 검사 제거 |

---

## 유지 항목 및 이유

| 항목 | 유지 이유 |
|------|---------|
| `direction` prop | 'left'/'right' → 어떤 화살표를 렌더할지 결정 |
| `orientation` prop | 'vertical' → 치수 전환(가로↔세로) + 아이콘 90도 회전 |
| `disabled` prop | opacity로 완전 투명 처리 |
| 인라인 화살표 SVG | 스크롤 방향 시각 표현 |

---

## 핵심 학습 포인트

### 1. ButtonBase[component="div", role=null, tabIndex=null] → div

```jsx
// 원본
<TabScrollButtonRoot component="div" role={null} tabIndex={null} {...other}>

// 단순화
<div ref={ref} style={{ cursor: 'pointer', ... }} {...other}>
```

`role={null}`과 `tabIndex={null}` — ButtonBase의 기본 role/tabIndex를 명시적으로 제거:
- ButtonBase는 기본적으로 `role="button"`, `tabIndex=0`을 추가
- TabScrollButton은 Tabs가 클릭을 직접 처리하므로 버튼 시맨틱이 불필요
- 포커스 대상이 되어서는 안 됨 (keyboard nav는 탭 자체에서 처리)

`component="div"` → `<div>` 직접 사용으로 단순화.

### 2. CSS 변수로 동적 SVG transform

원본의 핵심 패턴:
```jsx
// 렌더 시 CSS 변수 주입
style={{
  '--TabScrollButton-svgRotate': `rotate(${isRtl ? -90 : 90}deg)`,
}}

// styled 정의 시
'& svg': {
  transform: 'var(--TabScrollButton-svgRotate)',
}
```

**CSS 변수를 쓰는 이유:**
- `styled`는 컴포넌트 정의 시점에 평가됨 (정적)
- RTL 여부는 런타임에 결정됨 (동적)
- CSS 변수 = styled 내에서 동적 값을 적용하는 방법

**단순화에서는:**
```jsx
<span style={{ transform: isVertical ? 'rotate(90deg)' : undefined }}>
```
- inline style이므로 CSS 변수 불필요 — 직접 rotate 값 설정
- RTL 제거로 방향 고정 (항상 90deg)

### 3. disabled → opacity: 0 (완전 투명)

```jsx
opacity: disabled ? 0 : 0.8,
```

**두 단계 opacity:**
- `opacity: 0.8`: 활성 상태에서도 약간 투명 (배경 탭들이 비쳐 보임)
- `opacity: 0`: 비활성 시 완전 투명 (공간은 차지, 시각적으로 없음)

**왜 `display: none`이 아닌 opacity인가?**
- Tabs가 스크롤 버튼 공간을 레이아웃 계산에 사용함
- `display: none`이면 Tabs의 가로 폭 계산이 변동 → 레이아웃 shift
- `opacity: 0`은 공간 유지하면서 숨김 (레이아웃 안정)

### 4. orientation → 치수 + 아이콘 회전

```jsx
const isVertical = orientation === 'vertical';

// 치수 변경
width: isVertical ? '100%' : 40,
height: isVertical ? 40 : undefined,

// 아이콘 회전
transform: isVertical ? 'rotate(90deg)' : undefined,
```

| orientation | width | height | 아이콘 |
|------------|-------|--------|--------|
| `'horizontal'` | 40px | 자동 | 그대로 (←, →) |
| `'vertical'` | 100% | 40px | 90도 회전 (↑, ↓) |

좌/우 화살표(`←`, `→`)를 90도 회전하면 위/아래 화살표(`↑`, `↓`)가 됨.
하나의 아이콘으로 두 orientation 모두 처리.

### 5. RTL 제거 — 단순화의 한계

원본에서는:
```jsx
const isRtl = useRtl();
'--TabScrollButton-svgRotate': `rotate(${isRtl ? -90 : 90}deg)`
```

RTL(Right-To-Left) 환경에서는 vertical 회전 방향이 반전됨.
단순화에서는 LTR만 지원 (rotate(90deg) 고정).

**RTL을 지원하려면:**
```jsx
// RTL을 지원해야 한다면 이렇게 확장 가능
const isRtl = document.dir === 'rtl';
transform: isVertical ? `rotate(${isRtl ? -90 : 90}deg)` : undefined,
```
