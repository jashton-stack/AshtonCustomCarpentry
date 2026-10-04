# Ashton Custom Carpentry

Static marketing site (HTML/CSS/JS, no build step) for bookmatch tables, river tables, and epoxy/wood countertops & bar tops. Black & gold theme.

## Structure
```
index.html        Single-page site (all sections)
thanks.html       Contact form success page
css/styles.css    Theme, layout, animations
js/main.js        Preloader, nav, scroll reveals, counters, gallery filter, testimonials, hero gold-dust canvas
images/gallery/   Drop project photos here
netlify.toml      Netlify config
```

## Page outline
1. **Hero** – animated header: preloader, gold-dust particles, flowing "river" glow, word-by-word title reveal, parallax
2. **The Craft** – brand statement + animated stat counters
3. **Signature Work** – Bookmatch · River · Countertops · Bar Tops
4. **The Collection** – filterable portfolio gallery
5. **Process** – 5-step timeline
6. **Materials & Finishes** – species marquee + resin/finish/base options
7. **The Maker** – about / founder story
8. **Client Words** – rotating testimonials
9. **Commission** – Netlify-powered inquiry form + contact info

## Editing
- Search `[EDIT` and `[Project Name]` in `index.html` / `thanks.html` for every placeholder.
- Replace each `<div class="ph ...">` with `<img src="images/gallery/your-photo.jpg" alt="...">`.
- Colors live in `:root` at the top of `css/styles.css`.

## Local preview
```
python3 -m http.server 8000
```

## Deploy (Netlify)
New site → Import from GitHub → pick this repo. Build command: none. Publish directory: `.`
Form submissions show up under **Forms** in the Netlify dashboard (enable form detection and set email notifications there).
