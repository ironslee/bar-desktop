# Barista Desktop application for coffeeshop

This application is designed to automate the work of food service establishments (restaurants, cafes, bars). Printing on POS printers is implemented according to the following scheme:

- **STATION** printer (mandatory)
- Additional printers: **BAR** and **KITCHEN**

Printing is distributed by categories:

- **ready** - printed to **STATION**
- **bar** - printed to **BAR**
- **kitchen** - printed to **KITCHEN**

If one or more additional printers are missing, printing will default to the **STATION** printer.

---

## Requirements

Before running the project, ensure you have the following dependencies installed:

- [Node.js](https://nodejs.org/) (for running the project)
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/) (for managing dependencies)

---

## Installation

1. Clone the repository:

   ```bash
   git clone https://your-repository-url.git
   cd your-project-folder
   Install the dependencies:
   ```

bash

npm install

# or

yarn install
Configuration
Before running the application, you need to configure the API server and the local database.

1. Setting the API URL
   You need to specify the API server's URL in two places:

In the main-constants.js file
In the renderer-constants.js file
Open both of these files and replace the apiUrl value with your server's address. For example:

javascript

// main-constants.js
export const apiUrl = 'http://your-api-url.com';

// renderer-constants.js
export const apiUrl = 'http://your-api-url.com';

2. Local Database
   The local database is stored in the file assets/database.db. Ensure the database is available in the assets folder of your project. If the database is missing, you will need to create it or download the corresponding file.

Running the Project
Once you have configured the project, you can run it:

For development:
bash

npm run dev

# or

yarn dev

To build the project:
bash

npm run build

# or

yarn build

Project Structure
assets/ — Folder with local resources, including the database.
main-constants.js — File with settings for the main Electron process.
renderer-constants.js — File with settings for the renderer process.

Author
Name: ironslee
GitHub: https://github.com/ironslee
