import { Policy } from './claimDataTypes.js';

export function evaluateClaim(policy: Policy): { approved: boolean; payout: number; reasonCode: string } {
    return { approved: false, payout: 0, reasonCode: 'NOT_IMPLEMENTED' };
}
