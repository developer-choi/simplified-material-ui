# Dialog 컴포넌트

> Material-UI의 Dialog 컴포넌트 원본 구조 분석

---

## 무슨 기능을 하는가?

Dialog는 **Modal을 감싸서 대화상자 UI를 제공하는 고수준 컴포넌트**입니다.

### 핵심 기능
1. **Modal 기반** - Modal의 모든 기능 상속
2. **Paper 스타일** - Material Design의 "종이" 메타포 구현
3. **중앙 정렬** - 화면 중앙에 대화상자 배치
4. **스크롤 모드** - paper/body 두 가지 스크롤 방식
5. **크기 제어** - maxWidth, fullWidth, fullScreen
6. **Fade 애니메이션** - 부드러운 등장/사라짐 효과
7. **DialogContext** - 하위 컴포넌트와 통신 (DialogTitle, DialogContent 등)
8. **ARIA 속성** - role="dialog", aria-modal, aria-labelledby 등

---

## 내부 구조

### 1. 컴포넌트 계층

```javascript
// 위치: packages/mui-material/src/Dialog/Dialog.js (548줄)

Dialog (고수준 API)
  └─> DialogRoot (= Modal)
       └─> TransitionSlot (= Fade)
            └─> DialogContainer (중앙 정렬 + 스크롤 처리)
                 └─> DialogPaper (= Paper, 카드 모양)
                      └─> DialogContext.Provider
                           └─> children
```

### 2. Styled Components

**DialogRoot = Modal** (46-54줄):
```javascript
const DialogRoot = styled(Modal)({
  '@media print': {
    // 인쇄 시 absolute로 변경
    position: 'absolute !important',
  },
});
```

**DialogContainer** (56-100줄):
```javascript
const DialogContainer = styled('div')({
  height: '100%',
  outline: 0,
  variants: [
    {
      props: { scroll: 'paper' },
      style: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',  // 중앙 정렬
      },
    },
    {
      props: { scroll: 'body' },
      style: {
        overflowY: 'auto',  // 전체 스크롤
        textAlign: 'center',
      },
    },
  ],
});
```

**DialogPaper** (102-204줄):
```javascript
const DialogPaper = styled(Paper)(
  memoTheme(({ theme }) => ({
    margin: 32,
    position: 'relative',
    overflowY: 'auto',
    variants: [
      // scroll: paper
      {
        props: { scroll: 'paper' },
        style: {
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100% - 64px)',
        },
      },
      // maxWidth: xs, sm, md, lg, xl
      {
        props: { maxWidth: 'xs' },
        style: {
          maxWidth: Math.max(theme.breakpoints.values.xs, 444),
        },
      },
      // fullWidth
      {
        props: ({ ownerState }) => ownerState.fullWidth,
        style: {
          width: 'calc(100% - 64px)',
        },
      },
      // fullScreen
      {
        props: ({ ownerState }) => ownerState.fullScreen,
        style: {
          margin: 0,
          width: '100%',
          maxWidth: '100%',
          height: '100%',
          maxHeight: 'none',
          borderRadius: 0,
        },
      },
    ],
  })),
);
```

### 3. 주요 Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `open` | boolean | **required** | 대화상자 표시 여부 |
| `onClose` | function | - | 닫기 콜백 |
| `children` | node | - | 대화상자 내용 |
| `maxWidth` | 'xs'\|'sm'\|'md'\|'lg'\|'xl'\|false | 'sm' | 최대 너비 |
| `fullWidth` | boolean | false | maxWidth까지 너비 채우기 |
| `fullScreen` | boolean | false | 전체 화면 모드 |
| `scroll` | 'paper'\|'body' | 'paper' | 스크롤 방식 |
| `TransitionComponent` | elementType | Fade | 애니메이션 컴포넌트 |
| `transitionDuration` | number\|object | theme.transitions.duration | 애니메이션 지속 시간 |
| `PaperComponent` | elementType | Paper | Paper 커스터마이징 |
| `BackdropComponent` | elementType | Backdrop | Backdrop 커스터마이징 |
| `disableEscapeKeyDown` | boolean | false | ESC 키 비활성화 |

### 4. Backdrop 클릭 처리 (정교한 버전)

Dialog는 Modal보다 더 정교한 Backdrop 클릭 감지를 구현합니다:

```javascript
const backdropClick = React.useRef();

const handleMouseDown = (event) => {
  // mouseDown 시점에 backdrop인지 체크
  backdropClick.current = event.target === event.currentTarget;
};

const handleBackdropClick = (event) => {
  if (onClick) {
    onClick(event);  // onClick prop 실행
  }

  // mouseDown과 onClick이 모두 같은 요소에서 발생했는지 확인
  if (!backdropClick.current) {
    return;
  }

  backdropClick.current = null;

  if (onClose) {
    onClose(event, 'backdropClick');
  }
};
```

**왜 이렇게?**
- 모달 내부를 mouseDown → backdrop으로 드래그 → mouseUp 하는 경우 방지
- 두 이벤트 모두 backdrop에서 발생해야 닫힘

