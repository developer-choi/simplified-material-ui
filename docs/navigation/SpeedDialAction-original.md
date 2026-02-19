# SpeedDialAction 컴포넌트

> SpeedDialAction 컴포넌트 원본 구조 빠른 파악

**⚠️ 이 문서의 목적**: 간소화 작업 **전에** 원본 코드를 빠르게 이해하기 위한 요약 문서입니다.

---

## 무슨 기능을 하는가?

SpeedDialAction은 **SpeedDial 내부의 개별 액션 버튼으로, 아이콘 + Tooltip 라벨을 가지며 순차적 scale 애니메이션으로 등장/사라지는** 컴포넌트입니다.

### 핵심 기능
1. **scale 애니메이션** - open 시 `scale(0) → scale(1)` + opacity 전환으로 등장, close 시 반대
2. **순차 등장 (delay)** - `delay` prop으로 각 액션이 시간차를 두고 순차적으로 등장
3. **Tooltip 라벨** - hover 시 Tooltip으로 액션 설명 표시 (hover 모드)
4. **정적 라벨** - `tooltipOpen` prop으로 항상 보이는 라벨 표시 (static 모드)
5. **Fab 버튼** - 작은 크기(small)의 Floating Action Button으로 렌더링

---

## 주요 코드 구조

### 파일 위치 및 크기

```
packages/mui-material/src/SpeedDialAction/SpeedDialAction.js (395줄)
packages/mui-material/src/SpeedDialAction/speedDialActionClasses.ts (41줄)
```

### 렌더링 구조

**모드 1: hover Tooltip (기본, tooltipOpen=false)**
```
SpeedDialAction (forwardRef)
  └─> Tooltip  ← hover 시 라벨 표시
       └─> Fab (small, styled)  ← 아이콘 버튼 + scale/opacity 애니메이션
            └─> icon
```

**모드 2: static Tooltip (tooltipOpen=true)**
```
SpeedDialAction (forwardRef)
  └─> StaticTooltip (styled span)  ← 항상 보이는 라벨 래퍼
       ├─> StaticTooltipLabel (styled span)  ← 라벨 텍스트
       └─> Fab (small, styled)  ← 아이콘 버튼
```

### 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `open` | boolean | - | 표시 여부 (scale 애니메이션 트리거) |
| `icon` | ReactNode | - | Fab에 표시할 아이콘 |
| `delay` | number | `0` | 등장 애니메이션 지연 시간(ms) |
| `tooltipTitle` | ReactNode | - | Tooltip에 표시할 라벨 (deprecated) |
| `tooltipPlacement` | string | `'left'` | Tooltip 위치 (deprecated) |
| `tooltipOpen` | boolean | `false` | 정적 라벨 모드 (deprecated) |
| `id` | string | - | 접근성 ID |
| `FabProps` | object | `{}` | Fab 컴포넌트에 전달할 props (deprecated) |
| `TooltipClasses` | object | - | Tooltip 클래스 오버라이드 (deprecated) |
| `slots` | object | `{}` | 4개 슬롯(fab, tooltip, staticTooltip, staticTooltipLabel) |
| `slotProps` | object | `{}` | 슬롯별 props |

### 핵심 로직 발췌

```javascript
// 순차 등장을 위한 transition delay
const transitionStyle = { transitionDelay: `${delay}ms` };

// SpeedDial에서 delay를 자동 계산하여 전달
// delay: 30 * (open ? index : allItems.length - index)
// → open 시: 0ms, 30ms, 60ms... (순차 등장)
// → close 시: 역순으로 사라짐
```

```javascript
// Fab 스타일: open 여부에 따른 scale/opacity 애니메이션
variants: [
  {
    props: ({ ownerState }) => !ownerState.open,
    style: {
      opacity: 0,
      transform: 'scale(0)',
    },
  },
],
```

```javascript
// 두 가지 렌더링 경로
if (tooltipSlotProps.open) {
  // Static 모드: 항상 보이는 라벨
  return (
    <StaticTooltipSlot>
      <StaticTooltipLabelSlot>{title}</StaticTooltipLabelSlot>
      {fab}
    </StaticTooltipSlot>
  );
}

// Hover 모드: Tooltip으로 래핑
return (
  <TooltipSlot title={title} open={open && tooltipOpen}>
    {fab}
  </TooltipSlot>
);
```

---

## 복잡도의 이유

SpeedDialAction은 **395줄**이며, 복잡한 이유는:

1. **Slot 시스템** - 4개 슬롯(fab, tooltip, staticTooltip, staticTooltipLabel) 각각 useSlot 호출 + externalForwardedProps 병합
2. **이중 렌더링 경로** - tooltipOpen 여부에 따라 hover Tooltip vs static 라벨 완전히 다른 렌더 트리
3. **styled 컴포넌트 3개** - SpeedDialActionFab, SpeedDialActionStaticTooltip, SpeedDialActionStaticTooltipLabel 각각 theme 의존 스타일
4. **deprecated props 병합** - FabProps, TooltipClasses, tooltipOpen, tooltipPlacement, tooltipTitle → slotProps로 변환하는 mergeSlotProps 로직
5. **Theme 의존** - palette, transitions, typography, shadows, shape 등 다양한 theme 값 참조

---

## 간소화 방향

이 컴포넌트를 간소화할 때 제거 고려 대상:

- **Slot 시스템** - 4개 useSlot + externalForwardedProps → Fab, Tooltip 직접 사용
- **Static Tooltip 모드** - 정적 라벨 렌더 경로 전체 + 2개 styled 컴포넌트 → hover Tooltip만 유지
- **tooltipPlacement** - 'left' 고정
- **useUtilityClasses + classes** - MUI 클래스 인프라 제거
- **Theme 시스템** - 스타일 값 하드코딩
- **styled 컴포넌트** - inline styles로 변환
- **PropTypes** - 메타데이터 제거

> 상세한 간소화 결과는 `SpeedDialAction-simplified.md` 참고
