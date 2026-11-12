import type { Access } from 'payload'

/** Anyone can read; anonymous visitors only see published documents. */
export const publishedOrLoggedIn: Access = ({ req }) => {
  if (req.user) return true
  return { _status: { equals: 'published' } }
}

export const anyone: Access = () => true
