# Fab 컴포넌트

> 원형 버튼 + box-shadow로 떠있는 효과를 구현한 Floating Action Button

---

## 이 문서의 목적

**이 문서는 단순화된 코드의 "설명서"입니다.**

Fab의 핵심은 "borderRadius: 50%로 원형 만들기 + box-shadow로 elevation 효과"입니다. 이 문서는 이러한 CSS 속성들이 어떻게 조합되어 떠있는 원형 버튼을 만드는지 상세히 설명합니다.

---

## 무슨 기능을 하는가?

단순화된 Fab는 **borderRadius: 50%와 box-shadow로 화면에 떠있는 원형 버튼을 표시하는** 컴포넌트입니다.

### 핵심 기능 (남은 것)
1. **원형 모양** - borderRadius: 50%
2. **Elevation 효과** - box-shadow로 떠있는 느낌
3. **고정 크기** - width/height 56px
4. **z-index** - 1050으로 다른 요소 위에 표시
5. **flexbox 정렬** - display: inline-flex로 아이콘 중앙 정렬

---

## 핵심 학습 포인트

### 1. borderRadius: 50%로 원형 만들기

```javascript
const rootStyle = {
  width: '56px',
  height: '56px',
  borderRadius: '50%',
};
```

**학습 가치**:
- **정사각형 + borderRadius: 50%** = 완벽한 원
- width = height일 때만 원형
- borderRadius는 percentage(%)도 지원
  - 50% = width/2 (반지름)
  - 100% = width (전체, 하지만 50%와 동일 효과)

**예시**:
```css
/* 원형 */
width: 56px;
height: 56px;
border-radius: 50%; /* 28px와 동일 */

/* 타원 (잘못된 예) */
width: 56px;
height: 40px;
border-radius: 50%; /* 타원 모양 */

/* 둥근 사각형 */
width: 56px;
height: 56px;
border-radius: 8px; /* 모서리만 둥글게 */
```

### 2. box-shadow로 Elevation 효과

```javascript
boxShadow: '0px 3px 5px -1px rgba(0,0,0,0.2), 0px 6px 10px 0px rgba(0,0,0,0.14), 0px 1px 18px 0px rgba(0,0,0,0.12)',
```

**학습 가치**:
- **Material Design elevation 6**: 3개의 box-shadow 레이어
  - 1번째: 작은 offset, 진한 그림자 (umbra)
  - 2번째: 중간 offset, 중간 그림자 (penumbra)
  - 3번째: 큰 offset, 연한 그림자 (ambient)
- **3개 레이어 조합** = 자연스러운 depth 효과

**box-shadow 구문**:
```
box-shadow: [inset] offset-x offset-y blur-radius spread-radius color;
```

**예시**:
```css
/* elevation 6 (Material Design) */
0px 3px 5px -1px rgba(0,0,0,0.2),   /* umbra */
0px 6px 10px 0px rgba(0,0,0,0.14),  /* penumbra */
0px 1px 18px 0px rgba(0,0,0,0.12)   /* ambient */

/* 단순 그림자 */
0px 2px 4px rgba(0,0,0,0.25)

/* hover 시 elevation 증가 (예시) */
0px 5px 5px -3px rgba(0,0,0,0.2),
0px 8px 10px 1px rgba(0,0,0,0.14),
0px 3px 14px 2px rgba(0,0,0,0.12)
```

### 3. display: inline-flex로 아이콘 중앙 정렬

```javascript
const rootStyle = {
  display: 'inline-flex',
  alignItems: 'center',      // 세로 중앙
  justifyContent: 'center',  // 가로 중앙
};
```

**학습 가치**:
- **inline-flex**: 버튼 크기만큼만 차지 (block이 아님)
- **alignItems: center**: flex 컨테이너 내 세로 중앙 정렬
- **justifyContent: center**: flex 컨테이너 내 가로 중앙 정렬
- 아이콘(children)이 정확히 버튼 중앙에 배치됨

**비교**:
```css
/* flexbox 중앙 정렬 (권장) */
display: inline-flex;
align-items: center;
justify-content: center;

/* 고전적 방법 (복잡) */
display: inline-block;
text-align: center;
line-height: 56px; /* height와 동일하게 */
```

### 4. z-index로 다른 요소 위에 표시

```javascript
zIndex: 1050,
```

**학습 가치**:
- **z-index**: 요소의 쌓임 순서 제어
- 높은 숫자 = 위에 표시
- Fab는 일반적으로 다른 콘텐츠 위에 떠있음
- Material Design fab z-index: 1050

**z-index 계층 (Material-UI 기준)**:
```
mobileStepper: 1000
fab: 1050
speedDial: 1050
appBar: 1100
drawer: 1200
modal: 1300
snackbar: 1400
tooltip: 1500
```

---

## 내부 구조

### 1. 렌더링 구조

```javascript
// 위치: packages/mui-material/src/Fab/Fab.js (36줄, 원본 302줄)

Fab (forwardRef)
  └─> button
       └─> children (icon)
```

### 2. 핵심 상태 (ref, state, 변수)

