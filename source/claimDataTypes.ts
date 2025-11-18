export enum ClaimIncidentType {
    ACCIDENT = 'accident',
    THEFT = 'theft',
    FIRE = 'fire',
    WATER = 'water damage'
};

export interface ClaimPolicy {
  policyId: string;
  startDate: Date;
  endDate: Date;
  deductible: number;
  coverageLimit: number;
  coveredIncidents: ClaimIncidentType[];
}

export enum ClaimReasonCode {
    APPROVED = 'approved',
    POLICY_INACTIVE = 'policy_inactive',
    NOT_COVERED = 'not_covered',
    ZERO_PAYOUT = 'zero_payout',
    INVALID_PARAMETERS = 'invalid_parameters',
    UNKNOWN_ERROR = 'unknown_error'
}

export interface ClaimEvaluation {
    approved: boolean;
    payout: number;
    reasonCode: string;
}

export const DEFAULT_CLAIM_EVALUATION: ClaimEvaluation = {
    approved: false,
    payout: 0,
    reasonCode: ClaimReasonCode.UNKNOWN_ERROR
};
