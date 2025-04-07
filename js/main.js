// This function sends the token to the protected endpoint and handles the response
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

      displayButton(false); // If request is successful, show logged-in button
    },
    error: function (xhr, status, error) {
      // Handle error response
      if (xhr.status === 401) {
        displayButton(true);
      } else if (xhr.status === 404) {
        displayButton(true);
      } else {
        displayButton(true);
      }
    },
  });
}

// Display the appropriate button based on login status
function displayButton(isNotLoggedIn) {
  if (isNotLoggedIn) {
    document.getElementById("loginBtn").style.display = "block";
    document.getElementById("notLoggedInButton").style.display = "none";

    document.getElementById("get_started").style.display = "block";
    document.getElementById("get_started_chat").style.display = "none";

    document.getElementById("talk_buddy").style.display = "block";
    document.getElementById("talk_buddy_chat").style.display = "none";
  } else {
    document.getElementById("loginBtn").style.display = "none";
    document.getElementById("notLoggedInButton").style.display = "block";

    document.getElementById("get_started").style.display = "none";
    document.getElementById("get_started_chat").style.display = "block";

    document.getElementById("talk_buddy").style.display = "none";
    document.getElementById("talk_buddy_chat").style.display = "block";
  }
}

// Check if the token exists
const token = localStorage.getItem("access_token"); // Retrieve token from local storage or other source

if (token) {
  callProtectedEndpoint(token); // Call the protected endpoint with the token
} else {
  displayButton(true); // Show the login button if no token
}

const authModal = document.getElementById("authModal");
const authContent = document.getElementById("authContent");
const loginBtn = document.getElementById("loginBtn");
const get_started = document.getElementById("get_started");
const talk_buddy = document.getElementById("talk_buddy");
const chatInterface = document.getElementById("chatInterface");
const closeChatBtn = document.getElementById("closeChatBtn");
const chatArea = document.getElementById("chatArea");
const messageInput = document.getElementById("messageInput");
const sendMessageBtn = document.getElementById("sendMessageBtn");

let currentView = "login";
let email = "";
let messages = [];

function showAuthModal() {
  console.log("showAuthModal");
  authModal.classList.remove("hidden");
  renderAuthContent();
}

function hideAuthModal() {
  authModal.classList.add("hidden");
}

function showChatInterface() {
  chatInterface.classList.remove("hidden");
}

function hideChatInterface() {
  chatInterface.classList.add("hidden");
}

