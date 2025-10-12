import { Router } from 'express';
import { DIContainer } from '../../infrastructure/config/DIContainer';
export declare class CertificateRoutes {
    private router;
    private certificateController;
    constructor(container: DIContainer);
    private setupRoutes;
    getRouter(): Router;
}
//# sourceMappingURL=certificateRoutes.d.ts.map