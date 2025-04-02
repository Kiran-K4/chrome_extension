console.log("Content script injected")

// Hiding test 
const selectorsToHide = ['#comments', '.sidebar', 'ytd-watch-next-secondary-results-renderer']

for (const selector of selectorsToHide) {
  const el = document.querySelector(selector)
  if (el) el.remove()
}