function renderAuthContent() {
  let content = "";
  if (currentView === "signup") {
    content = `
                    <div class="space-y-5">
                        <div class="flex justify-between mb-4">
                            <button onclick="setCurrentView('login')" class="text-base font-medium px-6 py-2">Login</button>
                            <button onclick="setCurrentView('signup')" class="text-base font-medium px-6 py-2 border-b-2 border-black">Signup</button>
                        </div>
                        <div class="space-y-5">
                            <div class="space-y-1.5">
                                <input id="username" type="text" class="w-full h-12 px-4 rounded-2xl bg-gray-50 border border-gray-200" placeholder="Username">
                            </div>
                            <div class="space-y-1.5">
                                <input id="email" type="email" class="w-full h-12 px-4 rounded-2xl bg-gray-50 border border-gray-200" placeholder="Email">
                            </div>
                            <div class="space-y-1.5 relative">
                                <input id="password" type="password" class="w-full h-12 px-4 rounded-2xl bg-gray-50 border border-gray-200" placeholder="Password">
                                <button type="button" onclick="togglePassword('password')" class="absolute right-4 top-1/2 -translate-y-1/2">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </button>
                            </div>
                            <div class="space-y-1.5 relative">
                                <input id="confirm-password" type="password" class="w-full h-12 px-4 rounded-2xl bg-gray-50 border border-gray-200" placeholder="Confirm Password">
                                <button type="button" onclick="togglePassword('confirm-password')" class="absolute right-4 top-1/2 -translate-y-1/2">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </button>
                            </div>
                            <div class="flex justify-between items-center">
                                <button onclick="setCurrentView('verify')" class="text-sm text-gray-600 hover:text-gray-900">Verify Email</button>
                                <button onclick="setCurrentView('resend-verification')" class="text-sm text-gray-600 hover:text-gray-900">Resend Verification Code</button>
                            </div>

                            <p class="text-xs text-gray-500">By continuing, you agree to our <a href="#" class="underline">Terms & Conditions</a> and <a href="#" class="underline">Privacy Policy</a></p>
                            <button onclick="handleSignup()" class="w-full h-12 bg-[#FFB800] hover:bg-[#FFB800]/90 text-black rounded-full font-medium text-base">
                                Sign Up
                            </button>
                        </div>
                    </div>
                `;
  } else if (currentView === "forgot") {
    content = `
                        <div class="space-y-6">
                            <h2 class="text-2xl font-bold">Forgot Password?</h2>
                            <p class="text-gray-600 text-sm">
                                Enter the email associated with your account, and we'll send you a code to reset your password
                            </p>
                            <div class="space-y-1.5">
                                <label for="forgot-email" class="text-sm font-medium">Email</label>
                                <input id="forgot-email" type="email" class="w-full h-12 px-4 rounded-2xl bg-gray-50 border border-gray-200 shadow-sm" placeholder="email@example.com">
                            </div>
                            <div class="text-right">
                                <button onclick="setCurrentView('otp')" class="text-sm text-gray-600 hover:text-gray-900">Already have Code?</button>
                            </div>
                            <button onclick="handleForgotPassword()" class="w-full h-12 bg-[#FFB800] hover:bg-[#FFB800]/90 text-black rounded-full font-medium text-base shadow-md hover:shadow-lg transition-shadow">
                                Send Code
                            </button>
                            <button onclick="setCurrentView('login')" class="w-full h-12 rounded-full border border-gray-200 hover:bg-gray-50 font-medium shadow-sm hover:shadow-md transition-shadow">
                                Go back to login
                            </button>
                        </div>
                    `;
  } else if (currentView === "otp") {
    content = `
                    <div class="space-y-6">
                        <button onclick="hideAuthModal()" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <h2 class="text-2xl font-bold text-center">OTP Verification</h2>
                        <p class="text-gray-600 text-sm text-center">
                            Enter the verification code we just sent to<br>
                            <span class="font-medium">${
                              email || "your email"
                            }</span>
                        </p>
                        <div class="space-y-1.5">
                            <input id="reset-pass-code" type="text" class="w-full h-12 px-4 rounded-2xl bg-gray-50 border border-gray-200 shadow-sm" placeholder="CODE" maxlength="8">
                        </div>
                        <div class="space-y-1.5">
                            <input id="reset-pass-email" type="email" class="w-full h-12 px-4 rounded-2xl bg-gray-50 border border-gray-200 shadow-sm" placeholder="email@example.com">
                        </div>
                        <div class="space-y-1.5 relative">
                                <input id="password" type="password" class="w-full h-12 px-4 rounded-2xl bg-gray-50 border border-gray-200" placeholder="Password">
                                <button type="button" onclick="togglePassword('password')" class="absolute right-4 top-1/2 -translate-y-1/2">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </button>
                            </div>
                            <div class="space-y-1.5 relative">
                                <input id="confirm-password" type="password" class="w-full h-12 px-4 rounded-2xl bg-gray-50 border border-gray-200" placeholder="Confirm Password">
                                <button type="button" onclick="togglePassword('confirm-password')" class="absolute right-4 top-1/2 -translate-y-1/2">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </button>
                            </div>
                        <button onclick="handleOtpVerification()" class="w-full h-12 bg-[#FFB800] hover:bg-[#FFB800]/90 text-black rounded-full font-medium">
                            Verify
                        </button>
                        <button onclick="setCurrentView('login')" class="w-full h-12 text-black rounded-full border border-gray-200 font-medium">
                            ← Go back to login
                        </button>
                    </div>
                `;
  } else if (currentView === "verify") {
    content = `
                    <div class="space-y-6">
                        <button onclick="hideAuthModal()" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <h2 class="text-2xl font-bold text-center">OTP Verification</h2>
                        <p class="text-gray-600 text-sm text-center">
                            Enter the verification code we just sent to<br>
                            <span class="font-medium">${
                              email || "your email"
                            }</span>
                        </p>
                        <div class="flex justify-center gap-3" id="verify_otp">
                            <input type="text" maxlength="1" class="w-12 h-12 text-center text-lg rounded-xl border border-gray-300 focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800]" oninput="moveToNext(this, 0)">
                            <input type="text" maxlength="1" class="w-12 h-12 text-center text-lg rounded-xl border border-gray-300 focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800]" oninput="moveToNext(this, 1)">
                            <input type="text" maxlength="1" class="w-12 h-12 text-center text-lg rounded-xl border border-gray-300 focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800]" oninput="moveToNext(this, 2)">
                            <input type="text" maxlength="1" class="w-12 h-12 text-center text-lg rounded-xl border border-gray-300 focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800]" oninput="moveToNext(this, 3)">
                            <input type="text" maxlength="1" class="w-12 h-12 text-center text-lg rounded-xl border border-gray-300 focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800]" oninput="moveToNext(this, 4)">
                            <input type="text" maxlength="1" class="w-12 h-12 text-center text-lg rounded-xl border border-gray-300 focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800]" oninput="moveToNext(this, 5)">
                        </div>
                        <div class="space-y-1.5">
                            <label for="verify-email" class="text-sm font-medium">Email</label>
                            <input id="verify-email" type="email" class="w-full h-12 px-4 rounded-2xl bg-gray-50 border border-gray-200 shadow-sm" placeholder="email@example.com">
                        </div>
                        
                        <button onclick="handleEmailVerification()" class="w-full h-12 bg-[#FFB800] hover:bg-[#FFB800]/90 text-black rounded-full font-medium">
                            Verify
                        </button>
                        <button onclick="setCurrentView('signup')" class="w-full h-12 text-black rounded-full border border-gray-200 font-medium">
                            ← Go back to Signup
                        </button>
                    </div>
                `;
  } else if (currentView === "resend-verification") {
    content = `
                    <div class="space-y-6">
                        <button onclick="hideAuthModal()" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <h2 class="text-2xl font-bold text-center">Resend Verification Code</h2>
                        <div class="space-y-1.5">
                            <label for="resend-email" class="text-sm font-medium">Email</label>
                            <input id="resend-email" type="email" class="w-full h-12 px-4 rounded-2xl bg-gray-50 border border-gray-200 shadow-sm" placeholder="email@example.com">
                        </div>
                        
                        <button onclick="handleResendVerification()" class="w-full h-12 bg-[#FFB800] hover:bg-[#FFB800]/90 text-black rounded-full font-medium">
                            Resend Code
                        </button>
                        <button onclick="setCurrentView('signup')" class="w-full h-12 text-black rounded-full border border-gray-200 font-medium">
                            ← Go back to Signup
                        </button>
                    </div>
                `;
  } else {
    content = `
                    <div class="space-y-5">
                        <div class="flex justify-between mb-4">
                            <button onclick="setCurrentView('login')" class="text-base font-medium px-6 py-2 border-b-2 border-black">Login</button>
                            <button onclick="setCurrentView('signup')" class="text-base font-medium px-6 py-2">Signup</button>
                        </div>
                        <div class="space-y-5">
                            <div class="space-y-1.5">
                                <input id="email" type="email" class="w-full h-12 px-4 rounded-2xl bg-gray-50 border border-gray-200" placeholder="Email">
                            </div>
                            <div class="space-y-1.5 relative">
                                <input id="password" type="password" class="w-full h-12 px-4 rounded-2xl bg-gray-50 border border-gray-200" placeholder="Password">
                                <button type="button" onclick="togglePassword('password')" class="absolute right-4 top-1/2 -translate-y-1/2">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </button>
                            </div>
                             </div>
                            <div class="text-right">
                                <button onclick="setCurrentView('forgot')" class="text-sm text-gray-600 hover:text-gray-900">Forgot Password?</button>
                            </div>
                            <button onclick="handleLogin()" class="w-full h-12 bg-[#FFB800] hover:bg-[#FFB800]/90 text-black rounded-full font-medium text-base">
                                Login
                            </button>
                        </div>
                    </div>
                `;
  }
  authContent.innerHTML = content;
}

