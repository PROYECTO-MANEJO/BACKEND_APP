import { Router } from 'express';
import { DIContainer } from '../../infrastructure/config/DIContainer';
export declare class AppRoutes {
    private router;
    private container;
    constructor(container: DIContainer);
    private setupRoutes;
    getRouter(): Router;
}
//# sourceMappingURL=appRoutes.d.ts.map