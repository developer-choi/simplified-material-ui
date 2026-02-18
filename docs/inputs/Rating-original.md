# Rating 컴포넌트

> Rating 컴포넌트 원본 구조 빠른 파악

**⚠️ 이 문서의 목적**: 간소화 작업 **전에** 원본 코드를 빠르게 이해하기 위한 요약 문서입니다.

---

## 무슨 기능을 하는가?

Rating은 **별점 입력/표시 컴포넌트**입니다.

### 핵심 기능
1. **hover 강조** - 마우스 호버 시 해당 별까지 하이라이트
2. **precision 소수점** - `precision={0.5}` 지원 (반 별)
3. **controlled/uncontrolled** - `value`/`defaultValue` 두 방식 모두 지원
4. **readOnly/disabled** - 표시 전용 / 비활성화
5. **접근성** - radio input으로 구현 (스크린 리더, 키보드 접근성)
6. **isFocusVisible** - 키보드 Tab 포커스 시 포커스 링 표시

---

## 주요 코드 구조

### 파일 위치 및 크기

```
packages/mui-material/src/Rating/Rating.js (866줄)
```

### 컴포넌트 계층

```
Rating (main)
  └─> RootSlot (RatingRoot = styled('span'))
       ├─> [Array(max)].map → 각 별점 아이템
       │     ├─> (precision < 1) → DecimalSlot (RatingDecimal)
       │     │     └─> RatingItem × (1/precision)
       │     └─> (precision >= 1) → RatingItem
       │           ├─> LabelSlot (RatingLabel = <label>)
       │           │     ├─> IconSlot (RatingIcon = <span>)
       │           │     │     └─> Star 또는 StarBorder
       │           │     └─> <span visuallyHidden>라벨텍스트</span>
       │           └─> <input type="radio" visuallyHidden />
       └─> (emptyValue) → LabelSlot
             └─> <input type="radio" value="" />  ← "0점" 선택용
```

### 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `value` | number | - | (controlled) 현재 값 |
| `defaultValue` | number | `null` | (uncontrolled) 초기값 |
| `max` | number | `5` | 최대 별점 수 |
| `precision` | number | `1` | 최소 단위 (0.5 = 반 별) |
| `readOnly` | bool | `false` | 클릭/호버 불가 |
| `disabled` | bool | `false` | 비활성화 |
| `size` | string | `'medium'` | small/medium/large |
| `icon` | node | `<Star>` | 채워진 별 아이콘 |
| `emptyIcon` | node | `<StarBorder>` | 빈 별 아이콘 |
| `getLabelText` | func | - | 접근성 레이블 생성 |
| `highlightSelectedOnly` | bool | `false` | 선택된 별만 채우기 |
| `onChangeActive` | func | - | hover 값 변경 콜백 |

### 핵심 로직 발췌

```javascript
// 소수점 precision 계산
function getDecimalPrecision(num) { ... }
function roundValueToPrecision(value, precision) {
  const nearest = Math.round(value / precision) * precision;
  return Number(nearest.toFixed(getDecimalPrecision(precision)));
}

// hover/focus 통합 상태
const [{ hover, focus }, setState] = React.useState({ hover: -1, focus: -1 });

// 마우스 위치로 hover 값 계산
const percent = (event.clientX - left) / containerWidth;
let newHover = roundValueToPrecision(max * percent + precision / 2, precision);
newHover = clamp(newHover, precision, max);

// 별점 채우기 여부
const isFilled = highlightSelectedOnly
  ? itemValue === ratingValue
  : itemValue <= ratingValue;

// 같은 값 클릭 시 초기화
const handleClear = (event) => {
  if (onChange && parseFloat(event.target.value) === valueRounded) {
    onChange(event, null);  // null = 선택 해제
  }
};
```

---

## 복잡도의 이유

Rating은 **866줄**이며, 복잡한 이유는:

1. **4개 styled 컴포넌트** + `memoTheme` + `variants` 배열
2. **useSlot 시스템** - Rating에 4개, RatingItem에 2개 (총 6개)
3. **useUtilityClasses** - 10개 슬롯 (root, label, icon, iconEmpty, iconFilled, iconHover, iconFocus, iconActive, decimal, visuallyHidden)
4. **RTL 지원** - `useRtl`로 LTR/RTL 방향 분기
5. **PropTypes 3곳** - Rating, RatingItem, IconContainer (~200줄)
6. **IconContainerComponent (deprecated)** - slots.icon으로 이전 중인 prop

---

## 간소화 방향

- **PropTypes 3곳** - ~200줄
- **useDefaultProps** - 함수 파라미터 기본값으로 대체
- **className/classes/useUtilityClasses** + clsx/composeClasses/ratingClasses 제거
- **useSlot/slots/slotProps** - styled 컴포넌트 직접 사용
- **RTL + component prop** - LTR 고정, `<span>` 고정
- **forwardRef + useForkRef**
- **4개 styled 컴포넌트** → 인라인 스타일 변환

> 상세한 간소화 결과는 `Rating-simplified.md` 참고
