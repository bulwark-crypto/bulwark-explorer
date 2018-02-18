
import express from 'express';
import path from 'path';
// Routes.
import api from '../api';

const router = (app) => {
    const webDir = path.join(__dirname, '../../', 'public');
    
    app.use(express.static(webDir));
    app.use('/api', api);

    // Load the generated web file.
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '../../', 'public', 'index.html'));
    });
};

export default router;