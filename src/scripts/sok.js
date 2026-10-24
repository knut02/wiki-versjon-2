function countLabel(shown, searching) {
  if (searching) return shown === 1 ? "1 treff" : `${shown} treff`;
  return shown === 1 ? "1 artikkel" : `${shown} artikler`;
}

function init() {
  const input = document.querySelector("#sok");
  if (!(input instanceof HTMLInputElement) || input.dataset.ready === "true") return;
  input.dataset.ready = "true";

  const rows = [...document.querySelectorAll("[data-search]")];
  const count = document.querySelector("#antall");
  const empty = document.querySelector("#ingen");
  const params = new URLSearchParams(location.search);
  if (params.get("q")) input.value = params.get("q") ?? "";

  const apply = () => {
    const words = input.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    let shown = 0;
    for (const row of rows) {
      const hay = row.getAttribute("data-search") ?? "";
      const match = words.every((word) => hay.includes(word));
      row.hidden = !match;
      if (match) shown += 1;
    }
    if (count) count.textContent = countLabel(shown, words.length > 0);
    if (empty) empty.hidden = shown !== 0;
    const url = new URL(location.href);
    if (input.value.trim()) url.searchParams.set("q", input.value.trim());
    else url.searchParams.delete("q");
    history.replaceState(null, "", `${url.pathname}${url.search}`);
  };

  input.addEventListener("input", apply);
  input.form?.addEventListener("submit", (event) => event.preventDefault());
  apply();
}

document.addEventListener("astro:page-load", init);
init();
