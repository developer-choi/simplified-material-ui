# ListItemIcon

> Icon 래퍼 (단순화)

## 핵심 기능
- minWidth: 56, flexShrink: 0, display: inline-flex
- color: rgba(0, 0, 0, 0.54) (고정 값)
- ListContext에서 alignItems 읽기
- alignItems === 'flex-start'일 때 marginTop: 8

## 변경 사항
- 102줄 → 31줄 (70% 감소)
- styled 제거 → 인라인 스타일
- memoTheme 제거 → 고정 color 값
- PropTypes 제거
