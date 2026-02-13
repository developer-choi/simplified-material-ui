# Pagination 컴포넌트 (단순화 버전)

> 단순화된 Pagination 컴포넌트 구조 분석

---

## 개요

**원본**: 257줄 → **단순화**: 88줄 (66% 감소, 169줄 제거)

Pagination은 페이지네이션 UI를 렌더링하는 컨테이너 컴포넌트입니다. 단순화 과정을 통해 학습에 불필요한 PropTypes, 스타일 변형 props, renderItem 등을 제거하고, 핵심 페이지네이션 로직에 집중했습니다.

---

## 제거된 기능 (6단계)

### 1. PropTypes 제거 (-132줄)
- 런타임 타입 검증 시스템 제거
- PropTypes, integerPropType import 제거
- 학습 목적에서 불필요한 메타데이터

### 2. size, shape, color, variant props 제거 (-14줄)
- PaginationItem에서 이미 고정값으로 설정
- Pagination에서 전달할 필요 없음
- ownerState 정리
- useUtilityClasses에서 variant 제거
- overridesResolver에서 variant 제거

### 3. renderItem prop 제거 (-2줄)
- 기본 PaginationItem 렌더링으로 고정
- 커스터마이징 옵션 제거

### 4. useDefaultProps 제거 (-2줄)
- 테마에서 기본 props 가져오는 시스템 제거
- 함수 파라미터 기본값 사용

### 5. 스타일 시스템 제거 (-16줄)
- useUtilityClasses 함수 제거
- composeClasses, clsx, getPaginationUtilityClass import 제거
- className 직접 사용

### 6. overridesResolver 제거 (-3줄)
- 스타일 오버라이드 리졸버 제거
- PaginationRoot에서 제거

---

## 단순화된 구조

### 파일 구조 (88줄)

```
Pagination.js
├─ Imports (5줄)
│   ├─ React
│   ├─ usePagination
│   ├─ PaginationItem
│   └─ styled
│
├─ Styled 컴포넌트 (18줄)
│   ├─ PaginationRoot (4줄) - nav 엘리먼트
│   └─ PaginationUl (12줄) - ul 엘리먼트 (flex 레이아웃)
│
├─ defaultGetAriaLabel 함수 (6줄)
│   └─ type별 접근성 라벨 생성
│
└─ Pagination 컴포넌트 (56줄)
    ├─ Props 구조분해 (16줄)
    ├─ usePagination 호출 (1줄)
    ├─ ownerState 생성 (13줄)
    └─ 렌더링 (19줄)
        └─ items.map → PaginationItem
```

---

## 핵심 기능

### 1. 컴포넌트 계층

```javascript
Pagination
  └─> PaginationRoot (styled nav)
       └─> PaginationUl (styled ul)
            └─> items.map((item) => (
                 <li>
                   <PaginationItem {...item} aria-label={...} />
                 </li>
               ))
```

### 2. Props

**받는 Props (핵심 기능)**:
- `count` - 총 페이지 수 (기본값: 1)
- `page` - 현재 페이지 (제어 컴포넌트)
- `defaultPage` - 기본 페이지 (비제어 컴포넌트, 기본값: 1)
- `onChange` - 페이지 변경 콜백
- `disabled` - 전체 비활성화 (기본값: false)
- `boundaryCount` - 시작/끝에 항상 표시할 페이지 수 (기본값: 1)
- `siblingCount` - 현재 페이지 앞뒤로 표시할 페이지 수 (기본값: 1)
- `showFirstButton` - 첫 페이지 버튼 표시 (기본값: false)
- `showLastButton` - 마지막 페이지 버튼 표시 (기본값: false)
- `hideNextButton` - 다음 버튼 숨김 (기본값: false)
- `hidePrevButton` - 이전 버튼 숨김 (기본값: false)
- `getItemAriaLabel` - 접근성 라벨 함수 (기본값: defaultGetAriaLabel)
- `className` - 추가 클래스
- 기타 HTML 속성

