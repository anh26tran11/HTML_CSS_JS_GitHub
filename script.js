const themeToggle = document.getElementById("themeToggle");
const searchButton = document.querySelector("#search-btn");
const searchInput = document.querySelector("#search-input");
const body = document.body;

const currentTheme = window.theme || "light";

if (currentTheme === "dark") {
  body.classList.add("dark");
}

themeToggle.addEventListener("click", () => {
  body.classList.toggle("dark");
  const theme = body.classList.contains("dark") ? "dark" : "light";
  window.theme = theme;
});

const renderUserCard = (data) => {
  const userCard = document.querySelector(".user-card");
  userCard.innerHTML = `
    <div class="user-logo">
      <img class="logo-img" src="${data.avatar_url}" alt="${data.login}" />
    </div>
    <div class="user-inf">
      <h2>${data.name || data.login}</h2>
      <p class="username">@${data.login}</p>
      ${data.bio ? `<p class="bio">${data.bio}</p>` : ""}
    </div>
    <div class="group-infor">
      <div class="group-item">
        <div class="item-number">${data.public_repos}</div>
        <div class="item-text">Repositories</div>
      </div>
      <div class="group-item">
        <div class="item-number">${data.followers}</div>
        <div class="item-text">Followers</div>
      </div>
      <div class="group-item">
        <div class="item-number">${data.following}</div>
        <div class="item-text">Following</div>
      </div>
    </div>
    <a target="_blank" href="https://github.com/${
      data.login
    }" class="view-profile-btn">
      View Profile
    </a>
  `;
};

const getLanguageClass = (language) => {
  if (!language) return "";
  return language.toLowerCase();
};

const renderRepos = (repos) => {
  const reposSection = document.querySelector(".repos-section");
  const reposList = document.querySelector(".repos-list");

  if (repos.length === 0) {
    reposSection.style.display = "none";
    return;
  }

  reposSection.style.display = "block";
  reposList.innerHTML = repos
    .map(
      (repo) => `
    <div class="repo-card" onclick="window.open('${repo.html_url}', '_blank')">
      <div class="repo-header">
        <a href="${
          repo.html_url
        }" target="_blank" class="repo-name" onclick="event.stopPropagation()">
          ${repo.name}
        </a>
      </div>
      ${
        repo.description
          ? `<p class="repo-description">${repo.description}</p>`
          : ""
      }
      <div class="repo-footer">
        <div class="repo-meta">
          ${
            repo.language
              ? `
          <span class="language-badge ${getLanguageClass(repo.language)}">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
            ${repo.language}
          </span>
          `
              : `
          <span class="language-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
            Unknown
          </span>
          `
          }
        </div>
        <div class="repo-stats">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
          </svg>
          <span>${repo.stargazers_count}</span>
        </div>
      </div>
    </div>
  `
    )
    .join("");
};

const showError = (message) => {
  const userCard = document.querySelector(".user-card");
  userCard.innerHTML = `
    <div class="error-message">
      ${message}
    </div>
  `;
  const reposSection = document.querySelector(".repos-section");
  reposSection.style.display = "none";
};

async function getUserData() {
  try {
    const searchValue = searchInput.value.trim();
    if (!searchValue) {
      showError("Please enter a GitHub username");
      return;
    }

    const response = await fetch(`https://api.github.com/users/${searchValue}`);
    if (!response.ok) {
      if (response.status === 404) {
        showError("User not found. Please check the username and try again.");
      } else {
        showError("An error occurred while fetching user data.");
      }
      return;
    }
    const data = await response.json();
    renderUserCard(data);
    getRepos(searchValue);
  } catch (error) {
    console.error("Error:", error.message);
    showError("An error occurred. Please try again later.");
  }
}

async function getRepos(username) {
  try {
    const response = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`
    );
    if (!response.ok) throw new Error("Failed to fetch repositories");
    const repos = await response.json();
    renderRepos(repos);
  } catch (error) {
    console.error("Error:", error.message);
    const reposSection = document.querySelector(".repos-section");
    reposSection.style.display = "none";
  }
}

searchButton.addEventListener("click", (e) => {
  e.preventDefault();
  getUserData();
});
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    getUserData();
  }
});
