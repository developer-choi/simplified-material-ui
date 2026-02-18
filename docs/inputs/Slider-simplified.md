# Slider 단순화 결과

> Slider 컴포넌트 간소화 과정 및 최종 결과

---

## 간소화 전/후 비교

| 항목 | 원본 | 단순화 |
|------|------|--------|
| 줄 수 | 1,160줄 | ~220줄 (약 81% 감소) |
| 제거 | 7개 styled 컴포넌트, useSlotProps×8, PropTypes~300줄, useUtilityClasses, slots/slotProps/components/componentsProps, RTL, forwardRef | - |

---

## 최종 코드 구조

```javascript
'use client';
import * as React from 'react';
import { useSlider, valueToPercent } from './useSlider';
import SliderValueLabel from './SliderValueLabel';

function Identity(x) { return x; }

function Slider(props) {
  const { orientation = 'horizontal', size = 'medium', disabled = false,
    track = 'normal', marks: marksProp = false, scale = Identity,
    valueLabelDisplay = 'off', valueLabelFormat = Identity,
    min = 0, max = 100, step = 1, shiftStep = 10, ...other } = props;

  const { axisProps, getRootProps, getHiddenInputProps, getThumbProps,
    open, active, axis, range, marks, values, trackOffset, trackLeap,
    getThumbStyle } = useSlider({ ...ownerState });

  const horizontal = orientation === 'horizontal';
  const small = size === 'small';

  return (
    <span {...getRootProps()} style={{ /* root inline styles */ }} {...other}>
      <span style={{ /* rail */ }} />
      <span style={{ /* track */ }} />
      {marks.map((mark, index) => (
        <React.Fragment key={index}>
          <span style={{ /* mark dot */ }} />
          {mark.label && <span style={{ /* mark label */ }}>{mark.label}</span>}
        </React.Fragment>
      ))}
      {values.map((value, index) => {
        const thumbNode = (
          <span {...getThumbProps()} style={{ /* thumb */ }}>
            <input value={values[index]} {...getHiddenInputProps()} />
          </span>
        );
        return valueLabelDisplay !== 'off'
          ? <SliderValueLabel key={index} open={...} value={...}>{thumbNode}</SliderValueLabel>
          : React.cloneElement(thumbNode, { key: index });
      })}
    </span>
  );
}
```

---

## 제거된 것들 (7단계)

| 단계 | 제거 대상 | 이유 |
|------|-----------|------|
| 1 | `Slider.propTypes` (~300줄), PropTypes/chainPropTypes imports | 런타임 타입 검사 불필요 |
| 2 | `useDefaultProps`, `DefaultPropsProvider` | 함수 파라미터 기본값으로 대체 |
| 3 | `useUtilityClasses`, `composeClasses`, `capitalize`, `clsx`, `sliderClasses`, `className/classes` | CSS 클래스 시스템 제거 |
| 4 | `useSlotProps×8`, `slots/slotProps/components/componentsProps`, `isHostComponent`, `shouldSpreadAdditionalProps`, `Forward` 래퍼 | 슬롯 커스터마이징 시스템 제거 |
| 5 | `useRtl`, `isRtl`, `component prop` | RTL/LTR 고정, span 고정 |
| 6 | `React.forwardRef`, `rootRef: ref` | 외부 ref 전달 제거 |
| 7 | 7개 styled 컴포넌트 (~430줄) → 인라인 스타일 | styled, memoTheme, createSimplePaletteValueFilter 제거 |

---

## 핵심 학습 포인트

### 1. useSlider 훅 - 복잡한 인터랙션 로직의 위임

```javascript
const {
  axisProps,        // orientation별 CSS offset/leap 계산 함수
  getRootProps,     // span 루트의 이벤트 핸들러 (마우스/터치/키보드)
  getHiddenInputProps, // hidden input (form 제출용)
  getThumbProps,    // thumb의 aria 속성 + 이벤트 핸들러
  open,             // valueLabel 표시 여부 (thumb 인덱스)
  active,           // 드래그 중인 thumb 인덱스
  axis,             // 'horizontal' | 'vertical'
  range,            // value가 배열 (두 개 thumb)
  marks,            // 처리된 marks 배열
  values,           // 처리된 values 배열 (항상 배열)
  trackOffset,      // 트랙 시작 위치 (%)
  trackLeap,        // 트랙 크기 (%)
  getThumbStyle,    // 각 thumb의 위치 스타일
} = useSlider({ ...ownerState });
```

- **핵심 패턴**: 복잡한 drag/keyboard/touch 로직은 `useSlider` 훅에 완전 위임
- Slider.js는 UI 렌더링만 담당 → 관심사 분리의 모범 사례

### 2. axisProps - orientation별 CSS 계산 추상화

