const router = require('express').Router();
const { User } = require('../models');
const { protect } = require('../middleware/auth');

const send = async (req, res) => {
  const u = await User.findById(req.user._id).populate('wishlist');
  res.json(u.wishlist);
};

router.get('/', protect, send);
router.post('/:id', protect, async (req, res) => {
  await User.updateOne({ _id: req.user._id }, { $addToSet: { wishlist: req.params.id } });
  send(req, res);
});
router.delete('/:id', protect, async (req, res) => {
  await User.updateOne({ _id: req.user._id }, { $pull: { wishlist: req.params.id } });
  send(req, res);
});

module.exports = router;
