export const bookingsData = [
  { id: '#BK-8493', name: 'Liam Johnson', route: 'Airport to Downtown', date: '2026-03-24, 14:30', status: 'Pending', statusColor: 'warning', price: '₹1,200', driver: null },
  { id: '#BK-8492', name: 'Emma Watson', route: 'Central Station to Hotel', date: '2026-03-23, 11:00', status: 'Approved', statusColor: 'success', price: '₹850', driver: 'James Miller' },
  { id: '#BK-8491', name: 'Noah Smith', route: 'City Tour', date: '2026-03-22, 09:15', status: 'Completed', statusColor: 'slate', price: '₹2,500', driver: 'Robert Taylor' },
  { id: '#BK-8490', name: 'Olivia Brown', route: 'Business District', date: '2026-03-21, 08:00', status: 'Declined', statusColor: 'danger', price: '₹400', driver: null },
];

export const tripsData = [
  { id: '#TR-2041', driver: 'James Miller', vehicle: 'Toyota Innova (MH-12-AB-3456)', route: 'Airport to Downtown', status: 'In Transit', date: 'Today, 14:30' },
  { id: '#TR-2040', driver: 'Robert Taylor', vehicle: 'Honda City (MH-12-CD-7890)', route: 'Central Station to Hotel', status: 'Assigned', date: 'Today, 16:00' },
  { id: '#TR-2039', driver: 'Unassigned', vehicle: 'Unassigned', route: 'City Tour', status: 'Pending', date: 'Tomorrow, 09:00' },
];

export const routesData = [
  { id: '#RT-001', name: 'Airport Setup', start: 'Airport Terminal 1', end: 'Downtown City Center', distance: '14 km', estPrice: '₹1,200', status: 'Active' },
  { id: '#RT-002', name: 'Central Station', start: 'Main Railway Station', end: 'Tech Park', distance: '8 km', estPrice: '₹600', status: 'Active' },
  { id: '#RT-003', name: 'City Tour Route', start: 'Hotel District', end: 'Historical Monuments', distance: '22 km', estPrice: '₹2,500', status: 'Inactive' },
];

export const driversData = [
  { id: '#DR-101', name: 'James Miller', phone: '+91 9876543210', license: 'MH1220110001234', experience: '5 Years', status: 'Active' },
  { id: '#DR-102', name: 'Robert Taylor', phone: '+91 8765432109', license: 'MH1220150009876', experience: '3 Years', status: 'Active' },
  { id: '#DR-103', name: 'Michael Chen', phone: '+91 7654321098', license: 'MH1420180005555', experience: '1 Year', status: 'On Leave' },
];

export const vehiclesData = [
  { id: '#VH-881', model: 'Toyota Innova Crysta', type: 'SUV', plate: 'MH-12-AB-3456', capacity: '6+1', status: 'Active' },
  { id: '#VH-882', model: 'Honda City', type: 'Sedan', plate: 'MH-12-CD-7890', capacity: '4+1', status: 'Active' },
  { id: '#VH-883', model: 'Maruti Dzire', type: 'Sedan', plate: 'MH-14-EF-1234', capacity: '4+1', status: 'Maintenance' },
];
