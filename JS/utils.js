export function getToken() {
  return localStorage.getItem("token");
}

export function getApiKey() {
  return localStorage.getItem("apiKey");
}

export function getUsername() {
  return localStorage.getItem("username");
}

export function logoutUser() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("email");

  window.location.href = "./login.html";
}