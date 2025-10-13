export interface ICourseRepository {
    findById(id: string): Promise<any | null>;
    findAll(): Promise<any[]>;
    create(courseData: any): Promise<any>;
    update(id: string, courseData: any): Promise<any | null>;
    delete(id: string): Promise<void>;
    findByCategory(categoryId: string): Promise<any[]>;
    findByOrganizer(organizerId: string): Promise<any[]>;
}
export interface CourseFilters {
    category?: number;
    organizer?: string;
    status?: string;
    audienceType?: string;
    isFree?: boolean;
}
//# sourceMappingURL=ICourseRepository.d.ts.map