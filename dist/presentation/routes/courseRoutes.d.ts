import { Router } from 'express';
import { DIContainer } from '../../infrastructure/config/DIContainer';
export declare class CourseRoutes {
    private router;
    private courseController;
    constructor(container: DIContainer);
    private setupRoutes;
    getRouter(): Router;
}
//# sourceMappingURL=courseRoutes.d.ts.map