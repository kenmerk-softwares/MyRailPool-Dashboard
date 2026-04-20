export const mockPayments = [
  {id: "BK-7821",
    customer: "Arjun Mehta",
    driver: "Rajesh Kumar",
    route: "Indiranagar to Koramangala",
    amount: 450,
    method: "UPI",
    status: "Paid",
    transactionId: "TXN_991203401",
    dateTime: "2024-04-20 10:15 AM",
    fareBreakdown: {
      baseFare: 300,
      distance: 100,
      time: 50,
      tax: 20,
      discount: 20
    },
    paymentDetail: {
      total: 450,
      commission: 45,
      driverEarnings: 405
    }
  },
  {
    id: "BK-7822",
    customer: "Sneha Reddy",
    driver: "Vikram Singh",
    route: "Whitefield to MG Road",
    amount: 620,
    method: "Card",
    status: "Pending",
    transactionId: "-",
    dateTime: "2024-04-20 11:20 AM",
    fareBreakdown: {
      baseFare: 450,
      distance: 120,
      time: 80,
      tax: 30,
      discount: 60
    },
    paymentDetail: {
      total: 620,
      commission: 62,
      driverEarnings: 558
    }
  },
  {
    id: "BK-7823",
    customer: "Michael Scott",
    driver: "Dwight Schrute",
    route: "Scranton to Stamford",
    amount: 1200,
    method: "Wallet",
    status: "Failed",
    transactionId: "TXN_FAIL_0012",
    dateTime: "2024-04-19 09:45 PM",
    fareBreakdown: {
      baseFare: 800,
      distance: 300,
      time: 150,
      tax: 50,
      discount: 100
    },
    paymentDetail: {
      total: 1200,
      commission: 120,
      driverEarnings: 1080
    }
  },
  {
    id: "BK-7824",
    customer: "Priya Sharma",
    driver: "Abdul Khan",
    route: "HSR Layout to Sarjapur",
    amount: 310,
    method: "Cash",
    status: "Paid",
    transactionId: "CASH_REF_7824",
    dateTime: "2024-04-19 08:30 PM",
    fareBreakdown: {
      baseFare: 200,
      distance: 60,
      time: 40,
      tax: 15,
      discount: 5
    },
    paymentDetail: {
      total: 310,
      commission: 31,
      driverEarnings: 279
    }
  },
  {
    id: "BK-7825",
    customer: "Rahul Vera",
    driver: "Rajesh Kumar",
    route: "Airport T2 to Hebbal",
    amount: 890,
    method: "UPI",
    status: "Refunded",
    transactionId: "TXN_991203552",
    dateTime: "2024-04-19 05:15 PM",
    fareBreakdown: {
      baseFare: 600,
      distance: 180,
      time: 120,
      tax: 40,
      discount: 50
    },
    paymentDetail: {
      total: 890,
      commission: 89,
      driverEarnings: 801
    }
  },
  {
    id: "BK-7826",
    customer: "Ananya Roy",
    driver: "Suresh Patil",
    route: "Electronic City to Manyata",
    amount: 540,
    method: "Card",
    status: "Paid",
    transactionId: "TXN_991203670",
    dateTime: "2024-04-19 02:00 PM",
    fareBreakdown: {
      baseFare: 350,
      distance: 120,
      time: 70,
      tax: 25,
      discount: 25
    },
    paymentDetail: {
      total: 540,
      commission: 54,
      driverEarnings: 486
    }
  }
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
