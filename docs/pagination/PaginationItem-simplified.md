# PaginationItem 컴포넌트 (단순화 버전)

> 단순화된 PaginationItem 컴포넌트 구조 분석

---

## 개요

**원본**: 539줄 → **단순화**: 149줄 (72% 감소, 390줄 제거)

PaginationItem은 Pagination 컴포넌트 내부에서 사용되는 **개별 페이지 버튼**을 렌더링하는 컴포넌트입니다. 단순화 과정을 통해 학습에 불필요한 복잡한 커스터마이징 옵션들을 제거하고, 핵심 기능에 집중했습니다.

---

## 제거된 기능 (10단계)

### 1. PropTypes 제거 (-125줄)
- 런타임 타입 검증 시스템 제거
- 학습 목적에서 불필요한 메타데이터

### 2. Slot 시스템 제거 (-45줄)
- `slots`, `slotProps`, `components` props 제거
- useSlot 훅 제거
- 아이콘을 직접 참조하도록 단순화

### 3. size prop 제거 (-53줄)
- 'medium'으로 고정
- size별 variants 제거 (small/medium/large)

### 4. shape prop 제거 (-8줄)
- 'circular'로 고정
- shape별 variants 제거 (circular/rounded)

### 5. color와 variant prop 제거 (-89줄)
- color: 'standard'로 고정
- variant: 'text'로 고정
- 동적 팔레트 스타일 생성 로직 제거
- createSimplePaletteValueFilter 제거

### 6. RTL 지원 제거 (-11줄)
- useRtl 훅 제거
- rtlAwareType 변환 로직 제거
- LTR만 지원

### 7. useDefaultProps 제거 (-2줄)
- 테마에서 기본 props 가져오는 시스템 제거
- 함수 파라미터 기본값 사용

### 8. 스타일 시스템 제거 (-29줄)
- useUtilityClasses 제거
- composeClasses 제거
- clsx 제거
- classes prop 제거

### 9. 테마 시스템 제거 (-12줄, 스타일 하드코딩)
- memoTheme 래퍼 제거
- 테마 토큰 참조를 하드코딩된 값으로 대체
- theme.palette, theme.typography 등을 구체적 값으로 변경

### 10. overridesResolver 제거 (-16줄)
- 스타일 오버라이드 리졸버 제거
- capitalize 유틸리티 제거

---

## 단순화된 구조

### 파일 구조 (149줄)

```
PaginationItem.js
├─ Imports (9줄)
│   ├─ React
│   ├─ paginationItemClasses (스타일용)
│   ├─ ButtonBase
│   ├─ 4개 아이콘 컴포넌트
│   └─ styled
│
├─ Styled 컴포넌트 (78줄)
│   ├─ PaginationItemEllipsis (19줄) - 생략 부호용 div
│   ├─ PaginationItemPage (48줄) - 클릭 가능한 버튼
│   └─ PaginationItemPageIcon (7줄) - 아이콘 래퍼
│
└─ PaginationItem 컴포넌트 (58줄)
    ├─ Props 구조분해 (9줄)
    ├─ 고정값 설정 (4줄) - size, shape, color, variant
    ├─ ownerState 생성 (10줄)
    ├─ 아이콘 선택 로직 (6줄)
    └─ 조건부 렌더링 (23줄)
        ├─ ellipsis → PaginationItemEllipsis
        └─ 나머지 → PaginationItemPage (+ 아이콘)
```

---

## 핵심 기능

### 1. 컴포넌트 계층

```javascript
PaginationItem
  ├─> type === 'start-ellipsis' || type === 'end-ellipsis'
  │    └─> PaginationItemEllipsis (styled div)
  │         └─> "…" (생략 기호)
  │
  └─> 그 외 type
       └─> PaginationItemPage (styled ButtonBase)
            ├─> {type === 'page' && page}  ← 페이지 번호
            └─> {IconComponent && <PaginationItemPageIcon as={IconComponent} />}
```

### 2. Props

**받는 Props**:
- `page` - 페이지 번호 (type='page'일 때만 표시)
- `type` - 버튼 타입 (기본값: 'page')
  - 'page': 페이지 번호 버튼
  - 'previous': 이전 버튼 (◀)
  - 'next': 다음 버튼 (▶)
  - 'first': 첫 페이지 버튼 (⏮)
  - 'last': 마지막 페이지 버튼 (⏭)
  - 'start-ellipsis': 시작 생략 부호 (…)
  - 'end-ellipsis': 끝 생략 부호 (…)
- `selected` - 선택 상태 (기본값: false)
- `disabled` - 비활성화 (기본값: false)
- `component` - 루트 엘리먼트 교체
- `className` - 추가 클래스
- `...other` - 기타 HTML 속성 (onClick 등)

**고정된 값**:
```javascript
const size = 'medium';
const shape = 'circular';
const color = 'standard';
const variant = 'text';
```

### 3. 아이콘 선택 로직

