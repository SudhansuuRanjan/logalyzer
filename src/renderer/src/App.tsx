import Sidebar from './components/Sidebar'
// CHANGE: Import HashRouter instead of BrowserRouter
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// tools
import PointCodeConverter from './pages/Tools/PointCodeConverter';
import HexDecBinary from './pages/Tools/HexDecBinary';
import IPHexDecBinary from './pages/Tools/IPHexDecBinary';
import Replicator from './pages/Tools/Replicator';

// Cards
import Ipsm from './pages/Cards/Ipsm';
import Mcpm from './pages/Cards/Mcpm';
import Sfapp from './pages/Cards/Sfapp';
import Sccp from './pages/Cards/Sccp';
import Enum from './pages/Cards/Enum';
import SIP from './pages/Cards/SIP';
import Deir from './pages/Cards/Deir';
import Ipsg from './pages/Cards/Ipsg';
import Meat from './pages/Cards/Meat';

// How to
import Sflog from './pages/HowTo/Sflog';
import UpgLogs from './pages/UpgLogs';
import Cards from './pages/Cards';
import Tools from './pages/Tools';
import HowTo from './pages/HowTo';
import ManagePAT from './pages/ManagePAT';
import PostTestResults from './pages/PostTestResults';
import ZephyrBulkUpdater from './pages/BulkUpdateTestCases';
import TextExecutionOverview from './pages/TextExecutionOverview';
import ExecutionAnalysis from './pages/ExecutionAnalysis';
import TestPlanSearch from './pages/TestPlanSearch';
import CreateIssue from './pages/CreateIssue';

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

const queryClient = new QueryClient()

function App(): React.JSX.Element {

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className='flex h-screen w-screen select-text'>
          <Sidebar />
          <div className="flex-1 overflow-hidden bg-pink-50">
            <div className='border-l border-t mt-4 border-pink-300 bg-white rounded-tl-xl h-full'>
              <Routes>
                <Route path="/" element={<UpgLogs />} />
                <Route path="/cards" element={<Cards />} />
                <Route path="/tools" element={<Tools />} />
                <Route path="/how-to" element={<HowTo />} />
                <Route path='/manage-pat' element={<ManagePAT />} />
                <Route path='/post-results' element={<PostTestResults />} />
                <Route path='/update-testcase' element={<ZephyrBulkUpdater />} />
                <Route path='/execution-overview' element={<TextExecutionOverview />} />
                <Route path='/execution-analysis' element={<ExecutionAnalysis />} />
                <Route path='/test-plans' element={<TestPlanSearch />} />
                <Route path='/create-issues' element={<CreateIssue />} />

                {/* Tools */}
                <Route path="/tools/point-code-converter" element={<PointCodeConverter />} />
                <Route path="/tools/hex-dec-binary" element={<HexDecBinary />} />
                <Route path="/tools/ip-hex-dec-binary" element={<IPHexDecBinary />} />
                <Route path="/tools/replicator" element={<Replicator />} />

                {/* Cards */}
                <Route path="/cards/ipsm" element={<Ipsm />} />
                <Route path="/cards/mcpm" element={<Mcpm />} />
                <Route path="/cards/sfapp" element={<Sfapp />} />
                <Route path="/cards/sccp" element={<Sccp />} />
                <Route path="/cards/enum" element={<Enum />} />
                <Route path="/cards/sip" element={<SIP />} />
                <Route path="/cards/deir" element={<Deir />} />
                <Route path="/cards/ipsg" element={<Ipsg />} />
                <Route path="/cards/meat" element={<Meat />} />

                {/* How to */}
                <Route path="/how-to/run-sflog-traffic" element={<Sflog />} />
              </Routes>
            </div>
          </div>

          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App;