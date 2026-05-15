const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { checkAuth } = require('../middlewares/checkAuth');
const ctrl = require('../controllers/pushController');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  return res.status(400).json({
    success: false,
    message: 'Du lieu subscription khong hop le',
    errors: errors.array().map(({ path, msg }) => ({ field: path, message: msg })),
  });
};

const subscriptionValidators = [
  body('endpoint').isURL({ require_protocol: true }).withMessage('Endpoint khong hop le'),
  body('expirationTime')
    .optional({ nullable: true })
    .custom((value) => value === null || typeof value === 'number' || !Number.isNaN(Date.parse(value)))
    .withMessage('ExpirationTime khong hop le'),
  body('keys.p256dh').isString().notEmpty().withMessage('P256DH key la bat buoc'),
  body('keys.auth').isString().notEmpty().withMessage('Auth key la bat buoc'),
  handleValidationErrors,
];

router.get('/public-key', ctrl.getPublicKey);
router.post('/subscribe', checkAuth, subscriptionValidators, ctrl.subscribe);
router.delete('/subscribe', checkAuth, [
  body('endpoint').isURL({ require_protocol: true }).withMessage('Endpoint khong hop le'),
  handleValidationErrors,
], ctrl.unsubscribe);

module.exports = router;
