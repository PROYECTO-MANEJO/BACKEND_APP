"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnicalPlans = void 0;
class TechnicalPlans {
    constructor(implementationPlan, rolloutPlan, backoutPlan, testingPlan) {
        this.implementationPlan = implementationPlan;
        this.rolloutPlan = rolloutPlan;
        this.backoutPlan = backoutPlan;
        this.testingPlan = testingPlan;
    }
    static create(implementationPlan, rolloutPlan, backoutPlan, testingPlan) {
        return new TechnicalPlans(implementationPlan?.trim() || undefined, rolloutPlan?.trim() || undefined, backoutPlan?.trim() || undefined, testingPlan?.trim() || undefined);
    }
    hasImplementationPlan() {
        return !!this.implementationPlan && this.implementationPlan.length > 0;
    }
    hasRolloutPlan() {
        return !!this.rolloutPlan && this.rolloutPlan.length > 0;
    }
    hasBackoutPlan() {
        return !!this.backoutPlan && this.backoutPlan.length > 0;
    }
    hasTestingPlan() {
        return !!this.testingPlan && this.testingPlan.length > 0;
    }
    hasAllPlans() {
        return (this.hasImplementationPlan() &&
            this.hasRolloutPlan() &&
            this.hasBackoutPlan() &&
            this.hasTestingPlan());
    }
    isEmpty() {
        return (!this.implementationPlan &&
            !this.rolloutPlan &&
            !this.backoutPlan &&
            !this.testingPlan);
    }
    toString() {
        const plans = [];
        if (this.implementationPlan)
            plans.push(`Implementation: ${this.implementationPlan}`);
        if (this.rolloutPlan)
            plans.push(`Rollout: ${this.rolloutPlan}`);
        if (this.backoutPlan)
            plans.push(`Backout: ${this.backoutPlan}`);
        if (this.testingPlan)
            plans.push(`Testing: ${this.testingPlan}`);
        return plans.length > 0 ? plans.join(" | ") : "No plans defined";
    }
}
exports.TechnicalPlans = TechnicalPlans;
//# sourceMappingURL=TechnicalPlans.js.map