# Fonts Directory

Place commercial font files here for self-hosting.

## Required Fonts

Copy these files from your branding kit:

### Graphik (font-body)
From: `maslow-branding-kit/fonts/Graphik-font/`
- `Graphik-Regular.otf` → rename to `graphik-regular.woff2` (or keep .otf)
- `Graphik-Bold.otf` → rename to `graphik-bold.woff2` (or keep .otf)

### Nocturno Display (font-editorial)
From: `maslow-branding-kit/fonts/Nocturno-font/`
- `Nocturno Display Std Bk.otf` → rename to `nocturno-display-book.woff2` (or keep .otf)

## Recommended Format

For best web performance, convert `.otf` files to `.woff2` using:
- [Transfonter](https://transfonter.org/) (free online converter)
- [Font Squirrel Generator](https://www.fontsquirrel.com/tools/webfont-generator)

## After Adding Fonts

The `@font-face` rules will be configured in `globals.css` to load these fonts.
