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
