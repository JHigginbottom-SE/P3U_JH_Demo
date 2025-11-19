import { UserPolicy, ClaimIncidentType, ClaimReasonCode } from "../claimDataTypes";
import { evaluateClaim } from "../claimEvaluator";

const validPolicy123Claim = {
    policyId: 'POL123',
    incidentType: ClaimIncidentType.ACCIDENT,
    incidentDate: new Date('2023-01-01'),
    claimAmount: 5000
};

const policy123 = {
    policyId: 'POL123',
    startDate: new Date('2023-01-01'),
    endDate: new Date('2024-01-01'),
    deductible: 500,
    coverageLimit: 10000,
    coveredIncidents: [ClaimIncidentType.ACCIDENT, ClaimIncidentType.FIRE],
};

const validPolicy456Claim = {
    policyId: 'POL456',
    incidentType: ClaimIncidentType.THEFT,
    incidentDate: new Date('2023-05-15'),
    claimAmount: 2000
};

const policy456 = {
    policyId: 'POL456',
    startDate: new Date('2022-06-01'),
    endDate: new Date('2025-06-01'),
    deductible: 250,
    coverageLimit: 50000,
    coveredIncidents: [ClaimIncidentType.THEFT, ClaimIncidentType.WATER, ClaimIncidentType.ACCIDENT, ClaimIncidentType.FIRE],
};

describe('evaluateClaim', () => {
    //
    // Edge Case Tests
    //
    test('WhenPolicyIDs_DoNotMatch_Fails', () => {
        const result = evaluateClaim(validPolicy123Claim, policy456);

        expect(result.approved).toBe(false);
        expect(result.payout).toBe(0);
        expect(result.reasonCode).toBe(ClaimReasonCode.INVALID_PARAMETERS);
    });

    test('WhenPolicyIDsMissing_Fails', () => {
        const emptyClaim = { ...validPolicy123Claim, policyId: '' };
        const emptyPolicy = {...policy123, policyId: ''};
        const result = evaluateClaim(emptyClaim, emptyPolicy);

        expect(result.approved).toBe(false);
        expect(result.payout).toBe(0);
        expect(result.reasonCode).toBe(ClaimReasonCode.INVALID_PARAMETERS);
    });

    test('WhenPolicyDeductibleInvalid_Fails', () => {
        const invalidPolicy = { ...policy123, deductible: -100 };
        const result = evaluateClaim(validPolicy123Claim, invalidPolicy);

        expect(result.approved).toBe(false);
        expect(result.payout).toBe(0);
        expect(result.reasonCode).toBe(ClaimReasonCode.INVALID_PARAMETERS);
    });

    test('WhenPolicyCoverageLimitInvalid_Fails', () => {
        const invalidPolicy = { ...policy123, coverageLimit: -5000 };
        const result = evaluateClaim(validPolicy123Claim, invalidPolicy);

        expect(result.approved).toBe(false);
        expect(result.payout).toBe(0);
        expect(result.reasonCode).toBe(ClaimReasonCode.INVALID_PARAMETERS);
    });

    test('WhenClaimAmountInvalid_Fails', () => {
        const invalidClaim = { ...validPolicy123Claim, claimAmount: -2000 };
        const result = evaluateClaim(invalidClaim, policy123);

        expect(result.approved).toBe(false);
        expect(result.payout).toBe(0);
        expect(result.reasonCode).toBe(ClaimReasonCode.INVALID_PARAMETERS);
    });
    
    test('WhenPolicyDeductibleExceedsCoverageLimit_Fails', () => {
        const invalidPolicy = { ...policy123, deductible: policy123.coverageLimit + 1 };
        const result = evaluateClaim(validPolicy123Claim, invalidPolicy);

        expect(result.approved).toBe(false);
        expect(result.payout).toBe(0);
        expect(result.reasonCode).toBe(ClaimReasonCode.INVALID_PARAMETERS);
    });

    test('WhenPolicyCoverageEmpty_Fails', () => {
        const emptyPolicy = { ...policy123, coveredIncidents: [] };
        const result = evaluateClaim(validPolicy123Claim, emptyPolicy);

        expect(result.approved).toBe(false);
        expect(result.payout).toBe(0);
        expect(result.reasonCode).toBe(ClaimReasonCode.NOT_COVERED);
    });
});