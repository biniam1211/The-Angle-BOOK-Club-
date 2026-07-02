import React, { useRef, useState } from 'react';
import { BottomSheet } from './BottomSheet';

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageData: string) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Back camera
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }

      setStream(mediaStream);
    } catch (error) {
      console.error('Failed to access camera:', error);
      alert('Camera access denied. Please enable camera permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
  };

  const handleUsePhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      handleClose();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    onClose();
  };

  React.useEffect(() => {
    if (isOpen) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} snapPoints={[0.9]}>
      <div className="camera-capture">
        {!capturedImage ? (
          <>
            <div className="camera-preview">
              <video ref={videoRef} autoPlay playsInline muted />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
            <div className="camera-controls">
              <button className="camera-btn-cancel" onClick={handleClose}>
                Cancel
              </button>
              <button className="camera-btn-capture" onClick={capturePhoto}>
                <div className="camera-shutter" />
              </button>
              <div style={{ width: 80 }} /> {/* Spacer */}
            </div>
          </>
        ) : (
          <>
            <div className="camera-preview">
              <img src={capturedImage} alt="Captured" />
            </div>
            <div className="camera-controls">
              <button className="camera-btn-retake" onClick={handleRetake}>
                Retake
              </button>
              <button className="camera-btn-use" onClick={handleUsePhoto}>
                Use Photo
              </button>
            </div>
          </>
        )}
      </div>
    </BottomSheet>
  );
};