**제거된 Props**:
- `size` - PaginationItem에서 고정
- `shape` - PaginationItem에서 고정
- `color` - PaginationItem에서 고정
- `variant` - PaginationItem에서 고정
- `renderItem` - 기본 렌더링으로 고정
- `classes` - 스타일 시스템 제거

### 3. usePagination 훅

```javascript
const { items } = usePagination({ ...inProps, componentName: 'Pagination' });

// items 예시 (count=10, page=5, boundaryCount=1, siblingCount=1):
// [
//   { type: 'first', page: 1, selected: false, disabled: false },
//   { type: 'previous', page: 4, selected: false, disabled: false },
//   { type: 'page', page: 1, selected: false, disabled: false },
//   { type: 'start-ellipsis', page: null, selected: false, disabled: false },
//   { type: 'page', page: 4, selected: false, disabled: false },
//   { type: 'page', page: 5, selected: true, disabled: false },
//   { type: 'page', page: 6, selected: false, disabled: false },
//   { type: 'end-ellipsis', page: null, selected: false, disabled: false },
//   { type: 'page', page: 10, selected: false, disabled: false },
//   { type: 'next', page: 6, selected: false, disabled: false },
//   { type: 'last', page: 10, selected: false, disabled: false },
// ]
```

**특징**:
- **핵심 로직 유지**: 이 훅은 단순화하지 않음
- useControlled로 page 상태 관리 (제어/비제어)
- boundaryCount, siblingCount로 페이지 표시 제어
- range 함수로 페이지 번호 배열 생성
- itemList를 items로 변환 (onClick, selected, disabled 추가)

### 4. defaultGetAriaLabel 함수

```javascript
function defaultGetAriaLabel(type, page, selected) {
  if (type === 'page') {
    return `${selected ? '' : 'Go to '}page ${page}`;
  }
  return `Go to ${type} page`;
}
```

**특징**:
- type별 접근성 라벨 생성
- page 타입: "page 1" (selected) 또는 "Go to page 1"
- 기타 타입: "Go to previous page" 등

---

## Styled 컴포넌트

### PaginationRoot

```javascript
const PaginationRoot = styled('nav', {
  name: 'MuiPagination',
  slot: 'Root',
})({});
```

**특징**:
- nav 엘리먼트
- 빈 스타일 객체 (스타일링 없음)
- overridesResolver 제거

### PaginationUl

```javascript
const PaginationUl = styled('ul', {
  name: 'MuiPagination',
  slot: 'Ul',
})({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  padding: 0,
  margin: 0,
  listStyle: 'none',
});
```

**특징**:
- ul 엘리먼트
- flex 레이아웃으로 아이템 배치
- 기본 list 스타일 제거

---

## 렌더링 로직

```javascript
return (
  <PaginationRoot
    aria-label="pagination navigation"
    className={className}
    ownerState={ownerState}
    ref={ref}
    {...other}
  >
    <PaginationUl ownerState={ownerState}>
      {items.map((item, index) => (
        <li key={index}>
          <PaginationItem
            {...item}
            aria-label={getItemAriaLabel(item.type, item.page, item.selected)}
          />
        </li>
      ))}
    </PaginationUl>
  </PaginationRoot>
);
```

**특징**:
- items 배열을 map으로 렌더링
- 각 아이템을 PaginationItem으로 렌더링
- getItemAriaLabel로 접근성 라벨 생성
- className 직접 사용 (clsx 제거)

---

## 사용 예시

### 기본 사용

```javascript
// 비제어 컴포넌트
<Pagination count={10} />

// 제어 컴포넌트
const [page, setPage] = useState(1);
<Pagination
  count={10}
  page={page}
  onChange={(e, p) => setPage(p)}
/>
```

### 페이지 제어

