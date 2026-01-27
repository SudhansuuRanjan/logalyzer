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

const CustomTable: React.FC<TableProps> = ({
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

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
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
  }, [data, sortConfig]);

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

  return (
    <div className="table-container mt-5 bg-pink-50 w-full overflow-x-auto border border-pink-200 rounded-lg">
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
                <td
                  key={`prepend-${key}-${idx}`}
                  className="py-2.5 px-4 border-b border-pink-200 text-gray-800"
                >
                  {render(row, idx)}
                </td>
              ))}
              {headers.map((key) => (
                <td
                  key={key}
                  className="py-2.5 px-4 border-b border-pink-200 text-gray-800 min-w-[8rem]"
                >
                  {renderField[key]
                    ? renderField[key](row[key], row)
                    : String(row[key] ?? "-")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {sortedData.length === 0 && (
        <p className="text-center py-4 text-pink-400">No records found.</p>
      )}
    </div>
  );
};

export default CustomTable;
