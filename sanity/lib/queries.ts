import { defineQuery } from 'next-sanity'

/**
 * GROQ projection for course card data including instructor and category references
 */
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

/** GROQ query to fetch all courses ordered by creation date */
export const COURSES_QUERY = defineQuery(`
  *[_type == "course" && defined(slug.current)] | order(_createdAt desc) ${COURSE_CARD_PROJECTION}
`)

/** GROQ query to fetch all course slugs for static generation */
export const COURSE_SLUGS_QUERY = defineQuery(`
  *[_type == "course" && defined(slug.current)].slug.current
`)

/** GROQ query to fetch a single course by slug with full details including modules and lessons */
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

/** GROQ query to fetch a single lesson by slug with video, notes, and resources */
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

/** GROQ query to fetch the parent course for a given lesson ID */
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

/** GROQ query to fetch all instructors ordered by name */
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

/** GROQ query to fetch a single instructor by slug */
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

/** GROQ query to fetch all categories ordered by title */
export const CATEGORIES_QUERY = defineQuery(`
  *[_type == "category"] | order(title asc){
    _id,
    title,
    "slug": slug.current,
    description,
  }
`)

/** GROQ query to fetch a single category by slug */
export const CATEGORY_BY_SLUG_QUERY = defineQuery(`
  *[_type == "category" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    description,
  }
`)
