import { useState } from "react";
import { UpgradeLogs } from '../types';

interface LogItemProps {
    item: string;
    value: string | number;
}

const LogItem = ({ item, value }: LogItemProps) => (
  <div className="flex gap-1">
    <span className="font-medium text-gray-900">{item}:</span>
    <span className="text-gray-800">{value}</span>
  </div>
);

interface OverviewProps {
    logfile: UpgradeLogs | null;
}

interface SeverityCounts {
    severity1ByFrequency: Record<string, number>;
    severity2ByFrequency: Record<string, number>;
    severity3ByFrequency: Record<string, number>;
    obitsByFrequency: Record<string, number>;
    severity1ByCard: Record<string, number>;
    severity2ByCard: Record<string, number>;
    severity3ByCard: Record<string, number>;
    obitsByCard: Record<string, number>;
}

const Overview = ({ logfile }: OverviewProps) => {
  const [showDetails, setShowDetails] = useState(false);

  function getSeverityCounts(logfile: UpgradeLogs | null): SeverityCounts {
    if (!logfile)
      return {
        severity1ByFrequency: {},
        severity2ByFrequency: {},
        severity3ByFrequency: {},
        obitsByFrequency: {},
        severity1ByCard: {},
        severity2ByCard: {},
        severity3ByCard: {},
        obitsByCard: {},
      };

    const severityCounts: SeverityCounts = {
      severity1ByFrequency: {},
      severity2ByFrequency: {},
      severity3ByFrequency: {},
      obitsByFrequency: {},
      severity1ByCard: {},
      severity2ByCard: {},
      severity3ByCard: {},
      obitsByCard: {},
    };

    for (const sev of logfile.sev1s_details) {
      severityCounts.severity1ByFrequency[sev.sevHeader] =
        (severityCounts.severity1ByFrequency[sev.sevHeader] || 0) + 1;
    }

    severityCounts.severity1ByFrequency = Object.fromEntries(
      Object.entries(severityCounts.severity1ByFrequency).sort(([, a], [, b]) => b - a)
    );

    for (const obit of logfile.obit_details) {
      severityCounts.obitsByFrequency[obit.reason] =
        (severityCounts.obitsByFrequency[obit.reason] || 0) + 1;
    }

    severityCounts.obitsByFrequency = Object.fromEntries(
      Object.entries(severityCounts.obitsByFrequency).sort(([, a], [, b]) => b - a)
    );

    return severityCounts;
  }

  if (!logfile) {
    return (
      <div className="text-center text-gray-500 font-medium">
        No log file selected
      </div>
    );
  }

  const counts = getSeverityCounts(logfile);

  return (
    <div className="bg-pink-50 border border-pink-200 p-6 rounded-xl shadow-md">
      <h1 className="text-xl font-bold text-gray-900 mb-4">EAGLE Log Overview</h1>

      {/* Summary Fields */}
      <div className="space-y-1 text-sm text-gray-800">
        <LogItem item="Log File" value={logfile.logFileName} />
        <LogItem item="File Path" value={logfile.logFilePath} />
        <LogItem item="Eagle Release" value={logfile.eagleRel} />
        <LogItem item="Eagle Station" value={logfile.eagleStation} />
        <LogItem item="Total Obits" value={logfile.noOfObits} />
        <LogItem item="Severity 1" value={logfile.noOfSev1s} />
        <LogItem item="Severity 2" value={logfile.noOfSev2s} />
        <LogItem item="Severity 3" value={logfile.noOfSev3s} />
      </div>

      {/* Toggle Button */}
      <div className="mt-5">
        <button
          className="text-sm cursor-pointer text-white bg-pink-600 hover:bg-pink-700 transition px-4 py-2 rounded-lg shadow"
          onClick={() => setShowDetails(prev => !prev)}
        >
          {showDetails ? "Hide Details" : "Show Obits & Severity Summary"}
        </button>
      </div>

      {/* Expandable Section */}
      {showDetails && (
        <div className="transition-all duration-300 ease-in-out mt-5">

          {/* Obits */}
          <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-2">
            Obits Counts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(counts.obitsByFrequency).map(([key, value]) => (
              <div
                key={key}
                className="bg-pink-100 border border-pink-200 text-sm p-3 rounded-md shadow-sm"
              >
                <h3 className="font-medium text-gray-900">{key}</h3>
                <p className="text-gray-800">Count: {value}</p>
              </div>
            ))}
          </div>

          {/* Severity 1 */}
          <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
            Severity 1 Counts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(counts.severity1ByFrequency).map(([key, value]) => (
              <div
                key={key}
                className="bg-pink-100 border border-pink-200 text-sm p-3 rounded-md shadow-sm"
              >
                <h3 className="font-medium text-gray-900">{key}</h3>
                <p className="text-gray-800">Count: {value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;
