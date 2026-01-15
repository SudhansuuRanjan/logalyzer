// types.ts (or at top of your .ts file)
type SevLogDetail = {
  station: string;
  release: string;
  card: number;
  severity: string;
  time: string;          // e.g., "20:08:40"
  date: string;          // e.g., "25-02-26"
  dateTimeIST: string;   // ISO string with +05:30
  sevHeader: string;     // full header line
  module: string;
  line: number;
  class: string;
}

type FileParams = {
  noOfLines: number;
  filteredLines: string[];
  firstLine: string;
  lastLine: string;
}

type LogParams = {
  logFileName: string;
  logFilePath: string;
  noOfObits: number;
  noOfSev1s: number;
  noOfSev2s: number;
  noOfSev3s: number;
  sev1s_details: SevLogDetail[];
  sev2s_details: SevLogDetail[];
  sev3s_details: SevLogDetail[];
  obit_details: ObitLogDetail[]; // can be typed separately
  eagleRel: string;            // e.g., "Eagle 1.0.0"
  eagleStation: string;       // e.g., "Station A"
}

type ObitLogDetail = {
  station: string;
  date: string;
  time: string;
  dateTimeIST: string;
  release: string;
  reason: string;
  module: string;
  line: number;
  class: string;
  fullText: string;
}


// -------------------------
// Globals
// -------------------------
const fileParams: FileParams = {
  noOfLines: 0,
  filteredLines: [],
  firstLine: '',
  lastLine: '',
};

const logParams: LogParams = {
  logFileName: '',
  logFilePath: '',
  noOfObits: 0,
  noOfSev1s: 0,
  noOfSev2s: 0,
  noOfSev3s: 0,
  sev1s_details: [],
  sev2s_details: [],
  sev3s_details: [],
  obit_details: [],
  eagleRel: '',
  eagleStation: '',
};

// -------------------------
// Extract Logs Entry Point
// -------------------------
function extractLogs(inputLogs: string, filePath: string): LogParams {
  // Initialize log file parameters
  logParams.logFileName = filePath.split('\\').pop() || '';
  logParams.logFilePath = filePath;
  logParams.noOfObits = 0;
  logParams.noOfSev1s = 0;  
  logParams.noOfSev2s = 0;
  logParams.noOfSev3s = 0;
  logParams.sev1s_details = [];
  logParams.sev2s_details = [];
  logParams.sev3s_details = [];
  logParams.obit_details = [];
  fileParams.firstLine = '';
  fileParams.lastLine = '';

  const lines = inputLogs.split('\n');
  fileParams.noOfLines = lines.length;

  if (lines.length > 0) {
    fileParams.firstLine = lines[0].trim();
    fileParams.lastLine = lines[lines.length - 1].trim();
  }

  extractEagleInfo(lines);
  extractSevs(lines, 'Severity 1');
  extractSevs(lines, 'Severity 2');
  extractSevs(lines, 'Severity 3');
  extractObits(lines, 'Obit');

  return logParams;
}

//--------------------------
// Extract Eagle Release and Station
//--------------------------
function extractEagleInfo(lines: string[]): void {
  for (const line of lines) {
    if (line.includes('EST') && line.includes('EAGLE')) {
      const parts = line.trim().split(/\s+/);
      const estIndex = parts.indexOf('EST');
      const eagleIndex = parts.indexOf('EAGLE');

      // Make sure we have valid indexes and values around them
      if (estIndex > 1 && eagleIndex > estIndex) {
        const station = parts[0]; // e.g., tklc1111101
        const release = parts[eagleIndex + 1]; // e.g., 48.0.0.0.0-80.20.0
        logParams.eagleRel = release;
        logParams.eagleStation = station;
        return; // stop after first match
      }
    }
  }

  console.log('Eagle Release and Station not found');
}

