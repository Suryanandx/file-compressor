import React, { useState } from 'react';
import { Button } from '@mui/material';
import Dropzone from 'react-dropzone';
import JSZip from 'jszip';

const FilesToZip = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [zipBlob, setZipBlob] = useState(null);

  const handleFileDrop = (acceptedFiles) => {
    setSelectedFiles([...selectedFiles, ...acceptedFiles]);
  };

  const handleConvertToZip = async () => {
    if (selectedFiles.length === 0) return;

    const zip = new JSZip();

    // Add each selected file to the ZIP
    selectedFiles.forEach((file) => {
      zip.file(file.name, file);
    });

    // Generate the ZIP file
    const zipBlob = await zip.generateAsync({ type: 'blob' });

    // Set the generated ZIP blob in state
    setZipBlob(zipBlob);
  };

  const handleDownloadZip = () => {
    if (!zipBlob) return;

    const a = document.createElement('a');
    a.href = URL.createObjectURL(zipBlob);
    a.download = 'files.zip'; // Customize the downloaded ZIP file name
    a.click();
  };

  return (
    <div>
      <Dropzone onDrop={handleFileDrop}>
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()} style={dropzoneStyle}>
            <input {...getInputProps()} />
            <p>Drag and drop files here, or click to select</p>
          </div>
        )}
      </Dropzone>
      {selectedFiles.length > 0 && (
        <Button variant="contained" color="primary" onClick={handleConvertToZip}>
          Convert to ZIP
        </Button>
      )}
      {zipBlob && (
        <Button variant="contained" color="secondary" onClick={handleDownloadZip}>
          Download ZIP
        </Button>
      )}
    </div>
  );
};

const dropzoneStyle = {
  border: '2px dashed #ccc',
  borderRadius: '4px',
  padding: '20px',
  textAlign: 'center',
  cursor: 'pointer',
};

export default FilesToZip;