```javascript
// boundaryCount: 시작/끝에 2개씩 표시
// siblingCount: 현재 페이지 앞뒤로 2개씩 표시
<Pagination count={10} boundaryCount={2} siblingCount={2} />

// 결과 (page=5):
// [1] [2] ... [3] [4] [5] [6] [7] ... [9] [10]
```

### 버튼 표시/숨김

```javascript
// 첫/마지막 페이지 버튼 표시
<Pagination count={10} showFirstButton showLastButton />

// 이전/다음 버튼 숨김
<Pagination count={10} hidePrevButton hideNextButton />
```

### 비활성화

```javascript
<Pagination count={10} disabled />
```

### 접근성 커스터마이징

```javascript
// getItemAriaLabel로 다국어 지원
<Pagination
  count={10}
  getItemAriaLabel={(type, page, selected) => {
    if (type === 'page') {
      return `${selected ? '' : '로 이동: '}페이지 ${page}`;
    }
    return `${type} 페이지로 이동`;
  }}
/>
```

---

## 설계 원칙

### 1. Container 패턴
- 페이지네이션 로직은 usePagination 훅에 위임
- Pagination은 items 렌더링만 담당
- 관심사 분리 (Separation of Concerns)

### 2. Controlled vs Uncontrolled
- page prop 제공: 제어 컴포넌트
- defaultPage만 제공: 비제어 컴포넌트
- usePagination 내부의 useControlled 훅으로 구현

### 3. Composition (조합)
- PaginationRoot, PaginationUl, PaginationItem 조합
- 각 컴포넌트는 독립적으로 동작

### 4. Accessibility First (접근성 우선)
- aria-label="pagination navigation"
- 각 아이템에 적절한 aria-label
- getItemAriaLabel로 커스터마이징 가능

---

## 학습 포인트

### 1. Container 컴포넌트 패턴
```javascript
// 로직: usePagination 훅
const { items } = usePagination({ ...inProps, componentName: 'Pagination' });

// 렌더링: Pagination 컴포넌트
return (
  <PaginationRoot>
    {items.map((item) => <PaginationItem {...item} />)}
  </PaginationRoot>
);
```
- 로직과 렌더링 분리
- 재사용 가능한 훅

### 2. 제어/비제어 컴포넌트
```javascript
// 비제어: defaultPage 사용
<Pagination count={10} defaultPage={1} />

// 제어: page와 onChange 사용
<Pagination count={10} page={page} onChange={handleChange} />
```
- 유연한 사용 방식
- useControlled 훅으로 구현

### 3. 배열 렌더링
```javascript
{items.map((item, index) => (
  <li key={index}>
    <PaginationItem {...item} />
  </li>
))}
```
- map으로 동적 리스트 생성
- key prop 사용
- spread operator로 props 전달

### 4. defaultGetAriaLabel 패턴
```javascript
function defaultGetAriaLabel(type, page, selected) {
  if (type === 'page') {
    return `${selected ? '' : 'Go to '}page ${page}`;
  }
  return `Go to ${type} page`;
}
```
- 기본 함수 제공
- prop으로 커스터마이징 가능
- 접근성 향상

---

## 원본과의 차이점

| 항목 | 원본 (257줄) | 단순화 (88줄) |
|------|-------------|---------------|
| **Props 수** | 16개 | 12개 (4개 제거) |
| **size** | 3가지 선택 | 제거 |
| **shape** | 2가지 선택 | 제거 |
| **color** | 다중 선택 | 제거 |
| **variant** | 2가지 선택 | 제거 |
| **renderItem** | 커스터마이징 가능 | 고정 |
| **PropTypes** | 127줄 검증 | 제거 |
| **useDefaultProps** | 테마 통합 | 제거 |
| **스타일 시스템** | useUtilityClasses | 제거 |
| **overridesResolver** | 테마 오버라이드 | 제거 |

---

## 핵심 기능 유지

단순화했지만 **필수 기능은 모두 유지**:

