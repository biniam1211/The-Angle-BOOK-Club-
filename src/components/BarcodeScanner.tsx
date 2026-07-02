import React, { useEffect, useRef, useState } from 'react';
import { BottomSheet } from './BottomSheet';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (isbn: string) => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  isOpen,
  onClose,
  onScan,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [scanning, setScanning] = useState(false);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }

      setStream(mediaStream);
      setScanning(true);
    } catch (error) {
      console.error('Failed to access camera:', error);
      alert('Camera access denied');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setScanning(false);
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
  };

  // Simple barcode detection simulation
  // In production, use a library like @zxing/browser or quagga2
  const scanBarcode = () => {
    // This is a placeholder - real implementation would use
    // barcode scanning library like ZXing or Quagga

    // For demo purposes, you'd integrate with a real scanner library here
    console.log('Scanning for barcode...');
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
      scanIntervalRef.current = setInterval(scanBarcode, 500);
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const handleManualInput = () => {
    const isbn = prompt('Enter ISBN manually:');
    if (isbn) {
      onScan(isbn);
      stopCamera();
      onClose();
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} snapPoints={[0.9]} title="Scan Barcode">
      <div className="barcode-scanner">
        <div className="scanner-preview">
          <video ref={videoRef} autoPlay playsInline muted />
          <div className="scanner-overlay">
            <div className="scanner-frame">
              <div className="scanner-corner scanner-corner-tl" />
              <div className="scanner-corner scanner-corner-tr" />
              <div className="scanner-corner scanner-corner-bl" />
              <div className="scanner-corner scanner-corner-br" />
              <div className="scanner-line" />
            </div>
          </div>
        </div>

        <div className="scanner-instructions">
          <p>Point camera at the book's barcode</p>
          {scanning && <div className="scanner-status">Scanning...</div>}
        </div>

        <div className="scanner-controls">
          <button className="btn-cancel" onClick={handleClose}>
            Cancel
          </button>
          <button className="btn-manual" onClick={handleManualInput}>
            Enter ISBN Manually
          </button>
        </div>
      </div>
    </BottomSheet>
  );
};
