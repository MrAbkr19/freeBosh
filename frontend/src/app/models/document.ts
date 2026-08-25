export interface CourseDocument {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileSize: number;
  courseModuleId: string;
  teacherId: string;
  createdAt: string;
}