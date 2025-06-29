import { useState } from "react";


const Form = () => {
    const [upgLogs, setUpgLogs] = useState<any>(null);

    const openAndReadFile = async () => {
        const filePath = await window.streamFileAPI.openFileDialog();

        if (!filePath) {
            console.log('No file selected.');
            return;
        }

        let fullContent = '';

        window.streamFileAPI.readLargeFile(filePath);

        window.streamFileAPI.onFileChunk((chunk) => {
            fullContent += chunk;
        });

        window.streamFileAPI.onFileEnd((structuredLogs: any) => {
            console.log('Parsed Logs:', structuredLogs);
            setUpgLogs(structuredLogs);
            console.table(structuredLogs.sev1s_details);  // ✅ working usage
        });
        window.streamFileAPI.onFileError((err) => {
            console.error('File reading error:', err);
        });
    };



    return (
        <div className="m-auto flex flex-col w-full">
            <form className="form my-5 self-center m-auto">
                <button onClick={(e) => {
                    e.preventDefault();
                    openAndReadFile()
                }} className="file-label">

                    <div className='font-medium text-lg text-gray-800'>
                        Select Log File
                    </div>

                    <div className='text-gray-500 text-base mt-3'>
                        File Type : .txt, .log, .cap
                    </div>
                </button>
            </form>

            <p className="text-gray-500 text-sm mt-4 text-center">
                Please try pressing <code>F12</code> to open the devTool
            </p>

            {upgLogs && <div className="w-full max-w-[95%] mt-5 p-4 bg-white shadow-md rounded-lg">
                <h2 className="text-lg font-semibold mt-5">Parsed Logs</h2>
                <p className="text-gray-600 mt-2">
                    <span className="font-bold">File Name:</span> {upgLogs.logFileName}
                </p>
                <p className="text-gray-600">
                    <span className="font-bold">File Path:</span> {upgLogs.logFilePath}
                </p>
                <pre className="bg-gray-100 p-4 rounded-lg mt-2 text-wrap">
                    <code className="text-sm">
                        {JSON.stringify(upgLogs, null, 2)}
                    </code>
                </pre>
            </div>}

        </div>
    )
}

export default Form;