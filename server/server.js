const express = require('express');
const multer = require('multer');
const { PdfConvert } = require('pdf-convert-js');
const fs = require('fs');
const cors = require('cors'); // Import the cors module
const fileUpload = require("express-fileupload");
const { fork } = require("child_process");

const app = express();
const port = 6060; // Set the port to 6060

// Enable CORS with an origin of '*'
app.use(cors());
app.use(
  fileUpload({
    tempFileDir: "temp",
    useTempFiles: true,
  })
);

// Set up multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/compress-video", (req, res) => {
  const video = req.body.video;

  // When file is uploaded it is stored in temp file
  // this is made possible by express-fileupload
  const tempFilePath = video.tempFilePath;

  if (video && tempFilePath) {
    // Create a new child process
    const child = fork("video.js");

    // Send message to child process
    child.send({ tempFilePath, name: video.name });

    // Listen for message from child process
    child.on("message", (message) => {
      const { statusCode, text, compressedVideoPath } = message;

      if (statusCode === 200) {
        // Send the compressed video file as a downloadable attachment
        res.status(200);
        res.setHeader("Content-Disposition", `attachment; filename=${video.name}`);
        res.sendFile(compressedVideoPath);
      } else {
        res.status(statusCode).send(text);
      }
    });
  } else {
    res.status(400).send("No file uploaded");
  }
});



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
