let generatedOTP; // Declare the variable to store the generated OTP

document.getElementById("email-form").addEventListener("submit", async function(event) {
    event.preventDefault(); // Prevent default form submission
    const email = document.getElementById("email").value.trim(); // Get email input
    document.getElementById("loading").style.display = "block"; // Show loading message
    document.getElementById("error-message").textContent = ""; // Clear previous error messages

    try {
        const response = await fetch('http://127.0.0.1:5000/api/send-otp', { // Ensure this URL is correct
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }) // Send email as JSON
        });

        // Check if the response is okay
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json(); // Parse JSON response

        if (data.success) {
            generatedOTP = data.otp; // Store the generated OTP
            document.getElementById("loading").style.display = "none"; // Hide loading message
            document.getElementById("otp-section").style.display = "block"; // Show OTP input section
        } else {
            throw new Error(data.message || "Failed to send OTP");
        }
    } catch (error) {
        console.error("Error:", error); // Log the error for debugging
        document.getElementById("loading").style.display = "none"; // Hide loading message
        document.getElementById("error-message").textContent = error.message || "An unexpected error occurred."; // Display error message
    }
});

document.getElementById("verify-otp").addEventListener("click", function() {
    const enteredOTP = parseInt(document.getElementById("otp").value.trim()); // Get entered OTP

    if (enteredOTP === generatedOTP) { // Check if entered OTP matches generated OTP
        window.location.href = 'index.html'; // Redirect to weather page after successful verification
    } else {
        document.getElementById("otp-error-message").textContent = "Invalid OTP. Please try again."; // Show error message for invalid OTP
    }
});