// -------------------------
// Extract Logs by Severity
// -------------------------
function extractSevs(lines: string[], keyword: string): void {
  const severityNum = keyword.split(' ')[1]; // "1", "2", "3"
  const tempDetails: SevLogDetail[] = [];
  let tempLog: string[] = [];

  try {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.includes(keyword)) {
        tempLog = [];

        // Get preceding lines
        let j = i - 1;
        while (j >= 0 && lines[j].trim() !== ';') {
          tempLog.unshift(lines[j]);
          j--;
        }

        tempLog.push(line);

        // Get following lines
        let k = i + 1;
        while (k < lines.length && lines[k].trim() !== ';') {
          tempLog.push(lines[k]);
          k++;
        }

        const firstLine = tempLog[1]?.trim() || '';
        const secondLine = tempLog[2]?.trim() || '';

        const firstMatch = firstLine.match(
          /^(\S+)\s+(\d{2}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})\s+EST\s+\S+\s+(\d+\.\d+\.\d+\.\d+\.\d+\-\d+\.\d+\.\d+)/
        );

        const secondMatch = secondLine.match(
          /Card\s+(\d+)\s+Module\s+(\S+)\s+Line\s+(\d+)\s+Class\s+(\S+)\s+Severity\s+(\d+)/
        );

        if (firstMatch && secondMatch) {
          const [_, station, date, time, release] = firstMatch;
          const [__, card, module, lineNum, classCode, severity] = secondMatch;

          const [yy, mm, dd] = date.split('-');
          const fullDate = `20${yy}-${mm}-${dd}`;
          const dateTimeEST = `${fullDate}T${time}-05:00`;

          const dateTimeIST = new Date(dateTimeEST);
          dateTimeIST.setHours(dateTimeIST.getHours() + 10);
          dateTimeIST.setMinutes(dateTimeIST.getMinutes() + 30);

          const logDetails: SevLogDetail = {
            station,
            release,
            card: parseInt(card),
            severity: `Severity ${severity}`,
            time,
            date,
            dateTimeIST: dateTimeIST.toISOString().replace('Z', '+05:30'),
            sevHeader: secondLine,
            module,
            line: parseInt(lineNum),
            class: classCode,
          };

          tempDetails.push(logDetails);
        }

        tempLog = [];
      }
    }

    // Store in correct severity
    switch (severityNum) {
      case '1':
        logParams.noOfSev1s = tempDetails.length;
        logParams.sev1s_details = tempDetails;
        break;
      case '2':
        logParams.noOfSev2s = tempDetails.length;
        logParams.sev2s_details = tempDetails;
        break;
      case '3':
        logParams.noOfSev3s = tempDetails.length;
        logParams.sev3s_details = tempDetails;
        break;
    }

    console.log(`Extracted ${tempDetails.length} ${keyword} logs.`);
  } catch (error) {
    console.error(`Error extracting ${keyword} logs:`, error);
  }
}

// -------------------------
// Extract Obits
// -------------------------
function extractObits(lines: string[], keyword: string): void {
  const tempDetails: ObitLogDetail[] = [];
  let tempLog: string[] = [];

  try {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.includes(keyword)) {
        tempLog = [];

        // Get preceding lines
        let j = i - 1;
        while (j >= 0 && lines[j].trim() !== ';') {
          tempLog.unshift(lines[j]);
          j--;
        }

        tempLog.push(line);

        // Get following lines
        let k = i + 1;
        while (k < lines.length && lines[k].trim() !== ';') {
          tempLog.push(lines[k]);
          k++;
        }

        const joined = tempLog.join('\n').trim();

        // Extract station, date, time, release from line 1
        const metaLine = tempLog[1]?.trim() || '';
        const metaMatch = metaLine.match(
          /^(\S+)\s+(\d{2}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})\s+EST\s+\S+\s+(\d+\.\d+\.\d+\.\d+\.\d+\-\d+\.\d+\.\d+)/
        );

        // Reason line (starts with STH:)
        const moduleLine = tempLog.find((l) => l.includes('Module')) || '';

        const moduleMatch = moduleLine.match(
          /Card\s+(\d+)\s+Module\s+(\S+)\s+Line\s+(\d+)\s+Class\s+(\S+)/
        );

        if (metaMatch) {
          const [_, station, date, time, release] = metaMatch;
          const [yy, mm, dd] = date.split('-');
          const fullDate = `20${yy}-${mm}-${dd}`;
          const dateTimeEST = `${fullDate}T${time}-05:00`;

          const dateTimeIST = new Date(dateTimeEST);
          dateTimeIST.setHours(dateTimeIST.getHours() + 10);
          dateTimeIST.setMinutes(dateTimeIST.getMinutes() + 30);

          const obitDetails: ObitLogDetail = {
            station,
            date,
            time,
            dateTimeIST: dateTimeIST.toISOString().replace('Z', '+05:30'),
            release,
            reason: moduleLine.trim(),
            module: moduleMatch?.[2] || '',
            line: moduleMatch?.[3] ? parseInt(moduleMatch[3]) : -1,
            class: moduleMatch?.[4] || '',
            fullText: joined,
          };

          tempDetails.push(obitDetails);
        }
      }
    }

    logParams.noOfObits = tempDetails.length;
    logParams.obit_details = tempDetails;

    console.log(`Extracted ${tempDetails.length} OBIT logs.`);
  } catch (error) {
    console.error(`Error extracting ${keyword} logs:`, error);
  }
}


// -------------------------
// Export for external use
// -------------------------
export default extractLogs;
