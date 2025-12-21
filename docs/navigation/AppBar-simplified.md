# AppBar (단순화) 분석

## 무슨 기능을 하는가?

단순화된 AppBar는 **기본적인 네비게이션 바 기능만 제공**합니다.

AppBar 자체가 하는 일:
1. **5가지 position 지원** - fixed/absolute/sticky/static/relative (유지됨)
2. **고정된 primary 색상** - #1976d2 배경, #fff 텍스트
3. **고정된 elevation** - boxShadow로 하드코딩
4. **인라인 스타일** - styled API 제거, style prop 사용
5. **일반 header 태그** - Paper 상속 제거

## 내부 구조

```
AppBar (React.forwardRef)
  ↓
props 구조 분해
  ↓
positionStyles 계산 (조건부)
  ↓
<header>
  - 인라인 style
  - className (mui-fixed 포함)
```

### 주요 로직

**1. Position 스타일 계산**
```javascript
const positionStyles = {
  position: position,
  ...(position === 'fixed' || position === 'absolute' || position === 'sticky'
    ? {
        zIndex: 1100,
        top: 0,
        left: 'auto',
        right: 0,
      }
    : {}),
};
```

**2. className 처리**
```javascript
className={
  position === 'fixed'
    ? className
      ? `mui-fixed ${className}`
      : 'mui-fixed'
    : className
}
```

**3. 인라인 스타일**
```javascript
style={{
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  boxSizing: 'border-box',
  flexShrink: 0,
  backgroundColor: '#1976d2',
  color: '#fff',
  boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
  ...positionStyles,
  ...style,
}}
```

## 커밋 히스토리로 보는 단순화 과정

총 11개 커밋으로 277줄 → 54줄 (80.5% 감소)

### Commit 1: Color Props 단순화
```
8a44dffd [AppBar 단순화 1/14] color prop 단순화 (primary만 유지)
```
- 9가지 색상 옵션 → primary만 유지
- 동적 palette 색상 생성 로직 삭제
- color variants 8개 삭제
- 41줄 삭제

### Commit 2: enableColorOnDark 제거
```
395ef4a2 [AppBar 단순화 2/14] enableColorOnDark prop 삭제
```
- 다크 모드 색상 제어 prop 삭제
- enableColorOnDark variants 2개 통합
- 14줄 삭제

### Commit 3: joinVars 함수 제거
```
516055ec [AppBar 단순화 3/14] joinVars 유틸리티 함수 삭제
```
- CSS 변수 폴백 체인 함수 삭제
- joinVars 호출 → 직접 값 사용
- 8줄 삭제

### Commit 4: createSimplePaletteValueFilter 제거
```
7c0d5cb5 [AppBar 단순화 4/14] createSimplePaletteValueFilter 삭제
```
- palette 필터링 함수 import 삭제
- 1줄 삭제

### Commit 5: useDefaultProps 제거
```
d96742d1 [AppBar 단순화 5/14] useDefaultProps 삭제
```
- 테마 기본값 병합 훅 삭제
- inProps → props로 변경
- 함수 파라미터 기본값 사용
- 3줄 삭제

### Commit 6: 클래스 시스템 제거
```
0cbf886c [AppBar 단순화 6/14] capitalize, useUtilityClasses, composeClasses, overridesResolver 삭제
```
- useUtilityClasses 함수 삭제
- composeClasses, getAppBarUtilityClass import 삭제
- capitalize import 삭제
- overridesResolver 삭제
- styled 두 번째 인자 (name, slot, overridesResolver) 삭제
- 29줄 삭제

### Commit 7: memoTheme 제거
```
ef1132bd [AppBar 단순화 7/14] memoTheme 삭제 및 스타일 단순화
```
- memoTheme import 및 호출 삭제
- theme 파라미터 삭제
- theme.zIndex.appBar → 1100
- theme.palette.primary.main → #1976d2
- theme.palette.primary.contrastText → #fff
- theme.applyStyles('dark') 삭제
- 68줄 삭제

### Commit 8: Color Variant 통합
```
a506215a [AppBar 단순화 8/14] color variant를 기본 스타일로 통합
```
- color variant를 기본 스타일로 이동
- CSS 변수는 유지
- 9줄 삭제

### Commit 9: ownerState 제거
```
22808705 [AppBar 단순화 9/14] ownerState 삭제
```
- ownerState 객체 생성 삭제
- position prop 직접 전달
- 7줄 삭제

### Commit 10: Styled 시스템 제거
```
1d9ac770 [AppBar 단순화 10/14] styled 시스템 제거 및 인라인 스타일 변환
```
- styled(Paper) → 일반 header 태그
- AppBarRoot 컴포넌트 삭제
- variants 시스템 삭제
- CSS 변수 삭제
- Paper import 삭제
- elevation, square prop 제거
- positionStyles 로직 추가
- 인라인 style 사용
- 73줄 삭제

### Commit 11: PropTypes 제거
```
9be2be63 [AppBar 단순화 11/14] PropTypes 삭제
```
- PropTypes import 삭제
- AppBar.propTypes 전체 삭제 (68줄)
- JSDoc 주석 삭제
- 124줄 삭제

## 원본과의 차이점

| 항목 | 원본 | 단순화 |
|------|------|--------|
| **코드 라인** | 277줄 | 54줄 (-80.5%) |
| **의존성** | 10개+ | 1개 (React만) |
| **베이스** | styled(Paper) | header 태그 |
| **스타일** | memoTheme + variants | 인라인 style |
| **color** | 9가지 + 동적 | primary 고정 |
| **position** | 5가지 | 5가지 (유지) |
| **다크 모드** | 지원 | 미지원 |
| **elevation** | 0-24 (Paper) | 고정 boxShadow |
| **테마 통합** | 완전 통합 | 없음 |
| **CSS 클래스** | 자동 생성 | 없음 (mui-fixed만) |
| **PropTypes** | 68줄 | 없음 |

### 단순화
```javascript
<header
  style={{
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    boxSizing: 'border-box',
    flexShrink: 0,
    backgroundColor: '#1976d2',
    color: '#fff',
    boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), ...',
    ...positionStyles,
    ...style,
  }}
/>
```
