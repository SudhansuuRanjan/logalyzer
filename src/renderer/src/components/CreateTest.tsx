import React, { useState } from 'react';
import { FiPlus, FiCheck, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

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
    { label: "Test", value: "11500" }
];

const CreateTest = ({ setShowCreateTestModal, selectedEpicKey, onSuccess, selectedStoryKey }: { setShowCreateTestModal: (show: boolean) => void; selectedEpicKey: string | null; onSuccess?: () => void; selectedStoryKey: string | null }) => {
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

            let payloadToSend = { ...formData };
            payloadToSend.customFields = {
                // issuelinks: "issuelinks",
                // "issuelinks-linktype": "is covered by",
                // "issuelinks-issues": selectedStoryKey,
                "customfield_15804": JSON.stringify({ "type": "opt", "issueaction": "new", "stepaction": "noChange", "data": {} }),
            }

            toast.loading("Creating Test...", { id: "create-progress" });

            const createdTest = await (window as any).api.invoke("create-issue", {
                payload: payloadToSend,
                pat: getPat(),
                env: getEnv()
            });

            toast.loading(`Test created with key ${createdTest.key} and Linked...`, { id: "create-progress" });

            setSuccess(true);
            setFormData({
                projectId: PROJECT_ID,
                issueTypeId: '',
                summary: '',
                description: '',
                priorityId: '',
                customFields: {}
            });
            setShowCreateTestModal(false);
            onSuccess?.();
            toast.dismiss("export-progress");
        } catch (err: any) {
            setError("Check console for Jira error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xl border border-pink-100 transform animate-in zoom-in-95 duration-200">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <FiPlus /> Create Jira Issue
                </h2>

                {success && (
                    <div className="mb-4 p-2 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center gap-2">
                        <FiCheck className="w-5 h-5" />
                        Issue created successfully!
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-2">
                        <FiX className="w-5 h-5" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
                    <div className="flex gap-2">
                        <div className="space-y-1">
                            <label htmlFor="project" className="block text-sm font-medium text-gray-700">
                                Project
                            </label>
                            <input
                                id="project"
                                disabled
                                value={`${PROJECT_LABEL} (${PROJECT_ID})`}
                                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500"
                            />
                        </div>

                        {selectedEpicKey && <div className="space-y-1">
                            <label htmlFor="key" className="block text-sm font-medium text-gray-700">
                                Epic Key
                            </label>
                            <input
                                id="key"
                                disabled
                                value={selectedEpicKey}
                                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500"
                            />
                        </div>}

                        {selectedStoryKey && <div className="space-y-1">
                            <label htmlFor="key" className="block text-sm font-medium text-gray-700">
                                Story Key
                            </label>
                            <input
                                id="key"
                                disabled
                                value={selectedStoryKey}
                                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500"
                            />
                        </div>}
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
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        >
                            <option value="">Select type</option>
                            {(selectedEpicKey ? ISSUE_TYPES.filter(t => t.label === "Test") : ISSUE_TYPES).map(t => (
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
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-vertical"
                        />
                    </div>

                    <div className='flex gap-3'>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                setShowCreateTestModal(false);
                            }}
                            className="w-full p-2 cursor-pointer bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full p-2 bg-pink-600 cursor-pointer hover:bg-pink-700 disabled:bg-pink-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    Creating...
                                </>
                            ) : (
                                "Create Issue"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTest;
