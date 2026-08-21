import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { INSPECTION_TYPES } from '../data/inspectionChecklists';
import { FaClipboardList, FaUtensils, FaHotel, FaHospital, FaIndustry, FaSchool } from 'react-icons/fa';

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    byType: {},
    recent: []
  });

  useEffect(() => {
    const saved = localStorage.getItem('inspections');
    if (saved) {
      const data = JSON.parse(saved);
      const byType = {};
      Object.values(INSPECTION_TYPES).forEach(type => {
        byType[type] = data.filter(insp => insp.type === type).length;
      });
      
      setStats({
        total: data.length,
        byType,
        recent: data.slice(-5).reverse()
      });
    }
  }, []);

  const getTypeIcon = (type) => {
    const icons = {
      [INSPECTION_TYPES.HOUSE_TO_HOUSE]: FaClipboardList,
      [INSPECTION_TYPES.FOOD_VENDOR]: FaUtensils,
      [INSPECTION_TYPES.HOTEL_GUESTHOUSE]: FaHotel,
      [INSPECTION_TYPES.MEDICAL_SCREENING]: FaHospital,
      [INSPECTION_TYPES.INDUSTRY]: FaIndustry,
      [INSPECTION_TYPES.SCHOOL]: FaSchool
    };
    return icons[type] || FaClipboardList;
  };

  const getTypeLabel = (type) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-500 text-sm">Total Inspections</h3>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-500 text-sm">Inspection Types</h3>
            <p className="text-3xl font-bold">{Object.keys(stats.byType).filter(k => stats.byType[k] > 0).length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-500 text-sm">Latest Inspection</h3>
            <p className="text-lg font-semibold">
              {stats.recent.length > 0 
                ? new Date(stats.recent[0].timestamp).toLocaleDateString()
                : 'No inspections yet'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {Object.entries(INSPECTION_TYPES).map(([key, type]) => {
            const Icon = getTypeIcon(type);
            const count = stats.byType[type] || 0;
            return (
              <div key={key} className="bg-white p-4 rounded-lg shadow-md flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Icon className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h4 className="font-medium">{getTypeLabel(type)}</h4>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Recent Inspections</h2>
          {stats.recent.length === 0 ? (
            <p className="text-gray-500">No recent inspections</p>
          ) : (
            <div className="space-y-3">
              {stats.recent.map((inspection, idx) => (
                <div key={idx} className="border-b last:border-0 pb-3 last:pb-0">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {getTypeLabel(inspection.type)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(inspection.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}