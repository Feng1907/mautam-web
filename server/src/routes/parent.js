const router = require('express').Router();
const { body, param, query, validationResult } = require('express-validator');
const { checkAuth } = require('../middlewares/checkAuth');
const ctrl = require('../controllers/parentController');

const requireParent = (req, res, next) => {
  if (req.user?.vaiTro !== 'PARENT') {
    return res.status(403).json({
      success: false,
      message: 'Chi phu huynh moi co quyen truy cap du lieu nay',
    });
  }
  next();
};

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  return res.status(400).json({
    success: false,
    message: 'Du lieu truy van khong hop le',
    errors: errors.array().map(({ path, msg }) => ({ field: path, message: msg })),
  });
};

const studentQueryValidators = [
  param('studentId').isMongoId().withMessage('Student id khong hop le'),
  query('namHocId').optional({ nullable: true, checkFalsy: true }).isMongoId().withMessage('Nam hoc khong hop le'),
  handleValidationErrors,
];

router.use(checkAuth, requireParent);

router.get('/students', ctrl.getMyStudents);

router.get(
  '/students/:studentId/grades',
  [
    ...studentQueryValidators.slice(0, -1),
    query('hocKy').optional({ nullable: true, checkFalsy: true }).isInt({ min: 1, max: 2 }).withMessage('Hoc ky khong hop le'),
    handleValidationErrors,
  ],
  ctrl.getStudentGrades
);

router.get(
  '/students/:studentId/semester-report',
  [
    ...studentQueryValidators.slice(0, -1),
    query('hocKy').optional({ nullable: true, checkFalsy: true }).isInt({ min: 1, max: 2 }).withMessage('Hoc ky khong hop le'),
    handleValidationErrors,
  ],
  ctrl.getSemesterReport
);

router.get(
  '/students/:studentId/attendance',
  [
    ...studentQueryValidators.slice(0, -1),
    query('startDate').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('Ngay bat dau khong hop le'),
    query('endDate').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('Ngay ket thuc khong hop le'),
    handleValidationErrors,
  ],
  ctrl.getAttendanceHistory
);

router.post(
  '/students/:studentId/absence-request',
  [
    param('studentId').isMongoId().withMessage('Student id khong hop le'),
    body('date').isISO8601().withMessage('Ngay nghi khong hop le'),
    body('reason').trim().isLength({ min: 3, max: 500 }).withMessage('Ly do phai tu 3 den 500 ky tu'),
    handleValidationErrors,
  ],
  ctrl.createAbsenceRequest
);

module.exports = router;
