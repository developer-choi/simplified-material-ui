# Rating 단순화 결과

> Rating 컴포넌트 간소화 과정 및 최종 결과

---

## 간소화 전/후 비교

| 항목 | 원본 | 단순화 |
|------|------|--------|
| 줄 수 | 866줄 | ~375줄 |
| 의존성 | PropTypes, clsx, composeClasses, styled, memoTheme, useSlot, useRtl, useForkRef 등 16개 | 4개 (clamp, isFocusVisible, useControlled, useId) |

---

## 최종 코드 구조

```javascript
'use client';
import * as React from 'react';
import clamp from '@mui/utils/clamp';
import isFocusVisible from '@mui/utils/isFocusVisible';
import { useControlled, unstable_useId as useId } from '../utils';
import Star from '../internal/svg-icons/Star';
import StarBorder from '../internal/svg-icons/StarBorder';

const visuallyHiddenStyle = { /* 접근성용 숨김 스타일 */ };

function getDecimalPrecision(num) { ... }
function roundValueToPrecision(value, precision) { ... }

function RatingItem(props) { /* 개별 별점 아이템 */ }

function Rating(props) { /* 메인 컴포넌트 */ }
```

---

## 제거된 것들 (7단계)

| 단계 | 제거 대상 | 이유 |
|------|-----------|------|
| 1 | PropTypes 3곳 (~200줄) | 학습 목적에 불필요 |
| 2 | `useDefaultProps` | 함수 파라미터 기본값으로 대체 |
| 3 | `className/classes/useUtilityClasses` + clsx/composeClasses/ratingClasses/capitalize | 인라인 스타일로 대체 |
| 4 | `useSlot/slots/slotProps` + `IconContainerComponent` (deprecated) | styled 컴포넌트 직접 사용 |
| 5 | RTL + `component` prop | LTR 고정, `<span>` 고정 |
| 6 | `forwardRef` + `useForkRef` | 외부 ref 전달 학습 주제 분리 |
| 7 | 4개 styled 컴포넌트 → 인라인 스타일 | 테마 의존성 제거 |

---

## 핵심 학습 포인트

### 1. roundValueToPrecision - precision 반올림

```javascript
function getDecimalPrecision(num) {
  const decimalPart = num.toString().split('.')[1];
  return decimalPart ? decimalPart.length : 0;
}

function roundValueToPrecision(value, precision) {
  if (value == null) return value;
  const nearest = Math.round(value / precision) * precision;
  return Number(nearest.toFixed(getDecimalPrecision(precision)));
}

// precision=0.5 예시:
// value=2.7 → Math.round(2.7/0.5)*0.5 = Math.round(5.4)*0.5 = 5*0.5 = 2.5
```

- `Math.round(value / precision) * precision` → precision 단위로 반올림
- `toFixed(소수점자리수)` → 부동소수점 오차 방지

### 2. hover/focus 통합 상태 관리

```javascript
const [{ hover, focus }, setState] = React.useState({ hover: -1, focus: -1 });

// 표시할 값 결정 (hover > focus > 실제 값)
let value = valueRounded;
if (hover !== -1) value = hover;
if (focus !== -1) value = focus;
```

- `-1`을 "비활성" 센티넬 값으로 사용
- hover가 focus보다 우선 (이미 hover가 설정된 상태면 focus는 무시)

### 3. handleMouseMove - 마우스 위치로 별점 계산

```javascript
const handleMouseMove = (event) => {
  const { left, width: containerWidth } = rootNode.getBoundingClientRect();
  const percent = (event.clientX - left) / containerWidth;

  let newHover = roundValueToPrecision(max * percent + precision / 2, precision);
  newHover = clamp(newHover, precision, max);
  // ...
};
```

- `percent` = 마우스가 컨테이너 왼쪽 끝에서 얼마나 이동했는지 (0~1)
- `max * percent` = 소수점 별점 위치
- `+ precision / 2` = 별의 중앙에서 전환 (0.5씩 shift)
- `clamp(precision, max)` = 범위 초과 방지

### 4. handleClear - 같은 값 클릭 시 초기화

```javascript
const handleClear = (event) => {
  // 키보드 클릭(clientX===0)은 무시 (React 이벤트 특성)
  if (event.clientX === 0 && event.clientY === 0) return;

  setState({ hover: -1, focus: -1 });
  setValueState(null);

  if (onChange && parseFloat(event.target.value) === valueRounded) {
    onChange(event, null); // null = 선택 해제
  }
};
```

- `parseFloat(event.target.value) === valueRounded` → 현재 선택된 별을 다시 클릭했을 때만 초기화
- `clientX === 0 && clientY === 0` → 키보드 Enter 이벤트 필터링

### 5. isFocusVisible - 키보드 vs 마우스 포커스 구분

```javascript
const handleFocus = (event) => {
  if (isFocusVisible(event.target)) {
    setFocusVisible(true); // Tab 키 포커스만 true
  }
};
```

- `isFocusVisible()` → `element.matches(':focus-visible')` 활용
- 마우스 클릭 포커스는 false, 키보드 Tab 포커스만 true
- `focusVisible=true`일 때 active 별에 outline 표시

### 6. radio input으로 접근성 구현

```javascript
// 각 별마다 숨겨진 radio input + label
<label style={{ cursor: 'inherit' }} htmlFor={id}>
  <span style={iconStyle}>{icon}</span>  {/* 보이는 별 */}
  <span style={visuallyHiddenStyle}>{getLabelText(itemValue)}</span>  {/* 스크린 리더용 텍스트 */}
</label>
<input style={visuallyHiddenStyle} type="radio" id={id} value={itemValue} />
```

- radio input → 키보드 화살표 탐색, 스크린 리더 지원
- `visuallyHiddenStyle` → 시각적으로 숨기되 접근성 트리에 유지
- `label[htmlFor] + input[id]` 연결 → 레이블 클릭 시 input 활성화

### 7. precision < 1 소수점 렌더링 (반 별)

```javascript
if (precision < 1) {
  const items = Array.from(new Array(1 / precision)); // precision=0.5 → 2개
  return (
    <span style={{ position: 'relative', ...(isActive && { transform: 'scale(1.2)' }) }}>
      {items.map(($, indexDecimal) => {
        const itemDecimalValue = roundValueToPrecision(
          itemValue - 1 + (indexDecimal + 1) * precision,
          precision,
        );
        return (
          <RatingItem
            itemValue={itemDecimalValue}
            labelProps={{
              style: items.length - 1 === indexDecimal
                ? {}  // 마지막 아이템은 정상 크기
                : {
                    width: itemDecimalValue === value
                      ? `${(indexDecimal + 1) * precision * 100}%`
                      : '0%',
                    overflow: 'hidden',
                    position: 'absolute',
                  },
            }}
          />
        );
      })}
    </span>
  );
}
```

- `1 / precision` 개의 서브아이템으로 분할 (0.5 → 2개: 0.5, 1.0)
- 각 서브아이템의 width를 `overflow: hidden`으로 잘라내 부분 별 표현
- 마지막 아이템(정수 위치)은 실제 크기로 렌더링