function setCurrentView(view) {
  currentView = view;
  renderAuthContent();
}

function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const type = input.type === "password" ? "text" : "password";
  input.type = type;

  const button = input.nextElementSibling;
  const svg = button.querySelector("svg");
  if (type === "text") {
    svg.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />`;
  } else {
    svg.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />`;
  }
}

function moveToNext(input, index) {
  if (input.value.length === input.maxLength) {
    if (index < 5) {
      input.nextElementSibling.focus();
    } else {
      input.blur();
    }
  }
}
function moveToNextNew(input, index) {
  if (input.value.length === input.maxLength) {
    if (index < 7) {
      input.nextElementSibling.focus();
    } else {
      input.blur();
    }
  }
}
function handleForgotPassword() {
  // Collect the email address
  const email = $("#forgot-email").val();

  // Basic validation for email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    alert("Please enter a valid email address.");
    return;
  }


  // Send the email data via AJAX for password reset
  $.ajax({
    url: "https://server.askyla.com/api/users/forgot-password",
    method: "POST",
    data: $.param({
      email: email,
    }), 
    contentType: "application/x-www-form-urlencoded; charset=UTF-8",
    processData: true,
    success: function (response) {
      alert("Password reset link sent to your email!");
      setCurrentView("otp");
    },
    error: function (jqXHR) {
      let errorMessage = "Something went wrong. Please try again.";

      try {
        const response = JSON.parse(jqXHR.responseText);
        if (response.detail) {
          errorMessage = response.detail;
        }
      } catch (e) {
        console.error("Error parsing response:", e);
      }

      alert(errorMessage); // Show the error message to the user
    },
  });
}

