import React, { useState } from 'react';
import axios from 'axios';
import { Button, CircularProgress, Container, Typography, Paper } from '@mui/material';

const PDFOptimizer = () => {
  const [file, setFile] = useState(null);
  const [compressedFileUrl, setCompressedFileUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setCompressedFileUrl(null);
    setError(null);
  };

  const optimizePDF = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      // Send a POST request to the server
      const response = await axios.post('http://localhost:6060/upload', formData, {
        responseType: 'blob', // Receive a binary response
      });

      // Create a URL for the Blob
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Set the compressed file for download
      setCompressedFileUrl(url);
    } catch (error) {
      console.error('Error optimizing PDF:', error);
      setError('Error optimizing PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Paper elevation={3} style={{ padding: '20px', textAlign: 'center' }}>
        <Typography variant="h5" component="h1" gutterBottom>
          PDF Optimizer
        </Typography>
        <input type="file" accept=".pdf" onChange={handleFileChange} />
        {/* <label htmlFor="file-input">
          <Button variant="outlined" component="span">
            Choose PDF File
          </Button>
        </label> */}
        <Typography variant="body2" color="textSecondary" style={{ margin: '10px 0' }}>
          {file ? `Selected File: ${file.name}` : 'No file selected'}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={optimizePDF}
          disabled={!file || loading}
          sx={{mr: 2}}
        >
          Optimize PDF
        </Button>
        {loading && <CircularProgress style={{ margin: '10px 0' }} />}
        {error && (
          <Typography variant="body2" color="error" style={{ margin: '10px 0' }}>
            {error}
          </Typography>
        )}
        {compressedFileUrl && (
          <Button
          
            color="inherit"
            href={compressedFileUrl}
            download="compressed.pdf"
            style={{ margin: '10px 0' }}
          >
            Download Compressed File
          </Button>
        )}
      </Paper>
    </Container>
  );
};

export default PDFOptimizer;
