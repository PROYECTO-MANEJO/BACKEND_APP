import { Router } from 'express';
import { DIContainer } from '../../infrastructure/config/DIContainer';
export declare class EventRoutes {
    private router;
    private eventController;
    constructor(container: DIContainer);
    private setupRoutes;
    getRouter(): Router;
}
//# sourceMappingURL=eventRoutes.d.ts.map