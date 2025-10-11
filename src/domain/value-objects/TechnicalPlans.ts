export class TechnicalPlans {
  constructor(
    public readonly implementationPlan?: string,
    public readonly rolloutPlan?: string,
    public readonly backoutPlan?: string,
    public readonly testingPlan?: string
  ) {}

  public static create(
    implementationPlan?: string,
    rolloutPlan?: string,
    backoutPlan?: string,
    testingPlan?: string
  ): TechnicalPlans {
    return new TechnicalPlans(
      implementationPlan?.trim() || undefined,
      rolloutPlan?.trim() || undefined,
      backoutPlan?.trim() || undefined,
      testingPlan?.trim() || undefined
    );
  }

  public hasImplementationPlan(): boolean {
    return !!this.implementationPlan && this.implementationPlan.length > 0;
  }

  public hasRolloutPlan(): boolean {
    return !!this.rolloutPlan && this.rolloutPlan.length > 0;
  }

  public hasBackoutPlan(): boolean {
    return !!this.backoutPlan && this.backoutPlan.length > 0;
  }

  public hasTestingPlan(): boolean {
    return !!this.testingPlan && this.testingPlan.length > 0;
  }

  public hasAllPlans(): boolean {
    return (
      this.hasImplementationPlan() &&
      this.hasRolloutPlan() &&
      this.hasBackoutPlan() &&
      this.hasTestingPlan()
    );
  }

  public isEmpty(): boolean {
    return (
      !this.implementationPlan &&
      !this.rolloutPlan &&
      !this.backoutPlan &&
      !this.testingPlan
    );
  }

  public toString(): string {
    const plans = [];
    if (this.implementationPlan)
      plans.push(`Implementation: ${this.implementationPlan}`);
    if (this.rolloutPlan) plans.push(`Rollout: ${this.rolloutPlan}`);
    if (this.backoutPlan) plans.push(`Backout: ${this.backoutPlan}`);
    if (this.testingPlan) plans.push(`Testing: ${this.testingPlan}`);

    return plans.length > 0 ? plans.join(" | ") : "No plans defined";
  }
}
