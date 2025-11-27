import React, { useState } from 'react';

const ResultViewer = ({ originalUrl, resultUrl }) => {
    const [sliderPos, setSliderPos] = useState(50);

    const handleSliderChange = (e) => {
        setSliderPos(e.target.value);
    };

    return (
        <div className="glass-panel">
            <h2>Magic Complete! ✨</h2>
            <div
                className="canvas-container"
                style={{ width: '100%', maxWidth: '600px', height: '400px', position: 'relative', overflow: 'hidden' }}
            >
                {/* Background Image (Result) */}
                <img
                    src={resultUrl}
                    alt="Result"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                    }}
                />

                {/* Foreground Image (Original) - Clipped */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: `${sliderPos}%`,
                        height: '100%',
                        overflow: 'hidden',
                        borderRight: '2px solid white'
                    }}
                >
                    <img
                        src={originalUrl}
                        alt="Original"
                        style={{
                            width: '100vw', // Hack to keep aspect ratio? No, need container width
                            maxWidth: '600px', // Match container
                            height: '100%',
                            objectFit: 'contain'
                        }}
                    />
                </div>

                {/* Slider Input */}
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderPos}
                    onChange={handleSliderChange}
                    style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '10%',
                        width: '80%',
                        zIndex: 10
                    }}
                />
            </div>
            <div style={{ marginTop: '1rem' }}>
                <a
                    href={resultUrl}
                    download
                    className="btn"
                    style={{ textDecoration: 'none' }}
                >
                    Download Result
                </a>
            </div>
        </div>
    );
};

export default ResultViewer;
