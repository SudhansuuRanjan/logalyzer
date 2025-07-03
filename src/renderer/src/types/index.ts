export interface SevLog {
  station: string;
  release: string;
  card: number;
  severity: string;
  time: string;
  date: string;
  dateTimeIST: string;
  sevHeader: string;
  module: string;
  line: number;
  class: string;
}

export interface UpgradeLogs {
  eagleRel: string;
  eagleStation: string;
  logFileName: string;
  logFilePath: string;
  noOfLines?: number;
  noOfObits: number;
  noOfSev1s: number;
  noOfSev2s: number;
  noOfSev3s: number;
  sev1s_details: SevLog[];
  sev2s_details: SevLog[];
  sev3s_details: SevLog[];
  obit_details: any[];
}
