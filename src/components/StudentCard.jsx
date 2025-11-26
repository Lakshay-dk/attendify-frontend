const StudentCard = ({ student }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 m-2">
      <h3 className="text-lg font-bold">{student.name}</h3>
      <p>Email: {student.email}</p>
      <p>Roll Number: {student.rollNumber}</p>
      {student.qrCode && (
        <img src={student.qrCode} alt="QR Code" className="w-32 h-32 mt-2" />
      )}
    </div>
  );
};

export default StudentCard;
