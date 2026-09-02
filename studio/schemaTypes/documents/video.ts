import { PlayIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

export const video = defineType({
  name: 'video',
  title: 'Video',
  type: 'document',
  icon: PlayIcon,
  fields: [
    defineField({
      name: 'id',
      title: 'Provider video id',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      type: 'url',
      validation: (rule) => rule.required().uri({ scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'chapters',
      title: 'Chapters (table of contents)',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'chapter',
          fields: [
            defineField({
              name: 'startSeconds',
              type: 'number',
              validation: (rule) => rule.required().min(0),
            }),
            defineField({
              name: 'label',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'startSeconds' },
          },
        }),
      ],
    }),
    defineField({
      name: 'chunks',
      title: 'Transcript chunks',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'chunk',
          fields: [
            defineField({
              name: 'startSeconds',
              type: 'number',
              validation: (rule) => rule.required().min(0),
            }),
            defineField({
              name: 'text',
              type: 'text',
              rows: 2,
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: 'text', subtitle: 'startSeconds' },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'id', subtitle: 'url' },
  },
})
