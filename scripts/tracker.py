import json
import subprocess
import time
from datetime import datetime
from pathlib import Path


LOG_FILE = Path("storage/downloads/voyage_log.jsonl")
INTERVAL = 60  # seconds
ACCURACY = 10


def get_location():
    try:
        res = subprocess.run(
            ["termux-location", "-p", "gps", "-r", "once"],
            capture_output=True,
            text=True,
            timeout=10,
        )
        if res.returncode == 0 and res.stdout.strip():
            return json.loads(res.stdout)
    except Exception as e:
        print(f"GPS error: {e}")
    return None


def main():
    print(f"Logging GPS to {LOG_FILE} (1-min interval)...")
    while True:
        loc = get_location()
        if float(loc["accuracy"]) > ACCURACY:
            continue

        if loc and "latitude" in loc and "longitude" in loc:
            record = {
                "latitude": round(loc["latitude"], 6),
                "longitude": round(loc["longitude"], 6),
                "timestamp": datetime.now().isoformat(),
            }
            line = json.dumps(record) + "\n"
            with LOG_FILE.open("a") as f:
                f.write(line)
            print(f"[{time.strftime('%H:%M:%S')}] {line.strip()}")
        else:
            print("No GPS fix...")

        time.sleep(INTERVAL)


if __name__ == "__main__":
    main()
