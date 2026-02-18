# LinearProgress 컴포넌트

> LinearProgress 컴포넌트 원본 구조 빠른 파악

**⚠️ 이 문서의 목적**: 간소화 작업 **전에** 원본 코드를 빠르게 이해하기 위한 요약 문서입니다.

---

## 무슨 기능을 하는가?

LinearProgress는 **작업 진행 상태를 가로 막대(bar)로 시각화하는 컴포넌트**입니다.

### 핵심 기능
1. **4가지 variant** - `indeterminate`(무한 루프), `determinate`(진행률 표시), `buffer`(버퍼+진행률), `query`(indeterminate의 반전)
2. **CSS 키프레임 애니메이션** - `indeterminate`, `buffer` variant에서 CSS animation으로 bar가 이동
3. **ARIA 접근성** - `role="progressbar"`, `aria-valuenow/min/max`로 스크린리더 지원

---

## 주요 코드 구조

### 파일 위치 및 크기

```
packages/mui-material/src/LinearProgress/LinearProgress.js (524줄)
```

### 렌더링 구조

```
LinearProgressRoot (span, role="progressbar")
  ├─> LinearProgressDashed (buffer variant만)  ← 점선 배경 (버퍼 영역 표시)
  ├─> LinearProgressBar1                        ← 주 진행 바
  └─> LinearProgressBar2 (determinate 제외)    ← 보조 바 (indeterminate 2번째 bar / buffer 진행 bar)
```

### 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `variant` | string | `'indeterminate'` | 표시 방식 선택 |
| `value` | number | - | determinate/buffer의 진행값 (0-100) |
| `valueBuffer` | number | - | buffer variant의 버퍼값 (0-100) |
| `color` | string | `'primary'` | 색상 (테마 컬러 또는 'inherit') |
| `className` | string | - | 루트 요소의 CSS 클래스 |
| `classes` | object | - | 각 슬롯의 클래스 오버라이드 |

### 핵심 로직 발췌

```javascript
// determinate/buffer에서 진행률을 CSS transform으로 표현
if (variant === 'determinate' || variant === 'buffer') {
  if (value !== undefined) {
    rootProps['aria-valuenow'] = Math.round(value);
    rootProps['aria-valuemin'] = 0;
    rootProps['aria-valuemax'] = 100;
    let transform = value - 100;  // 예: 70% → translateX(-30%)
    if (isRtl) { transform = -transform; }
    inlineStyles.bar1.transform = `translateX(${transform}%)`;
  }
}

// indeterminate의 CSS 키프레임 (bar1)
const indeterminate1Keyframe = keyframes`
  0%   { left: -35%;  right: 100%; }
  60%  { left: 100%;  right: -90%; }
  100% { left: 100%;  right: -90%; }
`;
```

---

## 복잡도의 이유

LinearProgress는 **524줄**이며, 복잡한 이유는:

1. **4개 styled component** - `LinearProgressRoot`, `LinearProgressDashed`, `LinearProgressBar1`, `LinearProgressBar2` 각각 `memoTheme`으로 테마 기반 스타일 정의
2. **Pigment CSS 호환성 코드** - `typeof indeterminate1Keyframe !== 'string'` 런타임 체크로 emotion vs Pigment CSS 이중 지원
3. **color variant 시스템** - `Object.entries(theme.palette).filter(createSimplePaletteValueFilter())` 로 모든 테마 색상 지원 (primary, secondary, error, warning 등)
4. **useUtilityClasses + composeClasses** - 각 슬롯(root, dashed, bar1, bar2)마다 동적 클래스 생성
5. **RTL 지원** - `useRtl()`로 아랍어 등 오른쪽→왼쪽 레이아웃 지원

---

## 간소화 방향

이 컴포넌트를 간소화할 때 제거 고려 대상:

- **PropTypes** - 메타데이터, 핵심 로직 아님
- **useDefaultProps** - 함수 파라미터 기본값으로 대체
- **className/classes/useUtilityClasses** - CSS 클래스 시스템 제거
- **color prop** - primary 고정
- **query variant** - indeterminate 반전, 학습 가치 낮음
- **RTL 지원** - `useRtl()` 제거, LTR 고정
- **console.error** - 개발 경고 코드 제거
- **Pigment CSS 호환 분기** - 빌드 도구 호환성 코드 제거
- **styled() 시스템** - 4개 styled component → 인라인 스타일 + `<style>` 태그로 변환

> 상세한 간소화 결과는 `LinearProgress-simplified.md` 참고
