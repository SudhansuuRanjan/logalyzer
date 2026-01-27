import React, { useState } from 'react';
import { FiPlus, FiCheck, FiX } from 'react-icons/fi';

type CreateIssuePayload = {
  projectId: string;
  issueTypeId: string;
  summary: string;
  description?: string;
  priorityId?: string;
  customFields?: Record<string, any>;
};

const PROJECT_ID = "37901";
const PROJECT_LABEL = "DSRQA";

const ISSUE_TYPES = [
  { label: "Epic", value: "6" },
  { label: "Story", value: "7" },
  { label: "Test", value: "11500" }
];

const CreateIssue = () => {
  const [formData, setFormData] = useState<CreateIssuePayload>({
    projectId: PROJECT_ID,
    issueTypeId: '',
    summary: '',
    description: '',
    priorityId: '',
    customFields: {}
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const getEnv = () => localStorage.getItem("environment") || "stage";
  const getPat = () => localStorage.getItem("pat");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!getPat()) {
      setError("PAT not found");
      return;
    }

    if (!formData.issueTypeId || !formData.summary) {
      setError("Issue Type and Summary required");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      await (window as any).api.invoke("create-issue", {
        payload: formData,
        pat: getPat(),
        env: getEnv()
      });

      setSuccess(true);
      setFormData({
        projectId: PROJECT_ID,
        issueTypeId: '',
        summary: '',
        description: '',
        priorityId: '',
        customFields: {}
      });
    } catch (err: any) {
      setError("Check console for Jira error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-full p-4">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <FiPlus /> Create Jira Issue
      </h2>

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center gap-2">
          <FiCheck className="w-5 h-5" />
          Issue created successfully!
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-2">
          <FiX className="w-5 h-5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">

        <div className="space-y-1">
          <label htmlFor="project" className="block text-sm font-medium text-gray-700">
            Project
          </label>
          <input
            id="project"
            disabled
            value={`${PROJECT_LABEL} (${PROJECT_ID})`}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="issueTypeId" className="block text-sm font-medium text-gray-700">
            Issue Type *
          </label>
          <select
            id="issueTypeId"
            name="issueTypeId"
            value={formData.issueTypeId}
            onChange={handleInputChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="">Select type</option>
            {ISSUE_TYPES.map(t => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="summary" className="block text-sm font-medium text-gray-700">
            Summary *
          </label>
          <input
            id="summary"
            name="summary"
            value={formData.summary}
            onChange={handleInputChange}
            placeholder="Enter a brief summary of the issue"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            required
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Provide a detailed description of the issue"
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-vertical"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="customFields" className="block text-sm font-medium text-gray-700">
            Custom Fields (JSON)
          </label>
          <textarea
            id="customFields"
            value={JSON.stringify(formData.customFields, null, 2)}
            onChange={(e) => {
              try {
                const parsed = e.target.value
                  ? JSON.parse(e.target.value)
                  : {};
                setFormData(prev => ({
                  ...prev,
                  customFields: parsed
                }));
              } catch {}
            }}
            placeholder='Example: {"customfield_10903": "Epic Name", "customfield_10010": "Priority Value"}'
            rows={6}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-vertical font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">Enter custom fields in JSON format. Invalid JSON will be ignored.</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 bg-pink-600 hover:bg-pink-700 disabled:bg-pink-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              Creating...
            </>
          ) : (
            "Create Issue"
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateIssue;