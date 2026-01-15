import { useEffect, useState } from 'react'
import { FaCopy } from 'react-icons/fa'

const IPHexDecBinary = () => {
  const [ip, setIp] = useState('10.75.144.216')
  const [decimal, setDecimal] = useState('0')
  const [hex, setHex] = useState('0x0')
  const [_, setBinary] = useState('00000000000000000000000000000000')
  const [ipv6Short, setIpv6Short] = useState('')
  const [ipv6Long, setIpv6Long] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  const isValidIp = (ip: string) =>
    /^(\d{1,3}\.){3}\d{1,3}$/.test(ip) &&
    ip.split('.').every(part => +part >= 0 && +part <= 255)

  const ipToDecimal = (ip: string) => {
    const parts = ip.split('.').map(Number)
    return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0
  }

  const decimalToIPv6 = (dec: number) => {
    const hex = dec.toString(16).padStart(8, '0')
    const short = `::ffff:${hex.slice(0, 4)}:${hex.slice(4)}`
    const long = `0000:0000:0000:0000:0000:0000:ffff:${hex.slice(0, 4)}:${hex.slice(4)}`
    return { short, long }
  }

  const copyToClipboard = (value: string, label: string) => {
    navigator.clipboard.writeText(value)
    setCopied(label)
    setTimeout(() => setCopied(null), 1500)
  }

  useEffect(() => {
    if (isValidIp(ip)) {
      const dec = ipToDecimal(ip)
      setDecimal(dec.toString())
      setHex(`0x${dec.toString(16).toUpperCase().padStart(8, '0')}`)
      setBinary(dec.toString(2).padStart(32, '0'))
      const { short, long } = decimalToIPv6(dec)
      setIpv6Short(short)
      setIpv6Long(long)
    } else {
      setDecimal('Invalid')
      setHex('Invalid')
      setBinary('Invalid')
      setIpv6Short('Invalid')
      setIpv6Long('Invalid')
    }
  }, [ip])

  return (
    <div className="flex flex-col gap-6 p-8 min-h-screen">
      <h1 className="text-3xl font-bold text-pink-950 text-center">IPv4 Converter</h1>
      <p className="text-pink-800/80 max-w-xl text-center my-5 m-auto">
        Convert IPv4 addresses to Decimal, Hexadecimal, Binary, and IPv6 formats.
      </p>

      {/* Input */}
      <div className="bg-pink-50/60 p-6 mt-6 rounded-lg shadow w-full max-w-2xl m-auto space-y-6">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            className="w-full p-2 rounded border border-pink-300 font-mono text-pink-900"
            placeholder="Enter IPv4 address (e.g. 10.75.144.216)"
          />
          <button
            className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
            onClick={() => {
              if (isValidIp(ip)) {
                const dec = ipToDecimal(ip)
                setDecimal(dec.toString())
                setHex(`0x${dec.toString(16).toUpperCase().padStart(8, '0')}`)
                setBinary(dec.toString(2).padStart(32, '0'))
                const { short, long } = decimalToIPv6(dec)
                setIpv6Short(short)
                setIpv6Long(long)
              }
            }}
          >
            Convert
          </button>
        </div>

        {/* Output */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'IPv4', value: ip },
            { label: 'IPv6 (short)', value: ipv6Short },
            { label: 'Integer', value: decimal },
            { label: 'IPv6 (long)', value: ipv6Long },
            { label: 'Hex', value: hex },
            { label: 'Hex DEIR', value: `0x0001${hex.substring(2).toLocaleLowerCase()}` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded border border-pink-200 p-4 shadow-sm relative">
              <label className="text-sm font-medium text-pink-800">{label}</label>
              <input
                type="text"
                readOnly
                value={value}
                className="w-full mt-1 p-2 border border-pink-100 rounded font-mono bg-pink-50 text-pink-900"
              />
              <button
                className="absolute top-4 cursor-pointer right-4 text-pink-500 hover:text-pink-700 text-lg"
                onClick={() => copyToClipboard(value, label)}
              >
                <FaCopy />
              </button>
              {copied === label && (
                <span className="text-green-600 text-xs absolute bottom-1 font-medium right-4">Copied!</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default IPHexDecBinary
