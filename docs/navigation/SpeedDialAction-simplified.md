# SpeedDialAction 컴포넌트

> open 상태에 따라 scale 애니메이션으로 등장하는 SpeedDial 액션 버튼

---

## 이 문서의 목적

**이 문서는 단순화된 코드의 "상세 학습 가이드"입니다.**

라이브러리 코드는 복잡합니다. 단순화했더라도 코드만 보고는 이해하기 어려울 수 있습니다.
이 문서는 코드의 **동작 원리, 핵심 패턴, 왜 이렇게 구현했는지**를 상세히 설명하여 학습을 돕습니다.

> **원본 구조 파악**: 원본 코드의 빠른 이해는 `SpeedDialAction-original.md` 참고

---

## 무슨 기능을 하는가?

수정된 SpeedDialAction은 **SpeedDial 내부의 개별 액션 버튼으로, open 상태에 따라 scale/opacity 애니메이션으로 등장하며 hover Tooltip으로 라벨을 표시하는** 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **scale/opacity 애니메이션** - open 시 `scale(0)→scale(1)` + `opacity 0→1`, close 시 반대
2. **순차 등장 (transitionDelay)** - `delay` prop으로 각 액션이 시간차를 두고 등장
3. **hover Tooltip** - tooltipTitle로 액션 설명을 hover 시 표시

---

## 핵심 학습 포인트

### 1. transitionDelay를 이용한 순차 애니메이션 (Staggered Animation)

```javascript
const fabStyle = {
  transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s',
  transitionDelay: `${delay}ms`,
  opacity: open ? 1 : 0,
  transform: open ? 'scale(1)' : 'scale(0)',
};
```

**학습 가치**:
- JavaScript 타이머(setTimeout) 없이 CSS `transitionDelay`만으로 순차 등장 효과 구현
- 부모(SpeedDial)가 `delay: 30 * index`를 전달하면 0ms, 30ms, 60ms... 시간차로 등장
- close 시에는 `delay: 30 * (length - index)`로 역순 사라짐
- 모든 애니메이션이 CSS 기반이므로 메인 스레드를 블로킹하지 않음

### 2. Tooltip + Fab 조합 패턴

```javascript
<Tooltip title={tooltipTitle} placement="left">
  <Fab role="menuitem" size="small" tabIndex={-1}>
    {icon}
  </Fab>
</Tooltip>
```

**학습 가치**:
- Tooltip이 Fab을 감싸서 hover 시 라벨을 표시하는 조합 패턴
- `role="menuitem"` + `tabIndex={-1}`으로 접근성: SpeedDial의 `role="menu"`와 짝을 이룸
- `tabIndex={-1}`인 이유: SpeedDial이 키보드 화살표키로 포커스를 관리하므로, 개별 액션은 Tab으로 접근 불가

### 3. 컴포넌트 조합 (Composition)

```javascript
// SpeedDialAction은 Fab과 Tooltip을 조합만 함
// 자체적인 DOM 엘리먼트를 생성하지 않음
return (
  <Tooltip ...>
    <Fab ...>{icon}</Fab>
  </Tooltip>
);
```

**학습 가치**:
- SpeedDialAction 자체는 새로운 DOM 엘리먼트를 만들지 않고, 기존 컴포넌트(Fab, Tooltip)를 조합
- 이것이 React의 **Composition 패턴** — 작은 컴포넌트를 조합하여 더 큰 기능을 만듦
- 각 컴포넌트가 자기 역할만 수행: Fab은 버튼, Tooltip은 라벨, SpeedDialAction은 애니메이션 + 조합

---

## 내부 구조

### 1. 렌더링 구조

```javascript
// 위치: packages/mui-material/src/SpeedDialAction/SpeedDialAction.js (49줄, 원본 395줄)

SpeedDialAction (forwardRef)
  └─> Tooltip  ← hover 시 라벨 표시 (placement="left")
       └─> Fab (small)  ← 아이콘 버튼 + scale/opacity 애니메이션
            └─> icon
```

### 2. 핵심 상태 (ref, state, 변수)

| 이름 | 타입 | 용도 |
|------|------|------|
| `fabStyle` | 변수 | open/delay에 따른 인라인 스타일 (transform, opacity, transitionDelay) |

### 3. 함수 역할

이 컴포넌트에는 별도의 함수가 없습니다. 모든 로직이 렌더링 시점에 fabStyle 객체 생성으로 처리됩니다.

### 4. 동작 흐름

#### 순차 등장 플로우차트

```
SpeedDial이 open=true 설정
        ↓
각 SpeedDialAction에 open=true, delay=30*index 전달
        ↓
┌─────────────────────────────────┐
│ fabStyle 계산                    │
│ opacity: 1, transform: scale(1) │
│ transitionDelay: 30*index ms    │
└─────────────────────────────────┘
        ↓
CSS transition 엔진이 delay 후 애니메이션 시작
        ↓
Action 0: 즉시 등장 (0ms)
Action 1: 30ms 후 등장
Action 2: 60ms 후 등장
...
```

#### 시나리오 예시

