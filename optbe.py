from flask import Flask, jsonify, request
import smtplib
import random
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Route to send OTP
@app.route('/api/send-otp', methods=['POST'])
def send_otp():
    data = request.json
    receiver_email = data['email']  
    otp = random.randint(100000, 999999)  

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        
        sender_email = 'srikrishna1817@gmail.com'  
        password = 'lere gntl ndmu fktz'  
        
        server.login(sender_email, password)
        
        subject = "OTP Verification"
        body = f"Your OTP is {otp}."
        message = f"Subject: {subject}\n\n{body}"
        
        server.sendmail(sender_email, receiver_email, message)
        
        return jsonify({"success": True, "otp": otp})  
    
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500  
    
    finally:
        server.quit()  

# Route to get weather data
@app.route('/api/weather', methods=['GET'])
def get_weather():
    city = request.args.get('city')
    weather_option = request.args.get('weather_option')
    
    api_key = '5587c509f668933659fdd7a834900c45'  
    
    if not city or not weather_option:
        return jsonify({"error": "City and weather option are required"}), 400
    
    if weather_option in ["current", "wind-speed", "humidity", "sunrise-sunset"]:
         url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"
    elif weather_option == "forecast":
         url = f"http://api.openweathermap.org/data/2.5/forecast?q={city}&appid={api_key}&units=metric"
    else:
         return jsonify({"error": "Invalid weather option"}), 400
    
    try:
         response = requests.get(url)
         if response.status_code == 200:
             return jsonify(response.json())  
         else:
             return jsonify({"error": response.json().get("message", "Error fetching weather data")}), response.status_code
            
    except requests.RequestException as e:
         return jsonify({"error": f"An error occurred while fetching data from OpenWeatherMap API: {str(e)}"}), 500

if __name__ == '__main__':
     app.run(debug=True)  
