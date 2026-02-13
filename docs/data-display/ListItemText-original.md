# ListItemText

> List item의 primary/secondary 텍스트 표시

## 핵심 기능
- primary 텍스트 표시 (primary prop 또는 children)
- secondary 텍스트 표시 (optional)
- Typography로 자동 래핑 (disableTypography=false)
- ListContext에서 dense 읽기
- dense일 때 primary variant: body2 (기본: body1)
- secondary variant: body2 with textSecondary color
- inset prop: paddingLeft 56 추가

## 스타일
- flex: 1 1 auto, minWidth: 0
- marginTop/Bottom: 4 (기본), 6 (둘 다 있을 때)
- paddingLeft: 56 (inset)

## 239줄

## 복잡도
- **useSlot 사용** (3 slots: root, primary, secondary)
- slots/slotProps로 완전한 커스터마이징 가능
- Deprecated props: primaryTypographyProps, secondaryTypographyProps
