// ===== EAT-10 吞嚥困難篩檢問卷（中文版）=====
// Eating Assessment Tool-10（Belafsky et al., 2008）
// 10 題，每題 0–4 分（0 = 沒有問題，4 = 嚴重問題）
// 總分 0–40，≥ 3 分視為吞嚥功能可能異常，建議就醫評估。

const EAT10_QUESTIONS = [
  "我的吞嚥問題已造成我體重減輕。",
  "我的吞嚥問題影響我外出用餐。",
  "吞嚥液體（如喝水、飲料）時很費力。",
  "吞嚥固體食物時很費力。",
  "吞嚥藥丸（藥錠）時很費力。",
  "吞嚥時會感到疼痛。",
  "吞嚥問題影響我進食的樂趣。",
  "吞嚥時食物會卡在喉嚨。",
  "進食時我會咳嗽。",
  "吞嚥讓我感到緊張、有壓力。",
];

const SCALE = [0, 1, 2, 3, 4]; // 0 = 沒有問題，4 = 嚴重問題
const POSITIVE_CUTOFF = 3;     // 總分 ≥ 3 為篩檢異常

// ---------- 動態產生 10 道題目（0–4 量尺）----------
function renderQuestions() {
  const container = document.getElementById("questions");
  container.innerHTML = EAT10_QUESTIONS.map((text, i) => {
    const name = `q${i + 1}`;
    const options = SCALE.map((n) => {
      let aria = `${n} 分`;
      if (n === 0) aria = "0 分，沒有問題";
      if (n === 4) aria = "4 分，嚴重問題";
      return `
        <label class="scale-option">
          <input type="radio" name="${name}" value="${n}" aria-label="${aria}">
          <span class="scale-box">${n}</span>
        </label>`;
    }).join("");
    return `
      <section class="card" data-question="${name}">
        <div class="card-head">
          <span class="q-index">${i + 1}</span>
          <h2 class="q-title">${text}</h2>
        </div>
        <div class="scale" role="radiogroup" aria-label="第 ${i + 1} 題：${text}">
          ${options}
        </div>
        <div class="scale-anchors">
          <span>0 沒有問題</span>
          <span>4 嚴重問題</span>
        </div>
      </section>`;
  }).join("");
}

// ---------- 計算總分 ----------
function getScore() {
  let total = 0;
  const missing = [];
  EAT10_QUESTIONS.forEach((_, i) => {
    const name = `q${i + 1}`;
    const checked = document.querySelector(`input[name="${name}"]:checked`);
    if (checked) total += Number(checked.value);
    else missing.push(name);
  });
  return { total, missing };
}

// ---------- 標記未完成題目 ----------
function markMissing(missingIds) {
  document.querySelectorAll(".card").forEach((c) => c.classList.remove("missing"));
  missingIds.forEach((id) => {
    document.querySelector(`[data-question="${id}"]`)?.classList.add("missing");
  });
}

// ---------- 顯示結果 ----------
function showResult(total) {
  document.getElementById("total-score").textContent = total;

  const positive = total >= POSITIVE_CUTOFF;
  saveAssessment(ASSESS_KEYS.eat10, { total, positive });
  const circle = document.getElementById("score-circle");
  const badge = document.getElementById("verdict-badge");
  const verdict = document.getElementById("verdict-text");

  circle.classList.toggle("positive", positive);
  circle.classList.toggle("negative", !positive);
  badge.classList.toggle("positive", positive);
  badge.classList.toggle("negative", !positive);

  if (positive) {
    badge.textContent = "篩檢異常";
    verdict.innerHTML = `總分達到或超過 ${POSITIVE_CUTOFF} 分，顯示您的<strong>吞嚥功能可能異常</strong>。` +
      "建議諮詢醫師或語言治療師，進行吞嚥功能的進一步評估。";
  } else {
    badge.textContent = "篩檢正常";
    verdict.innerHTML = `總分低於 ${POSITIVE_CUTOFF} 分，目前吞嚥功能屬正常範圍。` +
      "若日後出現吞嚥困難、嗆咳等不適，建議再次評估或就醫。";
  }

  const result = document.getElementById("result");
  result.hidden = false;
  result.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ---------- 提交 ----------
function handleSubmit(e) {
  e.preventDefault();
  const { total, missing } = getScore();
  markMissing(missing);

  if (missing.length > 0) {
    document.getElementById("result").hidden = true;
    document.querySelector(".card.missing")?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  showResult(total);
}

// ---------- 重設 ----------
function handleReset() {
  document.getElementById("eat-form").reset();
  document.getElementById("result").hidden = true;
  document.querySelectorAll(".card").forEach((c) => c.classList.remove("missing"));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ---------- 初始化 ----------
document.addEventListener("DOMContentLoaded", () => {
  renderQuestions();

  document.getElementById("eat-form").addEventListener("submit", handleSubmit);
  document.getElementById("reset-btn").addEventListener("click", handleReset);
  document.getElementById("redo-btn").addEventListener("click", handleReset);
  document.getElementById("print-btn").addEventListener("click", () => window.print());

  // 作答後即時移除「未完成」標記
  document.getElementById("eat-form").addEventListener("change", (e) => {
    if (e.target.matches('input[type="radio"]')) {
      e.target.closest(".card")?.classList.remove("missing");
    }
  });
});
