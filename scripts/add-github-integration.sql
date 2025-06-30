-- Script para agregar integración con GitHub a las solicitudes de cambio
-- Ejecutar en PostgreSQL

-- Agregar campos de integración con GitHub
ALTER TABLE "SolicitudCambio" 
ADD COLUMN github_repo_url VARCHAR(500),
ADD COLUMN github_branch_name VARCHAR(200),
ADD COLUMN github_pr_number INTEGER,
ADD COLUMN github_pr_url VARCHAR(500),
ADD COLUMN github_commits JSONB,
ADD COLUMN github_last_sync TIMESTAMP;

-- Agregar comentarios para documentación
COMMENT ON COLUMN "SolicitudCambio".github_repo_url IS 'URL del repositorio de GitHub asociado';
COMMENT ON COLUMN "SolicitudCambio".github_branch_name IS 'Nombre del branch creado para esta solicitud';
COMMENT ON COLUMN "SolicitudCambio".github_pr_number IS 'Número del Pull Request asociado';
COMMENT ON COLUMN "SolicitudCambio".github_pr_url IS 'URL completa del Pull Request';
COMMENT ON COLUMN "SolicitudCambio".github_commits IS 'Array JSON con información de commits relacionados';
COMMENT ON COLUMN "SolicitudCambio".github_last_sync IS 'Última sincronización con GitHub API';

-- Índices para mejorar rendimiento
CREATE INDEX idx_solicitud_github_branch ON "SolicitudCambio"(github_branch_name);
CREATE INDEX idx_solicitud_github_pr ON "SolicitudCambio"(github_pr_number);
CREATE INDEX idx_solicitud_github_sync ON "SolicitudCambio"(github_last_sync);

COMMIT; 