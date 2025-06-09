const express = require('express');
const { createDeposit, approveDeposit, modifyBalance, getUserHistory, getDeposits, createWithdrawal
  , approveWithdrawal, getWithdrawals,
  makeTransaction,
  createDetails,
  updateDetails,
  getDetails,
  updateTransaction,
  deleteTransaction,
  deleteDetails,
  makeCardTransaction } = require('../controllers/bankController');
const { adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/transaction', makeTransaction);
router.post('/transaction/card', makeCardTransaction);
router.put('/transaction', updateTransaction);
router.delete('/transaction', deleteTransaction);
router.get('/details', getDetails);
router.post('/details', adminOnly, createDetails);
router.put('/details', adminOnly, updateDetails);
router.delete('/details', adminOnly, deleteDetails);

// User views transaction history
router.get('/history', getUserHistory);

module.exports = router;