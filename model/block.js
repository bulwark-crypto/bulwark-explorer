
import mongoose from 'mongoose';

const Block = mongoose.model('Block', {
    hash: String
});

export default Block;