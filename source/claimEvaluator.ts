import { ClaimEvaluation, UserClaim, UserPolicy, DEFAULT_CLAIM_EVALUATION, ClaimReasonCode } from './claimDataTypes.ts';

export function evaluateClaim(claim: UserClaim, policy: UserPolicy): ClaimEvaluation {
    const retval = DEFAULT_CLAIM_EVALUATION;

    if (!validateClaimPolicyParams(claim, policy)) {
        retval.reasonCode = ClaimReasonCode.INVALID_PARAMETERS;
    }

    return retval;
}

function validateClaimPolicyParams(claim: UserClaim, policy: UserPolicy): boolean {
    if (!policy.policyId.length || (claim.policyId !== policy.policyId)) {
        return false;
    }

    if (claim.claimAmount < 0 || policy.deductible < 0 || policy.coverageLimit < 0) {
        return false;
    }

    if (policy.startDate.getTime() >= policy.endDate.getTime()) {
        return false;
    }

    if (policy.coveredIncidents.length === 0) {
        return false;
    }

    return true;
}