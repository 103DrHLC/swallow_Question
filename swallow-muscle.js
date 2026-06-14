// ===== 吞嚥肌肉（舌骨上肌群）超音波評估 =====
// 證據提醒：此領域無國際共識切點（SARCUS 共識未納入此肌群、未設切點）。
// 下列為個別研究值，各肌肉「分別」對照，不建構未經驗證的綜合分數。
//
// 切點來源：
// - 頦舌骨肌 CSA：女 < 172.5 mm²、男 < 194.7 mm²（Mori 2024, Eur Geriatr Med，超音波）
//   ※ 此為「年輕族群均值 − 2SD」之低肌肉量門檻，非附帶敏感度/特異度的診斷切點。
// - 二腹肌前腹 厚度：無成人已驗證切點（厚度較快；原 75.1 mm² 切點為「橫斷面積」，Ogawa 2020）。
// - 下頜舌骨肌 厚度：無成人已驗證切點（超音波再現性最低）。
// 註：依使用者選擇採「混合」——頦舌骨肌用 CSA（保留性別特異切點），其餘改用厚度（僅供記錄）。

const MUSCLES = [
  {
    id: "geniohyoid",
    zh: "頦舌骨肌", en: "Geniohyoid",
    measure: "橫斷面積（CSA）", unit: "mm²",
    placeholder: "例如：180",
    sexSpecific: true,
    cutoff: (sex) => (sex === "male" ? 194.7 : sex === "female" ? 172.5 : null),
    hint: (sex) => {
      if (!sex) return "切點為性別特異（男 < 194.7、女 < 172.5 mm² 為低肌肉量）。請先於上方選擇性別。";
      return sex === "male"
        ? "男性：CSA < 194.7 mm² 為低肌肉量（年長男參考均值 193.2±49.5、年輕男 313.1±59.2 mm²）。"
        : "女性：CSA < 172.5 mm² 為低肌肉量（年長女參考均值 167.2±32.6、年輕女 247.3±37.4 mm²）。";
    },
    evidence: "證據較充分",
    source: "Mori et al., Eur Geriatr Med 2024（超音波）",
  },
  {
    id: "digastric",
    zh: "二腹肌前腹", en: "Anterior belly of digastric",
    measure: "厚度", unit: "mm",
    placeholder: "例如：6.0",
    sexSpecific: false,
    cutoff: () => null,
    hint: () => "厚度測量較快速；但二腹肌前腹目前無成人已驗證的厚度切點（已知男性厚度大於女性），數值僅供記錄與追蹤參考。",
    evidence: "厚度無切點",
    source: "（厚度無成人切點；原 75.1 mm² 為橫斷面積切點，Ogawa 2020）",
  },
  {
    id: "mylohyoid",
    zh: "下頜舌骨肌", en: "Mylohyoid",
    measure: "厚度", unit: "mm",
    placeholder: "例如：2.5",
    sexSpecific: false,
    cutoff: () => null,
    hint: () => "目前無成人已驗證切點；此肌肉超音波再現性最低（變異係數約 8.7%），數值僅供記錄與追蹤參考。",
    evidence: "無切點",
    source: "（無已驗證切點；兒童參考厚度約 1.6–2.3 mm）",
  },
];

// ---------- 工具 ----------
const currentSex = () => {
  const el = document.querySelector('input[name="sex"]:checked');
  return el ? el.value : null;
};
const clearMissing = () =>
  document.querySelectorAll(".card").forEach((c) => c.classList.remove("missing"));

// ---------- 動態產生肌肉輸入卡（性別卡為 1，肌肉由 2 起算）----------
function renderMuscles() {
  const sex = currentSex();
  const container = document.getElementById("muscles");
  container.innerHTML = MUSCLES.map((m, i) => `
    <section class="card" data-muscle="${m.id}">
      <div class="card-head">
        <span class="q-index">${i + 2}</span>
        <h2 class="q-title">${m.zh} <span class="q-en">${m.en}</span></h2>
      </div>
      <p class="q-hint" data-hint="${m.id}">${m.hint(sex)}</p>
      <div class="field">
        <label class="field-label" for="${m.id}-input">${m.measure}（${m.unit}）</label>
        <div class="calf-input-row">
          <input type="number" id="${m.id}-input" name="${m.id}" inputmode="decimal"
                 min="0" step="0.1" placeholder="${m.placeholder}">
          <span class="unit">${m.unit}</span>
        </div>
        <p class="src-note">${m.evidence} ・ 來源：${m.source}</p>
      </div>
    </section>
  `).join("");
}

// ---------- 性別變動時更新提示（不清除已輸入值）----------
function updateHints() {
  const sex = currentSex();
  MUSCLES.forEach((m) => {
    const el = document.querySelector(`.q-hint[data-hint="${m.id}"]`);
    if (el) el.textContent = m.hint(sex);
  });
}

