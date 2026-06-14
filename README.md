# 健康篩檢問卷

一組純前端（HTML / CSS / JavaScript）的線上篩檢問卷,含一個入口網頁,可點選作答並自動計算分數與判讀結果。目前包含:

1. **SARC-CalF 肌少症風險篩檢**
2. **EAT-10 吞嚥困難篩檢(中文版)**

## 功能

- 🏠 入口網頁,集中選擇要填寫的問卷(易於日後擴充)
- 📋 點選即可作答,自動計算總分與判讀結果
- ✅ 未作答欄位會被標示提醒
- 🖨️ 結果可列印 / 儲存為 PDF
- 📱 響應式設計,手機 / 平板 / 電腦皆適用
- 🔒 純前端,所有計算皆於瀏覽器本機完成,不會上傳資料

## 問卷與評分

### SARC-CalF（肌少症）

| 項目 | 分數 |
| --- | --- |
| SARC-F 五題(力量、行走、起身、爬樓梯、跌倒)每題 | 0、1、2 分(小計 0–10) |
| 小腿圍:男性 < 34 公分 或 女性 < 33 公分 | 10 分(否則 0 分) |
| **總分** | **0–20 分** |

**判讀:** 總分 **≥ 11 分** 為篩檢陽性(疑似肌少症風險),建議進一步評估。

### EAT-10（吞嚥困難）

- 10 題,每題 0–4 分(0 = 沒有問題,4 = 嚴重問題),**總分 0–40**。
- **判讀:** 總分 **≥ 3 分** 視為吞嚥功能可能異常,建議諮詢醫師、耳鼻喉科或語言治療師。

## 使用方式

直接以瀏覽器開啟 `index.html` 即可,無需安裝或架設伺服器。

亦可部署至任何靜態網站服務(如 GitHub Pages):將本專案推上 GitHub 後,於 repository 的 **Settings → Pages** 選擇分支即可線上使用。

## 檔案結構

```
index.html      # 入口網頁(問卷選單)
sarc-calf.html  # SARC-CalF 問卷頁面
sarc-calf.js    # SARC-CalF 題目與計分邏輯
eat-10.html     # EAT-10 問卷頁面
eat-10.js       # EAT-10 題目與計分邏輯
styles.css      # 共用樣式
```

新增問卷時,只需新增一組 `xxx.html` / `xxx.js`,並在 `index.html` 的選單加入一張卡片即可。

## 免責聲明

本網站問卷皆為風險**篩檢**工具,**不能取代專業醫療診斷**。如有任何健康疑慮,請諮詢醫師或相關醫療專業人員。

## 參考來源

- Malmstrom TK, Morley JE. *SARC-F: a simple questionnaire to rapidly diagnose sarcopenia.* J Am Med Dir Assoc. 2013.
- Barbosa-Silva TG, et al. *Enhancing SARC-F: Improving Sarcopenia Screening in the Clinical Practice.* J Am Med Dir Assoc. 2016.
- Chen LK, et al. *Asian Working Group for Sarcopenia: 2019 Consensus Update (AWGS 2019).* J Am Med Dir Assoc. 2020.
- Belafsky PC, et al. *Validity and Reliability of the Eating Assessment Tool (EAT-10).* Ann Otol Rhinol Laryngol. 2008.
