# Boat owner organization tool

## GOAL
The goal is to build a tool to manage a multiple boats

## Requirements
* Documents: This will be used to save documents relative to the boat like maintenance manuals, it should allow to upload files in the usual formats
* maintenance history: a list where I can enter a date, a description of the job done and upload a receipt.
* TO-DO lists: for each boat there must be a todo list
* shopping list: a list where I can put stuff that need to be purchased before the next trip

### Technical Requirements
This application will be composed of 3 components:
* Backend: written in python as a fast api application, use UV for dependency management
* DB: let's use postgres
* Frontend: Feel free to use whichever stack fits the requirements the most

The application will be hosted with podman podlet.
During development I need a justfile with 3 commands:
* backend: build and deploy the backend container
* db: deploy a postgres instance
* frontend: build and deploy the frontend container

These commands will alllow me to deploy components individually during development.

### UX/UI
The UX/UI of the application should be very simple and intuitive.
The locale is Europe, so use the DD-MM-YYYY HH:MM standard.
In the homepage the owner should be 


# REVISIONS
## 1:
* die shopping list should be a bit more advanced: I need to enter a name of an item to buy, a description and eventually a link
* The document section should allow more than simply upload files, I want the possibility to make an entry that has:
  * title
  * description
  * eventually a document
Also add a case insensitive search function to the documents session so that I can quickly retrieve information

## 2:
Add the favicon.svg to the project


## 3:
I want to be able to modify every entry: todo, shopping maintencance and documents. Ideally I can click on an entry and I can modify the entry in a pop up screen


## 4:
let's elaborate further on the revisions in 3:
currently the preview of each entry displays the description in a funky way meaning that the text is on a single line. let's make it better. the preview will be similar to the current one having the title of the entry and only when clicking on it, the pop up will display it correctly (rendering the text as markdown).
Currently the pop up automatically allows the user to edit the entry, instead I want first a read-only page that displays title, description and attachments plus a button to modify the entry, only if that button is pressed, the popup will allow the user to modify the entry


## 5:
* the maintenance looks funny, let's add a title there as well so the preview of the entry shows date and a title
* let's also add a new tab: log book. Here we are going to have the possibility to enter a date, crew members, start and goal of the trip and a description
* make the page responsive so that it can be used with a smartphone

## 6:
for this revision modify the way maintenance entries are displayed: currently we have TITLE - date. I would like it the other way around date - title.
Also make sure that entries are ordered by date in descending order, so the newest entries are on the top. whenever a new entry is added, it will be displayed in the right order based on the date entered by the user


## 7:
we currently have only one user, let's add users and auth based on a simple htpswd file


## 8:
on a mobile phone I cannot open the pdf attached files, make it so that even on a smartphone a pdf reader is shown
