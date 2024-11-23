from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import smtplib
import random
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Constants
OPENWEATHER_API_KEY = "5587c509f668933659fdd7a834900c45"
TICKETMASTER_API_KEY = "jFhx9UG2VhHAQ0PR9yMSvN7H07e"
GMAIL_ADDRESS = "srikrishna1817@gmail.com"
GMAIL_APP_PASSWORD = "lere gntl ndmu fktz"

class User:
    def __init__(self, email):
        self.email = email
        self.otp = None

    def generate_otp(self):
        """Generate a 6-digit OTP"""
        self.otp = random.randint(100000, 999999)
        return self.otp

    def send_otp_email(self):
        """Send OTP verification email"""
        try:
            msg = MIMEMultipart()
            msg['From'] = GMAIL_ADDRESS
            msg['To'] = self.email
            msg['Subject'] = "WeatherWizard Email Verification"
            
            html = f"""
            <html>
              <body>
                <h2>WeatherWizard Email Verification</h2>
                <p>Your OTP for email verification is: <strong>{self.otp}</strong></p>
                <p>This OTP is valid for a limited time. Please do not share it with anyone.</p>
                <p>If you didn't request this verification, please ignore this email.</p>
              </body>
            </html>
            """
            
            msg.attach(MIMEText(html, 'html'))
            
            with smtplib.SMTP('smtp.gmail.com', 587) as server:
                server.starttls()
                server.login(GMAIL_ADDRESS, GMAIL_APP_PASSWORD)
                server.send_message(msg)
            
            return {"success": True, "otp": self.otp}
        except Exception as e:
            return {"success": False, "message": str(e)}

class Weather:
    def __init__(self, city):
        self.city = city
        self.base_url = "http://api.openweathermap.org/data/2.5"

    def calculate_rain_probability(self, data):
        """Calculate rain probability based on clouds and humidity"""
        cloud_cover = data.get("clouds", {}).get("all", 0)
        humidity = data.get("main", {}).get("humidity", 0)
        return min(round((cloud_cover + humidity) / 2), 100)

    def interpret_air_quality(self, aqi):
        """Convert AQI number to simple text description"""
        aqi_levels = {
            1: "Good Quality",
            2: "Fair",
            3: "Moderate",
            4: "Poor",
            5: "Very Poor"
        }
        return aqi_levels.get(aqi, "Unknown")

    def get_air_quality(self, lat, lon):
        """Fetch air quality data for given coordinates"""
        url = f"{self.base_url}/air_pollution?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}"
        try:
            response = requests.get(url)
            if response.status_code == 200:
                data = response.json()
                aqi = data.get('list', [{}])[0].get('main', {}).get('aqi')
                return self.interpret_air_quality(aqi)
            return None
        except:
            return None

    def fetch_weather(self, weather_option):
        """Fetch weather data based on the selected option"""
        if not self.city or not weather_option:
            return {"error": "City and weather option are required"}, 400

        try:
            geocoding_url = f"http://api.openweathermap.org/geo/1.0/direct?q={self.city}&limit=1&appid={OPENWEATHER_API_KEY}"
            geo_response = requests.get(geocoding_url)
            if geo_response.status_code != 200:
                return {"error": "City not found"}, 404

            geo_data = geo_response.json()
            if not geo_data:
                return {"error": "City not found"}, 404

            lat, lon = geo_data[0]['lat'], geo_data[0]['lon']

            if weather_option == "air-quality":
                aqi = self.get_air_quality(lat, lon)
                if aqi:
                    return jsonify({"air_quality": aqi})
                return {"error": "Unable to fetch air quality data"}, 500

            url = f"{self.base_url}/{'forecast' if weather_option == 'forecast' else 'weather'}?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"
            response = requests.get(url)

            if response.status_code == 200:
                data = response.json()
                
                if weather_option == "forecast":
                    for item in data["list"]:
                        if "pop" not in item:
                            item["pop"] = self.calculate_rain_probability(item) / 100
                else:
                    data["rain_probability"] = self.calculate_rain_probability(data)
                    aqi = self.get_air_quality(lat, lon)
                    if aqi:
                        data["air_quality"] = aqi

                return jsonify(data)
            else:
                return {"error": "Unable to fetch weather data"}, response.status_code

        except requests.RequestException as e:
            return {"error": f"API error: {str(e)}"}, 500

# API Routes
@app.route('/api/weather', methods=['GET'])
def get_weather():
    """Get weather data for a city"""
    city = request.args.get('city')
    weather_option = request.args.get('option', 'current')

    if not city:
        return jsonify({"error": "City is required"}), 400

    weather = Weather(city)
    return weather.fetch_weather(weather_option)

@app.route('/api/events', methods=['GET'])
@app.route('/api/events', methods=['GET'])
def get_events():
    """Get events for a city using Ticketmaster API"""
    city = request.args.get('city')

    if not city:
        return jsonify({"error": "City is required"}), 400

    try:
        url = f"https://app.ticketmaster.com/discovery/v2/events.json"
        params = {
            'apikey': 'jFhx9UG2VhHAQ0PR9yMSvN7At8Z3H07e',
            'city': city,
            'size': 10,
            'sort': 'date,asc'
        }
        response = requests.get(url, params=params)
        
        if response.status_code == 200:
            events_data = response.json()
            processed_events = []
            
            if events_data.get('_embedded', {}).get('events'):
                for event in events_data['_embedded']['events']:
                    processed_event = {
                        'name': event.get('name', 'No Name'),
                        'date': event.get('dates', {}).get('start', {}).get('localDate', 'No Date'),
                        'time': event.get('dates', {}).get('start', {}).get('localTime', 'No Time'),
                        'venue': event.get('_embedded', {}).get('venues', [{}])[0].get('name', 'No Venue'),
                        'url': event.get('url', ''),
                        'genre': event.get('classifications', [{}])[0].get('segment', {}).get('name', 'Unspecified'),
                        'priceRange': event.get('priceRanges', [{}])[0] if event.get('priceRanges') else {}
                    }
                    processed_events.append(processed_event)
            
            return jsonify(processed_events)
        else:
            return jsonify({"error": "Failed to fetch events"}), response.status_code

    except requests.RequestException as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


@app.route('/api/send-otp', methods=['POST'])
def send_otp():
    """Send OTP verification email"""
    data = request.json
    email = data.get("email")

    if not email:
        return jsonify({"error": "Email is required"}), 400

    try:
        user = User(email)
        otp = user.generate_otp()
        result = user.send_otp_email()

        if result["success"]:
            return jsonify({
                "message": "OTP sent successfully",
                "otp": otp,  # Remove in production
                "success": True
            })
        else:
            return jsonify({
                "error": result["message"],
                "success": False
            }), 500
    except Exception as e:
        return jsonify({
            "error": str(e),
            "success": False
        }), 500

if __name__ == '__main__':
    app.run(debug=True)