// ---------- 單一肌肉判定 ----------
function evaluateMuscle(m, sex) {
  const v = parseFloat(document.getElementById(`${m.id}-input`).value);
  if (isNaN(v) || v <= 0) return { entered: false };
  const cutoff = m.cutoff(sex);
  if (cutoff === null) return { entered: true, value: v, cutoff: null, status: "reference" };
  return { entered: true, value: v, cutoff, status: v < cutoff ? "low" : "normal" };
}

// ---------- 顯示結果 ----------
function showResult(results) {
  const container = document.getElementById("muscle-results");
  let lowCount = 0, evalCount = 0;

  container.innerHTML = results.map(({ m, r }) => {
    if (!r.entered) {
      return `
        <div class="muscle-row skipped">
          <div class="muscle-row-head">
            <span class="muscle-name">${m.zh} <span class="q-en">${m.en}</span></span>
            <span class="badge skip">未填</span>
          </div>
        </div>`;
    }
    let badge, detail;
    if (r.status === "reference") {
      badge = `<span class="badge neutral">參考值</span>`;
      detail = `測量值 ${r.value} ${m.unit} ・ 目前無已驗證切點`;
    } else if (r.status === "low") {
      lowCount++; evalCount++;
      badge = `<span class="badge positive">偏低</span>`;
      detail = `測量值 ${r.value} ${m.unit} ・ 切點 ${r.cutoff} ${m.unit}（低於切點）`;
    } else {
      evalCount++;
      badge = `<span class="badge negative">正常</span>`;
      detail = `測量值 ${r.value} ${m.unit} ・ 切點 ${r.cutoff} ${m.unit}（達參考標準）`;
    }
    return `
      <div class="muscle-row ${r.status}">
        <div class="muscle-row-head">
          <span class="muscle-name">${m.zh} <span class="q-en">${m.en}</span></span>
          ${badge}
        </div>
        <div class="muscle-row-detail">${detail}</div>
      </div>`;
  }).join("");

  const overall = document.getElementById("overall-text");
  if (evalCount === 0) {
    overall.className = "overall neutral";
    overall.innerHTML = "您僅填寫了目前無切點的項目，結果僅供記錄與追蹤參考。";
  } else if (lowCount > 0) {
    overall.className = "overall positive";
    overall.innerHTML = `在可判定的 ${evalCount} 條肌肉中，有 <strong>${lowCount}</strong> 條低於參考切點，` +
      "提示<strong>吞嚥肌肉量可能不足</strong>。此為低肌肉量的參考指標，非吞嚥障礙的診斷；" +
      "建議結合臨床吞嚥評估（如 EAT-10、吞嚥攝影）與整體肌少症評估綜合判斷，並諮詢醫師或語言治療師。";
  } else {
    overall.className = "overall negative";
    overall.innerHTML = `可判定的 ${evalCount} 條肌肉皆達參考切點，吞嚥肌肉量於參考範圍內。建議維持規律運動與充足營養並定期追蹤。`;
  }

  const result = document.getElementById("result");
  result.hidden = false;
  result.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ---------- 提交 ----------
function handleSubmit(e) {
  e.preventDefault();
  const sex = currentSex();
  const results = MUSCLES.map((m) => ({ m, r: evaluateMuscle(m, sex) }));
  const anyEntered = results.some((x) => x.r.entered);
  const geniohyoidEntered = results.find((x) => x.m.id === "geniohyoid").r.entered;

  clearMissing();
  let invalid = false;
  if (!anyEntered) {
    document.querySelectorAll("#muscles .card").forEach((c) => c.classList.add("missing"));
    invalid = true;
  }
  // 頦舌骨肌切點為性別特異，輸入時必須先選性別
  if (geniohyoidEntered && !sex) {
    document.getElementById("sex-card").classList.add("missing");
    invalid = true;
  }
  if (invalid) {
    document.getElementById("result").hidden = true;
    document.querySelector(".card.missing")?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  showResult(results);
}

// ---------- 重設 ----------
function handleReset() {
  document.getElementById("muscle-form").reset();
  document.getElementById("result").hidden = true;
  clearMissing();
  updateHints();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ---------- 初始化 ----------
document.addEventListener("DOMContentLoaded", () => {
  renderMuscles();

  document.getElementById("muscle-form").addEventListener("submit", handleSubmit);
  document.getElementById("reset-btn").addEventListener("click", handleReset);
  document.getElementById("redo-btn").addEventListener("click", handleReset);
  document.getElementById("print-btn").addEventListener("click", () => window.print());

  document.querySelectorAll('input[name="sex"]').forEach((el) =>
    el.addEventListener("change", () => {
      updateHints();
      document.getElementById("sex-card").classList.remove("missing");
    })
  );

  // 作答後即時移除「未完成」標記
  document.getElementById("muscle-form").addEventListener("input", (e) => {
    if (e.target.matches('input[type="number"]')) {
      e.target.closest(".card")?.classList.remove("missing");
    }
  });
});
