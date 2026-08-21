// Database utility functions for managing inspections
// Currently using localStorage, but can be easily switched to Firebase or any backend

const STORAGE_KEY = 'inspections';

// Get all inspections
export const getInspections = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading inspections:', error);
    return [];
  }
};

// Save a new inspection
export const saveInspection = (inspection) => {
  try {
    const inspections = getInspections();
    const newInspection = {
      id: Date.now().toString(),
      ...inspection,
      createdAt: new Date().toISOString()
    };
    inspections.push(newInspection);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inspections));
    return newInspection;
  } catch (error) {
    console.error('Error saving inspection:', error);
    throw error;
  }
};

// Get inspection by ID
export const getInspectionById = (id) => {
  try {
    const inspections = getInspections();
    return inspections.find(insp => insp.id === id) || null;
  } catch (error) {
    console.error('Error fetching inspection:', error);
    return null;
  }
};

// Update an existing inspection
export const updateInspection = (id, updatedData) => {
  try {
    const inspections = getInspections();
    const index = inspections.findIndex(insp => insp.id === id);
    if (index === -1) throw new Error('Inspection not found');
    
    inspections[index] = { ...inspections[index], ...updatedData, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inspections));
    return inspections[index];
  } catch (error) {
    console.error('Error updating inspection:', error);
    throw error;
  }
};

// Delete an inspection
export const deleteInspection = (id) => {
  try {
    const inspections = getInspections();
    const filtered = inspections.filter(insp => insp.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting inspection:', error);
    return false;
  }
};

// Get inspections by type
export const getInspectionsByType = (type) => {
  try {
    const inspections = getInspections();
    return inspections.filter(insp => insp.type === type);
  } catch (error) {
    console.error('Error filtering inspections:', error);
    return [];
  }
};

// Get inspection statistics
export const getInspectionStats = () => {
  try {
    const inspections = getInspections();
    const stats = {
      total: inspections.length,
      byType: {},
      recent: inspections.slice(-5).reverse(),
      today: inspections.filter(insp => {
        const today = new Date().toDateString();
        return new Date(insp.createdAt).toDateString() === today;
      }).length
    };
    
    // Count by type
    inspections.forEach(insp => {
      stats.byType[insp.type] = (stats.byType[insp.type] || 0) + 1;
    });
    
    return stats;
  } catch (error) {
    console.error('Error getting stats:', error);
    return { total: 0, byType: {}, recent: [], today: 0 };
  }
};

// Clear all data (for testing)
export const clearAllData = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};

// Export to JSON
export const exportData = () => {
  try {
    const data = getInspections();
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Error exporting data:', error);
    return null;
  }
};

// Import from JSON
export const importData = (jsonData) => {
  try {
    const data = JSON.parse(jsonData);
    if (!Array.isArray(data)) throw new Error('Invalid data format');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

// Firebase integration placeholder (if you want to use Firebase later)
export const syncWithFirebase = async () => {
  // This function will be implemented when Firebase is set up
  console.log('Firebase sync not implemented yet');
  return false;
};