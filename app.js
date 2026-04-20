const DB_NAME = "dream-static-cache";
const STORE_NAME = "assets";

const state = {
  bundle: null,
  validationReport: null,
  db: null,
  coursesById: new Map(),
  coursesByMajor: new Map(),
  scenarios: [],
  initialized: false,
  eventsBound: false,
};

const elements = {
  form: document.getElementById("plannerForm"),
  majorSelect: document.getElementById("majorSelect"),
  trackSelect: document.getElementById("trackSelect"),
  semesterSelect: document.getElementById("semesterSelect"),
  interestsInput: document.getElementById("interestsInput"),
  goalsInput: document.getElementById("goalsInput"),
  completedInput: document.getElementById("completedInput"),
  readyResults: document.getElementById("readyResults"),
  blockedResults: document.getElementById("blockedResults"),
  messageBox: document.getElementById("messageBox"),
  matchedCompletedCount: document.getElementById("matchedCompletedCount"),
  matchedCompletedList: document.getElementById("matchedCompletedList"),
  readyCount: document.getElementById("readyCount"),
  blockedCount: document.getElementById("blockedCount"),
  sampleButton: document.getElementById("sampleButton"),
  refreshButton: document.getElementById("refreshButton"),
  dataVersion: document.getElementById("dataVersion"),
  cacheStatus: document.getElementById("cacheStatus"),
  validationStatus: document.getElementById("validationStatus"),
};

document.addEventListener("DOMContentLoaded", () => {
  void init();
});

async function init(forceRefresh = false) {
  setMessage("데이터를 로딩 중입니다.");
  try {
    bindEvents();
    state.bundle = await loadBundle(forceRefresh);
    state.validationReport = await loadOptionalJson("./tmp/validation_report.json");
    buildIndexes();
    populateControls();
    renderMeta();
    state.initialized = true;
    runRecommendation();
  } catch (error) {
    console.error(error);
    setMessage(`초기화 실패: ${error.message}`, true);
  }
}

function bindEvents() {
  if (state.eventsBound) {
    return;
  }
  state.eventsBound = true;

  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();
    runRecommendation();
  });

  elements.majorSelect.addEventListener("change", () => {
    updateTrackOptions();
    if (state.initialized) {
      runRecommendation();
    }
  });

  elements.trackSelect.addEventListener("change", () => {
    if (state.initialized) {
      runRecommendation();
    }
  });

  elements.semesterSelect.addEventListener("change", () => {
    if (state.initialized) {
      runRecommendation();
    }
  });

  elements.sampleButton.addEventListener("click", () => {
    fillSampleScenario();
    runRecommendation();
  });

  elements.refreshButton.addEventListener("click", async () => {
    setMessage("캐시를 비우고 데이터를 다시 가져오는 중입니다.");
    await clearCache();
    state.initialized = false;
    await init(true);
  });
}

async function loadBundle(forceRefresh = false) {
  const manifest = await fetchJson("./data/manifest.json", true);
  const db = await openDb();
  state.db = db;

  const assetMap = new Map();
  for (const asset of manifest.assets) {
    const cached = !forceRefresh ? await getCachedAsset(db, asset.path) : null;
    if (cached && cached.version === manifest.version && cached.sha256 === asset.sha256) {
      assetMap.set(asset.path, decodeAsset(asset.type, cached.payload));
      continue;
    }

    const response = await fetch(asset.path, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`${asset.path} fetch failed (${response.status})`);
    }
    const payload = await response.arrayBuffer();
    await putCachedAsset(db, asset.path, {
      key: asset.path,
      version: manifest.version,
      sha256: asset.sha256,
      type: asset.type,
      payload,
    });
    assetMap.set(asset.path, decodeAsset(asset.type, payload));
  }

  elements.cacheStatus.textContent = forceRefresh ? "강제 갱신" : "IndexedDB 사용";
  return {
    manifest,
    coursesPayload: assetMap.get("data/courses.json"),
    prerequisitesPayload: assetMap.get("data/prerequisites.json"),
    chunksPayload: assetMap.get("data/syllabus_chunks.json"),
    rules: assetMap.get("data/rules.json"),
    scenarios: assetMap.get("data/test_scenarios.json") || [],
    embeddings: decodeEmbeddings(
      assetMap.get("data/embeddings.bin"),
      assetMap.get("data/rules.json")?.embedding?.dimensions || 256
    ),
  };
}

