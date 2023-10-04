import React, { useState } from 'react';
import FileReducer from './FileReducer';
import PDFOptimizer from './PDF-Optimizer';
import FileSelector from './components/FileSelector';

function App() {
  const [selectedFileType, setSelectedFileType] = useState(0);

  const handleFileTypeChange = (value) => {
    setSelectedFileType(value);
  };

  return (
    <div className="App">
      <FileSelector onChange={handleFileTypeChange} />
      <div style={{ marginTop: '20px' }}>
        {selectedFileType === 0 ? <FileReducer /> : <PDFOptimizer />}
      </div>
    </div>
  );
}

export default App;
