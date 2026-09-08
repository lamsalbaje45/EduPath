/**
 * Plain design tokens (no components) shared across pages: icon path data
 * and the gradient tokens used for flush-top card headers. Kept in a
 * non-component file so react-refresh/only-export-components doesn't flag
 * design.jsx for mixing component and constant exports.
 */

export const iconPaths = {
  profile: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM5.5 21a6.5 6.5 0 0 1 13 0',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0-3.2a.8.8 0 1 0 0-1.6.8.8 0 0 0 0 1.6Z',
  rocket:
    'M14.5 3.5c2.5.5 5 3 5.5 5.5.5 2.5-1 6-4.5 9.5l-2-2-2-2c3.5-3.5 7-5 9.5-4.5M6 15l-2.5 2.5M9 18l-2.5 2.5M9.5 14.5 5 10c1-2 3-3.5 5-4l4.5 4.5c-.5 2-2 4-5 4Z',
  user: 'M15.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0ZM5 20a7 7 0 0 1 14 0',
  building: 'M4 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16M12 21v-8a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v8M4 21h16M7.5 7h1M7.5 11h1M7.5 15h1M15.5 12h1M15.5 16h1',
  briefcase:
    'M4 8h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Zm4 0V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18',
  chalkboard: 'M4 4h16v11H4V4Zm4 15 4-4 4 4M4 19h16',
  document: 'M8 3h6l4 4v14a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm5 0v4h4M9 12h6M9 15.5h6M9 8.5h2',
  graduation: 'M3 9.5 12 5l9 4.5-9 4.5-9-4.5Zm4.5 2.5v4c0 1.5 2 3 4.5 3s4.5-1.5 4.5-3v-4M20 9.5V15',
  laptop: 'M5 4h14a1 1 0 0 1 1 1v10H4V5a1 1 0 0 1 1-1Zm-3 13h20l-1.5 3a1 1 0 0 1-1 .6H4.5a1 1 0 0 1-1-.6L2 17Z',
  pin: 'M12 21s7-6.5 7-11a7 7 0 1 0-14 0c0 4.5 7 11 7 11Zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v4.5l3 2',
  plus: 'M12 5v14M5 12h14',
  star: 'M12 3.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.8L12 3.5Z',
  check: 'M5 13l4 4L19 7',
  search: 'M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm10 2-4.35-4.35',
  filter: 'M4 6h16M7 12h10M10 18h4',
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
}

// Gradient tokens for the flush-top color header used on card grids
// (colleges, opportunities, classes, dashboard role cards) throughout the app.
export const categoryStyles = {
  blue: 'from-[#5472FC] to-[#22308F]',
  emerald: 'from-emerald-500 to-emerald-800',
  violet: 'from-violet-500 to-violet-800',
  amber: 'from-amber-500 to-amber-700',
  rose: 'from-rose-500 to-rose-700',
}
