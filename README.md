# Zendesk-SidePanel-App-Middleware
Middleware + Local Zendesk App (ZAT)

Requirements
------------
- Ruby + RubyGems
- zendesk_apps_tools gem (zat) installed via:
  gem install zendesk_apps_tools
- Docker

Middleware Installation and How to Run It
-----------------------------------------
1. Open a terminal/command prompt and navigate to the "middleware" folder.
2. Build the Docker image:
   `docker build -t middleware-image .`
3. Create the container:
   docker create --name middleware-container -p 3000:3000 middleware-image
4. Start the container:
   docker start middleware-container
5. Stop the container:
   docker stop middleware-container

How to Load the Zendesk App Locally Using ZAT
---------------------------------------------
1. Open a terminal/command prompt and navigate to the "sideapp" folder.
2. Run the ZAT server:
   zat server
3. When prompted for a value for "apiToken", enter: secretkey
   (This acts as a secret for communication between the app and middleware.)
4. Inside Zendesk, add the following parameter to the URL to load it locally:
   ?zat=true
   ex: https://subdomain.zendesk.com/agent/tickets/22?zat=true
5. Open a ticket in Zendesk; the app should now be visible and functional.
