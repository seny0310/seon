const API_BASE = '/api';

const el = {
  crewList: document.getElementById('crew-list'),
  input: document.getElementById('user-input'),
  runBtn: document.getElementById('run-btn'),
  meetingLog: document.getElementById('meeting-log'),
  finalProposal: document.getElementById('final-proposal'),
  missions: document.getElementById('missions'),
  results: document.getElementById('results')
};

const state = { crew: [], missions: [], results: [] };

init();

async function init() {
  await Promise.all([loadCrew(), loadMissions(), loadResults()]);
  renderCrew();
  renderMissions();
  renderResults();
}

async function loadCrew() {
  try {
    const res = await fetch(`${API_BASE}/crew`);
    state.crew = await res.json();
  } catch {
    state.crew = [
      { name: 'Strategist', model: 'claude' },
      { name: 'Designer', model: 'openai' },
      { name: 'Marketer', model: 'claude' },
      { name: 'Builder', model: 'openai' },
      { name: 'Critic', model: 'claude' }
    ];
  }
}

async function loadMissions() {
  try {
    const res = await fetch(`${API_BASE}/missions`);
    state.missions = await res.json();
  } catch {
    state.missions = [];
  }
}

async function loadResults() {
  try {
    const res = await fetch(`${API_BASE}/results`);
    state.results = await res.json();
  } catch {
    state.results = [];
  }
}

el.runBtn.addEventListener('click', runMeeting);

async function runMeeting() {
  const idea = el.input.value.trim();
  if (!idea) return;
  el.runBtn.disabled = true;
  el.runBtn.textContent = '회의 중...';
  try {
    const res = await fetch(`${API_BASE}/mission/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea })
    });
    const payload = await res.json();

    renderMeetingLog(payload.meeting ?? []);
    el.finalProposal.textContent = payload.finalProposal || '제안이 생성되지 않았습니다.';

    state.missions.unshift(payload.mission);
    state.results.unshift(...(payload.results || []));
    renderMissions();
    renderResults();
  } catch (e) {
    el.meetingLog.textContent = `오류: ${e.message}`;
  } finally {
    el.runBtn.disabled = false;
    el.runBtn.textContent = 'AI Crew 회의 시작';
  }
}

function renderCrew() {
  el.crewList.innerHTML = state.crew
    .map((c) => `<li>${c.name} · <span class="meta">${c.model}</span></li>`)
    .join('');
}

function renderMeetingLog(logs) {
  el.meetingLog.innerHTML = logs
    .map(
      (item) =>
        `<div class="log-item"><strong>${item.crew}</strong><div class="meta">${item.model}</div><div>${escapeHtml(item.content)}</div></div>`
    )
    .join('');
}

function renderMissions() {
  if (!state.missions.length) {
    el.missions.textContent = '아직 생성된 Mission이 없습니다.';
    return;
  }
  el.missions.innerHTML = state.missions
    .map(
      (m) =>
        `<div class="log-item"><strong>${m.title}</strong><div class="meta">${m.status} · ${m.created_at}</div><div>Goal: ${escapeHtml(
          m.goal
        )}</div><div>Tasks: ${(m.tasks || []).join(', ')}</div></div>`
    )
    .join('');
}

function renderResults() {
  if (!state.results.length) {
    el.results.textContent = '아직 저장된 Result가 없습니다.';
    return;
  }
  el.results.innerHTML = state.results
    .map(
      (r) =>
        `<div class="log-item"><strong>${r.crew}</strong><div class="meta">${r.created_at}</div><div>${escapeHtml(
          r.content
        )}</div></div>`
    )
    .join('');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}
