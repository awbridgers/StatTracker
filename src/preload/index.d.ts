import { ElectronAPI } from '@electron-toolkit/preload'
import { rosterData, player} from 'src/types'


declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      saveRoster:(data:rosterData, type:'men' | 'women')=>Promise<boolean>,
      fetchRoster: ()=>Promise<{men: rosterData, women: rosterData}|null>,
      saveStarters:(data: (player|null)[], gender: 'men' | 'women')=>Promise<boolean>,
      fetchStarters: ()=>Promise<{men: (player|null)[], women: (player|null)[]}|null>
    }
  }
}
