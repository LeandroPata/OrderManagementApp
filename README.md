# Order Management App Project

This is a personal project created to improve order management.

It was developed with the intent to accurately, quickly and easily check current orders, what orders are not completed yet, are ready to be delivered or already delivered, what products are needed to fulfill current orders and other features.

## Features

### Main Features

- Add Clients, Products and Orders to a database
- Show orders from a specific client
- Show orders of a specific product
- Show the quantities of all products currently ordered
- Import/Export of clients, products and orders databases to/from .csv files in order to facilitate sharing and/or editing

### General Features

- Authentication to allow only trusted accounts to access the information (ability to freely create an account would be removed in a real world implementation or require email/account verification before allowing login)
- Changing Password
- Translation to different languages
- Light/Dark Theme
- Checking for updates (as it is a personal project, publishing in App Stores isn't feasible, so a different update checking system was implemented, not possible for iOS)

## Tecnical Notes

- All searchs of clients/products have a "fuzzy searching" implementation with a "hint" list to help the user find the intended client/product
- Update checking was implemented by having the APKs stored in Firebase Storage and then cross-checking the app's current version and the stored APKs version, downloading and updating if a more recent version is available (this isn't possible in iOS, as it doesn't allow sideloading)
- Environment variables are used, so in any reproduction of this project setting them in a .env file (to run locally) and/or Expo (or other building framework) will be necessary. This is an .env example:

```
# Firebase Config Files
GOOGLE_SERVICES_JSON='./google-services.json'
GOOGLE_SERVICES_PLIST='./GoogleService-Info.plist'
```

## Tech used

This project was developed with the [React Native](https://reactnative.dev/) [Expo](https://expo.dev/) framework, using a mix of Typescript, CSS and some Javascript.

All cloud features are build using [Firebase](https://firebase.google.com/). The main Firebase features used are:

- [Firebase Authentication](https://firebase.google.com/products/auth) for user accounts authentication
- [Firestore](https://firebase.google.com/products/firestore) as a NoSQL DataBase to store data documents
- [Firebase Cloud Storage](https://firebase.google.com/products/storage) to store larger files (data exports and updates)

Some of the main packages used are:

- [Fuse.js](https://www.fusejs.io/) for fuzzy search
- [i18next](https://www.i18next.com/) for translation implementation
- [React Native Paper](https://reactnativepaper.com/) for theming and appearance customization
- All other packages are present in package.json

## Developed by

- [Leandro Pata](https://github.com/LeandroPata)
