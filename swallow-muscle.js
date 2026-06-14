// ===== 吞嚥肌肉（舌骨上肌群）超音波評估 =====
// 每條肌肉皆可填「厚度（mm）」與／或「橫斷面積 CSA（mm²）」，皆選填、至少一項。
// 有已驗證切點者給判讀，無切點者列為「參考值」。不建構未經驗證的綜合分數。
//
// 切點來源（此領域無國際共識，下列為個別研究值）：
// - 頦舌骨肌 CSA：女 < 172.5 / 男 < 194.7 mm²（性別特異；吞嚥專屬，證據最強；Mori 2024, Eur Geriatr Med）
// - 頦舌骨肌 厚度：< 6.5 mm（一般肌少症篩檢，非吞嚥專屬、非性別特異；Barotsis 2020, AUC 0.79）
// - 二腹肌前腹 CSA：< 75.1 mm²（AUC 0.731；Ogawa 2020, Geriatr Gerontol Int）
// - 二腹肌前腹 厚度：無成人已驗證切點（已知男 > 女）
// - 下頜舌骨肌 厚度／CSA：無成人已驗證切點（超音波再現性最低）

const MUSCLES = [
  {
    id: "geniohyoid", zh: "頦舌骨肌", en: "Geniohyoid",
    measures: [
      {
        key: "thickness", label: "厚度", unit: "mm", placeholder: "例如：6.5",
        sexSpecific: false,
        cutoff: () => 6.5,
        note: "切點 < 6.5 mm（一般肌少症篩檢，非吞嚥專屬、非性別特異；Barotsis 2020）。",
      },
      {
        key: "csa", label: "橫斷面積（CSA）", unit: "mm²", placeholder: "例如：180",
        sexSpecific: true,
        cutoff: (sex) => (sex === "male" ? 194.7 : sex === "female" ? 172.5 : null),
        note: "切點：男 < 194.7、女 < 172.5 mm²（性別特異；吞嚥專屬，證據最強；Mori 2024）。",
      },
    ],
  },
  {
    id: "digastric", zh: "二腹肌前腹", en: "Anterior belly of digastric",
    measures: [
      {
        key: "thickness", label: "厚度", unit: "mm", placeholder: "例如：6.0",
        sexSpecific: false,
        cutoff: () => null,
        note: "厚度：成人無已驗證切點（已知男 > 女），僅供記錄與追蹤。",
      },
      {
        key: "csa", label: "橫斷面積（CSA）", unit: "mm²", placeholder: "例如：80",
        sexSpecific: false,
        cutoff: () => 75.1,
        note: "切點：CSA < 75.1 mm² 為偏低（AUC 0.731；Ogawa 2020）。",
      },
    ],
  },
  {
    id: "mylohyoid", zh: "下頜舌骨肌", en: "Mylohyoid",
    measures: [
      {
        key: "thickness", label: "厚度", unit: "mm", placeholder: "例如：2.5",
        sexSpecific: false,
        cutoff: () => null,
        note: "厚度：無已驗證切點（再現性最低，約 8.7%）；兒童參考約 1.6–2.3 mm。僅供記錄。",
      },
      {
        key: "csa", label: "橫斷面積（CSA）", unit: "mm²", placeholder: "（選填）",
        sexSpecific: false,
        cutoff: () => null,
        note: "CSA：無已驗證切點，僅供記錄。",
      },
    ],
  },
];

// ---------- 工具 ----------
const currentSex = () => {
  const el = document.querySelector('input[name="sex"]:checked');
  return el ? el.value : null;
};
const clearMissing = () =>
  document.querySelectorAll(".card").forEach((c) => c.classList.remove("missing"));
const fieldId = (muscleId, key) => `${muscleId}-${key}`;

// ---------- 動態產生肌肉輸入卡（性別卡為 1，肌肉由 2 起算）----------
function renderMuscles() {
  const container = document.getElementById("muscles");
  container.innerHTML = MUSCLES.map((m, i) => `
    <section class="card" data-muscle="${m.id}">
      <div class="card-head">
        <span class="q-index">${i + 2}</span>
        <h2 class="q-title">${m.zh} <span class="q-en">${m.en}</span></h2>
      </div>
      <p class="q-hint">可填厚度與／或橫斷面積（CSA），皆選填；本肌肉至少填一項。</p>
      ${m.measures.map((meas) => `
        <div class="field">
          <label class="field-label" for="${fieldId(m.id, meas.key)}">${meas.label}（${meas.unit}）</label>
          <div class="calf-input-row">
            <input type="number" id="${fieldId(m.id, meas.key)}" name="${fieldId(m.id, meas.key)}"
                   inputmode="decimal" min="0" step="0.1" placeholder="${meas.placeholder}">
            <span class="unit">${meas.unit}</span>
          </div>
          <p class="src-note">${meas.note}</p>
        </div>
      `).join("")}
    </section>
  `).join("");
}

