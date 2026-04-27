# 像素風闖關問答遊戲

這是一個基於 React (Vite) 開發的像素風格問答遊戲，可透過 Google Sheets 進行題庫管理與成績紀錄。

## 環境設定

1. **安裝依賴套件**
   在專案根目錄開啟終端機，執行以下指令：
   ```bash
   npm install
   ```

2. **啟動測試伺服器**
   執行以下指令啟動本機伺服器：
   ```bash
   npm run dev
   ```
   啟動後可開啟 `http://localhost:5173` 進行預覽。

## Google Sheets 與 Apps Script 設定

### 1. 建立 Google 試算表
1. 前往 Google 試算表建立一份空白表單。
2. 將預設的第一個工作表名稱改為「題目」。
3. 建立標題列：在 A 到 G 欄依序輸入 `題號`、`題目`、`A`、`B`、`C`、`D`、`解答`。
4. 點擊左下角「+」號新增工作表，命名為「回答」。
5. 建立標題列：在 A 到 G 欄依序輸入 `ID`、`闖關次數`、`總分`、`最高分`、`第一次通關分數`、`花了幾次通關`、`最近遊玩時間`。

### 2. 設定 Google Apps Script
1. 在試算表上方選單點選 **擴充功能 > Apps Script**。
2. 將預設程式碼刪除。
3. 打開專案內的 `google-app-script.js`，將全部內容複製並貼上到 Apps Script 中。
4. 點選上方的「儲存專案」（磁碟機圖示）。
5. 點選右上角的 **部署 > 新增部署作業**。
6. 在「選取類型」點擊齒輪圖示，選擇「網頁應用程式」。
7. 設定以下內容：
   - 說明：(可隨意填寫，如 v1)
   - 執行身分：我
   - 誰可以存取：所有人 (Anyone)
8. 點擊「部署」。首次部署會要求「審查權限」，請依照畫面提示完成授權。
9. 部署完成後，複製畫面上顯示的「網頁應用程式網址」(Web App URL)。

### 3. 環境變數設定
1. 回到專案資料夾，找到 `.env` 檔案（可參考 `.env.example` 的格式）。
2. 將剛才複製的網址貼上到 `VITE_GOOGLE_APP_SCRIPT_URL=` 的後面。
3. 您可以自由修改過關門檻 `VITE_PASS_THRESHOLD` 與每次遊戲抽題數 `VITE_QUESTION_COUNT`。
4. 重新啟動開發伺服器，即可開始遊玩！

## 部署至 GitHub Pages

> **重要前提：** GitHub Actions 僅負責自動編譯與發佈前端程式碼。游戲後端（題目、分數記錄）需透過 **Google Apps Script** 來達成，請务必先完成上方「 Google Sheets 與 Apps Script 設定」章節再進行以下步驟。

本專案已設定 GitHub Actions，只要將程式碼推送到 GitHub，系統就會自動編譯並部署到 GitHub Pages。

### 完整操作順序（建議依照此順序執行）：

#### 步驟 1：先完成 Google 後端設定
請先回到本文件上方的「 Google Sheets 與 Apps Script 設定」章節，從「1. 建立 Google 試算表」開始依序完成所有設定。**重點：最後一定要拿到 Google Apps Script 的「網頁應用程式網址」(Web App URL)**。

#### 步驟 2：建立 GitHub Repository 並上傳程式碼
1. 在 GitHub 建立一個全新的 Repository（公開 Public）。
2. 將本專案的程式碼 `git push` 上去。

#### 步驟 3：在 GitHub 設定 Secrets 環境變數
**.env 檔案不能上傳到 GitHub（已設定在 .gitignore），因此必須將三個機密變數暫時存入 GitHub Secrets：**
1. 進入您的 GitHub Repository 頁面，點選上方的 **Settings**。
2. 點開左側選單的 **Secrets and variables** > **Actions**。
3. 點擊綠色的 **New repository secret**，依序新增以下三個變數：

   | Secret 名稱 | 內容 |
   |---|---|
   | `VITE_GOOGLE_APP_SCRIPT_URL` | 步驟 1 拿到的 Google Apps Script 網址 |
   | `VITE_PASS_THRESHOLD` | 過關門檻，例如：`3` |
   | `VITE_QUESTION_COUNT` | 每次抽題數量，例如：`5` |

#### 步驟 4：開啟 GitHub Pages 部署權限
1. 點選 **Settings** > **Actions** > **General**。
2. 溻到最下方的 **Workflow permissions**，選擇 **Read and write permissions**，點擊 **Save**。
3. 點選 **Settings** > **Pages** > **Source**，將下拉選單改為 **`GitHub Actions`**。

#### 步驟 5：觸發自動部署
1. 回到您的終端機，進行任意一次 commit 並推播：
   ```bash
   git add .
   git commit -m "Trigger deployment"
   git push
   ```
2. 點選 GitHub 上方頁籤的 **Actions**，就會看到 `Deploy to GitHub Pages` 的流程正在執行。
3. 等待綠色打勾後，進入 **Settings** > **Pages**，就能看到您的公開網頁網址！

### 後端達不到時的排查方式

若網頁展示小次數永遠為 0 或這統計沒有寫入，請依照以下清單檢查：

1. **確認 Secrets 已正確填入**：回到 **Settings > Secrets > Actions**，檢查三個變數是否存在（內容在花糶展示，不会掲露）。
2. **確認 Apps Script 部署版本是最新的**：回到 Apps Script，點選「部署 > 管理部署作業」，確認您使用的網址對應的是最新版本。
3. **確認存取權限設為「所有人 (Anyone)」**：若設為「已登入 Google 帳戶的人」，則游戲結局畫面將無法存取。
