export const bookingsData = [
  {req_ref: "MRP-00001",booking_id: "MRP-00001",req_date: "2026-02-07, 18:44",channel: "Website",status: "COMPLETED",name: "A J",phone: null,email: null,p_count: 1,pickup_date: "2026-02-12, 07:35",pickup: "Wolverhampton",destination: "Ambleside ",actual_dropoff: null,drop_time: null,fare: "₹3",fare_date: "2026-02-08",fare_confirm: "Yes",fare_confirm_date: "2026-02-08",fare_channel: "WhatsApp Business",payment: "Bank Transfer",paid: "₹3",access_need: "No",access_details: null,third_row_warn: null,psv_consent: null,accepted_by: null,dispatched_by: null,driver: "Abhilash",driver_lic: null,vehicle_reg: "OY71KYS",vehicle_lic: null,other_drivers: null,subcontracted: null,subcontract_to: null,subcontract_date: null,cancelled: null,cancel_by: null,cancel_date: null,notes: null},
  {req_ref: "MRP-00002",booking_id: "MRP-00002",req_date: "2026-02-07, 18:44",channel: "Website",status: "COMPLETED",name: "A J",phone: null,email: null,p_count: 1,pickup_date: "2026-02-12, 20:05",pickup: "Ambleside",destination: "Wolverhampton",actual_dropoff: null,drop_time: null,fare: "₹3",fare_date: "2026-02-08",fare_confirm: "Yes",fare_confirm_date: "2026-02-08",fare_channel: "WhatsApp Business",payment: "Bank Transfer",paid: "₹3",access_need: "No",access_details: null,third_row_warn: null,psv_consent: null,accepted_by: null,dispatched_by: null,driver: "Augustine",driver_lic: null,vehicle_reg: "OY71KYS",vehicle_lic: null,other_drivers: null,subcontracted: null,subcontract_to: null,subcontract_date: null,cancelled: null,cancel_by: null,cancel_date: null,notes: null}
];

export const tripsData = [
  {trip_id: "TR-001",trip_date: "2026-02-12",week: 7,year: 2026,month: "February",status: "COMPLETED",route: "Wolverhampton to Stratford-upon-Avon",driver: "Abhilash Pullelil Augustine",driver_lic: null,vehicle_reg: "OY71KYS",start_time: "07:35",end_time:"08:50",start_loc: "4-5 Victoria Square, Wolverhampton",end_loc: "Ambleside Care Home",actual_dest: null,total_bookings: 1,total_pcount: 1,booking_ids: ["MRP-00001"],stops: [],notes: null,price: "₹3",driver_cost: null,profit: null,miles: null,saved_money: null,co2_saved: null},
  {trip_id: "TR-002",trip_date: "2026-02-12",week: 7,year: 2026,month: "February",status: "COMPLETED",route: "Stratford-upon-Avon to Wolverhampton",driver: "Abhilash Pullelil Augustine",driver_lic: null,vehicle_reg: "OY71KYS",start_time: "20:05",end_time: "21:35",start_loc: "Ambleside Care Home",end_loc: "4-5 Victoria Square, Wolverhampton",actual_dest: null,total_bookings: 1,total_pcount: 1,booking_ids: ["MRP-00002"],stops: [],notes: null,price: "₹3",driver_cost: null,profit: null,miles: null,saved_money: null,co2_saved: null}
];

export const routesData = [
  { id: '#RT-001', name: 'Airport Setup', start: 'Airport Terminal 1', end: 'Downtown City Center', distance: '14 km', estPrice: '₹1,200',timings:'10:00 AM - 5:00 PM',return_timing:'10:00 AM - 5:00 PM', route_type:'one_way',status: 'Active',driver:'James Miller',vehicle:'Toyota Innova (MH-12-AB-3456)', days_op: 'Mon, Wed, Fri', time_slots: '10:00, 14:00, 16:00' },
  { id: '#RT-002', name: 'Central Station', start: 'Main Railway Station', end: 'Tech Park', distance: '8 km', estPrice: '₹600',timings:'10:00 AM - 5:00 PM',return_timing:'10:00 AM - 5:00 PM', route_type:'round_trip', status: 'Active',driver:'Robert Taylor',vehicle:'Honda City (MH-12-CD-7890)', days_op: 'Daily', time_slots: '08:00 - 20:00' },
  { id: '#RT-003', name: 'City Tour Route', start: 'Hotel District', end: 'Historical Monuments', distance: '22 km', estPrice: '₹2,500',timings:'10:00 AM - 5:00 PM',return_timing:'10:00 AM - 5:00 PM', route_type:'one_way', status: 'Inactive',driver:'Unassigned',vehicle:'Unassigned', days_op: 'Sat, Sun', time_slots: '09:00, 11:00, 13:00, 15:00' },
];

