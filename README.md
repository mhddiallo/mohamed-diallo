# mohamed-diallo.com

Site personnel bilingue (français / anglais) de Mohamed Diallo, avec ses sections **À propos**, **Articles**, **Carte**, **Intérêts**, **Objectifs** et **Notes**, et une interface d'administration utilisable sur ordinateur et sur mobile.

| Élément | Technologie |
| --- | --- |
| Site public | Next.js 16 (React, TypeScript) |
| Administration | Payload CMS 3, sur `/admin` |
| Base de données | PostgreSQL 16 |
| Carte | Leaflet + contours des pays (world-atlas), sans service de tuiles externe |
| Hébergement | Docker Compose sur un VPS, derrière Caddy (HTTPS automatique) |
| Design | « Latérite » : Bricolage Grotesque (titres), Literata (texte) |

## Les URL

| Section | Français | English |
| --- | --- | --- |
| Accueil | `/fr` | `/en` |
| À propos | `/fr/a-propos` | `/en/about` |
| Articles | `/fr/articles` | `/en/articles` |
| Carte | `/fr/carte` | `/en/map` |
| Intérêts | `/fr/interets` | `/en/interests` |
| Objectifs | `/fr/objectifs` | `/en/goals` |
| Notes | `/fr/notes` | `/en/notes` |

`/` redirige vers `/fr` ou `/en` selon la langue du navigateur. Le bouton FR/EN garde le visiteur sur la page équivalente (y compris pour un article, dont l'adresse diffère selon la langue).

## Utiliser l'administration

Rendez-vous sur `https://mohamed-diallo.com/admin`. À la première visite, le site demande de **créer le compte administrateur**.

- **Deux langues** : chaque contenu a un sélecteur de langue en haut à droite (Français / English). Remplissez la version française, enregistrez, basculez sur English et traduisez. Si une traduction manque, le site affiche la version française.
- **Articles** : créez d'abord vos **Thèmes**. Les articles ont un brouillon enregistré automatiquement. Le bouton « Publier » les met en ligne. Le slug (l'adresse) se génère tout seul à partir du titre.
- **Carte — lieux visités** : une entrée par ville et par voyage (ville, pays, année, souvenir facultatif). **Les coordonnées GPS sont trouvées automatiquement** (OpenStreetMap) si vous les laissez vides.
- **Intérêts** : type (livre, film, série, activité), statut, note sur 5, avis, couverture.
- **Objectifs** : créez d'abord vos **Domaines** (Sport, Carrière…). Pour afficher une barre de progression, remplissez **Avancement actuel** et **Cible** (ex. 14 / 20).
- **Notes** : pensées courtes, titre facultatif. Le texte en **gras** apparaît en couleur latérite.
- **Pages → Réglages du site** : nom, étiquette, accroche, introduction de l'accueil, message du pied de page, liens (LinkedIn, GitHub, e-mail…).
- **Pages → Page À propos** : photo, texte et parcours.

## Développement en local

Prérequis : Node.js 22+ et PostgreSQL.

```bash
cp .env.example .env        # puis renseignez DATABASE_URL et PAYLOAD_SECRET
npm install
npm run dev                 # http://localhost:3000
```

En développement, le schéma de la base se synchronise automatiquement.

**Quand vous modifiez le modèle de contenu** (un champ dans `src/collections` ou `src/globals`), créez une migration avant de déployer :

```bash
npm run migrate:create nom-du-changement
npm run generate:types
```

Les migrations sont appliquées automatiquement au démarrage du serveur en production.

## Déploiement sur le VPS

### 1. DNS

Chez le registrar de `mohamed-diallo.com`, créez deux enregistrements **A** vers l'adresse IP du VPS : `@` et `www`.

### 2. Préparer le serveur (une seule fois)

```bash
# Docker (Ubuntu / Debian)
curl -fsSL https://get.docker.com | sh

# Pare-feu : SSH + web
sudo ufw allow OpenSSH && sudo ufw allow 80 && sudo ufw allow 443 && sudo ufw enable

# Récupérer le code
git clone https://github.com/mhddiallo/mohamed-diallo.git
cd mohamed-diallo

# Configuration
cp .env.production.example .env
nano .env   # renseignez PAYLOAD_SECRET et POSTGRES_PASSWORD (openssl rand -hex 32)
```

### 3. Lancer

Le site rejoint le réseau Docker partagé `web`, par lequel le reverse proxy (Caddy) du serveur l'atteint sous le nom `mohamed-diallo-app:3000`.

```bash
docker network create web   # une seule fois par serveur
docker compose up -d --build
```

**Sur ce VPS, le HTTPS est assuré par le Caddy partagé** (`/opt/proxy`), qui sert tous les projets du serveur. Son `Caddyfile` contient :

```
mohamed-diallo.com {
	encode zstd gzip
	reverse_proxy mohamed-diallo-app:3000
}

www.mohamed-diallo.com {
	redir https://mohamed-diallo.com{uri} permanent
}
```

Après une modification : `docker exec proxy caddy reload --config /etc/caddy/Caddyfile`.

**Sur un serveur sans reverse proxy**, utilisez le Caddy fourni : `docker compose --profile caddy up -d --build`.

Le certificat HTTPS est obtenu automatiquement (comptez une minute après la propagation DNS). Ouvrez ensuite `https://mohamed-diallo.com/admin` pour créer votre compte.

### Mettre à jour le site

```bash
cd mohamed-diallo
git pull
docker compose up -d --build
```

### Sauvegardes

```bash
# Base de données → ./backups/site-AAAA-MM-JJ.sql.gz
docker compose exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' | gzip > backups/site-$(date +%F).sql.gz

# Images envoyées depuis l'admin
docker run --rm -v mohamed-diallo_media:/media -v "$PWD/backups":/out alpine tar czf /out/media-$(date +%F).tar.gz -C /media .
```

Pour automatiser, ajoutez ces deux lignes dans une tâche `cron` quotidienne et copiez le dossier `backups/` hors du serveur.

### Plusieurs projets sur le même VPS

Un seul Caddy sert tous les domaines : chaque projet branche son conteneur sur le réseau `web`, et on ajoute un bloc par domaine dans le `Caddyfile` (par exemple `autre-projet.com { reverse_proxy autre-app:8080 }`).

## Structure du code

```
src/
  app/(frontend)/[locale]/   pages du site (une par section)
  app/(frontend)/styles.css  le design « Latérite »
  app/(payload)/             l'administration (générée par Payload)
  collections/ globals/      le modèle de contenu
  components/                carte, cartes d'articles, sélecteur de langue…
  lib/i18n.ts                textes de l'interface FR/EN et URL traduites
  migrations/                migrations de la base de données
  proxy.ts                   redirection de « / » et URL traduites
```
