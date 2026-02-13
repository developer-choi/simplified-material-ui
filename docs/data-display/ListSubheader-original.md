# ListSubheader

> 리스트 섹션 헤더

## 핵심 기능
- lineHeight: 48px, fontSize: 14px, fontWeight: 500
- color: theme.palette.text.secondary (기본값)
- color variants: default, primary, inherit
- disableGutters: false일 때 paddingLeft/Right: 16
- inset: true일 때 paddingLeft: 72
- disableSticky: false일 때 position: sticky, top: 0, zIndex: 1, backgroundColor: theme.palette.background.paper
- component 폴리모피즘 지원 (기본값: 'li')
- muiSkipListHighlight = true (특수 속성)

## 184줄

## 중요
- ListContext를 사용하지 않음 (다른 List 컴포넌트와 다름)
- muiSkipListHighlight 속성 유지 필요
