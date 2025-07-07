import { useEffect, useState } from 'react'

const HexDecBinary = () => {
  const [hexInput, setHexInput] = useState('0')
  const [decInput, setDecInput] = useState('0')
  const [binInput, setBinInput] = useState('0')
  const [lastChanged, setLastChanged] = useState<'hex' | 'dec' | 'bin'>('hex')

  const handleHexChange = (v: string) => {
    setHexInput(v)
    setLastChanged('hex')
  }

  const handleDecChange = (v: string) => {
    setDecInput(v)
    setLastChanged('dec')
  }

  const handleBinChange = (v: string) => {
    setBinInput(v)
    setLastChanged('bin')
  }

  useEffect(() => {
    try {
      if (lastChanged === 'hex') {
        const cleaned = hexInput.replace(/[^0-9a-fA-F]/g, '') || '0'
        const d = parseInt(cleaned, 16)
        setDecInput(d.toString(10))
        setBinInput(d.toString(2))
      } else if (lastChanged === 'dec') {
        const cleaned = decInput.replace(/[^\d]/g, '') || '0'
        const d = parseInt(cleaned, 10)
        setHexInput(d.toString(16).toUpperCase())
        setBinInput(d.toString(2))
      } else if (lastChanged === 'bin') {
        const cleaned = binInput.replace(/[^01]/g, '') || '0'
        const d = parseInt(cleaned, 2)
        setDecInput(d.toString(10))
        setHexInput(d.toString(16).toUpperCase())
      }
    } catch {
      setHexInput('0')
      setDecInput('0')
      setBinInput('0')
    }
  }, [hexInput, decInput, binInput, lastChanged])

  return (
    <div className="flex flex-col gap-6 p-8 bg-white min-h-screen">
      <h1 className="text-3xl font-bold text-pink-950 text-center">Hex-Decimal-Binary Converter</h1>
      <p className="text-gray-600 max-w-xl m-auto my-2 text-center">
        A two-way number converter between hexadecimal, decimal, and binary formats.
        Input in any one format and the others will update automatically.
      </p>

      <div className="bg-pink-50/50 m-auto mt-10 p-6 rounded-lg shadow w-full max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium text-pink-900/80 mb-1">Hexadecimal</label>
          <input
            type="text"
            value={hexInput}
            onChange={(e) => handleHexChange(e.target.value)}
            className="w-full p-2 rounded border border-pink-300 text-purple-700 font-mono"
            placeholder="e.g. 1A3F"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-pink-900/80 mb-1">Decimal</label>
          <input
            type="text"
            value={decInput}
            onChange={(e) => handleDecChange(e.target.value)}
            className="w-full p-2 rounded border border-pink-300 text-blue-700 font-mono"
            placeholder="e.g. 6703"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-pink-900/80 mb-1">Binary</label>
          <input
            type="text"
            value={binInput}
            onChange={(e) => handleBinChange(e.target.value)}
            className="w-full p-2 rounded border border-pink-300 text-green-700 font-mono"
            placeholder="e.g. 1101000111111"
          />
        </div>
      </div>
    </div>
  )
}

export default HexDecBinary
