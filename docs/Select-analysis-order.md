# Select 컴포넌트 분석 순서

## 목표

Select 컴포넌트를 단순화하기 위해 의존성이 낮은 컴포넌트부터 순차적으로 분석

---

## 의존성 그래프

```
Select (mui-material/src/Select)  ← 최종 목표
├── SelectInput (mui-material/src/Select)
│   └── Menu (menu/Menu) ← 기반
│       └── MenuList (menu/MenuList)
│           └── MenuItem (menu/MenuItem) ← 최하위
├── FormControl (form/FormControl) ← 기반
├── InputBase (form/InputBase) ← 기반
├── Input (form/Input) ← InputBase 기반
├── FilledInput (form/FilledInput) ← InputBase 기반
├── OutlinedInput (form/OutlinedInput) ← InputBase 기반
└── NativeSelectInput (NativeSelect) ← 별도 구현
```

---

## 분석 순서 (의존성이 낮은 것 → 높은 것)

### 1단계: Menu 패키지 (최하위)

| 순서 | 컴포넌트 | 경로 | 비고 |
|------|---------|------|------|
| 1-1 | **MenuItem** | `packages/menu/MenuItem/` | MenuList의 자식, 최하위 |
| 1-2 | **MenuList** | `packages/menu/MenuList/` | MenuItem을 감싸는 컨테이너 |
| 1-3 | **Menu** | `packages/menu/Menu/` | MenuList를 감싸는 드롭다운 메뉴 |

**왜 이 순서인가?**
- Menu는 독립적인 패키지 (mui-material이 아님)
- MenuItem → MenuList → Menu 순으로 의존
- Select가 Menu를 사용하므로 먼저 분석 필요

### 2단계: Form 기반 컴포넌트

| 순서 | 컴포넌트 | 경로 | 비고 |
|------|---------|------|------|
| 2-1 | **InputBase** | `packages/mui-material/src/form/InputBase/` | 모든 Input의 기반 |
| 2-2 | **FormControl** | `packages/mui-material/src/form/FormControl/` | Form 상태 관리 |
| 2-3 | **Input** | `packages/mui-material/src/form/Input/` | InputBase 기반 (standard) |
| 2-4 | **FilledInput** | `packages/mui-material/src/form/FilledInput/` | InputBase 기반 (filled) |
| 2-5 | **OutlinedInput** | `packages/mui-material/src/form/OutlinedInput/` | InputBase 기반 (outlined) |

**왜 이 순서인가?**
- InputBase가 모든 Input의 기반
- FormControl이 상태를 제공
- Select가 이들을 사용

### 3단계: Select 관련

| 순서 | 컴포넌트 | 경로 | 비고 |
|------|---------|------|------|
| 3-1 | **NativeSelectInput** | `packages/mui-material/src/NativeSelect/` | `<select>` 네이티브 구현 |
| 3-2 | **SelectInput** | `packages/mui-material/src/Select/SelectInput.js` | Menu 기반 드롭다운 로직 |
| 3-3 | **Select** | `packages/mui-material/src/Select/Select.js` | 최종 사용자 인터페이스 |

**왜 이 순서인가?**
- SelectInput이 NativeSelectInput과 Menu에 의존
- Select가 SelectInput과 Form Input들을 사용

---

## 전체 분석 순서 (최종)

```
1. MenuItem (menu/MenuItem)
2. MenuList (menu/MenuList)
3. Menu (menu/Menu)
4. InputBase (form/InputBase)
5. FormControl (form/FormControl)
6. Input (form/Input)
7. FilledInput (form/FilledInput)
8. OutlinedInput (form/OutlinedInput)
9. NativeSelectInput (NativeSelect)
10. SelectInput (Select/SelectInput.js)
11. Select (Select/Select.js) ← 최종 목표
```

---

## 각 단계에서 확인할 사항

### 1단계: Menu 패키지
- MenuItem이 무엇인가 (옵션 아이템)
- MenuList가 무엇인가 (옵션 리스트)
- Menu가 무엇인가 (드롭다운 컨테이너)

### 2단계: Form 기반
- InputBase가 무엇을 제공하는가 (공통 기반)
- FormControl이 무엇을 제공하는가 (상태 관리)
- 각 Input variant가 어떻게 다른가

### 3단계: Select
- NativeSelectInput vs SelectInput의 차이
- SelectInput이 Menu를 어떻게 사용하는가
- Select가 어떻게 통합하는가

---

## 분석 우선순위

### 높음 (반드시 분석)
1. **Select** - 최종 목표
2. **SelectInput** - 핵심 로직
3. **Menu** - 드롭다운 표시
4. **MenuItem** - 옵션 아이템

### 중간 (이해만)
5. **FormControl** - 상태 관리 (복잡하면 단순화)
6. **InputBase** - 공통 기반

### 낮음 (스킵 가능)
7. **MenuList** - 단순 컨테이너
8. **Input/FilledInput/OutlinedInput** - 스타일만 다름
9. **NativeSelectInput** - 네이티브 `<select>` 구현 (별도 분석)

---

## 권장 작업流程

### Phase 1: Menu 패키지 분석 (1~3)
```
MenuItem → MenuList → Menu
```
- 각각의 original.md, simplified.md 작성
- 단순화 여부 결정

### Phase 2: Form 기반 분석 (4~8)
```
InputBase → FormControl → Input variants
```
- 복잡도가 높으면 스킵 가능
- 필요한 부분만 참고

### Phase 3: Select 분석 (9~11)
```
NativeSelectInput → SelectInput → Select
```
- 최종 목표
- Menu와 Form 기반을 통합

---

## 다음 단계

1. 이 문서를 `docs/Select-analysis-order.md`로 저장
2. **MenuItem** 분석 시작 (가장 의존성이 낮음)
