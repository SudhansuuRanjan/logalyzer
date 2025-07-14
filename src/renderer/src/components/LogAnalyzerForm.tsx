import { useStore } from "../store/upgLogs";
import Overview from "./Overview";
import Table from "./Table";

const Form = () => {
    const { setUpgradeLogs, upgradeLogs } = useStore();

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
            setUpgradeLogs(structuredLogs);  // Update Zustand store
            console.table(structuredLogs.sev1s_details);  // ✅ working usage
        });
        window.streamFileAPI.onFileError((err) => {
            console.error('File reading error:', err);
        });
    };



    return (
        <div className="m-auto flex flex-col w-full select-text">
            <form className="form my-10 self-center m-auto">
                <button onClick={(e) => {
                    e.preventDefault();
                    openAndReadFile()
                }} className="file-label">

                    <div className='font-medium text-lg text-pink-800'>
                        Select Log File
                    </div>

                    <div className='text-pink-500 text-base mt-3'>
                        File Type : .txt, .log, .cap
                    </div>
                </button>
            </form>

            {upgradeLogs && <><Overview logfile={upgradeLogs} />

                <Table
                    data={upgradeLogs?.sev1s_details}
                    prependFields={[
                        {
                            key: 'serial',
                            label: 'S.No',
                            render: (_, index) => index + 1,
                        },
                    ]}
                    tooltip={"sevHeader"}
                    renderField={{
                        dateTimeIST: (val) => new Date(val).toLocaleDateString(),
                    }}
                    skipFields={["sevHeader"]}
                />

                {/* <div className="w-full mt-5 p-4 bg-white shadow-md rounded-lg">
                    <h2 className="text-lg font-semibold mt-5">Parsed Logs</h2>
                    <p className="text-gray-600 mt-2">
                        <span className="font-bold">File Name:</span> {upgradeLogs.logFileName}
                    </p>
                    <p className="text-gray-600">
                        <span className="font-bold">File Path:</span> {upgradeLogs.logFilePath}
                    </p>
                    <pre className="bg-gray-100 p-4 rounded-lg mt-2 text-wrap">
                        <code className="text-sm">
                            {JSON.stringify(upgradeLogs, null, 2)}
                        </code>
                    </pre>
                </div> */}

            </>}

        </div>
    )
}

export default Form;