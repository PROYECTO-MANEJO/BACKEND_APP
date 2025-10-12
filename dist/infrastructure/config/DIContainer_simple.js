"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DIContainer = void 0;
/**
 * DIContainer simplificado para el servidor refactorizado
 * Solo incluye las dependencias mínimas necesarias
 */
class DIContainer {
    constructor() {
        // Inicialización básica
    }
    static getInstance() {
        if (!DIContainer.instance) {
            DIContainer.instance = new DIContainer();
        }
        return DIContainer.instance;
    }
}
exports.DIContainer = DIContainer;
//# sourceMappingURL=DIContainer_simple.js.map