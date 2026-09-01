import { defineQuery } from 'next-sanity'

const COURSE_CARD_PROJECTION = /* groq */ `{
  _id,
  title,
  "slug": slug.current,
  summary,
  coverImage,
  level,
  price,
  popular,
  studentCount,
  instructor->{ name, "slug": slug.current, photo },
  category->{ title, "slug": slug.current },
}`

export const COURSES_QUERY = defineQuery(`
  *[_type == "course" && defined(slug.current)] | order(_createdAt desc) ${COURSE_CARD_PROJECTION}
`)

export const COURSE_SLUGS_QUERY = defineQuery(`
  *[_type == "course" && defined(slug.current)].slug.current
`)

export const COURSE_BY_SLUG_QUERY = defineQuery(`
  *[_type == "course" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    summary,
    coverImage,
    level,
    price,
    popular,
    studentCount,
    outcomes[]{ icon, title, description },
    instructor->{ name, "slug": slug.current, photo, expertise, bio },
    category->{ title, "slug": slug.current },
    modules[]{
      title,
      summary,
      lessons[]->{
        _id,
        title,
        "slug": slug.current,
        duration,
        freePreview,
        poster,
      },
    },
  }
`)

export const LESSON_BY_SLUG_QUERY = defineQuery(`
  *[_type == "lesson" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    videoUrl,
    poster,
    duration,
    freePreview,
    studentCount,
    keyPoints,
    notes,
    proTip,
    resources[]{ type, title, description, url },
  }
`)

export const COURSE_FOR_LESSON_QUERY = defineQuery(`
  *[_type == "course" && references($lessonId)][0]{
    _id,
    title,
    "slug": slug.current,
    modules[]{
      title,
      lessons[]->{ _id, title, "slug": slug.current },
    },
  }
`)

export const INSTRUCTORS_QUERY = defineQuery(`
  *[_type == "instructor"] | order(name asc){
    _id,
    name,
    "slug": slug.current,
    photo,
    expertise,
    bio,
  }
`)

export const INSTRUCTOR_BY_SLUG_QUERY = defineQuery(`
  *[_type == "instructor" && slug.current == $slug][0]{
    _id,
    name,
    "slug": slug.current,
    photo,
    expertise,
    bio,
  }
`)

export const CATEGORIES_QUERY = defineQuery(`
  *[_type == "category"] | order(title asc){
    _id,
    title,
    "slug": slug.current,
    description,
  }
`)

export const CATEGORY_BY_SLUG_QUERY = defineQuery(`
  *[_type == "category" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    description,
  }
`)
