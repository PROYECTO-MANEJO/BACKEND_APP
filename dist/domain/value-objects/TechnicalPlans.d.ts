export declare class TechnicalPlans {
    readonly implementationPlan?: string | undefined;
    readonly rolloutPlan?: string | undefined;
    readonly backoutPlan?: string | undefined;
    readonly testingPlan?: string | undefined;
    constructor(implementationPlan?: string | undefined, rolloutPlan?: string | undefined, backoutPlan?: string | undefined, testingPlan?: string | undefined);
    static create(implementationPlan?: string, rolloutPlan?: string, backoutPlan?: string, testingPlan?: string): TechnicalPlans;
    hasImplementationPlan(): boolean;
    hasRolloutPlan(): boolean;
    hasBackoutPlan(): boolean;
    hasTestingPlan(): boolean;
    hasAllPlans(): boolean;
    isEmpty(): boolean;
    toString(): string;
}
//# sourceMappingURL=TechnicalPlans.d.ts.map