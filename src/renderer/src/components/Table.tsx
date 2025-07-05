import React, { useState, useMemo } from "react";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";

interface TableProps {
  data: Record<string, any>[];
  renderField?: {
    [key: string]: (value: any, row: Record<string, any>) => React.ReactNode;
  };
  rowKey?: string;
  skipFields?: string[];
  prependFields?: {
    key: string;
    label: string;
    render: (row: Record<string, any>, index: number) => React.ReactNode;
  }[];
  tooltip: string;
}

const Table: React.FC<TableProps> = ({
  data,
  renderField = {},
  rowKey = "id",
  skipFields = [],
  prependFields = [],
  tooltip
}) => {
  const headers = data.length > 0
    ? Object.keys(data[0]).filter((key) => !skipFields.includes(key))
    : [];

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchField, setSearchField] = useState<string>("");

  const filteredData = useMemo(() => {
    if (!searchKeyword.trim()) return data;

    const keyword = searchKeyword.toLowerCase();

    return data.filter(row => {
      if (searchField) {
        const value = row[searchField];
        return value != null && String(value).toLowerCase().includes(keyword);
      }
      return headers.some(key =>
        String(row[key] ?? "").toLowerCase().includes(keyword)
      );
    });
  }, [data, headers, searchKeyword, searchField]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      const aStr = typeof aVal === "string" ? aVal.toLowerCase() : aVal;
      const bStr = typeof bVal === "string" ? bVal.toLowerCase() : bVal;

      if (aStr < bStr) return sortConfig.direction === "asc" ? -1 : 1;
      if (aStr > bStr) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const toggleSort = (key: string) => {
    if (sortConfig?.key === key) {
      setSortConfig({
        key,
        direction: sortConfig.direction === "asc" ? "desc" : "asc",
      });
    } else {
      setSortConfig({ key, direction: "asc" });
    }
  };

  const highlightKeyword = (value: any): React.ReactNode => {
    if (!searchKeyword || typeof value !== "string") return String(value);

    const parts = value.split(new RegExp(`(${searchKeyword})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === searchKeyword.toLowerCase() ? (
            <mark key={i} className="bg-pink-200 rounded px-1 text-pink-900">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  return (
    <div className="table-container mt-5 bg-pink-50 w-full overflow-x-auto border border-pink-200 rounded-lg p-4">
      {/* 🔍 Search */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between mb-4">
        <input
          type="text"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          placeholder="Search Keyword..."
          className="px-3 py-2 border-2 border-pink-300 bg-white text-pink-800 outline-pink-800 rounded-md w-full max-w-sm sm:w-1/2"
        />
        <select
          value={searchField}
          onChange={(e) => setSearchField(e.target.value)}
          className="px-3 py-2 border-2 border-pink-300 bg-white text-pink-800 rounded-md w-full sm:w-1/3"
        >
          <option value="">All Fields</option>
          {headers.map((key) => (
            <option key={key} value={key}>
              {key.toLocaleUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Result count */}
      <div className="flex gap-2 mb-3">
        <p className="font-medium text-pink-900">Total Results:</p>
        <p className="text-pink-700">{sortedData.length}</p>
      </div>

      {/* 📋 Table */}
      <table className="w-full text-sm bg-white border border-pink-200 rounded-md">
        <thead>
          <tr className="bg-pink-100 text-gray-900 font-medium">
            {prependFields.map(({ key, label }) => (
              <th
                key={`prepend-${key}`}
                className="py-3 px-4 border-b border-pink-300 text-left capitalize"
              >
                {label}
              </th>
            ))}
            {headers.map((header) => (
              <th
                key={header}
                className="py-3 px-4 border-b border-pink-300 text-left capitalize cursor-pointer select-none"
                onClick={() => toggleSort(header)}
              >
                <div className="flex items-center gap-1">
                  {header}
                  {sortConfig?.key === header && (
                    <span className="text-sm text-pink-600">
                      {sortConfig.direction === "asc" ? <FaArrowUp /> : <FaArrowDown />}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, idx) => (
            <tr
              title={row[tooltip]}
              key={row[rowKey] ?? idx}
              className="hover:bg-pink-100 transition"
            >
              {prependFields.map(({ key, render }) => (
                <td key={`prepend-${key}-${idx}`} className="py-2.5 px-4 border-b border-pink-200 text-gray-800">
                  {render(row, idx)}
                </td>
              ))}
              {headers.map((key) => (
                <td key={key} className="py-2.5 px-4 border-b border-pink-200 text-gray-800 min-w-[8rem]">
                  {renderField[key]
                    ? renderField[key](row[key], row)
                    : highlightKeyword(row[key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* No data */}
      {sortedData.length === 0 && (
        <p className="text-center py-4 text-pink-400">No matching records found.</p>
      )}
    </div>
  );
};

export default Table;
