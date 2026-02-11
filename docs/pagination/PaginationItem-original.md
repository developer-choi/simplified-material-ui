# PaginationItem 컴포넌트

> Material-UI의 PaginationItem 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

PaginationItem은 **Pagination 컴포넌트 내부에서 사용되는 개별 페이지 버튼**을 렌더링하는 컴포넌트입니다.

### 핵심 기능
1. **type에 따른 렌더링** - page, previous, next, first, last, start-ellipsis, end-ellipsis 7가지 타입 지원
2. **상태 표시** - selected(선택됨), disabled(비활성화) 상태 시각적 표현
3. **아이콘 렌더링** - 네비게이션 버튼(previous/next/first/last)에 화살표 아이콘 표시
4. **스타일 변형** - size(3가지), shape(2가지), color(다중), variant(2가지) 조합 지원
5. **RTL 지원** - Right-to-Left 언어에서 아이콘 방향 자동 반전

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/PaginationItem/PaginationItem.js (539줄)

PaginationItem
  ├─> type === 'start-ellipsis' || type === 'end-ellipsis'
  │    └─> PaginationItemEllipsis (styled div)
  │         └─> "…" (생략 기호)
  │
  └─> 그 외 type
       └─> PaginationItemPage (styled ButtonBase)
            ├─> {type === 'page' && page}  ← 페이지 번호
            └─> {IconSlot &&
                 <PaginationItemPageIcon as={IconSlot} />}  ← 아이콘
```

### 2. Styled 컴포넌트 (3개)

#### PaginationItemEllipsis
- **역할**: 생략 부호("…") 렌더링
- **스타일**: minWidth, padding, borderRadius 등 기본 스타일
- **variants**: size별 (small/medium/large) 스타일 분기

#### PaginationItemPage
- **역할**: 클릭 가능한 페이지 버튼 (ButtonBase 기반)
- **스타일**:
  - 기본 스타일 (크기, 색상, 전환 효과)
  - hover/focus 상태
  - selected 상태 (배경색 변경)
  - disabled 상태 (opacity 조정)
- **variants**:
  - size별 (small/medium/large)
  - shape별 (circular/rounded)
  - variant별 (text/outlined)
  - color별 (동적 팔레트 기반 스타일 생성)

#### PaginationItemPageIcon
- **역할**: 네비게이션 아이콘 래퍼
- **스타일**: fontSize, margin
- **variants**: size별 fontSize 조정

### 3. Slot 시스템

```javascript
// 4개의 아이콘을 커스터마이징 가능
const externalForwardedProps = {
  slots: {
    previous: slots.previous ?? components.previous,
    next: slots.next ?? components.next,
    first: slots.first ?? components.first,
    last: slots.last ?? components.last,
  },
  slotProps,
};

// useSlot 훅으로 아이콘 컴포넌트 선택
const [PreviousSlot, previousSlotProps] = useSlot('previous', {
  elementType: NavigateBeforeIcon,  // 기본값
  externalForwardedProps,
  ownerState,
});

// ... next, first, last도 동일한 패턴
```

**특징**:
- `slots` prop으로 아이콘 컴포넌트 교체 가능
- `slotProps`로 아이콘에 추가 props 전달
- `components` prop도 지원 (deprecated, slots의 alias)

### 4. RTL 지원

```javascript
const isRtl = useRtl();  // RTL 모드 감지

const rtlAwareType = isRtl
  ? {
      previous: 'next',      // 이전 ↔ 다음
      next: 'previous',
      first: 'last',         // 처음 ↔ 마지막
      last: 'first',
    }[type]
  : type;

