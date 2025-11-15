# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This repo contains a static marketing site for a children’s animation/party agency ("Holiday") with:
- A single-page landing (`index.html`) in Russian with sections for hero, statistics, characters catalog, programs, advantages, contact form, and footer.
- Styling in `styles.css` with extensive animation, parallax, and responsive rules.
- Frontend interactivity in `script.js` plus modular JS under `js/` for particles, parallax, and a dynamic characters catalog.
- Python utilities (`analyze_photos.py`, `merge_characters.py`, `find_duplicates.py`) for maintaining the character gallery data and detecting duplicate images.
- Data and assets under `data/` and `images/` (not all files are listed here but are used by the catalog and gallery).

There is no package manager or build system; the site is served as plain static HTML/CSS/JS, and helper scripts are run directly with Python.

## Common Commands

All commands assume the repo root `C:\Users\paneo\Documents\GitHub\paneok.github.io`.

### Static site usage

- Open the main site in a browser (file URL or any static server):
  - On Windows, you can run:
    - `index.html` via double-click in Explorer
    - or serve the directory, for example with Python:
      - `python -m http.server 8000`

### Python utilities (gallery & characters data)

All Python scripts operate on `data/characters-data.json` and `images/`:

- Analyze numbered photos and current JSON for merge candidates:
  - `python analyze_photos.py`
- Analyze gallery duplicates and write `gallery_analysis_report.json`:
  - `python find_duplicates.py`
- Manually inspect princess groups and then merge configured character groups in the JSON:
  - `python merge_characters.py`

There are no automated tests or lint commands defined in this repository. If you introduce them, document the commands here.

## High-Level Architecture

### Frontend structure

- `index.html` is the single entry point and wires in:
  - `styles.css` for all global styles, layout, and animations.
  - Third-party libraries via CDN:
    - `@tsparticles/confetti` for confetti effects.
    - `swiper` for carousels/sliders.
    - `noUiSlider` for the price range slider.
  - Local JS modules (via `<script>` tags):
    - `js/particles-config.js` – configures and initializes the background particles/confetti system.
    - `js/parallax.js` – drives the parallax motion of hero decorations using data attributes like `data-speed` on `.parallax-item` elements.
    - `js/characters-filter.js` – defines a `CharactersFilter` class used to handle filters (age, gender, activities, price slider, sort, search) for the characters catalog.
    - `js/characters-renderer.js` – defines a `charactersRenderer` object (also attached to `window`) responsible for loading `data/characters-data.json`, maintaining an in-memory `characters` array, and rendering `.character-card` elements into `#characters-grid`.
    - `script.js` – the main behavior script that coordinates UI behaviors and integrates the catalog and gallery.

The core flow for the characters catalog is:
1. `index.html` defines the filters panel and an initially empty `#characters-grid` container.
2. On pages where `#characters-grid` exists, `script.js` calls `charactersRenderer.loadCharacters()` and then instantiates `new CharactersFilter(charactersRenderer)`.
3. `charactersRenderer.renderCharacters()` populates the grid with cards, using data from `characters-data.json`.
4. `script.js` decorates these cards with hover animations, zoom behavior, and attaches click handlers for opening the gallery modal.

### `script.js` responsibilities

`script.js` is the main orchestrator of page behavior and is tightly coupled to the DOM structure in `index.html` and CSS classes in `styles.css`. Major responsibilities:

- Navigation & scrolling:
  - Smooth scrolling for all internal anchor links (`a[href^="#"]`).
  - Mobile menu toggle (`.mobile-menu-btn` and `.nav-menu.active`).
  - Header scroll effect (hiding on scroll down, showing with increased shadow on scroll up, plus `header.scrolled` class for compact mode).
  - Scroll reveal animations via `IntersectionObserver` on `.fade-in` elements.

- UI enhancements:
  - Animations for `.character-card`, `.program-card` hover states.
  - Notification system (`showNotification(message, type)`) used for form submission feedback and guidance prompts.
  - Button ripple effect for `.btn` elements, implemented via dynamic `<span.ripple>` and injected `@keyframes ripple-effect`.
  - Hero parallax effect that adjusts `.hero-content` and `.shape` positions based on scroll.
  - Animated number counters for `.stat-card .stat-number` using `requestAnimationFrame`, driven by an `IntersectionObserver` so counters start when cards enter view.
  - Dynamic footer year (`.footer-bottom p`) set to current year in Russian copy.
  - Page fade-in on `window.load`.
  - Emoji hover effects for `.character-emoji` and `.program-emoji`.