export const driversData = [
    {driver_id: "DR-001",status: "active",name: "Abhilash Augustine",ph_lic: "PH123456",ph_exp: "2027-03-01",dvla_lic: "DVLA987654",dvla_exp: "2027-03-01",dbs_no: "DBS001122",dbs_date: "2026-01-10",medical_ex: "No",training_done: "Yes",training_date: "2026-01-15",rtw_date: "2026-01-20",rtw_note: "Verified",start_date: "2026-01-01",end_date: null,phone: "+44 7700 900111",email: "abhilash@example.com",address: "Wolverhampton, UK",termination_reason: null,council_notified: "Yes",notes: "Experienced driver"},
    {driver_id: "DR-002",status: "active",name: "Robert Taylor",ph_lic: "PH654321",ph_exp: "2027-06-15",dvla_lic: "DVLA123789",dvla_exp: "2027-06-15",dbs_no: "DBS334455",dbs_date: "2026-02-05",medical_ex: "No",training_done: "Yes",training_date: "2026-02-10",rtw_date: "2026-02-12",rtw_note: "Verified",start_date: "2026-02-01",end_date: null,phone: "+44 7700 900222",email: "robert@example.com",address: "Birmingham, UK",termination_reason: null,council_notified: "Yes",notes: "Part-time driver"},
    {driver_id: "DR-003",status: "inactive",name: "Michael Chen",ph_lic: "PH789123",ph_exp: "2026-12-20",dvla_lic: "DVLA456321",dvla_exp: "2026-12-20",dbs_no: "DBS556677",dbs_date: "2025-12-01",medical_ex: "Yes",training_done: "Yes",training_date: "2025-12-10",rtw_date: "2025-12-15",rtw_note: "Verified",start_date: "2025-12-01",end_date: "2026-03-01",phone: "+44 7700 900333",email: "michael@example.com",address: "London, UK",termination_reason: "Contract ended",council_notified: "No",notes: "No longer active"}
];

export const vehiclesData = [
  { id: 'VH-881',make:'Toyota', model: 'Innova Crysta',colour:'white',driver:'James Miller',registration_no: 'MH-12-AB-3456',ph_vehicle_licence_no:'MH-12-AB-3456',licence_expiry:'2026-03-24',insurence_provider:'ICICI',policy_no:'123456789',insurence_expiry:'2026-03-24',type: 'SUV', capacity: '6+1', status: 'Active',notes:'notes' },
  { id: 'VH-882',make:'Honda', model: 'City',colour:'white',driver:'Robert Taylor', type: 'Sedan', registration_no: 'MH-12-CD-7890',ph_vehicle_licence_no:'MH-12-AB-3456',licence_expiry:'2026-03-24',insurence_provider:'ICICI',policy_no:'123456789',insurence_expiry:'2026-03-24', capacity: '4+1', status: 'Active',notes:'notes' },
  { id: 'VH-883',make:'Maruti', model: 'Dzire',colour:'white',driver:'Michael Chen', type: 'Sedan', registration_no: 'MH-14-EF-1234',ph_vehicle_licence_no:'MH-12-AB-3456',licence_expiry:'2026-03-24',insurence_provider:'ICICI',policy_no:'123456789',insurence_expiry:'2026-03-24', capacity: '4+1', status: 'Maintenance',notes:'notes' },
];

export const adminUsersData = [
  { id: '#AU-001', name: 'Admin 1', email: 'admin@gmail.com', role: 'Super Admin', status: 'Active' },
  { id: '#AU-002', name: 'Admin 2', email: 'admin@gmail.com', role: 'Admin', status: 'Active' },
  { id: '#AU-003', name: 'Admin 3', email: 'admin@gmail.com', role: 'Viewer', status: 'Inactive' }
];

export const designations = [
  { id: '1', designationName: 'Super Admin' },
  { id: '2', designationName: 'Admin' },
  { id: '3', designationName: 'Viewer' },
];

