import React, { useState } from 'react';
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Container,
} from '@mui/material';
import Dropzone from 'react-dropzone';
import axios from 'axios'; // Import Axios for making HTTP requests

const MediaCompressor = () => {
  const [inputFile, setInputFile] = useState(null);
  const [outputFile, setOutputFile] = useState(null);

  const handleFileDrop = (acceptedFiles) => {
    // Filter accepted files to only keep video files
    const videoFiles = acceptedFiles.filter((file) => file.type.startsWith('video/'));

    if (videoFiles.length > 0) {
      setInputFile(videoFiles[0]); // Only consider the first video file
      setOutputFile(null);
    }
  };

  const compressMedia = async () => {
    if (!inputFile) return;
  
    try {
      const formData = new FormData();
      formData.append('video', inputFile); // Use 'video' as the field name
  
      const response = await axios.post('http://localhost:6060/compress-video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob', // Specify that the response should be treated as a blob
      });
  
      if (response.status === 200) {
        const compressedBlob = response.data;
  
        // Create a temporary URL for the blob
        const blobUrl = URL.createObjectURL(compressedBlob);
  
        // Create a link element and simulate a click to trigger download
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `compressed_video.mp4`; // Customize the downloaded file name
        a.click();
  
        // Clean up the temporary URL after the download
        URL.revokeObjectURL(blobUrl);
      }
    } catch (error) {
      console.error('Error compressing media:', error);
    }
  };
  

  const downloadCompressedMedia = () => {
    if (!outputFile) return;

    const a = document.createElement('a');
    a.href = URL.createObjectURL(outputFile);
    a.download = `compressed_video.mp4`; // Customize the downloaded file name
    a.click();
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" align="center" gutterBottom>
        Media Compressor
      </Typography>
      <Dropzone onDrop={handleFileDrop}>
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()} style={dropzoneStyle}>
            <input {...getInputProps()} />
            <Typography variant="body1" align="center">
              Drag and drop a video file here, or click to select one
            </Typography>
          </div>
        )}
      </Dropzone>
      {inputFile && (
        <Button variant="contained" color="primary" fullWidth onClick={compressMedia} style={{ marginTop: '20px' }}>
          Compress Video
        </Button>
      )}
      {outputFile && (
        <Button
          variant="contained"
          color="secondary"
          fullWidth
          onClick={downloadCompressedMedia}
          style={{ marginTop: '20px' }}
        >
          Download Compressed Video
        </Button>
      )}
    </Container>
  );
};

const dropzoneStyle = {
  border: '2px dashed #ccc',
  borderRadius: '4px',
  padding: '20px',
  textAlign: 'center',
  cursor: 'pointer',
};

export default MediaCompressor;
