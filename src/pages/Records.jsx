import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { INSPECTION_TYPES } from '../data/inspectionChecklists';
import { FaSearch, FaFilter } from 'react-icons/fa';

export default function Records() {
  const [inspections, setInspections] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    const saved = localStorage.getItem('inspections');
    if (saved) {
      const data = JSON.parse(saved);
      setInspections(data);
      setFiltered(data);
    }
  }, []);

  useEffect(() => {
    let result = inspections;
    if (typeFilter !== 'all') {
      result = result.filter(insp => insp.type === typeFilter);
    }
    if (searchTerm) {
      result = result.filter(insp => {
        const searchable = JSON.stringify(insp.data).toLowerCase();
        return searchable.includes(searchTerm.toLowerCase());
      });
    }
    setFiltered(result);
  }, [searchTerm, typeFilter, inspections]);

  const getTypeLabel = (type) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getTypeColor = (type) => {
    const colors = {
      [INSPECTION_TYPES.HOUSE_TO_HOUSE]: 'bg-blue-100 text-blue-800',
      [INSPECTION_TYPES.FOOD_VENDOR]: 'bg-green-100 text-green-800',
      [INSPECTION_TYPES.HOTEL_GUESTHOUSE]: 'bg-purple-100 text-purple-800',
      [INSPECTION_TYPES.MEDICAL_SCREENING]: 'bg-red-100 text-red-800',
      [INSPECTION_TYPES.INDUSTRY]: 'bg-yellow-100 text-yellow-800',
      [INSPECTION_TYPES.SCHOOL]: 'bg-indigo-100 text-indigo-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Inspection Records</h1>
        
        <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search inspections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md"
            />
          </div>
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="p-2 border rounded-md"
            >
              <option value="all">All Types</option>
              {Object.values(INSPECTION_TYPES).map(type => (
                <option key={type} value={type}>{getTypeLabel(type)}</option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No inspection records found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((inspection, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-wrap justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{getTypeLabel(inspection.type)}</h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getTypeColor(inspection.type)}`}>
                      {getTypeLabel(inspection.type)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(inspection.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {Object.entries(inspection.data).slice(0, 6).map(([key, value]) => (
                    value && (
                      <div key={key} className="text-sm">
                        <span className="font-medium">{key.replace(/_/g, ' ').toUpperCase()}:</span>
                        <span className="ml-1">{value}</span>
                      </div>
                    )
                  ))}
                </div>
                <div className="mt-4 text-right">
                  <button 
                    className="text-blue-600 hover:underline text-sm"
                    onClick={() => alert(JSON.stringify(inspection, null, 2))}
                  >
                    View Full Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}