import { useRef, useEffect } from 'react';
import QrScanner from 'qr-scanner';
import Webcam from 'react-webcam';

const QRScanner = ({ onScan }) => {
  const webcamRef = useRef(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (webcamRef.current) {
      scannerRef.current = new QrScanner(
        webcamRef.current.video,
        (result) => {
          onScan(result.data);
          scannerRef.current.stop();
        },
        {
          onDecodeError: (err) => {
            console.error(err);
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );
      scannerRef.current.start();
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
      }
    };
  }, [onScan]);

  return (
    <div className="flex flex-col items-center">
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        videoConstraints={{ facingMode: 'environment' }}
        className="w-full max-w-md"
      />
      <p className="mt-4 text-center">Scan the QR code to mark attendance</p>
    </div>
  );
};

export default QRScanner;
