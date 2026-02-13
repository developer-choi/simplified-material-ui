# ListSubheader

> 리스트 섹션 헤더 (단순화)

## 핵심 기능
- lineHeight: 48px, fontSize: 14px, fontWeight: 500
- 세 가지 color 모드:
  - default: rgba(0, 0, 0, 0.6) (고정 값)
  - primary: #1976d2 (고정 값)
  - inherit: 상속
- disableGutters: false일 때 paddingLeft/Right: 16
- inset: true일 때 paddingLeft: 72 (gutters 덮어씀)
- disableSticky: false일 때 position: sticky, top: 0, zIndex: 1, backgroundColor: #fff
- component 폴리모피즘 지원 (기본값: 'li')
- muiSkipListHighlight = true 속성 유지

## 변경 사항
- 184줄 → 70줄 (62% 감소)
- styled 제거 → 인라인 스타일
- memoTheme 제거 → 모든 테마 값 고정
- PropTypes 제거
- useUtilityClasses, composeClasses 제거
- useDefaultProps 제거

## 테마 값 변환
- theme.typography.fontFamily → 'Roboto, "Helvetica Neue", Arial, sans-serif'
- theme.typography.fontWeightMedium → 500
- theme.typography.pxToRem(14) → '14px'
- theme.palette.text.secondary → 'rgba(0, 0, 0, 0.6)'
- theme.palette.primary.main → '#1976d2'
- theme.palette.background.paper → '#fff'

## 스타일 우선순위
baseStyle → colorStyle → gutterStyle → insetStyle → stickyStyle

## 중요
- ListContext를 사용하지 않음 (독립적인 컴포넌트)
- muiSkipListHighlight 속성은 하이라이트 스킵용으로 유지
- component 폴리모피즘 완전 지원
