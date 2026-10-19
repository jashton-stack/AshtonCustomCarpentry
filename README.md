# Ashton Custom Carpentry — design preview

An original black-and-gold website concept for bespoke tables, wood and epoxy countertops, and custom bar tops. Static HTML, CSS and JavaScript. No build tools or package installation required.

## Preview locally

From the repository root:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open the served page in a browser. The design includes responsive navigation, gallery filters, project dialogs, scroll reveals, a scroll progress indicator, and reduced-motion support.

## Preview content

The six gallery images, hero, and workshop image are generated illustrative design concepts, not photographs of completed commissions. The gallery and project dialogs identify concept imagery. Personal photos and their staged derivatives are excluded from the website assets and download package; original uploads remain preserved outside the checkout. Confirm portfolio content, materials, business details, availability, and delivery terms before launch.

The inquiry form performs browser validation and shows an explicit preview message. It does not transmit or store inquiries. Configure and verify real submission handling before launch.

Fonts are bundled locally so the preview does not depend on Google Fonts access. Bodoni Moda and Manrope are distributed under the SIL Open Font License; license files are in `assets/fonts/`.

## Publish later

Import this GitHub repository into Netlify and select the branch containing this site. Use no build command and publish directory `.`. The included Netlify configuration sets standard response headers. Live publication and inquiry handling have not been configured by this preview.
