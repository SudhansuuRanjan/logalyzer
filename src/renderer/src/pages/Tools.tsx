import { useState } from "react"
import Tool from "@renderer/components/Tool"
import { FaAddressBook } from "react-icons/fa"

const Tools = () => {
  const [query, setQuery] = useState("")

  const tools = [
    {
      path: "/tools/point-code-converter",
      name: "Point Code Converter",
      description: "Convert point code from one domain to another.",
      Icon: FaAddressBook,
    },
    {
      path: "/tools/hex-dec-binary",
      name: "Hex/Dec/Binary Converter",
      description: "Convert between hexadecimal, decimal, and binary formats.",
      Icon: FaAddressBook,
    },
    {
      path:"/tools/ip-hex-dec-binary",
      name: "IP Hex/Dec/Binary Converter",
      description: "Convert between IP addresses in hexadecimal, decimal, and binary formats.",
      Icon: FaAddressBook,
    },
    {
      path:"/tools/replicator",
      name:"Replicator",
      description:"A tool to replicate a string over a pattern",
      Icon: FaAddressBook
    }
  ]

  const filteredTools = tools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(query.toLowerCase()) ||
      tool.description.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="flex flex-col w-full max-w-full h-full overflow-y-auto p-4">
      <div className="my-10">
        <h1 className="text-2xl text-center font-bold text-pink-900 mb-4">Tool Box</h1>

        <div className="flex items-center justify-center mb-4">
          <input
            type="search"
            className="text-sm w-full max-w-md py-3 px-3 m-auto rounded-lg border border-pink-300 outline-pink-600 text-pink-500 mb-4"
            placeholder="Search for a tool..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
          {filteredTools.map((tool, index) => (
            <Tool
              key={index}
              name={tool.name}
              path={tool.path}
              description={tool.description}
              Icon={tool.Icon}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400">No tools match your search.</p>
      )}
    </div>
  )
}

export default Tools
