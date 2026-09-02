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

export function getCourses() {
  return sanityFetch({ query: COURSES_QUERY, tags: ['course', 'instructor', 'category'] })
}

export function getCourseSlugs() {
  return sanityFetch({ query: COURSE_SLUGS_QUERY, tags: ['course'] })
}

export function getCourseBySlug(slug: string) {
  return sanityFetch({
    query: COURSE_BY_SLUG_QUERY,
    params: { slug },
    tags: [`course:${slug}`, 'lesson', 'instructor', 'category'],
  })
}

export function getLessonBySlug(slug: string) {
  return sanityFetch({ query: LESSON_BY_SLUG_QUERY, params: { slug }, tags: [`lesson:${slug}`] })
}

export function getCourseForLesson(lessonId: string) {
  return sanityFetch({ query: COURSE_FOR_LESSON_QUERY, params: { lessonId }, tags: ['course'] })
}

export function getInstructors() {
  return sanityFetch({ query: INSTRUCTORS_QUERY, tags: ['instructor'] })
}

export function getInstructorBySlug(slug: string) {
  return sanityFetch({
    query: INSTRUCTOR_BY_SLUG_QUERY,
    params: { slug },
    tags: [`instructor:${slug}`],
  })
}

export function getCategories() {
  return sanityFetch({ query: CATEGORIES_QUERY, tags: ['category'] })
}

export function getCategoryBySlug(slug: string) {
  return sanityFetch({
    query: CATEGORY_BY_SLUG_QUERY,
    params: { slug },
    tags: [`category:${slug}`],
  })
}
