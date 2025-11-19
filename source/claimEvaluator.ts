import { ClaimEvaluation, UserClaim, UserPolicy, ClaimReasonCode } from './claimDataTypes.ts';

export function evaluateClaim(claim: UserClaim, policy: UserPolicy): ClaimEvaluation {
    const retval = {
        approved: false,
        payout: 0,
        reasonCode: ClaimReasonCode.UNKNOWN_ERROR
    };

    if (!validateClaimPolicyParams(claim, policy)) {
        retval.reasonCode = ClaimReasonCode.INVALID_PARAMETERS;
    } else if (!isPolicyActive(claim, policy)) {
        retval.reasonCode = ClaimReasonCode.POLICY_INACTIVE;
    } else if (!policy.coveredIncidents.includes(claim.incidentType)) {
        retval.reasonCode = ClaimReasonCode.NOT_COVERED;
    } else {
        const payout = claim.claimAmount - Math.abs(policy.deductible);
        if (payout > 0) {
            retval.approved = true;
            retval.payout = Math.min(payout, policy.coverageLimit);
            retval.reasonCode = ClaimReasonCode.APPROVED;
        } else {
            retval.reasonCode = ClaimReasonCode.ZERO_PAYOUT;
        }
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

    if (policy.deductible < 0 || policy.coverageLimit <= 0) {
        return false;
    }

    if (policy.deductible > policy.coverageLimit) {
        return false;
    }

    return true;
}

function isPolicyActive(claim: UserClaim, policy: UserPolicy): boolean {
    // Assume only date matters for policy check - no time, region considerations
    const incident = new Date(claim.incidentDate);
    const start = new Date(policy.startDate);
    const end = new Date(policy.endDate);
    incident.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    return (incident.getTime() >= start.getTime()) && (incident.getTime() < end.getTime());
}
