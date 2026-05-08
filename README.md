# mandas-website

Static landing page for [mandas.io](https://mandas.io).

Mandas is a coming-soon open-source payment simulation platform for fintech developers and CTOs.

## Local preview

Open `index.html` directly in a browser, or serve the directory with any static file server.

## Deployment

The site is designed to deploy as a static Vercel project.

## Waitlist

The waitlist form submits to `api/waitlist.js`, which adds contacts to Brevo using Vercel environment variables:

- `BREVO_API_KEY`
- `BREVO_LIST_ID`

The Brevo API key is never exposed in browser code.
