import { NavLink } from 'react-router-dom';
import { FaTools, FaSdCard, FaNetworkWired, FaSearch } from 'react-icons/fa';
import electronLogo from '../assets/electron.svg';

const Sidebar = () => {
  const navItems = [
    { name: 'Analyze Upgrade Logs', path: '/', icon: <FaSearch/> },
    { name: 'Eagle Cards', path: '/cards', icon: <FaSdCard /> },
    { name: 'Tools', path: '/tools', icon: <FaTools /> },
    { name: 'How To?', path: '/how-to', icon: <FaNetworkWired /> },
  ];

  return (
    <div className="h-screen w-64 bg-pink-50 text-pink-700 flex flex-col px-4 py-6 shadow-sm transition-all">
      {/* Logo */}
      <div className="flex items-center gap-2 px-2">
        <img src={electronLogo} alt="logo" className="h-6 w-6" />
        <h1 className="text-xl font-bold">Logalyzer</h1>
      </div>

      {/* New Chat Button */}
      {/* <button className="mt-6 bg-pink-500 hover:bg-pink-600 transition-all text-white font-semibold px-4 py-2 rounded-md shadow-md">
        New Chat
      </button> */}

      {/* Search Field */}
      <div className="mt-6">
        <input
          type="text"
          placeholder="Search Tools..."
          className="w-full px-3 py-2 rounded-md border border-pink-300 bg-pink-100 text-pink-900 placeholder-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
      </div>

      {/* Navigation Items */}
      <nav className="flex flex-col gap-2 mt-8">
        <span className="text-xs uppercase text-pink-400 pl-2">AVAILABLE TOOLS</span>
        {navItems.map(({ name, path, icon }) => (
          <NavLink
            key={name}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                isActive
                  ? 'bg-white text-pink-900 shadow-sm'
                  : 'text-pink-700 hover:bg-white hover:text-pink-900'
              }`
            }
          >
            {icon}
            {name}
          </NavLink>
        ))}
      </nav>

      {/* Footer Login */}
      <div className="mt-auto pt-6">
        <NavLink
          to="/login"
          className="flex items-center text-pink-700 hover:text-pink-900 gap-2 text-sm font-medium transition-all"
        >
          <span className="text-lg">→</span>
          Login
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