- Characters catalog integration:
  - `initializeCharactersCatalog()` asynchronously calls `charactersRenderer.loadCharacters()`, constructs a global `charactersFilter`, and invokes `charactersRenderer.renderCharacters()`.
  - Error handling: logs initialization errors and uses `charactersRenderer.showError()` to update the UI on failure.
  - On load or when the renderer re-renders the grid, `script.js` reinits the image zoom behavior (see below) by monkey-patching `charactersRenderer.renderCharacters` to call `initializeImageZoom()` after the original implementation.

- Image zoom & gallery modal:
  - `initializeImageZoom()` targets `.character-image-container` and attaches:
    - On non-touch devices: a mouse-move-based zoom that scales `.character-photo` to ~2.475x and translates it in X/Y proportionally to cursor position to reveal different regions of the portrait.
    - On all devices: a click handler that finds the parent `.character-card`, reads `data-character-id`, and calls `openGalleryModal(characterId)`.
  - `createGalleryModal()` builds and injects the gallery modal DOM (overlay, main image, thumbnails, character info, pricing, order button) only once.
  - `openGalleryModal(characterId)`:
    - Uses `window.charactersRenderer.characters` to find the full character object by numeric `id`.
    - Validates that `character.images.main` exists; if not, shows an error notification and exits.
    - Builds a de-duplicated list of image URLs from `main` + `gallery`.
    - Populates modal text:
      - Name, full/short description.
      - Feature blocks (age, gender labels mapped from `features.gender`, activities mapped from `features.activities`).
      - Pricing (hourly price and optional `pricing.packages`).
    - Sets up gallery state: main image, thumbnails (if more than one image), counter, prev/next navigation, and keyboard controls.
    - The "Заказать персонажа" button closes the modal and scrolls to `#contact`, pre-filling the contact form textarea with a booking message containing the character’s name.

### `styles.css` responsibilities

`styles.css` contains all styling logic, including:

- Design tokens (`:root` custom properties for colors, shadows, etc.).
- Layout and styling for header/navigation, hero background and shapes, buttons, stats, sections, cards, contact form, footer.
- Responsive behavior via `@media` rules for mobile/tablet, including disabling `scroll-behavior: smooth` on small screens to avoid jitter.
- Animation keyframes for slide/fade/bounce/pulse/parallax-related effects, and styling for parallax layer elements (balloons, cakes, gifts, stars, hearts, confetti, etc.).

Future changes to structure or class names must keep `script.js` and `styles.css` in sync with `index.html`.

### Data & assets

- `data/characters-data.json` (not shown here) is the canonical source of truth for characters. It typically contains fields like:
  - `id`, `name`, `slug`, `category`, `emoji`, `images` (`main`, `gallery`), `description`, `features` (age, gender, activities), `pricing` (hourly, packages), tags, and popularity flags.
- `images/catalog/` contains character photos; filenames may include numbers that indicate variants of the same character.

The Python utilities expect this structure; changing it requires updating `analyze_photos.py`, `merge_characters.py`, and `find_duplicates.py` accordingly.

### Python scripts: responsibilities & workflow

- `analyze_photos.py`:
  - Scans `images/catalog` for image filenames that end with a number before the extension (e.g. `Elsa 2.jpg`).
  - Normalizes names and groups related photos (via special rules for known character types like русалочка, буба, космонавт, скоморох, тедди, etc.).
  - Analyzes `data/characters-data.json` to find characters with numbers in their names or main image paths and prints them as merge candidates.

- `merge_characters.py`:
  - Loads `data/characters-data.json` and merges specific hard-coded groups of character IDs into single characters.
  - For each group, collects all image paths from `images.main` and `images.gallery` into a deduplicated gallery list for the primary character.
  - Writes the merged list back to `data/characters-data.json` and logs summary information.
  - Also includes `manual_merge_princesses()` to detect groups of princess characters whose names contain digits, for manual review before merging.

- `find_duplicates.py`:
  - Scans `data/characters-data.json` for characters with multiple gallery images and groups characters by cleaned name (digits removed) to detect potential duplicates.
  - Identifies shared image paths used across multiple characters (both main and gallery images).
  - Prints detailed reports to stdout and saves a structured JSON report to `gallery_analysis_report.json`.

These scripts are intended for maintenance; run them before large data changes or when adding many new photos to keep the gallery consistent.

## External/AI Rules

### Claude local settings

- `.claude/settings.local.json` defines local AI tool permissions for Claude:
  - Allows `Bash(mkdir:*)` and does not set any explicit denies/asks.
- When adapting these rules for Warp or other agents, respect that they explicitly permit directory creation via `mkdir` and do not impose other tool restrictions.

If additional AI rule files (for Claude, Cursor, Copilot, or Warp) are added in the future, also summarize their key constraints and preferences here.
