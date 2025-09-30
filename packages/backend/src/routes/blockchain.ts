import { Router } from 'express';
import { BlockchainService } from '../services/BlockchainService';
import { AuthenticatedRequest } from '../middleware/auth';
import { createSuccessResponse } from '@queue-skip/shared';

const router = Router();
const blockchainService = new BlockchainService();

/**
 * GET /api/blockchain/status
 * Get blockchain network status
 */
router.get('/status', async (req: AuthenticatedRequest, res, next) => {
  try {
    const status = await blockchainService.getNetworkStatus();
    const isAvailable = blockchainService.isAvailable();

    res.json(createSuccessResponse({ 
      ...status,
      serviceAvailable: isAvailable
    }));
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/blockchain/connect
 * Connect wallet
 */
router.post('/connect', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { walletType } = req.body;

    const connection = await blockchainService.connectWallet(walletType || 'phantom');

    res.json(createSuccessResponse({ connection }));
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/blockchain/transactions/:passId
 * Get transaction history for a pass
 */
router.get('/transactions/:passId', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { passId } = req.params;

    const transactions = await blockchainService.getTransactionHistory(passId);

    res.json(createSuccessResponse({ transactions }));
  } catch (error) {
    next(error);
  }
});

export default router;
