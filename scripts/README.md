# Tracking waypoints with external devices

## Android
On an android telephone:

 ### Step 1: Install packages in Termux
 Copy & paste into Termux:
 ```bash
   pkg update && pkg install python termux-api -y
 ```
and allow Termux to access storage
```bash
  termux-setup-storage
```

### Step 2: Ensure Termux:API app installed & permissions granted
 1. Make sure you installed Termux:API app (from F-Droid or GitHub releases alongside Termux).
 2. Go to Android phone Settings -> Apps -> Termux:API -> Permissions -> Location -> Set to Allow all the time.

 ### Step 3: Test GPS in Termux
 Run:

 ```bash
   termux-location -p gps
 ```

 (Should return JSON with latitude & longitude. If blank, turn ON GPS/Location on phone).

### Step 4: Copy the tracker file
Copy `tracker.py` to your devices

### Step 5: Start logging!
Run:
```bash
  python tracker.py
```
