# Pagination 컴포넌트

> Material-UI의 Pagination 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

Pagination은 **페이지네이션 UI를 렌더링하는 컨테이너 컴포넌트**입니다.

### 핵심 기능
1. **페이지 아이템 목록 생성** - usePagination 훅으로 아이템 목록 생성
2. **아이템 렌더링** - PaginationItem 컴포넌트로 각 아이템 렌더링
3. **페이지 제어** - boundaryCount, siblingCount로 표시할 페이지 제어
4. **버튼 표시/숨김** - showFirstButton, hideNextButton 등
5. **스타일 변형** - size, shape, color, variant 전달
6. **접근성** - getItemAriaLabel로 스크린 리더 지원

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/Pagination/Pagination.js (257줄)

Pagination
  └─> PaginationRoot (styled nav)
       └─> PaginationUl (styled ul)
            └─> items.map((item) => (
                 <li>
                   {renderItem({
                     ...item,
                     color,
                     aria-label,
                     shape,
                     size,
                     variant,
                   })}
                 </li>
               ))
```

### 2. usePagination 훅

```javascript
// 위치: packages/mui-material/src/usePagination/usePagination.js (147줄)

const { items } = usePagination({ ...props, componentName: 'Pagination' });

// items 예시:
// [
//   { type: 'first', page: 1, selected: false, disabled: false },
//   { type: 'previous', page: 0, selected: false, disabled: true },
//   { type: 'page', page: 1, selected: true, disabled: false },
//   { type: 'page', page: 2, selected: false, disabled: false },
//   { type: 'start-ellipsis', page: null, selected: false, disabled: false },
//   { type: 'page', page: 10, selected: false, disabled: false },
//   { type: 'next', page: 2, selected: false, disabled: false },
//   { type: 'last', page: 10, selected: false, disabled: false },
// ]
```

**특징**:
- useControlled로 page 상태 관리 (제어/비제어)
- boundaryCount: 시작/끝에 항상 표시할 페이지 수
- siblingCount: 현재 페이지 앞뒤로 표시할 페이지 수
- range 함수로 페이지 번호 배열 생성
- itemList를 items로 변환 (onClick, selected, disabled 추가)

### 3. Styled 컴포넌트 (2개)

#### PaginationRoot
```javascript
const PaginationRoot = styled('nav', {
  name: 'MuiPagination',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;
    return [styles.root, styles[ownerState.variant]];
  },
})({});
```

**특징**:
- nav 엘리먼트
- 빈 스타일 객체 (스타일링 없음)
- overridesResolver로 테마 오버라이드 지원

#### PaginationUl
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
- flex 레이아웃
- 기본 list 스타일 제거

### 4. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `count` | number | 1 | 총 페이지 수 |
| `page` | number | - | 현재 페이지 (제어 컴포넌트) |
| `defaultPage` | number | 1 | 기본 페이지 (비제어 컴포넌트) |
| `onChange` | function | - | 페이지 변경 콜백 |
| `disabled` | boolean | false | 전체 비활성화 |
| `boundaryCount` | number | 1 | 시작/끝에 항상 표시할 페이지 수 |
| `siblingCount` | number | 1 | 현재 페이지 앞뒤로 표시할 페이지 수 |
| `showFirstButton` | boolean | false | 첫 페이지 버튼 표시 |
| `showLastButton` | boolean | false | 마지막 페이지 버튼 표시 |
| `hideNextButton` | boolean | false | 다음 버튼 숨김 |
| `hidePrevButton` | boolean | false | 이전 버튼 숨김 |
| `getItemAriaLabel` | function | defaultGetAriaLabel | 접근성 라벨 함수 |
| `renderItem` | function | (item) => <PaginationItem {...item} /> | 아이템 렌더링 함수 |
| `size` | enum \| string | 'medium' | 크기 (PaginationItem에 전달) |
| `shape` | enum | 'circular' | 모양 (PaginationItem에 전달) |
| `color` | enum \| string | 'standard' | 색상 (PaginationItem에 전달) |
| `variant` | enum \| string | 'text' | 스타일 (PaginationItem에 전달) |
| `classes` | object | - | 클래스 오버라이드 |
| `className` | string | - | 추가 클래스 |
| `sx` | object | - | 시스템 스타일 |

### 5. defaultGetAriaLabel 함수

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

### 6. 렌더링 로직

```javascript
<PaginationRoot
  aria-label="pagination navigation"
  className={clsx(classes.root, className)}
  ownerState={ownerState}
  ref={ref}
  {...other}
