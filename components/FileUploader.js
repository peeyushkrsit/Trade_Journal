'use client';

import { useState, useRef } from 'react';
import { sanitizeOCRText, extractTradeDataFromOCR } from '@/lib/utils';
import toast from 'react-hot-toast';

// Lazy load Tesseract.js to reduce initial bundle size (~2MB saved on initial load)
let createWorker;
const loadTesseract = async () => {
  if (!createWorker) {
    const tesseract = await import('tesseract.js');
    createWorker = tesseract.createWorker;
  }
  return createWorker;
};

export default function FileUploader({ onOCRComplete, onDataExtracted, onFileSelect }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type.startsWith('image/')) {
        setFile(selectedFile);
        if (onFileSelect) onFileSelect(selectedFile);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        toast.error('Please select an image file');
      }
    }
  };

  const handleCameraCapture = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // Create a video element for camera preview
      const video = document.createElement('video');
      video.setAttribute('autoplay', '');
      video.setAttribute('playsinline', '');
      
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          video.srcObject = stream;
          // For simplicity, we'll just trigger file input
          // In production, you'd want a proper camera capture UI
          toast.info('Camera capture - please use file upload for now');
          fileInputRef.current?.click();
        })
        .catch((error) => {
          toast.error('Camera access denied');
          fileInputRef.current?.click();
        });
    } else {
      fileInputRef.current?.click();
    }
  };

  const processOCR = async () => {
    if (!file) {
      toast.error('Please select an image first');
      return;
    }

    setProcessing(true);
    try {
      // Dynamically load Tesseract.js only when needed
      const createWorkerFn = await loadTesseract();
      const worker = await createWorkerFn('eng');
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      const sanitized = sanitizeOCRText(text);
      setOcrText(sanitized);

      // Extract trade data
      const extracted = extractTradeDataFromOCR(sanitized);
      if (onDataExtracted) {
        onDataExtracted(extracted);
      }
      if (onOCRComplete) {
        onOCRComplete(sanitized);
      }

      toast.success('OCR completed successfully');
    } catch (error) {
      console.error('OCR error:', error);
      toast.error('OCR processing failed');
    } finally {
      setProcessing(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setOcrText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Upload Screenshot
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Upload screenshot from your broker or TradingView. OCR often works but please confirm fields.
        </p>
        
        <div className="flex gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-card border border-gray-700 rounded-lg text-white hover:bg-card-hover transition-colors"
          >
            Choose File
          </button>
          <button
            type="button"
            onClick={handleCameraCapture}
            className="px-4 py-2 bg-card border border-gray-700 rounded-lg text-white hover:bg-card-hover transition-colors"
          >
            Camera
          </button>
          {file && (
            <button
              type="button"
              onClick={clearFile}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {preview && (
        <div className="mt-4">
          <img
            src={preview}
            alt="Preview"
            className="max-w-full h-auto rounded-lg border border-gray-800"
          />
          <button
            type="button"
            onClick={processOCR}
            disabled={processing}
            className="mt-3 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {processing ? 'Processing OCR...' : 'Extract Text with OCR'}
          </button>
        </div>
      )}

      {ocrText && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Extracted Text (editable)
          </label>
          <textarea
            value={ocrText}
            onChange={(e) => {
              setOcrText(e.target.value);
              const extracted = extractTradeDataFromOCR(e.target.value);
              if (onDataExtracted) {
                onDataExtracted(extracted);
              }
            }}
            rows={8}
            className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary font-mono text-sm"
            placeholder="OCR text will appear here..."
          />
        </div>
      )}
    </div>
  );
}

