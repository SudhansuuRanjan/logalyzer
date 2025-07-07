import { FaCopy } from "react-icons/fa";
import CodeEditor from "../../components/CodeEditor"
import { useState } from "react"

const Replicator = () => {

    const [stringToReplicate, setStringToReplicate] = useState("");
    const [startValue, setStartValue] = useState(0);
    const [endValue, setEndValue] = useState(0);
    const [stepValue, setStepValue] = useState(1);
    const [replicatedString, setReplicatedString] = useState("");

    const handleReplicate = () => {
        if (!stringToReplicate) {
            return;
        }
        if (startValue >= endValue) {
            return;
        }
        if (stepValue <= 0) {
            return;
        }

        let result = "";
        for (let i = startValue; i <= endValue; i += stepValue) {
            result += stringToReplicate.replace(/xxx/g, i.toString()) + "\n";
        }
        setReplicatedString(result.trim());
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        switch (name) {
            case "stringToReplicate":
                setStringToReplicate(value);
                break;
            case "startValue":
                setStartValue(Number(value));
                break;
            case "endValue":
                setEndValue(Number(value));
                break;
            case "stepValue":
                setStepValue(Number(value));
                break;
            default:
                break;
        }
    }

    return (
        <div className="flex flex-col p-8 w-full max-w-full h-full overflow-y-auto">
            <h1 className="text-3xl font-bold text-pink-950 text-center">Replicator</h1>
            <p className="max-w-xl text-pink-900/60 text-center my-2 m-auto">
                Replicate a string with custom iteration.
            </p>

            <form className="mt-0">
                <div>
                    <label className="block font-medium text-sm mb-2">String to replicate:</label>
                    <input
                        type="text"
                        className="w-full mb-1 p-2 rounded border border-pink-300"
                        placeholder="Enter string here..."
                        name="stringToReplicate"
                        value={stringToReplicate}
                        onChange={handleChange}
                    />
                    <p className="mb-3 text-green-800">Put xxx as the wildcard value.</p>
                </div>

                <div className="flex justify-between gap-3 items-center mb-4">
                    <div className="w-full">
                        <label className="block font-medium text-sm mb-2">Start Value</label>
                        <input
                            type="number"
                            className="w-full mb-4 p-1.5 rounded border border-pink-300"
                            placeholder="Enter start value..."
                            name="startValue"
                            value={startValue}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="w-full">
                        <label className="block font-medium text-sm mb-2">End Value</label>
                        <input
                            type="number"
                            className="w-full mb-4 p-1.5 rounded border border-pink-300"
                            placeholder="Enter end value..."
                            name="endValue"
                            value={endValue}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="w-full">
                        <label className="block font-medium text-sm mb-2">Step Value</label>
                        <input
                            type="number"
                            className="w-full mb-4 p-1.5 rounded border border-pink-300"
                            placeholder="Enter step value..."
                            name="stepValue"
                            value={stepValue}
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="button"
                        className="w-full bg-pink-600 mt-3 text-white py-1.5 rounded hover:bg-pink-700 transition-colors"
                        onClick={handleReplicate}
                    >
                        Replicate
                    </button>
                </div>
            </form>

            <div className="p-3 bg-pink-50 rounded-lg w-full m-auto shadow mt-2">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h2 className="text-lg font-semibold text-pink-900 mb-1">Replicated Output:</h2>
                        <p className="text-sm text-pink-800 mb-2">
                            The replicated string will replace "xxx" with the current iteration value.
                        </p>
                    </div>
                    <button
                        className="cursor-pointer text-pink-800/70 px-3 text-xl py-1 rounded active:text-pink-800/50 transition-colors mb-4"
                        onClick={() => {
                            navigator.clipboard.writeText(replicatedString);
                        }}
                    >
                        <FaCopy />
                    </button>
                </div>
                <CodeEditor value={replicatedString} />
            </div>
        </div>
    )
}

export default Replicator