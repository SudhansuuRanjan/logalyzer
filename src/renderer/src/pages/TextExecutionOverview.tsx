import { useState, useMemo, useEffect } from "react";
import { FiDatabase } from "react-icons/fi";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import CustomTable from "@renderer/components/CustomTable";
import { FaUpload } from "react-icons/fa";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface Status {
  id: number;
  name: string;
  description: string;
  color: string;
  type: number;
}

interface Execution {
  id: number;
  status: Status;
  cycleName: string;
  folderName: string;
  issueKey: string;
  issueSummary: string;
  executedOn: string;
  executedByDisplay: string;
}

interface QueryResult {
  executions: Execution[];
  executionStatuses: Status[];
  totalCount: number;
}

interface AutocompleteItem {
  value: string;
  displayName: string;
}

/* ------------------------------------------------------------------ */

const PROJECT_KEY = "CGIU DSRQA";
const MAX_RECORDS = 50;

/* ------------------------------------------------------------------ */
/* --------------------------- MAIN VIEW ----------------------------- */
/* ------------------------------------------------------------------ */

const TextExecutionOverview = () => {
  const navigate = useNavigate();
  /* ----------------------------- filters ----------------------------- */
  const [params, setParams] = useState({
    version: "",
    cycle: "",
    folder: "",
    statuses: [] as string[]
  });

  /* ---------------------------- pagination ---------------------------- */
  const [offset, setOffset] = useState(0);

  /* ----------------------------- helpers ------------------------------ */
  const getEnv = () => localStorage.getItem("environment") || "prod";
  const getPat = () => localStorage.getItem("pat");

  /* -------------------------- derived ZQL ----------------------------- */
  const zqlQuery = useMemo(() => {
    const conditions: string[] = [`project = "${PROJECT_KEY}"`];

    if (params.version) {
      conditions.push(`fixVersion = "${params.version.replaceAll(`"`, ``)}"`);
    }

    if (params.cycle) {
      conditions.push(`cycleName = "${params.cycle.replaceAll(`"`, ``)}"`);
    }

    if (params.folder) {
      conditions.push(`folderName = "${params.folder.replaceAll(`"`, ``)}"`);
    }

    if (params.statuses.length > 0) {
      conditions.push(
        `executionStatus IN (${params.statuses.join(",")})`
      );
    }

    return `${conditions.join(" AND ")} ORDER BY summary ASC, fixVersion ASC`;
  }, [params]);

  /* ------------------ reset pagination on filter ------------------ */
  useEffect(() => {
    setOffset(0);
  }, [params]);

  /* -------------------------- main query --------------------------- */
  const {
    data: result,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ["executions", zqlQuery, offset, MAX_RECORDS],
    queryFn: async () => {
      const pat = getPat();
      if (!pat) throw new Error("Authentication token not found");

      return (window as any).api.invoke("fetch-execution-search", {
        pat,
        env: getEnv(),
        zqlQuery,
        offset,
        maxRecords: MAX_RECORDS
      }) as Promise<QueryResult>;
    },
    placeholderData: (prev) => prev,
    staleTime: 60_000
  }) as UseQueryResult<QueryResult | undefined, Error>;

  /* ----------------------- pagination info ------------------------- */
  const totalCount = result?.totalCount ?? 0;
  const currentPage = Math.floor(offset / MAX_RECORDS) + 1;
  const totalPages = Math.ceil(totalCount / MAX_RECORDS);
  const fromRecord = offset + 1;
  const toRecord = Math.min(offset + MAX_RECORDS, totalCount);

  /* -------------------------- status toggle ------------------------- */
  const toggleStatus = (status: string) => {
    setParams(p => ({
      ...p,
      statuses: p.statuses.includes(status)
        ? p.statuses.filter(s => s !== status)
        : [...p.statuses, status]
    }));
  };

  const POLL_INTERVAL_MS = 6_000; // 6 seconds
  const MAX_POLL_ATTEMPTS = 20;   // ~5 minutes max

  const sleep = (ms: number) =>
    new Promise(resolve => setTimeout(resolve, ms));

  const extractDownloadUrl = (progress: any): string | null => {
    if (!progress || !progress.message) return null;

    const msg = progress.message;

    // Variant 1: message is already an object
    if (typeof msg === "object" && msg?.url) {
      return msg.url;
    }

    // Variant 2: message is a raw URL string
    if (typeof msg === "string" && msg.startsWith("http")) {
      return msg;
    }

    // Variant 3: message is JSON string → parse it
    if (typeof msg === "string" && msg.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(msg);
        if (parsed?.url) {
          return parsed.url;
        }
      } catch (e) {
        console.error("Failed to parse export message JSON:", msg);
      }
    }

    return null;
  };


  const normalizeProgress = (progress: any) => {
    const completed =
      typeof progress?.completedSteps === "number"
        ? progress.completedSteps
        : 0;

    const total =
      typeof progress?.totalSteps === "number" && progress.totalSteps > 0
        ? progress.totalSteps
        : null;

    const percent =
      typeof progress?.progress === "number"
        ? Math.round(progress.progress * 100)
        : total
          ? Math.round((completed / total) * 100)
          : null;

    return { completed, total, percent };
  };

  const exportExecutions = async () => {
    const pat = getPat();
    if (!pat) {
      toast.error("Authentication token not found");
      return;
    }

    try {
      // 1️⃣ Start export job
      const startResponse = await (window as any).api.invoke(
        "export-execution-overview",
        {
          pat,
          env: getEnv(),
          zqlQuery: zqlQuery.replace(
            `ORDER BY summary ASC, fixVersion ASC`,
            ``
          )
        }
      );

      const exportId = startResponse?.jobProgressToken;
      if (!exportId) {
        throw new Error("Export job token not received");
      }

      toast.loading("Export started…", { id: "export-progress" });

      // 2️⃣ Poll for progress
      for (let attempt = 1; attempt <= MAX_POLL_ATTEMPTS; attempt++) {
        const progress = await (window as any).api.invoke(
          "export-execution-progress",
          {
            pat,
            env: getEnv(),
            export_id: exportId
          }
        );

        const { completed, total, percent } = normalizeProgress(progress);

        toast.loading(
          percent !== null
            ? `Exporting… ${percent}% (step ${completed}/${total})`
            : "Exporting… preparing job",
          { id: "export-progress" }
        );

        // ✅ Completion condition
        if (
          typeof progress?.completedSteps === "number" &&
          typeof progress?.totalSteps === "number" &&
          progress.completedSteps >= progress.totalSteps
        ) {
          const downloadUrl = extractDownloadUrl(progress);

          if (downloadUrl) {
            toast.success("Textcase execution data exported successfully!", {
              id: "export-progress"
            });

            toast.dismiss("export-progress");

            navigate(
              `/execution-analysis?file_url=${encodeURIComponent(downloadUrl)}`
            );
            return;
          }
          // Completed but URL not attached yet → wait one more poll
        }

        if (attempt < MAX_POLL_ATTEMPTS) {
          await sleep(POLL_INTERVAL_MS);
        }
      }

      toast.error(
        "Export completed but file is not ready yet. Please try again shortly.",
        { id: "export-progress" }
      );
    } catch (err: any) {
      console.error("Export failed:", err);
      toast.error(`Export failed: ${err.message}`, {
        id: "export-progress"
      });
    }
  };



  return (
    <div className="flex flex-col w-full h-full overflow-y-auto p-4 pb-10">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-pink-900 flex items-center gap-2">
            <FiDatabase className="text-pink-600" />
            Zephyr Execution Overview
          </h2>
          <p className="text-sm text-pink-400">
            View and manage Zephyr test case executions directly from Logalyzer.
          </p>
        </div>

        <button onClick={exportExecutions} className="mb-4 px-4 py-1.5 bg-pink-600 cursor-pointer text-white rounded-lg flex items-center gap-2 hover:bg-pink-700 transition-all w-fit">
          <FaUpload className="inline mr-2" />
          Export
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-6 mb-6">
        <StaticLabel label="Project" value={PROJECT_KEY} />

        <FilterSelect
          label="Version"
          fieldName="fixVersion"
          value={params.version}
          onChange={v => setParams(p => ({ ...p, version: v }))}
        />

        <FilterSelect
          label="Cycle"
          fieldName="cycleName"
          value={params.cycle}
          extraParams={{ fixVersion: params.version }}
          onChange={v => setParams(p => ({ ...p, cycle: v }))}
        />

        <FilterSelect
          label="Folder"
          fieldName="folderName"
          value={params.folder}
          extraParams={{ fixVersion: params.version }}
          onChange={v => setParams(p => ({ ...p, folder: v }))}
        />
      </div>

      {/* Execution Status Multi-select */}
      {result && result?.executionStatuses?.length > 0 && (
        <ExecutionStatusMultiSelect
          statuses={result!.executionStatuses}
          selected={params.statuses}
          onToggle={toggleStatus}
        />
      )}

      {/* States */}
      {isLoading && <p className="text-pink-500 mt-6">Loading executions…</p>}

      {isError && (
        <p className="text-red-500 mt-6">{error.message}</p>
      )}

      {!isLoading && result && (
        <>
          <CustomTable data={(result as QueryResult | undefined)?.executions || []} rowKey="id" tooltip="issueSummary" renderField={{ status: (_, row: Record<string, any>) => (<span style={{ backgroundColor: row.status?.color || "#999", color: "white", padding: "2px 6px", borderRadius: "4px", fontSize: "12px" }} > {row.status?.name || "Unknown"} </span>) }} skipFields={["id", "orderId", "cycleId", "issueId", "projectId", "projectAvatarId", "versionId", "folderId", "executionStatus", "customFields", "issueDescription", "labels", "components", "executionDefects", "stepDefects", "testDefectsUnMasked", "stepDefectsUnMasked", "executedByUserName", "assigneeUserName", "executionDefectCount", "stepDefectCount", "totalDefectCount", "comment", "htmlComment", "executedBy", "issueSummary", "canViewIssue", "priority", "project"]} />

          {/* Pagination */}
          <div className="flex justify-between items-center mt-5">
            <p className="text-sm text-gray-600">
              Showing <b>{fromRecord}</b>–<b>{toRecord}</b> of{" "}
              <b>{totalCount}</b> (Page {currentPage} of {totalPages})
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setOffset(Math.max(0, offset - MAX_RECORDS))}
                disabled={offset === 0}
                className="px-4 py-1.5 bg-pink-600 cursor-pointer text-white rounded disabled:bg-gray-400"
              >
                Previous
              </button>

              <button
                onClick={() => setOffset(offset + MAX_RECORDS)}
                disabled={currentPage >= totalPages}
                className="px-4 py-1.5 bg-pink-600 cursor-pointer text-white rounded disabled:bg-gray-400"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TextExecutionOverview;

/* ------------------------------------------------------------------ */
/* -------------------------- SUB COMPONENTS -------------------------- */
/* ------------------------------------------------------------------ */

const StaticLabel = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center gap-2">
    <span className="font-bold text-pink-800">{label}:</span>
    <span className="text-pink-600">{value}</span>
  </div>
);

/* ----------------------- Filter Select ----------------------- */

const FilterSelect = ({
  label,
  fieldName,
  value,
  onChange,
  extraParams = {}
}: {
  label: string;
  fieldName: string;
  value: string;
  onChange: (v: string) => void;
  extraParams?: Record<string, any>;
}) => {
  const getEnv = () => localStorage.getItem("environment") || "prod";
  const getPat = () => localStorage.getItem("pat");

  const { data } = useQuery<AutocompleteItem[], Error>({
    queryKey: ["autocomplete", fieldName, extraParams],
    queryFn: async () => {
      const pat = getPat();
      if (!pat) return [];

      const res = await (window as any).api.invoke(
        "fetch-execution-autocomplete",
        {
          pat,
          env: getEnv(),
          params: {
            project: PROJECT_KEY,
            fieldName,
            fieldValue: "",
            maxResults: -1,
            ...extraParams
          }
        }
      );
      return (res.results || []) as AutocompleteItem[];
    },
    staleTime: 300_000
  });

  return (
    <div className="flex items-center gap-2">
      <span className="font-bold text-pink-800">{label}:</span>
      <select
        className="border border-pink-300 rounded px-2 py-1"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        <option value="">- Select {label} -</option>
        {data?.map(item => (
          <option key={item.value} value={item.value}>
            {item.displayName}
          </option>
        ))}
      </select>
    </div>
  );
};

/* ------------------ Execution Status Multi-select ------------------ */

const ExecutionStatusMultiSelect = ({
  statuses,
  selected,
  onToggle
}: {
  statuses: Status[];
  selected: string[];
  onToggle: (s: string) => void;
}) => (
  <div className="flex items-start gap-3 mb-4">
    <span className="font-bold text-pink-800 mt-1">
      Execution Status:
    </span>

    <div className="flex flex-wrap gap-2 max-w-[700px]">
      {statuses.map(status => {
        const active = selected.includes(status.name);
        return (
          <button
            key={status.id}
            onClick={() => onToggle(status.name)}
            className="px-3 py-1 text-xs font-medium rounded-full border transition cursor-pointer"
            style={{
              backgroundColor: active ? status.color : "white",
              color: active ? "white" : "#333",
              borderColor: status.color
            }}
          >
            {status.name}
          </button>
        );
      })}
    </div>
  </div>
);
