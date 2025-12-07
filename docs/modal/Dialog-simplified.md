# Dialog 컴포넌트

> Dialog를 최소한의 구조로 단순화 - Modal의 얇은 래퍼

---

## 무슨 기능을 하는가?

수정된 Dialog는 **Modal을 감싸서 중앙 정렬된 대화상자를 제공하는 단순한 래퍼**입니다.

### 핵심 기능 (남은 것)
1. **Modal 래핑** - Modal의 기능 그대로 사용
2. **중앙 정렬** - DialogContainer로 화면 중앙 배치
3. **Paper 스타일** - 고정된 카드 디자인
4. **ARIA 속성** - role="dialog", aria-modal, aria-labelledby

### 제거된 기능
1. ❌ Transition/Fade 애니메이션
2. ❌ 스크롤 모드 (paper/body)
3. ❌ maxWidth, fullWidth, fullScreen props
4. ❌ Slot 시스템
5. ❌ DialogContext
6. ❌ 테마 통합
7. ❌ Backdrop 클릭 세밀한 처리
8. ❌ PaperComponent, TransitionComponent 커스터마이징

---

## 내부 구조

### 1. 컴포넌트 구조

```javascript
// 위치: packages/mui-material/src/Dialog/Dialog.js (94줄, 원본 548줄)

Dialog
  └─> Modal (Modal.js의 단순화된 버전)
       └─> DialogContainer (중앙 정렬)
            └─> DialogPaper (고정 스타일)
                 └─> children
```

### 2. DialogContainer (6-25줄)

```javascript
const DialogContainer = React.forwardRef(function DialogContainer(props, ref) {
  const { children, style, ...other } = props;
  return (
    <div
      ref={ref}
      role="presentation"
      {...other}
      style={{
        height: '100%',
        outline: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',  // 항상 중앙 정렬
        ...style,
      }}
    >
      {children}
    </div>
  );
});
```

### 3. DialogPaper (27-53줄)

```javascript
const DialogPaper = React.forwardRef(function DialogPaper(props, ref) {
  const { children, style, ...other } = props;
  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      {...other}
      style={{
        margin: 32,
        position: 'relative',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(100% - 64px)',
        maxWidth: '600px',                    // 고정
        width: 'calc(100% - 64px)',
        backgroundColor: '#fff',              // 고정
        borderRadius: 4,                      // 고정
        boxShadow: '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)',  // elevation 24
        ...style,
      }}
    >
      {children}
    </div>
  );
});
```

**고정된 스타일**:
- `maxWidth: 600px` (원본은 'sm' breakpoint)
- `backgroundColor: #fff`
- `borderRadius: 4px`
- `boxShadow: elevation 24` (Material Design)

### 4. Props (5개만 남음)

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `open` | boolean | **required** | 대화상자 표시 여부 |
| `onClose` | function | - | 닫기 콜백 |
| `children` | node | - | 대화상자 내용 |
| `disableEscapeKeyDown` | boolean | false | ESC 키 비활성화 |
| `aria-describedby` | string | - | 설명 요소 ID |
| `aria-labelledby` | string | - | 제목 요소 ID (자동 생성) |

### 5. Dialog 컴포넌트 (58-91줄)

```javascript
const Dialog = React.forwardRef(function Dialog(inProps, ref) {
  const {
    'aria-describedby': ariaDescribedby,
    'aria-labelledby': ariaLabelledbyProp,
    children,
    className,
    disableEscapeKeyDown = false,
    onClose,
    open,
    ...other
  } = inProps;

  const ariaLabelledby = useId(ariaLabelledbyProp);

  return (
    <Modal
      ref={ref}
      className={className}
      disableEscapeKeyDown={disableEscapeKeyDown}
      onClose={onClose}
      open={open}
      {...other}
    >
      <DialogContainer>
        <DialogPaper
          aria-describedby={ariaDescribedby}
          aria-labelledby={ariaLabelledby}
        >
          {children}
        </DialogPaper>
      </DialogContainer>
    </Modal>
  );
});
```

---

## 커밋 히스토리로 보는 단순화 과정

Dialog는 **45개의 커밋**을 통해 단순화되었으며, Modal과 FocusTrap의 변경 사항을 모두 포함합니다.

### Dialog 전용 커밋 (19개)

#### 1단계: Slot 시스템 제거
- `2b80ce8c` - Dialog에 Slot 삭제 (122줄 변경)

#### 2단계: Transition 제거
- `c7adbd14` - Dialog에서 Transition 다 삭제 (81줄 변경)
- Fade, Grow 등 애니메이션 컴포넌트 제거

#### 3단계: Component Props 제거
- `c49dd05d` - BackdropComponent 고정
- `0bb97028` - PaperComponent 고정

