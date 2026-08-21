import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import InspectionForm from '../components/InspectionForm';
import { INSPECTION_TYPES } from '../data/inspectionChecklists';
import toast from 'react-hot-toast';

export default function NewInspection() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState('');
  
  const handleSubmit = async (inspectionData) => {
    try {
      const existing = JSON.parse(localStorage.getItem('inspections') || '[]');
      const newInspection = {
        id: Date.now().toString(),
        ...inspectionData
      };
      localStorage.setItem('inspections', JSON.stringify([...existing, newInspection]));
      
      toast.success('Inspection submitted successfully!');
      navigate('/records');
    } catch (error) {
      toast.error('Failed to submit inspection');
    }
  };

  const getTypeLabel = (type) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">New Inspection</h1>
        
        {!selectedType ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(INSPECTION_TYPES).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setSelectedType(value)}
                className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
              >
                <h3 className="text-lg font-semibold">{getTypeLabel(value)}</h3>
                <p className="text-gray-600 text-sm">Click to start inspection</p>
              </button>
            ))}
          </div>
        ) : (
          <div>
            <button
              onClick={() => setSelectedType('')}
              className="mb-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              ← Back to Inspection Types
            </button>
            <InspectionForm
              inspectionType={selectedType}
              onSubmit={handleSubmit}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}