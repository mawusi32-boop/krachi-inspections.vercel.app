export const INSPECTION_TYPES = {
  HOUSE_TO_HOUSE: 'house_to_house',
  FOOD_VENDOR: 'food_vendor',
  HOTEL_GUESTHOUSE: 'hotel_guesthouse',
  MEDICAL_SCREENING: 'medical_screening',
  INDUSTRY: 'industry',
  SCHOOL: 'school'
};

export const INSPECTION_CHECKLISTS = {
  [INSPECTION_TYPES.HOUSE_TO_HOUSE]: {
    title: 'House-to-House Inspection',
    sections: [
      {
        title: 'Property Details',
        items: [
          { id: 'house_number', label: 'House Number', type: 'text' },
          { id: 'owner_name', label: 'Owner Name', type: 'text' },
          { id: 'occupancy_type', label: 'Occupancy Type', type: 'select', options: ['Owner', 'Rented', 'Shared'] },
          { id: 'number_of_rooms', label: 'Number of Rooms', type: 'number' },
          { id: 'number_of_occupants', label: 'Number of Occupants', type: 'number' }
        ]
      },
      {
        title: 'Sanitation Facilities',
        items: [
          { id: 'toilet_type', label: 'Toilet Type', type: 'select', options: ['WC', 'KVIP', 'Pit Latrine', 'Public', 'None'] },
          { id: 'toilet_condition', label: 'Toilet Condition', type: 'select', options: ['Good', 'Fair', 'Poor'] },
          { id: 'bathroom', label: 'Bathroom', type: 'select', options: ['Yes', 'No'] },
          { id: 'solid_waste_disposal', label: 'Solid Waste Disposal', type: 'select', options: ['Collector', 'Burning', 'Dumping', 'Composting'] },
          { id: 'liquid_waste_disposal', label: 'Liquid Waste Disposal', type: 'select', options: ['Soakaway', 'Drain', 'Open Ground'] }
        ]
      },
      {
        title: 'Health & Hygiene',
        items: [
          { id: 'pest_control', label: 'Pest Control', type: 'select', options: ['Yes', 'No'] },
          { id: 'water_source', label: 'Water Source', type: 'select', options: ['Pipe', 'Borehole', 'Well', 'Surface'] },
          { id: 'water_treatment', label: 'Water Treatment', type: 'select', options: ['Boiling', 'Chlorination', 'Filter', 'None'] },
          { id: 'kitchen_ventilation', label: 'Kitchen Ventilation', type: 'select', options: ['Good', 'Fair', 'Poor'] }
        ]
      }
    ]
  },
  [INSPECTION_TYPES.FOOD_VENDOR]: {
    title: 'Food Vendor Inspection',
    sections: [
      {
        title: 'Vendor Details',
        items: [
          { id: 'vendor_name', label: 'Vendor Name', type: 'text' },
          { id: 'business_name', label: 'Business Name', type: 'text' },
          { id: 'location', label: 'Location', type: 'text' },
          { id: 'license_number', label: 'License Number', type: 'text' },
          { id: 'expiry_date', label: 'License Expiry Date', type: 'date' }
        ]
      },
      {
        title: 'Food Safety',
        items: [
          { id: 'food_handling_hygiene', label: 'Food Handling Hygiene', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Poor'] },
          { id: 'food_storage', label: 'Food Storage', type: 'select', options: ['Adequate', 'Inadequate'] },
          { id: 'temperature_control', label: 'Temperature Control', type: 'select', options: ['Yes', 'No'] },
          { id: 'cross_contamination', label: 'Cross Contamination Prevention', type: 'select', options: ['Yes', 'No'] },
          { id: 'food_expiry_check', label: 'Food Expiry Check', type: 'select', options: ['Yes', 'No'] }
        ]
      },
      {
        title: 'Facility Sanitation',
        items: [
          { id: 'water_supply', label: 'Safe Water Supply', type: 'select', options: ['Yes', 'No'] },
          { id: 'hand_washing', label: 'Hand Washing Facilities', type: 'select', options: ['Yes', 'No'] },
          { id: 'waste_disposal', label: 'Waste Disposal', type: 'select', options: ['Adequate', 'Inadequate'] },
          { id: 'cleanliness', label: 'Overall Cleanliness', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Poor'] },
          { id: 'pest_control', label: 'Pest Control Measures', type: 'select', options: ['Yes', 'No'] }
        ]
      }
    ]
  },
  [INSPECTION_TYPES.HOTEL_GUESTHOUSE]: {
    title: 'Hotel/Guest House Inspection',
    sections: [
      {
        title: 'Establishment Details',
        items: [
          { id: 'establishment_name', label: 'Establishment Name', type: 'text' },
          { id: 'owner_name', label: 'Owner/Manager Name', type: 'text' },
          { id: 'category', label: 'Category', type: 'select', options: ['Hotel', 'Guest House', 'Lodge', 'Motel'] },
          { id: 'star_rating', label: 'Star Rating', type: 'select', options: ['1 Star', '2 Star', '3 Star', '4 Star', '5 Star', 'Unrated'] },
          { id: 'license_number', label: 'License Number', type: 'text' }
        ]
      },
      {
        title: 'Accommodation Standards',
        items: [
          { id: 'room_condition', label: 'Room Condition', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Poor'] },
          { id: 'bedding_hygiene', label: 'Bedding Hygiene', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Poor'] },
          { id: 'bathroom_facilities', label: 'Bathroom Facilities', type: 'select', options: ['Ensuite', 'Shared', 'Communal'] },
          { id: 'water_supply', label: 'Water Supply', type: 'select', options: ['24/7', 'Limited', 'Intermittent'] },
          { id: 'electricity_backup', label: 'Electricity Backup', type: 'select', options: ['Yes', 'No'] }
        ]
      },
      {
        title: 'Food & Beverage',
        items: [
          { id: 'kitchen_hygiene', label: 'Kitchen Hygiene', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Poor'] },
          { id: 'food_storage', label: 'Food Storage', type: 'select', options: ['Adequate', 'Inadequate'] },
          { id: 'dining_area', label: 'Dining Area Cleanliness', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Poor'] },
          { id: 'food_handlers_health', label: 'Food Handlers Health Certificates', type: 'select', options: ['Valid', 'Expired', 'None'] }
        ]
      }
    ]
  },
  [INSPECTION_TYPES.MEDICAL_SCREENING]: {
    title: 'Medical Screening Inspection',
    sections: [
      {
        title: 'Event/Organization Details',
        items: [
          { id: 'organization_name', label: 'Organization Name', type: 'text' },
          { id: 'event_location', label: 'Event Location', type: 'text' },
          { id: 'screening_date', label: 'Screening Date', type: 'date' },
          { id: 'number_attended', label: 'Number Attended', type: 'number' },
          { id: 'screening_type', label: 'Screening Type', type: 'select', options: ['General Health', 'Occupational', 'Food Handlers', 'Student Health', 'Community Outreach'] }
        ]
      },
      {
        title: 'Medical Equipment',
        items: [
          { id: 'blood_pressure_machine', label: 'Blood Pressure Machine', type: 'select', options: ['Available', 'Not Available'] },
          { id: 'weight_scale', label: 'Weight Scale', type: 'select', options: ['Available', 'Not Available'] },
          { id: 'height_measure', label: 'Height Measure', type: 'select', options: ['Available', 'Not Available'] },
          { id: 'thermometer', label: 'Thermometer', type: 'select', options: ['Available', 'Not Available'] },
          { id: 'first_aid_kit', label: 'First Aid Kit', type: 'select', options: ['Available', 'Not Available'] }
        ]
      },
      {
        title: 'Medical Personnel',
        items: [
          { id: 'qualified_nurse', label: 'Qualified Nurse Present', type: 'select', options: ['Yes', 'No'] },
          { id: 'doctor_present', label: 'Doctor Present', type: 'select', options: ['Yes', 'No'] },
          { id: 'staff_trained', label: 'Staff Trained in Screening', type: 'select', options: ['Yes', 'No'] }
        ]
      }
    ]
  },
  [INSPECTION_TYPES.INDUSTRY]: {
    title: 'Industrial Inspection',
    sections: [
      {
        title: 'Factory Details',
        items: [
          { id: 'factory_name', label: 'Factory/Industry Name', type: 'text' },
          { id: 'industry_type', label: 'Industry Type', type: 'select', options: ['Manufacturing', 'Processing', 'Packaging', 'Construction', 'Other'] },
          { id: 'owner_name', label: 'Owner/Manager Name', type: 'text' },
          { id: 'license_number', label: 'License Number', type: 'text' },
          { id: 'number_employees', label: 'Number of Employees', type: 'number' }
        ]
      },
      {
        title: 'Occupational Health & Safety',
        items: [
          { id: 'ppe_availability', label: 'PPE Availability', type: 'select', options: ['Adequate', 'Inadequate', 'None'] },
          { id: 'safety_training', label: 'Safety Training Provided', type: 'select', options: ['Yes', 'No'] },
          { id: 'emergency_exits', label: 'Emergency Exits', type: 'select', options: ['Adequate', 'Inadequate', 'None'] },
          { id: 'fire_extinguishers', label: 'Fire Extinguishers', type: 'select', options: ['Available', 'Not Available'] },
          { id: 'first_aid_box', label: 'First Aid Box', type: 'select', options: ['Available', 'Not Available'] }
        ]
      },
      {
        title: 'Environmental Compliance',
        items: [
          { id: 'waste_management', label: 'Waste Management System', type: 'select', options: ['Adequate', 'Inadequate', 'None'] },
          { id: 'effluent_treatment', label: 'Effluent Treatment', type: 'select', options: ['Yes', 'No'] },
          { id: 'air_quality', label: 'Air Quality Control', type: 'select', options: ['Yes', 'No'] },
          { id: 'noise_control', label: 'Noise Control Measures', type: 'select', options: ['Yes', 'No'] }
        ]
      }
    ]
  },
  [INSPECTION_TYPES.SCHOOL]: {
    title: 'School Inspection',
    sections: [
      {
        title: 'School Information',
        items: [
          { id: 'school_name', label: 'School Name', type: 'text' },
          { id: 'school_type', label: 'School Type', type: 'select', options: ['Public', 'Private', 'Mission', 'Community'] },
          { id: 'level', label: 'Level', type: 'select', options: ['Primary', 'Junior High', 'Senior High', 'Mixed'] },
          { id: 'enrollment', label: 'Total Enrollment', type: 'number' },
          { id: 'head_teacher', label: 'Head Teacher', type: 'text' }
        ]
      },
      {
        title: 'Sanitation Facilities',
        items: [
          { id: 'toilet_facilities', label: 'Toilet Facilities', type: 'select', options: ['Adequate', 'Inadequate', 'None'] },
          { id: 'toilet_cleanliness', label: 'Toilet Cleanliness', type: 'select', options: ['Good', 'Fair', 'Poor'] },
          { id: 'hand_washing', label: 'Hand Washing Facilities', type: 'select', options: ['Yes', 'No'] },
          { id: 'water_supply', label: 'Safe Water Supply', type: 'select', options: ['Yes', 'No'] },
          { id: 'girls_hygiene', label: 'Menstrual Hygiene Facilities for Girls', type: 'select', options: ['Yes', 'No'] }
        ]
      },
      {
        title: 'Classroom Environment',
        items: [
          { id: 'classroom_condition', label: 'Classroom Condition', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Poor'] },
          { id: 'ventilation', label: 'Ventilation', type: 'select', options: ['Good', 'Fair', 'Poor'] },
          { id: 'lighting', label: 'Lighting', type: 'select', options: ['Good', 'Fair', 'Poor'] },
          { id: 'seating', label: 'Seating Arrangement', type: 'select', options: ['Adequate', 'Inadequate'] }
        ]
      }
    ]
  }
};