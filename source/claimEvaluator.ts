import { ClaimPolicy } from './claimDataTypes.js';

export function evaluateClaim(policy: ClaimPolicy): { approved: boolean; payout: number; reasonCode: string } {
    return { approved: false, payout: 0, reasonCode: 'NOT_IMPLEMENTED' };
}
