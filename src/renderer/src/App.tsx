import Sidebar from './components/Sidebar'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UpgLogs from './pages/UpgLogs';
import Cards from './pages/Cards';
import Tools from './pages/Tools';
import Traffic from './pages/Traffic';

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
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  )
}

export default App;
