const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

// Ensure known_faces directory exists
const uploadDir = 'known_faces';
fs.mkdirSync(uploadDir, { recursive: true });

const unknownUploadDir = 'unknown_faces';
fs.mkdirSync(unknownUploadDir, { recursive: true });

// Storage configuration for Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        let filename = req.body.imageName || Date.now();
        filename += path.extname(file.originalname);
        cb(null, filename);
    }
});

const upload = multer({ storage: storage });
app.use(express.json());

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Add routes for the specific HTML files
app.get('/pages/workFlow.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'workFlow.html'));
});

app.get('/pages/knownPersons.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'knownPersons.html'));
});

app.get('/pages/unknownPersons.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'unknownPersons.html'));
});

// Serve images from the known_faces directory
app.use('/known_faces', express.static(path.join(__dirname, uploadDir)));

app.use(express.urlencoded({ extended: true }));

// Route for uploading
app.post('/upload', upload.single('myImage'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    res.send('File uploaded successfully! Access it at /known_faces/' + req.file.filename);
});

// Route to get list of images in the known_faces directory
app.get('/known-images', (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            console.log(err);
            res.status(500).send('Unable to scan directory');
        } else {
            res.json(files);
        }
    });
});

app.get('/unknown-images', (req, res) => {
    fs.readdir(unknownUploadDir, (err, files) => {
        if (err) {
            console.log(err);
            res.status(500).send('Unable to scan directory');
        } else {
            res.json(files);
        }
    });
});

app.post('/move-image', (req, res) => {
    const { fileName, personName } = req.body;
    if (!fileName || !personName) {
        return res.status(400).send('Missing fileName or personName');
    }

    const oldPath = path.join(unknownUploadDir, fileName); // Use unknownUploadDir
    const newPath = path.join(uploadDir, `${personName}${path.extname(fileName)}`); // Use uploadDir

    fs.rename(oldPath, newPath, (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error moving file');
        }
        res.send('File moved successfully');
    });
});


app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});