```javascript
// useSlider가 반환하는 axisProps
axisProps['horizontal'] = {
  offset: (percent) => ({ left: `${percent}%` }),
  leap: (percent) => ({ width: `${percent}%` }),
};
axisProps['vertical'] = {
  offset: (percent) => ({ bottom: `${percent}%` }),
  leap: (percent) => ({ height: `${percent}%` }),
};

// 사용: orientation에 무관한 코드
<span style={{ ...axisProps[axis].offset(trackOffset), ...axisProps[axis].leap(trackLeap) }} />
```

- orientation 분기를 추상화 → 렌더링 코드가 orientation을 몰라도 됨
- `trackOffset` = 트랙 시작 %, `trackLeap` = 트랙 길이 %

### 3. valueToPercent - 마크/thumb 위치 계산

```javascript
const percent = valueToPercent(mark.value, min, max);
const markStyle = axisProps[axis].offset(percent);
// → horizontal: { left: '50%' } (중간값이면)
// → vertical:   { bottom: '50%' }
```

- 값(value)을 0~100% 범위로 변환
- `axisProps[axis].offset(percent)` 로 실제 CSS position 생성

### 4. range slider - values 배열로 처리

```javascript
// value가 number → values = [value]
// value가 [min, max] → values = [min, max] (두 thumb)
values.map((value, index) => {
  // 각 thumb 렌더링
  <span data-index={index} {...getThumbProps()}>
    <input value={values[index]} {...getHiddenInputProps()} />
  </span>
});
```

- `values`는 항상 배열 (단일 thumb도 `[value]`)
- `data-index`로 어떤 thumb인지 이벤트 핸들러에서 식별

### 5. markActive 계산 - track 방향별 분기

```javascript
let markActive;
if (track === false) {
  // 트랙 없음: thumb 위치와 정확히 일치하는 마크만 활성
  markActive = values.includes(mark.value);
} else {
  markActive =
    (track === 'normal' &&
      (range
        ? mark.value >= values[0] && mark.value <= values[values.length - 1] // 두 thumb 사이
        : mark.value <= values[0])) ||                                         // thumb 왼쪽
    (track === 'inverted' &&
      (range
        ? mark.value <= values[0] || mark.value >= values[values.length - 1]  // 두 thumb 바깥
        : mark.value >= values[0]));                                            // thumb 오른쪽
}
```

- track='normal': 선택된 범위 **안** 마크가 활성
- track='inverted': 선택된 범위 **밖** 마크가 활성
- range slider는 `values[0]` ~ `values[last]` 범위로 계산

### 6. ValueLabel 조건부 렌더링

```javascript
return valueLabelDisplay !== 'off' ? (
  <SliderValueLabel
    key={index}
    open={open === index || active === index || valueLabelDisplay === 'on'}
    value={typeof valueLabelFormat === 'function'
      ? valueLabelFormat(scale(value), index)
      : valueLabelFormat}
    disabled={disabled}
  >
    {thumbNode}
  </SliderValueLabel>
) : React.cloneElement(thumbNode, { key: index });
```

- `valueLabelDisplay='off'`: ValueLabel 컴포넌트 자체를 렌더링하지 않음
- `valueLabelDisplay='auto'`: 호버/포커스 시 표시 (`open === index || active === index`)
- `valueLabelDisplay='on'`: 항상 표시
- `React.cloneElement(thumbNode, { key: index })`: map의 key를 추가하는 용도

### 7. SliderValueLabel - children을 thumb으로 래핑

```javascript
// SliderValueLabel은 BaseSliderValueLabel (./SliderValueLabel) 사용
// thumb이 children으로 들어가 → 값 라벨이 thumb 위에 위치
<SliderValueLabel key={index} open={...} value={...}>
  <span {...getThumbProps()} style={...}>  {/* thumb이 children */}
    <input {...getHiddenInputProps()} />
  </span>
</SliderValueLabel>
```

- ValueLabel이 thumb을 children으로 감싸는 구조
- ValueLabel의 `open` prop으로 표시/숨김 제어

### 8. scale prop - 비선형 슬라이더

```javascript
// 기본: Identity (선형)
function Identity(x) { return x; }

// 로그 스케일 예시:
<Slider scale={(x) => Math.pow(10, x)} />

// 사용: aria-valuenow와 value label에 scale 적용
aria-valuenow={scale(value)}    // 실제 표시값
value={typeof valueLabelFormat === 'function'
  ? valueLabelFormat(scale(value), index)  // scale 적용 후 포맷
  : valueLabelFormat}
```

- `scale` 함수로 내부 값을 외부 표시값으로 변환
- 내부 상태는 선형(0~100)으로 유지, 표시만 변환
