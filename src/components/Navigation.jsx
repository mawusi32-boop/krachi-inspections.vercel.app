import { Link } from 'react-router-dom';
import { FaHome, FaPlus, FaList, FaBook } from 'react-icons/fa';

export default function Navigation() {
  const navItems = [
    { href: '/', label: 'Dashboard', icon: FaHome },
    { href: '/new-inspection', label: 'New Inspection', icon: FaPlus },
    { href: '/records', label: 'Records', icon: FaList },
    { href: '/field-guide', label: 'Field Guide', icon: FaBook }
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-blue-600">
              Krachi Nchumuru District
            </h1>
            <span className="ml-2 text-sm text-gray-500 hidden md:inline">
              Environmental Health Register
            </span>
          </div>
          
          <div className="flex space-x-4">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                to={href}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Icon className="mr-2" />
                <span className="hidden md:inline">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}