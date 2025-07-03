import Sidebar from './components/Sidebar'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UpgLogs from './pages/UpgLogs';

function App(): React.JSX.Element {

  return (
    <Router>
      <div className='flex h-screen w-screen'>
        <Sidebar />
        <div className="flex-1 bg-gray-100 overflow-hidden">
          <Routes>
            <Route path="/" element={<UpgLogs />} />
            <Route path="/send" element={<div>Send Component</div>} />
            <Route path="/settings" element={<div>Settings Component</div>} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App;