| 이름 | 타입 | 용도 |
|------|------|------|
| `rootStyle` | 객체 | 하드코딩된 스타일 |

### 3. 주요 변경 사항 (원본 대비)

**원본과의 차이**:
- ❌ `ButtonBase` 확장 제거 → 일반 button 요소
- ❌ `variant` prop 제거 → 'circular' 고정
- ❌ `size` prop 제거 → 'large'(56px) 고정
- ❌ `color` prop 제거 → 'primary'(#1976d2) 고정
- ❌ `disabled` prop 제거 → false 고정
- ❌ `component` prop 제거 → button 고정
- ❌ `href` prop 제거
- ❌ Ripple 효과 제거
- ❌ focusRipple, disableFocusRipple props 제거
- ❌ focusVisibleClassName 제거
- ❌ Theme 시스템 (theme.palette, theme.transitions, theme.shadows, theme.zIndex) 제거
- ❌ styled 시스템 (약 160줄) → 인라인 스타일 (15줄)
- ❌ memoTheme 3개, variants 배열 제거
- ❌ useUtilityClasses, composeClasses 제거
- ❌ PropTypes (90줄) 제거
- ✅ forwardRef 유지
- ✅ 원형 모양 (borderRadius: 50%) 유지
- ✅ box-shadow (elevation) 유지
- ✅ transition 애니메이션 유지

### 4. Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `children` | ReactNode | - | 아이콘 등 자식 요소 |
| `className` | string | - | 추가 CSS 클래스 |
| `style` | object | - | 인라인 스타일 |
| `...other` | any | - | 기타 HTML button 속성 (onClick 등) |

**제거된 Props**:
- ❌ `variant`, `size`, `color`, `disabled`, `component`, `href` - 모두 고정값 또는 제거
- ❌ `disableFocusRipple`, `disableRipple`, `focusVisibleClassName` - Ripple 관련

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 302줄 | 36줄 (88.1% 감소) |
| **Props 개수** | 11개 | 3개 (children, className, style) |
| **ButtonBase** | ✅ Ripple 효과 | ❌ 일반 button |
| **variant** | ✅ circular/extended | ❌ circular 고정 |
| **size** | ✅ small/medium/large | ❌ large(56px) 고정 |
| **color** | ✅ 8가지 | ❌ primary 고정 |
| **disabled** | ✅ 비활성화 지원 | ❌ false 고정 |
| **styled 시스템** | ✅ ~160줄 | ❌ 인라인 스타일 15줄 |
| **원형 모양** | ✅ | ✅ (유지) |
| **elevation** | ✅ | ✅ (유지) |

---

## 학습 후 다음 단계

Fab를 이해했다면:

1. **Button** - 일반 버튼 컴포넌트 (Fab와 유사하지만 사각형)
2. **IconButton** - 아이콘 전용 버튼
3. **CSS border-radius** - 다양한 모양 만들기
4. **CSS box-shadow** - elevation, glow 효과
5. **실전 응용** - 커스텀 floating button 만들기

**예시: 기본 사용**
```javascript
import Fab from './Fab';
import AddIcon from '@mui/icons-material/Add';

function App() {
  return (
    <Fab>
      <AddIcon />
    </Fab>
  );
}
```

**예시: 커스텀 색상**
```javascript
<Fab style={{ backgroundColor: '#ff5722', color: '#fff' }}>
  <AddIcon />
</Fab>
```

**예시: 커스텀 크기**
```javascript
<Fab
  style={{
    width: '40px',
    height: '40px',
  }}
>
  <AddIcon style={{ fontSize: '20px' }} />
</Fab>
```

**예시: 고정 위치**
```javascript
<Fab
  style={{
    position: 'fixed',
    bottom: '16px',
    right: '16px',
  }}
  onClick={() => console.log('Clicked!')}
>
  <AddIcon />
</Fab>
```

**예시: hover 효과 추가 (CSS)**
```javascript
<Fab className="custom-fab" />

<style>{`
  .custom-fab:hover {
    background-color: #1565c0;
    box-shadow: 0px 5px 5px -3px rgba(0,0,0,0.2),
                0px 8px 10px 1px rgba(0,0,0,0.14),
                0px 3px 14px 2px rgba(0,0,0,0.12);
  }
  .custom-fab:active {
    box-shadow: 0px 7px 8px -4px rgba(0,0,0,0.2),
                0px 12px 17px 2px rgba(0,0,0,0.14),
                0px 5px 22px 4px rgba(0,0,0,0.12);
  }
`}</style>
```

---

## 결론

단순화된 Fab의 핵심은:
- ✅ **borderRadius: 50%**: 정사각형을 원형으로 변환
- ✅ **box-shadow**: Material Design elevation으로 떠있는 효과
- ✅ **display: inline-flex**: 아이콘 중앙 정렬
- ✅ **z-index**: 다른 요소 위에 표시

**핵심 교훈**: 복잡한 ButtonBase 확장, Ripple 효과, styled 시스템, variants 배열을 제거해도, 간단한 CSS만으로 충분히 효과적인 Floating Action Button을 만들 수 있습니다.
