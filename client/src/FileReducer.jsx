import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import FFmpeg from 'ffmpeg.js';
import {
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  Grid,
  Typography,
  Paper,
} from '@mui/material';

function FileReducer() {
  const [file, setFile] = useState(null);
  const [reducedFile, setReducedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (!selectedFile) return;

    try {
      setUploading(true); // Show the uploading dialog

      let reducedFileBlob = null;

      if (selectedFile.type.startsWith('image/')) {
        // Reduce image size
        reducedFileBlob = await reduceImageFile(selectedFile);
      } else if (selectedFile.type === 'application/pdf') {
        // Reduce PDF size
        reducedFileBlob = await reducePdfFile(selectedFile);
      } else if (selectedFile.type.startsWith('video/') || selectedFile.type.startsWith('audio/')) {
        // Reduce video/audio size
        reducedFileBlob = await reduceVideoAudioFile(selectedFile);
      } else {
        // Unsupported file type
        alert('Unsupported file type');
      }

      if (reducedFileBlob) {
        setReducedFile(reducedFileBlob);
      }
    } catch (error) {
      console.error('Error reducing file:', error);
    } finally {
      setUploading(false); // Hide the uploading dialog
    }
  };
  const reduceImageFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onload = (event) => {
        const dataUrl = event.target.result;
  
        const img = new Image();
        img.onload = () => {
          // Set the desired width and height for the reduced image
          const maxWidth = 800; // Adjust as needed
          const maxHeight = 600; // Adjust as needed
  
          let width = img.width;
          let height = img.height;
  
          // Check if resizing is needed
          if (width > maxWidth || height > maxHeight) {
            if (width / maxWidth > height / maxHeight) {
              // Width is the dominant factor
              width = maxWidth;
              height = (maxWidth * img.height) / img.width;
            } else {
              // Height is the dominant factor
              height = maxHeight;
              width = (maxHeight * img.width) / img.height;
            }
          }
  
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
  
          // Resize and draw the image on the canvas
          ctx.drawImage(img, 0, 0, width, height);
  
          // Convert the canvas content back to a Blob
          canvas.toBlob(
            (blob) => {
              resolve(blob);
            },
            file.type, // Use the original file type
            0.8 // Adjust the quality (0.8 for 80% quality)
          );
        };
  
        img.onerror = () => {
          reject(new Error('Failed to load the image.'));
        };
  
        img.src = dataUrl;
      };
  
      reader.onerror = () => {
        reject(new Error('Failed to read the file.'));
      };
  
      reader.readAsDataURL(file);
    });
  };
  
  const reducePdfFile = async (file) => {
    // Read the PDF file as an array buffer
    const pdfBytes = await file.arrayBuffer();
  
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBytes);
  
    // Serialize the PDF back to bytes with custom compression settings
    const modifiedPdfBytes = await pdfDoc.save({
      useObjectStreams: false,
      compress: {
        fontSize: 4,   // Adjust font size compression (lower values for smaller size)
        image: 'original', // Use 'original' to keep image quality as is (or adjust as needed)
        useFlate: true,   // Use Flate compression for streams
        optimizationLevel: 0, // Lower optimization level may result in smaller file size
      },
    });
  
    // Create a Blob from the modified PDF bytes
    return new Blob([modifiedPdfBytes], { type: 'application/pdf' });
  };

  const reduceVideoAudioFile = async (file) => {
    const ffmpeg = FFmpeg.createWorker();
    await ffmpeg.load();
  
    try {
      const inputFileName = 'inputFile'; // Name for the input file
      const outputFileName = 'outputFile'; // Name for the output file
  
      // Specify FFmpeg commands to reduce the size of the video or audio file
      const commands = [
        '-i', inputFileName,
        // Add your FFmpeg commands here to reduce size (e.g., resolution, bitrate)
        // For video, you might use options like '-vf', '-b:v', '-s', etc.
        // For audio, you might use options like '-b:a', '-ac', etc.
        outputFileName
      ];
  
      await ffmpeg.write('inputFile', file);
      await ffmpeg.run(...commands);
  
      const result = await ffmpeg.read(outputFileName);
      const reducedBlob = new Blob([result.data], { type: file.type });
  
      return reducedBlob;
    } catch (error) {
      console.error('Error reducing video/audio file:', error);
    } finally {
      ffmpeg.terminate(); // Clean up the FFmpeg worker
    }
  };
  

  const downloadReducedFile = () => {
    if (reducedFile) {
      const url = URL.createObjectURL(reducedFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reduced_file';
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Container>
    <Paper elevation={3} style={{ padding: '20px', textAlign: 'center' }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Image Optimizer
      </Typography>
      <input type="file" accept=".pdf" onChange={handleFileChange}  />
      {/* <label htmlFor="file-input">
        <Button variant="outlined" component="span">
          Choose File
        </Button>
      </label> */}
      <Typography variant="body2" color="textSecondary" style={{ margin: '10px 0' }}>
        {file ? `Selected File: ${file.name}` : 'No file selected'}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={downloadReducedFile}
        disabled={!reducedFile}
      >
        Download Reduced File
      </Button>
      {uploading && (
        <Dialog open={uploading}>
          <DialogContent>
            <Grid container justifyContent="center" alignItems="center" spacing={2}>
              <Grid item>
                <CircularProgress color="primary" />
              </Grid>
              <Grid item>
                <Typography variant="body1">Uploading...</Typography>
              </Grid>
            </Grid>
          </DialogContent>
        </Dialog>
      )}
    </Paper>
  </Container>
  );
}

export default FileReducer;
