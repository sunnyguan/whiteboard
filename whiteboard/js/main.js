import home from './home.js';
import course from './course.js';
import content from './content.js';
import announcement from './announcement.js';
import iframe from './iframe.js';
import discussion from './discussion.js';
import { setUserInfo } from './utils.js';

// for displaying user info, might add more uses later
var user_id = "";
var email = "";
var username = "";
var avatar_link = "";
var avatarid = "";

var enabled = true;
const urlPrefix = "https://elearning.utdallas.edu";

var flag = false;
var waiting = false;

export async function start(options) {
    console.log("Fetching your unique id...")
    var login = await fetch(urlPrefix + "/webapps/blackboard/execute/personalInfo")
        .then(response => response.text())
        .then(result => {
            return getUserId(result, options)
        }).catch(error => {
            console.log(error);
            console.log("you're not logged in.")
            return true;
        });
    return login;
}

// save user ID for API calls
function getUserId(result, options) {
    avatarid = result.match("key=(.*?), dataType=blackboard.data.user.User");
    var nameMatch = result.match("class=global-top-avatar />(.*?)<span");
    var avatarMatch = result.match('src="(/avatar/.*?user.*?)"');
    // src="/avatar/default_user?ts=1525262400000"  <- note: needs to also match this for default avatar

    console.log(avatarid);
    if (!avatarid || avatarid.length < 2) {
        console.log("Not logged in");
        window.location.replace("https://elearning.utdallas.edu/webapps/login/?action=relogin");
        return true;
    } else {
        email = result.match("Email: (.*?@utdallas\\.edu)")[1];
        user_id = avatarid[1];
        username = nameMatch[1];
        avatar_link = avatarMatch ? avatarMatch[1] : "https://learn.content.blackboardcdn.com/3900.21.0-rel.28+dd6c7ec/images/ci/ng/default_profile_avatar.svg";
        setUserInfo(email, user_id, username, avatar_link, options);
        replacePage();
        return false;
    }
}

// logic for choosing page to replace
function replacePage() {
    
    var href = window.location.href;
    const urlParams = new URLSearchParams(window.location.search);
    var courseId = urlParams.get("course_id");
    var replaceUrl = "home";
    var contentId = "";
    var iframeSrc = "";
    var title = "";

    if (href.startsWith(urlPrefix + "/webapps/portal/execute/tabs/tabAction")) {
        replaceUrl = "home";
    } else if (href.startsWith(urlPrefix + "/webapps/blackboard/content/listContent")) {
        if (urlParams.get('content_id') != null) {
            replaceUrl = "content";
            contentId = href.split("content_id=")[1].split("&")[0];
        } else {
            replaceUrl = "course";
        }
    } else if (href.startsWith(urlPrefix + "/webapps/blackboard/execute/announcement")) {
        replaceUrl = "announcement";
    } else if (href.startsWith(urlPrefix + "/webapps/calendar")) {
        iframeSrc = urlPrefix + "/webapps/calendar/viewMyBb?globalNavigation=false";
        title = "Calendar";
        replaceUrl = "iframe";
    } else if (href.startsWith(urlPrefix + "/webapps/assignment/uploadAssignment")) {
        iframeSrc = href;
        title = "Assignment";
        replaceUrl = "iframe";
    }/* else if (href.startsWith(urlPrefix+"/webapps/discussionboard")) {
        iframeSrc = href;
        title = "Discussion Board";
        replaceUrl = "iframe";
    }*/ else if (href.startsWith(urlPrefix + "/webapps/collab-ultra/tool/collabultra")) {
        iframeSrc = href;
        title = "BlackBoard Collab";
        replaceUrl = "iframe";
    } else if (href.startsWith(urlPrefix + "/webapps/assessment/take/launchAssessment")) {
        iframeSrc = href;
        title = "Assessment";
        replaceUrl = "iframe";
    } else if (href.startsWith(urlPrefix + "/webapps/bb-mygrades-BBLEARN")) {
        iframeSrc = href;
        title = "My Grades";
        replaceUrl = "iframe";
    } else if (href.startsWith(urlPrefix + "/webapps/gradebook")) {
        iframeSrc = href;
        title = "Gradebook";
        replaceUrl = "iframe";
    } else if (href.startsWith(urlPrefix + "/webapps/blackboard/content/contentWrapper")) {
        iframeSrc = href;
        title = "Content";
        replaceUrl = "iframe";
    } else if (href.startsWith(urlPrefix + "/webapps/discussionboard/")) {
        if (href.includes("conf_id") || href.includes("forum_id")) {
            iframeSrc = href;
            title = "Discussion";
            replaceUrl = "iframe";
        } else {
            replaceUrl = "discussion";
        }
    }
    else {
        // no suitable replacement found, use iframe fallback
        iframeSrc = href;
        title = "Blackboard";
        replaceUrl = "iframe";
    }

    if (courseId == null) courseId = "";

    fetch(chrome.extension.getURL("home/index.html"))
        .then(function (response) {
            switch (response.status) {
                case 200:
                    return response.text();
                case 404:
                    throw response;
            }
        })
        .then(function (template) {
            if (replaceUrl === "home")
                home(template);
            else if (replaceUrl === "course")
                course(template, courseId);
            else if (replaceUrl === "content")
                content(template, courseId, contentId);
            else if (replaceUrl === "announcement")
                announcement(template, courseId);
            else if (replaceUrl === "iframe")
                iframe(template, iframeSrc, title, courseId);
            else if (replaceUrl === "discussion")
                discussion(template, courseId);
        })
        .catch(function (response) {
            // console.log(response.statusText);
        });

}