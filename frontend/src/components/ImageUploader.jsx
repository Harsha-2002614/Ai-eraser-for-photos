import React, { useCallback } from 'react';
import { FaCloudUploadAlt } from 'react-icons/fa';

const ImageUploader = ({ onImageUpload }) => {
    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            onImageUpload(file);
        }
    };

    const handleChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onImageUpload(file);
        }
    };

    return (
        <div
            className="glass-panel upload-zone"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
        >
            <input
                type="file"
                id="file-upload"
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleChange}
            />
            <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                <FaCloudUploadAlt size={64} color="#6366f1" />
                <h3>Drag & Drop or Click to Upload</h3>
                <p style={{ color: '#94a3b8' }}>Supports JPG, PNG</p>
            </label>
        </div>
    );
};

export default ImageUploader;
