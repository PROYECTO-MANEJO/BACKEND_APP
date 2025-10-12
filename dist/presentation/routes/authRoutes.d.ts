import { Router } from 'express';
import { DIContainer } from '../../infrastructure/config/DIContainer';
export declare class AuthRoutes {
    private router;
    private authController;
    constructor(container: DIContainer);
    private setupRoutes;
    getRouter(): Router;
}
//# sourceMappingURL=authRoutes.d.ts.map