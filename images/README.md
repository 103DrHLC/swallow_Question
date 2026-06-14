# images 資料夾

放置綜合評估頁（assessment.html）會用到的圖片。

## 已內含

- `rehab-qr.svg` — 復健四式網站的 QR code（自動產生，指向成大防衰弱中心頁面）。

## 你需要加入：口腔吞嚥運動圖片

請將口腔吞嚥運動的衛教圖片放入本資料夾，並命名為：

```
oral-swallow-1.jpg
oral-swallow-2.jpg
oral-swallow-3.jpg
oral-swallow-4.jpg
```

- 副檔名用 `.jpg`（若用 `.png`，請同時修改 `assessment.js` 最上方的 `ORAL_SWALLOW_IMAGES` 清單）。
- 數量可增減：在 `ORAL_SWALLOW_IMAGES` 清單調整即可。
- 未放入的檔案會自動隱藏（不會出現破圖）。

加入後 `git add images/ && git commit && git push` 即可。
