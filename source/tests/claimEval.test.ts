import { UserPolicy, ClaimIncidentType, ClaimReasonCode } from "../claimDataTypes";
import { evaluateClaim } from "../claimEvaluator";

const validPolicy123Claim = {
    policyId: 'POL123',
    incidentType: ClaimIncidentType.ACCIDENT,
    incidentDate: new Date('2023-06-01'),
    claimAmount: 5000
};

const policy123 = {
    policyId: 'POL123',
    startDate: new Date('2023-02-05'),
    endDate: new Date('2024-02-05'),
    deductible: 500,
    coverageLimit: 10000,
    coveredIncidents: [ClaimIncidentType.ACCIDENT, ClaimIncidentType.FIRE],
};

const expectedClaim123Payout = validPolicy123Claim.claimAmount - policy123.deductible;

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
        expect(result.reasonCode).toBe(ClaimReasonCode.INVALID_PARAMETERS);
    });

    //
    // Functional Tests - Claim Dates
    //
    test('WhenClaimPreDatesPolicyDay_Fails', () => {
        expect(policy123.startDate.getDate()).toBeGreaterThan(1);
        let preDate = new Date(policy123.startDate);
        preDate.setDate(preDate.getDate() - 1);

        const prePolicyClaim = { ...validPolicy123Claim, incidentDate: preDate };
        const result = evaluateClaim(prePolicyClaim, policy123);

        expect(result.approved).toBe(false);
        expect(result.payout).toBe(0);
        expect(result.reasonCode).toBe(ClaimReasonCode.POLICY_INACTIVE);
    });

    test('WhenClaimPreDatesPolicyMonth_Fails', () => {
        expect(policy123.startDate.getMonth()).toBeGreaterThan(0);
        let preDate = new Date(policy123.startDate);
        preDate.setMonth(preDate.getMonth() - 1);

        const prePolicyClaim = { ...validPolicy123Claim, incidentDate: preDate };
        const result = evaluateClaim(prePolicyClaim, policy123);

        expect(result.approved).toBe(false);
        expect(result.payout).toBe(0);
        expect(result.reasonCode).toBe(ClaimReasonCode.POLICY_INACTIVE);
    });

    test('WhenClaimPreDatesPolicyYear_Fails', () => {
        let preDate = new Date(policy123.startDate);
        preDate.setFullYear(preDate.getFullYear() - 1);

        const prePolicyClaim = { ...validPolicy123Claim, incidentDate: preDate };
        const result = evaluateClaim(prePolicyClaim, policy123);

        expect(result.approved).toBe(false);
        expect(result.payout).toBe(0);
        expect(result.reasonCode).toBe(ClaimReasonCode.POLICY_INACTIVE);
    });

    test('WhenClaimMatchesPolicyStartDate_Succeeds', () => {
        // Note: would clarify if hour/minute/second granularity matters here. Does time zone matter?
        const claimOnStartDate = { ...validPolicy123Claim, incidentDate: policy123.startDate };
        const result = evaluateClaim(claimOnStartDate, policy123);

        expect(result.approved).toBe(true);
        expect(result.payout).toBeGreaterThan(0);
        expect(result.reasonCode).toBe(ClaimReasonCode.APPROVED);
    });

    test('WhenClaimPrecedesPolicyEndDate_Succeeds', () => {
        expect(policy123.endDate.getDate()).toBeGreaterThan(1);
        let preDate = new Date(policy123.endDate);
        preDate.setDate(preDate.getDate() - 1);

        const claim = { ...validPolicy123Claim, incidentDate: preDate };
        const result = evaluateClaim(claim, policy123);

        expect(result.approved).toBe(true);
        expect(result.payout).toBeGreaterThan(0);
        expect(result.reasonCode).toBe(ClaimReasonCode.APPROVED);
    });

    test('WhenClaimMatchesPolicyEndDate_Fails', () => {
        const claimOnEndDate = { ...validPolicy123Claim, incidentDate: policy123.endDate };
        const result = evaluateClaim(claimOnEndDate, policy123);

        expect(result.approved).toBe(false);
        expect(result.payout).toBe(0);
        expect(result.reasonCode).toBe(ClaimReasonCode.POLICY_INACTIVE);
    });

    test('WhenClaimPostDatesPolicyEndDate_Fails', () => {
        // Note: would clarify if hour/minute/second granularity matters here. Does time zone matter?
        expect(policy123.endDate.getDate()).toBeLessThan(28);
        let postDate = new Date(policy123.endDate);
        postDate.setDate(postDate.getDate() + 1);

        const postPolicyClaim = { ...validPolicy123Claim, incidentDate: postDate };
        const result = evaluateClaim(postPolicyClaim, policy123);

        expect(result.approved).toBe(false);
        expect(result.payout).toBe(0);
        expect(result.reasonCode).toBe(ClaimReasonCode.POLICY_INACTIVE);
    });

    test('WhenClaimPostDatesPolicyMonth_Fails', () => {
        expect(policy123.endDate.getMonth()).toBeLessThan(11);
        let postDate = new Date(policy123.endDate);
        postDate.setMonth(postDate.getMonth() + 1);

        const postPolicyClaim = { ...validPolicy123Claim, incidentDate: postDate };
        const result = evaluateClaim(postPolicyClaim, policy123);

        expect(result.approved).toBe(false);
        expect(result.payout).toBe(0);
        expect(result.reasonCode).toBe(ClaimReasonCode.POLICY_INACTIVE);
    });

    test('WhenClaimPostDatesPolicyYear_Fails', () => {
        let postDate = new Date(policy123.endDate);
        postDate.setFullYear(postDate.getFullYear() + 1);

        const postPolicyClaim = { ...validPolicy123Claim, incidentDate: postDate };
        const result = evaluateClaim(postPolicyClaim, policy123);

        expect(result.approved).toBe(false);
        expect(result.payout).toBe(0);
        expect(result.reasonCode).toBe(ClaimReasonCode.POLICY_INACTIVE);
    });

    //
    // Functional Tests - Incident Types
    //
    test('WhenClaimIncidentNotCovered_Fails', () => {
        // Ensure test updates automatically if incident types are changed
        const incidentList = Object.keys(ClaimIncidentType).map((key) => ClaimIncidentType[key as keyof typeof ClaimIncidentType]);
        const numCovered = incidentList.length;
        expect(numCovered).toBeGreaterThan(0);

        // Try to root out any order dependencies by cycling through the list
        for (let ii=0; ii < numCovered; ii++) {
            const claimIncident = incidentList.pop()!;

            const uncoveredClaim = { ...validPolicy123Claim, incidentType: claimIncident };
            const uncoveredPolicy = { ...policy123, coveredIncidents: incidentList };
            const result = evaluateClaim(uncoveredClaim, uncoveredPolicy);

            expect(result.approved).toBe(false);
            expect(result.payout).toBe(0);
            expect(result.reasonCode).toBe(ClaimReasonCode.NOT_COVERED);

            incidentList.unshift(claimIncident);
        }
    });

    test('WhenClaimIncidentCovered_Succeeds', () => {
        // Ensure test updates automatically if incident types are changed
        const incidentList = Object.keys(ClaimIncidentType).map((key) => ClaimIncidentType[key as keyof typeof ClaimIncidentType]);
        const numCovered = incidentList.length;
        expect(numCovered).toBeGreaterThan(0);

        // Try to root out any order dependencies by cycling through the list
        for (let ii=0; ii < numCovered; ii++) {
            const coveredClaimIncident = incidentList[0];
            const coveredClaim = { ...validPolicy123Claim, incidentType: coveredClaimIncident };
            const coveredPolicy = { ...policy123, coveredIncidents: incidentList };
            const result = evaluateClaim(coveredClaim, coveredPolicy);

            expect(result.approved).toBe(true);
            expect(result.payout).toBeGreaterThan(0);
            expect(result.reasonCode).toBe(ClaimReasonCode.APPROVED);

            incidentList.unshift(incidentList.pop()!);
        }
    });

    //
    // Functional Tests - Payout Calculations
    //
    test('WhenClaimBelowDeductible_ZeroPayout_Fails', () => {
        expect(policy123.deductible).toBeGreaterThan(0);
        const claim = { ...validPolicy123Claim, claimAmount: policy123.deductible - 1 };
        const result = evaluateClaim(claim, policy123);

        expect(result.approved).toBe(false);
        expect(result.payout).toBe(0);
        expect(result.reasonCode).toBe(ClaimReasonCode.ZERO_PAYOUT);
    });

    test('WhenClaimEqualsDeductible_ZeroPayout_Fails', () => {
        expect(policy123.deductible).toBeGreaterThan(0);
        const claim = { ...validPolicy123Claim, claimAmount: policy123.deductible };
        const result = evaluateClaim(claim, policy123);

        expect(result.approved).toBe(false);
        expect(result.payout).toBe(0);
        expect(result.reasonCode).toBe(ClaimReasonCode.ZERO_PAYOUT);
    });

    test('WhenClaimExceedsDeductible_Succeeds', () => {
        const expectedPayout = validPolicy123Claim.claimAmount - policy123.deductible;
        expect(validPolicy123Claim.claimAmount).toBeGreaterThan(policy123.deductible);
        expect(expectedPayout).toBeLessThan(policy123.coverageLimit);

        const result = evaluateClaim(validPolicy123Claim, policy123);

        expect(result.approved).toBe(true);
        expect(result.payout).toBe(expectedPayout);
        expect(result.reasonCode).toBe(ClaimReasonCode.APPROVED);
    });

    test('WhenClaimMatchesCoverageLimit_Succeeds', () => {
        const claimAmount = policy123.coverageLimit + policy123.deductible;
        const claim = { ...validPolicy123Claim, claimAmount };
        const result = evaluateClaim(claim, policy123);

        expect(result.approved).toBe(true);
        expect(result.payout).toBe(policy123.coverageLimit);
        expect(result.reasonCode).toBe(ClaimReasonCode.APPROVED);
    });

    test('WhenClaimExceedsCoverageLimit_PayoutCapped_Succeeds', () => {
        const claimAmount = policy123.coverageLimit + policy123.deductible + 1000;
        const claim = { ...validPolicy123Claim, claimAmount };
        const result = evaluateClaim(claim, policy123);

        expect(result.approved).toBe(true);
        expect(result.payout).toBe(policy123.coverageLimit);
        expect(result.reasonCode).toBe(ClaimReasonCode.APPROVED);
    });
});