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
 * Fetches all courses with instructor and category data
 * @returns Array of course card data
 */
export function getCourses() {
  return sanityFetch({ query: COURSES_QUERY, tags: ['course', 'instructor', 'category'] })
}

/**
 * Fetches all course slugs for static path generation
 * @returns Array of course slug strings
 */
export function getCourseSlugs() {
  return sanityFetch({ query: COURSE_SLUGS_QUERY, tags: ['course'] })
}

/**
 * Fetches a single course by slug with full details including modules and lessons
 * @param slug - Course slug
 * @returns Course data or null if not found
 */
export function getCourseBySlug(slug: string) {
  return sanityFetch({
    query: COURSE_BY_SLUG_QUERY,
    params: { slug },
    tags: [`course:${slug}`, 'lesson', 'instructor', 'category'],
  })
}

/**
 * Fetches a single lesson by slug with video, notes, and resources
 * @param slug - Lesson slug
 * @returns Lesson data or null if not found
 */
export function getLessonBySlug(slug: string) {
  return sanityFetch({ query: LESSON_BY_SLUG_QUERY, params: { slug }, tags: [`lesson:${slug}`] })
}

/**
 * Fetches the parent course for a given lesson
 * @param lessonId - Lesson document ID
 * @returns Course data with module structure or null if not found
 */
export function getCourseForLesson(lessonId: string) {
  return sanityFetch({ query: COURSE_FOR_LESSON_QUERY, params: { lessonId }, tags: ['course'] })
}

/**
 * Fetches all instructors
 * @returns Array of instructor data
 */
export function getInstructors() {
  return sanityFetch({ query: INSTRUCTORS_QUERY, tags: ['instructor'] })
}

/**
 * Fetches a single instructor by slug
 * @param slug - Instructor slug
 * @returns Instructor data or null if not found
 */
export function getInstructorBySlug(slug: string) {
  return sanityFetch({
    query: INSTRUCTOR_BY_SLUG_QUERY,
    params: { slug },
    tags: [`instructor:${slug}`],
  })
}

/**
 * Fetches all categories
 * @returns Array of category data
 */
export function getCategories() {
  return sanityFetch({ query: CATEGORIES_QUERY, tags: ['category'] })
}

/**
 * Fetches a single category by slug
 * @param slug - Category slug
 * @returns Category data or null if not found
 */
export function getCategoryBySlug(slug: string) {
  return sanityFetch({
    query: CATEGORY_BY_SLUG_QUERY,
    params: { slug },
    tags: [`category:${slug}`],
  })
}
