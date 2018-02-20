
import TX from '../../model/tx';


const getTXLatest = (req, res) => {
  TX.find()
    .limit(req.params.limit || 50)
    .sort({ height: -1 })
    .then((docs) => {
      res.json(docs);
    })
    .catch((err) => {
      res.status(500).send(err.message || err);
    });
};

export default {
  getTXLatest
};
