export const bookingsData = [
  {req_ref: "MRP-00001",booking_id: "MRP-00001",req_date: "2026-02-07, 18:44",channel: "Website",status: "COMPLETED",name: "A J",phone: null,email: null,p_count: 1,pickup_date: "2026-02-12, 07:35",pickup: "Wolverhampton",destination: "Ambleside ",actual_dropoff: null,drop_time: null,fare: "₹3",fare_date: "2026-02-08",fare_confirm: "Yes",fare_confirm_date: "2026-02-08",fare_channel: "WhatsApp Business",payment: "Bank Transfer",paid: "₹3",access_need: "No",access_details: null,third_row_warn: null,psv_consent: null,accepted_by: null,dispatched_by: null,driver: "Abhilash",driver_lic: null,vehicle_reg: "OY71KYS",vehicle_lic: null,other_drivers: null,subcontracted: null,subcontract_to: null,subcontract_date: null,cancelled: null,cancel_by: null,cancel_date: null,notes: null},
  {req_ref: "MRP-00002",booking_id: "MRP-00002",req_date: "2026-02-07, 18:44",channel: "Website",status: "COMPLETED",name: "A J",phone: null,email: null,p_count: 1,pickup_date: "2026-02-12, 20:05",pickup: "Ambleside",destination: "Wolverhampton",actual_dropoff: null,drop_time: null,fare: "₹3",fare_date: "2026-02-08",fare_confirm: "Yes",fare_confirm_date: "2026-02-08",fare_channel: "WhatsApp Business",payment: "Bank Transfer",paid: "₹3",access_need: "No",access_details: null,third_row_warn: null,psv_consent: null,accepted_by: null,dispatched_by: null,driver: "Augustine",driver_lic: null,vehicle_reg: "OY71KYS",vehicle_lic: null,other_drivers: null,subcontracted: null,subcontract_to: null,subcontract_date: null,cancelled: null,cancel_by: null,cancel_date: null,notes: null}
];

export const tripsData = [
  {trip_id: "TR-001",trip_date: "2026-02-12",week: 7,year: 2026,month: "February",status: "COMPLETED",route: "Wolverhampton to Stratford-upon-Avon",driver: "Abhilash Pullelil Augustine",driver_lic: null,vehicle_reg: "OY71KYS",start_time: "07:35",end_time:"08:50",start_loc: "4-5 Victoria Square, Wolverhampton",end_loc: "Ambleside Care Home",actual_dest: null,total_bookings: 1,total_pcount: 1,booking_ids: "MRP-00001",notes: null,price: "₹3",driver_cost: null,profit: null,miles: null,saved_money: null,co2_saved: null},
  {trip_id: "TR-002",trip_date: "2026-02-12",week: 7,year: 2026,month: "February",status: "COMPLETED",route: "Stratford-upon-Avon to Wolverhampton",driver: "Abhilash Pullelil Augustine",driver_lic: null,vehicle_reg: "OY71KYS",start_time: "20:05",end_time: "21:35",start_loc: "Ambleside Care Home",end_loc: "4-5 Victoria Square, Wolverhampton",actual_dest: null,total_bookings: 1,total_pcount: 1,booking_ids: "MRP-00002",notes: null,price: "₹3",driver_cost: null,profit: null,miles: null,saved_money: null,co2_saved: null}
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
