import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import CreateEpic from "@renderer/components/CreateEpic";
import CreateTest from "@renderer/components/CreateTest";
import { FaPlus } from "react-icons/fa";
import toast from "react-hot-toast";

// Minimal type augmentation for Electron IPC (adjust to your app's typings as needed)
declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        invoke: <T = any>(channel: string, payload?: any) => Promise<T>;
      };
    };
  }
}

// Domain types (partial/minimal to keep things simple)
type JiraIssue = {
  id: string;
  key: string;
  fields: {
    summary: string;
    status?: { name?: string };
    issuelinks?: Array<{
      outwardIssue?: {
        key: string;
        fields: {
          summary: string;
          status?: { name?: string };
        };
      };
    }>;
  };
};

type JiraSearchResponse = {
  issues: JiraIssue[];
};

type IssueDetailsResponse = JiraIssue;

const Spinner = ({ label }: { label?: string }) => (
  <div className="flex items-center gap-2 text-gray-600" role="status" aria-live="polite">
    <svg className="animate-spin h-4 w-4 text-pink-400" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
    </svg>
    <span className="text-sm">{label ?? "Loading..."}</span>
  </div>
);

const EmptyState = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="flex flex-col items-center justify-center text-center text-gray-500 py-8">
    <div className="text-lg font-medium">{title}</div>
    {subtitle && <div className="text-sm mt-1">{subtitle}</div>}
  </div>
);

