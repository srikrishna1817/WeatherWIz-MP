from flask import Flask, jsonify, request
import smtplib
import random
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Base class for handling user-related tasks
class User:
    def __init__(self, email):
        self.email = email
        self.otp = None

    def generate_otp(self):
        """Generate a random OTP."""
        self.otp = random.randint(100000, 999999)
        return self.otp

    def send_otp_email(self):
        """Send the OTP to the user's email."""
        try:
            server = smtplib.SMTP('smtp.gmail.com', 587)
            server.starttls()
            sender_email = 'srikrishna1817@gmail.com'
            password = 'lere gntl ndmu fktz'  # Use environment variable for security in production
            server.login(sender_email, password)

            subject = "OTP Verification"
            body = f"Your OTP is {self.otp}."
            message = f"Subject: {subject}\n\n{body}"

            server.sendmail(sender_email, self.email, message)
            server.quit()
            return {"success": True, "otp": self.otp}
        except Exception as e:
            return {"success": False, "message": str(e)}

# Base class for handling weather-related tasks
class Weather:
    def __init__(self, city):
        self.city = city

    def fetch_weather(self, weather_option):
        """Fetch weather data based on the specified weather option."""
        api_key = '5587c509f668933659fdd7a834900c45'
        if not self.city or not weather_option:
            return {"error": "City and weather option are required"}, 400
        
        url = self.build_weather_url(weather_option, api_key)
        if not url:
            return {"error": "Invalid weather option"}, 400
        
        try:
            response = requests.get(url)
            if response.status_code == 200:
                return jsonify(response.json())
            else:
                return jsonify({"error": response.json().get("message", "Error fetching weather data")}), response.status_code
        except requests.RequestException as e:
            return jsonify({"error": f"An error occurred while fetching data from OpenWeatherMap API: {str(e)}"}), 500

    def build_weather_url(self, weather_option, api_key):
        """Build the appropriate URL based on the weather option."""
        if weather_option == "current":
            return f"http://api.openweathermap.org/data/2.5/weather?q={self.city}&appid={api_key}&units=metric"
        elif weather_option == "wind-speed":
            return f"http://api.openweathermap.org/data/2.5/weather?q={self.city}&appid={api_key}&units=metric"
        elif weather_option == "humidity":
            return f"http://api.openweathermap.org/data/2.5/weather?q={self.city}&appid={api_key}&units=metric"
        elif weather_option == "sunrise-sunset":
            return f"http://api.openweathermap.org/data/2.5/weather?q={self.city}&appid={api_key}&units=metric"
        elif weather_option == "forecast":
            return f"http://api.openweathermap.org/data/2.5/forecast?q={self.city}&appid={api_key}&units=metric"
        else:
            return None

# Endpoint to get events data for a city
@app.route('/api/events', methods=['GET'])
def get_events():
    city = request.args.get('city')

    if not city:
        return jsonify({"error": "City is required"}), 400

    # Test data to simulate event fetching
    # Replace with real data fetching logic if needed
    events_data = [
        {"name": "Music Concert", "date": "2024-11-20", "location": f"{city} Arena", "link": "http://example.com/concert"},
        {"name": "Art Exhibition", "date": "2024-11-25", "location": f"{city} Art Gallery", "link": "http://example.com/exhibition"},
        {"name": "Food Festival", "date": "2024-11-30", "location": f"{city} Park", "link": "http://example.com/foodfest"}
    ]

    return jsonify({"events": events_data})

# API route to send OTP to a user
@app.route('/api/send-otp', methods=['POST'])
def send_otp():
    data = request.json
    email = data.get('email')

    if not email:
        return jsonify({"error": "Email is required"}), 400

    user = User(email)
    otp = user.generate_otp()
    result = user.send_otp_email()

    return jsonify(result)

# API route to get weather data
@app.route('/api/weather', methods=['GET'])
def get_weather():
    city = request.args.get('city')
    weather_option = request.args.get('weather_option')

    if not city or not weather_option:
        return jsonify({"error": "City and weather option are required"}), 400

    weather = Weather(city)
    data = weather.fetch_weather(weather_option)

    return data

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
