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

initAgeNotice()
