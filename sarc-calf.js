// ===== SARC-CalF 肌少症風險篩檢問卷 =====
// SARC-F：5 題，每題 0–2 分（小計 0–10）
// CalF（小腿圍）：男性 < 34 公分 或 女性 < 33 公分 → 10 分，否則 0 分
// 總分 0–20，≥ 11 分為篩檢陽性（疑似肌少症風險）

const SARC_F_QUESTIONS = [
  {
    id: "strength",
    title: "力量（Strength）",
    hint: "搬運約 4.5 公斤（10 磅）的重物時，您感到困難嗎？",
    options: [
      { label: "沒有困難", value: 0 },
      { label: "有些困難", value: 1 },
      { label: "非常困難或無法完成", value: 2 },
    ],
  },
  {
    id: "walk",
    title: "行走（Assistance in walking）",
    hint: "走過一個房間時，您感到困難嗎？",
    options: [
      { label: "沒有困難", value: 0 },
      { label: "有些困難", value: 1 },
      { label: "非常困難、需使用輔具、或無法完成", value: 2 },
    ],
  },
  {
    id: "rise",
    title: "起身（Rise from a chair）",
    hint: "從椅子或床上起身時，您感到困難嗎？",
    options: [
      { label: "沒有困難", value: 0 },
      { label: "有些困難", value: 1 },
      { label: "非常困難或無人協助時無法完成", value: 2 },
    ],
  },
  {
    id: "stairs",
    title: "爬樓梯（Climb stairs）",
    hint: "爬一層樓（約 10 階）的樓梯時，您感到困難嗎？",
    options: [
      { label: "沒有困難", value: 0 },
      { label: "有些困難", value: 1 },
      { label: "非常困難或無法完成", value: 2 },
    ],
  },
  {
    id: "falls",
    title: "跌倒（Falls）",
    hint: "過去一年內，您跌倒過幾次？",
    options: [
      { label: "沒有跌倒", value: 0 },
      { label: "跌倒 1–3 次", value: 1 },
      { label: "跌倒 4 次以上", value: 2 },
    ],
  },
];

const CALF_CUTOFF = { male: 34, female: 33 }; // 公分
const POSITIVE_CUTOFF = 11; // 總分 ≥ 11 為篩檢陽性

// ---------- 動態產生 SARC-F 題目 ----------
function renderQuestions() {
  const container = document.getElementById("questions");
  container.innerHTML = SARC_F_QUESTIONS.map((q, i) => `
    <section class="card" data-question="${q.id}">
      <div class="card-head">
        <span class="q-index">${i + 1}</span>
        <h2 class="q-title">${q.title}</h2>
      </div>
      <p class="q-hint">${q.hint}</p>
      <div class="options" role="radiogroup" aria-label="${q.title}">
        ${q.options.map((opt, j) => `
          <label class="option">
            <input type="radio" name="${q.id}" value="${opt.value}" id="${q.id}-${j}">
            <span class="option-box">${opt.label}</span>
          </label>
        `).join("")}
      </div>
    </section>
  `).join("");
}

// ---------- 小腿圍判定提示 ----------
function updateCutoffNote() {
  const sex = document.querySelector('input[name="sex"]:checked');
  const note = document.getElementById("cutoff-note");
  if (!sex) {
    note.textContent = "請先選擇性別，以套用對應的判定標準。";
    note.classList.remove("active");
    return;
  }
  const cutoff = CALF_CUTOFF[sex.value];
  const sexText = sex.value === "male" ? "男性" : "女性";
  note.textContent = `判定標準：${sexText}小腿圍 < ${cutoff} 公分 → 計 10 分；≥ ${cutoff} 公分 → 計 0 分。`;
  note.classList.add("active");
}

// ---------- 計算 SARC-F 小計 ----------
function getSarcfScore() {
  let total = 0;
  const missing = [];
  for (const q of SARC_F_QUESTIONS) {
    const checked = document.querySelector(`input[name="${q.id}"]:checked`);
    if (checked) {
      total += Number(checked.value);
    } else {
      missing.push(q.id);
    }
  }
  return { total, missing };
}

