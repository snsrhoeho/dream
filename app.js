const DB_NAME = "dream-static-cache";
const STORE_NAME = "assets";

const SCALE_OPTIONS = [
  { score: 1, label: "전혀 그렇지 않다" },
  { score: 2, label: "조금 그렇지 않다" },
  { score: 3, label: "보통이다" },
  { score: 4, label: "그렇다" },
  { score: 5, label: "매우 그렇다" },
];

const MAJOR_AXIS_CONFIG = [
  { key: "activities", label: "흥미 성향", semanticWeight: 1.0, lexicalWeight: 2.0 },
  { key: "subjects", label: "학습 선호", semanticWeight: 0.9, lexicalWeight: 1.8 },
  { key: "career", label: "진로 이미지", semanticWeight: 1.1, lexicalWeight: 2.2 },
  { key: "extra", label: "보조 시그널", semanticWeight: 0.45, lexicalWeight: 0.9 },
];

const SURVEY_SECTIONS = [
  {
    id: "tech",
    title: "기술·분석",
    copy: "논리, 시스템, 데이터, 공간, 실험 지향성을 묻는 구간입니다.",
    pill: "10문항",
    summaryLabel: "기술·분석",
    summaryBoost: {
      activities: ["문제해결", "기술", "분석", "시스템"],
      subjects: ["정보", "데이터", "수학"],
      career: ["개발", "분석", "기술직무"],
      extra: ["기술지향", "실무구현"],
    },
    questions: [
      {
        id: "q01",
        text: "복잡한 문제를 논리적으로 쪼개서 해결하는 과정이 재미있다.",
        signals: {
          activities: ["문제해결", "논리", "알고리즘"],
          subjects: ["수학", "정보"],
          career: ["개발", "분석"],
          extra: ["분석적사고"],
        },
      },
      {
        id: "q02",
        text: "직접 코드를 짜거나 디지털 도구를 만들어 보는 편이 즐겁다.",
        signals: {
          activities: ["프로그래밍", "코딩", "개발", "소프트웨어"],
          subjects: ["컴퓨터", "소프트웨어"],
          career: ["앱개발", "소프트웨어개발"],
          extra: ["구현", "프로토타입"],
        },
      },
      {
        id: "q03",
        text: "수학, 통계, 데이터로 판단 근거를 만드는 일이 잘 맞는다.",
        signals: {
          activities: ["데이터분석", "모델링", "통계"],
          subjects: ["수학", "통계", "데이터"],
          career: ["AI", "분석", "예측"],
          extra: ["정량분석"],
        },
      },
      {
        id: "q04",
        text: "네트워크, 기기, 통신 구조처럼 시스템이 연결되는 원리가 궁금하다.",
        signals: {
          activities: ["네트워크", "통신", "시스템"],
          subjects: ["정보통신", "인프라", "IoT"],
          career: ["네트워크", "통신공학", "보안"],
          extra: ["하드웨어", "연결구조"],
        },
      },
      {
        id: "q05",
        text: "흐름이 비효율적이면 공정이나 운영 구조를 더 좋게 바꾸고 싶다.",
        signals: {
          activities: ["최적화", "공정", "운영", "프로세스"],
          subjects: ["산업공학", "생산관리", "시스템"],
          career: ["생산관리", "프로세스혁신", "물류시스템"],
          extra: ["효율", "운영개선"],
        },
      },
      {
        id: "q06",
        text: "지도, 공간, 도시, 지역 문제를 데이터와 설계로 다루는 일에 끌린다.",
        signals: {
          activities: ["도시계획", "공간분석", "GIS"],
          subjects: ["도시설계", "공간디자인", "지역분석"],
          career: ["스마트시티", "도시디자인", "도시계획"],
          extra: ["지도", "공간정보"],
        },
      },
      {
        id: "q07",
        text: "실험, 화학, 바이오, 화장품처럼 실험실 기반 탐구가 잘 맞는다.",
        signals: {
          activities: ["실험", "연구", "분석"],
          subjects: ["화학", "바이오", "피부과학", "화장품"],
          career: ["바이오", "화장품", "연구개발"],
          extra: ["실험실", "배합"],
        },
      },
      {
        id: "q08",
        text: "앱이나 서비스의 화면, UX, 사용 흐름을 다듬는 작업이 재미있다.",
        signals: {
          activities: ["UX", "UI", "디자인"],
          subjects: ["미디어", "콘텐츠개발", "디지털디자인"],
          career: ["앱개발", "디지털콘텐츠", "프로덕트"],
          extra: ["사용자경험", "인터랙션"],
        },
      },
      {
        id: "q09",
        text: "아이디어보다 실제로 돌아가는 결과물을 만드는 쪽이 더 끌린다.",
        signals: {
          activities: ["프로젝트", "제작", "구현"],
          subjects: ["실습", "응용"],
          career: ["서비스개발", "제품기획", "현업"],
          extra: ["프로토타입", "완성도"],
        },
      },
      {
        id: "q10",
        text: "혼자 오래 집중해서 기술적 완성도를 올리는 작업이 가능하다.",
        signals: {
          activities: ["집중연구", "개발", "분석"],
          subjects: ["심화학습", "전공몰입"],
          career: ["전문직", "개발자"],
          extra: ["몰입", "집중력"],
        },
      },
    ],
  },
  {
    id: "people",
    title: "사람·언어·조직",
    copy: "상담, 교육, 행정, 국제, 서비스, 운영 적합도를 보는 구간입니다.",
    pill: "10문항",
    summaryLabel: "사람·언어·조직",
    summaryBoost: {
      activities: ["소통", "기획", "협업", "운영"],
      subjects: ["언어", "사회", "조직"],
      career: ["행정", "교육", "서비스", "국제업무"],
      extra: ["사람중심", "현장대응"],
    },
    questions: [
      {
        id: "q11",
        text: "사람 이야기를 듣고 감정을 정리해 주거나 도와주는 역할이 잘 맞는다.",
        signals: {
          activities: ["상담", "도움", "경청"],
          subjects: ["상담", "복지", "사례관리"],
          career: ["사회복지", "상담", "실천"],
          extra: ["공감", "지원"],
        },
      },
      {
        id: "q12",
        text: "내가 이해한 내용을 다른 사람에게 설명하고 가르치는 편을 좋아한다.",
        signals: {
          activities: ["교육", "코칭", "설명"],
          subjects: ["교육", "교수법", "학습설계"],
          career: ["교육", "강의", "지도"],
          extra: ["전달력", "교수"],
        },
      },
      {
        id: "q13",
        text: "정책, 행정, 공공 제도처럼 사회 시스템을 다루는 일에 관심이 있다.",
        signals: {
          activities: ["정책분석", "행정", "공공"],
          subjects: ["행정", "정책", "제도"],
          career: ["공공", "행정", "정책"],
          extra: ["조직운영", "규정"],
        },
      },
      {
        id: "q14",
        text: "사람과 일정, 자원, 역할을 조율하면서 팀을 굴리는 편이 익숙하다.",
        signals: {
          activities: ["기획", "운영", "관리"],
          subjects: ["경영", "조직", "프로젝트"],
          career: ["경영", "프로젝트관리", "운영관리"],
          extra: ["조율", "리더십"],
        },
      },
      {
        id: "q15",
        text: "브랜드를 알리고 사람을 설득하는 마케팅/홍보 작업이 재미있다.",
        signals: {
          activities: ["마케팅", "홍보", "광고", "브랜딩"],
          subjects: ["경영", "브랜드", "광고"],
          career: ["마케터", "광고기획", "홍보"],
          extra: ["설득", "카피"],
        },
      },
      {
        id: "q16",
        text: "여행, 호텔, 서비스처럼 현장에서 고객 경험을 만드는 일이 끌린다.",
        signals: {
          activities: ["서비스", "여행", "관광"],
          subjects: ["관광", "호텔", "서비스"],
          career: ["관광", "호텔", "서비스업"],
          extra: ["고객경험", "현장응대"],
        },
      },
      {
        id: "q17",
        text: "외국어를 배우고 다른 문화권 사람과 소통하는 일이 재미있다.",
        signals: {
          activities: ["외국어", "국제교류", "문화이해"],
          subjects: ["영어", "중국어", "번역", "통역"],
          career: ["통번역", "국제업무", "글로벌커뮤니케이션"],
          extra: ["실무영어", "언어감각"],
        },
      },
      {
        id: "q18",
        text: "상품, 유통, 물류, 공급망처럼 흐름을 설계하는 일이 흥미롭다.",
        signals: {
          activities: ["물류", "유통", "무역", "공급망"],
          subjects: ["물류", "무역", "SCM"],
          career: ["글로벌물류", "유통", "무역실무"],
          extra: ["재고", "흐름설계"],
        },
      },
      {
        id: "q19",
        text: "국제개발, ODA, 지역 문제 해결처럼 공공적 국제 협력에 끌린다.",
        signals: {
          activities: ["국제협력", "국제개발", "현장문제"],
          subjects: ["ODA", "지역연구", "개발협력"],
          career: ["국제기구", "개발협력", "현장실무"],
          extra: ["글로벌이슈", "공공성"],
        },
      },
      {
        id: "q20",
        text: "신학, 성서, 공동체, 사역, 선교처럼 가치와 세계관을 다루는 공부가 맞는다.",
        signals: {
          activities: ["신학", "사역", "공동체", "선교"],
          subjects: ["성서", "기독교교육", "교회사역"],
          career: ["교회사역", "문화선교", "교육사역"],
          extra: ["세계관", "영성"],
        },
      },
    ],
  },
  {
    id: "content",
    title: "콘텐츠·표현·현장",
    copy: "글쓰기, 영상, 공연, 음악, 뷰티, 문화기획 적합도를 보는 구간입니다.",
    pill: "10문항",
    summaryLabel: "콘텐츠·표현·현장",
    summaryBoost: {
      activities: ["콘텐츠", "표현", "창작", "현장"],
      subjects: ["미디어", "예술", "서사"],
      career: ["콘텐츠제작", "공연", "영상", "기획"],
      extra: ["크리에이티브", "감각"],
    },
    questions: [
      {
        id: "q21",
        text: "글을 쓰거나 스토리를 만들면서 메시지를 구성하는 일이 재미있다.",
        signals: {
          activities: ["글쓰기", "스토리텔링", "서사"],
          subjects: ["작문", "시나리오", "콘텐츠"],
          career: ["방송작가", "콘텐츠기획", "출판"],
          extra: ["문장력", "기획력"],
        },
      },
      {
        id: "q22",
        text: "문학 작품이나 텍스트를 읽고 해석하고 비평하는 일이 잘 맞는다.",
        signals: {
          activities: ["읽기", "비평", "해석"],
          subjects: ["문학", "텍스트", "영문학", "중문학"],
          career: ["연구", "출판", "교육"],
          extra: ["독해", "해석력"],
        },
      },
      {
        id: "q23",
        text: "영상 촬영, 편집, 후반 작업처럼 미디어 제작 과정이 재미있다.",
        signals: {
          activities: ["영상편집", "촬영", "콘텐츠제작"],
          subjects: ["영상", "미디어", "후반작업"],
          career: ["영상제작", "영화영상", "미디어"],
          extra: ["편집감각", "장면구성"],
        },
      },
      {
        id: "q24",
        text: "연기, 캐릭터 표현, 무대 퍼포먼스처럼 몸으로 표현하는 활동이 좋다.",
        signals: {
          activities: ["연기", "퍼포먼스", "무대"],
          subjects: ["연극", "표현", "공연예술"],
          career: ["연기예술", "배우", "공연"],
          extra: ["현장반응", "표현력"],
        },
      },
      {
        id: "q25",
        text: "음악, 사운드, 작곡, 음향 기술처럼 소리 중심 작업이 끌린다.",
        signals: {
          activities: ["음악", "작곡", "사운드", "음향"],
          subjects: ["실용음악", "뮤직테크놀로지", "음악이론"],
          career: ["공연음악", "실용음악", "사운드디자인"],
          extra: ["리듬", "청음"],
        },
      },
      {
        id: "q26",
        text: "스타일링, 메이크업, 뷰티 디자인처럼 외형을 변화시키는 작업이 재미있다.",
        signals: {
          activities: ["뷰티", "스타일링", "메이크업"],
          subjects: ["미용", "뷰티디자인", "디자인"],
          career: ["뷰티디자인", "메이크업", "스타일리스트"],
          extra: ["미적감각", "트렌드"],
        },
      },
      {
        id: "q27",
        text: "카메라 구도, 장면 구성, 연출 의도를 잡는 일이 흥미롭다.",
        signals: {
          activities: ["연출", "촬영", "영상기획"],
          subjects: ["영화", "영상", "연출"],
          career: ["영화영상", "감독", "영상연출"],
          extra: ["시각구성", "장면설계"],
        },
      },
      {
        id: "q28",
        text: "대중문화와 트렌드를 읽고 콘텐츠 아이템으로 연결하는 편이다.",
        signals: {
          activities: ["콘텐츠기획", "트렌드분석", "브랜딩"],
          subjects: ["미디어", "문화", "콘텐츠"],
          career: ["미디어기획", "브랜드콘텐츠", "광고기획"],
          extra: ["대중문화", "기획감각"],
        },
      },
      {
        id: "q29",
        text: "스튜디오, 무대, 촬영장처럼 현장감 있는 작업 환경이 잘 맞는다.",
        signals: {
          activities: ["공연", "촬영현장", "스튜디오"],
          subjects: ["현장실습", "공연예술", "영상"],
          career: ["무대", "공연기획", "영상현장"],
          extra: ["현장감", "즉시반응"],
        },
      },
      {
        id: "q30",
        text: "사람들 앞에서 발표하거나 보여 주는 식의 표현 활동이 편하다.",
        signals: {
          activities: ["발표", "소통", "표현"],
          subjects: ["커뮤니케이션", "실전발표"],
          career: ["홍보", "교육", "서비스", "퍼포먼스"],
          extra: ["무대경험", "자기표현"],
        },
      },
    ],
  },
];

