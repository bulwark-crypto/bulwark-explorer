
import mongoose from 'mongoose';

const Peer = mongoose.model('Peer', {
    createdAt: Date,
    ip: String,
    lat: String,
    lon: String,
    port: Number,
    proto: String,
    subver: String,
    ver: String
});

export default Peer;