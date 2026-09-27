const token = localStorage.getItem("token");
const apiKey = localStorage.getItem("apiKey");
const username = localStorage.getItem("username");

const editForm = document.querySelector("#edit-post-form");
const message = document.querySelector("#message");

const titleInput = document.querySelector("#title");
const bodyInput = document.querySelector("#body");
const imageUrlInput = document.querySelector("#image-url");
const imageAltInput = document.querySelector("#image-alt");

const params = new URLSearchParams(window.location.search);
const postId = params.get("id");

if (!token) {
  window.location.href = "./login.html";
}

if (!postId) {
  message.textContent = "Post not found.";
} else {
  getPost();
}

editForm.addEventListener("submit", updatePost);

async function getPost() {
  message.textContent = "Loading post...";

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

    const post = result.data;

    if (post.author?.name !== username) {
      throw new Error("You can only edit your own posts.");
    }

    titleInput.value = post.title || "";
    bodyInput.value = post.body || "";
    imageUrlInput.value = post.media?.url || "";
    imageAltInput.value = post.media?.alt || "";

    message.textContent = "";
  } catch (error) {
    console.error(error);
    message.textContent = error.message;
  }
}

async function updatePost(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();
  const imageUrl = imageUrlInput.value.trim();
  const imageAlt = imageAltInput.value.trim();

  const postData = {
    title,
    body,
  };

  if (imageUrl) {
    postData.media = {
      url: imageUrl,
      alt: imageAlt || title,
    };
  }

  const updateUrl =
    `https://v2.api.noroff.dev/social/posts/${postId}`;

  try {
    message.textContent = "Saving changes...";

    const response = await fetch(updateUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": apiKey,
      },
      body: JSON.stringify(postData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.errors?.[0]?.message || "Could not update post"
      );
    }

    window.location.href = `./post.html?id=${postId}`;
  } catch (error) {
    console.error(error);
    message.textContent = error.message;
  }
}