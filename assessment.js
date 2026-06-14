// ===== 肌少症綜合評估 =====
// 讀取各工具於 localStorage 的結果，依臨床流程整合判讀並給運動建議。
//
// 流程（依使用者設定）：
// 1. SARC-CalF 陽性 或 握力偏低（任一）→ possible sarcopenia → 建議「復健四式」
// 2. 若 possible sarcopenia，且（EAT-10 異常 或 吞嚥肌肉異常，任一）→ 加上「口腔吞嚥運動」
// 3. 皆正常 → 一般保健建議

const REHAB_URL = "https://anti-frailty.web2.ncku.edu.tw/p/412-1199-26272.php?Lang=zh-tw";

// 口腔吞嚥運動圖片：請將檔案放入 images/ 並依下列檔名命名（可自行增減）。
const ORAL_SWALLOW_IMAGES = [
  "images/oral-swallow-1.jpg",
  // 若有更多圖片，依序加入：images/oral-swallow-2.jpg、...（未放入的會自動隱藏）
];

// ---------- 狀態列 ----------
function statusRow(name, href, data, summarize, statusClass) {
  let badgeHtml, detail, linkText;
  if (data) {
    const cls = statusClass(data);
    const label = cls === "positive" ? "異常" : cls === "neutral" ? "參考" : "正常";
    badgeHtml = `<span class="badge ${cls}">${label}</span>`;
    detail = summarize(data);
    linkText = "重新填寫";
  } else {
    badgeHtml = `<span class="badge skip">未完成</span>`;
    detail = "尚未填寫";
    linkText = "前往填寫";
  }
  return `
    <div class="status-row">
      <span class="status-name">${name}</span>
      ${badgeHtml}
      <a href="${href}">${linkText} →</a>
      <span class="status-detail">${detail}</span>
    </div>`;
}

function renderStatus(sarc, grip, eat, sw) {
  const rows = [
    statusRow("SARC-CalF 肌少症篩檢", "sarc-calf.html", sarc,
      (d) => `總分 ${d.total} / 20 ・ ${d.positive ? "篩檢陽性" : "篩檢陰性"}`,
      (d) => (d.positive ? "positive" : "negative")),
    statusRow("握力測量", "grip-strength.html", grip,
      (d) => `最大握力 ${d.maxGrip} 公斤 ・ ${d.low ? "偏低" : "正常"}（切點 ${d.cutoff} 公斤）`,
      (d) => (d.low ? "positive" : "negative")),
    statusRow("EAT-10 吞嚥困難篩檢", "eat-10.html", eat,
      (d) => `總分 ${d.total} / 40 ・ ${d.positive ? "異常" : "正常"}`,
      (d) => (d.positive ? "positive" : "negative")),
    statusRow("吞嚥肌肉超音波評估", "swallow-muscle.html", sw,
      (d) => (d.evalCount === 0
        ? "已填項目皆無切點（僅供參考）"
        : `可判定 ${d.evalCount} 項 ・ ${d.anyLow ? d.lowCount + " 項偏低" : "皆達標"}`),
      (d) => (d.anyLow ? "positive" : d.evalCount === 0 ? "neutral" : "negative")),
  ];
  document.getElementById("status-list").innerHTML = rows.join("");
}

// ---------- 綜合判讀 ----------
function renderVerdict(state) {
  const { possible, sarcDone, gripDone, eatDone, swDone, swallowingConcern } = state;
  const anyDone = sarcDone || gripDone || eatDone || swDone;
  if (!anyDone) {
    document.getElementById("verdict").innerHTML =
      `<div class="overall neutral">尚未完成任何評估。請先到各別頁面完成評估，本頁會自動彙整結果。</div>`;
    return;
  }
  const parts = [];

  // 肌少症（SARC-CalF + 握力）
  if (sarcDone || gripDone) {
    if (possible) {
      parts.push(`<div class="overall positive">研判<strong>可能為肌少症（Possible Sarcopenia）</strong>：SARC-CalF 或握力其中一項異常。建議執行下方<strong>復健四式</strong>，並就醫進一步評估。</div>`);
    } else {
      let t = "肌少症篩檢<strong>未見異常</strong>（SARC-CalF 與握力皆正常）。";
      if (!sarcDone || !gripDone) t += "（尚有項目未完成，補做後更完整）";
      parts.push(`<div class="overall negative">${t}</div>`);
    }
  } else {
    parts.push(`<div class="overall neutral">尚未完成 SARC-CalF／握力，無法判定肌少症風險。</div>`);
  }

  // 吞嚥（EAT-10 + 吞嚥肌肉）
  if (eatDone || swDone) {
    if (swallowingConcern) {
      parts.push(`<div class="overall positive">偵測到<strong>吞嚥相關異常</strong>（EAT-10 或吞嚥肌肉）。建議<strong>就醫進一步檢查吞嚥功能</strong>，並進行下方口腔吞嚥運動。</div>`);
    } else {
      parts.push(`<div class="overall negative">吞嚥相關評估<strong>未見異常</strong>。</div>`);
    }
  } else {
    parts.push(`<div class="overall neutral">尚未完成 EAT-10／吞嚥肌肉評估。</div>`);
  }

  document.getElementById("verdict").innerHTML = parts.join("");
}

