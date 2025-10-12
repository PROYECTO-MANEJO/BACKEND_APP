import { Router } from 'express';
import { DIContainer } from '../../infrastructure/config/DIContainer';
export declare class UserRoutes {
    private router;
    private userController;
    constructor(container: DIContainer);
    private setupRoutes;
    getRouter(): Router;
}
//# sourceMappingURL=userRoutes.d.ts.map