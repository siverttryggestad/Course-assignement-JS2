import {
  getToken,
  getApiKey,
  logoutUser,
} from "../utils.js";

const postsUrl =
  "https://v2.api.noroff.dev/social/posts?_author=true";

const searchUrl =
  "https://v2.api.noroff.dev/social/posts/search";

const token = getToken();
const apiKey = getApiKey();

const authLinks = document.querySelector("#auth-links");
const feedMessage = document.querySelector("#feed-message");
const postsContainer = document.querySelector("#posts-container");
const searchInput = document.querySelector("#search-input");

if (!token) {
  showLoggedOutView();
} else {
  showLoggedInView();
  getPosts();
}

searchInput.addEventListener("input", searchPosts);

function showLoggedOutView() {
  authLinks.innerHTML = `
    <a href="./login.html">Login</a>
  `;

  feedMessage.textContent = "You need to log in to view the feed.";
}

function showLoggedInView() {
  authLinks.innerHTML = `
    <button id="logout-button">Logout</button>
  `;

  const logoutButton = document.querySelector("#logout-button");

  logoutButton.addEventListener("click", logoutUser);
}

/**
 * Fetches all posts from the Noroff Social API.
 * @returns {Promise<void>}
 */
async function getPosts() {
  feedMessage.textContent = "Loading posts...";

  try {
    const response = await fetch(postsUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": apiKey,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.errors?.[0]?.message || "Could not fetch posts"
      );
    }

    feedMessage.textContent = "";

    displayPosts(result.data);
  } catch (error) {
    console.error(error);

    feedMessage.textContent = error.message;
  }
}

/**
 * Searches for posts using the text entered in the search field.
 * @returns {Promise<void>}
 */
async function searchPosts() {
  const searchTerm = searchInput.value.trim();

  if (!searchTerm) {
    getPosts();
    return;
  }

  feedMessage.textContent = "Searching...";

  try {
    const response = await fetch(
      `${searchUrl}?q=${encodeURIComponent(searchTerm)}&_author=true`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": apiKey,
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.errors?.[0]?.message || "Could not search posts"
      );
    }

    if (result.data.length === 0) {
      postsContainer.innerHTML = "";
      feedMessage.textContent = "No posts found.";
      return;
    }

    feedMessage.textContent = "";

    displayPosts(result.data);
  } catch (error) {
    console.error(error);

    feedMessage.textContent = error.message;
  }
}

/**
 * Displays a list of posts in the feed.
 * @param {Array} posts - The posts returned from the API.
 */
function displayPosts(posts) {
  postsContainer.innerHTML = "";

  posts.forEach((post) => {
    const article = document.createElement("article");

    article.classList.add("post-card");

    article.addEventListener("click", () => {
      window.location.href = `./post.html?id=${post.id}`;
    });

    const author = document.createElement("p");
    author.textContent =
      `By: ${post.author?.name || "Unknown author"}`;

    const title = document.createElement("h2");
    title.textContent = post.title || "No title";

    const body = document.createElement("p");
    body.textContent = post.body || "No content";

    article.appendChild(author);
    article.appendChild(title);
    article.appendChild(body);

    if (post.media?.url) {
      const image = document.createElement("img");

      image.src = post.media.url;
      image.alt =
        post.media.alt || post.title || "Post image";

      article.appendChild(image);
    }

    postsContainer.appendChild(article);
  });
}