function handleLogin() {
  // Collect email and password
  const email = $("#email").val();
  const password = $("#password").val();

  // Basic validation for email and password
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    alert("Please enter a valid email address.");
    return;
  }

  if (!password) {
    alert("Please enter a password.");
    return;
  }

  // Prepare data for submission
  var formData = new FormData();
  formData.append("email", email);
  formData.append("password", password);

  // Send login data via AJAX
  $.ajax({
    url: "https://server.askyla.com/api/users/login",
    method: "POST",
    data: $.param({
      email: email,
      password: password,
    }), 
    contentType: "application/x-www-form-urlencoded; charset=UTF-8",
    processData: true,
    headers: {
        'Origin': 'https://askyla.com' // This sets the origin header
    },
    success: function (response) {
      alert("Login successful!");
      const accessToken = response.access_token;
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + 24);
      localStorage.setItem("access_token", accessToken);
      const accessTokenst = localStorage.getItem("access_token");

      window.location.href = "chat.html";
    },
    error: function (jqXHR) {
      let errorMessage = "Login failed. Please check your credentials.";

      try {
        const response = JSON.parse(jqXHR.responseText);
        if (response.detail) {
          errorMessage = response.detail;
        }
      } catch (e) {
        console.error("Error parsing response:", e);
      }

      $("#errorModalBody").text(errorMessage);
      openModal();
    },
  });
}

function handleSignup() {
  let email = $("#email").val();
  const username = $("#username").val();
  const password = $("#password").val();
  const confirmPassword = $("#confirm-password").val();

  if (!email || !username || !password || !confirmPassword) {
    alert("Please fill in all fields.");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }
  $.ajax({
    url: "https://server.askyla.com/api/users/register", 
    method: "POST",
    data: $.param({
      username: username,
      email: email,
      password: password,
      password_confirmation: confirmPassword,
    }), 
    contentType: "application/x-www-form-urlencoded; charset=UTF-8",
    processData: true, // Ensure jQuery processes the data properly
    headers: {
      "Accept": "application/json", // Ensure Laravel treats it as JSON
    },
    success: function (response) {
      setCurrentView("verify");
      email = response.email;
    },
    error: function (jqXHR) {
      var errorMessage = "Signup failed. Please try again.";
  
      try {
        const response = JSON.parse(jqXHR.responseText);
        if (response.message) {
          errorMessage = response.message;
        }
      } catch (e) {
        console.error("Error parsing response:", e);
      }
  
      $("#errorModalBody").text(errorMessage);
      openModal();
    },
  });
  
  
  
}

function handleEmailVerification() {
  let verificationCode = "";
  $("#verify_otp input").each(function () {
    verificationCode += $(this).val();
  });
  if (verificationCode.length !== 6) {
    alert("Please enter a valid 6-digit verification code.");
    return;
  }

  // Collect email from the form
  const email = $("#verify-email").val();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailRegex.test(email)) {
    alert("Please enter a valid email address.");
    return;
  }


  // Submit data using AJAX
  $.ajax({
    url: "https://server.askyla.com/api/users/verify-email",
    method: "POST",
    data: $.param({
      email: email,
      code: verificationCode,
    }), 
    contentType: "application/x-www-form-urlencoded; charset=UTF-8",
    processData: true,
    success: function (response) {
      // Handle success
      alert("Email verification successful!");
      setCurrentView("login");
    },
    error: function (jqXHR) {
      // Show the error in the modal
      let errorMessage = "Email verification failed. Please try again.";

      try {
        const response = JSON.parse(jqXHR.responseText);

        if (response.detail) {
          errorMessage = response.detail;
        }
      } catch (e) {
        console.error("Error parsing response:", e);
      }

      $("#errorModalBody").text(errorMessage);
      openModal();
    },
  });
}

