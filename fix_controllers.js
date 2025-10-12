const fs = require("fs");
const path = require("path");

// Archivos a procesar
const controllers = [
  "src/presentation/controllers/CourseController.ts",
  "src/presentation/controllers/EventController.ts",
  "src/presentation/controllers/CertificateController.ts",
];

// Patrones a buscar y reemplazar
const patterns = [
  // Course Controller patterns
  {
    search:
      /const getCoursesUseCase = this\.container\.getGetCoursesUseCase\(\);[\s\S]*?return courseListResponse;/g,
    replace: `// TODO: Implement when getCoursesUseCase is available in DIContainer
      // const getCoursesUseCase = this.container.getGetCoursesUseCase();
      
      // Mock response for now
      return {
        courses: [
          {
            id: '1',
            title: 'Curso Mock',
            description: 'Descripción del curso mock',
            duration: 40,
            capacity: 30,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            status: 'active',
            enrollmentCount: 0,
            instructor: {
              id: '1',
              name: 'Instructor Mock'
            }
          }
        ],
        total: 1,
        page: filters.page || 1,
        pageSize: filters.pageSize || 10
      };`,
  },
  // Event Controller patterns
  {
    search:
      /const getEventsUseCase = this\.container\.getGetEventsUseCase\(\);[\s\S]*?return eventListResponse;/g,
    replace: `// TODO: Implement when getEventsUseCase is available in DIContainer
      // const getEventsUseCase = this.container.getGetEventsUseCase();
      
      // Mock response for now
      return {
        events: [
          {
            id: '1',
            title: 'Evento Mock',
            description: 'Descripción del evento mock',
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            location: 'Ubicación Mock',
            capacity: 100,
            status: 'active',
            enrollmentCount: 0,
            organizer: {
              id: '1',
              name: 'Organizador Mock'
            }
          }
        ],
        total: 1,
        page: filters.page || 1,
        pageSize: filters.pageSize || 10
      };`,
  },
  // Certificate Controller patterns
  {
    search:
      /const getCertificatesUseCase = this\.container\.getGetCertificatesUseCase\(\);[\s\S]*?return certificateListResponse;/g,
    replace: `// TODO: Implement when getCertificatesUseCase is available in DIContainer
      // const getCertificatesUseCase = this.container.getGetCertificatesUseCase();
      
      // Mock response for now
      return {
        certificates: [
          {
            id: '1',
            title: 'Certificado Mock',
            description: 'Descripción del certificado mock',
            issuedDate: new Date(),
            status: 'issued',
            recipient: {
              id: '1',
              name: 'Usuario Mock'
            }
          }
        ],
        total: 1,
        page: filters.page || 1,
        pageSize: filters.pageSize || 10
      };`,
  },
];

// Patrones genéricos para reemplazar llamadas a use cases
const genericPatterns = [
  // Patrón general para cualquier use case
  {
    search: /const (\w+UseCase) = this\.container\.get(\w+UseCase)\(\);/g,
    replace: (match, useCaseVar, useCaseMethod) => {
      return `// TODO: Implement when ${useCaseMethod} is available in DIContainer
      // const ${useCaseVar} = this.container.get${useCaseMethod}();`;
    },
  },
  // Reemplazar llamadas a execute con respuestas mock básicas
  {
    search: /await (\w+UseCase)\.execute\([^;]*\);/g,
    replace: `// Mock execution - TODO: Implement when use case is available`,
  },
];

function processFile(filePath) {
  console.log(`Processing ${filePath}...`);

  let content = fs.readFileSync(filePath, "utf8");

  // Aplicar patrones genéricos
  genericPatterns.forEach((pattern) => {
    if (typeof pattern.replace === "function") {
      content = content.replace(pattern.search, pattern.replace);
    } else {
      content = content.replace(pattern.search, pattern.replace);
    }
  });

  // Aplicar patrones específicos
  patterns.forEach((pattern) => {
    content = content.replace(pattern.search, pattern.replace);
  });

  fs.writeFileSync(filePath, content);
  console.log(`✓ ${filePath} processed`);
}

// Procesar todos los archivos
controllers.forEach((controller) => {
  const fullPath = path.join(__dirname, controller);
  if (fs.existsSync(fullPath)) {
    processFile(fullPath);
  } else {
    console.log(`File not found: ${fullPath}`);
  }
});

console.log("All controllers processed!");
