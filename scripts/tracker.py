import json
import subprocess
import time
from datetime import datetime
from pathlib import Path


LOG_FILE = Path("storage/downloads/voyage_log.jsonl")
INTERVAL = 60  # seconds
ACCURACY = 10


def get_location(max_wait=20, target_accuracy=ACCURACY):
    """Stream GPS updates for up to max_wait seconds, returning best location fix."""
    proc = None
    best_loc = None
    start_time = time.time()
    try:
        proc = subprocess.Popen(
            ["termux-location", "-p", "gps", "-r", "updates"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        while time.time() - start_time < max_wait:
            line = proc.stdout.readline()
            if not line:
                break
            line = line.strip()
            if not line:
                continue
            try:
                loc = json.loads(line)
                if "latitude" not in loc or "longitude" not in loc:
                    continue
                acc = float(loc.get("accuracy", 9999))
                if best_loc is None or acc < float(best_loc.get("accuracy", 9999)):
                    best_loc = loc
                if acc <= target_accuracy:
                    break
            except json.JSONDecodeError:
                continue
    except Exception as e:
        print(f"GPS error: {e}")
    finally:
        if proc and proc.poll() is None:
            proc.terminate()
            proc.wait()
    return best_loc


def main():
    print(f"Logging GPS to {LOG_FILE} (1-min interval, target acc: {ACCURACY}m)...")
    while True:
        loc = get_location()

        if loc and "latitude" in loc and "longitude" in loc:
            acc = float(loc.get("accuracy", 0))
            record = {
                "latitude": round(loc["latitude"], 6),
                "longitude": round(loc["longitude"], 6),
                "accuracy": round(acc, 1),
                "timestamp": datetime.now().isoformat(),
            }
            line = json.dumps(record) + "\n"
            LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
            with LOG_FILE.open("a") as f:
                f.write(line)
            print(f"[{time.strftime('%H:%M:%S')}] {line.strip()}")
        else:
            print(f"[{time.strftime('%H:%M:%S')}] No valid GPS fix...")

        time.sleep(INTERVAL)


if __name__ == "__main__":
    main()
