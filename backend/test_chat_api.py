import requests
import json

def test_chat():
    url = "http://localhost:8000/api/chat/query"
    payload = {"message": "Hello, legal assistant!", "language": "English"}
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(url, data=json.dumps(payload), headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_chat()
