import { ClaimEvaluation, ClaimPolicy, DEFAULT_CLAIM_EVALUATION } from './claimDataTypes.js';

export function evaluateClaim(policy: ClaimPolicy): ClaimEvaluation {
    return DEFAULT_CLAIM_EVALUATION;
}
