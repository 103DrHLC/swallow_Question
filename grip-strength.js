// ===== 握力測量評估 =====
// 握力（Handgrip strength）為肌少症的重要指標之一。
// AWGS 2019 切點：男性 < 28 公斤、女性 < 18 公斤 → 握力偏低。
// 取左右手較高值（最大握力）進行判定。

const GRIP_CUTOFF = { male: 28, female: 18 }; // 公斤

// ---------- 切點提示 ----------
function updateCutoffNote() {
  const sex = document.querySelector('input[name="sex"]:checked');
  const note = document.getElementById("cutoff-note");
  if (!sex) {
    note.textContent = "請先選擇性別，以套用對應的判定標準。";
    note.classList.remove("active");
    return;
  }
  const cutoff = GRIP_CUTOFF[sex.value];
  const sexText = sex.value === "male" ? "男性" : "女性";
  note.textContent = `判定標準：${sexText}最大握力 < ${cutoff} 公斤 → 握力偏低；≥ ${cutoff} 公斤 → 正常。`;
  note.classList.add("active");
}

// ---------- 讀取握力數值（無效或 ≤0 視為未填）----------
function parseGrip(id) {
  const v = parseFloat(document.getElementById(id).value);
  return (!isNaN(v) && v > 0) ? v : null;
}

// ---------- 顯示結果 ----------
function showResult(maxGrip, left, right, cutoff) {
  document.getElementById("grip-value").textContent = maxGrip;
  document.getElementById("left-score").textContent = left !== null ? `${left} 公斤` : "—";
  document.getElementById("right-score").textContent = right !== null ? `${right} 公斤` : "—";
  document.getElementById("cutoff-score").textContent = `${cutoff} 公斤`;

  const low = maxGrip < cutoff;
  saveAssessment(ASSESS_KEYS.grip, { maxGrip, low, cutoff });
  const circle = document.getElementById("score-circle");
  const badge = document.getElementById("verdict-badge");
  const verdict = document.getElementById("verdict-text");

  circle.classList.toggle("positive", low);
  circle.classList.toggle("negative", !low);
  badge.classList.toggle("positive", low);
  badge.classList.toggle("negative", !low);

  if (low) {
    badge.textContent = "握力偏低";
    verdict.innerHTML = `您的最大握力低於 ${cutoff} 公斤的參考切點，顯示<strong>握力偏低（肌肉力量不足）</strong>。` +
      "握力偏低是肌少症的重要指標之一，建議諮詢醫師或治療師進一步評估，並加強阻力訓練與蛋白質攝取。";
  } else {
    badge.textContent = "握力正常";
    verdict.innerHTML = `您的最大握力達到 ${cutoff} 公斤的參考標準，握力屬正常範圍。` +
      "建議維持規律的阻力（肌力）運動，以保持肌肉力量。";
  }

  const result = document.getElementById("result");
  result.hidden = false;
  result.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ---------- 提交 ----------
function handleSubmit(e) {
  e.preventDefault();
  const sex = document.querySelector('input[name="sex"]:checked');
  const left = parseGrip("left-input");
  const right = parseGrip("right-input");
  const card = document.getElementById("grip-card");

  card.classList.remove("missing");
  // 需選擇性別，且左右手至少填一項
  if (!sex || (left === null && right === null)) {
    document.getElementById("result").hidden = true;
    card.classList.add("missing");
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  const cutoff = GRIP_CUTOFF[sex.value];
  const maxGrip = Math.max(left ?? 0, right ?? 0);
  showResult(maxGrip, left, right, cutoff);
}

// ---------- 重設 ----------
function handleReset() {
  document.getElementById("grip-form").reset();
  document.getElementById("result").hidden = true;
  document.getElementById("grip-card").classList.remove("missing");
  updateCutoffNote();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ---------- 初始化 ----------
document.addEventListener("DOMContentLoaded", () => {
  updateCutoffNote();

  document.getElementById("grip-form").addEventListener("submit", handleSubmit);
  document.getElementById("reset-btn").addEventListener("click", handleReset);
  document.getElementById("redo-btn").addEventListener("click", handleReset);
  document.getElementById("print-btn").addEventListener("click", () => window.print());

  document.querySelectorAll('input[name="sex"]').forEach((el) =>
    el.addEventListener("change", updateCutoffNote)
  );
  ["left-input", "right-input"].forEach((id) =>
    document.getElementById(id).addEventListener("input", () =>
      document.getElementById("grip-card").classList.remove("missing")
    )
  );
});