```javascript
const IconComponent = {
  previous: NavigateBeforeIcon,  // ◀
  next: NavigateNextIcon,         // ▶
  first: FirstPageIcon,           // ⏮
  last: LastPageIcon,             // ⏭
}[type];
```

- type에 따라 적절한 아이콘 컴포넌트 선택
- page, ellipsis 타입에는 아이콘 없음

### 4. 조건부 렌더링

```javascript
return type === 'start-ellipsis' || type === 'end-ellipsis' ? (
  <PaginationItemEllipsis>…</PaginationItemEllipsis>
) : (
  <PaginationItemPage>
    {type === 'page' && page}
    {IconComponent && <PaginationItemPageIcon as={IconComponent} />}
  </PaginationItemPage>
);
```

**ellipsis 타입**:
- 클릭 불가능한 div
- "…" 문자만 표시
- ButtonBase 사용 안 함

**나머지 타입**:
- ButtonBase 기반 클릭 가능
- page 타입: 페이지 번호 표시
- 네비게이션 타입: 아이콘 표시

---

## Styled 컴포넌트

### PaginationItemEllipsis

```javascript
const PaginationItemEllipsis = styled('div', {
  name: 'MuiPaginationItem',
  slot: 'Root',
})({
  fontSize: '0.875rem',
  fontWeight: 400,
  lineHeight: 1.43,
  borderRadius: 16,  // 32 / 2
  textAlign: 'center',
  boxSizing: 'border-box',
  minWidth: 32,
  padding: '0 6px',
  margin: '0 3px',
  color: 'rgba(0, 0, 0, 0.87)',
  height: 'auto',
  [`&.${paginationItemClasses.disabled}`]: {
    opacity: 0.38,
  },
});
```

**특징**:
- 단순 div 엘리먼트
- 클릭 불가능
- disabled 상태만 지원

### PaginationItemPage

```javascript
const PaginationItemPage = styled(ButtonBase, {
  name: 'MuiPaginationItem',
  slot: 'Root',
})({
  // 기본 스타일
  fontSize: '0.875rem',
  fontWeight: 400,
  lineHeight: 1.43,
  borderRadius: 16,
  textAlign: 'center',
  boxSizing: 'border-box',
  minWidth: 32,
  height: 32,
  padding: '0 6px',
  margin: '0 3px',
  color: 'rgba(0, 0, 0, 0.87)',

  // 상태별 스타일
  [`&.${paginationItemClasses.focusVisible}`]: {
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  [`&.${paginationItemClasses.disabled}`]: {
    opacity: 0.38,
  },

  // 전환 효과
  transition: 'color 250ms, background-color 250ms',

  // hover 상태
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    '@media (hover: none)': {
      backgroundColor: 'transparent',
    },
  },

  // selected 상태
  [`&.${paginationItemClasses.selected}`]: {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.12)',
      '@media (hover: none)': {
        backgroundColor: 'rgba(0, 0, 0, 0.08)',
      },
    },
    [`&.${paginationItemClasses.focusVisible}`]: {
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    [`&.${paginationItemClasses.disabled}`]: {
      opacity: 1,
      color: 'rgba(0, 0, 0, 0.26)',
      backgroundColor: 'rgba(0, 0, 0, 0.08)',
    },
  },
});
```

**특징**:
- ButtonBase 상속 (클릭 가능)
- hover, focus, selected, disabled 상태 지원
- 터치 디바이스 대응 (@media hover: none)

### PaginationItemPageIcon

```javascript
const PaginationItemPageIcon = styled('div', {
  name: 'MuiPaginationItem',
  slot: 'Icon',
})({
  fontSize: '1.25rem',  // 20px
  margin: '0 -8px',
});
```

**특징**:
- 아이콘 크기 조정
- 음수 마진으로 버튼 내 아이콘 위치 조정

---

## 하드코딩된 값

### 색상 값

| 원본 테마 토큰 | 하드코딩 값 | 설명 |
|---------------|------------|------|
| `theme.palette.text.primary` | `'rgba(0, 0, 0, 0.87)'` | 기본 텍스트 색상 |
| `theme.palette.action.focus` | `'rgba(0, 0, 0, 0.12)'` | 포커스 배경 |
| `theme.palette.action.hover` | `'rgba(0, 0, 0, 0.04)'` | 호버 배경 |
| `theme.palette.action.selected` | `'rgba(0, 0, 0, 0.08)'` | 선택 배경 |
| `theme.palette.action.disabled` | `'rgba(0, 0, 0, 0.26)'` | 비활성화 텍스트 |
| `theme.palette.action.disabledOpacity` | `0.38` | 비활성화 투명도 |

### 타이포그래피

| 원본 테마 토큰 | 하드코딩 값 |
|---------------|------------|
| `theme.typography.body2` | `fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.43` |
| `theme.typography.pxToRem(20)` | `'1.25rem'` |

### 전환 효과

| 원본 | 하드코딩 |
|------|---------|
| `theme.transitions.create(['color', 'background-color'], { duration: theme.transitions.duration.short })` | `'color 250ms, background-color 250ms'` |

