const router = require('express').Router();
const { query, validationResult } = require('express-validator');
const ctrl = require('../controllers/searchController');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  return res.status(400).json({
    success: false,
    message: 'Du lieu tim kiem khong hop le',
    errors: errors.array().map(({ path, msg }) => ({ field: path, message: msg })),
  });
};

router.get(
  '/',
  [
    query('q').trim().notEmpty().withMessage('Tu khoa tim kiem la bat buoc'),
    query('limit').optional({ nullable: true, checkFalsy: true }).isInt({ min: 1, max: 50 }).withMessage('Limit khong hop le'),
    query('page').optional({ nullable: true, checkFalsy: true }).isInt({ min: 1 }).withMessage('Page khong hop le'),
    handleValidationErrors,
  ],
  ctrl.searchLoiChua
);

module.exports = router;
