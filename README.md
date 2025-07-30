# DNG to PNG Converter

TypeScript로 구현된 DNG(Digital Negative) 파일을 PNG로 변환하는 웹 애플리케이션입니다.

## 기능

- 🔄 DNG 파일을 PNG 파일로 변환
- 🌐 웹 인터페이스를 통한 파일 업로드
- 📱 반응형 웹 디자인
- ⚡ WASM 기반 dcraw 라이브러리 사용
- 🖼️ Sharp 라이브러리를 통한 고품질 이미지 처리

## 기술 스택

- **Backend**: Node.js + Express + TypeScript
- **Image Processing**: dcraw (WASM) + Sharp
- **File Upload**: Multer
- **Frontend**: HTML5 + Vanilla JavaScript

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```

### 3. 프로덕션 빌드
```bash
npm run build
npm start
```

## 사용법

1. 브라우저에서 `http://localhost:3000` 접속
2. DNG 파일 선택
3. "Convert to PNG" 버튼 클릭
4. 변환 완료 후 PNG 파일 다운로드

## API 엔드포인트

### POST /convert
DNG 파일을 PNG로 변환합니다.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: DNG 파일 (dngFile 필드)

**Response:**
```json
{
  "message": "변환이 완료되었습니다.",
  "filename": "converted-file.png"
}
```

### GET /download/:filename
변환된 PNG 파일을 다운로드합니다.

## 테스트

### 변환 기능 테스트
```bash
npm run test-conversion
```

### dcraw 라이브러리 테스트
```bash
npx ts-node src/test-dcraw.ts
```

### 테스트 이미지 생성
```bash
npx ts-node src/create-test-image.ts
```

## 지원되는 파일 형식

- **입력**: .dng (Digital Negative) 파일
- **출력**: .png (Portable Network Graphics) 파일

## 제한사항

- 최대 파일 크기: 50MB
- DNG 형식만 지원 (다른 RAW 형식은 지원하지 않음)

## 프로젝트 구조

```
dng/
├── src/
│   ├── index.ts              # 메인 서버 파일
│   ├── dngConverter.ts       # DNG 변환 로직
│   ├── test-conversion.ts    # 변환 테스트 스크립트
│   ├── test-dcraw.ts         # dcraw 라이브러리 테스트
│   └── create-test-image.ts  # 테스트 이미지 생성
├── uploads/                  # 업로드된 파일 임시 저장소
├── test-files/              # 테스트 파일 저장소
├── dist/                    # 컴파일된 JavaScript 파일
├── package.json
├── tsconfig.json
└── README.md
```

## 트러블슈팅

### DNG 파일 변환 실패시
1. 파일이 올바른 DNG 형식인지 확인
2. 파일 크기가 50MB 이하인지 확인
3. 파일이 손상되지 않았는지 확인

### 서버 시작 실패시
1. Node.js 버전 확인 (14.x 이상 권장)
2. 포트 3000이 사용 중인지 확인
3. 의존성이 모두 설치되었는지 확인

## 라이센스

ISC

## 개발자 노트

이 프로젝트는 DNG 파일 처리를 위해 dcraw WASM 라이브러리를 사용합니다. DNG는 Adobe에서 개발한 오픈 RAW 형식으로, 다양한 카메라에서 생성되는 RAW 파일을 표준화한 형식입니다.