const SURVEY_TOTAL = SURVEY_SECTIONS.reduce((total, section) => total + section.questions.length, 0);
const SURVEY_QUESTIONS = SURVEY_SECTIONS.flatMap((section) =>
  section.questions.map((question) => ({ ...question, sectionId: section.id, sectionTitle: section.title }))
);
const SURVEY_QUESTION_MAP = new Map(SURVEY_QUESTIONS.map((question) => [question.id, question]));

const SAMPLE_SURVEY_ANSWERS = {
  q01: 5,
  q02: 5,
  q03: 4,
  q04: 4,
  q05: 4,
  q06: 3,
  q07: 2,
  q08: 4,
  q09: 5,
  q10: 4,
  q11: 3,
  q12: 3,
  q13: 2,
  q14: 4,
  q15: 3,
  q16: 2,
  q17: 3,
  q18: 3,
  q19: 2,
  q20: 1,
  q21: 3,
  q22: 2,
  q23: 4,
  q24: 2,
  q25: 2,
  q26: 1,
  q27: 4,
  q28: 4,
  q29: 3,
  q30: 3,
};

const EMPTY_RESULT = {
  ready: [],
  blocked: [],
  matchedCompleted: [],
  unmatchedCompleted: [],
};

const GUIDEBOOK_PDF_PATH = "./data/2026 전공설계지원센터가이드북 최종.pdf";
const COURSE_SCORE_WEIGHTS = {
  semantic: 0.38,
  curriculum: 0.4,
  graduation: 0.22,
};

const state = {
  bundle: null,
  validationReport: null,
  majorsMeta: [],
  db: null,
  coursesById: new Map(),
  coursesByMajor: new Map(),
  majorProfiles: [],
  scenarios: [],
  surveyAnswers: new Map(),
  activeRecommendations: [],
  majorLocked: false,
  initialized: false,
  eventsBound: false,
};

