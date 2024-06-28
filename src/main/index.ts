import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import fs from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { player, rosterData } from '../types'
import { Roster } from './Roster'

const saveStarters = (data: player[], gender: 'men' | 'women') =>{
  try{
    const path = app.getPath('userData');
    const userData = JSON.stringify(data);
    fs.writeFileSync(`${path}/starters-${gender}.json`,userData);
    return true
  }catch(e){
    console.log(e)
    return false
  }
}
const fetchStarters = ()=>{
  try {
    const path = app.getPath('userData');
    const startersMen = fs.readFileSync(`${path}/starters-men.json`, 'utf-8');
    const startersWomen = fs.readFileSync(`${path}/starters-women.json`, 'utf-8');
    return {men: JSON.parse(startersMen), women: JSON.parse(startersWomen)}
  }catch(e){
    console.log(e);
    return null
  }
}
const saveRoster = (data: rosterData, type: 'men'|'women', r:Roster) => {
  try{
    const path = app.getPath('userData')
    const userData = JSON.stringify(data)
    fs.writeFileSync(`${path}/roster-${type}.json`, userData)
    r.updateRoster(type, data)
    return true
  }
  catch(e){
    console.log(e);
    return false
  }
}

const fetchRoster = (r: Roster) => {
  try {
    const path = app.getPath('userData')
    const dataMen = fs.readFileSync(`${path}/roster-men.json`, 'utf-8')
    const dataWomen = fs.readFileSync(`${path}/roster-women.json`, 'utf-8');
    r.updateRoster('men', JSON.parse(dataMen))
    r.updateRoster('women', JSON.parse(dataWomen))
    return { men: JSON.parse(dataMen), women: JSON.parse(dataWomen)}
  } catch (e) {
    console.log(e)
    return null
  }
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    title: 'StatTracker',
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
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
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

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

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
const roster = new Roster();
fetchRoster(roster);




//handle api stuff here
// ipcMain.handle('calculate', (_,data: string, gender: 'men'|'women', liveStats:boolean, starters: player[])=>{
//   try{
//     const results = parse(data, gender==='men',liveStats,starters,roster[gender])
//     results.forEach((x)=>console.log(x))
//     return results
//   }
//   catch(e){
//     console.log(e);
//     return null
//   }
  
// })

ipcMain.handle('saveRoster', (_, data: rosterData, type: 'men' | 'women') => {
  return saveRoster(data, type, roster)
})

ipcMain.handle('fetchRoster', () => {
  return roster
})

ipcMain.handle('saveStarters', (_, data: player[], gender: 'men' | 'women')=>{
  return saveStarters(data, gender)
})
ipcMain.handle('fetchStarters',() =>{
  return fetchStarters();
})
