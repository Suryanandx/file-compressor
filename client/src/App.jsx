import React, { useState } from 'react';
import FileReducer from './FileReducer';
import PDFOptimizer from './PDF-Optimizer';
import FileSelector from './components/FileSelector';
import MediaCompressor from './components/MediaCompressor';
import FilesToZip from './components/FilesToZip';

function App() {
  const [selectedFileType, setSelectedFileType] = useState(0);

  const handleFileTypeChange = (value) => {
    setSelectedFileType(value);
  };

  return (
    <div className="App">
      <FileSelector onChange={handleFileTypeChange} />
      <div style={{ marginTop: '20px' }}>
        {selectedFileType === 0 && <FileReducer /> }
        {selectedFileType === 1 && <PDFOptimizer />}
        {selectedFileType === 2 && <MediaCompressor/>}
        {selectedFileType === 3 && <FilesToZip />}
      </div>
    </div>
  );
}

export default App;
