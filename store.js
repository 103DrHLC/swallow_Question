// ===== 共用：評估結果暫存 =====
// 各評估頁算完分數後，將結果存入瀏覽器 localStorage；
// 綜合評估頁（assessment.html）再讀取並整合判讀。
// 註：localStorage 於 GitHub Pages／本機伺服器最穩定；
//     直接以 file:// 開啟時，部分瀏覽器可能不會跨頁保存。

const ASSESS_KEYS = {
  sarccalf: "assess.sarccalf",
  grip: "assess.grip",
  eat10: "assess.eat10",
  swallow: "assess.swallow",
};

function saveAssessment(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ ...data, ts: Date.now() }));
  } catch (e) {
    /* localStorage 不可用時略過（不影響單頁計分） */
  }
}

function loadAssessment(key) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch (e) {
    return null;
  }
}

function clearAssessments() {
  try {
    Object.values(ASSESS_KEYS).forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    /* 略過 */
  }
}
