# ListItemSecondaryAction

> Secondary Action 영역 (단순화)

## 핵심 기능
- position: absolute, top: 50%, transform: translateY(-50%)
- ListContext에서 disableGutters 읽기
- right: disableGutters ? 0 : 16 (조건부)

## 변경 사항
- 96줄 → 34줄 (65% 감소)
- styled 제거 → 인라인 스타일
- PropTypes 제거
- useUtilityClasses, composeClasses 제거
- 모든 스타일 값이 하드코딩됨 (테마 값 없음)

## 중요
- DEPRECATED: ListItem의 secondaryAction prop 사용 권장
- muiName 속성 유지
