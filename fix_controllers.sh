#!/bin/bash

# Script para reemplazar todas las llamadas a use cases en los controladores

# CourseController
echo "Fixing CourseController..."
cd /home/adrian/RefactorizacionPatrones/BACKEND_APP/src/presentation/controllers

# Reemplazar todas las líneas que usan variables de use case con comentarios mock
sed -i 's/const result = await [a-zA-Z]*UseCase\.execute(/\/\/ Mock response - TODO: Replace when use case is available\n      const result = {/g' CourseController.ts
sed -i 's/const course = await [a-zA-Z]*UseCase\.execute(/\/\/ Mock response - TODO: Replace when use case is available\n      const course = {/g' CourseController.ts  
sed -i 's/const enrollment = await [a-zA-Z]*UseCase\.execute(/\/\/ Mock response - TODO: Replace when use case is available\n      const enrollment = {/g' CourseController.ts
sed -i 's/await [a-zA-Z]*UseCase\.execute(/\/\/ Mock response - TODO: Replace when use case is available\n      \/\/ await mockUseCase.execute(/g' CourseController.ts

echo "CourseController fixed!"

# EventController  
echo "Fixing EventController..."
sed -i 's/const result = await [a-zA-Z]*UseCase\.execute(/\/\/ Mock response - TODO: Replace when use case is available\n      const result = {/g' EventController.ts
sed -i 's/const event = await [a-zA-Z]*UseCase\.execute(/\/\/ Mock response - TODO: Replace when use case is available\n      const event = {/g' EventController.ts
sed -i 's/const enrollment = await [a-zA-Z]*UseCase\.execute(/\/\/ Mock response - TODO: Replace when use case is available\n      const enrollment = {/g' EventController.ts
sed -i 's/await [a-zA-Z]*UseCase\.execute(/\/\/ Mock response - TODO: Replace when use case is available\n      \/\/ await mockUseCase.execute(/g' EventController.ts

echo "EventController fixed!"

# CertificateController
echo "Fixing CertificateController..."
sed -i 's/const result = await [a-zA-Z]*UseCase\.execute(/\/\/ Mock response - TODO: Replace when use case is available\n      const result = {/g' CertificateController.ts
sed -i 's/const certificate = await [a-zA-Z]*UseCase\.execute(/\/\/ Mock response - TODO: Replace when use case is available\n      const certificate = {/g' CertificateController.ts
sed -i 's/const response = await [a-zA-Z]*UseCase\.execute(/\/\/ Mock response - TODO: Replace when use case is available\n      const response = {/g' CertificateController.ts
sed -i 's/await [a-zA-Z]*UseCase\.execute(/\/\/ Mock response - TODO: Replace when use case is available\n      \/\/ await mockUseCase.execute(/g' CertificateController.ts

echo "CertificateController fixed!"
echo "All controllers processed!"