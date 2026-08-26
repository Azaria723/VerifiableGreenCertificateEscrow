import json
import urllib.request

CONTRACT_ADDRESS = "0x54B086F8B4023bB9eFb605a7A06998b3E6f757d3"
RPC_URL = "https://studio.genlayer.com/api"

def call_contract_view(method_name, args=[]):
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "gen_callView",
        "params": [
            {
                "to": CONTRACT_ADDRESS,
                "data": {
                    "method": method_name,
                    "args": args
                }
            }
        ]
    }
    req = urllib.request.Request(
        RPC_URL,
        data=json.dumps(payload).encode('utf-8'),
        headers={"Content-Type": "application/json", "User-Agent": "GenLayerTester/1.0"}
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            res_body = response.read().decode('utf-8')
            return json.loads(res_body)
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    print(f"=== Testing Live Contract on Studionet: {CONTRACT_ADDRESS} ===")
    counts_res = call_contract_view("get_counts")
    print("get_counts response:", json.dumps(counts_res, indent=2))

    accounting_res = call_contract_view("get_accounting")
    print("get_accounting response:", json.dumps(accounting_res, indent=2))
