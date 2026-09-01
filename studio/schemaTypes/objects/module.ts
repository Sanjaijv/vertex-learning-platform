import { defineArrayMember, defineField, defineType } from 'sanity'

export const module_ = defineType({
  name: 'module',
  title: 'Module',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'summary',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'lessons',
      title: 'Lessons',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'lesson' }] })],
      validation: (rule) => rule.min(1),
    }),
  ],
  preview: {
    select: { title: 'title', lessons: 'lessons' },
    prepare({ title, lessons }) {
      const count = Array.isArray(lessons) ? lessons.length : 0
      return { title, subtitle: `${count} lesson${count === 1 ? '' : 's'}` }
    },
  },
})
