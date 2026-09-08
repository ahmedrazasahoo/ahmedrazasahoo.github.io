(function () {
  "use strict";

  var USERNAME = "ahmedrazasahoo";

  // ---------- Tabs ----------
  var tabButtons = document.querySelectorAll("[data-tab]");
  var panels = document.querySelectorAll("[data-panel]");

  function activateTab(name, pushHistory) {
    tabButtons.forEach(function (btn) {
      var isActive = btn.dataset.tab === name;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
    });
    panels.forEach(function (panel) {
      panel.classList.toggle("hidden", panel.dataset.panel !== name);
    });
    if (pushHistory !== false) {
      var hash = name === "main" ? " " : "#" + name;
      history.replaceState(null, "", name === "main" ? location.pathname : "#" + name);
    }
  }

  tabButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      activateTab(btn.dataset.tab);
    });
  });

  var initial = (location.hash || "").replace("#", "");
  if (["main", "projects", "experience", "social"].indexOf(initial) !== -1) {
    activateTab(initial, false);
  }

  // ---------- Dark mode ----------
  var themeToggle = document.getElementById("theme-toggle");
  var sunIcon = document.getElementById("icon-sun");
  var moonIcon = document.getElementById("icon-moon");

  function syncThemeIcon() {
    var isDark = document.documentElement.classList.contains("dark");
    sunIcon.classList.toggle("hidden", !isDark);
    moonIcon.classList.toggle("hidden", isDark);
  }
  syncThemeIcon();

  themeToggle.addEventListener("click", function () {
    var isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    syncThemeIcon();
  });

  // ---------- Tech stack ----------
  var TECH_LIST = [
    { key: "python", label: "Python" },
    { key: "mariadb", label: "MariaDB" },
    { key: "redis", label: "Redis" },
    { key: "javascript", label: "JavaScript" },
    { key: "react", label: "React" },
    { key: "vue", label: "Vue" },
    { key: "tailwind", label: "Tailwind CSS" },
    { key: "html5", label: "HTML5" },
    { key: "css3", label: "CSS" },
    { key: "git", label: "Git" },
    { key: "docker", label: "Docker" },
    { key: "jinja", label: "Jinja" },
    { key: "vscode", label: "VS Code" },
    { key: null, label: "Frappe" },
    { key: null, label: "ERPNext" },
    { key: null, label: "REST APIs" },
    { key: null, label: "Bench" },
  ];

  var techStackEl = document.getElementById("tech-stack");
  TECH_LIST.forEach(function (tech) {
    var chip = document.createElement("span");
    chip.className = "chip";
    if (tech.key && window.TECH_ICONS && TECH_ICONS[tech.key]) {
      var iconWrap = document.createElement("span");
      iconWrap.style.color = TECH_ICONS[tech.key].color;
      iconWrap.className = "h-4 w-4 shrink-0 [&>svg]:h-4 [&>svg]:w-4";
      iconWrap.innerHTML = TECH_ICONS[tech.key].svg;
      chip.appendChild(iconWrap);
    }
    var label = document.createElement("span");
    label.textContent = tech.label;
    chip.appendChild(label);
    techStackEl.appendChild(chip);
  });

  // ---------- Live GitHub stats ----------
  var statsEl = document.getElementById("stats-content");

  function bar(label, pct, color) {
    return (
      '<div class="mt-3 first:mt-0">' +
      '<div class="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300">' +
      "<span>" + label + "</span><span>" + pct + "%</span></div>" +
      '<div class="mt-1 h-2 rounded-full bg-slate-200 dark:bg-white/10">' +
      '<div class="h-2 rounded-full" style="width:' + pct + "%;background:" + color + '"></div>' +
      "</div></div>"
    );
  }

  var BAR_COLORS = ["#3B82F6", "#22C55E", "#7C3AED", "#06B6D4"];

  async function loadStats() {
    try {
      var userResp = await fetch("https://api.github.com/users/" + USERNAME);
      if (!userResp.ok) throw new Error("user fetch failed: " + userResp.status);
      var user = await userResp.json();

      var repos = [];
      var page = 1;
      while (true) {
        var resp = await fetch(
          "https://api.github.com/users/" + USERNAME + "/repos?per_page=100&page=" + page + "&type=owner"
        );
        if (!resp.ok) throw new Error("repos fetch failed: " + resp.status);
        var batch = await resp.json();
        repos = repos.concat(batch);
        if (batch.length < 100) break;
        page++;
      }

      var nonFork = repos.filter(function (r) { return !r.fork; });
      var totalStars = nonFork.reduce(function (sum, r) { return sum + (r.stargazers_count || 0); }, 0);

      var langCounts = {};
      nonFork.forEach(function (r) {
        if (r.language) langCounts[r.language] = (langCounts[r.language] || 0) + 1;
      });
      var totalLangRepos = Object.values(langCounts).reduce(function (a, b) { return a + b; }, 0) || 1;
      var topLangs = Object.entries(langCounts)
        .sort(function (a, b) { return b[1] - a[1]; })
        .slice(0, 4)
        .map(function (entry) {
          return { name: entry[0], pct: Math.round((entry[1] / totalLangRepos) * 1000) / 10 };
        });

      var html =
        '<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">' +
        statCard(user.public_repos, "Public repos") +
        statCard(totalStars, "Total stars") +
        statCard(user.followers, "Followers") +
        statCard(user.following, "Following") +
        "</div>" +
        '<div class="mt-5">' +
        topLangs.map(function (l, i) { return bar(l.name, l.pct, BAR_COLORS[i % BAR_COLORS.length]); }).join("") +
        "</div>";

      statsEl.innerHTML = html;

      var heroRepos = document.getElementById("hero-stat-repos");
      var heroStars = document.getElementById("hero-stat-stars");
      var heroFollowers = document.getElementById("hero-stat-followers");
      if (heroRepos) heroRepos.textContent = user.public_repos;
      if (heroStars) heroStars.textContent = totalStars;
      if (heroFollowers) heroFollowers.textContent = user.followers;
    } catch (err) {
      statsEl.innerHTML =
        '<p class="text-sm text-slate-500 dark:text-slate-400">Live stats are temporarily unavailable (GitHub API rate limit or network issue). <a class="font-semibold text-accent-blue hover:underline" href="https://github.com/' +
        USERNAME +
        '" target="_blank" rel="noopener">View on GitHub →</a></p>';
      console.error(err);
    }
  }

  function statCard(value, label) {
    return (
      '<div class="text-center">' +
      '<p class="text-2xl font-extrabold">' + value + "</p>" +
      '<p class="text-xs text-slate-500 dark:text-slate-400">' + label + "</p></div>"
    );
  }

  loadStats();
})();