#### 4단계: Layout Props 제거
- `12d5d63d` - fullScreen prop 삭제
- `d9e0dce3` - fullWidth prop 삭제
- `6406e2ae` - maxWidth prop 삭제 (breakpoint 반응형 제거)
- `89ab41ad` - scroll prop 삭제 (항상 paper 모드)

#### 5단계: 이벤트 Props 제거
- `c635fc56` - onClick prop 삭제

#### 6단계: 테마 시스템 제거
- `2cbc4407` - useDefaultProps 삭제
- `72ad74e0` - useUtilityClasses, composeClasses 삭제
- `054e6ff1` - memoTheme 삭제

#### 7단계: 스타일 단순화
- `017c123a` - classes, sx, ownerState 등 스타일 시스템 삭제
- `5ec31173` - Dialog 구현 단순화, styled 제거, 인라인 스타일로 전환 (164줄 변경)

#### 8단계: 컴포넌트 재구성
- `8f2f5d7a` - DialogContainer, DialogPaper 컴포넌트 재도입 (82줄 변경)
- 가독성 향상을 위해 인라인 스타일을 별도 컴포넌트로 분리

#### 9단계: Context 제거
- `8da250ba` - DialogContext 기능 삭제

---

## 원본과의 차이점

| 항목 | 원본 | 수정본 |
|------|------|--------|
| **코드 라인** | 548줄 | 94줄 (83% 감소) |
| **Props 개수** | 15개 | 5개 |
| **styled 사용** | ✅ (4개 컴포넌트) | ❌ |
| **테마 통합** | ✅ | ❌ |
| **Transition** | ✅ Fade | ❌ |
| **DialogContext** | ✅ | ❌ |
| **maxWidth** | xs/sm/md/lg/xl | ❌ (600px 고정) |
| **fullWidth** | ✅ | ❌ |
| **fullScreen** | ✅ | ❌ |
| **scroll 모드** | paper/body | ❌ (항상 paper) |
| **Backdrop 클릭** | 정교한 처리 | 기본 처리 (Modal에서) |

---

## 스타일 비교

### 원본 (테마 기반)
```javascript
const DialogPaper = styled(Paper)(
  memoTheme(({ theme }) => ({
    margin: 32,
    maxWidth: theme.breakpoints.values.sm,  // 600px (반응형)
    variants: [
      // maxWidth별 5가지 variant
      // fullWidth, fullScreen variant
      // scroll 모드별 variant
    ],
  })),
);
```

### 수정본 (고정 값)
```javascript
const DialogPaper = React.forwardRef(function DialogPaper(props, ref) {
  return (
    <div style={{
      margin: 32,
      maxWidth: '600px',  // 하드코딩
      backgroundColor: '#fff',
      borderRadius: 4,
      boxShadow: '...',  // elevation 24
    }}>
      {children}
    </div>
  );
});
```

---

## 설계 철학의 변화

### 원본: "Material Design 완벽 구현"
- 반응형 breakpoint
- 2가지 스크롤 모드
- fullScreen, fullWidth 등 다양한 레이아웃
- DialogContext로 하위 컴포넌트 통합

### 수정본: "최소한의 대화상자"
- 고정된 크기 (600px)
- 중앙 정렬만 지원
- Modal의 얇은 래퍼
- ARIA 속성만 추가

---

## 사용 예시

```javascript
import Dialog from './Dialog';

function App() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Open Dialog</button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <h2 id="dialog-title">Dialog Title</h2>
        <p id="dialog-description">Dialog content goes here</p>
        <button onClick={() => setOpen(false)}>Close</button>
      </Dialog>
    </>
  );
}
```

---

## 제한 사항

1. **크기 고정** - maxWidth=600px, 변경 불가
2. **레이아웃 고정** - 항상 중앙 정렬, fullScreen 불가
3. **스크롤 모드 고정** - 항상 paper 내부만 스크롤
4. **애니메이션 없음** - 즉시 등장/사라짐
5. **DialogContext 없음** - DialogTitle과 자동 연결 안 됨

---

## 장단점

### 장점
- ✅ 극도로 단순함 (94줄)
- ✅ Modal의 모든 기능 사용 가능
- ✅ ARIA 속성 자동 처리
- ✅ 학습 곡선 거의 없음

### 단점
- ❌ 커스터마이징 불가
- ❌ 반응형 아님 (600px 고정)
- ❌ DialogTitle, DialogContent 등 서브 컴포넌트 미지원
- ❌ 프로덕션 부적합

---

*분석 일자: 2025-12-07*
*브랜치: fix/dialog*
*파일: packages/mui-material/src/Dialog/Dialog.js*
*커밋 수: 45개 (Dialog 전용 19개)*
*코드 감소: 454줄 (-83%)*
