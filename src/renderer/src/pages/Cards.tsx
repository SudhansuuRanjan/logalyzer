import { useState } from "react"
import Card from "@renderer/components/Card"

const Cards = () => {
  const [query, setQuery] = useState("")

  const cards = [
    {
      path: "/cards/ipsm",
      name: "IPSM Card",
      description: "IPSM Card for networking and telnet sessions.",
    },
    {
      path: "/cards/mcpm",
      name: "MCPM Card",
      description: "MCPM Card for getting measurement reports via Measurement Platform.",
    },
    {
      path: "/cards/sfapp",
      name: "SFAPP Card",
      description: "SFAPP Card for processing Stateful Applications traffic.",
    },
    {
      path: "/cards/sccp",
      name: "SCCP Card",
      description: "SCCP Card for processing GTT, SCCP & DEIR traffic.",
    },
    {
      path: "/cards/enum",
      name: "ENUM Card",
      description: "ENUM Card for processing ENUM traffic.",
    },
    {
      path : "/cards/sip",
      name: "SIP Card",
      description: "SIP Card for processing SIP NP traffic.",
    },
    {
      path: "/cards/deir",
      name: "DEIR Card",
      description: "DEIR Card for processing Diameter EIR traffic.",
    },
  ]

  const filteredCards = cards.filter(
    (card) =>
      card.name.toLowerCase().includes(query.toLowerCase()) ||
      card.description.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="flex flex-col w-full max-w-full h-full overflow-y-auto p-4">
      <div className="my-10">
        <h1 className="text-2xl text-center font-bold text-pink-900 mb-4">Eagle Cards</h1>

        <div className="flex items-center justify-center mb-4">
          <input
            type="search"
            className="text-sm w-full max-w-md py-3 px-3 m-auto rounded-lg border border-pink-300 outline-pink-600 text-pink-500 mb-4"
            placeholder="Search for a card..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredCards.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
          {filteredCards.map((card, index) => (
            <Card
              key={index}
              name={card.name}
              path={card.path}
              description={card.description}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400">No cards match your search.</p>
      )}
    </div>
  )
}

export default Cards
