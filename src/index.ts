const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err: any) => {
        console.error('MongoDB connection error:', err);
    });

app.use('/api/auth', require('../routes/auth'));
app.use('/api/func', require('../routes/functionality'));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})
