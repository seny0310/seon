import { crew, saveMission, saveResults } from './store.js';

export async function runMissionFlow(idea, env) {
  const mission = createMission(idea);
  const meeting = [];

  for (const member of crew) {
    const content = await askModel(member, mission, idea, env);
    meeting.push({ crew: member.name, model: member.model, content });
  }

  const finalProposal = buildFinalProposal(mission, meeting);
  const results = meeting.map((m, idx) => ({
    id: `res_${Date.now()}_${idx}`,
    mission_id: mission.id,
    content: m.content,
    crew: m.crew,
    created_at: new Date().toISOString()
  }));

  saveMission(mission);
  saveResults(results);

  return { mission, meeting, finalProposal, results };
}

function createMission(idea) {
  const now = new Date().toISOString();
  return {
    id: `mis_${Date.now()}`,
    title: idea.slice(0, 50),
    goal: `${idea}에 대한 실행 가능한 팀 제안 도출`,
    tasks: [
      '요구사항 분석',
      '역할별 제안 생성',
      '리스크 검토',
      '최종 실행안 통합'
    ],
    status: 'review',
    created_at: now
  };
}

async function askModel(member, mission, idea, env) {
  const prompt = [
    member.system_prompt,
    `Mission: ${mission.title}`,
    `Goal: ${mission.goal}`,
    `User idea: ${idea}`,
    '간결한 실무 제안 4~6줄로 작성하세요.'
  ].join('\n');

  if (member.model === 'openai' && env.OPENAI_API_KEY) {
    return callOpenAI(prompt, env.OPENAI_API_KEY);
  }
  if (member.model === 'claude' && env.ANTHROPIC_API_KEY) {
    return callClaude(prompt, env.ANTHROPIC_API_KEY);
  }

  return `[Mock:${member.name}] ${mission.title}에 대한 실행 제안: 핵심 과업 정의 → 우선순위 설정 → 실행 후 KPI 측정.`;
}

async function callOpenAI(prompt, apiKey) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }]
    })
  });
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || 'OpenAI 응답 없음';
}

async function callClaude(prompt, apiKey) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  const data = await res.json();
  return data?.content?.[0]?.text || 'Claude 응답 없음';
}

function buildFinalProposal(mission, meeting) {
  return [
    `Mission: ${mission.title}`,
    '',
    'Final Proposal',
    ...meeting.map((m) => `- ${m.crew}: ${shorten(m.content)}`),
    '',
    'Next Action: CEO 승인 후 Builder가 구현 계획을 상세화하고, Marketer가 런칭 메시지를 작성합니다.'
  ].join('\n');
}

function shorten(text) {
  return text.replace(/\s+/g, ' ').slice(0, 120);
}
