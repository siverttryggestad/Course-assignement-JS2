const registerForm = document.querySelector("#register-form");
const message = document.querySelector("#message");

const registerUrl = "https://v2.api.noroff.dev/auth/register";

registerForm.addEventListener("submit", registerUser);

async function registerUser(event) {
  event.preventDefault();

  const name = document.querySelector("#name").value.trim();
  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value;

  const userData = {
    name: name,
    email: email,
    password: password,
  };

  try {
    const response = await fetch(registerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.errors?.[0]?.message || "Registration failed"
      );
    }

    message.textContent = "Registration successful!";

    console.log(data);

    setTimeout(() => {
      window.location.href = "./login.html";
    }, 2000);
  } catch (error) {
    console.error(error);
    message.textContent = error.message;
  }
}