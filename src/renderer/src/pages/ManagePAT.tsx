import React, { useState, useEffect } from "react";
import { FiSave, FiTrash2, FiClock, FiKey, FiEye, FiEyeOff, FiCopy, FiServer } from "react-icons/fi";

const ManagePAT: React.FC = () => {
  const [pat, setPat] = useState<string>("");
  const [expiry, setExpiry] = useState<string>("");
  const [env, setEnv] = useState<string>("prod"); // New State for Environment
  const [currentPat, setCurrentPat] = useState<string>("");
  const [currentExpiry, setCurrentExpiry] = useState<string>("");
  const [currentEnv, setCurrentEnv] = useState<string>("");
  const [countdown, setCountdown] = useState<string>("");
  const [showFullToken, setShowFullToken] = useState<boolean>(false);

  const defaultExpiry: string = new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  useEffect(() => {
    const savedPat = localStorage.getItem("pat");
    const savedExpiry = localStorage.getItem("patExpiry");
    const savedEnv = localStorage.getItem("environment") || "prod";

    if (savedPat && savedExpiry) {
      setCurrentPat(savedPat);
      setCurrentExpiry(savedExpiry);
      setExpiry(savedExpiry);
    } else {
      setExpiry(defaultExpiry);
    }
    
    setEnv(savedEnv);
    setCurrentEnv(savedEnv);
  }, []);

  useEffect(() => {
    if (currentExpiry) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const expiryTime = new Date(currentExpiry).getTime();
        const distance = expiryTime - now;

        if (distance < 0) {
          setCountdown("EXPIRED");
          clearInterval(interval);
        } else {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
    return ()=> {}
  }, [currentExpiry]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pat && expiry) {
      localStorage.setItem("pat", pat);
      localStorage.setItem("patExpiry", expiry);
      localStorage.setItem("environment", env); // Save Environment
      
      setCurrentPat(pat);
      setCurrentExpiry(expiry);
      setCurrentEnv(env);
      
      setPat(""); 
      setShowFullToken(false);
    }
  };

  const handleClear = () => {
    localStorage.removeItem("pat");
    localStorage.removeItem("patExpiry");
    localStorage.removeItem("environment");
    setCurrentPat("");
    setCurrentExpiry("");
    setCurrentEnv("");
    setCountdown("");
    setPat("");
    setEnv("prod");
    setExpiry(defaultExpiry);
    setShowFullToken(false);
  };

  const handleCopy = async () => {
    if (currentPat) {
      await navigator.clipboard.writeText(currentPat);
    }
  };

  const tokenDisplay = showFullToken ? currentPat : (currentPat ? `${"*".repeat(currentPat.length - 4)}${currentPat.slice(-4)}` : "No token");

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto p-4">
      <div className="my-10">
        <h1 className="text-2xl text-center font-bold text-pink-900 mb-5">
          Settings & Access
        </h1>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-8 bg-white p-6 rounded-xl border border-pink-100 shadow-sm">
          {/* Environment Selection */}
          <div className="mb-4">
            <label className="text-pink-900 font-semibold mb-2 flex items-center">
              <FiServer className="mr-2" />
              Target Environment
            </label>
            <select 
              value={env}
              onChange={(e) => setEnv(e.target.value)}
              className="w-full py-3 px-4 rounded-lg border border-pink-300 outline-pink-600 text-pink-600 bg-white"
            >
              <option value="prod">Production (PROD)</option>
              <option value="stag">Staging (STAG)</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="text-pink-900 font-semibold mb-2 flex items-center">
              <FiKey className="mr-2" />
              Personal Access Token
            </label>
            <input
              type="password"
              value={pat}
              onChange={(e) => setPat(e.target.value)}
              className="w-full py-3 px-4 rounded-lg border border-pink-300 outline-pink-600 text-pink-500"
              placeholder="Paste your token here"
              required
            />
          </div>

          <div className="mb-6">
            <label className="text-pink-900 font-semibold mb-2 flex items-center">
              <FiClock className="mr-2" />
              Expiry Date
            </label>
            <input
              type="date"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="w-full py-3 px-4 rounded-lg border border-pink-300 outline-pink-600 text-pink-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full cursor-pointer py-3 px-4 bg-pink-900 text-white rounded-lg hover:bg-pink-800 transition-colors flex items-center justify-center font-bold"
          >
            <FiSave className="mr-2" />
            Update Configuration
          </button>
        </form>

        {currentPat && (
          <div className="max-w-md mx-auto bg-gray-50 p-6 rounded-lg border border-pink-300">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-pink-900 flex items-center">
                <FiKey className="mr-2" />
                Active Session
              </h2>
              {/* Environment Badge */}
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${currentEnv === 'prod' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {currentEnv}
              </span>
            </div>
            
            <div className="relative mb-4 bg-white p-3 rounded border border-pink-100">
              <p className="text-pink-600 font-mono text-sm break-all pr-8">
                {tokenDisplay}
              </p>
              <button
                onClick={() => setShowFullToken(!showFullToken)}
                className="absolute cursor-pointer right-2 top-3 text-pink-500 hover:text-pink-700"
                type="button"
              >
                {showFullToken ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={handleCopy}
                className="flex-1 py-2 px-4 cursor-pointer bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center text-sm"
                type="button"
              >
                <FiCopy className="mr-2" size={14} />
                Copy
              </button>
              <button
                onClick={handleClear}
                className="flex-1 py-2 px-4 cursor-pointer bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center text-sm"
              >
                <FiTrash2 className="mr-2" size={14} />
                Clear
              </button>
            </div>
            
            <p className="text-pink-600 text-sm flex items-center justify-center bg-pink-50 py-2 rounded">
              <FiClock className="mr-2" />
              Expires in: <span className="font-bold ml-1">{countdown}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagePAT;