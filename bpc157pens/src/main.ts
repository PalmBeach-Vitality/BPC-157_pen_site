const AGE_KEY = "bpc157pens-age-ack"

function initAgeNotice(): void {
  const notice = document.getElementById("age-notice")
  const button = document.getElementById("age-ack")
  if (!notice || !button) return

  let acknowledged = false
  try {
    acknowledged = window.localStorage.getItem(AGE_KEY) === "1"
  } catch {
    acknowledged = false
  }
  if (acknowledged) return

  notice.hidden = false
  button.addEventListener("click", () => {
    try {
      window.localStorage.setItem(AGE_KEY, "1")
    } catch {
      // Storage can be unavailable in private browsing; dismissing still works for this visit.
    }
    notice.hidden = true
  })
}

function initMenu(): void {
  const toggle = document.querySelector<HTMLButtonElement>(".menu-toggle")
  const nav = document.getElementById("site-nav")
  if (!toggle || !nav) return

  const setOpen = (open: boolean) => {
    toggle.setAttribute("aria-expanded", String(open))
    nav.classList.toggle("is-open", open)
  }

  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"))
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false)
  })
  nav.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).closest("a")) setOpen(false)
  })
}

function initReveal(): void {
  const items = document.querySelectorAll<HTMLElement>(".reveal")
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-in"))
    return
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in")
          io.unobserve(entry.target)
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px" },
  )
  items.forEach((el) => io.observe(el))
}

// Synthesis runs C to N, so valine (position 15) joins first and glycine (position 1) last.
const JOIN_ORDER: [number, string, string][] = [
  [15, "Val", "Valine"],
  [14, "Leu", "Leucine"],
  [13, "Gly", "Glycine"],
  [12, "Ala", "Alanine"],
  [11, "Asp", "Aspartic acid"],
  [10, "Asp", "Aspartic acid"],
  [9, "Ala", "Alanine"],
  [8, "Pro", "Proline"],
  [7, "Lys", "Lysine"],
  [6, "Gly", "Glycine"],
  [5, "Pro", "Proline"],
  [4, "Pro", "Proline"],
  [3, "Pro", "Proline"],
  [2, "Glu", "Glutamic acid"],
  [1, "Gly", "Glycine"],
]

// Seconds into the chain film at which the on-screen chain reaches each length.
// The four shots are 15.042s each and end on 5, 10, 14 and 15 spheres. The 15th joins about 7s into the last shot.
const CHAIN_KNOTS: [number, number][] = [
  [0, 1],
  [15.042, 5],
  [30.083, 10],
  [45.125, 14],
  [52.125, 15],
]

function joinedAt(t: number): number {
  for (let i = 1; i < CHAIN_KNOTS.length; i++) {
    const [t1, n1] = CHAIN_KNOTS[i]
    const [t0, n0] = CHAIN_KNOTS[i - 1]
    if (t <= t1) return Math.floor(n0 + ((t - t0) / (t1 - t0)) * (n1 - n0))
  }
  return 15
}

function initChainFilms(): void {
  document.querySelectorAll<HTMLVideoElement>("video[data-chain]").forEach((video) => {
    const frame = video.parentElement
    const label = frame?.querySelector<HTMLElement>(".join-label")
    const list = video.closest("section")?.querySelector<HTMLOListElement>(".residues")
    const items = list ? Array.from(list.querySelectorAll<HTMLLIElement>("li")) : []
    let shown = -1

    const render = () => {
      const active = !video.paused || video.currentTime > 0.05
      const count = Math.max(1, Math.min(15, joinedAt(video.currentTime)))
      label?.classList.toggle("is-on", active)
      list?.classList.toggle("is-tracking", active && !video.ended)
      if (!active || count === shown) return
      shown = count
      const [pos, code, name] = JOIN_ORDER[count - 1]
      if (label) {
        label.classList.toggle("is-pro", code === "Pro")
        label.innerHTML = `<span class="join-label-n">${String(count).padStart(2, "0")} / 15</span><span>${code} · ${name} joins at position ${pos}</span>`
      }
      items.forEach((li, i) => {
        const p = i + 1
        li.classList.toggle("is-joined", p >= 16 - count)
        li.classList.toggle("is-new", p === pos)
      })
    }

    ;["loadedmetadata", "timeupdate", "play", "pause", "seeked", "ended"].forEach((ev) =>
      video.addEventListener(ev, render),
    )
  })
}

function initAmbientFilms(): void {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")
  document.querySelectorAll<HTMLVideoElement>("video[data-ambient]").forEach((video) => {
    const apply = () => {
      if (reduce.matches) video.pause()
      else void video.play().catch(() => undefined)
    }
    apply()
    reduce.addEventListener("change", apply)
  })
}

initAgeNotice()
initMenu()
initReveal()
initChainFilms()
initAmbientFilms()
