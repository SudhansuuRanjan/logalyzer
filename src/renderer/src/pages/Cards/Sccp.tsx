import { FaCopy } from "react-icons/fa";
import CodeEditor from "@renderer/components/CodeEditor";
import { useState } from "react"
import toast from "react-hot-toast";

const Sccp = () => {
    const [cardLoc, setCardLoc] = useState<Number>(1101);
    const [cardType, setCardType] = useState("slic");
    const [ipAddressA, setIpAddressA] = useState("");
    const [ipAddressB, setIpAddressB] = useState("");
    const [defrouter, setDefrouter] = useState("192.168.120.250");
    const [generatedCmds, setGeneratedCmds] = useState("");

    const generateCmds = () => {
        if (!cardLoc || !cardType || !defrouter) {
            toast.error("Please fill in all fields.");
            return;
        }

        if (cardType !== "slic" && cardType !== "dsm") {
            toast.error("Invalid card type. Please select either 'slic' or 'dsm'.");
            return;
        }

        if (ipAddressA === "" && ipAddressB === "") {
            toast.error("Please provide at least one IP address.");
            return;
        }

        let cmds = `ent-card:loc=${cardLoc}:appl=vsccp:type=${cardType}${ipAddressA && `\nchg-ip-lnk:port=a:loc=${cardLoc}:ipaddr=${ipAddressA}:submask=255.255.255.0:speed=1000:duplex=full:auto=no:mcast=yes`}${ipAddressB && `\nchg-ip-lnk:port=b:loc=${cardLoc}:ipaddr=${ipAddressB}:submask=255.255.255.0:speed=1000:duplex=full:auto=no:mcast=yes`}
chg-ip-card:loc=${cardLoc}:defrouter=${defrouter}
alw-card:loc=${cardLoc}`;

        setGeneratedCmds(cmds);
        toast.success("Commands generated successfully!");
    }

    return (
        <div className="flex flex-col p-8 w-full max-w-full h-full overflow-y-auto">
            <h1 className="text-3xl font-bold text-pink-950 text-center">SCCP Card</h1>
            <p className="max-w-xl text-pink-900/60 text-center my-2 m-auto">
                Generate SCCP card commands by specifying the card location.
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
                        <label className="block font-medium text-sm mb-2">Card Type</label>
                        <select
                            className="w-full mb-1 p-2 rounded border border-pink-300"
                            name="card_type"
                            value={cardType}
                            onChange={(e) => {
                                setCardType(e.target.value);
                            }}
                        > 
                            <option value="">Select Card Type</option>
                            <option value="slic">SLIC</option>
                            <option value="dsm">DSM</option>
                        </select>
                    </div>

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
                </div>

                <div className="flex gap-4 mt-4 items-center">
                    <div className="w-full">
                        <label className="block font-medium text-sm mb-2">IP Address A</label>
                        <input
                            type="text"
                            className="w-full mb-1 p-2 rounded border border-pink-300"
                            placeholder="Enter IP address..."
                            name="ip_address"
                            value={ipAddressA}
                            onChange={(e) => setIpAddressA(e.target.value)}
                        />
                    </div>

                    <div className="w-full">
                        <label className="block font-medium text-sm mb-2">IP Address B</label>
                        <input
                            type="text"
                            className="w-full mb-1 p-2 rounded border border-pink-300"
                            placeholder="Enter IP address..."
                            name="ip_address"
                            value={ipAddressB}
                            onChange={(e) => setIpAddressB(e.target.value)}
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

export default Sccp;