import { FaCopy } from "react-icons/fa";
import CodeEditor from "@renderer/components/CodeEditor";
import { useState } from "react";
import toast from "react-hot-toast";

const Deir = () => {
    const [cardLoc, setCardLoc] = useState<number>(1101);
    const [cardType, setCardType] = useState("slic");
    const [ipAddressB, setIpAddressB] = useState("");
    const [ipAddressC, setIpAddressC] = useState("");
    const [ipAddressRemoteB, setIpAddressRemoteB] = useState("");
    const [ipAddressRemoteC, setIpAddressRemoteC] = useState("");
    const [generatedCmds, setGeneratedCmds] = useState("");
    const [start_lport, setStart_lport] = useState(2032);
    const [start_rport, setStart_rport] = useState(3042);
    const [numofLinks, setNumOfLinks] = useState(32);

    const generateCmds = () => {
        if (!cardLoc || !cardType) {
            toast.error("Please fill in all fields.");
            return;
        }

        if (cardType !== "slic" && cardType !== "dsm") {
            toast.error("Invalid card type. Please select either 'slic' or 'dsm'.");
            return;
        }

        if (ipAddressB === "" && ipAddressC === "") {
            toast.error("Please provide at least one IP address for B or C. (Network)");
            return;
        }

        // if ipaddressB is specified, then remoteB is required
        if (ipAddressB && ipAddressRemoteB === "") {
            toast.error("Please provide a remote IP address for B.");
            return;
        }

        // if ipaddressC is specified, then remoteC is required
        if (ipAddressC && ipAddressRemoteC === "") {
            toast.error("Please provide a remote IP address for C.");
            return;
        }

        const allowAssoc = (
            b_included: boolean,
            c_included: boolean,
            num_links: number,
            cardLoc: number
        ): string => {
            let cmds = "";

            if (b_included && !c_included) {
                for (let i = 0; i < num_links; i++) {
                    cmds += `CHG-ASSOC:ANAME=ASSOC${cardLoc}b${i + 1}:ALW=YES:OPEN=YES\n`;
                }

            } else if (c_included && !b_included) {
                for (let i = 0; i < num_links; i++) {
                    cmds += `CHG-ASSOC:ANAME=ASSOC${cardLoc}c${i + 1}:ALW=YES:OPEN=YES\n`;
                }

            } else if (b_included && c_included) {
                const halfB = Math.floor(num_links / 2);
                const halfC = num_links - halfB;

                for (let i = 0; i < halfB; i++) {
                    cmds += `CHG-ASSOC:ANAME=ASSOC${cardLoc}b${i + 1}:ALW=YES:OPEN=YES\n`;
                }

                for (let i = 0; i < halfC; i++) {
                    cmds += `CHG-ASSOC:ANAME=ASSOC${cardLoc}c${i + 1}:ALW=YES:OPEN=YES\n`;
                }
            }

            return cmds.trim();
        };



        const generateDiametercmds = (
            b_included: boolean,
            c_included: boolean,
            card_loc: number,
            start_lport: number,
            start_rport: number,
            num_of_links: number
        ): string => {
            let cmds = "";

            if (b_included && !c_included) {
                for (let i = 0; i < num_of_links; i++) {
                    cmds += `ENT-ASSOC:ANAME=ASSOC${card_loc}b${i + 1}:LHOST=eir${card_loc}b:LPORT=${start_lport + i}:RHOST=mme01:RPORT=${start_rport + i}\n`;
                }

                cmds += "\n";

                for (let i = 0; i < num_of_links; i++) {
                    cmds += `ENT-DCONN:DCNAME=DCON${card_loc}b${i + 1}:ANAME=ASSOC${card_loc}b${i + 1}\n`;
                }

            } else if (c_included && !b_included) {
                for (let i = 0; i < num_of_links; i++) {
                    cmds += `ENT-ASSOC:ANAME=ASSOC${card_loc}c${i + 1}:LHOST=eir${card_loc}c:LPORT=${start_lport + i}:RHOST=mme02:RPORT=${start_rport + i}\n`;
                }

                cmds += "\n";

                for (let i = 0; i < num_of_links; i++) {
                    cmds += `ENT-DCONN:DCNAME=DCON${card_loc}c${i + 1}:ANAME=ASSOC${card_loc}c${i + 1}\n`;
                }

            } else if (b_included && c_included) {
                const totalLinksB = Math.floor(num_of_links / 2);
                const totalLinksC = num_of_links - totalLinksB;

                for (let i = 0; i < totalLinksB; i++) {
                    cmds += `ENT-ASSOC:ANAME=ASSOC${card_loc}b${i + 1}:LHOST=eir${card_loc}b:LPORT=${start_lport + i}:RHOST=mme01:RPORT=${start_rport + i}\n`;
                }

                for (let i = 0; i < totalLinksC; i++) {
                    cmds += `ENT-ASSOC:ANAME=ASSOC${card_loc}c${i + 1}:LHOST=eir${card_loc}c:LPORT=${start_lport + i + totalLinksB}:RHOST=mme02:RPORT=${start_rport + i + totalLinksB}\n`;
                }

                cmds += "\n";

                for (let i = 0; i < totalLinksB; i++) {
                    cmds += `ENT-DCONN:DCNAME=DCON${card_loc}b${i + 1}:ANAME=ASSOC${card_loc}b${i + 1}\n`;
                }

                for (let i = 0; i < totalLinksC; i++) {
                    cmds += `ENT-DCONN:DCNAME=DCON${card_loc}c${i + 1}:ANAME=ASSOC${card_loc}c${i + 1}\n`;
                }
            }

            return cmds.trim();
        };


        let cmds = `ent-card:loc=${cardLoc}:type=${cardType}:appl=deirhc
${ipAddressB && `CHG-IP-LNK:PORT=b:SUBMASK=255.255.255.0:IPADDR=${ipAddressB}:LOC=${cardLoc}:speed=100:duplex=full:auto=no`}
${ipAddressC && `CHG-IP-LNK:PORT=c:SUBMASK=255.255.255.0:IPADDR=${ipAddressC}:LOC=${cardLoc}:speed=100:duplex=full:auto=no`}

${ipAddressB && `ENT-IP-HOST:HOST=eir${cardLoc}b:IPADDR=${ipAddressB}:TYPE=LOCAL:REALM=s13eir.com`}
${ipAddressC && `ENT-IP-HOST:HOST=eir${cardLoc}c:IPADDR=${ipAddressC}:TYPE=LOCAL:REALM=s13eir.com`}

${ipAddressRemoteB && `ENT-IP-HOST:HOST=mme01:IPADDR=${ipAddressRemoteB}:TYPE=remote:REALM=TEKELEC.COM`}
${ipAddressRemoteC && `ENT-IP-HOST:HOST=mme02:IPADDR=${ipAddressRemoteC}:TYPE=remote:REALM=TEKELEC.COM`}

${generateDiametercmds(!!ipAddressB, !!ipAddressC, cardLoc, 2032, 3042, numofLinks)}

alw-card:loc=${cardLoc}

${allowAssoc(!!ipAddressB, !!ipAddressC, numofLinks, cardLoc)}

`;



        cmds = cmds.split("\n").filter(line => line.trim() !== "").join("\n");
        setGeneratedCmds(cmds.toLowerCase());
        toast.success("Commands generated successfully!");
    };

    const inputField = (label: string, value: string, setter: (val: string) => void, name: string) => (
        <div className="w-full">
            <label className="block font-medium text-sm mb-2">{label}</label>
            <input
                type="text"
                className="w-full mb-1 p-2 rounded border border-pink-300"
                placeholder={`Enter ${label.toLowerCase()}...`}
                name={name}
                value={value}
                onChange={(e) => setter(e.target.value)}
            />
        </div>
    );

    const showCD = cardType !== "dsm";

    return (
        <div className="flex flex-col p-8 w-full max-w-full h-full overflow-y-auto">
            <h1 className="text-3xl font-bold text-pink-950 text-center">DEIR Card</h1>
            <p className="max-w-xl text-pink-900/60 text-center my-2 m-auto">
                Generate DEIR card commands by specifying the card location.
            </p>

            <form className="mt-5 space-y-4">
                <div className="flex gap-4">
                    {inputField("Card Location", cardLoc.toString(), (v) => setCardLoc(Number(v)), "card_loc")}
                    <div className="w-full">
                        <label className="block font-medium text-sm mb-2">Card Type</label>
                        <select
                            className="w-full mb-1 p-2 rounded border border-pink-300"
                            name="card_type"
                            value={cardType}
                            onChange={(e) => {
                                setCardType(e.target.value);
                                if (e.target.value === "dsm") {
                                    setIpAddressC("");
                                    setIpAddressRemoteC("");
                                }
                            }}
                        >
                            <option value="">Select Card Type</option>
                            <option value="slic">SLIC</option>
                            <option value="dsm">DSM</option>
                        </select>
                    </div>

                    {inputField("Number of Links", numofLinks.toString(), (v) => setNumOfLinks(Number(v)), "num_of_links")}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {inputField("IP Address B", ipAddressB, setIpAddressB, "ip_address_b")}
                    {showCD && inputField("IP Address C", ipAddressC, setIpAddressC, "ip_address_c")}
                    {inputField("Remote IP B", ipAddressRemoteB, setIpAddressRemoteB, "remote_ip_b")}
                    {showCD && inputField("Remote IP C", ipAddressRemoteC, setIpAddressRemoteC, "remote_ip_c")}

                    {showCD && inputField("Start LPort", start_lport.toString(), (v) => setStart_lport(Number(v)), "start_lport")}
                    {showCD && inputField("Start RPort", start_rport.toString(), (v) => setStart_rport(Number(v)), "start_rport")}
                </div>

                <button
                    type="button"
                    className="w-full bg-pink-800/70 text-white py-2 rounded hover:bg-pink-700 transition-colors"
                    onClick={generateCmds}
                >
                    Generate Commands
                </button>
            </form>

            <div className="p-3 bg-pink-50 rounded-lg w-full m-auto shadow mt-10">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-pink-900 mb-1">Eagle Commands:</h2>
                    <button
                        className="cursor-pointer text-pink-800/70 px-3 text-xl py-1 rounded active:text-pink-800/50 transition-colors mb-4"
                        onClick={() => navigator.clipboard.writeText(generatedCmds)}
                    >
                        <FaCopy />
                    </button>
                </div>
                <CodeEditor value={generatedCmds} />
            </div>
        </div>
    );
};

export default Deir;
