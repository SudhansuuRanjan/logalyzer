import { FaCopy } from "react-icons/fa";
import CodeEditor from "@renderer/components/CodeEditor";
import { useState } from "react"
import toast from "react-hot-toast";

const Ipsg = () => {
    const [cardLoc, setCardLoc] = useState<Number>(1101);
    const [cardType, setCardType] = useState("slic");
    const [cardData, setCardData] = useState("nosccp");
    const [ipAddress, setIpAddress] = useState("");
    const [remoteIpAddress, setRemoteIpAddress] = useState("");
    const [defrouter, setDefrouter] = useState("");
    const [generatedCmds, setGeneratedCmds] = useState("");

    const generateCmds = () => {
        if (!cardLoc || !ipAddress || !defrouter) {
            toast.error("Please fill in all fields.");
            return;
        }

        let cmds = `ent-card:loc=${cardLoc}:appl=ipsg:type=${cardType}
chg-ip-lnk:port=a:loc=${cardLoc}:ipaddr=${ipAddress}:submask=255.255.255.0:speed=100:duplex=full:auto=no:mcast=no
ent-ip-host:host=mcpm${cardLoc}a:ipaddr=${ipAddress}:type=local
chg-ip-card:loc=${cardLoc}:defrouter=${defrouter}
alw-card:loc=${cardLoc}`;
        setGeneratedCmds(cmds);
        toast.success("Commands generated successfully!");
    }

    const inputField = (label: string, value: string, setter: (val: string) => void, name: string, default_val: string) => (
        <div className="w-full">
            <label className="block font-medium text-sm mb-2">{label}</label>
            <input
                type="text"
                className="w-full mb-1 p-2 rounded border border-pink-300"
                placeholder={`Enter ${label.toLowerCase()}...`}
                name={name}
                value={value}
                onChange={(e) => setter(e.target.value ? e.target.value : default_val ? default_val : "")}
            />
        </div>
    );

    return (
        <div className="flex flex-col p-8 w-full max-w-full h-full overflow-y-auto">
            <h1 className="text-3xl font-bold text-pink-950 text-center">IPSG Card</h1>
            <p className="max-w-xl text-pink-900/60 text-center my-2 m-auto">
                Generate IPSG card commands by specifying the card location.
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
                            <option value="enetb">ENETB</option>
                        </select>
                    </div>

                    <div className="w-full">
                        <label className="block font-medium text-sm mb-2">Card Data</label>
                        <select
                            className="w-full mb-1 p-2 rounded border border-pink-300"
                            name="card_data"
                            value={cardData}
                            onChange={(e) => {
                                setCardData(e.target.value);
                            }}
                        >
                            <option value="">Select Card Data</option>
                            <option value="nosccp">No SCCP</option>
                            <option value="gtt">GTT</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-4 mt-4 items-center">
                    {inputField("Local IP Address", ipAddress, setIpAddress, "local_ip_addr", "")}
                    {inputField("Remote IP Address", remoteIpAddress, setRemoteIpAddress, "remote_ip_addr", "")}
                    {inputField("Default Router", defrouter, setDefrouter, "def_router", "")}
                </div>

                <div className="flex gap-4 mt-4 items-center">
                    {inputField("Local IP Address", ipAddress, setIpAddress, "local_ip_addr", "")}
                    {inputField("Remote IP Address", remoteIpAddress, setRemoteIpAddress, "remote_ip_addr", "")}
                    {inputField("Default Router", defrouter, setDefrouter, "def_router", "")}

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

export default Ipsg