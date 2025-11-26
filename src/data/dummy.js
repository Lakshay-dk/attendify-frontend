export const dummyStudents = [
  {
    _id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    rollNumber: '001',
    qrCode: 'data:image/png;base64,...', // Placeholder
  },
  {
    _id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    rollNumber: '002',
    qrCode: 'data:image/png;base64,...', // Placeholder
  },
];

export const dummyAttendance = [
  {
    _id: '1',
    student: { name: 'John Doe', rollNumber: '001' },
    date: '2023-10-01',
    status: 'present',
  },
  {
    _id: '2',
    student: { name: 'Jane Smith', rollNumber: '002' },
    date: '2023-10-01',
    status: 'absent',
  },
];
