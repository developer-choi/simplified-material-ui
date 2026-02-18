# Slider 컴포넌트

> Slider 컴포넌트 원본 구조 빠른 파악

**⚠️ 이 문서의 목적**: 간소화 작업 **전에** 원본 코드를 빠르게 이해하기 위한 요약 문서입니다.

---

## 무슨 기능을 하는가?

Slider는 **범위 선택 입력 컴포넌트**입니다. 드래그 또는 키보드로 값을 선택합니다.

### 핵심 기능
1. **드래그 & 클릭** - 마우스/터치로 값 선택
2. **키보드 접근성** - 화살표/Shift+화살표/Home/End 키 지원
3. **range slider** - 배열 값으로 두 개의 thumb 표시
4. **marks** - 눈금 표시 (true 또는 배열)
5. **valueLabelDisplay** - 값 라벨 표시 (auto/on/off)
6. **orientation** - 수평/수직 방향
7. **scale** - 값 변환 함수 (로그 스케일 등)
8. **track** - normal/inverted/false

---

## 주요 코드 구조

### 파일 위치 및 크기

```
packages/mui-material/src/Slider/Slider.js (1,160줄)
```

### 컴포넌트 계층

```
Slider (main)
  └─> SliderRoot (styled span)
        ├─> SliderRail (배경 레일)
        ├─> SliderTrack (활성 트랙)
        ├─> SliderMark × N (눈금)
        │     └─> SliderMarkLabel (눈금 라벨)
        └─> values.map → 각 thumb
              ├─> SliderValueLabel (값 라벨)
              │     └─> SliderThumb (핸들)
              └─> input[type=range] (hidden, form용)
```

### 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `value` | number\|array | - | (controlled) 값 |
| `defaultValue` | number\|array | - | (uncontrolled) 초기값 |
| `min` | number | `0` | 최솟값 |
| `max` | number | `100` | 최댓값 |
| `step` | number | `1` | 단계 |
| `shiftStep` | number | `10` | Shift+화살표 단계 |
| `marks` | bool\|array | `false` | 눈금 표시 |
| `orientation` | string | `'horizontal'` | 수평/수직 |
| `track` | string\|false | `'normal'` | 트랙 스타일 |
| `scale` | func | `Identity` | 값 변환 함수 |
| `valueLabelDisplay` | string | `'off'` | 라벨 표시 방식 |
| `valueLabelFormat` | func\|string | `Identity` | 라벨 형식 |
| `color` | string | `'primary'` | 색상 |
| `size` | string | `'medium'` | small/medium |
| `disabled` | bool | `false` | 비활성화 |
| `disableSwap` | bool | `false` | 드래그 중 thumb 교환 비활성화 |

### 핵심 로직

```javascript
// 핵심 상태/로직은 useSlider 훅에 위임
const {
  axisProps,        // orientation별 CSS 스타일 매핑
  getRootProps,     // 루트 span 이벤트 핸들러
  getHiddenInputProps, // hidden input props
  getThumbProps,    // thumb props (aria-*, tabIndex)
  open,             // valueLabel 표시 여부
  active,           // 현재 드래그 중인 thumb 인덱스
  axis,             // 'horizontal' | 'vertical' | 'horizontal-reverse'
  focusedThumbIndex,
  range,            // value가 배열인지 여부
  dragging,
  marks,            // 처리된 marks 배열
  values,           // 처리된 values 배열
  trackOffset,      // 트랙 시작 위치 (%)
  trackLeap,        // 트랙 크기 (%)
  getThumbStyle,    // 각 thumb의 위치 스타일
} = useSlider({ ...ownerState, rootRef: ref });

// marks 렌더링 - markActive 계산
const markActive = (track === 'normal' && mark.value <= values[0]) ||
                   (track === 'inverted' && mark.value >= values[0]);

// ValueLabel 조건부 렌더링
{valueLabelDisplay !== 'off' && (
  <ValueLabelSlot
    valueLabelDisplay={valueLabelDisplay}
    value={typeof valueLabelFormat === 'function'
      ? valueLabelFormat(scale(v), index)
      : valueLabelFormat}
    index={index}
    open={open === index || valueLabelDisplay === 'on'}
    disabled={disabled}
  >
    <ThumbSlot ... />
  </ValueLabelSlot>
)}
```

---

## 복잡도의 이유

1. **7개 styled 컴포넌트** + memoTheme + variants 배열 (~430줄)
2. **useSlotProps 8개** - 모든 슬롯(Root/Rail/Track/Thumb/ValueLabel/Mark/MarkLabel/Input)
3. **이중 slot 시스템** - `slots`/`slotProps` + 레거시 `components`/`componentsProps`
4. **useUtilityClasses** - 12개 슬롯
5. **RTL 지원** - `useRtl`, ownerState.isRtl → `useSlider`에 전달
6. **PropTypes** - ~300줄
7. **forwardRef** - ref를 `useSlider`의 `rootRef`로 전달
8. **Forward 래퍼** - ValueLabel slot에서 children만 렌더링

---

## 간소화 방향

- **PropTypes** (~300줄)
- **useDefaultProps** → 함수 파라미터 기본값
- **useUtilityClasses/className/classes** + clsx/composeClasses/sliderClasses/capitalize
- **useSlotProps/slots/slotProps/components/componentsProps** → styled 직접 사용
- **RTL + component prop** → LTR 고정, `<span>` 고정
- **forwardRef**
- **7개 styled 컴포넌트** → 인라인 스타일

> 상세한 간소화 결과는 `Slider-simplified.md` 참고
