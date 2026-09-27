const createPostUrl = "https://v2.api.noroff.dev/social/posts";

const token = localStorage.getItem("token");
const apiKey = localStorage.getItem("apiKey");
const username = localStorage.getItem("username");

const createForm = document.querySelector("#create-post-form");
const message = document.querySelector("#message");

if (!token) {
  window.location.href = "./login.html";
}

createForm.addEventListener("submit", createPost);

async function createPost(event) {
  event.preventDefault();

  const title = document.querySelector("#title").value.trim();
  const body = document.querySelector("#body").value.trim();
  const imageUrl = document.querySelector("#image-url").value.trim();
  const imageAlt = document.querySelector("#image-alt").value.trim();

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

  try {
    message.textContent = "Creating post...";

    const response = await fetch(createPostUrl, {
      method: "POST",
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
        result.errors?.[0]?.message || "Could not create post"
      );
    }

    console.log("Post created:", result.data);

    message.textContent = "Post created!";

    window.location.href = "./index.html";
  } catch (error) {
    console.error(error);

    message.textContent = error.message;
  }
}