// rtlAwareType을 사용해 올바른 아이콘 선택
const IconSlot = {
  previous: PreviousSlot,
  next: NextSlot,
  first: FirstSlot,
  last: LastSlot,
}[rtlAwareType];
```

**이유**: 아랍어, 히브리어 등 RTL 언어에서는 "이전" 버튼이 오른쪽, "다음" 버튼이 왼쪽에 있어야 함

### 5. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `page` | ReactNode | - | 페이지 번호 (type='page'일 때만) |
| `type` | enum | 'page' | 버튼 타입 (7가지) |
| `selected` | boolean | false | 선택 상태 |
| `disabled` | boolean | false | 비활성화 상태 |
| `size` | enum \| string | 'medium' | 크기 (small/medium/large) |
| `shape` | enum | 'circular' | 모양 (circular/rounded) |
| `color` | enum \| string | 'standard' | 색상 (standard/primary/secondary + 커스텀) |
| `variant` | enum \| string | 'text' | 스타일 (text/outlined) |
| `component` | elementType | - | 루트 엘리먼트 교체 |
| `slots` | object | {} | 아이콘 컴포넌트 교체 |
| `slotProps` | object | {} | 아이콘에 전달할 props |
| `components` | object | {} | (deprecated) slots의 alias |
| `classes` | object | - | 클래스 오버라이드 |
| `className` | string | - | 추가 클래스 |
| `sx` | object | - | 시스템 스타일 |

**type 옵션**:
- `'page'` - 페이지 번호 버튼
- `'previous'` - 이전 페이지 버튼 (◀ 아이콘)
- `'next'` - 다음 페이지 버튼 (▶ 아이콘)
- `'first'` - 첫 페이지 버튼 (⏮ 아이콘)
- `'last'` - 마지막 페이지 버튼 (⏭ 아이콘)
- `'start-ellipsis'` - 시작 생략 부호 (…)
- `'end-ellipsis'` - 끝 생략 부호 (…)

### 6. 스타일 시스템

#### useUtilityClasses

```javascript
const useUtilityClasses = (ownerState) => {
  const { classes, color, disabled, selected, size, shape, type, variant } = ownerState;

  const slots = {
    root: [
      'root',
      `size${capitalize(size)}`,      // sizeMedium
      variant,                          // text
      shape,                            // circular
      color !== 'standard' && `color${capitalize(color)}`,  // colorPrimary
      color !== 'standard' && `${variant}${capitalize(color)}`,  // textPrimary
      disabled && 'disabled',
      selected && 'selected',
      {
        page: 'page',
        first: 'firstLast',
        last: 'firstLast',
        'start-ellipsis': 'ellipsis',
        'end-ellipsis': 'ellipsis',
        previous: 'previousNext',
        next: 'previousNext',
      }[type],
    ],
    icon: ['icon'],
  };

  return composeClasses(slots, getPaginationItemUtilityClass, classes);
};
```

**특징**:
- 조건부 클래스 생성 (color, disabled, selected 등)
- type에 따른 클래스 매핑 (page, firstLast, ellipsis, previousNext)

#### overridesResolver

```javascript
const overridesResolver = (props, styles) => {
  const { ownerState } = props;

  return [
    styles.root,
    styles[ownerState.variant],                    // text or outlined
    styles[`size${capitalize(ownerState.size)}`],  // sizeMedium
    ownerState.variant === 'text' && styles[`text${capitalize(ownerState.color)}`],
    ownerState.variant === 'outlined' && styles[`outlined${capitalize(ownerState.color)}`],
    ownerState.shape === 'rounded' && styles.rounded,
    ownerState.type === 'page' && styles.page,
    (ownerState.type === 'start-ellipsis' || ownerState.type === 'end-ellipsis') && styles.ellipsis,
    (ownerState.type === 'previous' || ownerState.type === 'next') && styles.previousNext,
    (ownerState.type === 'first' || ownerState.type === 'last') && styles.firstLast,
  ];
};
```

**역할**: 테마 오버라이드를 위한 클래스 매핑

### 7. 동적 팔레트 스타일

```javascript
// PaginationItemPage의 variants에 포함
...Object.entries(theme.palette)
  .filter(createSimplePaletteValueFilter(['dark', 'contrastText']))
  .map(([color]) => ({
    props: { variant: 'text', color },
    style: {
      [`&.${paginationItemClasses.selected}`]: {
        color: (theme.vars || theme).palette[color].contrastText,
        backgroundColor: (theme.vars || theme).palette[color].main,
        '&:hover': {
          backgroundColor: (theme.vars || theme).palette[color].dark,
        },
        // ...
      },
    },
  })),