**시나리오 1: SpeedDial 열기 (3개 액션)**
```
SpeedDial open → Action0(delay=0ms) → Action1(delay=30ms) → Action2(delay=60ms)
                  즉시 scale(1)         30ms 후 scale(1)      60ms 후 scale(1)
```

**시나리오 2: SpeedDial 닫기 (3개 액션)**
```
SpeedDial close → Action0(delay=60ms) → Action1(delay=30ms) → Action2(delay=0ms)
                   60ms 후 scale(0)      30ms 후 scale(0)      즉시 scale(0)
```

**시나리오 3: hover로 Tooltip 확인**
```
사용자가 Fab 위에 마우스 올림 → Tooltip이 왼쪽에 라벨 표시 → 마우스 떠남 → Tooltip 사라짐
```

### 5. 핵심 패턴/플래그

#### transitionDelay 패턴

- **비유**: "도미노 효과"
- **역할**: 각 액션이 일정 시간차를 두고 순차적으로 나타나는 시각적 효과를 CSS만으로 구현

**왜 필요한가?**

```javascript
// transitionDelay 없이 모든 액션이 동시에 나타남
opacity: open ? 1 : 0  // 3개 액션이 한꺼번에 "팝"
```

**transitionDelay가 있으면:**

```javascript
// 각 액션이 시간차를 두고 순차적으로 나타남
transitionDelay: `${delay}ms`
// Action 0: 0ms, Action 1: 30ms, Action 2: 60ms
// → 물결처럼 퍼지는 부드러운 등장 효과
```

### 6. 주요 변경 사항 (원본 대비)

```javascript
// 원본: 4개 useSlot + 2가지 렌더 경로 (hover vs static)
const [FabSlot, fabSlotProps] = useSlot('fab', { ... });
const [TooltipSlot, tooltipSlotProps] = useSlot('tooltip', { ... });
const [StaticTooltipSlot, ...] = useSlot('staticTooltip', { ... });
const [StaticTooltipLabelSlot, ...] = useSlot('staticTooltipLabel', { ... });

if (tooltipSlotProps.open) {
  return <StaticTooltipSlot>...</StaticTooltipSlot>;  // 정적 라벨 모드
}
return <TooltipSlot>...</TooltipSlot>;  // hover 모드

// 단순화: Fab + Tooltip 직접 사용, hover 모드만
return (
  <Tooltip title={tooltipTitle} placement="left">
    <Fab style={fabStyle} size="small">{icon}</Fab>
  </Tooltip>
);
```

**원본과의 차이**:
- ❌ `slots/slotProps` 제거 → 고정된 Fab + Tooltip
- ❌ `FabProps`, `TooltipClasses` deprecated props 제거
- ❌ Static Tooltip 모드 제거 → hover Tooltip만 유지
- ❌ `tooltipPlacement` 제거 → 'left' 고정
- ❌ `tooltipOpen` 제거 → 항상 hover 모드
- ❌ `classes` prop 제거 → 클래스 커스터마이징 불가
- ❌ styled 컴포넌트 제거 → inline styles
- ❌ Theme 시스템 제거 → 하드코딩된 스타일 값
- ✅ `delay` + `open` 조합의 순차 애니메이션 유지 → 핵심 기능
- ✅ `tooltipTitle` + Tooltip hover 유지 → 라벨 표시
- ✅ `role="menuitem"`, `tabIndex={-1}` 접근성 유지

### 7. Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `open` | boolean | - | 표시 여부 (scale 애니메이션 트리거) |
| `icon` | ReactNode | - | Fab 버튼에 표시할 아이콘 |
| `delay` | number | `0` | 등장 애니메이션 지연 시간(ms) |
| `tooltipTitle` | ReactNode | - | hover Tooltip에 표시할 라벨 |
| `id` | string | - | 접근성 ID |
| `className` | string | - | Fab에 적용할 추가 CSS 클래스 |

**제거된 Props**:
- ❌ `slots/slotProps` - Slot 시스템 커스터마이징 제거
- ❌ `FabProps` - deprecated, Fab props 직접 전달 불가
- ❌ `TooltipClasses` - deprecated, Tooltip 클래스 커스터마이징 불가
- ❌ `tooltipOpen` - 정적 라벨 모드 제거
- ❌ `tooltipPlacement` - 'left' 고정
- ❌ `classes` - MUI 클래스 시스템 제거
- ❌ `sx` - styled 시스템 제거

---

## 커밋 히스토리로 보는 단순화 과정

SpeedDialAction은 **7개의 커밋**을 통해 단순화되었습니다.

### 1단계: Slot 시스템 + deprecated props 제거

- `bc74c92d76` - [SpeedDialAction 단순화 1/7] Slot 시스템 + deprecated props 제거

**삭제된 코드**:
```javascript
const [FabSlot, fabSlotProps] = useSlot('fab', { elementType: SpeedDialActionFab, ... });
const [TooltipSlot, tooltipSlotProps] = useSlot('tooltip', { elementType: Tooltip, ... });
const externalForwardedProps = { slots, slotProps: { fab: FabProps, ...slotProps, tooltip: mergeSlotProps(...) } };
```

