export enum ClaimIncidentType {
    ACCIDENT = 'accident',
    THEFT = 'theft',
    FIRE = 'fire',
    WATER = 'water damage'
};

export interface UserClaim {
    policyId: string;
    incidentType: ClaimIncidentType;
    incidentDate: Date;
    claimAmount: number;
}

export interface UserPolicy {
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
