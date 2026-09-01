import { type SchemaTypeDefinition } from 'sanity'

import { category } from './documents/category'
import { course } from './documents/course'
import { instructor } from './documents/instructor'
import { lesson } from './documents/lesson'
import { module_ } from './objects/module'
import { outcome } from './objects/outcome'
import { resource } from './objects/resource'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [course, lesson, instructor, category, module_, outcome, resource],
}
