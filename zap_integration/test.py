import requests
import base64

api_key = "8d19d18c-21b4-493f-8540-58c97eaeb68d"
address = "0x3c5c884d512a4513c9c7440be3c2533175178a09"

authorization = "Basic " + base64.b64encode(api_key.encode("utf-8")).decode("utf-8")

url = f"https://api.zapper.xyz/v2/balances/tokens?addresses%5B%5D={address}"
add_network = "&networks%5B%5D=ethereum"

print(url)
print(url + add_network)

headers = {
    "Content-Type": "*/*",
    "Authorization": authorization
}

# Make the API request
response = requests.get(url, headers=headers)

print(response.text)