function buildIndexes() {
  state.coursesById = new Map();
  state.coursesByMajor = new Map();
  state.scenarios = Array.isArray(state.bundle.scenarios) ? state.bundle.scenarios : [];

  for (const course of state.bundle.coursesPayload.courses || []) {
    state.coursesById.set(course.id, course);
    if (!state.coursesByMajor.has(course.major)) {
      state.coursesByMajor.set(course.major, []);
    }
    state.coursesByMajor.get(course.major).push(course);
  }
}

function populateControls() {
  const majors = state.bundle.coursesPayload.majors || [];
  elements.majorSelect.innerHTML = majors
    .map((major) => `<option value="${escapeAttr(major)}">${escapeHtml(major)}</option>`)
    .join("");

  const semesters = state.bundle.rules.semesters || [];
  const defaultSemester = state.bundle.rules.default_semester || "all";
  elements.semesterSelect.innerHTML = [
    `<option value="all">전체</option>`,
    ...semesters.map(
      (semester) =>
        `<option value="${escapeAttr(semester)}" ${semester === defaultSemester ? "selected" : ""}>${escapeHtml(
          semester
        )}</option>`
    ),
  ].join("");

  const defaultScenario = state.scenarios.find((item) => !item.expects_blocked) || state.scenarios[0];
  if (defaultScenario) {
    elements.majorSelect.value = defaultScenario.major;
  }
  updateTrackOptions();
  if (defaultScenario) {
    applyScenario(defaultScenario, true);
  }
}

function updateTrackOptions() {
  const major = elements.majorSelect.value;
  const tracks = state.bundle.rules.track_catalog?.[major]?.tracks || [];
  const options = [`<option value="">전체 트랙</option>`];
  for (const track of tracks) {
    options.push(`<option value="${escapeAttr(track.name)}">${escapeHtml(track.name)}</option>`);
  }
  elements.trackSelect.innerHTML = options.join("");
}

function renderMeta() {
  elements.dataVersion.textContent = state.bundle.manifest.version || "-";
  if (state.validationReport?.summary) {
    const { passed, total } = state.validationReport.summary;
    elements.validationStatus.textContent = `${passed}/${total}`;
  } else {
    elements.validationStatus.textContent = `${state.scenarios.length} loaded`;
  }
}

function fillSampleScenario() {
  const major = elements.majorSelect.value;
  const scenario =
    state.scenarios.find((item) => item.major === major && !item.expects_blocked) ||
    state.scenarios.find((item) => item.major === major) ||
    state.scenarios[0];

  if (!scenario) {
    return;
  }

  applyScenario(scenario, false);
}

function applyScenario(scenario, onlyWhenEmpty) {
  const inputsAreEmpty =
    !normalizeSpace(elements.interestsInput.value) &&
    !normalizeSpace(elements.goalsInput.value) &&
    !normalizeSpace(elements.completedInput.value);
  if (onlyWhenEmpty && !inputsAreEmpty) {
    return;
  }

  elements.majorSelect.value = scenario.major;
  updateTrackOptions();
  elements.trackSelect.value = scenario.selected_track || "";
  elements.semesterSelect.value = scenario.target_semester || "all";
  elements.interestsInput.value = scenario.interests || "";
  elements.goalsInput.value = scenario.goals || "";
  elements.completedInput.value = scenario.completed_courses || "";
}

function runRecommendation() {
  if (!state.bundle) {
    return;
  }

  const params = {
    major: elements.majorSelect.value,
    selected_track: elements.trackSelect.value,
    target_semester: elements.semesterSelect.value,
    interests: elements.interestsInput.value,
    goals: elements.goalsInput.value,
    completed_courses: elements.completedInput.value,
  };

  if (!normalizeSpace(params.interests) && !normalizeSpace(params.goals) && !normalizeSpace(params.selected_track)) {
    setMessage("관심사, 목표, 트랙 중 하나는 입력하는 편이 정확도가 높습니다.");
  } else {
    setMessage("추천 결과를 계산했습니다.");
  }

  const recommendation = recommendCourses(params);
  renderRecommendation(recommendation);
}

