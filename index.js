const express = require('express');
const multer = require("multer");
const cors = require('cors')
require('dotenv').config()
// const { resize } = require('./resize');
const cloudinary = require('./cloudinary')
const { Pool } = require('pg');
const app = express();
const port = 8080;
const upload = multer({ dest: "./image/" });

app.use(express.json())
app.use(cors())

const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: 5432,
});

//index
app.get("/", (_,res) => {
  res.json({message:"works"})
})

//upload image
app.post('/upload', upload.single('image'), async (req,res) => {
  const { path } = req.file
  try {
    const time = Date(Date.now()).slice(4, 31);
    const upload = await cloudinary.uploader.upload(path)
    const {public_id, secure_url} = upload
    // const result = await pool.query(`INSERT INTO image (filename, path) VALUES ('${public_id}','${secure_url}') RETURNING *`)
    const result = await pool.query('INSERT INTO image (filename, path, created_at) VALUES ($1, $2, $3) RETURNING *', [public_id, secure_url, time]);
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json(error.message)
  }
})

//get all images
app.get('/images', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM image ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error retrieving images', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//get image by id
app.get('/images/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`SELECT * FROM image WHERE id = ${id}`);
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Image not found'});
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    console.error('Error retrieving image', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


//resize gambar
// app.post('/resize', upload.single("image"), (req, res) => {
//   try {
//     return resize(req.body, req.file).then(result => res.json(result))
//   } catch (error) {
//     return res.status(500).json(error)
//   }
// });

//resize gambar cloudinary
// app.get('/resize/:imageId', async (req, res) => {
//   try {
//     const { imageId } = req.params;
//     const { width, height } = req.query;

//     // Generate the transformation string
//     const transformation = {
//       width: parseInt(width),
//       height: parseInt(height),
//       crop: 'fill'
//     };

//     // Perform the image transformation
//     const result = await cloudinary.uploader.explicit(imageId, transformation);
//     const resizedImageUrl = result.secure_url;

//     res.json({ resizedImageUrl });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to resize image' });
//   }
// });

// resize new
app.get('/resize/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;
    const { width, height } = req.query;
    const time = Date(Date.now()).slice(4, 31);

    // Generate the transformation options
    const transformation = {
      width: parseInt(width),
      height: parseInt(height),
      crop: 'fill'
    };

    // Perform the image transformation using the `url` method
    const resizedImageUrl = cloudinary.url(imageId, transformation);
    const resizedImage = await cloudinary.uploader.upload(resizedImageUrl)
    const {public_id, secure_url} = resizedImage
    const result = await pool.query('INSERT INTO image (filename, path, created_at) VALUES ($1, $2, $3) RETURNING *', [public_id, secure_url, time]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to resize image' });
  }
});


app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
