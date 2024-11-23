let generatedOTP;

document.getElementById("email-form").addEventListener("submit", async function (event) {
    event.preventDefault();
    const email = document.getElementById("email").value.trim();
    const loadingElement = document.getElementById("loading");
    const errorElement = document.getElementById("error-message");
    const otpSection = document.getElementById("otp-section");
    
    // Reset error messages
    errorElement.textContent = "";
    
    // Show loading
    loadingElement.style.display = "block";
    
    try {
        const response = await fetch("http://127.0.0.1:5000/api/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();
        
        if (response.ok) {
            generatedOTP = data.otp;
            // Hide loading and show OTP section
            loadingElement.style.display = "none";
            otpSection.style.display = "block";
            // Clear any previous OTP error messages
            document.getElementById("otp-error-message").textContent = "";
        } else {
            throw new Error(data.error || "Failed to send OTP");
        }
    } catch (error) {
        console.error("Error:", error);
        errorElement.textContent = error.message || "An unexpected error occurred.";
        loadingElement.style.display = "none";
    }
});

document.getElementById("verify-otp").addEventListener("click", function () {
    const enteredOTP = parseInt(document.getElementById("otp").value.trim());
    const otpErrorElement = document.getElementById("otp-error-message");
    
    if (isNaN(enteredOTP)) {
        otpErrorElement.textContent = "Please enter a valid OTP number";
        return;
    }
    
    if (enteredOTP === generatedOTP) {
        // Clear any error messages
        otpErrorElement.textContent = "";
        // Redirect to home page on successful verification
        window.location.href = "index.html";
    } else {
        otpErrorElement.textContent = "Invalid OTP. Please try again.";
    }
});