function recommendCourses(params) {
  const courses = state.coursesByMajor.get(params.major) || [];
  const matched = matchCompletedCourses(courses, params.completed_courses);
  const queryText = normalizeSpace([params.interests, params.goals, params.selected_track].join(" "));
  const queryVector = textToVector(queryText, state.bundle.rules.embedding);
  const weights = state.bundle.rules.weights || {};
  const targetGrade = estimateTargetGrade(matched.matchedIds);

  const ready = [];
  const blocked = [];
  for (const course of courses) {
    if (matched.matchedIds.has(course.id)) {
      continue;
    }
    if (params.target_semester !== "all" && !course.offered_semesters.includes(params.target_semester)) {
      continue;
    }

    const missingIds = (course.prerequisite_ids || []).filter((item) => !matched.matchedIds.has(item));
    const missingNames = missingIds.map((item) => state.coursesById.get(item)?.course_name).filter(Boolean);
    const semantic = semanticScore(course, queryVector);
    const curriculum = curriculumScore(course, targetGrade);
    const graduation = graduationScore(course, params.selected_track);
    const prereqPenalty = missingIds.length
      ? (missingIds.length / Math.max(1, course.prerequisite_ids.length)) * Number(weights.prerequisite_penalty || 0.5)
      : 0;
    const total =
      semantic * Number(weights.semantic || 0.55) +
      curriculum * Number(weights.curriculum || 0.2) +
      graduation * Number(weights.graduation || 0.25) -
      prereqPenalty;

    const keywordHits = findKeywordHits(queryText, course.keywords || [], 2);
    const reasonSlots = buildReasonSlots(course, params, missingNames, keywordHits);
    const item = {
      ...course,
      missing_prerequisites: missingNames,
      score: round4(total),
      score_breakdown: {
        semantic: round4(semantic),
        curriculum: round4(curriculum),
        graduation: round4(graduation),
        prerequisite_penalty: round4(prereqPenalty),
      },
      reason_slots: reasonSlots,
      reason: Object.values(reasonSlots).join(" "),
    };

    if (missingNames.length) {
      blocked.push(item);
    } else {
      ready.push(item);
    }
  }

  ready.sort((a, b) => b.score - a.score || b.score_breakdown.semantic - a.score_breakdown.semantic);
  blocked.sort((a, b) => b.score - a.score || a.missing_prerequisites.length - b.missing_prerequisites.length);

  return {
    ready: ready.slice(0, Number(state.bundle.rules.limits?.ready || 8)),
    blocked: blocked.slice(0, Number(state.bundle.rules.limits?.blocked || 4)),
    matchedCompleted: Array.from(matched.matchedIds)
      .map((item) => state.coursesById.get(item)?.course_name)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "ko")),
    unmatchedCompleted: matched.unmatchedInputs,
  };
}

function renderRecommendation(result) {
  elements.matchedCompletedCount.textContent = String(result.matchedCompleted.length);
  elements.matchedCompletedList.textContent = result.matchedCompleted.length
    ? result.matchedCompleted.slice(0, 8).join(", ")
    : result.unmatchedCompleted.length
      ? `미매칭 입력: ${result.unmatchedCompleted.slice(0, 8).join(", ")}`
      : "-";
  elements.readyCount.textContent = String(result.ready.length);
  elements.blockedCount.textContent = String(result.blocked.length);

  elements.readyResults.innerHTML = result.ready.length
    ? result.ready.map((item) => renderCourseCard(item, false)).join("")
    : `<div class="empty-state">조건에 맞는 추천 과목이 없습니다.</div>`;

  elements.blockedResults.innerHTML = result.blocked.length
    ? result.blocked.map((item) => renderCourseCard(item, true)).join("")
    : `<div class="empty-state">현재 기준으로 보류 과목이 없습니다.</div>`;
}

