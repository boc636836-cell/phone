# 電話查詢（加密版）

`index.html` 內的資料以 AES-256-GCM 加密（金鑰由密碼經 PBKDF2-SHA256 600,000 次導出），
開啟網頁輸入正確密碼後才會在瀏覽器內解密顯示。repo 內不含明文資料。

## 更新資料或更換密碼

明文電話表 **不要** 放進此 repo。在自己電腦上執行：

```bash
PHONE_PW='新密碼' node build.mjs 路徑/原始電話表.html
```

會重新產生 `index.html`，commit 並 push 即可。（需 Node.js 18 以上）

- `template.html`：網頁樣板（解鎖畫面＋查詢程式）
- `build.mjs`：從原始電話表擷取資料並加密
