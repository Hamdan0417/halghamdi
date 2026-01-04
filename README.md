# Hamdan Alghamdi Personal Website

A production-ready, bilingual (Arabic/English) personal branding website for Hamdan Alghamdi. Built with pure HTML/CSS/JS and a minimal Node/Express backend for the contact form.

## Project Structure

```
├── public/                 # Static frontend files
│   ├── ar/                 # Arabic pages (RTL)
│   ├── en/                 # English pages (LTR)
│   ├── css/                # Styles (CSS Variables, Flex/Grid)
│   ├── js/                 # Logic (Theme, Lang, Animations)
│   ├── assets/             # Images and Icons
│   ├── index.html          # Root redirector
│   ├── robots.txt          # SEO
│   └── sitemap.xml         # SEO
├── src/                    # Source directory for user assets
│   └── profile.jpg         # Place the real portrait here
├── server/                 # Backend handler
│   └── server.js           # Express app (Contact API)
├── package.json            # Backend dependencies
└── README.md               # Documentation
```

## Setup & Running Locally

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Variables:**
    Copy `.env.example` to `.env` and fill in your details:
    ```bash
    cp .env.example .env
    ```
    - `TURNSTILE_SECRET_KEY`: Get this from Cloudflare.
    - `SMTP_...`: Your email provider details.

3.  **Run Development Server:**
    ```bash
    npm start
    ```
    The site will be available at `http://localhost:3000`.

## Deployment

### Frontend (Static)
The `public/` folder contains a completely static website. You can deploy it to:
- **Cloudflare Pages / Vercel / Netlify:** Point the build directory to `public`.
- **Apache/Nginx:** Upload `public/` content to `/var/www/html`.

### Backend (Form Handler)
The `server/` folder (or the root app) handles the POST request to `/api/contact`.
- **Node.js Hosting (Heroku/DigitalOcean):** Deploy the whole repo. The `start` script runs the server which also serves the static files from `public/`.
- **Serverless:** If using Netlify/Vercel, you can migrate `server.js` logic to a Serverless Function (e.g., `functions/contact.js`).

## Customization

1.  **Profile Picture:**
    Replace `src/profile.jpg` with the actual high-quality portrait.

2.  **Turnstile Keys:**
    - Update `data-sitekey` in `public/en/contact/index.html` and `public/ar/contact/index.html`.
    - Update `TURNSTILE_SECRET_KEY` in `.env`.

## Compliance & Features

- **Bilingual:** Full AR/EN support with automatic RTL/LTR switching.
- **Privacy:** No phone numbers displayed. Only email and form.
- **Content:** Strictly professional. No crypto/blockchain mentions.
- **SEO:** Fully optimized (Meta tags, OpenGraph, Schema, Sitemap).
- **Performance:** Minimal, vanilla JS/CSS. No heavy frameworks.
- **Accessibility:** Semantic HTML, ARIA labels, Keyboard navigation.
