# MobileStepper 컴포넌트

> MobileStepper 컴포넌트 원본 구조 빠른 파악

**⚠️ 이 문서의 목적**: 간소화 작업 **전에** 원본 코드를 빠르게 이해하기 위한 요약 문서입니다.

---

## 무슨 기능을 하는가?

MobileStepper는 **모바일 화면에서 단계를 표시하는 하단/상단 고정 바** 컴포넌트입니다.

### 핵심 기능
1. **3가지 variant** - `'dots'` (점), `'progress'` (프로그레스바), `'text'` (1 / 5 텍스트)
2. **position** - `'bottom' | 'top'` (fixed 포지셔닝) 또는 `'static'`
3. **backButton / nextButton** - 이전/다음 버튼 슬롯 (Button이나 IconButton을 넣음)
4. **progress 계산** - `activeStep / (steps - 1) * 100`으로 LinearProgress 값 자동 계산

---

## 주요 코드 구조

### 파일 위치 및 크기

```
packages/mui-material/src/MobileStepper/MobileStepper.js (326줄)
```

### 렌더링 구조

```
MobileStepper
  └─> MobileStepperRoot (styled(Paper))        ← 배경 + flex 레이아웃 + position
       ├─> backButton                           ← 외부에서 주입
       ├─> (variant === 'text') → "1 / 5"
       ├─> (variant === 'dots') → MobileStepperDots
       │     └─> MobileStepperDot × steps      ← 활성 dot 색상 다름
       ├─> (variant === 'progress') → MobileStepperProgress (LinearProgress)
       └─> nextButton                           ← 외부에서 주입
```

### 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `variant` | string | `'dots'` | dots/progress/text |
| `activeStep` | number | `0` | 현재 단계 (0부터) |
| `steps` | number | (필수) | 전체 단계 수 |
| `position` | string | `'bottom'` | bottom/top/static |
| `backButton` | node | - | 이전 버튼 노드 |
| `nextButton` | node | - | 다음 버튼 노드 |
| `slots/slotProps` | object | `{}` | 내부 슬롯 교체 |
| `LinearProgressProps` | object | - | (deprecated) progress 슬롯 props |

### 핵심 로직 발췌

```javascript
// progress 값 계산
let value;
if (variant === 'progress') {
  if (steps === 1) {
    value = 100;
  } else {
    value = Math.ceil((activeStep / (steps - 1)) * 100);
  }
}

// dots 렌더링
{[...new Array(steps)].map((_, index) => (
  <DotSlot
    key={index}
    dotActive={index === activeStep}  // 활성 dot 판단
  />
))}
```

---

## 복잡도의 이유

MobileStepper는 **326줄**이며, 복잡한 이유는:

1. **4개 styled 컴포넌트** - `MobileStepperRoot`(Paper), `MobileStepperDots`, `MobileStepperDot`, `MobileStepperProgress`(LinearProgress) + `memoTheme` + `variants` 배열
2. **useSlot 시스템** - slots/slotProps/LinearProgressProps → 4개 슬롯 변수 생성 + externalForwardedProps
3. **useUtilityClasses** - position, dotActive 상태별 동적 클래스 생성
4. **PropTypes** - ~76줄
5. **slotShouldForwardProp** - styled 컴포넌트의 prop forwarding 제어

---

## 간소화 방향

이 컴포넌트를 간소화할 때 제거 고려 대상:

- **PropTypes** - 76줄
- **useDefaultProps** - 함수 파라미터 기본값으로 대체
- **className/classes/useUtilityClasses** - 인라인 스타일로 대체
- **useSlot/slots/slotProps** - styled 컴포넌트 직접 사용
- **forwardRef** - 외부 ref 전달 불필요
- **4개 styled 컴포넌트** → `<div>`, `<LinearProgress>` 인라인 스타일로 변환

> 상세한 간소화 결과는 `MobileStepper-simplified.md` 참고
