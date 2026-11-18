const AGE_KEY = "klowpens-age-ack"

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

// GHK is Gly-His-Lys. The bead end of the film is lysine, then histidine, then glycine at the free end.
const GHK_ORDER: [number, string, string][] = [
  [3, "Lys", "Lysine"],
  [2, "His", "Histidine"],
  [1, "Gly", "Glycine"],
]

// Four 15.042s shots. The chain reaches 1, then 2, then the third sphere locks late in the last shot.
const GHK_KNOTS: [number, number][] = [
  [0, 0],
  [15.042, 1],
  [30.083, 2],
  [56.1, 3],
]

function ghkJoinedAt(t: number): number {
  for (let i = 1; i < GHK_KNOTS.length; i++) {
    const [t1, n1] = GHK_KNOTS[i]
    const [t0, n0] = GHK_KNOTS[i - 1]
    if (t <= t1) {
      const count = Math.round(n0 + ((t - t0) / (t1 - t0)) * (n1 - n0))
      return Math.max(0, Math.min(3, count))
    }
  }
  return 3
}

function initGhkFilm(): void {
  document.querySelectorAll<HTMLVideoElement>("video[data-ghk]").forEach((video) => {
    const frame = video.parentElement
    const label = frame?.querySelector<HTMLElement>(".join-label")
    const list = video.closest("section")?.querySelector<HTMLOListElement>(".residues--ghk")
    const items = list ? Array.from(list.querySelectorAll<HTMLLIElement>("li")) : []
    let shown = -1

    const render = () => {
      const active = !video.paused || video.currentTime > 0.05
      const count = ghkJoinedAt(video.currentTime)
      label?.classList.toggle("is-on", active && count > 0)
      list?.classList.toggle("is-tracking", active && !video.ended && count > 0)
      if (count === shown) return
      shown = count
      if (count === 0 || !label) {
        if (label) label.replaceChildren()
        items.forEach((li) => li.classList.remove("is-joined", "is-new"))
        return
      }
      const [pos, code, name] = GHK_ORDER[count - 1]
      label.replaceChildren()
      const index = document.createElement("span")
      index.className = "join-label-n"
      index.textContent = `${String(count).padStart(2, "0")} / 03`
      const text = document.createElement("span")
      text.textContent = `${code} · ${name}`
      label.append(index, text)
      items.forEach((li, i) => {
        const position = i + 1
        li.classList.toggle("is-joined", position >= 4 - count)
        li.classList.toggle("is-new", position === pos)
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

function initStories(): void {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  document.querySelectorAll<HTMLElement>("[data-story]").forEach((root) => {
    const track = root.querySelector<HTMLElement>(".story-track")
    const slides = track ? Array.from(track.children) : []
    const cards = Array.from(root.querySelectorAll<HTMLElement>(".story-card"))
    const spots = Array.from(root.querySelectorAll<HTMLElement>(".chart-spot"))
    const dots = root.querySelector<HTMLElement>(".story-dots")
    const play = root.querySelector<HTMLButtonElement>("[data-play]")
    const count = Math.max(slides.length, cards.length, spots.length)
    if (!count) return
    let index = 0
    let timer = 0
    const delay = Number(root.dataset.auto || 5600)

    if (dots) {
      dots.innerHTML = Array.from({ length: count }, (_, i) => `<button type="button">${String(i + 1).padStart(2, "0")}</button>`).join("")
    }
    const dotButtons = dots ? Array.from(dots.querySelectorAll("button")) : []

    const chart = root.dataset.chart ? document.querySelector<HTMLElement>(root.dataset.chart) : null

    const show = (next: number) => {
      index = (next + count) % count
      if (track) track.style.transform = `translateX(${-index * 100}%)`
      cards.forEach((card, i) => card.classList.toggle("is-on", i === index))
      spots.forEach((spot, i) => spot.classList.toggle("is-on", i === index))
      dotButtons.forEach((dot, i) => dot.setAttribute("aria-current", String(i === index)))
      chart?.setAttribute("data-step", String(index))
    }

    const stop = () => {
      window.clearInterval(timer)
      timer = 0
      play?.setAttribute("aria-pressed", "false")
      if (play) play.textContent = "Play"
    }
    const start = () => {
      if (reduce) return
      stop()
      play?.setAttribute("aria-pressed", "true")
      if (play) play.textContent = "Pause"
      timer = window.setInterval(() => show(index + 1), delay)
    }

    root.querySelector("[data-prev]")?.addEventListener("click", () => { stop(); show(index - 1) })
    root.querySelector("[data-next]")?.addEventListener("click", () => { stop(); show(index + 1) })
    play?.addEventListener("click", () => (timer ? stop() : start()))
    dotButtons.forEach((dot, i) => dot.addEventListener("click", () => { stop(); show(i) }))
    cards.forEach((card, i) => card.addEventListener("click", () => { stop(); show(i) }))
    spots.forEach((spot, i) => spot.addEventListener("click", () => { stop(); show(i) }))
    root.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") { stop(); show(index + 1) }
      if (event.key === "ArrowLeft") { stop(); show(index - 1) }
    })
    show(0)
    start()
  })
}

initAgeNotice()
initMenu()
initReveal()
initGhkFilm()
initAmbientFilms()
initStories()