function handleResendVerification() {
  // Collect email from the input
  const email = $("#resend-email").val();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Validate email
  if (!email || !emailRegex.test(email)) {
    alert("Please enter a valid email address.");
    return;
  }

  // Prepare data for submission
  var formData = new FormData();
  formData.append("email", email);

  // Submit data using AJAX to resend the verification code
  $.ajax({
    url: "https://server.askyla.com/api/users/resend-verification", // Your backend endpoint to resend the OTP
    method: "POST",
    data: $.param({
      email: email,
    }), 
    contentType: "application/x-www-form-urlencoded; charset=UTF-8",
    processData: true,
    success: function (response) {
      // Handle success
      alert("Verification code resent successfully!");

      setCurrentView("verify");
    },
    error: function (jqXHR) {
      // Show the error in the modal
      let errorMessage =
        "Failed to resend verification code. Please try again.";

      try {
        const response = JSON.parse(jqXHR.responseText);
        if (response.detail) {
          errorMessage = response.detail;
        }
      } catch (e) {
        console.error("Error parsing response:", e);
      }

      $("#errorModalBody").text(errorMessage);
      openModal(); // Assuming openModal() displays the error in a modal
    },
  });
}

function handleOtpVerification() {
  let otpCode = $("#reset-pass-code").val();
  let email = $("#reset-pass-email").val();
  let password = $("#password").val();
  let confirmPassword = $("#confirm-password").val();

  // Basic validation
  if (
    otpCode === "" ||
    email === "" ||
    password === "" ||
    confirmPassword === ""
  ) {
    alert("Please fill in all fields.");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

  $.ajax({
    url: "https://server.askyla.com/api/users/reset-password",
    method: "POST",
    data: $.param({
      email: email,
      token: otpCode,
      new_password: password,
      password_confirmation: confirmPassword,
    }), 
    contentType: "application/x-www-form-urlencoded; charset=UTF-8",
    processData: true,
    success: function (response) {
      // Handle success
      alert("Password Changed");
      setCurrentView("login");
    },
    error: function (jqXHR) {
      // Show the error in the modal
      let errorMessage = "Email verification failed. Please try again.";

      try {
        const response = JSON.parse(jqXHR.responseText);

        if (response.detail) {
          errorMessage = response.detail;
        }
      } catch (e) {
        console.error("Error parsing response:", e);
      }

      $("#errorModalBody").text(errorMessage);
      openModal();
    },
  });
}

function addMessage(sender, text) {
  messages.push({ sender, text });
  renderMessages();
}

function renderMessages() {
  chatArea.innerHTML = messages
    .map(
      (message) => `
                <div class="flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                } mb-4">
                    <div class="bg-${
                      message.sender === "user" ? "custom-yellow" : "white"
                    } rounded-lg p-3 max-w-[70%] ${
        message.sender === "ai" ? "border-2 border-black" : ""
      }">
                        <p>${message.text}</p>
                    </div>
                </div>
            `
    )
    .join("");
  chatArea.scrollTop = chatArea.scrollHeight;
}

function sendMessage() {
  const message = messageInput.value.trim();
  if (message) {
    addMessage("user", message);
    messageInput.value = "";
    // Simulate AI response
    setTimeout(() => {
      addMessage("ai", "This is a simulated AI response.");
    }, 1000);
  }
}

loginBtn.addEventListener("click", showAuthModal);
talk_buddy.addEventListener("click", showAuthModal);
get_started.addEventListener("click", showAuthModal);
closeChatBtn.addEventListener("click", hideChatInterface);
sendMessageBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    sendMessage();
  }
});

// FAQ toggle functionality
document.querySelectorAll(".faq-item").forEach((item) => {
  const button = item.querySelector("button");
  const content = item.querySelector("p");
  const toggle = item.querySelector(".faq-toggle");

  button.addEventListener("click", () => {
    content.classList.toggle("hidden");
    toggle.textContent = content.classList.contains("hidden") ? "+" : "-";
  });
});
// Function to open the modal
function openModal() {
  document.getElementById("errorModal").classList.remove("hidden");
}

// Function to close the modal
function closeModal() {
  document.getElementById("errorModal").classList.add("hidden");
}
function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

$(document).ready(function () {
  const error = getQueryParam("error");
  if (error === "not-logged-in") {
    alert("You are not logged in. Please log in to continue.");
  }
});
