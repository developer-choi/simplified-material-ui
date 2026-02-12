# PaginationItem 단순화 순서

> 원본 539줄 → 단순화 149줄 (390줄 제거, 72% 감소)

---

## 단순화 순서 (10단계)

### ✅ 1단계: PropTypes 제거 (-125줄)
**커밋**: `[PaginationItem 단순화 1/10] PropTypes 제거`
- 런타임 타입 검증 시스템 제거
- PropTypes 정의 전체 삭제 (413-536줄)
- PropTypes import 제거

### ✅ 2단계: Slot 시스템 제거 (-45줄)
**커밋**: `[PaginationItem 단순화 2/10] Slot 시스템 제거`
- `slots`, `slotProps`, `components` props 제거
- useSlot 훅 호출 4회 제거
- externalForwardedProps 객체 제거
- 아이콘을 직접 참조하도록 변경

### ✅ 3단계: size prop 제거 (-53줄)
**커밋**: `[PaginationItem 단순화 3/10] size prop 제거`
- 'medium'으로 고정
- size 관련 variants 제거 (3개 styled 컴포넌트)
- `size${capitalize(size)}` 클래스 제거

### ✅ 4단계: shape prop 제거 (-8줄)
**커밋**: `[PaginationItem 단순화 4/10] shape prop 제거`
- 'circular'로 고정
- shape 관련 variants 제거
- overridesResolver에서 shape 참조 제거
- useUtilityClasses에서 shape 제거

### ✅ 5단계: color와 variant prop 제거 (-89줄)
**커밋**: `[PaginationItem 단순화 5/10] color와 variant prop 제거`
- color: 'standard'로 고정
- variant: 'text'로 고정
- 동적 팔레트 스타일 생성 로직 제거 (Object.entries 2개)
- createSimplePaletteValueFilter import 제거
- overridesResolver에서 color/variant 참조 제거
- useUtilityClasses에서 color/variant 제거

### ✅ 6단계: RTL 지원 제거 (-11줄)
**커밋**: `[PaginationItem 단순화 6/10] RTL 지원 제거`
- useRtl 훅 제거
- rtlAwareType 변환 로직 제거
- IconComponent에서 type 직접 사용

### ✅ 7단계: useDefaultProps 제거 (-2줄)
**커밋**: `[PaginationItem 단순화 7/10] useDefaultProps 제거`
- useDefaultProps 호출 제거
- inProps 직접 사용
- ownerState에서 props → inProps

### ✅ 8단계: 스타일 시스템 제거 (-29줄)
**커밋**: `[PaginationItem 단순화 8/10] 스타일 시스템 제거`
- useUtilityClasses 함수 제거
- composeClasses import 제거
- getPaginationItemUtilityClass import 제거
- clsx import 및 사용 제거
- className 직접 사용

### ✅ 9단계: 테마 시스템 제거 (-12줄, 스타일 하드코딩)
**커밋**: `[PaginationItem 단순화 9/10] 테마 시스템 제거`
- memoTheme 래퍼 제거 (3곳)
- theme.typography.body2 → fontSize, fontWeight, lineHeight
- theme.palette 토큰 → rgba 값
- theme.transitions.create → 'color 250ms, background-color 250ms'

### ✅ 10단계: overridesResolver 제거 (-16줄)
**커밋**: `[PaginationItem 단순화 10/10] overridesResolver 제거`
- overridesResolver 함수 제거
- styled 컴포넌트에서 overridesResolver 사용 제거 (3곳)
- capitalize import 제거

---

## 단순화 전략

### 우선순위

1. **PropTypes 우선** - 가장 쉬운 단계, 즉각적인 코드 감소
2. **기능 제거** - Slot, size, shape, color, variant 등 변형 옵션
3. **시스템 제거** - RTL, useDefaultProps, 스타일, 테마 시스템 순차적 제거
4. **간소화** - 마지막에 overridesResolver 제거

### 핵심 로직 유지

✅ type에 따른 조건부 렌더링 (page vs ellipsis)
✅ 아이콘 표시 (previous, next, first, last)
✅ selected 상태 표시
✅ disabled 상태 처리
✅ ButtonBase 기반 클릭 가능

---

## 최종 결과

### 파일 구조 (149줄)

```
├─ Imports (9줄)
├─ PaginationItemEllipsis (19줄)
├─ PaginationItemPage (48줄)
├─ PaginationItemPageIcon (7줄)
└─ PaginationItem 컴포넌트 (58줄)
```

### Props

**유지된 Props**:
- `page` - 페이지 번호
- `type` - 버튼 타입 (7가지)
- `selected` - 선택 상태
- `disabled` - 비활성화
- `component` - 루트 엘리먼트 교체
- `className` - 추가 클래스

**고정된 값**:
- size: 'medium'
- shape: 'circular'
- color: 'standard'
- variant: 'text'

---

## 문서

1. **PaginationItem-original.md** - 원본 구조 분석 (353줄)
2. **PaginationItem-simplified.md** - 단순화 구조 분석 (484줄)
3. **PaginationItem-simplification-order.md** - 이 문서 (단순화 순서)

---

## 커밋 히스토리

```
a35237b1 docs: PaginationItem 단순화 분석 문서 작성
2b1c4b53 [PaginationItem 단순화 10/10] overridesResolver 제거
7409f474 [PaginationItem 단순화 9/10] 테마 시스템 제거
345622b0 [PaginationItem 단순화 8/10] 스타일 시스템 제거
50a01da2 [PaginationItem 단순화 7/10] useDefaultProps 제거
d4aab4e9 [PaginationItem 단순화 6/10] RTL 지원 제거
4128b7d2 [PaginationItem 단순화 5/10] color와 variant prop 제거
4138b33b [PaginationItem 단순화 4/10] shape prop 제거
a62c28ad [PaginationItem 단순화 3/10] size prop 제거
31f4653f [PaginationItem 단순화 2/10] Slot 시스템 제거
02a915d6 [PaginationItem 단순화 1/10] PropTypes 제거
70e7e702 docs: PaginationItem 원본 분석 문서 작성
```
