import { FaCopy } from "react-icons/fa";
import CodeEditor from "@renderer/components/CodeEditor";
import { useState } from "react"

const Replicator = () => {
    const [cardLoc, setCardLoc] = useState<Number>(1101);
    const [ipAddress, setIpAddress] = useState("");
    const [sflog, setSflog] = useState("no");
    const [defrouter, setDefrouter] = useState("");
    const [startTerminal, setStartTerminal] = useState("17");
    const [generatedCmds, setGeneratedCmds] = useState("");

    const generateCmds = () => {
        if (!cardLoc || !ipAddress || !defrouter) {
            alert("Please fill in all fields.");
            return;
        }

        let cmds = `ent-card:loc=${cardLoc}:appl=ips:type=ipsm${sflog === "yes" ? ":sflog=yes" : ""}
chg-ip-lnk:port=a:loc=${cardLoc}:ip=${ipAddress}:submask=255.255.255.0:speed=100:duplex=full:auto=no:mcast=no
ent-ip-host:host=ipsm${cardLoc}a:ipaddr=${ipAddress}:type=local
chg-ip-card:loc=${cardLoc}:defrouter=${defrouter}
alw-card:loc=${cardLoc}`;

        if (startTerminal !== "none") {
            cmds += `\n\n`;
            for (let index = 0; index < 8; index++) {
                cmds += `alw-trm:trm=${Number(startTerminal) + index}\n`;
            }
        }

        setGeneratedCmds(cmds);
    }

    return (
        <div className="flex flex-col p-8 w-full max-w-full h-full overflow-y-auto">
            <h1 className="text-3xl font-bold text-pink-950 text-center">IPSM Card</h1>
            <p className="max-w-xl text-pink-900/60 text-center my-2 m-auto">
                Generate IPSM card commands by specifying the card location.
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

                    <div className="w-full">
                        <label className="block font-medium text-sm mb-2">Sflog</label>
                        <select
                            className="w-full mb-1 p-2 rounded border border-pink-300"
                            name="sflog"
                            value={sflog}
                            onChange={(e) => {
                                // if sflog is set to "yes", set terminal to None
                                if (e.target.value === "yes") {
                                    setStartTerminal("none");
                                    setSflog(e.target.value);
                                }else{
                                    if (e.target.value === "no") {
                                        setSflog(e.target.value);
                                    }
                                    // if sflog is set to "no", set terminal to 17
                                    setStartTerminal("17");
                                }
                            }}
                        >
                            <option value="no">No</option>
                            <option value="yes">Yes</option>
                        </select>
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

                    <div className="w-full">
                        <label className="block font-medium text-sm mb-2">Start Terminal</label>
                        <select
                            className="w-full mb-1 p-2 rounded border border-pink-300"
                            name="start_terminal"
                            value={startTerminal}
                            onChange={(e) => setStartTerminal(e.target.value)}
                        >
                            <option value="17">17</option>
                            <option value="25">25</option>
                            <option value="33">33</option>
                            <option value="none">None</option>
                        </select>
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

export default Replicator