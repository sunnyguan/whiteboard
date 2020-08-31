# Blackboard-Enhanced

## Features

1. Working ICS link

## Setup

1. Download the zip file: 
2. Go to `chrome://extensions`
3. Enable "Developer mode" on top right
4. Click "Load unpacked" button on top left
5. Select the "blackboard-enhanced" folder in the zipped file
6. Go to [UTD eLearning](https://coursebook.utdallas.eduhttp://elearning.utdallas.edu/) (logout and login again if you are already logged in)
7. Once you log in to eLearning, it will automatically upload your ics and it will be at this link: https://coolapis.herokuapp.com/ics?ptg=YOUR_UTD_ID
	1. Note: YOUR_UTD_ID is your 10 digit UTD ID, not your Net ID or email address.
8. If you can't find your UTD_ID for some reasons, open the developer console (F12) and it should be there in one of the output lines. In addition, the url will also be in the console and in the extension popup.
9. Every time you access a website that has `elearning.utdallas.edu` at the beginning, the script will automatically update the ICS file on the server if enough time has passed. You can change that time interval in the extension popup.