export const mockRequests = [
  {id: "RR-2024-001",customerName: "Arun Kumar",customerPhone: "+91 98765 43210",customerEmail: "arun.k@example.com",pickup: "Indira Nagar, Bangalore",drop: "Electronic City Phase 1, Bangalore",passengerCount: 3,requestSentAt: "2024-04-21T09:30:00Z",routeDates: ["2024-04-22T08:00:00Z", "2024-04-23T08:00:00Z"],status: "Pending",message: "Need a clean car with good AC. Traveling with family."
  },
  {id: "RR-2024-002",customerName: "Priya Sharma",customerPhone: "+91 87654 32109",customerEmail: "priya.s@example.com",pickup: "Whitefield, Bangalore",drop: "Kempegowda International Airport",passengerCount: 1,requestSentAt: "2024-04-21T10:15:00Z",routeDates: ["2024-04-22T04:30:00Z"],status: "Accepted",message: "Early morning flight, please be on time."
  },
  {id: "RR-2024-003",customerName: "Rahul Verma",customerPhone: "+91 76543 21098",customerEmail: "rahul.v@example.com",pickup: "Koramangala 4th Block",drop: "Manyata Tech Park",passengerCount: 2,requestSentAt: "2024-04-20T18:00:00Z",routeDates: ["2024-04-21T09:00:00Z"],status: "Rejected",message: "Daily commute for a week.",rejectionReason: "No drivers available",rejectionComment: "All drivers on this route are fully booked for the requested time slot."
  },
  {id: "RR-2024-004",customerName: "Sanjana Reddy",customerPhone: "+91 99887 76655",customerEmail: "sanjana.r@example.com",pickup: "HSR Layout Sector 2",drop: "JP Nagar 6th Phase",passengerCount: 4,requestSentAt: "2024-04-21T11:00:00Z",routeDates: ["2024-04-22T17:30:00Z"],status: "Accepted",message: "Group outing, spacious vehicle required.",assignedDriver: "Vikram Singh",assignedVehicle: "Toyota Innova (KA 01 MG 1234)"
  },
  {id: "RR-2024-005",customerName: "Amitabh Bose",customerPhone: "+91 91234 56789",customerEmail: "amitabh.b@example.com",pickup: "M.G. Road",drop: "Yeshwanthpur Railway Station",passengerCount: 2,requestSentAt: "2024-04-21T11:20:00Z",routeDates: ["2024-04-22T10:00:00Z", "2024-04-22T16:00:00Z"],status: "Pending",message: "Traveling with heavy luggage."
  }
];

// PAYMENTS

export const mockPayments = [
  {id: "BK-7821",customer: "Arjun Mehta",driver: "Rajesh Kumar",route: "Indiranagar to Koramangala",amount: 450,method: "UPI",status: "Paid",transactionId: "TXN_991203401",dateTime: "2024-04-20 10:15 AM",fareBreakdown: {baseFare: 300,distance: 100,time: 50,tax: 20,discount: 20},paymentDetail: {total: 450,commission: 45,driverEarnings: 405}},
  {id: "BK-7822",customer: "Sneha Reddy",driver: "Vikram Singh",route: "Whitefield to MG Road",amount: 620,method: "Card",status: "Pending",transactionId: "-",dateTime: "2024-04-20 11:20 AM",fareBreakdown: {baseFare: 450,distance: 120,time: 80,tax: 30,discount: 60},paymentDetail: {total: 620,commission: 62,driverEarnings: 558}},
  {id: "BK-7823",customer: "Michael Scott",driver: "Dwight Schrute",route: "Scranton to Stamford",amount: 1200,method: "Wallet",status: "Failed",transactionId: "TXN_FAIL_0012",dateTime: "2024-04-19 09:45 PM",fareBreakdown: {baseFare: 800,distance: 300,time: 150,tax: 50,discount: 100},paymentDetail: {total: 1200,commission: 120,driverEarnings: 1080}},
  {id: "BK-7824",customer: "Priya Sharma",driver: "Abdul Khan",route: "HSR Layout to Sarjapur",amount: 310,method: "Cash",status: "Paid",transactionId: "CASH_REF_7824",dateTime: "2024-04-19 08:30 PM",fareBreakdown: {baseFare: 200,distance: 60,time: 40,tax: 15,discount: 5},paymentDetail: {total: 310,commission: 31,driverEarnings: 279}},
  {id: "BK-7825",customer: "Rahul Vera",driver: "Rajesh Kumar",route: "Airport T2 to Hebbal",amount: 890,method: "UPI",status: "Refunded",transactionId: "TXN_991203552",dateTime: "2024-04-19 05:15 PM",fareBreakdown: {baseFare: 600,distance: 180,time: 120,tax: 40,discount: 50},paymentDetail: {total: 890,commission: 89,driverEarnings: 801}},
  {id: "BK-7826",customer: "Ananya Roy",driver: "Suresh Patil",route: "Electronic City to Manyata",amount: 540,method: "Card",status: "Paid",transactionId: "TXN_991203670",dateTime: "2024-04-19 02:00 PM",fareBreakdown: {baseFare: 350,distance: 120,time: 70,tax: 25,discount: 25},paymentDetail: {total: 540,commission: 54,driverEarnings: 486}}
];

export const revenueChartData = [
  { name: 'Mon', revenue: 4500, success: 42 },
  { name: 'Tue', revenue: 5200, success: 48 },
  { name: 'Wed', revenue: 4800, success: 45 },
  { name: 'Thu', revenue: 6100, success: 55 },
  { name: 'Fri', revenue: 7500, success: 68 },
  { name: 'Sat', revenue: 8900, success: 82 },
  { name: 'Sun', revenue: 9200, success: 85 }
];

export const methodDistributionData = [
  { name: 'UPI', value: 45, color: '#6366f1' },
  { name: 'Card', value: 25, color: '#ec4899' },
  { name: 'Wallet', value: 20, color: '#10b981' },
  { name: 'Cash', value: 10, color: '#f59e0b' }
];