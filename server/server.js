const express = require('express');
const multer = require('multer');
const { PdfConvert } = require('pdf-convert-js');
const fs = require('fs');
const cors = require('cors'); // Import the cors module

const app = express();
const port = 6060; // Set the port to 6060

// Enable CORS with an origin of '*'
app.use(cors());

// Set up multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const pdfBuffer = req.file.buffer;
    const pdfConverter = new PdfConvert(pdfBuffer);

    // Compress the PDF file
    const compressedBuffer = await pdfConverter.shrink();

    // Set response headers for file download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=compressed.pdf');

    // Send the compressed file to the client
    res.send(compressedBuffer);

    // Dispose of the converter object
    pdfConverter.dispose();
  } catch (error) {
    console.error('Error compressing PDF:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