// Simple debounce hook
function useDebounced<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const Badge = ({ children, color = "gray" }: { children: React.ReactNode; color?: "gray" | "green" | "red" | "yellow" | "blue" | "purple" }) => {
  const colorMap: Record<string, string> = {
    gray: "bg-gray-100 text-gray-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-800",
    blue: "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700"
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorMap[color]}`}>{children}</span>;
};

const TestPlanSearch: React.FC = () => {
  const navigate = useNavigate();
  const getEnv = () => localStorage.getItem("environment") || "prod";
  const getPat = () => localStorage.getItem("pat") || "";

  const [selectedEpicKey, setSelectedEpicKey] = useState<string | null>(null);
  const [selectedIssueKey, setSelectedIssueKey] = useState<string | null>(null);
  const [selectedStoryKey, setSelectedStoryKey] = useState<string | null>(null);

  // UI helpers
  const [featureFilter, setFeatureFilter] = useState("");
  const debouncedFeatureFilter = useDebounced(featureFilter, 200);
  const [sortAsc, setSortAsc] = useState(true);

  const [showCreateEpicModal, setShowCreateEpicModal] = useState(false);
  const [showCreateTestModal, setShowCreateTestModal] = useState(false);

  const handleCreateSuccess = () => {
    refetchEpics();
    if (selectedEpicKey) {
      refetchEpicIssues();
    }
  };

  // ------------------------
  // Fetch Epics
  // ------------------------
  const {
    data: epics,
    isLoading: epicsLoading,
    isError: epicsError,
    error: epicsErrorObj,
    refetch: refetchEpics
  } = useQuery<JiraSearchResponse>({
    queryKey: ["epics", getEnv(), getPat()],
    queryFn: async () => {
      return await window.electron.ipcRenderer.invoke<JiraSearchResponse>("fetch-epic", {
        env: getEnv(),
        pat: getPat()
      });
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true
  });

  // ------------------------
  // Fetch Issues in Epic
  // ------------------------
  const {
    data: epicIssues,
    isLoading: epicIssuesLoading,
    isError: epicIssuesError,
    error: epicIssuesErrorObj,
    refetch: refetchEpicIssues
  } = useQuery<JiraSearchResponse>({
    queryKey: ["issues-in-epic", selectedEpicKey, getEnv(), getPat()],
    queryFn: async () => {
      return await window.electron.ipcRenderer.invoke<JiraSearchResponse>("fetch-issues-in-epic", {
        env: getEnv(),
        pat: getPat(),
        epicKey: selectedEpicKey,
        startAt: 0,
        maxResults: 100
      });
    },
    enabled: !!selectedEpicKey,
    refetchOnWindowFocus: true
  });

  // ------------------------
  // Fetch Issue Details (Story → Tests)
  // ------------------------
  const {
    data: issueDetails,
    isLoading: issueDetailsLoading,
    isError: issueDetailsError,
    error: issueDetailsErrorObj,
    refetch: refetchIssueDetails
  } = useQuery<IssueDetailsResponse>({
    queryKey: ["issue-details", selectedIssueKey, getEnv(), getPat()],
    queryFn: async () => {
      return await window.electron.ipcRenderer.invoke<IssueDetailsResponse>("fetch-issue-details", {
        env: getEnv(),
        pat: getPat(),
        issueKey: selectedIssueKey
      });
    },
    enabled: !!selectedIssueKey,
    refetchOnWindowFocus: true
  });

  // ------------------------
  // Extract ONLY key + summary + status
  // ------------------------
  const linkedTests =
    issueDetails?.fields?.issuelinks
      ?.map((link: any) => {
        const issue = link.outwardIssue ?? link.inwardIssue;
        if (!issue) return null;

        return {
          key: issue.key as string,
          summary: issue.fields.summary as string,
          status: (issue.fields.status?.name as string) ?? "Unknown"
        };
      })
      .filter(Boolean) ?? [];


  // Derived + UI logic
  const filteredAndSortedIssues = useMemo(() => {
    const list = epicIssues?.issues ?? [];
    const filtered = debouncedFeatureFilter
      ? list.filter((issue) =>
        [issue.key, issue.fields.summary].join(" ").toLowerCase().includes(debouncedFeatureFilter.toLowerCase())
      )
      : list;
    const sorted = [...filtered].sort((a, b) => {
      const aText = `${a.key} ${a.fields.summary}`.toLowerCase();
      const bText = `${b.key} ${b.fields.summary}`.toLowerCase();
      return sortAsc ? aText.localeCompare(bText) : bText.localeCompare(aText);
    });
    return sorted;
  }, [epicIssues, debouncedFeatureFilter, sortAsc]);

  // Helpers
  const statusToColor = (status?: string): "gray" | "green" | "red" | "yellow" | "blue" | "purple" => {
    const s = (status ?? "").toLowerCase();
    if (s.includes("pass") || s.includes("done") || s.includes("closed")) return "green";
    if (s.includes("fail") || s.includes("block") || s.includes("reject")) return "red";
    if (s.includes("in progress")) return "blue";
    if (s.includes("todo") || s.includes("to do")) return "gray";
    if (s.includes("review")) return "purple";
    return "yellow";
  };

  // IMPORTANT: ensure we set selectedIssueKey to issue.key, not issue.id (fixes query param mismatch)
  const handleSelectIssue = (issue: JiraIssue) => {
    setSelectedIssueKey(issue.id);
    setSelectedStoryKey(issue.key);
  };

  // Reset selected issue when epic changes
  useEffect(() => {
    setSelectedIssueKey(null);
    setSelectedStoryKey(null);
  }, [selectedEpicKey]);

  return (
    <div className="flex flex-col w-full h-full p-4 gap-4 overflow-x-auto">
      {showCreateEpicModal && <CreateEpic selectedEpicKey={selectedEpicKey} setShowCreateEpicModal={setShowCreateEpicModal} onSuccess={handleCreateSuccess} />}
      {showCreateTestModal && <CreateTest selectedEpicKey={selectedEpicKey} selectedStoryKey={selectedStoryKey} setShowCreateTestModal={setShowCreateTestModal} onSuccess={handleCreateSuccess} />}
      {/* Header */}
      <div className="flexEIBCCDCGEJIKEJNVBFVVFNTFNJIFFRRTIJJJLURUBEBK
       items-center justify-between">
        <h1 className="text-xl font-semibold">Test Plans</h1>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="hidden sm:inline">Environment:</span>
          <Badge color="blue">{getEnv()}</Badge>
        </div>
      </div>

      {/* Releases (Epics) */}
      <section className="flex flex-col gap-2">
        <div className="flex gap-5"> <h3 className="font-medium">Releases</h3>
          <button onClick={() => {
            setSelectedEpicKey(null);
            setShowCreateEpicModal(!showCreateEpicModal);
          }} className="p-1.5 py-1 text-xs hover:scale-105 w-fit cursor-pointer text-pink-500 border border-pink-500 rounded-md flex gap-2 items-center"><FaPlus /><span>New Release</span></button>
          {epicsLoading && <Spinner label="Loading releases..." />}</div>
        {epicsError && (
          <div className="text-sm text-red-600">
            Failed to load releases: {(epicsErrorObj as any)?.message ?? "Unknown error"}
            <button className="ml-2 underline" onClick={() => refetchEpics()}>
              Retry
            </button>
          </div>
        )}

        {!epicsLoading && !epicsError && (
          <div className="flex items-center gap-3">
            {epics && epics.issues.length > 0 ? (
              <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                <label htmlFor="epic-select" className="text-sm text-gray-700">
                  Select an Epic
                </label>
                <select
                  id="epic-select"
                  className="border border-pink-300 rounded px-2 py-1 max-w-3xl"
                  value={selectedEpicKey ?? ""}
                  onChange={(e) => {
                    setSelectedEpicKey(e.target.value || null);
                  }}
                >
                  <option value="">
                    Choose…
                  </option>
                  {epics.issues.map((epic) => (
                    <option key={epic.key} value={epic.key}>
                      {epic.key}: {epic.fields.summary}
                    </option>
                  ))}
                </select>
                {selectedEpicKey && (
                  <Badge color="purple">
                    {epics.issues.find((e) => e.key === selectedEpicKey)?.fields.summary ?? selectedEpicKey}
                  </Badge>
                )}
              </div>
            ) : (
              <EmptyState title="No releases found" subtitle="Try refreshing or adjusting your filters." />
            )}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Features</h3>
          <div className="flex items-center justify-center gap-2">
            <input
              type="text"
              placeholder="Filter features (key or summary)"
              className="border border-pink-300 rounded px-2 py-1 w-64"
              value={featureFilter}
              onChange={(e) => setFeatureFilter(e.target.value)}
              disabled={!selectedEpicKey}
              aria-label="Filter features"
            />
            <button
              className="text-sm border px-2 py-1 rounded hover:bg-gray-50"
              onClick={() => setSortAsc((s) => !s)}
              disabled={!selectedEpicKey}
              aria-label="Toggle sort"
            >
              Sort: {sortAsc ? "A→Z" : "Z→A"}
            </button>

            <button onClick={() => {
              if (!selectedEpicKey) toast.error("Select an epic to create a story.")
              else setShowCreateEpicModal(!showCreateEpicModal);
            }} className="p-1.5 py-1 text-sm hover:scale-105 w-fit cursor-pointer text-pink-500 border border-pink-500 rounded-md flex gap-2 items-center"><FaPlus /><span>New Feature</span></button>
          </div>
        </div>

        <div
          className="border border-pink-300 rounded px-2 py-1 w-full min-h-[15rem] max-h-[20rem] overflow-y-auto"
          role="listbox"
          aria-label="Features list"
        >
          {!selectedEpicKey && <EmptyState title="Select a release to view features" />}

          {selectedEpicKey && epicIssuesLoading && <Spinner label="Loading features..." />}

          {selectedEpicKey && epicIssuesError && (
            <div className="text-sm text-red-600">
              Failed to load features: {(epicIssuesErrorObj as any)?.message ?? "Unknown error"}
              <button className="ml-2 underline" onClick={() => refetchEpicIssues()}>
                Retry
              </button>
            </div>
          )}

          {selectedEpicKey && !epicIssuesLoading && !epicIssuesError && (
            <>
              {filteredAndSortedIssues.length === 0 ? (
                <EmptyState title="No features match your filter" subtitle="Try clearing or adjusting your search." />
              ) : (
                filteredAndSortedIssues.map((issue) => {
                  const isSelected = selectedIssueKey == issue.id;
                  return (
                    <div
                      key={issue.key}
                      className={`cursor-pointer py-1 px-2 rounded outline-none ${isSelected ? "font-semibold bg-pink-200" : "hover:bg-gray-50"
                        }`}
                      role="option"
                      aria-selected={isSelected}
                      tabIndex={0}
                      onClick={() => handleSelectIssue(issue)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") handleSelectIssue(issue);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="truncate">
                          <span className="font-mono text-xs mr-2">{issue.key}</span>
                          <span className="text-sm">{issue.fields.summary}</span>
                        </div>
                        {issue.fields.status?.name && <Badge color="blue">{issue.fields.status.name}</Badge>}
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>
      </section>

      {/* Tests */}
      <section className="flex flex-col gap-2">
        <div className="flex gap-3">
          <h3 className="font-medium">Tests</h3>
          <button onClick={() => {
            if (!selectedEpicKey || !selectedIssueKey) {
              toast.error("Select a release and feature to create New Test!")
            }
            else {
              setShowCreateTestModal(!showCreateTestModal);
            }
          }} className="p-1.5 py-1 text-xs hover:scale-105 w-fit cursor-pointer text-pink-500 border border-pink-500 rounded-md flex gap-2 items-center"><FaPlus /><span>New Test</span></button>
        </div>

        {!selectedIssueKey && <EmptyState title="Select a feature to view linked tests" />}

        {selectedIssueKey && issueDetailsLoading && <Spinner label="Loading tests..." />}

        {selectedIssueKey && issueDetailsError && (
          <div className="text-sm text-red-600">
            Failed to load tests: {(issueDetailsErrorObj as any)?.message ?? "Unknown error"}
            <button className="ml-2 underline" onClick={() => refetchIssueDetails()}>
              Retry
            </button>
          </div>
        )}

        {selectedIssueKey && !issueDetailsLoading && !issueDetailsError && linkedTests.length === 0 && (
          <p className="text-gray-500">No tests linked</p>
        )}

        {selectedIssueKey && !issueDetailsLoading && !issueDetailsError && linkedTests.length > 0 && (
          <div className="border border-pink-300 rounded px-2 py-1 w-full">
            {linkedTests.map((test: any) => (
              <div key={test.key} className="border-b last:border-b-0 py-2">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-sm">{test.key}</div>
                  <Badge color={statusToColor(test.status)}>Status: {test.status}</Badge>
                </div>
                <div className="text-sm mt-1">{test.summary}</div>

                <div className="flex gap-3 items-end w-full justify-end">
                  <button
                    className="mt-2 text-sm text-white bg-pink-500 hover:bg-pink-600 cursor-pointer hover:scale-[102%] rounded-lg py-1.5 px-3"
                    onClick={() => navigate(`/update-testcase?issue_key=${test.key}`)}
                  >
                    Update Test Case
                  </button>

                  <button
                    className="mt-2 text-sm text-white bg-green-500 hover:bg-green-600 cursor-pointer hover:scale-[102%] rounded-lg py-1.5 px-3"
                    onClick={() => navigate(`/post-results?issue_key=${test.key}`)}
                  >
                    Post Test Results
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer / Context */}
      <div className="text-xs text-gray-500">
        Tip: Your environment and PAT are read from localStorage. Ensure they are set correctly. Avoid exposing personal access tokens.
      </div>
    </div>
  );
};

export default TestPlanSearch;
