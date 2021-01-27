# Whiteboard

## Overview

Material UI redesign of Blackboard, UTD's online Learning Management System.

## Description

Provides a cleaner user-interface along with added functionalities such as notifications, grades overview, weekly calendar, and more. This allows users to drastically improve their workflow while providing the same core functions without potential errors. 

## Technical Implementation

Whiteboard is offered as a Chrome Extension (also works on Firefox and Edge), which allows for the extension script to execute API calls directly on the user's behalf. To retrieve the necessary information for the various components, Blackboard's API is used as the default endpoint and the rendered pages themselves are used as a fallback if no API endpoints offer the same functionality. To implement a global Material Design design language, the application is using Material Design Lite, which is a lightweight HTML/CSS-only option that contains the majority of core components. To connect the backend information to the frontend, JavaScript is used to both fetch information as well as apply them onto the rendered HTML pages. For certain features such as saved pins, Chrome extension's local storage API is used to store user defined pins so they can persist between sessions.

## Main Difficulties

1. Whether to use an Angular application or Chrome Extension
    1. Reason: Angular application would allow for greater flexibility with deployment and scripts, but accessing user cookies would be a major security concern without proper 2FA login approved by UTD
    2. Resolved: Chose to use a Chrome Extension instead as Cross-Origin Resource Sharing (CORS) would not be an issue. In addition, not relying on libraries help cut down the size of installation.
2. Whether to use individual HTML templates or just one
    1. Reason: Individual templates for announcement/course/content pages could allow for greater flexibility, but would also require a centralized template to maintain a seamless transition between different pages. One HTML template would mean only using one template file, which makes editing different elements a lot easier.
    2. Resolved: Chose to use one template file with HTML snippets in JavaScript to inject depending on the page the user is currently on.
3. How to remove the pause during API calls
    1. Reason: Initially, the template would load just after the original page loads so there is a flash of the old content which is quite visually unpleasing.
    1. Resolved: Loading screen that writes before anything is called (using a Chrome Extension option), then rewrite with actual template code when that has finished loading.
4. How to design sidebar
    1. Reason: Sidebar should be a fast way for users to jump between course contents. Originally, the sidebar only contained a list of courses and nothing else.
    2. Resolved: The sidebar now contains a list of courses as well as their respective pins. Those pins can be customized by the users to be able to jump to any other content from any other page.
5. How to design weekly calendar
    1. Reason: The user should have a straightforward way of seeing what is due in the upcoming week. This would allow the user to turn in assignments on time and not stress about missing assignments.
    2. Resolved: Used Blackboard's Calendar API to retrieve a list of courses between last week and this week. Then, add each event to the page along with some styling.
6. How to quickly add to calendar
    1. Reason: If a professor does not add an assignment onto the calendar for some reason, it usually takes a lot of time for the student to navigate to the calendar and add that information. In addition, it is also to forget the assignment name or the due date by the time they get to the calendar page.
    2. Resolved: Added a quick add to calendar button on the top right of every page. It presents a dropdown with space for event title, event description, start time and end time. Then, it utilizes the Blackboard Calendar API to add the course into the user's calendar.
7. How to design grades overview
    1. Reason: Blackboard does not offer a way to view all courses' grades at once. This leads to a lot of time wasted as students have to go through each course's grades page to see if anything was updated recently.
    2. Resolved: The grades overview section on the home page allows the user to view their current grade and the most recent grade for each class. This allows the user to be alerted to recent grade changes much more quickly.
8. How to fix Firefox compatibillity
    1. Reason: Some students were on Firefox and wanted to use the extension.
    2. Resolved: Changed storage settings to local rather than sync, which allows the extension to be compatible for both browsers types.
9. How to let the user know that there is a new update
    1. Reason: Since the project was originally hosted on GitHub, users aren't notified if there is a new update.
    2. Resolved: Two solutions were implemented for this issue. First, there is an update link on the bottom left telling the user if there is a new beta/stable release available. Second, the extension is now hosted on Chrome Webstore which allows for easy updates.
10. How to implement notifications
    1. Reason: Blackboar's notifications are all gathered in one huge list, which made checking for new announcements very difficult for students.
    2. Resolved: Added a green notification bell on the top right; it turns red with the number of unread notifications if there are new notifications; once the user reads the notifications (by closing the notification dropdown), those notifications are added to the local storage and are counted as "dismissed." Currently, notifications are separated into two tabs, regular course announcements and course content added alerts.
