import { type SchemaTypeDefinition } from 'sanity'

import { category } from './documents/category'
import { course } from './documents/course'
import { instructor } from './documents/instructor'
import { lesson } from './documents/lesson'
import { video } from './documents/video'
import { learningOutcome } from './objects/learningOutcome'
import { module_ } from './objects/module'
import { resource } from './objects/resource'

/**
 * Sanity schema configuration
 * Exports all document and object type definitions for the Vertex content model
 */
export const schema: { types: SchemaTypeDefinition[] } = {
  types: [course, lesson, instructor, category, video, module_, learningOutcome, resource],
}
