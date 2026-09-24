const loginForm = document.querySelector("#login-form");
const message = document.querySelector("#message");

const loginUrl = "https://v2.api.noroff.dev/auth/login";

loginForm.addEventListener("submit", loginUser);

async function loginUser(event) {
  event.preventDefault();

  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value;

  const loginData = {
    email,
    password,
  };

  try {
    const response = await fetch(loginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.errors?.[0]?.message || "Login failed"
      );
    }

    const user = result.data;

    localStorage.setItem("token", user.accessToken);
    localStorage.setItem("username", user.name);
    localStorage.setItem("email", user.email);

    message.textContent = "Login successful!";

    setTimeout(() => {
      window.location.href = "./index.html";
    }, 2000);
  } catch (error) {
    console.error(error);
    message.textContent = error.message;
  }
}