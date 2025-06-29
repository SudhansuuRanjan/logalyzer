import { NavLink } from 'react-router-dom';
import { FaWifi, FaPaperPlane, FaCog } from 'react-icons/fa';
import electronLogo from '../assets/electron.svg'

const Sidebar = () => {
  const navItems = [
    { name: 'Analyze Upg Logs', path: '/', icon: <FaWifi /> },
    { name: 'Send', path: '/send', icon: <FaPaperPlane /> },
    { name: 'Settings', path: '/settings', icon: <FaCog /> },
  ];

  return (
    <div className="h-screen w-64 bg-white border-r border-r-gray-300 self-start text-gray-900 flex flex-col py-6 px-4 shadow-md">
      <img alt="logo" className="logo" src={electronLogo} />
      <h1 className="text-2xl font-bold px-2">Logalyzer</h1>
      <nav className="flex flex-col w-full gap-5 mt-10">
        {navItems.map(({ name, path, icon }) => (
          <NavLink
            key={name}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg font-medium hover:bg-gray-100 transition-all ${
                isActive ? 'bg-gray-200 text-black' : 'text-gray-600'
              }`
            }
          >
            {icon}
            {name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
