# 肌少症與吞嚥困難地圖

一組純前端（HTML / CSS / JavaScript）的線上篩檢問卷,含一個入口網頁,可點選作答並自動計算分數與判讀結果。目前包含:

1. **SARC-CalF 肌少症風險篩檢**
2. **EAT-10 吞嚥困難篩檢(中文版)**
3. **握力測量評估**
4. **吞嚥肌肉超音波評估**（舌骨上肌群）
5. **肌少症綜合評估**（整合上述四項，依流程提供運動建議）

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

### 握力測量

- 輸入握力計測得的左右手握力(公斤),系統取較高值(最大握力)判定。
- **判讀(AWGS 2019 切點):** 男性最大握力 **< 28 公斤** 或 女性 **< 18 公斤** 視為握力偏低,為肌少症重要指標,建議進一步評估。

### 吞嚥肌肉超音波評估（舌骨上肌群）

輸入超音波測得的肌肉值,各肌肉「分別」對照文獻參考切點。**此領域尚無國際共識切點**,僅供研究／教育參考,不可單獨作為診斷依據。

每條肌肉皆可填**厚度與/或 CSA**(皆選填,整體至少一項):有切點者給「偏低/正常」判讀,無切點者列為「參考值」。

| 肌肉 | 厚度切點 | CSA 切點 | 來源 |
| --- | --- | --- | --- |
| 頦舌骨肌 Geniohyoid | < 6.5 mm(一般肌少症) | 女 < 172.5 / 男 < 194.7 mm²(性別特異) | Barotsis 2020 / Mori 2024 |
| 二腹肌前腹 Digastric | 無切點(參考) | < 75.1 mm²(AUC 0.73) | Ogawa 2020 |
| 下頜舌骨肌 Mylohyoid | 無切點(參考) | 無切點(參考) | — |

頦舌骨肌 CSA 切點為性別特異(年輕族群均值 − 2SD、吞嚥專屬、證據最強);頦舌骨肌厚度切點為一般肌少症篩檢(非吞嚥專屬、非性別特異)。**無經驗證的綜合分數**,故各項目分別判讀。

### 肌少症綜合評估（整合流程）

`assessment.html` 會自動彙整在「同一瀏覽器」完成的各項評估結果(透過 localStorage),依下列流程判讀並給運動建議:

1. **SARC-CalF 陽性(≥11)** 或 **握力偏低**(任一)→ 研判 **possible sarcopenia** → 建議**復健四式**(附 QR code 連至成大防衰弱中心),並就醫評估。
2. **EAT-10 異常** 或 **吞嚥肌肉異常**(任一,不論是否肌少症)→ 建議**就醫進一步檢查吞嚥** + **口腔吞嚥運動**(圖片)。
3. 皆正常 → 一般保健建議。

結果頁可按「**列印 / 儲存 PDF**」輸出綜合結果。

> localStorage 在 GitHub Pages／本機伺服器最穩定;部分瀏覽器以 `file://` 直接開啟時可能不會跨頁保存。
> 復健四式 QR code(`images/rehab-qr.svg`)已自動產生;口腔吞嚥運動圖片置於 `images/`(oral-swallow-1.jpg…)。

## 使用方式

直接以瀏覽器開啟 `index.html` 即可,無需安裝或架設伺服器。

亦可部署至任何靜態網站服務(如 GitHub Pages):將本專案推上 GitHub 後,於 repository 的 **Settings → Pages** 選擇分支即可線上使用。

## 檔案結構

```
index.html      # 封面頁（標題、封面圖、logo）＋ 工具選單
sarc-calf.html  # SARC-CalF 問卷頁面
sarc-calf.js    # SARC-CalF 題目與計分邏輯
eat-10.html     # EAT-10 問卷頁面
eat-10.js       # EAT-10 題目與計分邏輯
grip-strength.html  # 握力測量頁面
grip-strength.js    # 握力判定邏輯
swallow-muscle.html # 吞嚥肌肉超音波評估頁面
swallow-muscle.js   # 吞嚥肌肉判定邏輯
assessment.html # 肌少症綜合評估頁面
assessment.js   # 整合判讀與運動建議
store.js        # 共用：各評估結果暫存（localStorage）
images/         # QR code 與口腔吞嚥運動圖片
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
