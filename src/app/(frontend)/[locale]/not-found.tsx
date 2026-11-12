import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="page-head">
      <h1>404</h1>
      <p className="lede">
        Page introuvable · Page not found
      </p>
      <p>
        <Link href="/fr">Accueil</Link> · <Link href="/en">Home</Link>
      </p>
    </section>
  )
}
