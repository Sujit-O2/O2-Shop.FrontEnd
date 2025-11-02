const handleLogout = async () => {
  try {
    await fetch(`${import.meta.env.VITE_API_URL}/logout`, {
      method: "POST",
      credentials: "include", // ensures cookies are sent
    });
  } catch (err) {
    console.error("Logout error:", err);
  }

  // Then clear client-side cookies
  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0].trim();
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
  });

  localStorage.clear();
  window.location.href = "/login";
};
export default handleLogout;
