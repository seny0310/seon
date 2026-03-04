# SEON — Personal AI Operating System (MVP)

SEON은 단순 채팅 앱이 아니라 **"나 대신 일하는 AI 팀 시스템"**을 목표로 한 개인용 AI 운영 웹앱입니다.

## 제품 포지션
- AI Chat App ❌
- Personal AI Operating System ✅

## MVP 구성
1. **AI Crew**
   - Strategist (Claude)
   - Designer (OpenAI)
   - Marketer (Claude)
   - Builder (OpenAI)
   - Critic (Claude)
2. **Mission System**
   - Mission / Goal / Tasks / Output / Status
3. **Results Archive**
   - 전략, 기획, 카피, 문서, 아이디어 결과 저장

## 접근 방식
- 로그인 게이트 없이 바로 메인 앱으로 진입합니다.
- 과거 `login.html` 링크로 접속해도 현재 경로 기준 `./index.html`로 자동 리다이렉트됩니다.

## 아키텍처

### Frontend (Vanilla)
- `index.html` : 사이드바 + 채팅 + 회의 로그 + Final Proposal UI
- `app.js` : 대화 흐름 제어, Mission 생성, 결과 아카이브 갱신
- `styles.css` : 레이아웃 및 컴포넌트 스타일

### Backend (Cloudflare Worker)
- `worker/src/index.js`
  - `/api/crew` : Crew 조회
  - `/api/mission/start` : 사용자 입력으로 Mission 생성 + 회의 실행 + Final Proposal 생성
  - `/api/missions` : Mission 목록
  - `/api/results` : 결과 목록
- `worker/src/router.js` : Anthropic/OpenAI 라우팅 및 회의 파이프라인
- `worker/src/store.js` : 인메모리 저장소 (MVP). 향후 D1/KV 교체 용이

## AI 라우팅 규칙
- Strategist → Claude
- Designer → OpenAI
- Marketer → Claude
- Builder → OpenAI
- Critic → Claude

## 데이터 모델
```ts
Crew {
  id: string;
  name: string;
  role: string;
  system_prompt: string;
  model: "claude" | "openai";
}

Mission {
  id: string;
  title: string;
  goal: string;
  tasks: string[];
  status: "draft" | "in_progress" | "review" | "approved";
  created_at: string;
}

Result {
  id: string;
  mission_id: string;
  content: string;
  crew: string;
  created_at: string;
}
```

## 로컬 실행 (프론트)
브라우저에서 `index.html`을 열면 동작합니다.

## Worker 배포 예시
```bash
cd worker
# wrangler.toml 준비 후
wrangler dev
```

필수 환경변수:
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`

> 키가 없을 경우 Worker는 mock 응답으로 동작하도록 설계되어 MVP 데모가 가능합니다.
