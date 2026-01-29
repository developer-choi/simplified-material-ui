# Select 컴포넌트 분석 순서

## 목표

Select 컴포넌트를 단순화하기 위해 의존성이 낮은 컴포넌트부터 순차적으로 분석

## 현재 진행 상황

**완료**: 1~8단계 (Menu 패키지 + Form 기반 컴포넌트)
**진행 예정**: 9~11단계 (Select 패키지)

---

## 의존성 그래프

```
Select (packages/mui-material/src/Select/)  ← 최종 목표
├── SelectInput (packages/mui-material/src/Select/SelectInput.js)
│   └── Menu (packages/menu/Menu/) ✅ 완료
│       └── MenuList (packages/menu/MenuList/) ✅ 완료
│           └── MenuItem (packages/menu/MenuItem/) ✅ 완료
├── FormControl (packages/form/FormControl/) ✅ 완료
├── InputBase (packages/form/InputBase/) ✅ 완료
├── Input (packages/form/Input/) ✅ 완료
├── FilledInput (packages/form/FilledInput/) ✅ 완료
├── OutlinedInput (packages/form/OutlinedInput/) ✅ 완료
└── NativeSelectInput (packages/mui-material/src/NativeSelect/) ❌ 미정
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

## 전체 분석 순서 (최신화)

| 순서 | 컴포넌트 | 경로 | 상태 | 문서 |
|------|---------|------|------|------|
| 1 | MenuItem | `packages/menu/MenuItem/` | ✅ 완료 | -original.md, -simplified.md |
| 2 | MenuList | `packages/menu/MenuList/` | ✅ 완료 | -original.md, -simplified.md |
| 3 | Menu | `packages/menu/Menu/` | ✅ 완료 | -original.md, -simplified.md |
| 4 | InputBase | `packages/form/InputBase/` | ✅ 완료 | -original.md, -simplified.md |
| 5 | FormControl | `packages/form/FormControl/` | ✅ 완료 | -original.md, -simplified.md |
| 6 | Input | `packages/form/Input/` | ✅ 완료 | -original.md, -simplified.md |
| 7 | FilledInput | `packages/form/FilledInput/` | ✅ 완료 | -original.md, -simplified.md |
| 8 | OutlinedInput | `packages/form/OutlinedInput/` | ✅ 완료 | -original.md, -simplified.md |
| 9 | NativeSelectInput | `packages/mui-material/src/NativeSelect/` | ⏸️ 대기 | - |
| 10 | SelectInput | `packages/mui-material/src/Select/SelectInput.js` | 🎯 다음 | - |
| 11 | Select | `packages/mui-material/src/Select/Select.js` | ⏸️ 대기 | - |

**범례**:
- ✅ 완료: 단순화 및 문서화 완료
- 🎯 다음: 바로 다음에 분석할 컴포넌트
- ⏸️ 대기: 분석 전

---

## 분석 우선순위 (최신화)

### 높음 (반드시 분석)
1. **SelectInput** 🎯 - 핵심 로직, Menu를 사용하는 드롭다운 구현
2. **Select** - 최종 목표, SelectInput 래퍼

### 중간 (이해만)
3. **NativeSelectInput** - 네이티브 `<select>` 구현 (별도 분석 가능)

### 완료됨 (이미 단순화 완료)
4. **Menu** ✅ - 드롭다운 표시
5. **MenuItem** ✅ - 옵션 아이템
6. **MenuList** ✅ - 옵션 리스트
7. **FormControl** ✅ - 상태 관리
8. **InputBase** ✅ - 공통 기반
9. **Input/FilledInput/OutlinedInput** ✅ - 스타일 변형

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

## 권장 작업 흐름

### ✅ Phase 1: Menu 패키지 분석 (완료)
```
MenuItem → MenuList → Menu
```
- 각각의 original.md, simplified.md 작성 완료
- 단순화 완료

### ✅ Phase 2: Form 기반 분석 (완료)
```
InputBase → FormControl → Input variants
```
- 각각의 original.md, simplified.md 작성 완료
- 단순화 완료

### 🎯 Phase 3: Select 분석 (진행 예정)
```
SelectInput → Select
```
- 최종 목표
- Menu와 Form 기반을 통합
- NativeSelectInput은 선택 사항 (넣으면 9단계)

---

## 다음 단계 (현재: 2025-01-29)

### 🎯 바로 다음: SelectInput 분석

**파일 위치**: `packages/mui-material/src/Select/SelectInput.js`

**왜 SelectInput부터인가?**
1. Select의 핵심 로직을 담고 있음
2. Menu를 사용하여 드롭다운 구현
3. FormControl과 InputBase를 사용하여 상태 관리
4. Select는 단순히 SelectInput을 감싸는 래퍼

**예상 복잡도**: 높음
- Menu와의 통합 로직
- 아이템 선택/해제
- 포커스 관리
- multiple 모드 지원

**작업 순서**:
1. SelectInput.js 파일 분석
2. `docs/select/SelectInput-original.md` 작성
3. 단순화 계획 수립
4. 단순화 실행
5. `docs/select/SelectInput-simplified.md` 작성

---

## 진행 상황 요약

### 완료된 작업 (1~8단계)

**Menu 패키지 (3개)**:
- MenuItem: 35줄 (원본 206줄)
- MenuList: 90줄 (원본 346줄)
- Menu: 45줄 (원본 383줄)

**Form 기반 (5개)**:
- InputBase: 190줄 (원본 297줄, 이전 848줄)
- FormControl: 132줄 (원본 352줄)
- Input: 94줄
- FilledInput: 130줄
- OutlinedInput: 181줄

**총 코드 라인 감소**: 약 2,500줄 → 약 900줄 (64% 감소)

### 남은 작업 (9~11단계)

- NativeSelectInput (선택 사항)
- SelectInput (필수)
- Select (필수)
