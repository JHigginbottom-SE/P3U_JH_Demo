import { ClaimEvaluation, UserClaim, UserPolicy, DEFAULT_CLAIM_EVALUATION } from './claimDataTypes.ts';

export function evaluateClaim(claim: UserClaim, policy: UserPolicy): ClaimEvaluation {
    return DEFAULT_CLAIM_EVALUATION;
}
