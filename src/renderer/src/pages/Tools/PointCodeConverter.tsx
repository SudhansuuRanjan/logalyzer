import { useEffect, useState } from 'react'

const PointCodeConverter = () => {
    const [type, setType] = useState<'itu' | 'ansi'>('itu')
    const [decimal, setDecimal] = useState<number>(0)
    const [hex, setHex] = useState<string>('0')
    const [pointCode, setPointCode] = useState<string>('')
    const [lastChanged, setLastChanged] = useState<'decimal' | 'hex' | 'pointCode'>('pointCode')

    const parsePointCode = (code: string): [number, number, number] => {
        const parts = code.split('-').map((v) => parseInt(v, 10))
        if (parts.length !== 3 || parts.some((n) => isNaN(n))) return [0, 0, 0]
        return parts as [number, number, number]
    }

    const toDecimalFromPointCode = (code: string, format: 'itu' | 'ansi') => {
        const [x, y, z] = parsePointCode(code)
        return format === 'itu'
            ? (x << 11) | (y << 3) | z
            : (x << 16) | (y << 8) | z
    }

    const toPointCodeFromDecimal = (dec: number, format: 'itu' | 'ansi') => {
        if (format === 'itu') {
            const x = (dec >> 11) & 0x7
            const y = (dec >> 3) & 0xFF
            const z = dec & 0x7
            return `${x}-${y}-${z}`
        } else {
            const x = (dec >> 16) & 0xFF
            const y = (dec >> 8) & 0xFF
            const z = dec & 0xFF
            return `${x}-${y}-${z}`
        }
    }

    // 🔁 Sync when inputs change
    useEffect(() => {
        if (lastChanged === 'pointCode') {
            const dec = toDecimalFromPointCode(pointCode, type)
            setDecimal(dec)
            setHex(dec.toString(16).toUpperCase())
        } else if (lastChanged === 'decimal') {
            const pc = toPointCodeFromDecimal(decimal, type)
            setPointCode(pc)
            setHex(decimal.toString(16).toUpperCase())
        } else if (lastChanged === 'hex') {
            const dec = parseInt(hex, 16) || 0
            setDecimal(dec)
            setPointCode(toPointCodeFromDecimal(dec, type))
        }
    }, [pointCode, decimal, hex, type])

    const handlePointCodeChange = (value: string) => {
        setLastChanged('pointCode')
        setPointCode(value)
    }

    const handleDecimalChange = (value: string) => {
        const normalized = value.replace(/^0+(?!$)/, '')
        const dec = parseInt(normalized, 10) || 0
        setLastChanged('decimal')
        setDecimal(dec)
    }

    const handleHexChange = (value: string) => {
        setLastChanged('hex')
        setHex(value.toUpperCase())
    }

    return (
        <div className="flex flex-col gap-6 p-8 min-h-screen">
            <h1 className="text-3xl font-bold text-pink-950 text-center">SS7 POINT CONVERTER</h1>
            <p className="max-w-xl text-pink-900/60 text-center my-2 m-auto">
                This tool converts between ITU (14-bit 3-8-3) and ANSI (24-bit 8-8-8) point codes.
                You can enter any one of the three formats — point code, decimal, or hex — and it
                will convert the others automatically.
            </p>

            <div className="p-6 bg-pink-50/50 rounded-lg w-full max-w-md m-auto mt-10 shadow">
                <label className="block font-medium text-sm mb-2">Point code Type:</label>
                <select
                    className="w-full mb-4 p-2 rounded border border-pink-300"
                    value={type}
                    onChange={(e) => setType(e.target.value as 'itu' | 'ansi')}
                >
                    <option value="itu">ITU (14-bit 3-8-3)</option>
                    <option value="ansi">ANSI (24-bit 8-8-8)</option>
                </select>

                <label className="block font-medium text-sm mb-2">Point Code (x-x-x):</label>
                <input
                    type="text"
                    className="w-full mb-4 p-2 rounded border border-pink-300"
                    value={pointCode}
                    onChange={(e) => handlePointCodeChange(e.target.value)}
                />

                <label className="block font-medium text-sm mb-2">Decimal:</label>
                <input
                    type="number"
                    className="w-full mb-4 p-2 rounded border border-pink-300"
                    value={decimal}
                    onChange={(e) => handleDecimalChange(e.target.value)}
                />

                <label className="block font-medium text-sm mb-2">Hexadecimal:</label>
                <input
                    type="text"
                    className="w-full p-2 rounded border border-pink-300"
                    value={hex}
                    onChange={(e) => handleHexChange(e.target.value)}
                />
            </div>
        </div>
    )
}

export default PointCodeConverter