const elements = {
  form: document.getElementById("plannerForm"),
  questionnaireSections: document.getElementById("questionnaireSections"),
  surveyProgressText: document.getElementById("surveyProgressText"),
  surveyProgressBar: document.getElementById("surveyProgressBar"),
  submitButton: document.getElementById("submitButton"),
  majorSelect: document.getElementById("majorSelect"),
  trackSelect: document.getElementById("trackSelect"),
  semesterSelect: document.getElementById("semesterSelect"),
  completedInput: document.getElementById("completedInput"),
  majorResults: document.getElementById("majorResults"),
  majorDetailPanel: document.getElementById("majorDetailPanel"),
  pdfLinkStack: document.getElementById("pdfLinkStack"),
  majorPdfFrame: document.getElementById("majorPdfFrame"),
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
  setMessage("잠시만 기다려주세요.");
  renderQuestionnaire();
  syncSurveyProgress();

  try {
    bindEvents();
    state.bundle = await loadBundle(forceRefresh);
    state.validationReport = await loadOptionalJson("./tmp/validation_report.json");
    state.majorsMeta = (await loadOptionalJson("./data/majors.json")) || [];
    buildIndexes();
    populateControls();
    renderMeta();
    state.initialized = true;

    if (isSurveyComplete()) {
      runRecommendation();
    } else {
      setSurveyPendingState();
    }
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

  elements.questionnaireSections.addEventListener("click", (event) => {
    const button = event.target.closest("[data-question-id][data-score]");
    if (!button) {
      return;
    }

    const questionId = button.getAttribute("data-question-id") || "";
    const score = Number(button.getAttribute("data-score") || 0);
    if (!questionId || !score) {
      return;
    }

    state.surveyAnswers.set(questionId, score);
    state.majorLocked = false;
    syncSurveyProgress();

    if (state.initialized && isSurveyComplete()) {
      runRecommendation();
    } else {
      setSurveyPendingState();
    }
  });

  elements.majorSelect.addEventListener("change", () => {
    state.majorLocked = true;
    updateTrackOptions();
    if (state.initialized && isSurveyComplete()) {
      renderCurrentMajorDetail();
    }
    if (state.initialized && isSurveyComplete()) {
      runRecommendation();
    }
  });

  elements.trackSelect.addEventListener("change", () => {
    state.majorLocked = true;
    if (state.initialized && isSurveyComplete()) {
      renderCurrentMajorDetail();
    }
    if (state.initialized && isSurveyComplete()) {
      runRecommendation();
    }
  });

  elements.semesterSelect.addEventListener("change", () => {
    if (state.initialized && isSurveyComplete()) {
      renderCurrentMajorDetail();
    }
    if (state.initialized && isSurveyComplete()) {
      runRecommendation();
    }
  });

  elements.completedInput.addEventListener("input", () => {
    if (state.initialized && isSurveyComplete()) {
      runRecommendation();
    }
  });

  elements.sampleButton.addEventListener("click", () => {
    fillSampleSurvey();
    state.majorLocked = false;
    if (state.initialized) {
      runRecommendation();
    }
  });

  elements.refreshButton.addEventListener("click", async () => {
    setMessage("자료를 다시 불러오는 중입니다.");
    await clearCache();
    state.initialized = false;
    await init(true);
  });

  elements.majorResults.addEventListener("click", (event) => {
    const button = event.target.closest("[data-major-pick]");
    if (!button) {
      return;
    }

    const major = button.getAttribute("data-major-pick") || "";
    const track = button.getAttribute("data-track-pick") || "";
    if (!major) {
      return;
    }

    elements.majorSelect.value = major;
    state.majorLocked = true;
    updateTrackOptions(track);
    renderCurrentMajorDetail();
    if (state.initialized && isSurveyComplete()) {
      runRecommendation();
    }
  });
}

function renderQuestionnaire() {
  let questionNumber = 0;

  elements.questionnaireSections.innerHTML = SURVEY_SECTIONS.map((section) => {
    const cards = section.questions
      .map((question) => {
        questionNumber += 1;
        return renderQuestionCard(question, questionNumber);
      })
      .join("");

    return `
      <section class="survey-section">
        <div class="survey-section-head">
          <div>
            <h3 class="survey-section-title">${escapeHtml(section.title)}</h3>
            <p class="survey-section-copy">${escapeHtml(section.copy)}</p>
          </div>
          <span class="survey-section-pill" data-section-progress="${escapeAttr(section.id)}">0 / ${
            section.questions.length
          }</span>
        </div>
        <div class="question-grid">${cards}</div>
      </section>
    `;
  }).join("");
}

function renderQuestionCard(question, ordinal) {
  const buttons = SCALE_OPTIONS.map(
    (option) => `
      <button
        type="button"
        class="scale-button"
        data-question-id="${escapeAttr(question.id)}"
        data-score="${option.score}"
        aria-pressed="false"
      >
        <span class="scale-score">${option.score}</span>
        <span class="scale-label">${escapeHtml(option.label)}</span>
      </button>
    `
  ).join("");

  return `
    <article class="question-card" data-question-card="${escapeAttr(question.id)}">
      <div class="question-topline">
        <span class="question-number">Q${String(ordinal).padStart(2, "0")}</span>
        <span class="question-status" data-question-status="${escapeAttr(question.id)}">미응답</span>
      </div>
      <p class="question-text">${escapeHtml(question.text)}</p>
      <div class="scale-grid">${buttons}</div>
    </article>
  `;
}

function syncSurveyProgress() {
  const answeredCount = state.surveyAnswers.size;
  const percent = answeredCount ? Math.round((answeredCount / SURVEY_TOTAL) * 100) : 0;

  elements.surveyProgressText.textContent = `${answeredCount} / ${SURVEY_TOTAL}`;
  elements.surveyProgressBar.style.width = `${percent}%`;
  elements.submitButton.disabled = answeredCount < SURVEY_TOTAL;
  elements.submitButton.textContent =
    answeredCount < SURVEY_TOTAL
      ? `추천 보려면 ${SURVEY_TOTAL - answeredCount}개 더 답하기`
      : "추천 보기";

  for (const section of SURVEY_SECTIONS) {
    const completed = section.questions.filter((question) => state.surveyAnswers.has(question.id)).length;
    const pill = elements.questionnaireSections.querySelector(`[data-section-progress="${section.id}"]`);
    if (pill) {
      pill.textContent = `${completed} / ${section.questions.length}`;
    }
  }

  for (const question of SURVEY_QUESTIONS) {
    const answer = Number(state.surveyAnswers.get(question.id) || 0);
    const card = elements.questionnaireSections.querySelector(`[data-question-card="${question.id}"]`);
    const status = elements.questionnaireSections.querySelector(`[data-question-status="${question.id}"]`);
    const label = SCALE_OPTIONS.find((option) => option.score === answer)?.label || "미응답";

    if (card) {
      card.classList.toggle("answered", Boolean(answer));
    }
    if (status) {
      status.textContent = label;
    }

    const buttons = elements.questionnaireSections.querySelectorAll(`[data-question-id="${question.id}"]`);
    buttons.forEach((button) => {
      const active = Number(button.getAttribute("data-score") || 0) === answer;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }
}

function fillSampleSurvey() {
  state.surveyAnswers = new Map(
    Object.entries(SAMPLE_SURVEY_ANSWERS).map(([questionId, score]) => [questionId, Number(score)])
  );
  elements.completedInput.value = "";
  if (state.bundle?.rules?.default_semester) {
    elements.semesterSelect.value = state.bundle.rules.default_semester;
  }
  syncSurveyProgress();
}

function isSurveyComplete() {
  return state.surveyAnswers.size === SURVEY_TOTAL;
}

function setSurveyPendingState() {
  const answeredCount = state.surveyAnswers.size;
  if (!answeredCount) {
    setMessage("질문에 답하면 추천 결과가 나옵니다.");
  } else {
    setMessage(`${answeredCount}/${SURVEY_TOTAL} 답변 완료`);
  }

  renderMajorRecommendations([]);
  renderEmptyMajorDetail();
  renderRecommendation(EMPTY_RESULT, {
    ready: "추천 전공이 정해지면 다음 학기 과목을 여기서 보여줍니다.",
    blocked: "선수 미충족 과목은 여기서 따로 분리됩니다.",
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

  if (elements.cacheStatus) {
    elements.cacheStatus.textContent = forceRefresh ? "다시 불러옴" : "준비됨";
  }
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

  const metaByName = new Map((state.majorsMeta || []).map((item) => [normalizeSpace(item.name), item]));
  state.majorProfiles = (state.bundle.coursesPayload.majors || []).map((major) => {
    const majorName = normalizeSpace(major);
    const majorCourses = state.coursesByMajor.get(majorName) || [];
    const meta = metaByName.get(majorName) || {};
    const tracks = state.bundle.rules.track_catalog?.[majorName]?.tracks || [];

    const aliases = Array.isArray(meta.aliases) ? meta.aliases : [];
    const keywords = Array.isArray(meta.keywords) ? meta.keywords : [];
    const courseNames = majorCourses
      .slice()
      .sort((a, b) => Number(b.core_score || 0) - Number(a.core_score || 0))
      .slice(0, 10)
      .map((course) => course.course_name);

    const tokens = dedupeTextList([
      majorName,
      ...aliases,
      ...keywords,
      ...tracks.flatMap((track) => [track.name, ...(track.keywords || [])]),
      ...courseNames,
    ]);

    const profileText = normalizeSpace(
      [
        majorName,
        ...aliases,
        ...keywords,
        ...tracks.flatMap((track) => [track.name, track.summary, ...(track.keywords || [])]),
        ...courseNames,
      ].join(" ")
    );

    return {
      name: majorName,
      aliases,
      keywords,
      tokens,
      tracks,
      vector: textToVector(profileText, state.bundle.rules.embedding),
    };
  });
}

function populateControls() {
  const majors = state.bundle.coursesPayload.majors || [];
  elements.majorSelect.innerHTML = majors
    .map((major) => `<option value="${escapeAttr(major)}">${escapeHtml(major)}</option>`)
    .join("");

  const semesters = state.bundle.rules.semesters || [];
  const defaultSemester = state.bundle.rules.default_semester || "all";
  elements.semesterSelect.innerHTML = [
    '<option value="all">전체</option>',
    ...semesters.map(
      (semester) =>
        `<option value="${escapeAttr(semester)}" ${semester === defaultSemester ? "selected" : ""}>${escapeHtml(
          semester
        )}</option>`
    ),
  ].join("");

  updateTrackOptions();
  renderEmptyMajorDetail();
}

function updateTrackOptions(preferredTrack) {
  const major = elements.majorSelect.value;
  const currentTrack = preferredTrack === undefined ? elements.trackSelect.value : preferredTrack;
  const tracks = state.bundle.rules.track_catalog?.[major]?.tracks || [];
  const options = ['<option value="">전체 트랙</option>'];
  for (const track of tracks) {
    options.push(`<option value="${escapeAttr(track.name)}">${escapeHtml(track.name)}</option>`);
  }
  elements.trackSelect.innerHTML = options.join("");

  const validTracks = new Set(["", ...tracks.map((track) => track.name)]);
  elements.trackSelect.value = validTracks.has(currentTrack) ? currentTrack : "";
}

function renderCurrentMajorDetail() {
  if (!state.bundle) {
    return;
  }
  renderMajorDetail(elements.majorSelect.value, elements.trackSelect.value, elements.semesterSelect.value);
}

function renderEmptyMajorDetail() {
  elements.majorDetailPanel.innerHTML =
    '<div class="empty-state">질문을 다 답하면 추천 전공의 트랙과 설명이 여기에 나옵니다.</div>';
  elements.pdfLinkStack.innerHTML = renderPdfLinks([buildGuidebookDownloadLink()]);
  elements.majorPdfFrame.removeAttribute("src");
}

function renderMeta() {
  if (!elements.dataVersion && !elements.validationStatus) {
    return;
  }
  if (elements.dataVersion) {
    elements.dataVersion.textContent = state.bundle.manifest.version || "-";
  }
  if (elements.validationStatus && state.validationReport?.summary) {
    const { passed, total } = state.validationReport.summary;
    elements.validationStatus.textContent = `${passed}/${total}`;
  } else if (elements.validationStatus) {
    elements.validationStatus.textContent = state.scenarios.length ? `${state.scenarios.length}개 로드` : "-";
  }
}

function runRecommendation() {
  if (!state.bundle) {
    return;
  }
  if (!isSurveyComplete()) {
    setSurveyPendingState();
    return;
  }

  const surveyProfile = buildSurveyProfile();
  const majorParams = {
    major: elements.majorSelect.value,
    selected_track: elements.trackSelect.value,
    target_semester: elements.semesterSelect.value,
    activities: surveyProfile.activities,
    subjects: surveyProfile.subjects,
    career: surveyProfile.career,
    avoid: surveyProfile.avoid,
    extra: surveyProfile.extra,
    completed_courses: elements.completedInput.value,
  };

  const majorRecommendations = recommendMajors(majorParams);
  state.activeRecommendations = majorRecommendations;
  renderMajorRecommendations(majorRecommendations);

  if (majorRecommendations.length && !state.majorLocked) {
    const top = majorRecommendations[0];
    elements.majorSelect.value = top.major;
    updateTrackOptions(top.tracks?.[0]?.name || "");
  }

  const params = {
    ...majorParams,
    major: elements.majorSelect.value,
    selected_track: elements.trackSelect.value,
  };

  renderMajorDetail(params.major, params.selected_track, params.target_semester);

  const messageParts = [];
  if (surveyProfile.dominantLabels.length) {
    messageParts.push(`주요 성향: ${surveyProfile.dominantLabels.join(", ")}`);
  }
  messageParts.push("추천 결과가 나왔습니다.");
  setMessage(messageParts.join(" · "));

  const recommendation = recommendCourses(params);
  renderRecommendation(recommendation);
}

function buildSurveyProfile() {
  const buckets = {
    activities: [],
    subjects: [],
    career: [],
    extra: [],
    avoid: [],
  };
  const sectionScores = [];

  for (const section of SURVEY_SECTIONS) {
    let sectionScore = 0;
    for (const question of section.questions) {
      const answer = Number(state.surveyAnswers.get(question.id) || 3);
      const delta = answer - 3;
      sectionScore += delta;
      applyQuestionSignals(question, delta, buckets);
    }

    if (sectionScore > 0) {
      const repeats = Math.min(2, Math.max(1, Math.ceil(sectionScore / 4)));
      applyBucketSignals(section.summaryBoost, repeats, buckets);
    } else if (sectionScore < -3) {
      const avoidTokens = flattenSignalValues(section.summaryBoost);
      buckets.avoid.push(...avoidTokens);
    }

    sectionScores.push({
      label: section.summaryLabel,
      score: sectionScore,
    });
  }

  const dominantLabels = sectionScores
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((item) => item.label);

  return {
    activities: normalizeSpace(buckets.activities.join(" ")),
    subjects: normalizeSpace(buckets.subjects.join(" ")),
    career: normalizeSpace(buckets.career.join(" ")),
    extra: normalizeSpace(buckets.extra.join(" ")),
    avoid: normalizeSpace(buckets.avoid.join(" ")),
    dominantLabels,
  };
}

function applyQuestionSignals(question, delta, buckets) {
  if (!delta) {
    return;
  }

  const repeats = Math.min(3, Math.abs(delta));
  if (delta > 0) {
    applyBucketSignals(question.signals, repeats, buckets);
    return;
  }

  const avoidTokens = dedupeTextList([...(question.avoid || []), ...flattenSignalValues(question.signals)]);
  for (let index = 0; index < repeats; index += 1) {
    buckets.avoid.push(...avoidTokens);
  }
}

function applyBucketSignals(signals, repeats, buckets) {
  for (let index = 0; index < repeats; index += 1) {
    for (const [key, values] of Object.entries(signals || {})) {
      if (!Array.isArray(values) || !buckets[key]) {
        continue;
      }
      buckets[key].push(...values);
    }
  }
}

function flattenSignalValues(signals) {
  return dedupeTextList(Object.values(signals || {}).flatMap((values) => values || []));
}

function recommendMajors(params) {
  const positiveText = buildPositiveProfileText(params);
  if (!normalizeSpace(positiveText)) {
    return [];
  }

  const avoidText = normalizeSpace(params.avoid);
  const axisVectors = new Map(
    MAJOR_AXIS_CONFIG.map((axis) => [axis.key, textToVector(params[axis.key], state.bundle.rules.embedding)])
  );
  const avoidVector = textToVector(avoidText, state.bundle.rules.embedding);

  const scored = [];
  for (const profile of state.majorProfiles) {
    let total = 0;
    const axisScores = [];

    for (const axis of MAJOR_AXIS_CONFIG) {
      const semantic = cosineSimilarity(axisVectors.get(axis.key), profile.vector);
      const lexical = keywordScore(params[axis.key], profile.tokens);
      const weighted = semantic * axis.semanticWeight + lexical.score * axis.lexicalWeight;
      total += weighted;
      axisScores.push({
        label: axis.label,
        value: weighted,
        hits: lexical.hits,
      });
    }

    const avoidSemantic = cosineSimilarity(avoidVector, profile.vector);
    const avoidLexical = keywordScore(avoidText, profile.tokens);
    total -= avoidSemantic * 1.0;
    total -= avoidLexical.score * 2.0;

    axisScores.sort((a, b) => b.value - a.value);
    const reasons = [];
    for (const item of axisScores) {
      if (item.value <= 0) {
        continue;
      }
      if (item.hits.length) {
        reasons.push(`${item.label}에서 '${item.hits[0]}' 축이 직접 맞물립니다.`);
      } else {
        reasons.push(`${item.label} 유사도가 높습니다.`);
      }
      if (reasons.length >= 2) {
        break;
      }
    }

    if (avoidText && (avoidSemantic + avoidLexical.score) < 1) {
      reasons.push("비선호 충돌은 비교적 낮습니다.");
    }
    if (!reasons.length) {
      reasons.push("설문 응답으로 만든 프로필과 전공 설명 유사도를 기준으로 추천했습니다.");
    }

    scored.push({
      major: profile.name,
      score: round4(total),
      reason: reasons.join(" "),
      tracks: recommendTracks(profile.name, params),
    });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 3);
}

function recommendTracks(majorName, params) {
  const tracks = state.bundle.rules.track_catalog?.[majorName]?.tracks || [];
  if (!tracks.length) {
    return [];
  }

  const positiveText = buildPositiveProfileText(params);
  const avoidText = normalizeSpace(params.avoid);
  const positiveVector = textToVector(positiveText, state.bundle.rules.embedding);
  const avoidVector = textToVector(avoidText, state.bundle.rules.embedding);

  const scored = tracks.map((track, index) => {
    const trackTokens = dedupeTextList([track.name, ...(track.keywords || [])]);
    const trackText = normalizeSpace([track.name, track.summary, ...(track.keywords || [])].join(" "));
    const trackVector = textToVector(trackText, state.bundle.rules.embedding);
    const lexical = keywordScore(positiveText, trackTokens);
    const avoidLexical = keywordScore(avoidText, trackTokens);
    const semantic = cosineSimilarity(positiveVector, trackVector);
    const avoidSemantic = cosineSimilarity(avoidVector, trackVector);
    return {
      name: track.name,
      summary: lexical.hits.length
        ? `${track.summary} '${lexical.hits[0]}' 키워드와 연결됩니다.`
        : track.summary,
      score: semantic + lexical.score * 1.6 - avoidSemantic * 0.8 - avoidLexical.score * 1.4 - index * 0.000001,
    };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, 2);
}

function renderMajorRecommendations(recommendations) {
  if (!recommendations.length) {
    elements.majorResults.innerHTML =
      '<div class="empty-state">30문항 설문을 모두 응답하면 추천 전공 Top3가 표시됩니다.</div>';
    return;
  }

  elements.majorResults.innerHTML = recommendations
    .map((item, index) => {
      const firstTrack = item.tracks?.[0]?.name || "";
      const trackPills = (item.tracks || [])
        .map((track) => `<span class="track-pill">${escapeHtml(track.name)}</span>`)
        .join("");

      return `
        <article class="major-card">
          <div class="major-head">
            <div>
              <div class="major-rank">TOP ${index + 1}</div>
              <h3 class="major-title">${escapeHtml(item.major)}</h3>
            </div>
            <div class="score-chip">${item.score.toFixed(2)}</div>
          </div>
          <p class="major-reason">${escapeHtml(item.reason)}</p>
          <div class="track-stack">${trackPills}</div>
          <div class="major-action">
            <button
              type="button"
              class="major-pick-button"
              data-major-pick="${escapeAttr(item.major)}"
              data-track-pick="${escapeAttr(firstTrack)}"
            >
              이 전공으로 과목 추천 이어가기
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderMajorDetail(majorName, selectedTrack, targetSemester) {
  if (!majorName) {
    elements.majorDetailPanel.innerHTML =
      '<div class="empty-state">전공이 선택되면 트랙과 PDF 정보가 여기에 표시됩니다.</div>';
    elements.pdfLinkStack.innerHTML = renderPdfLinks([buildGuidebookDownloadLink()]);
    elements.majorPdfFrame.removeAttribute("src");
    return;
  }

  const trackEntry = state.bundle.rules.track_catalog?.[majorName] || null;
  const pages = Array.isArray(trackEntry?.pages) ? trackEntry.pages.filter(Boolean) : [];
  const notes = normalizeSpace(trackEntry?.notes || "");
  const allTracks = Array.isArray(trackEntry?.tracks) ? trackEntry.tracks.slice() : [];
  const majorCourses = state.coursesByMajor.get(majorName) || [];
  const matched = matchCompletedCourses(majorCourses, elements.completedInput.value);
  const progression = buildProgressionContext(majorCourses, matched.matchedIds);
  const recommendationMatch = state.activeRecommendations.find((item) => item.major === majorName);
  const recommendedTrackNames = new Set((recommendationMatch?.tracks || []).map((track) => track.name));
  const sortedTracks = allTracks.sort((a, b) => {
    const aSelected = a.name === selectedTrack ? 1 : 0;
    const bSelected = b.name === selectedTrack ? 1 : 0;
    const aRecommended = recommendedTrackNames.has(a.name) ? 1 : 0;
    const bRecommended = recommendedTrackNames.has(b.name) ? 1 : 0;
    return bSelected - aSelected || bRecommended - aRecommended || a.name.localeCompare(b.name, "ko");
  });

  const recommendedTracksText = recommendationMatch?.tracks?.length
    ? recommendationMatch.tracks.map((track) => track.name).join(", ")
    : "";
  const focusTrackName =
    selectedTrack || recommendationMatch?.tracks?.[0]?.name || sortedTracks[0]?.name || "";
  const guideLinks = buildGuidebookLinks(pages);
  const timetableLinks = buildSemesterPdfLinks(targetSemester);
  const pdfLinks = [...guideLinks, ...timetableLinks];
  const defaultPdfLink = guideLinks.find((link) => !link.download)?.href || timetableLinks[0]?.href || "";
  const trackSpotlight = renderTrackSpotlight({
    majorName,
    focusTrackName,
    pages,
    progression,
  });

  elements.majorDetailPanel.innerHTML = `
    <div class="detail-header">
      <div>
        <p class="detail-kicker">선택한 전공</p>
        <h3 class="detail-major-name">${escapeHtml(majorName)}</h3>
        <p class="detail-copy">추천된 전공의 트랙과 PDF를 같이 볼 수 있습니다.</p>
      </div>
      <div class="detail-stat-stack">
        <span class="detail-pill">트랙 ${sortedTracks.length}</span>
        ${
          pages.length
            ? `<span class="detail-pill accent">가이드북 ${pages.map((page) => `p.${page}`).join(", ")}</span>`
            : ""
        }
      </div>
    </div>
    ${
      recommendedTracksText
        ? `<div class="detail-banner">설문 기준 추천 트랙: ${escapeHtml(recommendedTracksText)}</div>`
        : '<div class="detail-banner muted">아직 추천 트랙 계산 전입니다. 설문 완료 후 자동 표시됩니다.</div>'
    }
    ${
      notes
        ? `<div class="detail-notes">${escapeHtml(notes)}</div>`
        : '<div class="detail-notes subtle">트랙 요약과 가이드북 페이지를 함께 보여줍니다.</div>'
    }
    ${trackSpotlight}
    ${
      sortedTracks.length
        ? `<div class="track-detail-list">${sortedTracks
            .map((track) => renderTrackCard(track, selectedTrack, recommendedTrackNames))
            .join("")}</div>`
        : '<div class="empty-state">이 전공은 현재 트랙 가이드 데이터가 없습니다. 과목 추천과 시간표 PDF는 계속 볼 수 있습니다.</div>'
    }
  `;

  elements.pdfLinkStack.innerHTML = renderPdfLinks(pdfLinks);

  if (defaultPdfLink) {
    elements.majorPdfFrame.src = defaultPdfLink;
  } else {
    elements.majorPdfFrame.removeAttribute("src");
  }
}

function renderTrackCard(track, selectedTrack, recommendedTrackNames) {
  const isSelected = track.name === selectedTrack;
  const isRecommended = recommendedTrackNames.has(track.name);
  const keywordPills = (track.keywords || [])
    .slice(0, 4)
    .map((keyword) => `<span class="keyword-pill">${escapeHtml(keyword)}</span>`)
    .join("");

  return `
    <article class="track-detail-card ${isSelected ? "selected" : ""} ${isRecommended ? "recommended" : ""}">
      <div class="track-detail-head">
        <strong>${escapeHtml(track.name)}</strong>
        <div class="track-flag-row">
          ${isSelected ? '<span class="track-flag selected">선택</span>' : ""}
          ${isRecommended ? '<span class="track-flag recommended">추천</span>' : ""}
        </div>
      </div>
      <p class="track-detail-copy">${escapeHtml(track.summary || "트랙 설명 정보가 없습니다.")}</p>
      <div class="keyword-row">${keywordPills || '<span class="keyword-pill">키워드 없음</span>'}</div>
    </article>
  `;
}

function renderTrackSpotlight({ majorName, focusTrackName, pages, progression }) {
  if (!focusTrackName) {
    return "";
  }

  const trackEntry = state.bundle.rules.track_catalog?.[majorName] || null;
  const focusTrack = (trackEntry?.tracks || []).find((track) => track.name === focusTrackName);
  if (!focusTrack) {
    return "";
  }

  const majorCourses = state.coursesByMajor.get(majorName) || [];
  const trackCourses = getTrackCourses(majorCourses, focusTrackName);
  const roadmapGroups = buildTrackRoadmap(trackCourses);
  const pageLabel = buildGuidebookPageLabel(pages);

  const commonFoundation = majorCourses
    .filter((course) => Number(course.grade_value || 0) <= 2 && Number(course.order_value || 0) <= 2)
    .sort(compareCourseStage)
    .slice(0, 4);
  const nextCourses = majorCourses
    .filter((course) => progression.frontierIds.has(course.id))
    .sort((a, b) => {
      const directGap = Number(progression.directUnlockIds.has(b.id)) - Number(progression.directUnlockIds.has(a.id));
      if (directGap) {
        return directGap;
      }
      const affinityGap = trackAffinityScore(b, focusTrackName) - trackAffinityScore(a, focusTrackName);
      return affinityGap || compareCourseStage(a, b);
    })
    .slice(0, 4);
  const followup = dedupeTextList(nextCourses.flatMap((course) => course.dependent_names || [])).slice(0, 4);

  const keywordPills = (focusTrack.keywords || [])
    .slice(0, 4)
    .map((keyword) => `<span class="keyword-pill">${escapeHtml(keyword)}</span>`)
    .join("");
  const roadmapHtml = roadmapGroups
    .map(
      (group) => `
        <div class="roadmap-column ${group.className}">
          <span class="roadmap-label">${escapeHtml(group.label)}</span>
          <strong>${escapeHtml(group.title)}</strong>
          <div class="roadmap-course-list">
            ${
              group.courses.length
                ? group.courses
                    .map((course) => `<span class="roadmap-course">${escapeHtml(course.course_name)}</span>`)
                    .join("")
                : '<span class="roadmap-empty">대표 과목 없음</span>'
            }
          </div>
        </div>
      `
    )
    .join("");

  return `
    <section class="track-spotlight">
      <div class="track-spotlight-head">
        <div>
          <p class="detail-kicker">추천 트랙 요약</p>
          <h4 class="track-spotlight-title">${escapeHtml(focusTrack.name)}</h4>
          <p class="track-spotlight-copy">${escapeHtml(focusTrack.summary || "트랙 요약 정보가 없습니다.")}</p>
        </div>
        <div class="detail-stat-stack">
          ${pageLabel ? `<span class="detail-pill accent">${escapeHtml(pageLabel)}</span>` : ""}
          <span class="detail-pill">대표 과목 ${trackCourses.length}</span>
        </div>
      </div>
      <div class="keyword-row">${keywordPills || '<span class="keyword-pill">키워드 없음</span>'}</div>
      <div class="track-glance-grid">
        <article class="track-glance-card">
          <span class="slot-label">공통 바탕</span>
          <p>${escapeHtml(
            commonFoundation.length
              ? commonFoundation.map((course) => course.course_name).join(" · ")
              : "저학년 공통 기반 과목 데이터가 없습니다."
          )}</p>
        </article>
        <article class="track-glance-card emphasized">
          <span class="slot-label">지금 다음 순서</span>
          <p>${escapeHtml(
            nextCourses.length
              ? nextCourses.map((course) => course.course_name).join(" · ")
              : "현재 이수 기준에서 바로 이어지는 과목이 아직 없습니다."
          )}</p>
        </article>
        <article class="track-glance-card">
          <span class="slot-label">후속 확장</span>
          <p>${escapeHtml(followup.length ? followup.join(" · ") : "직접 이어지는 후속과목 정보가 많지 않습니다.")}</p>
        </article>
      </div>
      <div class="roadmap-grid">${roadmapHtml}</div>
    </section>
  `;
}

function getTrackCourses(courses, trackName) {
  return courses
    .map((course) => ({ course, affinity: trackAffinityScore(course, trackName) }))
    .filter((item) => item.affinity >= 0.025 || item.course.track_contributions?.[0]?.name === trackName)
    .sort((a, b) => compareCourseStage(a.course, b.course) || b.affinity - a.affinity)
    .map((item) => item.course);
}

function trackAffinityScore(course, trackName) {
  const selected = (course.track_contributions || []).find((item) => item.name === trackName);
  const topTrack = course.track_contributions?.[0];
  return Math.max(
    Number(selected?.score || 0),
    topTrack?.name === trackName ? Number(topTrack.score || 0) : 0
  );
}

function buildTrackRoadmap(trackCourses) {
  const groups = [
    { label: "기초", title: "기반 다지기", className: "foundation", courses: [] },
    { label: "핵심", title: "중심 과목", className: "core", courses: [] },
    { label: "심화", title: "응용 · 졸업 단계", className: "advanced", courses: [] },
  ];

  for (const course of trackCourses) {
    const grade = Number(course.grade_value || 1);
    const order = Number(course.order_value || 1);
    if (grade <= 1 || (grade <= 2 && order <= 2)) {
      groups[0].courses.push(course);
    } else if (grade <= 3 && order <= 3) {
      groups[1].courses.push(course);
    } else {
      groups[2].courses.push(course);
    }
  }

  return groups.map((group) => ({
    ...group,
    courses: group.courses.slice(0, 4),
  }));
}

function buildGuidebookPageLabel(pages) {
  if (!pages.length) {
    return "";
  }
  if (pages.length === 1) {
    return `원본 가이드북 p.${pages[0]}`;
  }
  return `원본 가이드북 p.${pages[0]}-${pages[pages.length - 1]}`;
}

function buildGuidebookDownloadLink() {
  return {
    label: "가이드북 PDF 내려받기",
    href: buildPdfHref(GUIDEBOOK_PDF_PATH),
    variant: "download",
    download: true,
  };
}

function renderPdfLinks(links) {
  if (!links.length) {
    return '<div class="empty-state">현재 연결된 PDF가 없습니다.</div>';
  }

  return links
    .map(
      (link) => `
        <a
          class="pdf-link ${link.variant || ""}"
          href="${escapeAttr(link.href)}"
          ${link.download ? "download" : ""}
          target="${escapeAttr(link.target || (link.download ? "_self" : "majorPdfFrame"))}"
          rel="noreferrer"
        >
          ${escapeHtml(link.label)}
        </a>
      `
    )
    .join("");
}

function buildGuidebookLinks(pages) {
  const links = [buildGuidebookDownloadLink()];
  if (!pages.length) {
    return links;
  }

  const pageLinks = pages.slice(0, 4).map((page) => ({
    label: `가이드북 p.${page}`,
    href: buildPdfHref(GUIDEBOOK_PDF_PATH, page),
    variant: "guide",
  }));

  pageLinks.push({
    label: "가이드북 전체",
    href: buildPdfHref(GUIDEBOOK_PDF_PATH),
    target: "_blank",
    variant: "external",
  });

  return [...links, ...pageLinks];
}

function buildSemesterPdfLinks(targetSemester) {
  const files = Array.isArray(state.bundle?.coursesPayload?.files) ? state.bundle.coursesPayload.files : [];
  const filtered =
    targetSemester && targetSemester !== "all" ? files.filter((item) => item.semester === targetSemester) : files;

  return filtered.map((item) => ({
    label: `${item.semester} 시간표 PDF`,
    href: buildPdfHref(`./data/pdfs/${item.pdf_filename}`),
    variant: "timetable",
  }));
}

function recommendCourses(params) {
  const courses = state.coursesByMajor.get(params.major) || [];
  const matched = matchCompletedCourses(courses, params.completed_courses);
  const queryText = buildCourseQueryText(params);
  const queryVector = textToVector(queryText, state.bundle.rules.embedding);
  const weights = state.bundle.rules.weights || {};
  const targetGrade = estimateTargetGrade(matched.matchedIds);
  const progression = buildProgressionContext(courses, matched.matchedIds);

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
    const curriculum = curriculumScore(course, targetGrade, progression);
    const graduation = graduationScore(course, params.selected_track);
    const prereqPenalty = missingIds.length
      ? (missingIds.length / Math.max(1, course.prerequisite_ids.length)) * Number(weights.prerequisite_penalty || 0.5)
      : 0;
    const orderPenalty = sequencePenalty(course, progression);
    const continuityBonus = progression.directUnlockIds.has(course.id) ? 0.18 : 0;
    const structuralBonus = Math.min(0.16, Number(course.dependent_count || 0) * 0.08);
    const total =
      semantic * COURSE_SCORE_WEIGHTS.semantic +
      curriculum * COURSE_SCORE_WEIGHTS.curriculum +
      graduation * COURSE_SCORE_WEIGHTS.graduation -
      prereqPenalty -
      orderPenalty +
      continuityBonus +
      structuralBonus;

    const keywordHits = keywordScore(queryText, course.keywords || []).hits.slice(0, 2);
    const progressionLabel = describeProgressionFit(course, progression);
    const item = {
      ...course,
      missing_prerequisites: missingNames,
      score: round4(total),
      score_breakdown: {
        semantic: round4(semantic),
        curriculum: round4(curriculum),
        graduation: round4(graduation),
        prerequisite_penalty: round4(prereqPenalty),
        sequence_penalty: round4(orderPenalty),
        continuity_bonus: round4(continuityBonus),
        structural_bonus: round4(structuralBonus),
      },
      progression_label: progressionLabel,
    };
    const reasonSlots = buildReasonSlots(item, params, missingNames, keywordHits);
    item.reason_slots = reasonSlots;
    item.reason = Object.values(reasonSlots).join(" ");

    if (!missingNames.length && total <= 0) {
      continue;
    }
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

function renderRecommendation(result, emptyMessages = {}) {
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
    : `<div class="empty-state">${escapeHtml(emptyMessages.ready || "조건에 맞는 추천 과목이 없습니다.")}</div>`;

  elements.blockedResults.innerHTML = result.blocked.length
    ? result.blocked.map((item) => renderCourseCard(item, true)).join("")
    : `<div class="empty-state">${escapeHtml(emptyMessages.blocked || "현재 기준으로 보류 과목이 없습니다.")}</div>`;
}

function renderCourseCard(course, blocked) {
  const topTrack = course.track_contributions?.[0];
  const sourceLinks = buildCourseSourceLinks(course);
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
    `<span class="metric-pill">관심일치 ${course.score_breakdown.semantic.toFixed(2)}</span>`,
    `<span class="metric-pill">단계적합 ${course.score_breakdown.curriculum.toFixed(2)}</span>`,
    `<span class="metric-pill">트랙기여 ${course.score_breakdown.graduation.toFixed(2)}</span>`,
    `<span class="metric-pill">선수감점 ${course.score_breakdown.prerequisite_penalty.toFixed(2)}</span>`,
    `<span class="metric-pill">점프감점 ${course.score_breakdown.sequence_penalty.toFixed(2)}</span>`,
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
      ${sourceLinks ? `<div class="source-row">${sourceLinks}</div>` : ""}
      <div class="metric-row">${metrics}</div>
      <div class="reason-box">${escapeHtml(course.reason)}</div>
      <div class="slot-list">${slots}</div>
    </article>
  `;
}

function buildCourseSourceLinks(course) {
  const refs = Array.isArray(course.source_refs) ? course.source_refs : [];
  if (!refs.length) {
    return "";
  }

  const uniqueRefs = [];
  const seen = new Set();
  for (const ref of refs) {
    const pdfName = normalizeSpace(ref.source_pdf);
    const page = Number(ref.page || 0);
    const key = `${pdfName}:${page}`;
    if (!pdfName || seen.has(key)) {
      continue;
    }
    seen.add(key);
    uniqueRefs.push({ pdfName, page });
  }

  return uniqueRefs
    .slice(0, 3)
    .map(
      (ref) => `
        <a
          class="source-link"
          href="${escapeAttr(buildPdfHref(`./data/pdfs/${ref.pdfName}`, ref.page || undefined))}"
          target="_blank"
          rel="noreferrer"
        >
          시간표 p.${ref.page || "-"}
        </a>
      `
    )
    .join("");
}

function buildReasonSlots(course, params, missingNames, keywordHits) {
  const positiveText = buildPositiveProfileText(params);

  const interestMatch = keywordHits.length
    ? `관심사 매칭: ${keywordHits.slice(0, 2).join(", ")} 키워드와 직접 연결됩니다.`
    : `관심사 매칭: ${normalizeSpace(positiveText) ? "설문 프로필과 과목 프로필 유사도가 높습니다." : "전공/트랙 기준 추천입니다."}`;

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
  const curriculumFit = `순서 적합도: ${course.progression_label || "현재 이수 흐름을 기준으로 계산했습니다."}`;

  let selectedTrackContribution = null;
  if (params.selected_track) {
    selectedTrackContribution = (course.track_contributions || []).find((item) => item.name === params.selected_track);
  }
  const topTrack = selectedTrackContribution || course.track_contributions?.[0];
  const trackContribution = topTrack
    ? topTrack.matched_keywords?.length
      ? `트랙 기여: ${topTrack.name}과 ${topTrack.matched_keywords.slice(0, 2).join(", ")} 축으로 연관도가 높습니다.`
      : `트랙 기여: ${topTrack.name} 쪽 졸업 설계에 기여도가 큽니다.`
    : "트랙 기여: 전공 공통 기반 과목으로 활용 가능합니다.";

  return {
    interest_match: interestMatch,
    curriculum_fit: curriculumFit,
    prerequisite_status: prerequisiteStatus,
    offered_semester: offeredSemester,
    follow_on_link: followOnLink,
    track_contribution: trackContribution,
  };
}

function buildPositiveProfileText(params) {
  return normalizeSpace([params.activities, params.subjects, params.career, params.extra].join(" "));
}

function buildCourseQueryText(params) {
  return normalizeSpace(
    [params.activities, params.subjects, params.career, params.extra, params.selected_track].join(" ")
  );
}

function semanticScore(course, queryVector) {
  if (!course.chunk_indices?.length) {
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

function curriculumScore(course, targetGrade, progression) {
  const gradeGap = Math.min(Math.abs(Number(course.grade_value || targetGrade) - targetGrade), 3) / 3;
  const gradeFit = 1 - gradeGap;
  const orderValue = Number(course.order_value || 1);
  const gradeValue = Number(course.grade_value || targetGrade || 1);

  let orderFit = 0;
  if (!progression.hasCompleted) {
    orderFit = clamp(1 - (gradeValue - 1) * 0.22 - Math.max(0, orderValue - 1) * 0.08, 0.12, 1);
  } else if (progression.directUnlockIds.has(course.id)) {
    orderFit = 1;
  } else if (progression.frontierIds.has(course.id)) {
    orderFit = 0.92;
  } else {
    const gradeJump = Math.max(0, gradeValue - progression.currentGrade);
    const orderJump = Math.max(0, orderValue - progression.currentOrder);
    orderFit = 0.78 - gradeJump * 0.22 - orderJump * 0.08;
    if (gradeJump >= 2) {
      orderFit -= 0.18;
    }
    if (gradeValue >= 3 && progression.currentGrade <= 1) {
      orderFit -= 0.12;
    }
    orderFit = clamp(orderFit, 0, 1);
  }

  return 0.34 * gradeFit + 0.66 * orderFit;
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
  return 0.45 * Number(course.core_score || 0.55) + 0.35 * trackScore + 0.2 * unlockScore;
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

function buildProgressionContext(courses, matchedIds) {
  const completedCourses = Array.from(matchedIds)
    .map((item) => state.coursesById.get(item))
    .filter(Boolean)
    .sort(compareCourseStage);

  if (!completedCourses.length) {
    return {
      hasCompleted: false,
      currentGrade: 1,
      currentOrder: 1,
      completedCourses,
      frontierIds: new Set(),
      directUnlockIds: new Set(),
    };
  }

  const lastCourse = completedCourses[completedCourses.length - 1];
  const currentGrade = Number(lastCourse.grade_value || 1);
  const currentOrder = Number(lastCourse.order_value || 1);
  const frontierIds = new Set();
  const directUnlockIds = new Set();

  for (const course of courses) {
    if (matchedIds.has(course.id)) {
      continue;
    }

    const gradeValue = Number(course.grade_value || currentGrade);
    const orderValue = Number(course.order_value || 1);
    const prereqIds = course.prerequisite_ids || [];
    const prereqsMet = prereqIds.every((item) => matchedIds.has(item));
    if (!prereqsMet) {
      continue;
    }

    const dependsOnCompleted = prereqIds.some((item) => matchedIds.has(item));
    const sameGradeNext = gradeValue === currentGrade && orderValue <= currentOrder + 1;
    const nearNextGrade = gradeValue === currentGrade + 1 && orderValue <= 2;
    const earlyFoundation = currentGrade <= 1 && gradeValue <= 2 && orderValue <= 2;

    if (dependsOnCompleted) {
      directUnlockIds.add(course.id);
    }
    if (dependsOnCompleted || sameGradeNext || nearNextGrade || earlyFoundation) {
      frontierIds.add(course.id);
    }
  }

  if (!frontierIds.size) {
    courses
      .filter((course) => !matchedIds.has(course.id))
      .sort(compareCourseStage)
      .slice(0, 4)
      .forEach((course) => frontierIds.add(course.id));
  }

  return {
    hasCompleted: true,
    currentGrade,
    currentOrder,
    completedCourses,
    frontierIds,
    directUnlockIds,
  };
}

function sequencePenalty(course, progression) {
  if (!progression.hasCompleted || progression.frontierIds.has(course.id)) {
    return 0;
  }

  const gradeValue = Number(course.grade_value || progression.currentGrade);
  const orderValue = Number(course.order_value || 1);
  const gradeJump = Math.max(0, gradeValue - progression.currentGrade);
  const orderJump = Math.max(0, orderValue - progression.currentOrder);

  let penalty = 0;
  if (gradeJump >= 2) {
    penalty += 0.42;
  } else if (gradeJump === 1) {
    penalty += progression.currentGrade <= 1 ? 0.2 : 0.12;
  }
  if (gradeJump >= 1 && orderValue >= 3) {
    penalty += 0.1;
  }
  if (gradeValue >= 3 && progression.currentGrade <= 1) {
    penalty += 0.12;
  }
  if (!gradeJump && orderJump >= 2) {
    penalty += 0.1;
  }

  return clamp(penalty, 0, 0.64);
}

function describeProgressionFit(course, progression) {
  if (!progression.hasCompleted) {
    return "아직 이수 과목이 적어서 초반 단계 과목을 우선 추천했습니다.";
  }
  if (progression.directUnlockIds.has(course.id)) {
    return "이미 이수한 과목에서 바로 이어지는 다음 단계 과목입니다.";
  }
  if (progression.frontierIds.has(course.id)) {
    return "현재 학년 흐름에서 무리 없이 붙여 듣기 좋은 과목입니다.";
  }
  if (sequencePenalty(course, progression) >= 0.35) {
    return "현재 기준으로는 단계가 조금 앞서 있어 먼저 기초 흐름을 밟는 편이 자연스럽습니다.";
  }
  return "현재 단계보다 약간 앞선 편이지만 다음 후보로 검토할 수 있습니다.";
}

function compareCourseStage(a, b) {
  return (
    Number(a.grade_value || 0) - Number(b.grade_value || 0) ||
    Number(a.order_value || 0) - Number(b.order_value || 0) ||
    String(a.course_name || "").localeCompare(String(b.course_name || ""), "ko")
  );
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

function keywordScore(text, tokens) {
  const normalized = normalizeSpace(text).toLowerCase();
  if (!normalized) {
    return { score: 0, hits: [] };
  }

  let score = 0;
  const hits = [];
  for (const token of tokens || []) {
    const normalizedToken = normalizeSpace(token).toLowerCase();
    if (normalizedToken.length < 2) {
      continue;
    }
    const count = countOccurrences(normalized, normalizedToken);
    if (count > 0) {
      score += count;
      if (!hits.includes(token)) {
        hits.push(token);
      }
    }
  }

  return { score, hits: hits.slice(0, 3) };
}

function countOccurrences(text, token) {
  let count = 0;
  let index = text.indexOf(token);
  while (index !== -1) {
    count += 1;
    index = text.indexOf(token, index + token.length);
  }
  return count;
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
  const matches = normalized.match(/[0-9A-Za-z\uac00-\ud7a3]+/g) || [];
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

function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) {
    return 0;
  }
  let total = 0;
  for (let index = 0; index < a.length; index += 1) {
    total += a[index] * b[index];
  }
  return total;
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

function dedupeTextList(values) {
  const results = [];
  const seen = new Set();
  for (const value of values || []) {
    const normalized = normalizeSpace(value);
    const lowered = normalized.toLowerCase();
    if (normalized.length < 2 || seen.has(lowered)) {
      continue;
    }
    seen.add(lowered);
    results.push(normalized);
  }
  return results;
}

function normalizeSpace(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function canonicalKey(text) {
  return normalizeSpace(text).replace(/[^0-9a-zA-Z\uac00-\ud7a3]+/g, "").toLowerCase();
}

function round4(value) {
  return Math.round(Number(value || 0) * 10000) / 10000;
}

function slotTitle(key) {
  const map = {
    interest_match: "관심사",
    curriculum_fit: "순서",
    prerequisite_status: "선수",
    offered_semester: "개설학기",
    follow_on_link: "후속과목",
    track_contribution: "트랙",
  };
  return map[key] || key;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number(value || 0)));
}

function buildPdfHref(path, page) {
  const encodedPath = encodeURI(String(path || ""));
  if (!page) {
    return encodedPath;
  }
  return `${encodedPath}#page=${page}`;
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
