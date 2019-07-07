# ![UTab Logo](./images/favicon-32x32(transparent).png)UTab

Chrome extension that manages and saves url addresses, tabs, and bookmarks

## Features
- Save url address with single click
- Create, delete, edit url addresses and groups
- Create & edit url address name
- Easily migrate data to & from computers for updates
- Drag and drop url addresses to & from groups
- Save all the tabs by just clicking once
- Sync with bookmarks for easy-access to websites!

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

Recent version of Chrome browser

### Installing

1. Open your terminal/git bash
2. Download the git repository with the following command:
```
git clone https://github.com/jwkim960315/UTab
```
3. Open your Chrome browser
4. Open the Extension Management page by navigating to <chrome://extensions>.
    - The Extension Management page can also be opened by clicking on the Chrome menu, hovering over More Tools then selecting Extensions.
5. Enable Developer Mode by clicking the toggle switch next to Developer mode.
6. Click the LOAD UNPACKED button and select the extension directory.

### How to Use It

* Left-click icon to open up popup page.
* Click *Save* button to save a current page's url address
* Right-click icon and click *Open management page*
    * You can manage url addresses on this page
* You can save all url addresses on current browser window
* You can switch colors of groups on *index page* by:
    * Click on settings icon (positioned on the right corner of each group)
    * Click on *change color*
    * Select any color you want
    * Click disk icon to save the color
* You can overwrite/copy storage data by:
    * Right-click icon
    * Click *options* (probably in your native language)
    * Click *Copy* if you want to copy the storage data
    * Paste the storage data and click *Save* if you want to overwrite storage data

### Testing

I have yet to test all the functionalities, so please report any issues.

## Built With

* [jQuery](https://jquery.com/) - DOM manipulation JS library
* [TinyColor](https://bgrins.github.io/TinyColor/) - color manipulation & conversion JS library
* [Farbtastic](https://acko.net/blog/farbtastic-jquery-color-picker-plug-in/) - jQuery plug-in as a color picker
* [NotifyJS](https://notifyjs.jpillora.com/) - jQuery plug-in for notifications
* [MaterializeCSS](https://materializecss.com/) - A modern responsive front-end framework based on Material Design
* [SortableJS](http://sortablejs.github.io/Sortable/) - JavaScript library for reorderable drag-and-drop lists
* [MarkJS](https://markjs.io/) - JavaScript library for highlighting search terms

## Caution

* It has designed to be a uni-direction sync (chrome local storage -> bookmarks)
    * Modifying bookmark will not alter any data on management page

## What's Next
* Check for any reports on malfunctions/deficiencies & fix them
* Planning to publish on Chrome Web Store on July 15th, 2019

## Authors

* **Sean Kim** - [github](https://github.com/jwkim960315)

## Thanks To

* **Alex Hong** - [github](https://github.com/alexhongs)
    * for giving me advice on UX

