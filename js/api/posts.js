import {
  getToken,
  getApiKey,
  getUsername,
  logoutUser,
} from "../utils.js";

const authLinks = document.querySelector("#auth-links");
const postMessage = document.querySelector("#post-message");
const postContainer = document.querySelector("#post-container");

const params = new URLSearchParams(window.location.search);
const postId = params.get("id");

const token = getToken();
const apiKey = getApiKey();
const username = getUsername();

if (!token) {
  showLoggedOutView();
} else {
  showLoggedInView();

  if (!postId) {
    postMessage.textContent = "Post not found.";
  } else {
    getPost();
  }
}

function showLoggedOutView() {
  authLinks.innerHTML = `
    <a href="./login.html">Login</a>
  `;

  postMessage.textContent = "You need to log in to view this post.";
}

function showLoggedInView() {
  authLinks.innerHTML = `
    <button id="logout-button">Logout</button>
  `;

  const logoutButton = document.querySelector("#logout-button");

  logoutButton.addEventListener("click", logoutUser);
}

/**
 * Fetches a single post from the Noroff Social API using the post ID.
 * @returns {Promise<void>}
 */
async function getPost() {
  postMessage.textContent = "Loading post...";

  const postUrl =
    `https://v2.api.noroff.dev/social/posts/${postId}?_author=true`;

  try {
    const response = await fetch(postUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": apiKey,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.errors?.[0]?.message || "Could not fetch post"
      );
    }

    postMessage.textContent = "";

    displayPost(result.data);
  } catch (error) {
    console.error(error);
    postMessage.textContent = error.message;
  }
}

/**
 * Displays a single post on the page.
 * @param {Object} post - The post returned from the API.
 */
function displayPost(post) {
  postContainer.innerHTML = "";

  const article = document.createElement("article");
  article.classList.add("post-card");

  const author = document.createElement("a");

  author.textContent =
    `By: ${post.author?.name || "Unknown author"}`;

  author.href =
    `./user-post.html?name=${post.author?.name}`;

  const title = document.createElement("h1");
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

  if (post.author?.name === username) {
    const postActions = document.createElement("div");
    postActions.classList.add("post-actions");

    const editButton = document.createElement("button");
    editButton.textContent = "Edit post";
    editButton.id = "edit-post-button";

    editButton.addEventListener("click", () => {
      window.location.href = `./edit.html?id=${post.id}`;
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete post";
    deleteButton.id = "delete-post-button";

    deleteButton.addEventListener("click", deletePost);

    postActions.appendChild(editButton);
    postActions.appendChild(deleteButton);

    article.appendChild(postActions);
  }

  postContainer.appendChild(article);
}

/**
 * Deletes the current user's post after confirmation.
 * @returns {Promise<void>}
 */
async function deletePost() {
  const confirmed = confirm(
    "Are you sure you want to delete this post?"
  );

  if (!confirmed) {
    return;
  }

  const deleteUrl =
    `https://v2.api.noroff.dev/social/posts/${postId}`;

  try {
    const response = await fetch(deleteUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": apiKey,
      },
    });

    if (!response.ok) {
      throw new Error("Could not delete post");
    }

    window.location.href = "./index.html";
  } catch (error) {
    console.error(error);
    postMessage.textContent = error.message;
  }
}