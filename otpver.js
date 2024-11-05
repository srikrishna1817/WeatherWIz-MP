let generatedOTP; // Declare the variable to store the generated OTP

document.getElementById("email-form").addEventListener("submit", async function(event) {
    event.preventDefault(); // Prevent default form submission
    const email = document.getElementById("email").value.trim();
    document.getElementById("loading").style.display = "block";
    document.getElementById("error-message").textContent = "";

    try {
        const response = await fetch('http://127.0.0.1:5000/api/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        if (data.success) {
            generatedOTP = data.otp; // Store the generated OTP
            document.getElementById("loading").style.display = "none";
            document.getElementById("otp-section").style.display = "block";
        } else {
            throw new Error(data.message || "Failed to send OTP");
        }
    } catch (error) {
        console.error("Error:", error);
        document.getElementById("loading").style.display = "none";
        document.getElementById("error-message").textContent = error.message || "An unexpected error occurred.";
    }
});

document.getElementById("verify-otp").addEventListener("click", function() {
    const enteredOTP = parseInt(document.getElementById("otp").value.trim());

    if (enteredOTP === generatedOTP) {
        window.location.href = 'index.html'; // Redirect to weather page after successful verification
    } else {
        document.getElementById("otp-error-message").textContent = "Invalid OTP. Please try again.";
    }
});
