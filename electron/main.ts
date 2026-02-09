import { app, BrowserWindow } from "electron";
import path from "path";
import fs from "fs";
import { spawn, type ChildProcess } from "child_process";
import http from "http";

const isDev = !app.isPackaged;
let serverProcess: ChildProcess | null = null;

const SERVER_HOST = "127.0.0.1";
const SERVER_PORT = Number(process.env.CASHFLOW_PORT || 3000);

function getPreloadPath() {
  return path.join(__dirname, "preload.cjs");
}

function getServerUrl() {
  return `http://${SERVER_HOST}:${SERVER_PORT}`;
}

function getTsxPath() {
  const bin = process.platform === "win32" ? "tsx.cmd" : "tsx";
  return path.join(process.cwd(), "node_modules", ".bin", bin);
}

function startServerProcess() {
  const dataDir = path.join(app.getPath("userData"), "data");
  fs.mkdirSync(dataDir, { recursive: true });

  const env = {
    ...process.env,
    DATA_DIR: dataDir,
    PORT: String(SERVER_PORT),
    NODE_ENV: isDev ? "development" : "production",
  };

  if (isDev) {
    serverProcess = spawn(getTsxPath(), ["server/index.ts"], {
      env,
      stdio: "inherit",
    });
  } else {
    serverProcess = spawn(process.execPath, ["dist/index.js"], {
      env,
      stdio: "inherit",
    });
  }

  serverProcess.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`Server exited with code ${code}`);
    }
  });
}

function waitForServerReady(timeoutMs = 15000) {
  const startedAt = Date.now();
  const url = getServerUrl();

  return new Promise<void>((resolve, reject) => {
    const tryOnce = () => {
      const req = http.get(url, (res) => {
        res.resume();
        resolve();
      });
      req.on("error", () => {
        if (Date.now() - startedAt > timeoutMs) {
          reject(new Error("Server did not start in time"));
          return;
        }
        setTimeout(tryOnce, 300);
      });
    };

    tryOnce();
  });
}

async function createWindow() {
  startServerProcess();
  await waitForServerReady();

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

  await win.loadURL(getServerUrl());
}

app.on("before-quit", () => {
  serverProcess?.kill();
});

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
