# SARC-CalF 肌少症風險篩檢問卷

一個純前端（HTML / CSS / JavaScript）的線上問卷網頁，可點選作答並自動計算 **SARC-CalF** 分數，用於初步篩檢肌少症（Sarcopenia）風險。

## 功能

- 📋 SARC-F 五項自評問題（力量、行走、起身、爬樓梯、跌倒），點選即可作答
- 📏 小腿圍（CalF）測量，依性別自動套用切點判定
- 🧮 自動計算總分（0–20 分）並即時顯示篩檢結果
- ✅ 未作答欄位會被標示提醒
- 🖨️ 可列印 / 儲存為 PDF
- 📱 響應式設計，手機 / 平板 / 電腦皆適用

## 評分方式

| 項目 | 分數 |
| --- | --- |
| SARC-F 每題 | 0、1、2 分（小計 0–10） |
| 小腿圍：男性 < 34 公分 或 女性 < 33 公分 | 10 分（否則 0 分） |
| **總分** | **0–20 分** |

**判讀：** 總分 **≥ 11 分** 為篩檢陽性，顯示疑似肌少症風險，建議尋求醫療專業人員進一步評估。

## 使用方式

直接以瀏覽器開啟 `index.html` 即可，無需安裝或架設伺服器。

亦可部署至任何靜態網站服務（如 GitHub Pages）：將本專案推上 GitHub 後，於 repository 的 **Settings → Pages** 選擇分支即可線上使用。

## 檔案結構

```
index.html   # 頁面結構
styles.css   # 樣式
script.js    # 題目資料、計分與互動邏輯
```

## 免責聲明

本問卷僅為風險**篩檢**工具，**不能取代專業醫療診斷**。如有任何健康疑慮，請諮詢醫師、物理治療師或相關醫療專業人員。

## 參考來源

- Malmstrom TK, Morley JE. *SARC-F: a simple questionnaire to rapidly diagnose sarcopenia.* J Am Med Dir Assoc. 2013.
- Barbosa-Silva TG, et al. *Enhancing SARC-F: Improving Sarcopenia Screening in the Clinical Practice.* J Am Med Dir Assoc. 2016.
- Chen LK, et al. *Asian Working Group for Sarcopenia: 2019 Consensus Update (AWGS 2019).* J Am Med Dir Assoc. 2020.