>
  <PaginationUl className={classes.ul} ownerState={ownerState}>
    {items.map((item, index) => (
      <li key={index}>
        {renderItem({
          ...item,
          color,
          'aria-label': getItemAriaLabel(item.type, item.page, item.selected),
          shape,
          size,
          variant,
        })}
      </li>
    ))}
  </PaginationUl>
</PaginationRoot>
```

**특징**:
- items 배열을 map으로 렌더링
- 각 아이템에 color, shape, size, variant 전달
- getItemAriaLabel로 접근성 라벨 생성
- renderItem 함수로 커스터마이징 가능

### 7. 스타일 시스템

#### useUtilityClasses
```javascript
const useUtilityClasses = (ownerState) => {
  const { classes, variant } = ownerState;

  const slots = {
    root: ['root', variant],
    ul: ['ul'],
  };

  return composeClasses(slots, getPaginationUtilityClass, classes);
};
```

**특징**:
- variant에 따른 클래스 생성
- composeClasses로 클래스 병합

---

## 설계 패턴

1. **Container 패턴** (렌더링만 담당)
   - 페이지네이션 로직은 usePagination 훅에 위임
   - Pagination은 items 렌더링만 담당
   - 관심사 분리 (Separation of Concerns)

2. **Render Props 패턴** (renderItem)
   - 아이템 렌더링을 커스터마이징 가능
   - 기본값: `(item) => <PaginationItem {...item} />`

3. **Controlled vs Uncontrolled**
   - page prop 제공: 제어 컴포넌트
   - defaultPage만 제공: 비제어 컴포넌트
   - useControlled 훅으로 구현

4. **Composition** (조합)
   - PaginationRoot, PaginationUl, PaginationItem 조합
   - 각 컴포넌트는 독립적으로 스타일링 가능

5. **Accessibility First** (접근성 우선)
   - aria-label="pagination navigation"
   - 각 아이템에 적절한 aria-label
   - getItemAriaLabel로 커스터마이징 가능

---

## 복잡도의 이유

Pagination은 **257줄**이며, 복잡한 이유는:

1. **PropTypes (127줄)**
   - 128-254줄: 모든 props에 대한 런타임 타입 검증
   - 실제 로직보다 메타데이터가 많음

2. **다양한 변형 옵션 (4개 props)**
   - size: 3가지 (small/medium/large)
   - shape: 2가지 (circular/rounded)
   - color: 3가지 기본 + 무한 커스텀
   - variant: 2가지 (text/outlined)
   - PaginationItem에 전달하는 용도

3. **renderItem prop**
   - 함수 prop으로 복잡도 증가
   - 커스터마이징 가능하지만 사용 빈도 낮음

4. **useDefaultProps**
   - 테마에서 기본 props 가져오기
   - props 병합 로직

5. **스타일 시스템**
   - useUtilityClasses (약 10줄)
   - composeClasses 호출
   - clsx 사용

6. **overridesResolver**
   - 테마 오버라이드를 위한 리졸버
   - PaginationRoot에 포함

---

## 예시 사용법

**기본 사용**:
```javascript
// 비제어 컴포넌트
<Pagination count={10} />

// 제어 컴포넌트
const [page, setPage] = useState(1);
<Pagination count={10} page={page} onChange={(e, p) => setPage(p)} />
```

**페이지 제어**:
```javascript
// boundaryCount: 시작/끝에 2개씩 표시
// siblingCount: 현재 페이지 앞뒤로 2개씩 표시
<Pagination count={10} boundaryCount={2} siblingCount={2} />

// 결과 (page=5):
// [1] [2] ... [3] [4] [5] [6] [7] ... [9] [10]
```

**버튼 표시/숨김**:
```javascript
// 첫/마지막 페이지 버튼 표시
<Pagination count={10} showFirstButton showLastButton />

// 이전/다음 버튼 숨김
<Pagination count={10} hidePrevButton hideNextButton />
```

**스타일 변형**:
```javascript
// 크기, 모양, 색상, 스타일 변경
<Pagination
  count={10}
  size="large"
  shape="rounded"
  color="primary"
  variant="outlined"
