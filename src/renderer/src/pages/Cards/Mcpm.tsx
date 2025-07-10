import { FaCopy } from "react-icons/fa";
import CodeEditor from "@renderer/components/CodeEditor";
import { useState } from "react"
import toast from "react-hot-toast";

const Mcpm = () => {
    const [cardLoc, setCardLoc] = useState<Number>(1101);
    const [ipAddress, setIpAddress] = useState("");
    const [defrouter, setDefrouter] = useState("");
    const [generatedCmds, setGeneratedCmds] = useState("");

    const generateCmds = () => {
        if (!cardLoc || !ipAddress || !defrouter) {
            toast.error("Please fill in all fields.");
            return;
        }

        let cmds = `ent-card:loc=${cardLoc}:appl=mcp:type=mcpm
chg-ip-lnk:port=a:loc=${cardLoc}:ipaddr=${ipAddress}:submask=255.255.255.0:speed=100:duplex=full:auto=no:mcast=no
ent-ip-host:host=mcpm${cardLoc}a:ipaddr=${ipAddress}:type=local
chg-ip-card:loc=${cardLoc}:defrouter=${defrouter}
alw-card:loc=${cardLoc}`;
        setGeneratedCmds(cmds);
        toast.success("Commands generated successfully!");
    }

    return (
        <div className="flex flex-col p-8 w-full max-w-full h-full overflow-y-auto">
            <h1 className="text-3xl font-bold text-pink-950 text-center">MCPM Card</h1>
            <p className="max-w-xl text-pink-900/60 text-center my-2 m-auto">
                Generate MCPM card commands by specifying the card location.
            </p>

            <form className="mt-5">
                <div className="flex gap-4">
                    <div className="w-full">
                        <label className="block font-medium text-sm mb-2">Card Location</label>
                        <input
                            type="number"
                            className="w-full mb-1 p-2 rounded border border-pink-300"
                            placeholder="Enter card location..."
                            name="card_loc"
                            value={cardLoc.toString()}
                            onChange={(e) => setCardLoc(Number(e.target.value))}
                        />
                    </div>

                    <div className="w-full">
                        <label className="block font-medium text-sm mb-2">IP Address</label>
                        <input
                            type="text"
                            className="w-full mb-1 p-2 rounded border border-pink-300"
                            placeholder="Enter IP address..."
                            name="ip_address"
                            value={ipAddress}
                            onChange={(e) => setIpAddress(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex gap-4 mt-4 items-center">
                    <div className="w-full">
                        <label className="block font-medium text-sm mb-2">Defrouter</label>
                        <input
                            type="text"
                            className="w-full mb-1 p-2 rounded border border-pink-300"
                            name="defrouter"
                            placeholder="Enter default router..."
                            value={defrouter}
                            onChange={(e) => setDefrouter(e.target.value)}
                        />
                    </div>

                    <button
                        type="button"
                        className="w-full bg-pink-800/70 mt-5 text-white py-2 rounded hover:bg-pink-700 transition-colors"
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

export default Mcpm