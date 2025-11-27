import React, { useState } from 'react';
import axios from 'axios';
import ImageUploader from './components/ImageUploader';
import ObjectSelector from './components/ObjectSelector';
import ResultViewer from './components/ResultViewer';
import { FaRocket } from 'react-icons/fa';

const API_URL = 'http://127.0.0.1:8001';

function App() {
  const [step, setStep] = useState(1); // 1: Upload, 2: Select, 3: Processing, 4: Result
  const [imagePath, setImagePath] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [detections, setDetections] = useState([]);
  const [maskUrl, setMaskUrl] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/upload`, formData);
      setImagePath(res.data.path);
      setImageUrl(`${API_URL}${res.data.url}`);

      // Detect objects automatically
      const detectRes = await axios.post(`${API_URL}/detect`, null, {
        params: { image_path: res.data.path }
      });
      setDetections(detectRes.data.detections);
      setStep(2);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || err.message || 'Upload failed';
      alert(`Upload failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelection = async (box) => {
    try {
      setLoading(true);
      let maskPath;

      // Check if it's a manual mask or auto-detected box
      if (box.manualMask) {
        // Convert data URL to blob
        const response = await fetch(box.manualMask);
        const blob = await response.blob();
        const formData = new FormData();
        formData.append('file', blob, 'mask.png');

        // Upload manual mask
        const maskRes = await axios.post(`${API_URL}/mask/manual`, formData);
        maskPath = maskRes.data.mask_path;
        setMaskUrl(`${API_URL}${maskRes.data.mask_url}`);
      } else {
        // Generate Mask from box
        const maskRes = await axios.post(`${API_URL}/mask`, {
          image_path: imagePath,
          box: box
        });
        maskPath = maskRes.data.mask_path;
        setMaskUrl(`${API_URL}${maskRes.data.mask_url}`);
      }

      // Remove Object
      const removeRes = await axios.post(`${API_URL}/remove`, {
        image_path: imagePath,
        mask_path: maskPath
      });

      setResultUrl(`${API_URL}${removeRes.data.result_url}`);
      setStep(4);
    } catch (err) {
      console.error(err);
      alert('Processing failed');
    } finally {
      setLoading(false);
    }
  };

  const resetApp = () => {
    setStep(1);
    setImagePath(null);
    setImageUrl(null);
    setDetections([]);
    setMaskUrl(null);
    setResultUrl(null);
    setShowOriginal(false);
  };

  const launchAntigravity = async () => {
    try {
      await axios.get(`${API_URL}/antigravity`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container">
      <h1>✨ Magic AI Eraser ✨</h1>

      {loading && (
        <div className="glass-panel">
          <h2>Processing...</h2>
          <div className="spinner"></div>
        </div>
      )}

      {!loading && step === 1 && (
        <ImageUploader onImageUpload={handleImageUpload} />
      )}

      {!loading && step === 2 && imageUrl && (
        <div className="glass-panel">
          <h2>Click on Object to Remove</h2>
          <p>AI has detected {detections.length} object(s)</p>
          <ObjectSelector
            imageUrl={imageUrl}
            imagePath={imagePath}
            detections={detections}
            onSelectionComplete={handleSelection}
          />
          <button className="btn btn-secondary" onClick={resetApp} style={{ marginTop: '1rem' }}>
            Use Another Image
          </button>
        </div>
      )}

      {!loading && step === 4 && resultUrl && (
        <>
          <ResultViewer
            originalUrl={imageUrl}
            resultUrl={showOriginal ? imageUrl : resultUrl}
          />
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button className="btn btn-secondary" onClick={resetApp}>
              Use Another Image
            </button>
          </div>

          {/* Sidebar */}
          <div className="sidebar">
            <h3>Preview Options</h3>

            <div className="sidebar-item">
              <label>Toggle View</label>
              <button
                className={`toggle-btn ${showOriginal ? 'active' : ''}`}
                onClick={() => setShowOriginal(!showOriginal)}
              >
                {showOriginal ? 'Show Result' : 'Show Original'}
              </button>
            </div>

            <div className="sidebar-item">
              <label>Removed Object Mask</label>
              {maskUrl && <img src={maskUrl} alt="Mask" />}
            </div>

            <div className="sidebar-item">
              <label>Original Image</label>
              {imageUrl && <img src={imageUrl} alt="Original" />}
            </div>

            <div className="sidebar-item">
              <label>Final Result</label>
              {resultUrl && <img src={resultUrl} alt="Result" />}
            </div>
          </div>
        </>
      )}

      <div className="magic-btn" onClick={launchAntigravity} title="Launch Antigravity">
        🛸
      </div>
    </div>
  );
}

export default App;
