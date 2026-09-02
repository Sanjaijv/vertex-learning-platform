import { defineField, defineType } from 'sanity'

/**
 * Outcome object type schema
 * Represents a learning outcome with icon, title, and description for "What you'll learn" sections
 */
export const outcome = defineType({
  name: 'outcome',
  title: 'Outcome',
  type: 'object',
  fields: [
    defineField({
      name: 'icon',
      title: 'Icon',
      description: 'A lucide-react icon name, e.g. "code" or "database".',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'icon' },
  },
})
