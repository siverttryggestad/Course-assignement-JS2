const token = localStorage.getItem("token");
const apiKey = localStorage.getItem("apiKey");
const username = localStorage.getItem("username");

const profileUsername = document.querySelector("#profile-username");
const profileEmail = document.querySelector("#profile-email");
const profileAvatar = document.querySelector("#profile-avatar");
const profileMessage = document.querySelector("#profile-message");
const profilePosts = document.querySelector("#profile-posts");

if (!token) {
  window.location.href = "./login.html";
}

if (!username) {
  profileMessage.textContent = "Could not find user.";
} else {
  getProfile();
  getMyPosts();
}

async function getProfile() {
  const profileUrl =
    `https://v2.api.noroff.dev/social/profiles/${username}`;

  try {
    const response = await fetch(profileUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": apiKey,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.errors?.[0]?.message || "Could not fetch profile"
      );
    }

    const profile = result.data;

    profileUsername.textContent = profile.name;
    profileEmail.textContent = profile.email;

    if (profile.avatar?.url) {
      profileAvatar.src = profile.avatar.url;
      profileAvatar.alt =
        profile.avatar.alt || `${profile.name}'s profile picture`;

      profileAvatar.hidden = false;
    }

  } catch (error) {
    console.error(error);
    profileMessage.textContent = error.message;
  }
}

async function getMyPosts() {
  const postsUrl =
    `https://v2.api.noroff.dev/social/profiles/${username}/posts`;

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

    displayMyPosts(result.data);

  } catch (error) {
    console.error(error);
    profileMessage.textContent = error.message;
  }
}

function displayMyPosts(posts) {
  profilePosts.innerHTML = "";

  if (posts.length === 0) {
    profilePosts.textContent = "You have no posts yet.";
    return;
  }

  posts.forEach((post) => {
    const article = document.createElement("article");
    article.classList.add("profile-post-card");

    article.addEventListener("click", () => {
      window.location.href = `./post.html?id=${post.id}`;
    });

    const title = document.createElement("h3");
    title.classList.add("profile-post-title");
    title.textContent = post.title || "No title";

    const body = document.createElement("p");
    body.classList.add("profile-post-body");
    body.textContent = post.body || "No content";

    article.appendChild(title);
    article.appendChild(body);

    if (post.media?.url) {
      const image = document.createElement("img");

      image.classList.add("profile-post-image");
      image.src = post.media.url;
      image.alt =
        post.media.alt || post.title || "Post image";

      article.appendChild(image);
    }

    profilePosts.appendChild(article);
  });
}