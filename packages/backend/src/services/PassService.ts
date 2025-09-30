import { prisma } from '../utils/database';
import { cacheUtils } from '../utils/redis';
import { logger } from '../utils/logger';
import { createAppError } from '../middleware/errorHandler';
import { BlockchainService } from './BlockchainService';
import { 
  Pass, 
  PassType, 
  ERROR_CODES, 
  validatePassTransfer,
  generatePassId,
  addHours,
  isExpired 
} from '@queue-skip/shared';

export class PassService {
  private blockchainService: BlockchainService;

  constructor() {
    this.blockchainService = new BlockchainService();
  }

  /**
   * Allocate passes to a user based on venue configuration
   */
  async allocatePasses(userId: string, venueId: string): Promise<Pass[]> {
    try {
      logger.info(`Allocating passes for user ${userId} in venue ${venueId}`);

      // Get user's venue association and group
      const userAssociation = await prisma.userVenueAssociation.findFirst({
        where: { userId, venueId, status: 'active' },
      });

      if (!userAssociation) {
        throw createAppError(
          'User is not associated with this venue',
          403,
          ERROR_CODES.INSUFFICIENT_PERMISSIONS
        );
      }

      // Get allocation rules for this user group
      const allocations = await prisma.passAllocation.findMany({
        where: {
          venueId,
          userGroup: userAssociation.userGroup,
        },
        include: {
          passType: true,
        },
      });

      if (allocations.length === 0) {
        logger.info(`No pass allocations found for user group ${userAssociation.userGroup}`);
        return [];
      }

      const allocatedPasses: Pass[] = [];

      for (const allocation of allocations) {
        // Check if user already has active passes of this type today
        const existingPasses = await prisma.pass.count({
          where: {
            userId,
            passTypeId: allocation.passTypeId,
            status: 'active',
            validFrom: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        });

        const passesToAllocate = Math.max(0, allocation.quantity - existingPasses);

        for (let i = 0; i < passesToAllocate; i++) {
          const passType = {
            ...allocation.passType,
            restrictions: allocation.passType.restrictions as any[]
          };
          const pass = await this.createPass(userId, passType, venueId);
          allocatedPasses.push(pass);
        }
      }

      logger.info(`Allocated ${allocatedPasses.length} passes to user ${userId}`);
      return allocatedPasses;
    } catch (error) {
      logger.error('Error allocating passes:', error);
      throw error;
    }
  }

  /**
   * Create a new pass (hybrid database + blockchain approach)
   */
  async createPass(userId: string, passType: PassType, venueId: string): Promise<Pass> {
    try {
      const passId = generatePassId();
      const now = new Date();
      const validUntil = addHours(now, passType.validityPeriod);

      // 1. Create pass in database first (immediate)
      const passData = await prisma.pass.create({
        data: {
          id: passId,
          userId,
          venueId,
          passTypeId: passType.id,
          status: 'active',
          validFrom: now,
          validUntil,
          restrictions: passType.restrictions,
        },
        include: {
          user: true,
          venue: true,
          passType: true,
        },
      });

      // 2. Queue blockchain transaction (asynchronous)
      this.queueBlockchainMint(passData)
        .catch(error => {
          logger.error(`Failed to mint NFT for pass ${passId}:`, error);
          // Note: We don't fail the pass creation if blockchain fails
          // The pass remains valid in the database
        });

      const pass: Pass = {
        id: passData.id,
        userId: passData.userId,
        venueId: passData.venueId,
        type: passData.passTypeId,
        status: passData.status as any,
        validFrom: passData.validFrom,
        validUntil: passData.validUntil,
        restrictions: passData.restrictions as any,
        blockchainTxHash: passData.blockchainTxHash || undefined,
      };

      // Cache the pass
      await cacheUtils.setPass(passId, pass);

      logger.info(`Created pass ${passId} for user ${userId}`);
      return pass;
    } catch (error) {
      logger.error('Error creating pass:', error);
      throw error;
    }
  }

  /**
   * Transfer pass with hadmin control enforcement
   */
  async transferPass(
    passId: string, 
    fromUserId: string, 
    toUserId: string
  ): Promise<{ success: boolean; blockchainTxHash?: string }> {
    try {
      // 1. Get pass and validate ownership
      const pass = await prisma.pass.findFirst({
        where: { 
          id: passId, 
          userId: fromUserId,
          status: 'active'
        },
        include: {
          venue: true,
          passType: true,
        },
      });

      if (!pass) {
        throw createAppError(
          'Pass not found or not owned by user',
          404,
          ERROR_CODES.PASS_NOT_FOUND
        );
      }

      // 2. Check if pass is expired
      if (isExpired(pass.validUntil)) {
        throw createAppError(
          'Cannot transfer expired pass',
          400,
          ERROR_CODES.PASS_EXPIRED
        );
      }

      // 3. Validate transfer permissions (admin control)
      const venueConfig = pass.venue.config as any;
      const transferValidation = validatePassTransfer(
        venueConfig.features?.passTransfer || false,
        pass.passType.transferable
      );

      if (!transferValidation.valid) {
        throw createAppError(
          'Pass transfer not allowed',
          403,
          transferValidation.error!
        );
      }

      // 4. Validate recipient exists and is eligible
      const recipientAssociation = await prisma.userVenueAssociation.findFirst({
        where: {
          userId: toUserId,
          venueId: pass.venueId,
          status: 'active',
        },
      });

      if (!recipientAssociation) {
        throw createAppError(
          'Recipient is not eligible for this venue',
          400,
          ERROR_CODES.INVALID_CREDENTIALS
        );
      }

      // 5. Create transfer record and update pass ownership (database transaction)
      const result = await prisma.$transaction(async (tx) => {
        // Create transfer record
        const transfer = await tx.passTransfer.create({
          data: {
            passId,
            fromUserId,
            toUserId,
            status: 'completed',
            completedAt: new Date(),
          },
        });

        // Update pass ownership
        const updatedPass = await tx.pass.update({
          where: { id: passId },
          data: {
            userId: toUserId,
            status: 'transferred',
            updatedAt: new Date(),
          },
        });

        // Create new active pass for recipient
        const newPass = await tx.pass.create({
          data: {
            userId: toUserId,
            venueId: pass.venueId,
            passTypeId: pass.passTypeId,
            status: 'active',
            validFrom: pass.validFrom,
            validUntil: pass.validUntil,
            restrictions: pass.restrictions as any,
          },
        });

        return { transfer, updatedPass, newPass };
      });

      // 6. Queue blockchain transaction (asynchronous)
      let blockchainTxHash: string | undefined;
      try {
        blockchainTxHash = await this.blockchainService.transferPassNFT(
          passId,
          fromUserId,
          toUserId
        );

        // Update transfer record with blockchain hash
        await prisma.passTransfer.update({
          where: { id: result.transfer.id },
          data: { blockchainTxHash },
        });
      } catch (blockchainError) {
        logger.error(`Blockchain transfer failed for pass ${passId}:`, blockchainError);
        // Transfer is still valid even if blockchain fails
      }

      // 7. Invalidate caches
      await cacheUtils.invalidatePass(passId);
      await cacheUtils.invalidatePass(result.newPass.id);

      // 8. Send real-time notifications
      if (global.io) {
        global.io.to(`pass-${passId}`).emit('passTransferred', {
          passId,
          fromUserId,
          toUserId,
          newPassId: result.newPass.id,
        });
      }

      logger.info(`Pass ${passId} transferred from ${fromUserId} to ${toUserId}`);

      return {
        success: true,
        blockchainTxHash,
      };
    } catch (error) {
      logger.error('Error transferring pass:', error);
      throw error;
    }
  }

  /**
   * Redeem pass with staff validation
   */
  async redeemPass(passId: string, staffId: string): Promise<{ success: boolean; blockchainTxHash?: string }> {
    try {
      // 1. Get and validate pass
      const pass = await prisma.pass.findUnique({
        where: { id: passId },
        include: {
          venue: true,
          passType: true,
        },
      });

      if (!pass) {
        throw createAppError(
          'Pass not found',
          404,
          ERROR_CODES.PASS_NOT_FOUND
        );
      }

      if (pass.status !== 'active') {
        throw createAppError(
          'Pass is not active',
          400,
          ERROR_CODES.PASS_ALREADY_REDEEMED
        );
      }

      if (isExpired(pass.validUntil)) {
        throw createAppError(
          'Pass has expired',
          400,
          ERROR_CODES.PASS_EXPIRED
        );
      }

      // 2. Create redemption record and update pass status
      const result = await prisma.$transaction(async (tx) => {
        const redemption = await tx.passRedemption.create({
          data: {
            passId,
            staffId,
            venueId: pass.venueId,
            redeemedAt: new Date(),
          },
        });

        const updatedPass = await tx.pass.update({
          where: { id: passId },
          data: {
            status: 'used',
            updatedAt: new Date(),
          },
        });

        return { redemption, updatedPass };
      });

      // 3. Queue blockchain transaction (asynchronous)
      let blockchainTxHash: string | undefined;
      try {
        blockchainTxHash = await this.blockchainService.redeemPassNFT(passId);

        // Update redemption record with blockchain hash
        await prisma.passRedemption.update({
          where: { id: result.redemption.id },
          data: { blockchainTxHash },
        });
      } catch (blockchainError) {
        logger.error(`Blockchain redemption failed for pass ${passId}:`, blockchainError);
        // Redemption is still valid even if blockchain fails
      }

      // 4. Invalidate caches
      await cacheUtils.invalidatePass(passId);

      // 5. Send real-time notifications
      if (global.io) {
        global.io.to(`pass-${passId}`).emit('passRedeemed', {
          passId,
          staffId,
          redeemedAt: new Date(),
        });
      }

      logger.info(`Pass ${passId} redeemed by staff ${staffId}`);

      return {
        success: true,
        blockchainTxHash,
      };
    } catch (error) {
      logger.error('Error redeeming pass:', error);
      throw error;
    }
  }

  /**
   * Get user's passes for a venue
   */
  async getUserPasses(userId: string, venueId: string): Promise<Pass[]> {
    try {
      const passes = await prisma.pass.findMany({
        where: {
          userId,
          venueId,
          status: { in: ['active', 'transferred'] },
        },
        include: {
          passType: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return passes.map(pass => ({
        id: pass.id,
        userId: pass.userId,
        venueId: pass.venueId,
        type: pass.passTypeId,
        status: pass.status as any,
        validFrom: pass.validFrom,
        validUntil: pass.validUntil,
        restrictions: pass.restrictions as any,
        blockchainTxHash: pass.blockchainTxHash || undefined,
      }));
    } catch (error) {
      logger.error('Error getting user passes:', error);
      throw error;
    }
  }

  /**
   * Queue blockchain NFT minting (asynchronous)
   */
  private async queueBlockchainMint(passData: any): Promise<void> {
    try {
      const txHash = await this.blockchainService.mintPassNFT({
        id: passData.id,
        userId: passData.userId,
        venueId: passData.venueId,
        type: passData.passTypeId,
        status: 'active',
        validFrom: passData.validFrom,
        validUntil: passData.validUntil,
        restrictions: passData.restrictions,
      });

      // Update pass with blockchain transaction hash
      await prisma.pass.update({
        where: { id: passData.id },
        data: { blockchainTxHash: txHash },
      });

      logger.info(`NFT minted for pass ${passData.id}: ${txHash}`);
    } catch (error) {
      logger.error(`Failed to mint NFT for pass ${passData.id}:`, error);
      throw error;
    }
  }
}
