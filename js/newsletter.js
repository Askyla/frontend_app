document.getElementById("subscribeBtn").addEventListener("click", function () {
    const emailInput = document.querySelector('#newsletter_email');
    const email = emailInput.value.trim();
    console.log(email);
    const recaptchaResponse = grecaptcha.getResponse(recaptcha2); // use recaptcha2 here
    console.log(recaptchaResponse);

    if (!email || !recaptchaResponse) {
        alert("Please enter a valid email and complete the captcha." + email);
        return;
    }

    const url = "https://server.askyla.com/api/form/newsletter";

    const data = JSON.stringify({
        email: email,
        captcha_response: recaptchaResponse,
    });

    $.ajax({
        url: url,
        type: "POST",
        data: data,
        contentType: "application/json",
        processData: false,
        beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", "Bearer your_token");
        },
        success: function (response) {
        console.log("Subscribed successfully", response);
        alert("Subscription successful!");
        emailInput.value = "";
        grecaptcha.reset(recaptcha2); // reset only recaptcha2
        },
        error: function (xhr, status, error) {
        console.error("Subscription failed:", status, error);
        alert("Subscription failed: " + error);
        }
    });
});
