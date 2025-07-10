import { FaCopy } from "react-icons/fa";
import CodeEditor from "@renderer/components/CodeEditor";
import { useState } from "react";
import toast from "react-hot-toast";

const SIP = () => {
  const [cardLoc, setCardLoc] = useState<number>(1101);
  const [cardType, setCardType] = useState("slic");
  const [ipAddressA, setIpAddressA] = useState("");
  const [ipAddressB, setIpAddressB] = useState("");
  const [ipAddressC, setIpAddressC] = useState("");
  const [ipAddressD, setIpAddressD] = useState("");
  const [ipAddressRemoteB, setIpAddressRemoteB] = useState("");
  const [ipAddressRemoteC, setIpAddressRemoteC] = useState("");
  const [defrouter, setDefrouter] = useState("");
  const [generatedCmds, setGeneratedCmds] = useState("");

  const generateCmds = () => {
    if (!cardLoc || !cardType) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (cardType !== "slic" && cardType !== "dsm") {
      toast.error("Invalid card type. Please select either 'slic' or 'dsm'.");
      return;
    }

    if (ipAddressA === "" && ipAddressD === "") {
      toast.error("Please provide at least one IP address for A or D (EPAP). ");
      return;
    }

    if (ipAddressB === "" && ipAddressC === "") {
      toast.error("Please provide at least one IP address for B or C. (Network)");
      return;
    }

    let cmds = `ent-card:loc=${cardLoc}:type=${cardType}:appl=enumhc
${ipAddressA && `Chg-ip-lnk:loc=${cardLoc}:port=A:ipaddr=${ipAddressA}:mactype=DIX:submask=255.255.255.0:duplex=full:speed=1000:mcast=YES`}
${ipAddressB && `CHG-IP-LNK:PORT=b:SUBMASK=255.255.255.224:IPADDR=${ipAddressB}:LOC=${cardLoc}:speed=100:duplex=full:auto=no`}
${ipAddressC && `CHG-IP-LNK:PORT=c:SUBMASK=255.255.255.224:IPADDR=${ipAddressC}:LOC=${cardLoc}:speed=100:duplex=full:auto=no`}
${ipAddressD && `Chg-ip-lnk:loc=${cardLoc}:port=D:ipaddr=${ipAddressD}:mactype=DIX:submask=255.255.255.0:duplex=full:speed=1000:mcast=YES`}

${ipAddressB && `ENT-IP-HOST:HOST=enum${cardLoc}b:IPADDR=${ipAddressB}:TYPE=LOCAL`}
${ipAddressC && `ENT-IP-HOST:HOST=enum${cardLoc}c:IPADDR=${ipAddressC}:TYPE=LOCAL`}

${ipAddressRemoteB && `ENT-IP-HOST:HOST=renumb:IPADDR=${ipAddressRemoteB}:TYPE=remote`}
${ipAddressRemoteC && `ENT-IP-HOST:HOST=renumc:IPADDR=${ipAddressRemoteC}:TYPE=remote`}

${ipAddressB && `ENT-IP-CONN:LPORT=5353:LHOST=enum${cardLoc}b:PROT=UDP:CNAME=Conn1\nCHG-IP-CONN:OPEN=YES:CNAME=Conn1`}
${ipAddressC && `ENT-IP-CONN:LPORT=5354:LHOST=enum${cardLoc}c:PROT=UDP:CNAME=Conn2\nCHG-IP-CONN:OPEN=YES:CNAME=Conn2`}

${defrouter && `chg-ip-card:loc=${cardLoc}:defrouter=${defrouter}`}
alw-card:loc=${cardLoc}`;

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
      <h1 className="text-3xl font-bold text-pink-950 text-center">SIP Card</h1>
      <p className="max-w-xl text-pink-900/60 text-center my-2 m-auto">
        Generate SIP card commands by specifying the card location.
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
                  setIpAddressD("");
                  setIpAddressRemoteC("");
                }
              }}
            >
              <option value="">Select Card Type</option>
              <option value="slic">SLIC</option>
              <option value="dsm">DSM</option>
            </select>
          </div>
          {inputField("Defrouter", defrouter, setDefrouter, "defrouter")}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {inputField("IP Address A", ipAddressA, setIpAddressA, "ip_address_a")}
          {inputField("IP Address B", ipAddressB, setIpAddressB, "ip_address_b")}
          {showCD && inputField("IP Address C", ipAddressC, setIpAddressC, "ip_address_c")}
          {showCD && inputField("IP Address D", ipAddressD, setIpAddressD, "ip_address_d")}
          {inputField("Remote IP B", ipAddressRemoteB, setIpAddressRemoteB, "remote_ip_b")}
          {showCD && inputField("Remote IP C", ipAddressRemoteC, setIpAddressRemoteC, "remote_ip_c")}
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

export default SIP;
