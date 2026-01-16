import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from "fs"
import extractLogs from './process_log'
// import Database from 'better-sqlite3';
// import path from 'path';
// const dbPath = path.join(__dirname, 'mydatabase.db');

import { fetchJiraIssue, fetchTCExecution, fetchTestSteps, postSingleStepResult, createTestStep, updateTestStep, deleteTestStep } from './api/jira';

// export const db = new Database(dbPath);

// try {
//   console.log('Initializing database at:', dbPath);
//   // Example table creation
//   db.prepare(`
//   CREATE TABLE IF NOT EXISTS notes (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     title TEXT NOT NULL,
//     content TEXT
//   )
// `).run();

// } catch (error) {
//   console.error('Error initializing database:', error);
// }

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : { icon }),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.logalyzer')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'));

  ipcMain.handle('dialog:openFile', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Text Files', extensions: ['txt', 'log', 'cap'] }]
    });
    return result.canceled ? null : result.filePaths[0];
  });

  ipcMain.handle('fetch-jira-issue', async (_, { issueKey, pat, env }) => {
    try {
      return await fetchJiraIssue(issueKey, pat, env);
    } catch (error) {
      throw error;
    }
  });

  ipcMain.handle('fetch-test-steps', async (_, { issueId, pat, env }) => {
    try {
      return await fetchTestSteps(issueId, pat, env);
    } catch (error) {
      throw error;
    }
  });

  ipcMain.handle('fetch-test-execution', async (_, { executionId, pat, env }) => {
    try {
      return await fetchTCExecution(executionId, pat, env)
    } catch (error) {
      throw error;
    }
  });

  ipcMain.handle('post-single-step-result', async (_, { stepId, data, pat, env }) => {
    try {
      return await postSingleStepResult(stepId, pat, env, data);
    } catch (error) {
      throw error;
    }
  });

  ipcMain.handle('create-test-step', async (_, { issueId, pat, env, data }) => {
    try {
      return await createTestStep(issueId, pat, env, data)
    } catch (error) {
      throw error;
    }
  });

  ipcMain.handle('update-test-step', async (_, { issueId, stepId, pat, env, data }) => {
    try {
      return await updateTestStep(issueId, stepId, pat, env, data)
    } catch (error) {
      throw error;
    }
  });

  ipcMain.handle('delete-test-step', async (_, { issueId, stepId, pat, env }) => {
    try {
      return await deleteTestStep(issueId, stepId, pat, env)
    } catch (error) {
      throw error;
    }
  });

  ipcMain.on('read-large-file', (event, filePath) => {
    const stream = fs.createReadStream(filePath, { encoding: 'utf-8' });

    let fullContent = '';

    stream.on('data', chunk => {
      fullContent += chunk;
      event.sender.send('file-chunk', chunk);
    });

    stream.on('end', () => {
      console.log('File fully read.');
      const processedLogs = extractLogs(fullContent, filePath);
      event.sender.send('file-end', processedLogs);
    });

    stream.on('error', err => {
      event.sender.send('file-error', err.message);
    });

  });


  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