✅ **usePagination 훅** - 페이지 아이템 목록 생성
✅ **PaginationItem 렌더링** - 각 아이템 표시
✅ **페이지 제어** - boundaryCount, siblingCount
✅ **버튼 표시/숨김** - showFirstButton, hideNextButton 등
✅ **제어/비제어 모드** - page prop 유무
✅ **접근성** - getItemAriaLabel
✅ **비활성화** - disabled prop
✅ **Styled 컴포넌트** - CSS-in-JS 스타일링
✅ **Ref forwarding** - React.forwardRef

---

## boundaryCount와 siblingCount 설명

### boundaryCount (기본값: 1)
- 시작과 끝에 **항상 표시**할 페이지 수
- 예: boundaryCount=2 → 시작에 [1][2], 끝에 [9][10]

### siblingCount (기본값: 1)
- 현재 페이지 **앞뒤로** 표시할 페이지 수
- 예: siblingCount=2, page=5 → [3][4][5][6][7]

### 예시 (count=10)

**기본 (boundaryCount=1, siblingCount=1, page=5)**:
```
[1] ... [4] [5] [6] ... [10]
```

**boundaryCount=2, siblingCount=1, page=5**:
```
[1] [2] ... [4] [5] [6] ... [9] [10]
```

**boundaryCount=1, siblingCount=2, page=5**:
```
[1] ... [3] [4] [5] [6] [7] ... [10]
```

**boundaryCount=2, siblingCount=2, page=5**:
```
[1] [2] [3] [4] [5] [6] [7] [8] [9] [10]
```

---

## usePagination 훅의 역할

usePagination은 **페이지네이션 로직의 핵심**을 담당합니다:

### 입력
- boundaryCount, siblingCount
- count (총 페이지), page (현재 페이지)
- showFirstButton, showLastButton
- hideNextButton, hidePrevButton
- disabled, onChange

### 출력
- items 배열: 각 아이템의 type, page, selected, disabled, onClick 포함

### 로직
1. **range 함수**: start ~ end 범위의 숫자 배열 생성
2. **startPages**: 시작 부분 페이지 계산
3. **endPages**: 끝 부분 페이지 계산
4. **siblingsStart/End**: 현재 페이지 주변 페이지 범위 계산
5. **itemList**: 모든 아이템 타입의 배열 생성
6. **items**: itemList를 PaginationItem props 객체로 변환

### 왜 단순화하지 않았나?
- **핵심 로직**: 페이지네이션의 본질
- **복잡한 계산**: startPages, endPages, siblings 계산
- **재사용 가능**: 다른 곳에서도 사용 가능
- **이미 잘 설계됨**: 로직과 렌더링 분리

---

## Pagination vs PaginationItem

| 항목 | Pagination | PaginationItem |
|------|-----------|---------------|
| **역할** | 컨테이너 (렌더링 담당) | 개별 버튼 (스타일/동작 담당) |
| **로직** | usePagination 훅 사용 | type에 따른 조건부 렌더링 |
| **스타일** | 거의 없음 (ul 레이아웃만) | 버튼 스타일, hover, selected 등 |
| **복잡도** | 257줄 → 88줄 (66% 감소) | 539줄 → 149줄 (72% 감소) |
| **Props** | 12개 핵심 | 6개 핵심 |

---

## 결론

Pagination 단순화는 **컨테이너 역할에 집중**하도록 했습니다:

1. **usePagination 훅 사용** - 페이지 아이템 목록 생성
2. **PaginationItem 렌더링** - items.map으로 렌더링
3. **페이지 제어 옵션** - boundaryCount, siblingCount
4. **버튼 표시/숨김** - showFirstButton, hideNextButton 등
5. **접근성** - getItemAriaLabel

학습자는 이제 **257줄 대신 88줄**만 읽으면 Pagination의 동작 원리를 이해할 수 있습니다. 핵심 로직은 usePagination 훅에 있으며, Pagination은 단순히 렌더링만 담당합니다.
