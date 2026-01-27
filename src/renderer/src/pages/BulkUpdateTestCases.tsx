import React, { useState, useRef, useEffect } from "react";
import {
    FiDownload,
    FiUpload,
    FiCheckCircle,
    FiAlertCircle,
    FiFileText,
    FiDatabase,
    FiPlusCircle,
    FiTrash2,
    FiX,
    FiShield,
    FiLayers
} from "react-icons/fi";
import { useSearchParams } from 'react-router-dom'

// --- Types ---
interface ZephyrStep {
    id: number;
    orderId: number;
    step: string;
    data: string;
    result: string;
}

interface DiffStep extends ZephyrStep {
    status: "unchanged" | "updated" | "new";
    original?: ZephyrStep;
}

const ZephyrBulkUpdater: React.FC = () => {
    const [searchParams] = useSearchParams()
    const jira_issue_key = searchParams.get("issue_key");

    // --- Existing State ---
    const [issueKey, setIssueKey] = useState("");
    const [issueData, setIssueData] = useState<any | null>(null);
    const [jiraSteps, setJiraSteps] = useState<ZephyrStep[]>([]);
    const [diffSteps, setDiffSteps] = useState<DiffStep[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    // --- State for Direct Insert ---
    const [newStep, setNewStep] = useState({ step: "", data: "", result: "" });
    const [isAdding, setIsAdding] = useState(false);

    // --- New State for Custom Delete Modal ---
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [stepToDelete, setStepToDelete] = useState<number | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- Existing Helpers ---
    const getEnv = () => localStorage.getItem("environment") || "prod";
    const getPat = () => localStorage.getItem("pat");

    // --- Existing Logic: Fetch Data ---
    const fetchData = async (e: any) => {
        if (e && e.preventDefault) e.preventDefault();
        const pat = getPat();
        if (!issueKey.trim()) {
            setError("Please enter a Jira Issue Key.");
            return;
        }
        if (!pat) {
            setError("No PAT found. Please configure it in Manage PAT.");
            return;
        }

        setLoading(true);
        setError("");
        setUploadSuccess(false);
        setDiffSteps([]);

        try {
            const issueRes = await (window as any).api.invoke("fetch-jira-issue", {
                issueKey: issueKey.trim(),
                pat,
                env: getEnv()
            });
            setIssueData(issueRes.data);

            const stepsRes = await (window as any).api.invoke("fetch-test-steps", {
                issueId: issueRes.data.id,
                pat,
                env: getEnv()
            });

            const steps = (stepsRes?.stepBeanCollection ?? []).map((s: any) => ({
                id: s.id,
                orderId: s.orderId,
                step: s.step || "",
                data: s.data || "",
                result: s.result || ""
            }));

            setJiraSteps(steps);
        } catch (err: any) {
            setError(`Fetch failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (jira_issue_key) {
            setIssueKey(jira_issue_key);
        }
    }, [jira_issue_key]);

    // --- New Logic: Delete Single Test Step ---
    const handleDeleteStep = (stepId: number) => {
        setStepToDelete(stepId);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (stepToDelete === null || !issueData?.id) return;

        const pat = getPat();
        const env = getEnv();
        const issueId = issueData.id;

        setIsProcessing(true);
        setError("");

        try {
            await (window as any).api.invoke("delete-test-step", {
                issueId,
                stepId: stepToDelete,
                pat,
                env
            });

            setUploadSuccess(true);
            setShowDeleteModal(false);
            await fetchData(null);
        } catch (err: any) {
            setError(`Failed to delete step: ${err.message}`);
        } finally {
            setIsProcessing(false);
            setStepToDelete(null);
        }
    };

    // --- New Logic: Add Single Test Step Directly ---
    const handleAddStep = async (e: React.FormEvent) => {
        e.preventDefault();
        const pat = getPat();
        const env = getEnv();
        const issueId = issueData?.id;

        if (!issueId) {
            setError("Missing internal Issue ID. Please Connect first.");
            return;
        }

        setIsAdding(true);
        setError("");

        try {
            await (window as any).api.invoke("create-test-step", {
                issueId,
                data: newStep,
                pat,
                env
            });
            setNewStep({ step: "", data: "", result: "" });
            setUploadSuccess(true);
            await fetchData(null);
        } catch (err: any) {
            setError(`Failed to add step: ${err.message}`);
        } finally {
            setIsAdding(false);
        }
    };

    // --- Existing Logic: CSV Export ---
    const exportToCSV = () => {
        if (jiraSteps.length === 0) return;

        const headers = ["ID", "OrderId", "Step", "Data", "Expected Result"];
        const rows = jiraSteps.map(s => [
            s.id,
            s.orderId,
            `"${s.step.replace(/"/g, '""')}"`,
            `"${s.data.replace(/"/g, '""')}"`,
            `"${s.result.replace(/"/g, '""')}"`
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${issueKey}_Bulk_Export.csv`;
        link.click();
    };

    // --- Existing Logic: CSV Import & Diff ---
    const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            processCSVData(text);
        };
        reader.readAsText(file);
        e.target.value = "";
    };

    function processCSVData(text: string): void {
        const lines: string[][] = [];
        let currentLine: string[] = [];
        let currentToken: string = '';
        let insideQuote = false;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const nextChar = text[i + 1];

            if (char === '"') {
                if (insideQuote && nextChar === '"') {
                    currentToken += '"';
                    i++;
                } else {
                    insideQuote = !insideQuote;
                }
            } else if (char === ',' && !insideQuote) {
                currentLine.push(currentToken);
                currentToken = '';
            } else if ((char === '\n' || char === '\r') && !insideQuote) {
                if (currentToken || currentLine.length > 0) {
                    currentLine.push(currentToken);
                    lines.push([...currentLine]);
                }
                currentLine = [];
                currentToken = '';
                if (char === '\r' && nextChar === '\n') i++;
            } else {
                currentToken += char;
            }
        }

        if (currentToken || currentLine.length > 0) {
            currentLine.push(currentToken);
            lines.push([...currentLine]);
        }

        if (!lines.length) {
            setError('CSV file is empty.');
            return;
        }

        const headerRow: string[] = lines[0].map(h => (h || '').trim().toLowerCase());
        const expectedHeaders = ['id', 'orderid', 'step', 'data', 'expected result'];

        if (!expectedHeaders.every(h => headerRow.includes(h))) {
            setError('Invalid CSV format.');
            return;
        }

        const indexMap = {
            id: headerRow.indexOf('id'),
            orderid: headerRow.indexOf('orderid'),
            step: headerRow.indexOf('step'),
            data: headerRow.indexOf('data'),
            result: headerRow.indexOf('expected result')
        };

        lines.shift();

        const importedSteps = lines
            .filter((l): l is string[] => l.length > 0 && l.some(v => v && (v || '').trim()))
            .map(line => {
                const idStr = line[indexMap.id]?.trim();
                const id = idStr && !isNaN(parseInt(idStr, 10)) ? parseInt(idStr, 10) : null;
                const orderIdStr = line[indexMap.orderid]?.trim() || '0';
                const orderId = parseInt(orderIdStr, 10) || 0;

                return {
                    id,
                    orderId,
                    step: line[indexMap.step]?.trim() || '',
                    data: line[indexMap.data]?.trim() || '',
                    result: line[indexMap.result]?.trim() || ''
                };
            })
            .filter(s => (s.step || '').trim() || (s.data || '').trim() || (s.result || '').trim());

        const diff: DiffStep[] = [];
        const jiraMap = new Map(jiraSteps.map(s => [s.id, s]));

        importedSteps.forEach(imp => {
            const stepId = imp.id ?? 0;
            if (stepId > 0) {
                const original = jiraMap.get(stepId);
                if (original) {
                    const hasChanges = imp.step !== original.step || imp.data !== original.data || imp.result !== original.result;
                    if (hasChanges) {
                        diff.push({ ...imp, id: stepId, status: 'updated' as const, original });
                    }
                } else {
                    diff.push({ ...imp, id: stepId, status: 'new' as const });
                }
            } else {
                diff.push({ ...imp, id: 0, status: 'new' as const });
            }
        });

        setDiffSteps(diff);
        setError('');
        setUploadSuccess(false);
    }

    // --- Existing Logic: Commit Bulk Changes ---
    const commitChanges = async () => {
        const pat = getPat();
        const env = getEnv();
        const issueId = issueData?.id;

        if (!issueId) return;
        setIsProcessing(true);
        setError("");

        try {
            for (const step of diffSteps) {
                const payload = { step: step.step, data: step.data, result: step.result };
                if (step.status === "updated") {
                    await (window as any).api.invoke("update-test-step", {
                        issueId, stepId: step.id, data: payload, pat, env
                    });
                } else if (step.status === "new") {
                    await (window as any).api.invoke("create-test-step", {
                        issueId, data: payload, pat, env
                    });
                }
            }
            setUploadSuccess(true);
            setDiffSteps([]);
            fetchData(null);
        } catch (err: any) {
            setError(`Bulk update failed: ${err.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

    return (
        <div className="relative rounded-tl-2xl flex flex-col w-full max-w-full h-full overflow-y-auto p-4 pb-10 select-text bg-white">

            {/* Custom Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-pink-100 transform animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-pink-900">Confirm Delete</h3>
                            <button onClick={() => setShowDeleteModal(false)} className="text-gray-400 hover:text-pink-600 cursor-pointer">
                                <FiX size={20} />
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to delete this test step? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-500 hover:bg-gray-50 cursor-pointer">
                                Cancel
                            </button>
                            <button onClick={confirmDelete} disabled={isProcessing} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50 cursor-pointer">
                                {isProcessing ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-pink-900 flex items-center gap-2">
                        <FiDatabase className="text-pink-600" /> Zephyr Bulk Updater
                    </h2>
                    <p className="text-sm text-pink-400">Export, edit via CSV, and push bulk changes safely.</p>
                </div>

                <form onSubmit={async(e) => await fetchData(e)} className="flex gap-2 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Issue Key"
                        value={issueKey}
                        onChange={e => setIssueKey(e.target.value)}
                        className="flex-1 border border-pink-200 p-2 min-w-sm rounded-lg outline-pink-600 text-sm"
                    />
                    <button disabled={loading} type="submit" className="bg-pink-900 text-white px-6 py-2 rounded-lg hover:bg-pink-800 font-semibold cursor-pointer">
                        {loading ? "..." : "Search"}
                    </button>
                </form>
            </div>

            {error && <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded flex items-center gap-3 text-sm"><FiAlertCircle />{error}</div>}
            {uploadSuccess && <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded flex items-center gap-3 text-sm"><FiCheckCircle />Action successful!</div>}

            {/* Metadata Card */}
            {issueData ? (
                <div className="bg-gray-50 p-6 rounded-xl border border-pink-100 mb-8 shadow-sm">

                    <h3 className="text-xs font-bold text-pink-300 uppercase tracking-widest mb-4 flex items-center gap-2">

                        <FiFileText /> Jira Ticket Information

                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">

                        {[

                            { label: "Key", val: issueData.key },

                            { label: "Status", val: issueData.fields?.status?.name },

                            { label: "Priority", val: issueData.fields?.priority?.name },

                            { label: "Type", val: issueData.fields?.issuetype?.name },

                            { label: "Project", val: issueData.fields?.project?.key },

                            { label: "Environment", val: getEnv().toUpperCase() },

                        ].map((item, i) => (

                            <div key={i} className="bg-white p-3 rounded-lg border border-pink-50">

                                <p className="text-[10px] font-bold text-pink-800 uppercase">{item.label}</p>

                                <p className="text-pink-500 font-semibold truncate">{item.val || "N/A"}</p>

                            </div>

                        ))}

                    </div>



                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

                        <div className="bg-white p-4 rounded-lg border border-pink-50">

                            <h3 className="font-semibold text-pink-900 text-xs uppercase mb-1">Summary</h3>

                            <p className="text-pink-800 text-sm font-medium leading-relaxed">{issueData.fields?.summary}</p>

                        </div>

                        <div className="grid grid-cols-2 gap-4">

                            <div className="bg-white p-3 rounded-lg border border-pink-50">

                                <h3 className="font-semibold text-pink-900 text-[10px] uppercase mb-1">Created</h3>

                                <p className="text-pink-600 text-sm">{issueData.fields?.created ? formatDate(issueData.fields.created) : 'N/A'}</p>

                            </div>

                            <div className="bg-white p-3 rounded-lg border border-pink-50">

                                <h3 className="font-semibold text-pink-900 text-[10px] uppercase mb-1">Updated</h3>

                                <p className="text-pink-600 text-sm">{issueData.fields?.updated ? formatDate(issueData.fields.updated) : 'N/A'}</p>

                            </div>

                            <div className="bg-white p-3 rounded-lg border border-pink-50">

                                <h3 className="font-semibold text-pink-900 text-[10px] uppercase mb-1">Creator</h3>

                                <p className="text-pink-600 text-sm truncate">{issueData.fields?.creator?.displayName || 'N/A'}</p>

                            </div>

                            <div className="bg-white p-3 rounded-lg border border-pink-50">

                                <h3 className="font-semibold text-pink-900 text-[10px] uppercase mb-1">Reporter</h3>

                                <p className="text-pink-600 text-sm truncate">{issueData.fields?.reporter?.displayName || 'N/A'}</p>

                            </div>

                        </div>

                    </div>

                </div>
            ) :
                <div className="flex flex-col items-center justify-center py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Hero Section */}
                    <div className="text-center max-w-2xl mb-12">
                        <div className="inline-flex items-center justify-center p-3 bg-pink-100 rounded-2xl text-pink-600 mb-6">
                            <FiDatabase size={40} />
                        </div>
                        <h1 className="text-4xl font-extrabold text-pink-900 mb-4 tracking-tight">
                            Zephyr Bulk Step Manager
                        </h1>
                        <p className="text-lg text-pink-400 leading-relaxed">
                            A specialized utility designed to bridge the gap between Excel and Jira.
                            Manage thousands of test steps with surgical precision and bulk efficiency.
                        </p>
                    </div>

                    {/* Feature Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mb-16">
                        <div className="p-6 bg-white border border-pink-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center mb-4">
                                <FiDownload size={20} />
                            </div>
                            <h3 className="font-bold text-pink-900 mb-2">Smart Export</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Download your current Jira test steps into a perfectly formatted CSV. Ready for offline editing.
                            </p>
                        </div>

                        <div className="p-6 bg-white border border-pink-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 bg-yellow-50 text-yellow-500 rounded-lg flex items-center justify-center mb-4">
                                <FiLayers size={20} />
                            </div>
                            <h3 className="font-bold text-pink-900 mb-2">Diff Recognition</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Our engine automatically detects updates, new steps, and order changes before you push to production.
                            </p>
                        </div>

                        <div className="p-6 bg-white border border-pink-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 bg-green-50 text-green-500 rounded-lg flex items-center justify-center mb-4">
                                <FiShield size={20} />
                            </div>
                            <h3 className="font-bold text-pink-900 mb-2">Safe Commits</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Review every change in the comparison table. We never delete steps automatically to ensure data safety.
                            </p>
                        </div>
                    </div>

                    {/* Quick Start Guide */}
                    <div className="w-full max-w-3xl bg-pink-50/50 rounded-3xl p-8 border border-pink-100/50">
                        <h3 className="text-center font-bold text-pink-900 mb-8 uppercase tracking-widest text-xs">
                            How to get started
                        </h3>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-pink-900 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                                <div>
                                    <p className="font-bold text-pink-900 text-sm">Connect to Jira</p>
                                    <p className="text-xs text-pink-400 mt-1">Enter your Issue Key (e.g., DSRQA-110) in the top bar and click Connect.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-pink-900 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                                <div>
                                    <p className="font-bold text-pink-900 text-sm">Export & Edit</p>
                                    <p className="text-xs text-pink-400 mt-1">Export the current steps to CSV. Open in Excel, modify your test cases, or add new rows at the bottom.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-pink-900 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                                <div>
                                    <p className="font-bold text-pink-900 text-sm">Upload & Sync</p>
                                    <p className="text-xs text-pink-400 mt-1">Upload the modified CSV. Review the highlighted changes in the diff table and click Commit Changes.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }

            {/* CSV Actions */}
            {jiraSteps.length > 0 && (
                <div className="flex flex-wrap gap-4 mb-8">
                    <button onClick={exportToCSV} className="flex cursor-pointer items-center gap-2 bg-white border border-pink-200 text-pink-700 px-5 py-2.5 rounded-lg text-sm font-medium"><FiDownload /> Export CSV</button>
                    <button onClick={() => fileInputRef.current?.click()} className="flex cursor-pointer items-center gap-2 bg-pink-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium"><FiUpload /> Upload CSV</button>
                    <input type="file" ref={fileInputRef} onChange={handleImportCSV} accept=".csv" className="hidden" />
                </div>
            )}

            {/* Diff Table (Existing logic preserved) */}
            {diffSteps.length > 0 && (
                <div className="flex flex-col gap-4 mb-10">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-yellow-600">Pending Changes detected...</span>
                        <button onClick={commitChanges} disabled={isProcessing} className="bg-pink-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-lg flex items-center gap-2 cursor-pointer">
                            {isProcessing ? "Processing..." : "Commit Bulk Changes"}
                        </button>
                    </div>
                    <div className="border border-pink-100 rounded-xl overflow-hidden shadow-xl">
                        <table className="min-w-full text-sm bg-white">
                            <thead className="bg-pink-900 text-white text-xs uppercase">
                                <tr><th className="p-4 text-left w-16">Ord.</th><th className="p-4 text-left">Test Step</th><th className="p-4 text-left">Data</th><th className="p-4 text-left">Result</th></tr>
                            </thead>
                            <tbody className="divide-y divide-pink-50">
                                {diffSteps.map((s, idx) => (
                                    <tr key={idx} className={s.status === "updated" ? "bg-yellow-50/50" : "bg-green-50/50"}>
                                        <td className="p-4 font-mono font-bold text-pink-400">{s.orderId}</td>
                                        <td className="p-4">{s.step}</td>
                                        <td className="p-4">{s.data}</td>
                                        <td className="p-4">{s.result}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Live Steps Table with Actions */}
            {jiraSteps.length > 0 && (
                <div className="mt-4">
                    <h4 className="text-xs font-bold text-pink-300 uppercase mb-3">Live Steps in Jira</h4>
                    <div className="border border-pink-200 rounded-lg overflow-hidden">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 border-b border-pink-200 text-pink-900 text-[10px] uppercase font-bold">
                                <tr><th className="p-3 text-left w-16">#</th><th className="p-3 text-left">Step</th><th className="p-3 text-left">Data</th><th className="p-3 text-left">Result</th><th className="p-3 text-center w-20">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-pink-200 text-slate-800">
                                {jiraSteps.slice(0, 10).map(s => (
                                    <tr key={s.id}>
                                        <td className="p-3 font-mono">{s.orderId}</td>
                                        <td className="p-3 max-w-xs">{s.step}</td>
                                        <td className="p-3 max-w-xs">{s.data}</td>
                                        <td className="p-3 max-w-xs">{s.result}</td>
                                        <td className="p-3 text-center">
                                            <button onClick={() => handleDeleteStep(s.id)} className="text-red-500 hover:text-red-700 cursor-pointer p-1" title="Delete"><FiTrash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Direct Step Form */}
            {issueData && (
                <div className="bg-white p-6 rounded-xl border border-pink-200 my-8 shadow-sm">
                    <h3 className="text-sm font-bold text-pink-900 mb-4 flex items-center gap-2"><FiPlusCircle className="text-pink-600" /> Insert New Step</h3>
                    <form onSubmit={handleAddStep} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <textarea value={newStep.step} onChange={(e) => setNewStep({ ...newStep, step: e.target.value })} placeholder="Step *" className="border border-pink-100 p-2 rounded-lg text-sm outline-pink-500 min-h-[80px]" required />
                        <textarea value={newStep.data} onChange={(e) => setNewStep({ ...newStep, data: e.target.value })} placeholder="Data" className="border border-pink-100 p-2 rounded-lg text-sm outline-pink-500 min-h-[80px]" />
                        <textarea value={newStep.result} onChange={(e) => setNewStep({ ...newStep, result: e.target.value })} placeholder="Result" className="border border-pink-100 p-2 rounded-lg text-sm outline-pink-500 min-h-[80px]" />
                        <div className="md:col-span-3 flex justify-end"><button type="submit" disabled={isAdding} className="bg-pink-700 text-white px-8 py-2 rounded-lg font-bold hover:bg-pink-800 cursor-pointer transition-all disabled:opacity-50">{isAdding ? "..." : "Add Single Step"}</button></div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ZephyrBulkUpdater;