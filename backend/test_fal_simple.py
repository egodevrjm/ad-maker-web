import os
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("Testing FAL.ai connection...")
print(f"FAL_API_KEY exists: {bool(os.getenv('FAL_API_KEY'))}")

try:
    import fal_client
    print(f"fal_client version: {getattr(fal_client, '__version__', 'Unknown')}")
    
    # Set the API key
    api_key = os.getenv('FAL_API_KEY')
    if api_key:
        os.environ["FAL_KEY"] = api_key
        print("API key set in environment")
    
    async def test_fal():
        # Test 1: Simple sync call
        print("\nTest 1: Testing simple FAL call...")
        try:
            result = fal_client.run(
                "fal-ai/fast-svd-lcm",
                input={"prompt": "A happy dog playing in a park"}
            )
            print(f"Success! Result type: {type(result)}")
            print(f"Result keys: {list(result.keys()) if isinstance(result, dict) else 'Not a dict'}")
            if isinstance(result, dict):
                import json
                print(f"Full result: {json.dumps(result, indent=2, default=str)}")
        except Exception as e:
            print(f"Test 1 failed: {type(e).__name__}: {str(e)}")
        
        # Test 2: Try with subscribe
        print("\nTest 2: Testing subscribe method...")
        try:
            result = await asyncio.to_thread(
                fal_client.subscribe,
                "fal-ai/fast-svd-lcm",
                input={"prompt": "A cat sleeping on a couch"}
            )
            print(f"Success! Result type: {type(result)}")
            print(f"Result: {result}")
        except Exception as e:
            print(f"Test 2 failed: {type(e).__name__}: {str(e)}")
        
        # Test 3: Try different parameter format
        print("\nTest 3: Testing with arguments parameter...")
        try:
            result = fal_client.run(
                "fal-ai/fast-svd-lcm",
                arguments={"prompt": "A bird flying in the sky"}
            )
            print(f"Success! Result type: {type(result)}")
            print(f"Result: {result}")
        except Exception as e:
            print(f"Test 3 failed: {type(e).__name__}: {str(e)}")
    
    # Run the async test
    asyncio.run(test_fal())
    
except ImportError as e:
    print(f"Failed to import fal_client: {e}")
    print("\nTrying to install it...")
    import subprocess
    subprocess.run(["pip", "install", "fal-client", "--upgrade"])
    print("Please run this script again after installation.")
except Exception as e:
    print(f"Unexpected error: {type(e).__name__}: {str(e)}")
    import traceback
    traceback.print_exc()