// ---------- 運動建議 ----------
function renderRecommendations(state) {
  const { possible, swallowingConcern, sarcDone, gripDone, eatDone, swDone } = state;
  const anyDone = sarcDone || gripDone || eatDone || swDone;
  const cards = [];

  // 復健四式：possible sarcopenia
  if (possible) {
    cards.push(`
      <div class="rec-card alert">
        <h3>復健四式（肌力／體能運動）</h3>
        <p>篩檢結果可能為肌少症，建議規律執行「復健四式」以維持並增進肌力與體能。完整動作請參考國立成功大學防衰弱中心：</p>
        <div class="rec-qr">
          <img src="images/rehab-qr.svg" alt="復健四式網站 QR code" width="150" height="150">
          <div>
            <p>掃描 QR code，或點選下方連結：</p>
            <a class="rec-link" href="${REHAB_URL}" target="_blank" rel="noopener">${REHAB_URL}</a>
          </div>
        </div>
      </div>`);
  }

  // 吞嚥相關：EAT-10 或吞嚥肌肉異常（不論是否肌少症）→ 就醫 + 口腔吞嚥運動
  if (swallowingConcern) {
    const imgs = ORAL_SWALLOW_IMAGES
      .map((src, i) => `<img src="${src}" alt="口腔吞嚥運動 ${i + 1}" loading="lazy" onerror="this.style.display='none'">`)
      .join("");
    cards.push(`
      <div class="rec-card alert">
        <h3>吞嚥相關建議</h3>
        <p><strong>建議就醫進一步檢查：</strong>吞嚥篩檢結果異常，建議至醫院耳鼻喉科或復健科／語言治療評估（必要時安排吞嚥攝影 VFSS 等檢查）。</p>
        <p><strong>口腔吞嚥運動：</strong>可同時進行口腔與吞嚥肌肉訓練，依下列圖示練習：</p>
        <div class="exercise-imgs">${imgs}</div>
        <p class="src-note">口腔吞嚥運動衛教圖示。</p>
      </div>`);
  }

  // 皆正常
  if (anyDone && !possible && !swallowingConcern) {
    cards.push(`
      <div class="rec-card">
        <h3>一般保健建議</h3>
        <p>目前篩檢未見異常。建議：每週 2–3 次阻力（肌力）運動、攝取足夠蛋白質、維持日常活動量，並定期（如每年）追蹤評估。</p>
      </div>`);
  }

  document.getElementById("recommendations").innerHTML =
    cards.join("") ||
    `<div class="rec-card"><p>完成評估後，這裡會依結果顯示對應的運動與就醫建議。</p></div>`;
}

// ---------- 更新 ----------
function update() {
  const sarc = loadAssessment(ASSESS_KEYS.sarccalf);
  const grip = loadAssessment(ASSESS_KEYS.grip);
  const eat = loadAssessment(ASSESS_KEYS.eat10);
  const sw = loadAssessment(ASSESS_KEYS.swallow);

  renderStatus(sarc, grip, eat, sw);

  const state = {
    sarcDone: !!sarc, gripDone: !!grip, eatDone: !!eat, swDone: !!sw,
    possible: sarc?.positive === true || grip?.low === true,
    swallowingConcern: eat?.positive === true || sw?.anyLow === true,
  };
  renderVerdict(state);
  renderRecommendations(state);
}

// ---------- 初始化 ----------
document.addEventListener("DOMContentLoaded", () => {
  update();
  document.getElementById("refresh-btn").addEventListener("click", update);
  document.getElementById("print-btn").addEventListener("click", () => window.print());
  document.getElementById("clear-btn").addEventListener("click", () => {
    if (confirm("確定要清除本裝置上所有評估結果嗎？")) {
      clearAssessments();
      update();
    }
  });
});
