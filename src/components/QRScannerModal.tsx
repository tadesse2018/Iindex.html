import React, { useEffect, useRef, useState } from 'react';
import { 
  X, 
  Camera, 
  QrCode, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  CalendarDays,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import jsQR from 'jsqr';
import { Student } from '../schoolData';
import { playInteractiveSound } from './AudioEngine';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onLoginSuccess: (studentId: string) => void;
  onMarkAttendance: (studentId: string) => { success: boolean; studentName: string; isAlreadyMarked: boolean };
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  students,
  onLoginSuccess,
  onMarkAttendance
}) => {
  const [scanMode, setScanMode] = useState<'login' | 'attendance'>('login');
  const [isKioskMode, setIsKioskMode] = useState<boolean>(false); // Continuous scanning for attendance
  const [cameraPermission, setCameraPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Success Feedbacks for Attendance Scanner
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    studentName: string;
    studentId: string;
    message: string;
    timestamp: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize and query cameras
  useEffect(() => {
    if (!isOpen) return;

    const initDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(device => device.kind === 'videoinput');
        setVideoDevices(videoInputs);
        
        if (videoInputs.length > 0) {
          // Default to the environment/back camera if available, otherwise first camera
          const backCam = videoInputs.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment'));
          setSelectedDeviceId(backCam ? backCam.deviceId : videoInputs[0].deviceId);
        }
      } catch (err) {
        console.warn('Error enumerating cameras:', err);
      }
    };

    initDevices();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // Restart camera when device ID changes
  useEffect(() => {
    if (isOpen && selectedDeviceId) {
      startCamera(selectedDeviceId);
    }
  }, [selectedDeviceId, isOpen]);

  const startCamera = async (deviceId: string) => {
    stopCamera();
    setErrorMsg(null);
    setCameraPermission('prompt');

    try {
      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: 'environment' }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setCameraPermission('granted');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // Required for iOS
        videoRef.current.play();
        setIsScanning(true);
        // Start decoding loop
        animationFrameRef.current = requestAnimationFrame(tick);
      }
    } catch (err: any) {
      console.error('Camera capture error:', err);
      setCameraPermission('denied');
      setErrorMsg('ካሜራውን መክፈት አልተቻለም። እባክዎን የካሜራ ፈቃድ መፍቀድዎን ያረጋግጡ። (Unable to open camera. Please ensure camera permissions are granted.)');
      playInteractiveSound('wrong');
    }
  };

  const stopCamera = () => {
    setIsScanning(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Switch to the next available camera
  const switchCamera = () => {
    if (videoDevices.length <= 1) return;
    playInteractiveSound('click');
    const currentIndex = videoDevices.findIndex(d => d.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % videoDevices.length;
    setSelectedDeviceId(videoDevices[nextIndex].deviceId);
  };

  // Process camera frame using jsQR
  const tick = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        // Draw offscreen for QR decoding
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          // Detected QR Code!
          const scannedId = code.data.trim().toUpperCase();
          handleScannedCode(scannedId);
          return; // Stop scanning after successful read to prevent spamming
        }
      }
    }

    if (isScanning) {
      animationFrameRef.current = requestAnimationFrame(tick);
    }
  };

  // Handle scanned student ID
  const handleScannedCode = (studentId: string) => {
    // Validate student ID format (Must start with 'ID-' followed by digits)
    const isFormatValid = /^ID-\d+$/i.test(studentId);
    
    if (!isFormatValid) {
      playInteractiveSound('wrong');
      setScanResult({
        success: false,
        studentId,
        studentName: 'ያልተፈቀደ የQR ኮድ (Invalid QR Code)',
        message: `የQR ኮዱ ፎርማት ልክ አይደለም። የተማሪ መታወቂያ በ 'ID-' መጀመር አለበት። ያገኙት እሴት: "${studentId.substring(0, 30)}${studentId.length > 30 ? '...' : ''}" (The QR code format is invalid. School student IDs must start with 'ID-'. Scanned value: "${studentId.substring(0, 30)}${studentId.length > 30 ? '...' : ''}")`,
        timestamp: new Date().toLocaleTimeString('am-ET', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });

      // Resume scanning after 4 seconds if in Continuous Kiosk Mode, otherwise let user clear
      if (isKioskMode && scanMode === 'attendance') {
        setTimeout(() => {
          setScanResult(null);
          resumeScanning();
        }, 4000);
      }
      return;
    }

    // Validate if Student exists in database
    const matchedStudent = students.find(s => s.id.toUpperCase() === studentId);
    
    if (!matchedStudent) {
      playInteractiveSound('wrong');
      setScanResult({
        success: false,
        studentId,
        studentName: 'ያልተመዘገበ መታወቂያ (Student Not Found)',
        message: `ተማሪ መታወቂያ "${studentId}" በሲስተሙ ውስጥ አልተገኘም። እባክዎ በትክክል መመዝገቡን ያረጋግጡ። (Student ID "${studentId}" was not found in the student database. Please check registration.)`,
        timestamp: new Date().toLocaleTimeString('am-ET', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });

      // Resume scanning after 4 seconds if in Continuous Kiosk Mode, otherwise let user clear
      if (isKioskMode && scanMode === 'attendance') {
        setTimeout(() => {
          setScanResult(null);
          resumeScanning();
        }, 4000);
      }
      return;
    }

    if (scanMode === 'login') {
      // In login mode, trigger login callback and close scanner immediately
      playInteractiveSound('success');
      onLoginSuccess(matchedStudent.id);
      stopCamera();
      onClose();
    } else {
      // Attendance Mode: record attendance
      const record = onMarkAttendance(matchedStudent.id);
      
      setScanResult({
        success: true,
        studentId: matchedStudent.id,
        studentName: matchedStudent.name,
        message: record.isAlreadyMarked 
          ? `የዛሬ አቴንዳንስ ቀደም ብሎ ተመዝግቧል! (Attendance already marked for today!)`
          : `የዛሬ መገኘት (Attendance) በተሳካ ሁኔታ ተመዝግቧል! (Attendance successfully marked for today!)`,
        timestamp: new Date().toLocaleTimeString('am-ET', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });

      // Automatically reset scanner to scan next student in continuous mode
      if (isKioskMode) {
        setTimeout(() => {
          setScanResult(null);
          resumeScanning();
        }, 2500);
      }
    }
  };

  const resumeScanning = () => {
    setScanResult(null);
    setIsScanning(true);
    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(tick);
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans animate-fade-in"
      id="qr-scanner-modal-backdrop"
    >
      <div 
        className="relative bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col"
        id="qr-scanner-modal-container"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/30">
              <QrCode className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-black text-stone-900 dark:text-white uppercase tracking-tight">የQR ኮድ ስካነር (QR Code Scanner)</h3>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Scan Student QR Code to Login or Register Attendance</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all"
            id="qr-scanner-close-button"
            title="ዝጋ (Close)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs / Controls */}
        <div className="p-4 bg-stone-50/50 dark:bg-stone-950/10 border-b border-stone-100 dark:border-stone-800 grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              playInteractiveSound('click');
              setScanMode('login');
              setScanResult(null);
              if (!isScanning && cameraPermission === 'granted') resumeScanning();
            }}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 border ${
              scanMode === 'login'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-750 hover:bg-stone-100'
            }`}
            id="scanner-tab-login"
          >
            <UserCheck className="w-4 h-4" />
            <span>ወደ ፖርታል መግቢያ (Portal Login)</span>
          </button>
          
          <button
            onClick={() => {
              playInteractiveSound('click');
              setScanMode('attendance');
              setScanResult(null);
              if (!isScanning && cameraPermission === 'granted') resumeScanning();
            }}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 border ${
              scanMode === 'attendance'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-750 hover:bg-stone-100'
            }`}
            id="scanner-tab-attendance"
          >
            <CalendarDays className="w-4 h-4" />
            <span>አቴንዳንስ መመዝገቢያ (Attendance)</span>
          </button>
        </div>

        {/* Attendance Mode Specific Toggles */}
        {scanMode === 'attendance' && (
          <div className="px-5 py-3 bg-emerald-50/50 dark:bg-emerald-950/10 border-b border-emerald-100/40 dark:border-emerald-900/20 flex justify-between items-center text-xs">
            <span className="font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0" />
              ተከታታይ ፈጣን መመዝገቢያ (Continuous Kiosk Mode)
            </span>
            <button
              onClick={() => {
                playInteractiveSound('click');
                setIsKioskMode(!isKioskMode);
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isKioskMode ? 'bg-emerald-600' : 'bg-stone-200 dark:bg-stone-700'
              }`}
              id="scanner-kiosk-toggle"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  isKioskMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        )}

        {/* Hidden canvas for image decoding */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Scanner Content Body */}
        <div className="p-6 flex-1 flex flex-col items-center justify-center min-h-[320px] bg-stone-100/50 dark:bg-stone-950/30">
          {errorMsg ? (
            <div className="text-center p-6 max-w-sm space-y-3">
              <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400 leading-relaxed">{errorMsg}</p>
              <button
                onClick={() => startCamera(selectedDeviceId)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"
              >
                በድጋሚ ሞክር (Retry Camera)
              </button>
              <p className="text-[10px] text-stone-400 mt-2">
                * Note: If inside a workspace iframe, please try opening the application in a <b>New Tab</b> using the Development or Shared App URL at the top for camera access to work properly!
              </p>
            </div>
          ) : cameraPermission === 'prompt' ? (
            <div className="text-center p-6 space-y-3">
              <Camera className="w-12 h-12 text-stone-400 dark:text-stone-600 mx-auto animate-bounce" />
              <p className="text-xs font-semibold text-stone-600 dark:text-stone-300">ካሜራውን ለመክፈት ፍቃድ እየጠየቅን ነው...</p>
              <p className="text-[10px] text-stone-400 max-w-xs mx-auto">Please allow camera permissions in your browser to scan the QR codes.</p>
            </div>
          ) : (
            <>
              {/* Real-time Scan Status Banner */}
              <div className="w-full max-w-sm mb-4">
                {scanResult ? (
                  scanResult.success ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 p-2.5 rounded-2xl text-xs flex items-center gap-2 font-bold justify-center animate-fade-in shadow-xs">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 animate-bounce" />
                      <span>ስካን ተሳክቷል! (Scan Successful!)</span>
                    </div>
                  ) : (
                    <div className="bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 p-2.5 rounded-2xl text-xs flex flex-col items-center gap-1 font-bold justify-center animate-fade-in shadow-xs">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 animate-bounce" />
                        <span className="uppercase tracking-wide">የስካን ስህተት አጋጥሟል! (Scan Error!)</span>
                      </div>
                      <span className="text-[10px] text-rose-500/80 dark:text-rose-400/80 font-medium text-center">እባክዎ ትክክለኛውን የተማሪ QR ኮድ ያቅርቡ። (Please present a valid Student QR code)</span>
                    </div>
                  )
                ) : isScanning ? (
                  <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-400 p-2.5 rounded-2xl text-xs flex items-center gap-2 font-bold justify-center animate-fade-in">
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-500 shrink-0 animate-spin" />
                    <span>QR ኮዱን ለካሜራው ያቅርቡ... (Awaiting QR code scan...)</span>
                  </div>
                ) : (
                  <div className="bg-stone-500/10 border border-stone-500/20 text-stone-600 dark:text-stone-400 p-2.5 rounded-2xl text-xs flex items-center gap-2 font-bold justify-center animate-fade-in">
                    <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>ስካነር ተዘጋጅቷል (Scanner Standby)</span>
                  </div>
                )}
              </div>

              <div className={`relative w-full max-w-sm aspect-video sm:aspect-square bg-black rounded-3xl border-2 transition-all duration-300 overflow-hidden shadow-inner group ${
                scanResult 
                  ? scanResult.success 
                    ? 'border-emerald-500 shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-500/20' 
                    : 'border-rose-500 shadow-lg shadow-rose-500/35 ring-2 ring-rose-500/20'
                  : 'border-stone-300 dark:border-stone-850 hover:border-indigo-400'
              }`}>
                {/* WebRTC Video Stream */}
                <video 
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  id="scanner-camera-feed"
                />

                {/* Laser Scanning Line Animation */}
                {isScanning && !scanResult && (
                  <div className="absolute inset-x-0 h-0.5 bg-rose-500 shadow-md shadow-rose-500 top-0 animate-scan-laser z-10" />
                )}

                {/* Viewport scan square guide */}
                {!scanResult && (
                  <div className="absolute inset-0 flex items-center justify-center z-5">
                    <div className="w-48 h-48 border-2 border-dashed border-indigo-400 dark:border-indigo-400 rounded-2xl relative shadow-inner">
                      {/* Corner accents */}
                      <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-indigo-600 rounded-tl-lg animate-pulse" />
                      <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-indigo-600 rounded-tr-lg animate-pulse" />
                      <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-indigo-600 rounded-bl-lg animate-pulse" />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-indigo-600 rounded-br-lg animate-pulse" />
                    </div>
                  </div>
                )}

                {/* Feedback Overlay upon scanning */}
                <AnimatePresence>
                  {scanResult && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={scanResult.success 
                        ? { opacity: 1, scale: 1 } 
                        : { opacity: 1, scale: 1, x: [0, -10, 10, -10, 10, -5, 5, 0] }
                      }
                      transition={{ duration: scanResult.success ? 0.35 : 0.55, ease: 'easeInOut' }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20 ${
                        scanResult.success 
                          ? 'bg-emerald-950/95 text-white' 
                          : 'bg-rose-950/95 text-white'
                      }`}
                      id="scan-result-overlay"
                    >
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${
                        scanResult.success ? 'bg-emerald-500/20 text-emerald-400 animate-pulse' : 'bg-rose-500/20 text-rose-400 animate-bounce'
                      }`}>
                        {scanResult.success ? (
                          <CheckCircle className="w-10 h-10" />
                        ) : (
                          <AlertTriangle className="w-10 h-10" />
                        )}
                      </div>

                      <span className="text-[10px] uppercase font-bold tracking-widest text-stone-300 mb-1">
                        {scanResult.timestamp} {scanResult.studentId && `| ${scanResult.studentId}`}
                      </span>
                      <h4 className="text-lg font-black">{scanResult.studentName}</h4>
                      <p className="text-xs mt-2 opacity-90 max-w-xs mx-auto leading-relaxed font-semibold">
                        {scanResult.message}
                      </p>

                      {/* Reset Button (If not in auto-kiosk mode) */}
                      {!isKioskMode && (
                        <button
                          onClick={resumeScanning}
                          className={`mt-4 px-5 py-2.5 rounded-xl text-xs font-black shadow-md transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 ${
                            scanResult.success 
                              ? 'bg-emerald-500 hover:bg-emerald-400 text-white' 
                              : 'bg-rose-500 hover:bg-rose-400 text-white'
                          }`}
                          id="scanner-next-button"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>{scanResult.success ? 'ቀጣይ ተማሪ ስካን (Scan Next)' : 'በድጋሚ ይሞክሩ (Try Again)'}</span>
                        </button>
                      )}

                      {isKioskMode && (
                        <div className="mt-4 flex items-center gap-1.5 text-[10px] text-stone-300 font-bold animate-pulse">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          በ4 ሰከንድ ውስጥ በራሱ ዳግም ይጀምራል... (Auto-resuming in 4s...)
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-stone-50 dark:bg-stone-950/20 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span className="text-[10px] text-stone-500 dark:text-stone-400 font-semibold">
              {isScanning ? 'ካሜራው ገባሪ ነው (Camera Active)' : 'ካሜራው ቆሟል (Camera Stopped)'}
            </span>
          </div>

          {videoDevices.length > 1 && (
            <button
              onClick={switchCamera}
              className="px-4 py-2 rounded-xl text-xs font-black bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 transition-all flex items-center justify-center gap-1.5 shadow-3xs"
              id="scanner-switch-camera-btn"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>ካሜራ ቀይር (Switch Camera)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
