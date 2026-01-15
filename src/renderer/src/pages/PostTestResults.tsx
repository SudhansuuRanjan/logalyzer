import React, { useState, useEffect } from "react";
import { status } from "@renderer/utils/status";
import { IssueData } from "@renderer/types";
import { FiCheckSquare, FiActivity, FiZap, FiFileText } from "react-icons/fi";

let env = "prod";
if (localStorage.getItem("environment")) {
  env = localStorage.getItem("environment")!;
}

const PostTestResults: React.FC = () => {
  const [issueData, setIssueData] = useState<IssueData | null>(null);
  const [executions, setExecutions] = useState<any[]>([]);
  const [testSteps, setTestSteps] = useState<any[]>([]);
  const [issueKey, setIssueKey] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [tab, setTab] = useState<string>("steps");
  const [executionSteps, setExecutionSteps] = useState<any[]>([]);
  const [executionLoading, setExecutionLoading] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [bulkComment, setBulkComment] = useState<string>("");
  const [bulkStatus, setBulkStatus] = useState<string>("1");
  const [postingRows, setPostingRows] = useState<Record<string, boolean>>({});
  const [bulkPosting, setBulkPosting] = useState<boolean>(false);
  const [rowStates, setRowStates] = useState<Record<string, { status: string, comment: string }>>({});

  const stripPTags = (html?: string) => typeof html === "string" ? html.replace(/^<p>/i, "").replace(/<\/p>$/i, "") : "";

  // Helper to initialize row states when steps are fetched
  useEffect(() => {
    if (executionSteps.length > 0) {
      const initSel: Record<string, boolean> = {};
      const initRow: Record<string, { status: string, comment: string }> = {};

      executionSteps.forEach((step: any) => {
        const id = String(step.id);
        initSel[id] = false;
        initRow[id] = {
          status: String(step.status || "1"),
          comment: stripPTags(step.comment || step.htmlComment) || ""
        };
      });
      setSelected(initSel);
      setRowStates(initRow);
    }
  }, [executionSteps]);

  const handleToggleAll = (checked: boolean) => {
    const next: Record<string, boolean> = {};
    executionSteps.forEach((step: any) => next[step.id] = checked);
    setSelected(next);
  };

  const handleToggleOne = (id: string, checked: boolean) => {
    setSelected(prev => ({ ...prev, [id]: checked }));
  };

  const updateRowState = (id: string, updates: Partial<{ status: string, comment: string }>) => {
    setRowStates(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates }
    }));
  };

  const handlePostRow = async (step: any) => {
    const pat = localStorage.getItem("pat");
    if (!pat) { setError("No PAT found"); return; }

    const id = String(step.id);
    const row = rowStates[id];

    setPostingRows(prev => ({ ...prev, [id]: true }));
    try {
      // payload key changed from htmlComment to comment to match your type definition
      await (window as any).api.invoke("post-single-step-result", {
        stepId: id,
        data: { status: row.status, comment: row.comment },
        pat,
        env
      });
    } catch (err: any) {
      setError(`Failed to post result for step ${id}: ${err.message}`);
    } finally {
      setPostingRows(prev => ({ ...prev, [id]: false }));
    }
  };

  const handlePostBulk = async () => {
    const pat = localStorage.getItem("pat");
    const selectedIds = Object.keys(selected).filter(id => selected[id]);

    if (!pat || selectedIds.length === 0) return;

    setBulkPosting(true);
    try {
      for (const id of selectedIds) {
        setPostingRows(prev => ({ ...prev, [id]: true }));
        try {
          await (window as any).api.invoke("post-single-step-result", {
            stepId: id,
            data: { status: bulkStatus, comment: bulkComment },
            pat,
            env
          });
          // Update local state to reflect the bulk change
          updateRowState(id, { status: bulkStatus, comment: bulkComment });
        } catch (err: any) {
          console.error(`Bulk Error on ${id}:`, err);
        } finally {
          setPostingRows(prev => ({ ...prev, [id]: false }));
        }
      }
    } finally {
      setBulkPosting(false);
    }
  };

  const fetchData = async () => {
    const pat = localStorage.getItem("pat");
    if (!issueKey.trim() || !pat) {
      setError("Please ensure Issue Key and PAT are provided.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await (window as any).api.invoke("fetch-jira-issue", { issueKey: issueKey.trim(), pat, env });
      setIssueData(response.data);
      setExecutions(response.executions || []);

      if (response?.data?.id) {
        const stepsResponse = await (window as any).api.invoke("fetch-test-steps", { issueId: response.data.id, pat, env });
        setTestSteps(stepsResponse?.stepBeanCollection ?? []);
      }
    } catch (err: any) {
      setError(`Fetch Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchTextExecution = async (executionId: string) => {
    const pat = localStorage.getItem("pat");
    if (!pat) return;

    setExecutionLoading(true);
    try {
      const stepsResponse = await (window as any).api.invoke("fetch-test-execution", { executionId, pat, env });
      setExecutionSteps(stepsResponse ?? []);
      setTab("results");
    } catch (error: any) {
      setError(`Execution Steps Error: ${error.message}`);
    } finally {
      setExecutionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };


  return (
    <div className="flex flex-col w-full max-w-full h-full overflow-y-auto p-4 pb-10">
      <h2 className="text-2xl font-bold text-pink-900 mb-4">Post Test Results</h2>

      <form onSubmit={(e) => { e.preventDefault(); fetchData(); }} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={issueKey}
            onChange={(e) => setIssueKey(e.target.value)}
            placeholder="Enter Jira Issue Key (e.g., DSRQA-110)"
            className="flex-1 px-3 py-2 border border-pink-300 rounded-lg outline-pink-600 text-pink-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-pink-900 text-white rounded-lg hover:bg-pink-800 disabled:opacity-50"
          >
            {loading ? "Fetching..." : "Fetch Issue"}
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {issueData?  (
        <>
          {/* Issue Info Card */}
          <div className="bg-gray-100 p-6 rounded-lg border border-pink-300">

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">

              <div className="bg-white p-4 rounded-lg">

                <h3 className="font-bold text-pink-900 mb-2">Issue Key:</h3>

                <p className="text-pink-600">{issueData.key}</p>

              </div>

              <div className="bg-white p-4 rounded-lg">

                <h3 className="font-bold text-pink-900 mb-2">Status:</h3>

                <p className="text-pink-600">{issueData.fields?.status?.name || 'N/A'}</p>

              </div>

              <div className="bg-white p-4 rounded-lg">

                <h3 className="font-bold text-pink-900 mb-2">Priority:</h3>

                <p className="text-pink-600">{issueData.fields?.priority?.name || 'N/A'}</p>

              </div>

              <div className="bg-white p-4 rounded-lg">

                <h3 className="font-bold text-pink-900 mb-2">Issue Type:</h3>

                <p className="text-pink-600">{issueData.fields?.issuetype?.name || 'N/A'}</p>

              </div>

              <div className="bg-white p-4 rounded-lg">

                <h3 className="font-bold text-pink-900 mb-2">Project:</h3>

                <p className="text-pink-600">{issueData.fields?.project?.key || 'N/A'}</p>

              </div>

              <div className="bg-white p-4 rounded-lg">

                <h3 className="font-bold text-pink-900 mb-2">Labels:</h3>

                <p className="text-pink-600">{(issueData.fields?.labels || []).join(', ') || 'None'}</p>

              </div>

            </div>


            <div className="bg-white p-4 rounded-lg mb-4">

              <h3 className="font-bold text-pink-900 mb-2">Summary</h3>

              <p className="text-pink-600">{issueData.fields?.summary || 'N/A'}</p>

            </div>


            {issueData.fields?.description && (

              <div className="bg-white p-4 rounded-lg mb-4">

                <h3 className="font-bold text-pink-900 mb-2">Description</h3>

                <p className="text-pink-600 whitespace-pre-wrap">{issueData.fields.description}</p>

              </div>

            )}


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

              <div className="bg-white p-4 rounded-lg">

                <h3 className="font-semibold text-pink-900 mb-1">Created:</h3>

                <p className="text-pink-600">{issueData.fields?.created ? formatDate(issueData.fields.created) : 'N/A'}</p>

              </div>

              <div className="bg-white p-4 rounded-lg">

                <h3 className="font-semibold text-pink-900 mb-1">Updated:</h3>

                <p className="text-pink-600">{issueData.fields?.updated ? formatDate(issueData.fields.updated) : 'N/A'}</p>

              </div>

              <div className="bg-white p-4 rounded-lg">

                <h3 className="font-semibold text-pink-900 mb-1">Creator:</h3>

                <p className="text-pink-600">{issueData.fields?.creator?.displayName || 'N/A'}</p>

              </div>

              <div className="bg-white p-4 rounded-lg">

                <h3 className="font-semibold text-pink-900 mb-1">Reporter:</h3>

                <p className="text-pink-600">{issueData.fields?.reporter?.displayName || 'N/A'}</p>

              </div>

            </div>

          </div>

          <div className="flex gap-4 mt-8">
            <button
              className={`px-4 py-1.5 border rounded-lg transition-colors ${tab === "steps" ? "bg-pink-600 text-white" : "border-pink-500 text-pink-500"}`}
              onClick={() => setTab("steps")}
            >
              View Test Steps
            </button>
            <button
              className={`px-4 py-1.5 border rounded-lg transition-colors ${tab === "results" ? "bg-pink-600 text-white" : "border-pink-500 text-pink-500"}`}
              onClick={() => setTab("results")}
            >
              Test Results
            </button>
          </div>

          {/* Cycles List */}
          <div className="bg-gray-50 p-4 rounded-lg border border-pink-200 mt-4 space-y-3">
            <h4 className="text-sm font-bold text-pink-900">Available Execution Cycles</h4>
            {executions.map((e: any) => (
              <div key={e.id} className="flex justify-between items-center bg-white p-3 rounded border border-pink-100">
                <div className="flex gap-6 text-sm">
                  <span><strong>Cycle:</strong> {e.cycleName}</span>
                  <span><strong>Release:</strong> {e.versionName}</span>
                  <span><strong>Assignee:</strong> {e.assignedTo}</span>
                </div>
                <button
                  onClick={() => fetchTextExecution(e.id)}
                  className="px-3 py-1 cursor-pointer bg-pink-600 text-white text-sm rounded hover:bg-pink-700"
                >
                  Execute Cycle
                </button>
              </div>
            ))}
          </div>

          {tab === "results" && (
            <div className="mt-6">
              {executionLoading ? <p className="text-pink-600 animate-pulse">Loading execution steps...</p> : (
                <>
                  <div className="overflow-x-auto rounded-lg border border-pink-200">
                    <table className="min-w-full bg-white text-sm">
                      <thead className="bg-pink-50 text-pink-900">
                        <tr>
                          <th className="p-3 border-b"><input type="checkbox" onChange={(e) => handleToggleAll(e.target.checked)} /></th>
                          <th className="p-3 border-b text-left">Step</th>
                          <th className="p-3 border-b text-left">Data</th>
                          <th className="p-3 border-b text-left">Status</th>
                          <th className="p-3 border-b text-left">Result</th>
                          <th className="p-3 border-b text-left">Comment</th>
                          <th className="p-3 border-b text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {executionSteps.map((step: any) => {
                          const id = String(step.id);
                          const state = rowStates[id] || { status: "1", comment: "" };
                          return (
                            <tr key={id} className="border-b border-pink-50 hover:bg-pink-50/20">
                              <td className="p-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={!!selected[id]}
                                  onChange={(e) => handleToggleOne(id, e.target.checked)}
                                />
                              </td>
                              <td className="p-3 max-w-xs whitespace-pre-wrap">{step.step}</td>
                              <td className="p-3 max-w-[14rem] whitespace-pre-wrap">{step.data}</td>
                              <td className="p-3 max-w-[14rem] whitespace-pre-wrap">{step.result}</td>
                              <td className="p-3">
                                <select
                                  value={state.status}
                                  onChange={(e) => updateRowState(id, { status: e.target.value })}
                                  className="p-1 border border-pink-200 rounded text-sm"
                                >
                                  {Object.keys(status).filter(k => k !== "-1").map(k => (
                                    <option key={k} value={k}>{(status as any)[k].name}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="p-3">
                                <textarea
                                  value={state.comment}
                                  onChange={(e) => updateRowState(id, { comment: e.target.value })}
                                  className="w-full p-2 border border-pink-100 rounded text-sm"
                                  rows={3}
                                />
                              </td>
                              <td className="p-3 text-center">
                                <button
                                  onClick={() => handlePostRow(step)}
                                  disabled={postingRows[id]}
                                  className="px-3 py-1 bg-pink-600 cursor-pointer text-white rounded text-sm disabled:opacity-50"
                                >
                                  {postingRows[id] ? "..." : "Post"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Bulk Actions */}
                  <div className="mt-6 p-4 bg-white border-2 border-dashed border-pink-200 rounded-xl">
                    <h4 className="font-bold text-pink-900 mb-3">Bulk Actions (Selected Steps)</h4>
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-4 items-center">
                        <select
                          value={bulkStatus}
                          onChange={(e) => setBulkStatus(e.target.value)}
                          className="p-2 border border-pink-300 rounded"
                        >
                          {Object.keys(status).filter(k => k !== "-1").map(k => (
                            <option key={k} value={k}>{(status as any)[k].name}</option>
                          ))}
                        </select>
                        <button
                          onClick={handlePostBulk}
                          disabled={bulkPosting || !Object.values(selected).some(v => v)}
                          className="px-6 py-2 bg-pink-800 text-white rounded-lg hover:bg-black transition-colors disabled:opacity-30"
                        >
                          {bulkPosting ? "Processing Bulk..." : "Apply to Selected"}
                        </button>
                      </div>
                      <textarea
                        placeholder="Bulk comment for all selected steps..."
                        value={bulkComment}
                        onChange={(e) => setBulkComment(e.target.value)}
                        className="w-full p-3 border border-pink-200 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {tab === "steps" && (
            <div className="mt-6 space-y-4">
              {testSteps.map((step: any) => (
                <div key={step.id} className="p-4 bg-white border border-pink-100 rounded-lg">
                  <div className="font-bold text-pink-900">Step {step.orderId}</div>
                  <div className="text-gray-700 mt-1">{step.data}</div>
                  <div className="mt-2 text-sm text-pink-600 italic">Expected: {step.result}</div>
                </div>
              ))}
            </div>
          )}
        </>
      ): <div className="flex flex-col items-center justify-center py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
    {/* Hero Section */}
    <div className="text-center max-w-2xl mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-pink-100 rounded-2xl text-pink-600 mb-6">
            <FiCheckSquare size={40} />
        </div>
        <h1 className="text-4xl font-extrabold text-pink-900 mb-4 tracking-tight">
            Zephyr Result Manager
        </h1>
        <p className="text-lg text-pink-400 leading-relaxed">
            Update your Jira test executions in real-time. Sync statuses, 
            add comments, and manage test cycles with high-speed bulk actions.
        </p>
    </div>

    {/* Feature Grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mb-16">
        <div className="p-6 bg-white border border-pink-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-pink-50 text-pink-500 rounded-lg flex items-center justify-center mb-4">
                <FiActivity size={20} />
            </div>
            <h3 className="font-bold text-pink-900 mb-2">Cycle Tracking</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
                Automatically fetch all execution cycles associated with your Jira issue, including versions and assignees.
            </p>
        </div>

        <div className="p-6 bg-white border border-pink-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-pink-50 text-pink-500 rounded-lg flex items-center justify-center mb-4">
                <FiZap size={20} />
            </div>
            <h3 className="font-bold text-pink-900 mb-2">Bulk Posting</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
                Update status and comments for dozens of test steps simultaneously. Save hours of manual entry in Jira.
            </p>
        </div>

        <div className="p-6 bg-white border border-pink-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-pink-50 text-pink-500 rounded-lg flex items-center justify-center mb-4">
                <FiFileText size={20} />
            </div>
            <h3 className="font-bold text-pink-900 mb-2">Step Verification</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
                Review test data and expected results side-by-side with your execution status to ensure total accuracy.
            </p>
        </div>
    </div>

    {/* Quick Start Guide */}
    <div className="w-full max-w-3xl bg-pink-50/50 rounded-3xl p-8 border border-pink-100/50">
        <h3 className="text-center font-bold text-pink-900 mb-8 uppercase tracking-widest text-xs">
            How to record results
        </h3>
        <div className="space-y-6">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-pink-900 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                <div>
                    <p className="font-bold text-pink-900 text-sm">Load the Test Case</p>
                    <p className="text-xs text-pink-400 mt-1">Enter your Jira Issue Key (e.g., DSRQA-110) to pull the metadata and available cycles.</p>
                </div>
            </div>
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-pink-900 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                <div>
                    <p className="font-bold text-pink-900 text-sm">Pick an Execution Cycle</p>
                    <p className="text-xs text-pink-400 mt-1">Click "Execute Cycle" on the specific release or cycle you are currently testing.</p>
                </div>
            </div>
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-pink-900 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                <div>
                    <p className="font-bold text-pink-900 text-sm">Submit Results</p>
                    <p className="text-xs text-pink-400 mt-1">Update individual rows or use "Select All" to apply a status and comment to multiple steps at once.</p>
                </div>
            </div>
        </div>
    </div>
</div>}
    </div>
  );
};

export default PostTestResults;