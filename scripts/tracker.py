#!/usr/bin/env python3
import datetime
import json
import subprocess
import sys
import time

from pathlib import Path

LOG_FILE = Path("storage/downloads/gps_log.jsonl")
LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
INTERVAL_SECONDS = 60


def get_gps_location():
    """Call termux-location to get GPS coordinates."""
    try:
        # Avoid '-r once' because it hangs on second invocation in Termux
        result = subprocess.run(
            ["termux-location", "-r", "once", "-p", "gps"],
            capture_output=True,
            text=True,
            check=True,
            timeout=15,
        )
        data = json.loads(result.stdout)
        return data.get("latitude"), data.get("longitude")
    except subprocess.TimeoutExpired:
        print("termux-location timed out", file=sys.stderr, flush=True)
        return None, None
    except (subprocess.SubprocessError, json.JSONDecodeError, KeyError) as e:
        print(f"Error getting location: {e}", file=sys.stderr, flush=True)
        return None, None


def main():
    print(
        f"Starting GPS tracker. Saving to {LOG_FILE} every {INTERVAL_SECONDS}s...",
        flush=True,
    )
    while True:
        start_time = time.time()
        lat, lon = get_gps_location()

        if lat is not None and lon is not None:
            now_iso = datetime.datetime.now().isoformat()
            entry = {
                "latitude": lat,
                "longitude": lon,
                "timestamp": now_iso,
            }
            with LOG_FILE.open("a", encoding="utf-8") as f:
                f.write(json.dumps(entry) + "\n")
            print(f"[{now_iso}] Logged: lat={lat}, lon={lon}", flush=True)
        else:
            print("Failed to acquire GPS fix.", flush=True)

        # Calculate sleep time to align closely with interval
        elapsed = time.time() - start_time
        sleep_time = max(0.0, INTERVAL_SECONDS - elapsed)
        time.sleep(sleep_time)


if __name__ == "__main__":
    main()
