import { ClaimEvaluation, ClaimIncidentType, UserClaim } from "./claimDataTypes.ts";
import { evaluateClaim } from "./claimEvaluator.ts";

export function processClaim(userData: any): ClaimEvaluation {
    let retval: ClaimEvaluation = {
        approved: false,
        payout: 0,
        reasonCode: 'unknown_error'
    };

    try {
    const { claim, policy } = userData;
        if (claim && policy) {
            const { policyId, incidentType, incidentDate, amountClaimed } = claim;
            const { startDate, endDate, deductible, coverageLimit, coveredIncidents } = policy;

            const typedClaim: UserClaim = {
                policyId: policyId as string,
                incidentType: toClaimIncidentType(incidentType as string),
                incidentDate: new Date(incidentDate as string),
                claimAmount: amountClaimed as number
            }

            const typedPolicy = {
                policyId: policyId as string,
                startDate: new Date(startDate as string),
                endDate: new Date(endDate as string),
                deductible: deductible as number,
                coverageLimit: coverageLimit as number,
                coveredIncidents: (coveredIncidents as string[]).map(ci => toClaimIncidentType(ci))
            };

            retval = evaluateClaim(typedClaim, typedPolicy);
        }
    } catch (e) {
        console.error("Error processing claim:", e);
    }
    
    return retval;
}

function toClaimIncidentType(value: string): ClaimIncidentType {
    const vals = Object.values(ClaimIncidentType) as string[]; // string enum values
    if (!vals.includes(value)) {
        throw new Error(`Invalid ClaimIncidentType value: ${value}`);
    }
    return value as ClaimIncidentType;
}