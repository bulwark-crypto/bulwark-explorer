
import Block from '../model/block';

function* addTest() {
    const block = new Block({
        name: 'TEST'
    });

    yield block.save();
}

function* getAll() {
    yield Block.all();
}

addTest();
const blocks = getAll();
console.log('blocks:', blocks.next());