function renderCourseCard(course, blocked) {
  const topTrack = course.track_contributions?.[0];
  const badges = [
    `<span class="badge">${escapeHtml((course.offered_semesters || []).join(", ") || "-")}</span>`,
    topTrack ? `<span class="badge track">${escapeHtml(topTrack.name)}</span>` : "",
    blocked && course.missing_prerequisites.length
      ? `<span class="badge prereq">${escapeHtml(course.missing_prerequisites.join(", "))}</span>`
      : "",
  ]
    .filter(Boolean)
    .join("");

  const metrics = [
    `<span class="metric-pill">semantic ${course.score_breakdown.semantic.toFixed(2)}</span>`,
    `<span class="metric-pill">curriculum ${course.score_breakdown.curriculum.toFixed(2)}</span>`,
    `<span class="metric-pill">graduation ${course.score_breakdown.graduation.toFixed(2)}</span>`,
    `<span class="metric-pill">penalty ${course.score_breakdown.prerequisite_penalty.toFixed(2)}</span>`,
  ].join("");

  const slots = Object.entries(course.reason_slots)
    .map(
      ([key, value]) => `
        <div class="slot">
          <span class="slot-label">${escapeHtml(slotTitle(key))}</span>
          <span>${escapeHtml(value)}</span>
        </div>
      `
    )
    .join("");

  return `
    <article class="result-card">
      <div class="card-head">
        <div>
          <h3 class="card-title">${escapeHtml(course.course_name)}</h3>
          <p class="card-subtitle">
            ${escapeHtml(course.course_code || "-")} · ${escapeHtml(String(course.grade || "-"))}학년 ·
            ${escapeHtml(course.completion_type || "-")}
          </p>
        </div>
        <div class="score-chip ${blocked ? "blocked" : ""}">${course.score.toFixed(2)}</div>
      </div>

      <div class="badge-row">${badges}</div>
      <div class="metric-row">${metrics}</div>
      <div class="reason-box">${escapeHtml(course.reason)}</div>
      <div class="slot-list">${slots}</div>
    </article>
  `;
}

function slotTitle(key) {
  const map = {
    interest_match: "Interest",
    prerequisite_status: "Prereq",
    offered_semester: "Semester",
    follow_on_link: "Follow-on",
    track_contribution: "Track",
  };
  return map[key] || key;
}

function buildReasonSlots(course, params, missingNames, keywordHits) {
  let interestMatch = keywordHits.length
    ? `관심사 매칭: ${keywordHits.slice(0, 2).join(", ")} 키워드와 직접 연결됩니다.`
    : "관심사 매칭: 입력 텍스트와 과목 프로필 유사도가 높습니다.";

  let prerequisiteStatus;
  if (missingNames.length) {
    prerequisiteStatus = `선수 충족 여부: ${missingNames.slice(0, 3).join(", ")} 미이수로 보류 대상입니다.`;
  } else if ((course.prerequisite_names || []).length) {
    prerequisiteStatus = `선수 충족 여부: ${course.prerequisite_names.slice(0, 3).join(", ")} 기준으로 충족 상태입니다.`;
  } else {
    prerequisiteStatus = "선수 충족 여부: 별도 선수과목 없이 바로 수강 가능합니다.";
  }

  let offeredSemester;
  if (params.target_semester && params.target_semester !== "all") {
    offeredSemester = course.offered_semesters.includes(params.target_semester)
      ? `개설학기: 선택 학기인 ${params.target_semester}에 개설됩니다.`
      : `개설학기: ${params.target_semester} 개설 과목은 아니며 최근 개설은 ${
          course.latest_offered_semester || "-"
        }입니다.`;
  } else {
    offeredSemester = `개설학기: ${(course.offered_semesters || []).join(", ") || "-"} 기준으로 확인됩니다.`;
  }

  const followOnLink = (course.dependent_names || []).length
    ? `후속과목 연결: ${course.dependent_names.slice(0, 2).join(", ")}로 이어지는 기반 과목입니다.`
    : "후속과목 연결: 직접 연결된 후속과목은 적지만 이수 부담이 낮습니다.";

  let selectedTrackContribution = null;
  if (params.selected_track) {
    selectedTrackContribution = (course.track_contributions || []).find(
      (item) => item.name === params.selected_track
    );
  }
  const topTrack = selectedTrackContribution || course.track_contributions?.[0];
  const trackContribution = topTrack
    ? topTrack.matched_keywords?.length
      ? `트랙 기여: ${topTrack.name}과 ${topTrack.matched_keywords.slice(0, 2).join(", ")} 축으로 연관도가 높습니다.`
      : `트랙 기여: ${topTrack.name} 쪽 졸업 설계에 기여도가 큽니다.`
    : "트랙 기여: 전공 공통 기반 과목으로 활용 가능합니다.";

  return {
    interest_match: interestMatch,
    prerequisite_status: prerequisiteStatus,
    offered_semester: offeredSemester,
    follow_on_link: followOnLink,
    track_contribution: trackContribution,
  };
}

