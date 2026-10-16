export type SearchResult = {
  id: string;
  kind: 'video' | 'lesson';
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  moduleTitle: string;
  moduleNumber: number;
  lessonNumber: number;
  lessonTitle: string;
  lessonSlug: string;
  description: string;
  keyPoints: string[];
  imageUrl: string | null;
  duration: number;
  startSeconds: number | null;
  score: number;
};

export type SearchResponse = {
  query: string;
  total: number;
  courseCount: number;
  results: SearchResult[];
};
