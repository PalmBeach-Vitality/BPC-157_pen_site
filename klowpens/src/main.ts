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
    const list = video.closest(".chain-slide")?.querySelector<HTMLOListElement>(".residues--bpc")
    const items = list ? Array.from(list.querySelectorAll<HTMLLIElement>("li")) : []
    let shown = -1

    const render = () => {
      const active = !video.paused || video.currentTime > 0.05
      const count = Math.max(1, Math.min(15, joinedAt(video.currentTime)))
      label?.classList.toggle("is-on", active)
      list?.classList.toggle("is-tracking", active && !video.ended)
      if (!active) {
        if (shown !== -1) {
          shown = -1
          label?.replaceChildren()
          items.forEach((li) => li.classList.remove("is-joined", "is-new"))
        }
        return
      }
      if (count === shown) return
      shown = count
      const [pos, code, name] = JOIN_ORDER[count - 1]
      label?.classList.toggle("is-pro", code === "Pro")
      if (label) {
        label.replaceChildren()
        const index = document.createElement("span")
        index.className = "join-label-n"
        index.textContent = `${String(count).padStart(2, "0")} / 15`
        const text = document.createElement("span")
        text.textContent = `${code} · ${name} joins at position ${pos}`
        label.append(index, text)
      }
      items.forEach((li, i) => {
        const position = i + 1
        li.classList.toggle("is-joined", position >= 16 - count)
        li.classList.toggle("is-new", position === pos)
      })
    }

    ;["loadedmetadata", "timeupdate", "play", "pause", "seeked", "ended"].forEach((ev) =>
      video.addEventListener(ev, render),
    )
  })
}

function initChainShow(): void {
  document.querySelectorAll<HTMLElement>("[data-chain-show]").forEach((root) => {
    const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[role="tab"]'))
    const panels = Array.from(root.querySelectorAll<HTMLElement>('[role="tabpanel"]'))
    const count = tabs.length
    if (!count || count !== panels.length) return

    const show = (next: number) => {
      const index = (next + count) % count
      tabs.forEach((tab, i) => {
        const on = i === index
        tab.setAttribute("aria-selected", String(on))
        tab.tabIndex = on ? 0 : -1
      })
      panels.forEach((panel, i) => {
        const on = i === index
        panel.hidden = !on
        panel.classList.toggle("is-on", on)
        if (!on) panel.querySelectorAll("video").forEach((video) => video.pause())
      })
    }

    const selected = Math.max(0, tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true"))
    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => show(i))
      tab.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft" && event.key !== "Home" && event.key !== "End") return
        event.preventDefault()
        const next = event.key === "ArrowRight" ? i + 1 : event.key === "ArrowLeft" ? i - 1 : event.key === "Home" ? 0 : count - 1
        const index = (next + count) % count
        show(index)
        tabs[index]?.focus()
      })
    })
    root.querySelector("[data-chain-prev]")?.addEventListener("click", () => {
      const current = tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true")
      show(current - 1)
    })
    root.querySelector("[data-chain-next]")?.addEventListener("click", () => {
      const current = tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true")
      show(current + 1)
    })
    show(selected)
  })
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
    const list =
      video.closest(".chain-slide")?.querySelector<HTMLOListElement>(".residues--ghk") ??
      video.closest("section")?.querySelector<HTMLOListElement>(".residues--ghk")
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
initChainShow()
initChainFilms()
initGhkFilm()
initAmbientFilms()
initStories()
