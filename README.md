# ScubaCuba.ca

All-inclusive scuba diving vacation packages in Cuba. A partnership between MARLIN, AquaSub Scuba Diving Centre, and Hola Sun Holidays.

- **Live site:** _connect via Netlify_
- **TICO Registration:** #50018183
- **Phone:** +1 (905) 883-3483
- **Email:** info@scubacuba.ca

## Project structure

```
.
├── prototype/           # The actual website (deployed to Netlify)
│   ├── index.html
│   ├── about.html
│   ├── diving-centers.html
│   ├── upcoming-trips.html
│   ├── gallery.html
│   ├── quote.html
│   ├── css/
│   ├── js/
│   └── images/
│       ├── underwater/  # 38 underwater dive photos
│       ├── landscape/   # Sunsets, waterfalls, mountains
│       ├── town/        # Trinidad, Cienfuegos
│       ├── hotel/       # Resorts
│       ├── people/      # Dive groups
│       ├── surface/     # Boats
│       └── logos/       # Brand assets
├── netlify.toml         # Netlify build/deploy config
└── README.md
```

## Local development

The site is plain static HTML/CSS/JS — no build step.

```bash
# Serve locally on http://localhost:8080
python3 -m http.server 8080 --directory prototype
```

## Deployment

Pushed to `main` → auto-deploys via Netlify (publish dir: `prototype/`).

## Featured dive centers

- **Faro Luna — Cienfuegos** ★ Most Popular
- **Guajimico** 🌿 Hidden Gem
- 12 more dive centers across Cuba

Both Faro Luna and Guajimico are within reach of:
- 🏛️ **Trinidad** — UNESCO World Heritage colonial town
- 🏔️ **Nicho Waterfalls** — Escambray Mountains