// outlined variant도 동일한 패턴
```

**특징**:
- 테마의 모든 팔레트 색상을 자동으로 스타일로 생성
- `createSimplePaletteValueFilter`로 유효한 색상만 필터링
- text variant와 outlined variant 각각 다른 스타일

---

## 설계 패턴

1. **Conditional Rendering** (조건부 렌더링)
   - type에 따라 완전히 다른 컴포넌트 렌더링 (ellipsis vs button)
   - ellipsis는 ButtonBase 없이 단순 div
   - 나머지는 모두 ButtonBase 기반 클릭 가능

2. **Slot Pattern** (컴포넌트 교체)
   - 4개의 아이콘을 `slots` prop으로 교체 가능
   - `useSlot` 훅으로 구현
   - `components` prop은 deprecated (slots로 마이그레이션 권장)

3. **Variants Pattern** (변형)
   - styled 컴포넌트의 `variants` 배열로 props 기반 스타일 분기
   - size, shape, color, variant 조합으로 수십 가지 스타일 지원

4. **Dynamic Styling** (동적 스타일링)
   - `Object.entries(theme.palette)`로 런타임 팔레트 기반 스타일 생성
   - 커스텀 테마 색상도 자동 지원

5. **RTL Adaptation** (RTL 적응)
   - `useRtl` 훅으로 텍스트 방향 감지
   - 아이콘 타입 자동 반전 (previous ↔ next, first ↔ last)

---

## 복잡도의 이유

PaginationItem은 **539줄**이며, 복잡한 이유는:

1. **PropTypes (123줄)**
   - 413-536줄: 모든 props에 대한 런타임 타입 검증
   - 실제 로직보다 메타데이터가 많음

2. **다양한 변형 옵션 (4개 props × 여러 값)**
   - size: 3가지 (small/medium/large)
   - shape: 2가지 (circular/rounded)
   - color: 3가지 기본 + 무한 커스텀
   - variant: 2가지 (text/outlined)
   - 조합 가능성이 매우 높음

3. **Slot 시스템 (4개 아이콘)**
   - useSlot 훅 4번 호출
   - externalForwardedProps 객체 생성
   - rtlAwareType 기반 아이콘 선택 로직
   - 약 40줄

4. **동적 팔레트 스타일 생성**
   - Object.entries + filter + map 패턴
   - text variant: 약 20줄
   - outlined variant: 약 30줄
   - 총 50줄 이상

5. **RTL 지원**
   - useRtl 훅
   - rtlAwareType 변환 로직
   - IconSlot, iconSlotProps 매핑
   - 약 20줄

6. **복잡한 Styled 컴포넌트**
   - PaginationItemPage: 약 170줄 (스타일 정의 대부분)
   - PaginationItemEllipsis: 약 40줄
   - PaginationItemPageIcon: 약 25줄
   - overridesResolver, memoTheme 래퍼

7. **스타일 시스템 통합**
   - useUtilityClasses (약 30줄)
   - composeClasses 호출
   - useDefaultProps 호출
   - createSimplePaletteValueFilter 사용

---

## 예시 사용법

**기본 사용**:
```javascript
// Pagination 컴포넌트 내부에서 자동으로 렌더링됨
<PaginationItem type="page" page={1} />
<PaginationItem type="page" page={2} selected />
<PaginationItem type="previous" />
<PaginationItem type="next" />
```

**커스터마이징**:
```javascript
<PaginationItem
  type="page"
  page={1}
  size="large"
  shape="rounded"
  color="primary"
  variant="outlined"
/>

// 아이콘 교체
<PaginationItem
  type="previous"
  slots={{
    previous: CustomArrowIcon,
  }}
  slotProps={{
    previous: { fontSize: 'large' },
  }}
/>
```

**type별 렌더링 결과**:
- `page`: 숫자 버튼 (예: "1", "2", "3")
- `previous`: ◀ 이전
- `next`: ▶ 다음
- `first`: ⏮ 처음
- `last`: ⏭ 마지막
- `start-ellipsis`, `end-ellipsis`: … 생략 부호
