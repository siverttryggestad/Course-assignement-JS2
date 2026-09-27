const token = localStorage.getItem("token");
const apiKey = localStorage.getItem("apiKey");
const currentUsername = localStorage.getItem("username");

const pageTitle = document.querySelector("#page-title");
const message = document.querySelector("#message");
const postsContainer = document.querySelector("#posts-container");
const followButton = document.querySelector("#follow-button");

const params = new URLSearchParams(window.location.search);
const username = params.get("name");

let isFollowing = false;

if (!token) {
  window.location.href = "./login.html";
}

if (!username) {
  message.textContent = "User not found.";
} else {
  pageTitle.textContent = `${username}'s posts`;

  getUserPosts();

  if (username !== currentUsername) {
    getProfile();
  }
}

async function getUserPosts() {
  message.textContent = "Loading posts...";

  const userPostsUrl =
    `https://v2.api.noroff.dev/social/profiles/${username}/posts`;

  try {
    const response = await fetch(userPostsUrl, {
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

    message.textContent = "";

    displayPosts(result.data);
  } catch (error) {
    console.error(error);
    message.textContent = error.message;
  }
}

async function getProfile() {
  const profileUrl =
    `https://v2.api.noroff.dev/social/profiles/${username}?_followers=true`;

  try {
    const response = await fetch(profileUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": apiKey,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error("Could not fetch profile");
    }

    const followers = result.data.followers || [];

    isFollowing = followers.some(
      (follower) => follower.name === currentUsername
    );

    updateFollowButton();

    followButton.hidden = false;
  } catch (error) {
    console.error(error);
  }
}

function updateFollowButton() {
  if (isFollowing) {
    followButton.textContent = "Unfollow";
  } else {
    followButton.textContent = "Follow";
  }
}

followButton.addEventListener("click", followUser);

async function followUser() {
  let action = "follow";

  if (isFollowing) {
    action = "unfollow";
  }

  const followUrl =
    `https://v2.api.noroff.dev/social/profiles/${username}/${action}`;

  try {
    const response = await fetch(followUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": apiKey,
      },
    });

    if (!response.ok) {
      throw new Error("Could not update follow status");
    }

    isFollowing = !isFollowing;

    updateFollowButton();
  } catch (error) {
    console.error(error);
    message.textContent = error.message;
  }
}

function displayPosts(posts) {
  postsContainer.innerHTML = "";

  if (posts.length === 0) {
    message.textContent = "This user has no posts.";
    return;
  }

  posts.forEach((post) => {
    const article = document.createElement("article");

    article.classList.add("post-card");

    article.addEventListener("click", () => {
      window.location.href = `./post.html?id=${post.id}`;
    });

    const title = document.createElement("h2");
    title.textContent = post.title || "No title";

    const body = document.createElement("p");
    body.textContent = post.body || "No content";

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