// ---------- 計算小腿圍分數 ----------
function getCalfScore() {
  const sex = document.querySelector('input[name="sex"]:checked');
  const calfInput = document.getElementById("calf-input");
  const calf = parseFloat(calfInput.value);

  if (!sex) return { score: null, error: "sex" };
  if (isNaN(calf) || calf <= 0) return { score: null, error: "calf" };

  const cutoff = CALF_CUTOFF[sex.value];
  return { score: calf < cutoff ? 10 : 0, calf, cutoff };
}

// ---------- 標記未完成欄位 ----------
function markMissing(missingIds, calfMissing) {
  document.querySelectorAll(".card").forEach((c) => c.classList.remove("missing"));
  missingIds.forEach((id) => {
    document.querySelector(`[data-question="${id}"]`)?.classList.add("missing");
  });
  if (calfMissing) document.getElementById("calf-card").classList.add("missing");
}

// ---------- 顯示結果 ----------
function showResult(total, sarcf, calf) {
  document.getElementById("total-score").textContent = total;
  document.getElementById("sarcf-score").textContent = sarcf;
  document.getElementById("calf-score").textContent = calf;

  const positive = total >= POSITIVE_CUTOFF;
  saveAssessment(ASSESS_KEYS.sarccalf, { total, positive });
  const circle = document.getElementById("score-circle");
  const badge = document.getElementById("verdict-badge");
  const verdict = document.getElementById("verdict-text");

  circle.classList.toggle("positive", positive);
  circle.classList.toggle("negative", !positive);
  badge.classList.toggle("positive", positive);
  badge.classList.toggle("negative", !positive);

  if (positive) {
    badge.textContent = "篩檢陽性";
    verdict.innerHTML = `總分達到或超過 ${POSITIVE_CUTOFF} 分，顯示<strong>疑似肌少症風險</strong>。` +
      "建議儘早諮詢醫師或相關醫療專業人員，進行肌肉質量、肌力與體能的進一步評估。";
  } else {
    badge.textContent = "篩檢陰性";
    verdict.innerHTML = `總分低於 ${POSITIVE_CUTOFF} 分，目前肌少症風險較低。` +
      "建議維持規律運動（尤其是阻力訓練）與充足蛋白質攝取，並定期追蹤。";
  }

  const result = document.getElementById("result");
  result.hidden = false;
  result.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ---------- 提交 ----------
function handleSubmit(e) {
  e.preventDefault();
  const { total: sarcf, missing } = getSarcfScore();
  const calfResult = getCalfScore();

  markMissing(missing, calfResult.score === null);

  if (missing.length > 0 || calfResult.score === null) {
    document.getElementById("result").hidden = true;
    const firstMissing = document.querySelector(".card.missing");
    firstMissing?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (calfResult.error === "calf" && missing.length === 0) {
      document.getElementById("calf-input").focus();
    }
    return;
  }

  showResult(sarcf + calfResult.score, sarcf, calfResult.score);
}

// ---------- 重設 ----------
function handleReset() {
  document.getElementById("sarc-form").reset();
  document.getElementById("result").hidden = true;
  document.querySelectorAll(".card").forEach((c) => c.classList.remove("missing"));
  updateCutoffNote();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ---------- 初始化 ----------
document.addEventListener("DOMContentLoaded", () => {
  renderQuestions();
  updateCutoffNote();

  document.getElementById("sarc-form").addEventListener("submit", handleSubmit);
  document.getElementById("reset-btn").addEventListener("click", handleReset);
  document.getElementById("redo-btn").addEventListener("click", handleReset);
  document.getElementById("print-btn").addEventListener("click", () => window.print());

  document.querySelectorAll('input[name="sex"]').forEach((el) =>
    el.addEventListener("change", updateCutoffNote)
  );

  // 作答後即時移除「未完成」標記
  document.getElementById("sarc-form").addEventListener("change", (e) => {
    if (e.target.matches('input[type="radio"]')) {
      e.target.closest(".card")?.classList.remove("missing");
    }
  });
  document.getElementById("calf-input").addEventListener("input", () => {
    document.getElementById("calf-card").classList.remove("missing");
  });
});
