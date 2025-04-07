function callProtectedEndpoint(token) {
  $.ajax({
    url: "https://server.askyla.com/api/users/protected-check", // Replace with your FastAPI URL
    method: "POST",
    headers: {
      Authorization: "Bearer " + token, // Send the JWT token in the Authorization header
    },
    success: function (response) {
      localStorage.setItem("user_email", response.user.email);
      console.log(response.user.email);
      localStorage.setItem("agent_id", response.user.agent_id);
      console.log(response.user.agent_id);
    },
    error: function (xhr, status, error) {
      // Handle error response
      if (xhr.status === 401) {
        alert("Unauthorized: Invalid or expired token.");
        window.location.href = "index.html";
      } else if (xhr.status === 404) {
        alert("User not found.");
        window.location.href = "index.html";
      } else {
        alert("An error occurred: " + error);
        window.location.href = "index.html";
      }
    },
  });
}

// Example of how you can call the function after retrieving the token
const token = localStorage.getItem("access_token"); // Retrieve token from local storage or other source
if (token) {
  callProtectedEndpoint(token); // Call the protected endpoint with the token
} else {
  alert("You are not logged in.");
  window.location.href = "index.html";
}