---

## 사용 예시

### 기본 사용

```javascript
// Pagination 컴포넌트 내부에서 자동으로 렌더링됨

// 페이지 번호 버튼
<PaginationItem type="page" page={1} />
<PaginationItem type="page" page={2} selected />
<PaginationItem type="page" page={3} disabled />

// 네비게이션 버튼
<PaginationItem type="first" />
<PaginationItem type="previous" />
<PaginationItem type="next" />
<PaginationItem type="last" />

// 생략 부호
<PaginationItem type="start-ellipsis" />
<PaginationItem type="end-ellipsis" />
```

### 커스터마이징

```javascript
// component prop으로 엘리먼트 교체
<PaginationItem
  type="page"
  page={1}
  component="a"
  href="/page/1"
/>

// 클릭 이벤트 추가
<PaginationItem
  type="page"
  page={1}
  onClick={() => console.log('Page 1 clicked')}
/>

// className으로 스타일 추가
<PaginationItem
  type="page"
  page={1}
  className="custom-page-button"
/>
```

---

## 설계 원칙

### 1. 조건부 렌더링
- type에 따라 완전히 다른 컴포넌트 사용
- ellipsis: 단순 div (클릭 불가)
- 나머지: ButtonBase (클릭 가능)

### 2. 아이콘 매핑
- 객체 리터럴로 type → 아이콘 매핑
- 불필요한 조건문 제거
- 명확한 대응 관계

### 3. 스타일 하드코딩
- 테마 시스템 제거로 코드 단순화
- Material Design 가이드라인 준수
- Light 모드 기준 색상 사용

### 4. 상태 기반 스타일링
- paginationItemClasses로 상태 클래스 적용
- ButtonBase가 제공하는 focusVisible, disabled 활용
- selected는 직접 prop으로 전달

---

## 학습 포인트

### 1. 조건부 렌더링 패턴
```javascript
return condition ? <ComponentA /> : <ComponentB />
```
- type에 따라 다른 컴포넌트 렌더링
- 삼항 연산자로 명확한 분기

### 2. 동적 컴포넌트 선택
```javascript
const IconComponent = {
  previous: NavigateBeforeIcon,
  next: NavigateNextIcon,
}[type];
```
- 객체 리터럴 + 브래킷 표기법
- switch문보다 간결

### 3. Props 전달
```javascript
<PaginationItemPage
  ref={ref}
  ownerState={ownerState}
  component={component}
  disabled={disabled}
  className={className}
  {...other}
>
```
- ref forwarding
- ownerState로 styled 컴포넌트에 상태 전달
- ...other로 나머지 props 전달

### 4. Styled 컴포넌트
```javascript
const StyledComponent = styled(BaseComponent, {
  name: 'MuiComponentName',
  slot: 'SlotName',
})({
  // 스타일 객체
});
```
- BaseComponent 상속
- name/slot으로 테마 오버라이드 지원
- CSS-in-JS 스타일 정의

---

## 원본과의 차이점

| 항목 | 원본 (539줄) | 단순화 (149줄) |
|------|-------------|---------------|
| **Props 수** | 13개 | 6개 (+ 4개 고정) |
| **size** | 3가지 선택 | 'medium' 고정 |
| **shape** | 2가지 선택 | 'circular' 고정 |
| **color** | 다중 팔레트 | 'standard' 고정 |
| **variant** | 2가지 선택 | 'text' 고정 |
| **Slot 시스템** | 4개 아이콘 교체 가능 | 고정된 아이콘 |
| **RTL 지원** | 자동 방향 전환 | LTR만 |
| **테마 통합** | 완전 통합 | 하드코딩 |
| **클래스 시스템** | useUtilityClasses | 제거 |
| **PropTypes** | 123줄 검증 | 제거 |
| **스타일 오버라이드** | overridesResolver | 제거 |

---

## 핵심 기능 유지

단순화했지만 **필수 기능은 모두 유지**:

✅ **7가지 type 지원** - page, previous, next, first, last, start-ellipsis, end-ellipsis
✅ **상태 표시** - selected, disabled
✅ **아이콘 렌더링** - 네비게이션 버튼에 적절한 아이콘
✅ **클릭 이벤트** - ButtonBase의 onClick 동작
✅ **접근성** - ButtonBase가 제공하는 ARIA 속성
✅ **Styled 컴포넌트** - CSS-in-JS 스타일링
✅ **Ref forwarding** - React.forwardRef

---

## 결론

PaginationItem 단순화는 **핵심 페이지네이션 로직에 집중**하도록 했습니다:

1. **type 기반 조건부 렌더링** - ellipsis vs 버튼
2. **아이콘 매핑** - type에 따른 아이콘 선택
3. **상태 관리** - selected, disabled
4. **스타일링** - 하드코딩된 Material Design 스타일

학습자는 이제 **539줄 대신 149줄**만 읽으면 PaginationItem의 동작 원리를 이해할 수 있습니다.
