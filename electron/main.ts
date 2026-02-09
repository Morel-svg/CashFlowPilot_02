import { app, BrowserWindow } from "electron";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = !app.isPackaged;

function getPreloadPath() {
  return path.join(__dirname, "preload.cjs");
}

async function createWindow() {
  const dataDir = path.join(app.getPath("userData"), "data");
  fs.mkdirSync(dataDir, { recursive: true });
  process.env.DATA_DIR = dataDir;

  const { startServer } = await import("../server/startServer");
  const { url } = await startServer({
    mode: isDev ? "development" : "production",
    host: "127.0.0.1",
    port: 0,
  });

  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: getPreloadPath(),
    },
  });

  win.once("ready-to-show", () => {
    win.show();
    if (isDev) {
      win.webContents.openDevTools({ mode: "detach" });
    }
  });

  await win.loadURL(url);
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    void createWindow();
  }
});

app.whenReady().then(() => {
  void createWindow();
});
