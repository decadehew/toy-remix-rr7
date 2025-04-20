## 查看路由完整結構

npx react-router routes

## 關於 css bundle 實現

remix 已經合併到 rr7 了，所以 remix 有提到 bundle 處理是需要安裝 remix-bundle 套件。在 rr7
vite 提起可直接 import css file，vite 可以直接幫你處理。

測試：`npm run build && npm run start` 直接在 prd 環境查看

## remix-flat-routes

https://github.com/kiliman/remix-flat-routes 來代替

## vscode extension

Tailwind CSS IntelliSense 在 rr7 專案中不能 working，導致原因是 root.tsx import
tailwind 不能以 tailwindcss.css 名稱來 import

## 環境變數無法載入

當 build && start 無法載入 root >>> .env 環境變數。

解決：

- build 後資料夾路徑不對，導致無法直接讀取根 env
- 目前手動在 ./build/server/index.js >>> process.loadEnvFile();
- https://nodejs.org/api/process.html#processloadenvfilepath -
  default 路徑是 ./.env
