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
  "images/oral-swallow-2.jpg",
  "images/oral-swallow-3.jpg",
  "images/oral-swallow-4.jpg",
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
  let html = "";

  if (!sarcDone && !gripDone) {
    html = `<div class="overall neutral">尚未完成 <strong>SARC-CalF</strong> 或 <strong>握力</strong> 評估，無法判定肌少症風險，請至少完成其中一項。</div>`;
  } else if (possible) {
    html = `<div class="overall positive">研判<strong>可能為肌少症（Possible Sarcopenia）</strong>：SARC-CalF 或握力其中一項異常。建議執行下方運動建議，並就醫進一步評估（肌肉量、體能表現）。</div>`;
    if (swallowingConcern) {
      html += `<div class="overall positive">同時偵測到<strong>吞嚥相關異常</strong>（EAT-10 或吞嚥肌肉），建議加上口腔吞嚥運動。</div>`;
    } else if (!eatDone && !swDone) {
      html += `<div class="overall neutral">尚未完成 EAT-10／吞嚥肌肉評估；建議補做以判斷是否需要口腔吞嚥運動。</div>`;
    } else {
      html += `<div class="overall negative">吞嚥相關評估目前未見異常。</div>`;
    }
  } else {
    html = `<div class="overall negative">目前<strong>未達 possible sarcopenia 條件</strong>（SARC-CalF 與握力皆未見異常）。建議維持運動與營養並定期追蹤。</div>`;
    if (!sarcDone || !gripDone) {
      html += `<div class="overall neutral">提醒：尚有項目未完成，補做後判讀更完整。</div>`;
    }
  }
  document.getElementById("verdict").innerHTML = html;
}

// ---------- 運動建議 ----------
function renderRecommendations(state) {
  const { possible, swallowingConcern } = state;
  const cards = [];

  if (possible) {
    cards.push(`
      <div class="rec-card alert">
        <h3>① 復健四式（肌力／體能運動）</h3>
        <p>篩檢結果可能為肌少症，建議規律執行「復健四式」以維持並增進肌力與體能。完整動作請參考國立成功大學防衰弱中心：</p>
        <div class="rec-qr">
          <img src="images/rehab-qr.svg" alt="復健四式網站 QR code" width="150" height="150">
          <div>
            <p>掃描 QR code，或點選下方連結：</p>
            <a class="rec-link" href="${REHAB_URL}" target="_blank" rel="noopener">${REHAB_URL}</a>
          </div>
        </div>
      </div>`);

    if (swallowingConcern) {
      const imgs = ORAL_SWALLOW_IMAGES
        .map((src, i) => `<img src="${src}" alt="口腔吞嚥運動 ${i + 1}" loading="lazy" onerror="this.style.display='none'">`)
        .join("");
      cards.push(`
        <div class="rec-card alert">
          <h3>② 口腔吞嚥運動</h3>
          <p>同時有吞嚥相關異常（EAT-10 或吞嚥肌肉），建議加做口腔與吞嚥肌肉訓練，依下列圖示練習：</p>
          <div class="exercise-imgs">${imgs}</div>
          <p class="src-note">口腔吞嚥運動衛教圖示（如未顯示，請將圖片放入 <code>images/</code> 資料夾）。</p>
        </div>`);
    }
  } else {
    cards.push(`
      <div class="rec-card">
        <h3>一般保健建議</h3>
        <p>目前未達肌少症篩檢條件。建議：每週 2–3 次阻力（肌力）運動、攝取足夠蛋白質、維持日常活動量，並定期（如每年）追蹤評估。</p>
      </div>`);
  }
  document.getElementById("recommendations").innerHTML = cards.join("");
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
  document.getElementById("clear-btn").addEventListener("click", () => {
    if (confirm("確定要清除本裝置上所有評估結果嗎？")) {
      clearAssessments();
      update();
    }
  });
});
