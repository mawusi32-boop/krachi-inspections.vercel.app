import { useState, useEffect } from 'react';
import { INSPECTION_CHECKLISTS } from '../data/inspectionChecklists';
import toast from 'react-hot-toast';

export default function InspectionForm({ inspectionType, onSubmit, initialData }) {
  const [formData, setFormData] = useState({});
  const [currentSection, setCurrentSection] = useState(0);
  
  const checklist = INSPECTION_CHECKLISTS[inspectionType];
  
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else if (checklist) {
      const initial = {};
      checklist.sections.forEach(section => {
        section.items.forEach(item => {
          initial[item.id] = '';
        });
      });
      setFormData(initial);
    }
  }, [inspectionType, initialData, checklist]);

  if (!checklist) {
    return <div className="text-center py-8">Loading inspection form...</div>;
  }

  const handleChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const missingFields = [];
    checklist.sections.forEach(section => {
      section.items.forEach(item => {
        if (!formData[item.id] && item.type !== 'number') {
          missingFields.push(item.label);
        }
      });
    });
    
    if (missingFields.length > 0) {
      toast.error(`Please fill: ${missingFields.join(', ')}`);
      return;
    }
    
    onSubmit({
      type: inspectionType,
      data: formData,
      timestamp: new Date().toISOString()
    });
  };

  const renderInput = (item) => {
    switch (item.type) {
      case 'select':
        return (
          <select
            value={formData[item.id] || ''}
            onChange={(e) => handleChange(item.id, e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          >
            <option value="">Select...</option>
            {item.options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      case 'number':
        return (
          <input
            type="number"
            value={formData[item.id] || ''}
            onChange={(e) => handleChange(item.id, e.target.value)}
            className="w-full p-2 border rounded-md"
          />
        );
      case 'date':
        return (
          <input
            type="date"
            value={formData[item.id] || ''}
            onChange={(e) => handleChange(item.id, e.target.value)}
            className="w-full p-2 border rounded-md"
          />
        );
      default:
        return (
          <input
            type="text"
            value={formData[item.id] || ''}
            onChange={(e) => handleChange(item.id, e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">{checklist.title}</h2>
        
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            {checklist.sections.map((section, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSection(idx)}
                className={`text-sm ${idx === currentSection ? 'text-blue-600 font-bold' : 'text-gray-500'}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentSection + 1) / checklist.sections.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">{checklist.sections[currentSection].title}</h3>
          <div className="space-y-4">
            {checklist.sections[currentSection].items.map(item => (
              <div key={item.id} className="flex flex-col">
                <label className="font-medium mb-1">{item.label}</label>
                {renderInput(item)}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => setCurrentSection(prev => Math.max(0, prev - 1))}
            disabled={currentSection === 0}
            className="px-4 py-2 bg-gray-300 rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          
          {currentSection === checklist.sections.length - 1 ? (
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Submit Inspection
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCurrentSection(prev => Math.min(checklist.sections.length - 1, prev + 1))}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </form>
  );
}