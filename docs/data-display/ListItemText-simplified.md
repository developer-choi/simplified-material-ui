# ListItemText

> List item의 primary/secondary 텍스트 표시 (단순화)

## 핵심 기능
- primary 텍스트 표시 (primary prop 또는 children)
- secondary 텍스트 표시 (optional)
- Typography로 자동 래핑 (disableTypography=false)
- ListContext에서 dense 읽기
- dense일 때 primary variant: body2 (기본: body1)
- secondary variant: body2 with textSecondary color
- inset prop: paddingLeft 56 추가

## 변경 사항
- 239줄 → 69줄 (71% 감소)
- styled 제거 → 인라인 스타일
- **useSlot 제거** (slots/slotProps 불가)
- Deprecated props 제거 (primaryTypographyProps, secondaryTypographyProps)
- PropTypes 제거
- useUtilityClasses, composeClasses 제거

## 제거된 기능 (Breaking Changes)
- **slots/slotProps 커스터마이징** - root, primary, secondary 슬롯 교체 불가
- primaryTypographyProps (deprecated)
- secondaryTypographyProps (deprecated)
- classes prop

## 유지된 기능
- primary/secondary 텍스트 렌더링
- Typography 자동 래핑 (display: block)
- dense 모드 지원 (ListContext)
- inset prop (paddingLeft: 56)
- disableTypography prop
- Typography.type 체크
- 조건부 margin (4 또는 6)
