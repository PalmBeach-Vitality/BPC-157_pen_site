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

initAgeNotice()
initMenu()
initReveal()
