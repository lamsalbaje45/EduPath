/**
 * ScrollToTop - React Router doesn't reset scroll position on navigation,
 * so clicking a link while scrolled down on the current page leaves the next
 * page's viewport scrolled to that same offset instead of starting at top.
 * Resets scroll on every pathname change to fix that.
 */

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export const ScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export default ScrollToTop
