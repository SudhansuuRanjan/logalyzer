import Sidebar from './components/Sidebar'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UpgLogs from './pages/UpgLogs';
import Cards from './pages/Cards';
import Tools from './pages/Tools';
import Traffic from './pages/Traffic';

// tools
import PointCodeConverter from './pages/Tools/PointCodeConverter';
import HexDecBinary from './pages/Tools/HexDecBinary';
import IPHexDecBinary from './pages/Tools/IPHexDecBinary';
import Replicator from './pages/Tools/Replicator';

function App(): React.JSX.Element {

  return (
    <Router>
      <div className='flex h-screen w-screen'>
        <Sidebar />
        <div className="flex-1 overflow-hidden bg-pink-50">
          <div className='border-l border-t mt-4 border-pink-300 bg-white rounded-tl-xl h-full'>
            <Routes>
              <Route path="/" element={<UpgLogs />} />
              <Route path="/cards" element={<Cards />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/traffic" element={<Traffic />} />

              {/* Tools */}
              <Route path="/tools/point-code-converter" element={<PointCodeConverter />} />
              <Route path="/tools/hex-dec-binary" element={<HexDecBinary />} />
              <Route path="/tools/ip-hex-dec-binary" element={<IPHexDecBinary />} />
              <Route path="/tools/replicator" element={<Replicator/>} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  )
}

export default App;
