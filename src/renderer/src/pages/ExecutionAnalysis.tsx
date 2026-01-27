import { useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react';
import Table from '@renderer/components/Table';
import { FiDatabase } from 'react-icons/fi';

const ExecutionAnalysis = () => {
    const [searchParams] = useSearchParams()
    const url = searchParams.get("file_url");
    const [data, setData] = useState<Record<string, any>[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getPat = () => localStorage.getItem("pat");

    useEffect(() => {
        if (!url) {
            setError("No file URL provided");
            setLoading(false);
            return;
        }

        if (!getPat()) {
            setError("Authentication token (PAT) not found");
            setLoading(false);
            return;
        }

    const parseCSV = (csvText: string): Record<string, any>[] => {
        const lines = csvText.trim().split('\n');
        if (lines.length < 2) return [];

        let headers: string[] = [];
        let rows: Record<string, any>[] = [];

        // Parse headers
        let headerLine = lines[0];
        headers = parseCSVLine(headerLine);

        // Parse rows
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const values = parseCSVLine(line);
            const row: Record<string, any> = {};
            for (let j = 0; j < headers.length && j < values.length; j++) {
                row[headers[j]] = values[j];
            }
            rows.push(row);
        }

        return rows;
    };

    const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        let i = 0;

        while (i < line.length) {
            const char = line[i];

            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
            i++;
        }
        result.push(current.trim());
        return result.map(field => field.replace(/^"|"$/g, ''));
    };

    const fetchCSV = async () => {
        try {
            setLoading(true);
            setError(null);
            const csvText = await (window as any).api.invoke("fetch-csv-data", {
                url,
                pat: getPat()
            });
            const rows = parseCSV(csvText);
            setData(rows);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load CSV");
        } finally {
            setLoading(false);
        }
    };

        fetchCSV();
    }, [url]);

    if (loading) {
        return (
            <div className="flex flex-col w-full h-full overflow-y-auto p-4 pb-10">
                <div className="flex items-start justify-between">
                    <div className="mb-4">
                        <h2 className="text-2xl font-bold text-pink-900 flex items-center gap-2">
                            <FiDatabase className="text-pink-600" />
                            Zephyr Execution Extract
                        </h2>
                        <p className="text-sm text-pink-400">
                            View and manage Zephyr test case executions directly from Logalyzer.
                        </p>
                    </div>
                </div>
                <p className="text-pink-500">Loading CSV...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col w-full h-full overflow-y-auto p-4 pb-10">
                <div className="flex items-start justify-between">
                    <div className="mb-4">
                        <h2 className="text-2xl font-bold text-pink-900 flex items-center gap-2">
                            <FiDatabase className="text-pink-600" />
                            Zephyr Execution Extract
                        </h2>
                        <p className="text-sm text-pink-400">
                            View and manage Zephyr test case executions directly from Logalyzer.
                        </p>
                    </div>
                </div>
                <p className="text-red-500">{error}</p>
                <p>URL: {url}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full h-full overflow-y-auto p-4 pb-10">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="mb-4">
                    <h2 className="text-2xl font-bold text-pink-900 flex items-center gap-2">
                        <FiDatabase className="text-pink-600" />
                        Zephyr Execution Extract
                    </h2>
                    <p className="text-sm text-pink-400">
                        View and manage Zephyr test case executions directly from Logalyzer.
                    </p>
                </div>
            </div>

            <Table
                data={data}
                rowKey="ExecutionId"
                tooltip="Test Summary"
                skipFields={["ExecutionDefects", "Custom Fields", "Test Step Custom Fields", "Archived By", "Archived On", "Estimated Time", "Logged Time", "StepId", "OrderId", "Step", "Test Data", "Expected Result", "Step Result", "Comments"]} // Skip complex or irrelevant fields
            />
        </div>
    )
}

export default ExecutionAnalysis