### 5. DialogContext

**목적**: DialogTitle, DialogContent, DialogActions 등 하위 컴포넌트와 통신

```javascript
const ariaLabelledby = useId(ariaLabelledbyProp);

const dialogContextValue = React.useMemo(() => {
  return { titleId: ariaLabelledby };
}, [ariaLabelledby]);

// 렌더링 시
<DialogContext.Provider value={dialogContextValue}>
  {children}
</DialogContext.Provider>
```

**사용 예시**:
```javascript
// DialogTitle.js
const { titleId } = React.useContext(DialogContext);

return (
  <div id={titleId}>  {/* 자동으로 id 부여 */}
    {children}
  </div>
);
```

### 6. ARIA 속성

```javascript
<PaperSlot
  role="dialog"                          // 대화상자 역할
  aria-modal={ariaModal}                 // 모달인지 (기본 true)
  aria-labelledby={ariaLabelledby}      // 제목 요소 ID (자동 생성)
  aria-describedby={ariaDescribedby}    // 설명 요소 ID
>
```

### 7. 스크롤 모드

**scroll="paper"** (기본값):
- Paper 내부만 스크롤
- Dialog 크기는 고정
- 중앙 정렬 유지

```css
.MuiDialog-container {
  display: flex;
  justify-content: center;
  alignItems: center;
}

.MuiDialog-paper {
  max-height: calc(100% - 64px);
  overflow-y: auto;
}
```

**scroll="body"**:
- 전체 페이지 스크롤
- Dialog가 페이지에 포함됨
- 긴 콘텐츠에 유용

```css
.MuiDialog-container {
  overflow-y: auto;
  text-align: center;
}

.MuiDialog-paper {
  display: inline-block;
  vertical-align: middle;
}
```

### 8. Transition 통합

```javascript
const [TransitionSlot, transitionSlotProps] = useSlot('transition', {
  elementType: Fade,
  externalForwardedProps,
  ownerState,
  additionalProps: {
    appear: true,
    in: open,
    timeout: transitionDuration,
    role: 'presentation',
  },
});
```

**Fade 컴포넌트**:
- opacity 0 → 1 (등장)
- opacity 1 → 0 (사라짐)
- duration: theme.transitions.duration (225ms enter, 195ms exit)

### 9. Slot 시스템

Dialog는 5개의 슬롯을 제공합니다:

```javascript
<Dialog
  slots={{
    root: CustomModal,
    backdrop: CustomBackdrop,
    container: CustomContainer,
    paper: CustomPaper,
    transition: CustomTransition,
  }}
  slotProps={{
    paper: { elevation: 8 },
    backdrop: { timeout: 1000 },
  }}
>
```

### 10. 렌더링 구조 (342-378줄)

```javascript
return (
  <RootSlot  /* = Modal */
    closeAfterTransition
    slots={{ backdrop: BackdropSlot }}
    slotProps={{
      backdrop: {
        transitionDuration,
        as: BackdropComponent,
        ...backdropSlotProps,
      },
    }}
    disableEscapeKeyDown={disableEscapeKeyDown}
    onClose={onClose}
    open={open}
    onClick={handleBackdropClick}
    {...rootSlotProps}
    {...other}
  >
    <TransitionSlot {...transitionSlotProps}>
      <ContainerSlot onMouseDown={handleMouseDown} {...containerSlotProps}>
        <PaperSlot
          as={PaperComponent}
          elevation={24}
          role="dialog"
          aria-describedby={ariaDescribedby}
          aria-labelledby={ariaLabelledby}
          aria-modal={ariaModal}
          {...paperSlotProps}
        >
          <DialogContext.Provider value={dialogContextValue}>
            {children}
          </DialogContext.Provider>
        </PaperSlot>
      </ContainerSlot>
    </TransitionSlot>
  </RootSlot>
);
```

---

## 설계 패턴

### 1. Composition Pattern
Dialog = Modal + Container + Paper + Transition + Context

각 계층은 독립적이며, 필요시 교체 가능합니다.

### 2. Slot Pattern
모든 내부 컴포넌트를 슬롯으로 노출하여 커스터마이징 가능

### 3. Context Pattern
DialogContext로 하위 컴포넌트와 암묵적으로 통신

### 4. Responsive Design
maxWidth가 breakpoint 기반으로 작동:
```javascript
{
  props: { maxWidth: 'sm' },
  style: {
    maxWidth: `${theme.breakpoints.values.sm}${theme.breakpoints.unit}`,
  },
}
```

---

## 복잡도의 이유

Dialog는 **548줄**이며, 복잡한 이유는:

1. **5개 Slot 관리** - root, backdrop, container, paper, transition
2. **반응형 maxWidth** - 5개 breakpoint 각각 스타일 정의
3. **2가지 스크롤 모드** - paper/body에 따른 레이아웃 변경
4. **Backward Compatibility** - PaperComponent, TransitionComponent 등 deprecated props 지원
5. **Theme 통합** - breakpoints, transitions, elevation 등
6. **PropTypes** - 약 160줄