// ---------- 單一測量判定 ----------
function evaluateMeasure(muscleId, meas, sex) {
  const v = parseFloat(document.getElementById(fieldId(muscleId, meas.key)).value);
  if (isNaN(v) || v <= 0) return { entered: false };
  const cutoff = meas.cutoff(sex);
  if (cutoff === null) return { entered: true, value: v, cutoff: null, status: "reference" };
  return { entered: true, value: v, cutoff, status: v < cutoff ? "low" : "normal" };
}

// ---------- 顯示結果 ----------
function showResult(sex) {
  let lowCount = 0, evalCount = 0;

  const blocks = MUSCLES.map((m) => {
    const lines = m.measures.map((meas) => {
      const r = evaluateMeasure(m.id, meas, sex);
      if (!r.entered) return "";
      let badge, note = "";
      if (r.status === "reference") {
        badge = `<span class="badge neutral">參考值</span>`;
        note = "無已驗證切點";
      } else if (r.status === "low") {
        lowCount++; evalCount++;
        badge = `<span class="badge positive">偏低</span>`;
        note = `切點 ${r.cutoff} ${meas.unit}`;
      } else {
        evalCount++;
        badge = `<span class="badge negative">正常</span>`;
        note = `切點 ${r.cutoff} ${meas.unit}`;
      }
      return `
        <div class="measure-line ${r.status}">
          <span>${meas.label} <strong>${r.value} ${meas.unit}</strong> ・ ${note}</span>
          ${badge}
        </div>`;
    }).filter(Boolean);

    if (lines.length === 0) {
      return `
        <div class="muscle-row skipped">
          <div class="muscle-row-head">
            <span class="muscle-name">${m.zh} <span class="q-en">${m.en}</span></span>
            <span class="badge skip">未填</span>
          </div>
        </div>`;
    }
    return `
      <div class="muscle-row">
        <div class="muscle-row-head">
          <span class="muscle-name">${m.zh} <span class="q-en">${m.en}</span></span>
        </div>
        ${lines.join("")}
      </div>`;
  });

  document.getElementById("muscle-results").innerHTML = blocks.join("");
  saveAssessment(ASSESS_KEYS.swallow, { anyLow: lowCount > 0, lowCount, evalCount });

  const overall = document.getElementById("overall-text");
  if (evalCount === 0) {
    overall.className = "overall neutral";
    overall.innerHTML = "您填寫的項目目前皆無已驗證切點，結果僅供記錄與追蹤參考。";
  } else if (lowCount > 0) {
    overall.className = "overall positive";
    overall.innerHTML = `在可判定的 ${evalCount} 項測量中，有 <strong>${lowCount}</strong> 項低於參考切點，` +
      "提示<strong>吞嚥肌肉量可能不足</strong>。此為低肌肉量的參考指標，非吞嚥障礙的診斷；" +
      "建議結合臨床吞嚥評估（如 EAT-10、吞嚥攝影）與整體肌少症評估綜合判斷，並諮詢醫師或語言治療師。";
  } else {
    overall.className = "overall negative";
    overall.innerHTML = `可判定的 ${evalCount} 項測量皆達參考切點，吞嚥肌肉量於參考範圍內。建議維持規律運動與充足營養並定期追蹤。`;
  }

  const result = document.getElementById("result");
  result.hidden = false;
  result.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ---------- 提交 ----------
function handleSubmit(e) {
  e.preventDefault();
  const sex = currentSex();
  let anyEntered = false, needSex = false;

  MUSCLES.forEach((m) => {
    m.measures.forEach((meas) => {
      const v = parseFloat(document.getElementById(fieldId(m.id, meas.key)).value);
      if (!isNaN(v) && v > 0) {
        anyEntered = true;
        if (meas.sexSpecific && !sex) needSex = true; // 性別特異切點需先選性別
      }
    });
  });

  clearMissing();
  let invalid = false;
  if (!anyEntered) {
    document.querySelectorAll("#muscles .card").forEach((c) => c.classList.add("missing"));
    invalid = true;
  }
  if (needSex) {
    document.getElementById("sex-card").classList.add("missing");
    invalid = true;
  }
  if (invalid) {
    document.getElementById("result").hidden = true;
    document.querySelector(".card.missing")?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  showResult(sex);
}

// ---------- 重設 ----------
function handleReset() {
  document.getElementById("muscle-form").reset();
  document.getElementById("result").hidden = true;
  clearMissing();
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
    el.addEventListener("change", () =>
      document.getElementById("sex-card").classList.remove("missing")
    )
  );

  // 作答後即時移除「未完成」標記
  document.getElementById("muscle-form").addEventListener("input", (e) => {
    if (e.target.matches('input[type="number"]')) {
      e.target.closest(".card")?.classList.remove("missing");
    }
  });
});
