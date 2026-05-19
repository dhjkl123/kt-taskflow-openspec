# TaskFlow MVP - 팀 칸반 & 실시간 채팅

소규모 팀(3-5명)을 위한 가벼운 협업 도구. 칸반 보드와 실시간 채팅을 한 화면에서 관리합니다.

## 기술 스택

**Backend**: FastAPI + SQLite (로컬) / Neon Postgres (프로덕션)
**Frontend**: Vanilla JavaScript + Tailwind CSS
**Deployment**: Vercel

## 로컬 실행

### 1. 백엔드 설정

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 2. 데이터베이스 초기화

```bash
cd backend
python init_db.py
```

### 3. 백엔드 실행

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend가 http://localhost:8000에서 실행됩니다.

### 4. 프론트엔드 실행

간단한 HTTP 서버로 프론트엔드를 제공합니다:

```bash
cd frontend
python -m http.server 3000
```

또는 다른 포트로:
```bash
python -m http.server 3000 --directory .
```

프론트엔드가 http://localhost:3000에서 실행됩니다.

## 환경 변수

`.env.local` (로컬 개발):
```
DATABASE_URL=sqlite:///taskflow.db
JWT_SECRET=dev-secret-key-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_HOURS=24
```

## API 엔드포인트 (18개)

### 인증 (4개)
- `POST /auth/signup` - 회원가입
- `POST /auth/login` - 로그인
- `GET /auth/me` - 현재 사용자 정보
- `POST /auth/logout` - 로그아웃

### 팀 (4개)
- `POST /teams` - 팀 생성
- `GET /teams` - 팀 목록
- `POST /teams/join` - 초대코드로 팀 합류
- `GET /teams/{id}/members` - 팀 멤버 목록

### 태스크 (6개)
- `POST /teams/{id}/tasks` - 태스크 생성
- `GET /teams/{id}/tasks` - 태스크 목록
- `GET /tasks/{id}` - 태스크 상세
- `PATCH /tasks/{id}/status` - 상태 변경 (드래그드롭)
- `PUT /tasks/{id}` - 태스크 수정
- `DELETE /tasks/{id}` - 태스크 삭제

### 메시지 (4개)
- `POST /teams/{id}/messages` - 메시지 발송
- `GET /teams/{id}/messages` - 메시지 목록
- `GET /messages/{id}` - 메시지 상세
- `DELETE /messages/{id}` - 메시지 삭제

## 사용 방법

1. **로그인**: 회원가입 또는 기존 계정으로 로그인
2. **팀 선택**: 새 팀 만들기 또는 초대코드로 기존 팀 합류
3. **칸반**: TODO/DOING/DONE 컬럼에서 태스크 관리
4. **채팅**: 팀 채팅으로 실시간 의사소통 (5초 폴링)

## 주요 기능

- ✅ 이메일/비밀번호 인증 (JWT)
- ✅ 팀 생성 및 초대코드 기반 합류
- ✅ 3컬럼 칸반 (TODO/DOING/DONE)
- ✅ 드래그드롭으로 상태 변경
- ✅ 팀 기반 채팅 (5초 폴링)
- ✅ 모바일 반응형 디자인

## 범위 외

- 알림 (이메일/SMS/푸시)
- 파일 첨부
- 검색
- WebSocket (폴링 사용)
- 자동 테스트
- 다국어 지원

## 배포 (Vercel)

### 1. GitHub에 푸시

```bash
git add .
git commit -m "Initial TaskFlow MVP"
git push origin main
```

### 2. Vercel 프로젝트 생성

https://vercel.com에서 GitHub 저장소와 연결

### 3. 환경 변수 설정

Vercel 프로젝트 Settings > Environment Variables에서:
- `DATABASE_URL`: Neon Postgres 연결 문자열
- `JWT_SECRET`: 강력한 난수 값

### 4. 배포

자동 배포 또는 `vercel deploy` 실행

## 개발 주의사항

- 모든 라우트는 팀 멤버십 검증 필수
- 비멤버는 403 Forbidden 응답
- 데이터베이스: SQLite (로컬) ↔ Postgres (Vercel)
- 폴링 간격: 5초
- 메시지 크기: 1-1000자
- JWT 만료: 24시간 (갱신 없음)
