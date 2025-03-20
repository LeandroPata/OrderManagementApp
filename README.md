# Order Management App Project

This is a personal project created to improve order management.

It was developed with the intent to accurately, quickly and easily check current orders, what orders are not completed yet, are ready to be delivered or already delivered, the quantity of specific products needed to fulfill current orders and other features, while making the information available anywhere by storing it in a cloud database.

## Features

### Main Features

- Add Clients, Products and Orders to a cloud database;

<p align='middle'>
  <img align='top' src='assets/samples/addClient.png' alt = 'AddClient' width=190>
  <img align='top' src='assets/samples/addProduct.png' alt = 'AddProduct' width=190>
  <img align='top' src='assets/samples/addOrder.png' alt = 'AddOrder' width=190>
</p>

- Show orders from a specific client;

<p align='middle'>
  <img align='top' src='assets/samples/showClientOrder.png' alt = 'ShowClientOrder' width=190>
  <img align='top' src='assets/samples/showOrderDetails.png' alt = 'ShowOrderDetails' width=190>
</p>

- Show orders of a specific product;

<p align='middle'>
  <img align='top' src='assets/samples/showProductOrder.png' alt = 'ShowProductOrder' width=190>
  <img align='top' src='assets/samples/showProductOrderLandscape.png' alt = 'ShowProductOrderLandscape' height=350>
</p>

- Show the quantities of all products currently ordered;

<p align='middle'>
  <img align='top' src='assets/samples/showProductQuantity.png' alt = 'ShowProductQuantity' width=190>
</p>

- Updating a order's status(long pressing on a DataTable's row);
- Import/Export of clients, products and orders databases to/from .csv files in order to facilitate sharing and/or editing;

<p align='middle'>
  <img align='top' src='assets/samples/mainMenu.png' alt = 'MainMenu' width=190>
  <img align='top' src='assets/samples/addMenu.png' alt = 'AddMenu' width=190>
  <img align='top' src='assets/samples/showMenu.png' alt = 'ShowMenu' width=190>
  <img align='top' src='assets/samples/importExport.png' alt = 'ImportExportMenu' width=190>
</p>

### General Features

- Authentication to allow only trusted accounts to access the information (ability to freely create an account would be removed in a real world implementation or require email/account verification before allowing login);
- Changing Password;
- Translation to different languages;
- Light/Dark Theme;
- Checking for updates (as it is a personal project, publishing in App Stores isn't feasible, so a different update checking system was implemented, not possible for iOS);

<p align='middle'>
  <img align='top' src='assets/samples/drawerLight.png' alt = 'DrawerLight' width=190>
  <img align='top' src='assets/samples/drawerDark.png' alt = 'DrawerDark' width=190>
</p>

## Technical Notes

- Both portrait and landscape layouts are supported, as landscape layout significantly improves viewing information from the DataTables;
- As a common smartphone's screen width might not be enough to fully display the information from a DataTable's row, an alternative was implemented where clicking a DataTable's row will display all that row's information;
- All searches of clients/products have a "fuzzy searching" implementation with a "hint" list to help the user find the intended client/product;
- Update checking was implemented by having the APKs stored in Firebase Storage and then cross-checking the app's current version and the stored APKs version, downloading and updating if a more recent version is available (this isn't possible in iOS, as it doesn't allow sideloading);
- As all cloud functionalities (as is) require Firebase, any reproduction of this project will require setting up Firebase (more specifically the modules detailed in the next section) and adding both config files (google-services.json and GoogleService-Info.plist) to the project;
- Environment variables are used, so in any reproduction of this project setting them in a .env file (to run locally) and/or Expo (or other building framework) will be necessary. This is an .env example:

```
# Firebase Config Files
GOOGLE_SERVICES_JSON='./google-services.json'
GOOGLE_SERVICES_PLIST='./GoogleService-Info.plist'
```

## Tech used

This project was developed with the [React Native](https://reactnative.dev/) [Expo](https://expo.dev/) framework, using a mix of Typescript, CSS and some Javascript.

All cloud features are build using [Firebase](https://firebase.google.com/). The main Firebase features used are:

- [Firebase Authentication](https://firebase.google.com/products/auth) for user accounts authentication;
- [Firestore](https://firebase.google.com/products/firestore) as a NoSQL DataBase to store data documents;
- [Firebase Cloud Storage](https://firebase.google.com/products/storage) to store larger files (data exports and updates);

Some of the main packages used are:

- [Fuse.js](https://www.fusejs.io/) for fuzzy searching;
- [i18next](https://www.i18next.com/) for translation implementation;
- [React Native Paper](https://reactnativepaper.com/) for theming and appearance customization
- All other packages are present in package.json;

## Developed by

- [Leandro Pata](https://github.com/LeandroPata)