function semanticScore(course, queryVector) {
  if (!queryVector || !course.chunk_indices?.length) {
    return 0;
  }
  const { vector, dimensions } = state.bundle.embeddings;
  let best = 0;
  for (const index of course.chunk_indices) {
    const score = dotRow(queryVector, vector, index, dimensions);
    if (score > best) {
      best = score;
    }
  }
  return best;
}

function curriculumScore(course, targetGrade) {
  const gradeGap = Math.min(Math.abs(Number(course.grade_value || targetGrade) - targetGrade), 3) / 3;
  const gradeFit = 1 - gradeGap;
  const orderFit = 1 - ((Number(course.order_value || 1) - 1) / 4);
  return (0.65 * gradeFit) + (0.35 * orderFit);
}

function graduationScore(course, selectedTrack) {
  let trackScore = 0;
  if (selectedTrack) {
    const match = (course.track_contributions || []).find((item) => item.name === selectedTrack);
    trackScore = Number(match?.score || 0);
  }
  if (!trackScore) {
    trackScore = Number(course.track_contributions?.[0]?.score || 0);
  }
  trackScore = Math.min(1, Math.max(0, trackScore));
  const unlockScore = Math.min(1, Number(course.dependent_count || 0) / 3);
  return (0.45 * Number(course.core_score || 0.55)) + (0.35 * trackScore) + (0.2 * unlockScore);
}

function estimateTargetGrade(matchedIds) {
  const grades = Array.from(matchedIds)
    .map((item) => Number(state.coursesById.get(item)?.grade_value || 0))
    .filter(Boolean);
  if (!grades.length) {
    return 1;
  }
  return Math.min(4, Math.max(...grades) + 1);
}

function matchCompletedCourses(courses, completedText) {
  const entries = parseCompletedText(completedText);
  const lookup = new Map();
  for (const course of courses) {
    for (const candidate of [course.course_name, course.course_code]) {
      const key = canonicalKey(candidate);
      if (key) {
        lookup.set(key, course.id);
      }
    }
  }

  const matchedIds = new Set();
  const unmatchedInputs = [];
  for (const item of entries) {
    const key = canonicalKey(item);
    const direct = lookup.get(key);
    if (direct) {
      matchedIds.add(direct);
      continue;
    }

    let fallback = null;
    for (const course of courses) {
      if (item.includes(course.course_name) || course.course_name.includes(item) || item === course.course_code) {
        fallback = course.id;
        break;
      }
    }
    if (fallback) {
      matchedIds.add(fallback);
    } else {
      unmatchedInputs.push(item);
    }
  }
  return { matchedIds, unmatchedInputs };
}

function parseCompletedText(completedText) {
  const normalized = normalizeSpace(String(completedText || "").replaceAll(",", "\n").replaceAll("/", "\n"));
  if (!normalized) {
    return [];
  }
  const items = normalized
    .split(/\n+/)
    .map((item) => normalizeSpace(item))
    .filter(Boolean);

  const deduped = [];
  const seen = new Set();
  for (const item of items) {
    const key = canonicalKey(item);
    if (!key || seen.has(key)) {
      continue;
    }
    deduped.push(item);
    seen.add(key);
  }
  return deduped;
}

function findKeywordHits(text, keywords, limit = 2) {
  const normalized = normalizeSpace(text).toLowerCase();
  if (!normalized) {
    return [];
  }
  const hits = [];
  for (const keyword of keywords || []) {
    const token = normalizeSpace(keyword).toLowerCase();
    if (token && normalized.includes(token) && !hits.includes(keyword)) {
      hits.push(keyword);
    }
    if (hits.length >= limit) {
      break;
    }
  }
  return hits;
}

