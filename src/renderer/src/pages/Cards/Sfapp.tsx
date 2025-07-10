import { FaCopy } from "react-icons/fa";
import CodeEditor from "@renderer/components/CodeEditor";
import { useState } from "react"
import toast from "react-hot-toast";

const Sfapp = () => {
    const [cardLoc, setCardLoc] = useState<Number>(1101);
    const [generatedCmds, setGeneratedCmds] = useState("");

    const generateCmds = () => {
        if (!cardLoc) {
            toast.error("Please fill in all fields.");
            return;
        }

        let cmds = `ent-card:loc=${cardLoc}:appl=sfapp:type=slic
alw-card:loc=${cardLoc}`;
        setGeneratedCmds(cmds);
        toast.success("Commands generated successfully!");
    }

    return (
        <div className="flex flex-col p-8 w-full max-w-full h-full overflow-y-auto">
            <h1 className="text-3xl font-bold text-pink-950 text-center">Sfapp Card</h1>
            <p className="max-w-xl text-pink-900/60 text-center my-2 m-auto">
                Generate SFAPP card commands by specifying the card location.
            </p>

            <form className="mt-5">
                <div className="flex gap-4 justify-end items-end">
                    <div className="w-full">
                        <label className="block font-medium text-sm mb-2">Card Location</label>
                        <input
                            type="number"
                            className="w-full p-2 rounded border border-pink-300"
                            placeholder="Enter card location..."
                            name="card_loc"
                            value={cardLoc.toString()}
                            onChange={(e) => setCardLoc(Number(e.target.value))}
                        />
                    </div>

                    <button
                        type="button"
                        className="w-full bg-pink-800/70 h-11 text-white py-2 rounded hover:bg-pink-700 transition-colors"
                        onClick={generateCmds}
                    >
                        Generate Commands
                    </button>
                </div>
            </form>

            <div className="p-3 bg-pink-50 rounded-lg w-full m-auto shadow mt-10">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h2 className="text-lg font-semibold text-pink-900 mb-1">Eagle Commands:</h2>
                    </div>
                    <button
                        className="cursor-pointer text-pink-800/70 px-3 text-xl py-1 rounded active:text-pink-800/50 transition-colors mb-4"
                        onClick={() => {
                            navigator.clipboard.writeText(generatedCmds);
                        }}
                    >
                        <FaCopy />
                    </button>
                </div>
                <CodeEditor value={generatedCmds} />
            </div>
        </div>
    )
}

export default Sfapp;