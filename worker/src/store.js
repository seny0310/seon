export const crew = [
  {
    id: 'strategist',
    name: 'Strategist',
    role: '사업/전략 설계',
    system_prompt: '당신은 전략가입니다. 문제 구조화, 목표 정의, 실행 우선순위를 제시하세요.',
    model: 'claude'
  },
  {
    id: 'designer',
    name: 'Designer',
    role: 'UX/UI 설계',
    system_prompt: '당신은 디자이너입니다. 사용자 흐름, 정보 구조, 인터페이스 제안을 만드세요.',
    model: 'openai'
  },
  {
    id: 'marketer',
    name: 'Marketer',
    role: '메시지/채널 전략',
    system_prompt: '당신은 마케터입니다. 핵심 가치 메시지와 채널 실행안을 제시하세요.',
    model: 'claude'
  },
  {
    id: 'builder',
    name: 'Builder',
    role: '구현 계획',
    system_prompt: '당신은 빌더입니다. 기술 구현 단계와 리스크를 제시하세요.',
    model: 'openai'
  },
  {
    id: 'critic',
    name: 'Critic',
    role: '검증/리스크 리뷰',
    system_prompt: '당신은 비평가입니다. 약점, 가정, 개선안을 날카롭게 검토하세요.',
    model: 'claude'
  }
];

const memory = {
  missions: [],
  results: []
};

export function listMissions() {
  return memory.missions;
}

export function listResults() {
  return memory.results;
}

export function saveMission(mission) {
  memory.missions.unshift(mission);
}

export function saveResults(results) {
  memory.results.unshift(...results);
}
