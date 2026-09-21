import requests
import traceback

try:
    print("Testing connection to graphql.anilist.co...")
    response = requests.post(
        'https://graphql.anilist.co',
        json={'query': '{ Page { media { id } } }'},
        timeout=5
    )
    print("Status code:", response.status_code)
    print("Response JSON:", response.json())
except Exception as e:
    print("FAILED:")
    traceback.print_exc()