/>
```

**커스터마이징**:
```javascript
// renderItem으로 커스텀 렌더링
<Pagination
  count={10}
  renderItem={(item) => (
    <PaginationItem
      {...item}
      components={{
        previous: CustomPreviousIcon,
        next: CustomNextIcon,
      }}
    />
  )}
/>

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

**비활성화**:
```javascript
<Pagination count={10} disabled />
```

---

## usePagination 훅 상세

### Props
- `boundaryCount`: 시작/끝에 항상 표시할 페이지 수
- `siblingCount`: 현재 페이지 앞뒤로 표시할 페이지 수
- `count`: 총 페이지 수
- `page`: 현재 페이지 (제어)
- `defaultPage`: 기본 페이지 (비제어)
- `onChange`: 페이지 변경 콜백
- `disabled`: 비활성화
- `showFirstButton`, `showLastButton`: 첫/마지막 버튼 표시
- `hideNextButton`, `hidePrevButton`: 이전/다음 버튼 숨김

### 로직
1. **range 함수**: start ~ end 범위의 숫자 배열 생성
2. **startPages**: 시작 부분 페이지 (1 ~ boundaryCount)
3. **endPages**: 끝 부분 페이지 (count - boundaryCount + 1 ~ count)
4. **siblingsStart/End**: 현재 페이지 주변 페이지 범위
5. **itemList**: 모든 아이템 타입의 배열 (first, previous, 페이지, ellipsis, next, last)
6. **items**: itemList를 PaginationItem props 객체로 변환

### 예시 (count=10, page=5, boundaryCount=1, siblingCount=1)
```javascript
// itemList
['first', 'previous', 1, 'start-ellipsis', 4, 5, 6, 'end-ellipsis', 10, 'next', 'last']

// items
[
  { type: 'first', page: 1, selected: false, disabled: false },
  { type: 'previous', page: 4, selected: false, disabled: false },
  { type: 'page', page: 1, selected: false, disabled: false },
  { type: 'start-ellipsis', page: null, selected: false, disabled: false },
  { type: 'page', page: 4, selected: false, disabled: false },
  { type: 'page', page: 5, selected: true, disabled: false },
  { type: 'page', page: 6, selected: false, disabled: false },
  { type: 'end-ellipsis', page: null, selected: false, disabled: false },
  { type: 'page', page: 10, selected: false, disabled: false },
  { type: 'next', page: 6, selected: false, disabled: false },
  { type: 'last', page: 10, selected: false, disabled: false },
]
```

---

## Pagination vs PaginationItem

| 항목 | Pagination | PaginationItem |
|------|-----------|---------------|
| **역할** | 컨테이너 (렌더링 담당) | 개별 버튼 (스타일/동작 담당) |
| **로직** | usePagination 훅 사용 | type에 따른 조건부 렌더링 |
| **스타일** | 거의 없음 (ul 레이아웃만) | 버튼 스타일, hover, selected 등 |
| **복잡도** | 257줄 (PropTypes 127줄) | 539줄 → 149줄 (단순화 후) |
| **Props** | 13개 핵심 + 4개 스타일 | 6개 핵심 + 4개 스타일 (단순화 전) |

---

## 단순화 전략

Pagination은 PaginationItem보다 단순하므로 **6단계 단순화**:

1. **PropTypes 제거** (127줄) - 가장 큰 감소
2. **size, shape, color, variant props 제거** - PaginationItem에서 고정했으므로 불필요
3. **renderItem prop 제거** - 기본 렌더링으로 고정
4. **useDefaultProps 제거** - 파라미터 기본값으로 대체
5. **스타일 시스템 제거** - useUtilityClasses, composeClasses, clsx
6. **overridesResolver 제거** - 테마 오버라이드 시스템

**단순화 후 예상 줄 수**: 약 100줄 (60% 감소)

**유지할 핵심 기능**:
- usePagination 훅 사용
- PaginationItem 렌더링
- boundaryCount, siblingCount 등 페이지 제어
- showFirstButton, hideNextButton 등 버튼 표시/숨김
- getItemAriaLabel 접근성

---

## 결론

Pagination은 **페이지네이션 UI의 컨테이너**로, 핵심 로직은 usePagination 훅에 위임하고 렌더링만 담당합니다. 단순화를 통해 학습에 불필요한 PropTypes, 스타일 변형, renderItem 등을 제거하여 핵심 페이지네이션 로직에 집중할 수 있습니다.
