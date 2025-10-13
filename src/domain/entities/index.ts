/**
 * Domain Entities - Centralized Exports
 * 
 * Todas las entidades del dominio exportadas desde un punto central
 * para facilitar imports y mantener organización
 */

// Core Business Entities
export { Course } from './Course';
export type { CourseData } from './Course';
export { Event } from './Event';
export type { EventData } from './Event';
export type { User } from './User';
export type { Career } from './Career';

// Management Entities  
export { Certificate } from './Certificate';
export { ChangeRequest } from './ChangeRequest';
export { Developer } from './Developer';
export { Report } from './Report';

// Process Entities
export { Inscription } from './Inscription';
export { Enrollment } from './Enrollment';
export { Participation } from './Participation';

// System Entities
export { VerificationToken } from './VerificationToken';
export { HomepageContent } from './HomepageContent';
export { HomepageDashboard } from './HomepageDashboard';