function textToVector(text, embeddingRules) {
  const dimensions = Number(embeddingRules?.dimensions || 256);
  const vector = new Float32Array(dimensions);
  const tokens = tokenizeText(text, embeddingRules?.synonyms || {});
  if (!tokens.length) {
    return vector;
  }

  const counts = new Map();
  for (const token of tokens) {
    counts.set(token, (counts.get(token) || 0) + 1);
  }

  const wordWeight = Number(embeddingRules?.word_token_weight || 1);
  const ngramWeight = Number(embeddingRules?.ngram_token_weight || 0.35);
  for (const [token, count] of counts.entries()) {
    const hash = fnv1a32(token);
    const index = hash % dimensions;
    const sign = (hash & 0x80000000) !== 0 ? -1 : 1;
    const baseWeight = token.startsWith("w:") ? wordWeight : ngramWeight;
    const weight = (1 + Math.log(count)) * baseWeight;
    vector[index] += sign * weight;
  }

  normalizeVector(vector);
  return vector;
}

function tokenizeText(text, synonyms) {
  const normalized = normalizeSpace(text).toLowerCase();
  const matches = normalized.match(/[0-9A-Za-z가-힣]+/g) || [];
  const tokens = [];
  for (const raw of matches) {
    if (raw.length === 1 && !/^\d+$/.test(raw)) {
      continue;
    }
    tokens.push(`w:${raw}`);
    for (const alias of synonyms[raw] || []) {
      const normalizedAlias = normalizeSpace(alias).toLowerCase();
      if (normalizedAlias) {
        tokens.push(`w:${normalizedAlias}`);
      }
    }
    if (raw.length >= 2) {
      const maxN = Math.min(4, raw.length);
      for (let n = 2; n <= maxN; n += 1) {
        for (let index = 0; index <= raw.length - n; index += 1) {
          tokens.push(`g:${raw.slice(index, index + n)}`);
        }
      }
    }
  }
  return tokens;
}

function decodeEmbeddings(buffer, dimensions) {
  const vector = new Float32Array(buffer);
  return { vector, dimensions };
}

function dotRow(queryVector, packedVectors, rowIndex, dimensions) {
  let total = 0;
  const start = rowIndex * dimensions;
  for (let index = 0; index < dimensions; index += 1) {
    total += queryVector[index] * packedVectors[start + index];
  }
  return total;
}

function normalizeVector(vector) {
  let sum = 0;
  for (let index = 0; index < vector.length; index += 1) {
    sum += vector[index] * vector[index];
  }
  const norm = Math.sqrt(sum);
  if (!norm) {
    return;
  }
  for (let index = 0; index < vector.length; index += 1) {
    vector[index] /= norm;
  }
}

function fnv1a32(text) {
  const bytes = new TextEncoder().encode(text);
  let hash = 0x811c9dc5;
  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

function normalizeSpace(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function canonicalKey(text) {
  return normalizeSpace(text).replace(/[^0-9a-zA-Z가-힣]+/g, "").toLowerCase();
}

function round4(value) {
  return Math.round(Number(value || 0) * 10000) / 10000;
}

function setMessage(message, isError = false) {
  elements.messageBox.textContent = message;
  elements.messageBox.style.color = isError ? "var(--danger)" : "var(--muted)";
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

async function fetchJson(path, noStore = false) {
  const response = await fetch(path, { cache: noStore ? "no-store" : "default" });
  if (!response.ok) {
    throw new Error(`${path} fetch failed (${response.status})`);
  }
  return response.json();
}

async function loadOptionalJson(path) {
  try {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch {
    return null;
  }
}

function decodeAsset(type, payload) {
  if (type === "json") {
    return JSON.parse(new TextDecoder().decode(payload));
  }
  return payload;
}

async function openDb() {
  if (state.db) {
    return state.db;
  }
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

async function getCachedAsset(db, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(key);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

async function putCachedAsset(db, key, value) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.put({ ...value, key });
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function clearCache() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.clear();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
