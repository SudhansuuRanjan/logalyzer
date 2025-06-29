import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    streamFileAPI: {
      openFileDialog: () => Promise<string | null>;
      readLargeFile: (path: string) => void;
      onFileChunk: (callback: (chunk: string) => void) => void;
      onFileEnd: (callback: (structuredLogs: any) => void) => void;
      onFileError: (callback: (err: string) => void) => void;
    };
  }
}
