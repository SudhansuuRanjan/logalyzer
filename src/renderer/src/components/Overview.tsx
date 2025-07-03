

import { UpgradeLogs } from '../types';

interface LogItemProps {
    item: string;
    value: string | number;
}

const LogItem = ({ item, value }: LogItemProps) => {
    return (
        <div className="flex gap-1">
            <h3 className="font-medium">{item} :</h3> <p>{value}</p>
        </div>
    )
}

//   logFileName?: string;
//   logFilePath?: string;
//   noOfLines?: number;
//   noOfObits: number;
//   noOfSev1s: number;
//   noOfSev2s: number;
//   noOfSev3s: number;
//   sev1s_details: SevLog[];
//   sev2s_details: SevLog[];
//   sev3s_details: SevLog[];
//   obit_details: string[];

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

    // function to get unique severities and their counts also get frequence of severity and obits by counts
    function getSeverityCounts(logfile: UpgradeLogs | null): SeverityCounts {
        if (!logfile) return {
            severity1ByFrequency: {},
            severity2ByFrequency: {},
            severity3ByFrequency: {},
            obitsByFrequency: {},
            severity1ByCard: {},
            severity2ByCard: {},
            severity3ByCard: {},
            obitsByCard: {},
        };

        let severityCounts: SeverityCounts = {
            severity1ByFrequency:{},
            severity2ByFrequency:{},
            severity3ByFrequency:{},
            obitsByFrequency:{},
            severity1ByCard: {},
            severity2ByCard: {},
            severity3ByCard: {},
            obitsByCard: {},
        };

        for (const sev of logfile.sev1s_details) {
            if(severityCounts.severity1ByFrequency[sev.sevHeader]) {
                severityCounts.severity1ByFrequency[sev.sevHeader]++;
            }else{
                severityCounts.severity1ByFrequency[sev.sevHeader] = 1;
            }
        }

        // sort by frequency
        severityCounts.severity1ByFrequency = Object.fromEntries(
            Object.entries(severityCounts.severity1ByFrequency).sort(([, a], [, b]) => b - a)
        );

        for (const obit of logfile.obit_details) {
            if(severityCounts.obitsByFrequency[obit.reason]) {
                severityCounts.obitsByFrequency[obit.reason]++;
            }else{
                severityCounts.obitsByFrequency[obit.reason] = 1;
            }
        }

        // sort by frequency
        severityCounts.obitsByFrequency = Object.fromEntries(
            Object.entries(severityCounts.obitsByFrequency).sort(([, a], [, b]) => b - a)
        );

        // // sort by frequency
        // severityCounts.obitsByFrequency = Object.fromEntries(
        //     Object.entries(severityCounts.obitsByFrequency).sort(([, a], [, b]) => b - a)
        // );

        return severityCounts;
    }

    if (!logfile) {
        return <div className="text-center text-gray-500">No log file selected</div>;
    }



    return (
        <div className="bg-gray-200 p-4 shadow-md rounded my-5">
            <div>
                <h1 className="font-bold text-xl mb-2">Log Overview</h1>
            </div>


            <div>
                <LogItem item={"Log File"} value={logfile.logFileName} />
                <LogItem item={"File Path"} value={logfile.logFilePath} />
                <LogItem item={"Eagle Release"} value={logfile.eagleRel} />
                <LogItem item={"Eagle Station"} value={logfile.eagleStation} />
                <LogItem item={"Total Obits"} value={logfile.noOfObits} />
                <LogItem item={"Severity 1"} value={logfile.noOfSev1s} />
                <LogItem item={"Severity 2"} value={logfile.noOfSev2s} />
                <LogItem item={"Severity 3"} value={logfile.noOfSev3s} />
            </div>

            <div>
                <h2 className="font-bold text-lg mt-4">Severity Counts</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                    {Object.entries(getSeverityCounts(logfile).severity1ByFrequency).map(([key, value]) => (
                        <div key={key} className="bg-white text-xs p-3 rounded shadow">
                            <h3 className="font-medium">{key}</h3>
                            <p>Count: {value}</p>
                        </div>
                    ))}
                </div>


               <h2 className="font-bold text-lg mt-4">Obits Counts</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {Object.entries(getSeverityCounts(logfile).obitsByFrequency).map(([key, value]) => (
                        <div key={key} className="bg-white text-xs p-3 rounded shadow">
                            <h3 className="font-medium">{key}</h3>
                            <p>Count: {value}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}


export default Overview