**왜 불필요한가**:
- **학습 목적**: 4개 useSlot 호출은 커스터마이징 인프라이지 컴포넌트 동작이 아님
- **복잡도**: useSlot 4회 + mergeSlotProps + externalForwardedProps 약 60줄 제거

### 2단계: Static Tooltip 모드 제거

- `405a10c5c0` - [SpeedDialAction 단순화 2/7] Static Tooltip 모드 제거

**삭제된 코드**:
```javascript
// 2개의 styled 컴포넌트 + 정적 라벨 렌더링 경로
const SpeedDialActionStaticTooltip = styled('span', { ... })( ... );
const SpeedDialActionStaticTooltipLabel = styled('span', { ... })( ... );
if (tooltipOpenProp) {
  return <StaticTooltip><StaticTooltipLabel>{title}</StaticTooltipLabel>{fab}</StaticTooltip>;
}
```

**왜 불필요한가**:
- **학습 목적**: 정적 라벨은 추가 UX 옵션이며, hover Tooltip만으로 기능 전달 충분
- **복잡도**: 2개 styled 컴포넌트(75줄) + 별도 렌더 경로 + tooltipOpen 상태 관리

### 3단계: tooltipPlacement 고정

- `1ea8ae286b` - [SpeedDialAction 단순화 3/7] tooltipPlacement 고정 (left)

**왜 불필요한가**:
- **학습 목적**: Tooltip 위치는 부가적 레이아웃 옵션
- **복잡도**: capitalize import, ownerState에 tooltipPlacement 추가, 24줄의 PropTypes enum 제거

### 4단계: useUtilityClasses 및 classes prop 제거

- `6ece3a6608` - [SpeedDialAction 단순화 4/7] useUtilityClasses 및 classes prop 제거

**왜 불필요한가**:
- **학습 목적**: MUI 클래스 생성 인프라
- **복잡도**: useUtilityClasses 함수 + composeClasses import 제거

### 5단계: Theme 시스템 제거

- `8d2770d432` - [SpeedDialAction 단순화 5/7] Theme 시스템 제거

**삭제된 코드**:
```javascript
memoTheme(({ theme }) => ({
  color: (theme.vars || theme).palette.text.secondary,
  backgroundColor: (theme.vars || theme).palette.background.paper,
  transition: theme.transitions.create('transform', { duration: theme.transitions.duration.shorter }),
}))
```

**왜 불필요한가**:
- **학습 목적**: 테마 값을 하드코딩해도 동작 동일 (color: 'rgba(0,0,0,0.6)', backgroundColor: '#fff')
- **복잡도**: memoTheme 래퍼, emphasize 유틸, theme.vars 분기 등 제거

### 6단계: styled 컴포넌트 → inline styles

- `0e44b55345` - [SpeedDialAction 단순화 6/7] styled 컴포넌트 → inline styles

**왜 불필요한가**:
- **학습 목적**: styled API는 스타일링 인프라 학습, inline styles로 스타일이 바로 보임
- **복잡도**: styled(Fab, {name, slot, variants, overridesResolver}) → Fab + style prop

### 7단계: PropTypes 제거

- `5a293a812f` - [SpeedDialAction 단순화 7/7] PropTypes 제거

**왜 불필요한가**:
- **학습 목적**: 런타임 타입 검증 메타데이터
- **복잡도**: 32줄의 PropTypes 블록 제거

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 395줄 | 49줄 (88% 감소) |
| **Props 개수** | 13개 | 6개 |
| **Slot 시스템** | ✅ (4개 슬롯) | ❌ |
| **Static Tooltip** | ✅ | ❌ (hover만) |
| **tooltipPlacement** | ✅ (15가지) | ❌ ('left' 고정) |
| **styled 컴포넌트** | ✅ (3개) | ❌ (inline styles) |
| **순차 애니메이션** | ✅ | ✅ |
| **Tooltip 라벨** | ✅ | ✅ (hover) |

---

## 학습 후 다음 단계

SpeedDialAction을 이해했다면:

1. **SpeedDial** - 오케스트레이터 컴포넌트. children에 delay/open/id를 cloneElement로 주입, 키보드 네비게이션
2. **Fab** - SpeedDialAction 내부에서 사용하는 Floating Action Button 컴포넌트
3. **실전 응용** - transitionDelay로 리스트 아이템 순차 등장 효과 구현

**예시: 기본 사용**
```javascript
<SpeedDial ariaLabel="actions" icon={<SpeedDialIcon />}>
  <SpeedDialAction icon={<SaveIcon />} tooltipTitle="Save" />
  <SpeedDialAction icon={<PrintIcon />} tooltipTitle="Print" />
</SpeedDial>
// SpeedDial이 open, delay, id를 자동으로 각 Action에 전달
```

**예시: transitionDelay 패턴 응용**
```javascript
// 리스트 아이템 순차 등장에 같은 원리 적용 가능
{items.map((item, i) => (
  <div
    key={item.id}
    style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      transition: 'all 300ms ease',
      transitionDelay: `${i * 50}ms`,
    }}
  >
    {item.name}
  </div>
))}
```
