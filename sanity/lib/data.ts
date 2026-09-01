import 'server-only'

import { sanityFetch } from './fetch'
import {
  CATEGORIES_QUERY,
  CATEGORY_BY_SLUG_QUERY,
  COURSE_BY_SLUG_QUERY,
  COURSE_FOR_LESSON_QUERY,
  COURSE_SLUGS_QUERY,
  COURSES_QUERY,
  INSTRUCTOR_BY_SLUG_QUERY,
  INSTRUCTORS_QUERY,
  LESSON_BY_SLUG_QUERY,
} from './queries'

/**
 * Fetches all courses with their instructor and category information.
 * @returns Array of course objects
 */
export function getCourses() {
  return sanityFetch({ query: COURSES_QUERY, tags: ['course', 'instructor', 'category'] })
}

/**
 * Fetches slugs for all courses, typically used for static path generation.
 * @returns Array of course slug objects
 */
export function getCourseSlugs() {
  return sanityFetch({ query: COURSE_SLUGS_QUERY, tags: ['course'] })
}

/**
 * Fetches a single course by its slug with all related data.
 * @param slug - Course slug identifier
 * @returns Course object with modules, lessons, instructor, and category
 */
export function getCourseBySlug(slug: string) {
  return sanityFetch({
    query: COURSE_BY_SLUG_QUERY,
    params: { slug },
    tags: [`course:${slug}`, 'lesson', 'instructor', 'category'],
  })
}

/**
 * Fetches a single lesson by its slug.
 * @param slug - Lesson slug identifier
 * @returns Lesson object with video, notes, and metadata
 */
export function getLessonBySlug(slug: string) {
  return sanityFetch({ query: LESSON_BY_SLUG_QUERY, params: { slug }, tags: [`lesson:${slug}`] })
}

/**
 * Fetches the parent course for a given lesson.
 * @param lessonId - Lesson document ID
 * @returns Course object that contains the specified lesson
 */
export function getCourseForLesson(lessonId: string) {
  return sanityFetch({ query: COURSE_FOR_LESSON_QUERY, params: { lessonId }, tags: ['course'] })
}

/**
 * Fetches all instructors.
 * @returns Array of instructor objects
 */
export function getInstructors() {
  return sanityFetch({ query: INSTRUCTORS_QUERY, tags: ['instructor'] })
}

/**
 * Fetches a single instructor by their slug.
 * @param slug - Instructor slug identifier
 * @returns Instructor object with bio, expertise, and courses
 */
export function getInstructorBySlug(slug: string) {
  return sanityFetch({
    query: INSTRUCTOR_BY_SLUG_QUERY,
    params: { slug },
    tags: [`instructor:${slug}`],
  })
}

/**
 * Fetches all course categories.
 * @returns Array of category objects
 */
export function getCategories() {
  return sanityFetch({ query: CATEGORIES_QUERY, tags: ['category'] })
}

/**
 * Fetches a single category by its slug.
 * @param slug - Category slug identifier
 * @returns Category object with title and description
 */
export function getCategoryBySlug(slug: string) {
  return sanityFetch({
    query: CATEGORY_BY_SLUG_QUERY,
    params: { slug },
    tags: [`category:${slug}`],
  })
}
