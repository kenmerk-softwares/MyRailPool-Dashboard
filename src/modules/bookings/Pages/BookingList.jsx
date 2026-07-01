import React, { useEffect, useState } from 'react';
import { Eye, Plus } from 'lucide-react';
import { SectionHeader } from '../../../components/Shared';
import { Table } from '../../../shared/Table/Table';
import { useNavigate } from 'react-router-dom';
import { useBookings } from '../hooks/booking.useBookings';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../../shared/services/firebase';

const parseDateTime = (val) => {
  if (!val) return { date: '', time: '' };
  
  let dateObj = null;
  if (typeof val === 'number') {
    dateObj = new Date(val);
  } else if (val && typeof val.toDate === 'function') {
    dateObj = val.toDate();
  } else {
    const str = String(val).trim();
    let normalized = str.replace(',', '').replace(/\s+/, 'T');
    
    const dmmmPattern = /^\d{1,2}-[A-Za-z]{3}-\d{4}$/;
    if (dmmmPattern.test(str)) {
      return { date: str, time: '' };
    }

    dateObj = new Date(normalized);
    if (isNaN(dateObj.getTime())) {
      dateObj = new Date(str);
    }
  }

  if (!dateObj || isNaN(dateObj.getTime())) {
    const strVal = String(val);
    const timeMatch = strVal.match(/\b\d{1,2}:\d{2}\b/);
    const time = timeMatch ? timeMatch[0] : '';
    let date = strVal.replace(/\b\d{1,2}:\d{2}\b/, '').replace(/[,]/g, '').trim();
    return { date, time };
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = dateObj.getDate();
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  const formattedDate = `${day}-${month}-${year}`;

  const hours = dateObj.getHours();
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  
  let formattedTime = '';
  if (
    typeof val === 'number' || 
    (val && typeof val.toDate === 'function') || 
    String(val).includes(':') || 
    String(val).toLowerCase().includes('t')
  ) {
    formattedTime = `${hours}:${minutes}`;
  }

  return { date: formattedDate, time: formattedTime };
};

const formatCurrency = (val) => {
  if (val === undefined || val === null || val === '') return '';
  const str = String(val).trim();
  const cleanNumStr = str.replace('£', '').trim();
  const num = Number(cleanNumStr.replace(/[^0-9.-]/g, ''));
  if (isNaN(num)) return str;
  return `£${num.toFixed(2)}`;
};

const formatPaymentMethod = (method) => {
  if (!method) return '';
  const str = String(method).toLowerCase().trim();
  if (str === 'online') return 'Online';
  if (str === 'cash') return 'Cash';
  if (str === 'offline') return 'Offline';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const BookingList = () => {
    const navigate = useNavigate();
    const { bookings, loading, hasMore, fetchBookings, allFilteredBookingsRef } = useBookings();
    const [searchQuery, setSearchQuery] = React.useState('');
    const [activeFilter, setActiveFilter] = React.useState('');
    const [fromDate, setFromDate] = React.useState('');
    const [toDate, setToDate] = React.useState('');

    const handleClear = () => {
        setFromDate('');
        setToDate('');
        setActiveFilter('');
        setSearchQuery('');
    };

    useEffect(() => {
        fetchBookings({ searchQuery, activeFilter, fromDate, toDate });
    }, [searchQuery, activeFilter, fromDate, toDate, fetchBookings]);

    const handleView = (booking) => {
        navigate(`/bookings/view/${encodeURIComponent(booking.id)}`);
    };

    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        const targetBookings = allFilteredBookingsRef.current;
        if (targetBookings.length === 0 || exporting) return;
        setExporting(true);
        try {
            // 1. Gather unique driver, vehicle, trip, and finance IDs
            const uniqueDriverIds = Array.from(
                new Set([
                    ...targetBookings.map(b => b.driver_id),
                    ...targetBookings.flatMap(b => b.users?.map(u => u.driver_id) || [])
                ].filter(Boolean))
            );

            const uniqueVehicleIds = Array.from(
                new Set([
                    ...targetBookings.map(b => b.vehicle_id),
                    ...targetBookings.flatMap(b => b.users?.map(u => u.vehicle_id) || [])
                ].filter(Boolean))
            );

            const uniqueTripIds = Array.from(
                new Set([
                    ...targetBookings.map(b => b.tripId)
                ].filter(Boolean))
            );

            const uniqueFinanceIds = Array.from(
                new Set(
                    targetBookings.flatMap(b => b.users?.map(u => u.financeId) || [])
                )
            ).filter(Boolean);

            // 2. Fetch corresponding collections in parallel
            const [driverSnaps, vehicleSnaps, tripSnaps, financeSnaps] = await Promise.all([
                Promise.all(uniqueDriverIds.map(id => getDoc(doc(db, 'drivers', id)))),
                Promise.all(uniqueVehicleIds.map(id => getDoc(doc(db, 'vehicles', id)))),
                Promise.all(uniqueTripIds.map(id => getDoc(doc(db, 'trips', id)))),
                Promise.all(uniqueFinanceIds.map(id => getDoc(doc(db, 'finance', id))))
            ]);

            const driverMap = {};
            driverSnaps.forEach(snap => {
                if (snap.exists()) {
                    driverMap[snap.id] = snap.data();
                }
            });

            const vehicleMap = {};
            vehicleSnaps.forEach(snap => {
                if (snap.exists()) {
                    vehicleMap[snap.id] = snap.data();
                }
            });

            const tripMap = {};
            tripSnaps.forEach(snap => {
                if (snap.exists()) {
                    tripMap[snap.id] = snap.data();
                }
            });

            const financeMap = {};
            financeSnaps.forEach(snap => {
                if (snap.exists()) {
                    financeMap[snap.id] = snap.data();
                }
            });

            // 3. Fetch users for profile mapping (names, mobile, email)
            const usersColRef = collection(db, 'users');
            const usersSnap = await getDocs(usersColRef);
            const userMap = {};
            usersSnap.forEach(uDoc => {
                const uData = uDoc.data();
                if (uData) {
                    userMap[uDoc.id] = uData;
                }
            });

            const headers = [
                'Booking_Request_Reference', 'Booking_ID', 'Date_Requested', 'Time_Requested',
                'Booking_Channel', 'Journey_Status', 'Passenger_First_Name', 'Passenger_Last_Name',
                'Contact_Phone', 'Contact_Email', 'Passenger_Count', 'Pickup_Date', 'Pickup_Time',
                'Pickup_Location', 'Booked_Destination', 'Actual_Dropoff (If different)', 'Actual_Dropoff_Time',
                'Fare_Quoted_Amount', 'Fare_Quoted_Date_Time', 'Fare_Confirmed_YN', 'Fare_Confirmed_Date_Time',
                'Fare_Confirmation_Channel', 'Payment_Method', 'Amount_Paid', 'Accessibility_Needs_YN',
                'Accessibility_Details', 'Third_Row_Seat_Warning_YN', 'PSV_Consent_YN', 'Accepted_By',
                'Dispatched_By', 'Driver_Name', 'Driver_Licence_No', 'Vehicle_Reg', 'Vehicle_Licence_No',
                'Other_Drivers_Responded', 'Subcontracted_YN', 'Subcontracted_To', 'Subcontracted_Date_Time',
                'Cancelled_YN', 'Cancellation_By', 'Cancellation_Date_Time', 'Notes'
            ];

            const rows = targetBookings.flatMap((booking) => {
                const users = booking.users || [];
                const mapRow = (u) => {
                    const driverId = booking.driver_id || u.driver_id;
                    const driverObj = driverId ? driverMap[driverId] : null;

                    const vehicleId = u.vehicle_id || booking.vehicle_id;
                    const vehicleObj = vehicleId ? vehicleMap[vehicleId] : null;

                    const tripId = booking.tripId;
                    const tripObj = tripId ? tripMap[tripId] : null;

                    const financeId = u.financeId;
                    const financeObj = financeId ? financeMap[financeId] : null;
                    const bookingRequestReference = booking.req_ref || 
                        u.bookingNo || 
                        (financeObj?.bookingNos && (Array.isArray(financeObj.bookingNos) ? financeObj.bookingNos[0] : financeObj.bookingNos)) || 
                        '';

                    // Fallbacks for date-times
                    const reqDateTime = parseDateTime(booking.req_date || booking.createdAt);

                    let pickupDateTimeVal = booking.pickup_date;
                    if (!pickupDateTimeVal && tripObj) {
                        if (tripObj.trip_date && tripObj.start_time) {
                            pickupDateTimeVal = `${tripObj.trip_date} ${tripObj.start_time}`;
                        } else {
                            pickupDateTimeVal = tripObj.trip_date || tripObj.start_time;
                        }
                    }
                    const pickupDateTime = parseDateTime(pickupDateTimeVal);

                    const fareQuotedDateTime = parseDateTime(booking.fare_date);
                    const fareConfirmedDateTime = parseDateTime(booking.fare_confirm_date);
                    const subcontractDateTime = parseDateTime(booking.subcontract_date);
                    const cancelDateTime = parseDateTime(booking.cancel_date || (booking.status?.toLowerCase() === 'cancelled' ? booking.updatedAt : ''));

                    // Split name into first and last name
                    const passengerName = u.name || booking.name || userMap[u.userId || booking.userId]?.name || '';
                    const nameParts = passengerName.trim().split(/\s+/);
                    const firstName = nameParts[0] || '';
                    const lastName = nameParts.slice(1).join(' ') || '';

                    // Journey Status
                    const journeyStatus = booking.status || '';

                    return [
                        bookingRequestReference,
                        booking.booking_id || booking.id || '',
                        reqDateTime.date,
                        reqDateTime.time,
                        u.bookingChannel || booking.channel || 'system',
                        journeyStatus,
                        firstName,
                        lastName,
                        u.phone || u.mobile || booking.phone || userMap[u.userId || booking.userId]?.mobile || userMap[u.userId || booking.userId]?.phone || '',
                        u.email || booking.email || userMap[u.userId || booking.userId]?.email || '',
                        booking.p_count || u.bookingCount || 1,
                        pickupDateTime.date,
                        pickupDateTime.time,
                        u.startingPoint || booking.pickup || tripObj?.start_loc || '',
                        u.dropPoint || booking.destination || tripObj?.end_loc || '',
                        booking.actual_dropoff || tripObj?.actual_dest || '',
                        booking.drop_time || tripObj?.end_time || '',
                        formatCurrency(booking.fare || tripObj?.price),
                        fareQuotedDateTime.date,
                        booking.fare_confirm || (booking.status ? 'Yes' : 'No'),
                        fareConfirmedDateTime.date,
                        u.paymentConfirmationChannel || booking.fare_channel || 'system',
                        formatPaymentMethod(booking.payment || u.paymentType),
                        formatCurrency(u.totalFare || booking.paid),
                        (u.accessNeeds || booking.access_need || 'no').toLowerCase() === 'yes' ? 'Yes' : 'No',
                        u.accessDetails || booking.access_details || '',
                        booking.third_row_warn || 'No',
                        booking.psv_consent || 'Yes',
                        booking.accepted_by || 'System',
                        booking.dispatched_by || '',
                        booking.driver || booking.driver_name || driverObj?.name || '',
                        booking.driver_lic || driverObj?.phLicenseNumber || driverObj?.dvlaLicenseNumber || '',
                        booking.vehicle_reg || vehicleObj?.registrationNo || '',
                        booking.vehicle_lic || vehicleObj?.phVehicleLicence || '',
                        booking.other_drivers || 'None',
                        booking.subcontracted || 'No',
                        booking.subcontract_to || '',
                        subcontractDateTime.date,
                        booking.cancelled || (booking.status?.toLowerCase() === 'cancelled' ? 'Yes' : 'No'),
                        booking.cancel_by || '',
                        cancelDateTime.date,
                        booking.notes || ''
                    ];
                };

                if (users.length === 0) {
                    return [mapRow({})];
                }
                return users.map(u => mapRow(u));
            });

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `Bookings_Elaborated_Report_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            console.error('Error exporting bookings:', e);
        } finally {
            setExporting(false);
        }
    };

    return (
        <>
            <SectionHeader
                title="Booking Management"
                subtitle="View and manage all trip booking records."
                actionLabel="Create Booking"
                actionIcon={Plus}
                actionTo="/bookings/add"
                onExportClick={handleExport}
            />
            <div className="pb-10">
                <Table
                    headers={[
                        'Sl No', 'Trip No', 'Route', 'From', 'To',
                        'Travel Date', 'Driver', 'Booked / Total'
                    ]}
                    data={bookings}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    activeFilter={activeFilter}
                    setActiveFilter={setActiveFilter}
                    onClear={handleClear}
                    fromDate={fromDate}
                    setFromDate={setFromDate}
                    toDate={toDate}
                    setToDate={setToDate}
                    searchPlaceholder="Search by trip, route, driver, customer name, mobile..."
                    renderRow={(booking, idx) => {
                        return (
                            <>
                                {/* Sl No */}
                                <td className="px-6 py-4 text-[13px] font-black text-slate-800">
                                    {idx + 1}
                                </td>

                                {/* Trip No */}
                                <td className="px-6 py-4">
                                    <span className="px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 font-extrabold text-[12px] border border-primary-100">
                                        #{booking.tripNo ?? '—'}
                                    </span>
                                </td>

                                {/* Route name */}
                                <td className="px-6 py-4 text-[13px] font-bold text-slate-700 truncate max-w-[140px]">
                                    {booking.route_name || '—'}
                                </td>

                                {/* From */}
                                <td className="px-6 py-4 text-[13px] font-bold text-slate-700 truncate max-w-[120px]">
                                    {booking.route_start || '—'}
                                </td>

                                {/* To */}
                                <td className="px-6 py-4 text-[13px] font-bold text-slate-700 truncate max-w-[120px]">
                                    {booking.route_end || '—'}
                                </td>

                                {/* Travel Date */}
                                <td className="px-6 py-4 text-[13px] font-bold text-slate-600 whitespace-nowrap">
                                    {booking.selectedDate || '—'}
                                </td>

                                {/* Driver */}
                                <td className="px-6 py-4 text-[13px] font-bold text-slate-700">
                                    {booking.driver_name || '—'}
                                </td>

                                {/* Booked / Total seats */}
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-flex items-center gap-1 text-[13px]">
                                        <span className="font-black text-indigo-600">
                                            {booking.bookedCount ?? (booking.users?.length ?? 0)}
                                        </span>
                                        <span className="text-slate-500 font-semibold">/</span>
                                        <span className="font-bold text-slate-600">
                                            {booking.totalSeats ?? '—'}
                                        </span>
                                    </span>
                                </td>

                            </>
                        );
                    }}
                    actions={(booking) => (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleView(booking)}
                                className="p-2 bg-white border border-slate-200 text-slate-500 hover:text-primary-600 hover:border-primary-100 rounded-xl transition-all hover:shadow-lg active:scale-95"
                                title="View Booking"
                            >
                                <Eye className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                />
                {hasMore && (
                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={() => fetchBookings({ searchQuery, activeFilter, isLoadMore: true })}
                            disabled={loading}
                            className="px-8 py-3 bg-white border border-slate-200 text-slate-500 font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                        >
                            {loading ? 'Synchronizing...' : 'Load More Bookings'}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};
