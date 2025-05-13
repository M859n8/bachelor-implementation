# Frontend for Visual-Motor Coordination Tests
This is the frontend part of a cross-platform mobile application for assessing human perceptual-motor skills using interactive tests. Implemented with React Native and Expo.

### Core Dependencies
These are defined in package.json and installed automatically:

- React: 19.0.0
- React Native: 0.79.2
- Expo SDK: ^53.0.0
- React DOM (for web): 19.0.0
- React Native Web: ^0.20.0



## Project Structure

```bash
/
├── App.js                     # Entry point of the application
├── index.js                   # registers root component
├── StackNavigator.js          # Manages navigation between screens
├── package.json               # Project dependencies and scripts
├── app.json                   # Expo and app configuration
├── assets/                    # Static resources (images, fonts, etc.)
├── screens/                   # App screens (Home, Login, Tests, etc.)
├── screens/tests/             # Individual test screens
├── shared/                    # Reusable UI components (charts, modals, etc.)

```

---

## User Authentication 

The navigation system uses `react-navigation` and manages screen access based on authentication state.

- Unauthenticated Users:
	Only see the login screen. If no token is found in `AsyncStorage` or if the session is invalid, users are redirected here.

- Authenticated Users:
	Can access:
	- **Home screen**: User info, test list, previous results.
	- **Test screens**: Launch individual cognitive/motor tasks.

Authentication logic is centralized in a custom `AuthContext`, which performs the initial check and maintains a global `isAuthenticated` state. All components can access this state through the `AuthProvider`.

---

## Screens

### Home Screen 

Located at: `/screens/Home.js`
Upon mounting, `fetchUserData` retrieves user data from the backend and displays user information and graphs with tests results.

Graph visualization is implemented using Chart component: `/shared/Chart.js`.

### Test Screens 
Test interfaces are located in: `/screens/tests/`

**Utilities** 

* **`RulesModal`**
  Before each test begins, this modal provides users with a brief description and clear instructions specific to the task.

* **`sendRequest`**
  Used by all tests to send results to the backend after completion. It handles request formatting and response processing. If the submission is successful, the user is automatically redirected to `ResultsScreen.js`.

* **`Timer.js`**
  For tests involving time measurement (e.g., *Transferring Pennies*, *Block Design*), this component displays a live timer to the user during the task, helping track progress in real time.



**Test Implementations Overview**

1. **Bells Cancellation**

   * **Main implementation**: `/screens/tests/BellsCancellation.js`
   * **Object generation**: `/shared/GenerateBells.js` — dynamically generates bells and distractor objects based on screen size.

2. **Block Design**

   * **Main implementation**: `/screens/tests/BlockDesign.js`
   * **Block interaction**: `/shared/Block.js` — handles block rotation, color changes, and interaction logic.
   * **Grid layout**: `/shared/Grid.js` — generates the grid layout used for arranging blocks.

3. **Complex Figure**

   * **Main implementation**: `/screens/tests/ComplexFigure.js`
   * A drawing-based task focused on visual analysis and precise motor control.

4. **Line Tracking**

   * **Main implementation**: `/screens/tests/LineTracking.js`
   * Used to assess accuracy and consistency in following a predefined path.

5. **Transferring Pennies**

   * **Main implementation**: `/screens/tests/TransferringPennies.js`
   * **Coin interaction**: `/shared/Penny.js` — manages dragging, movement, and visual states of each coin.

6. **Visual Organization**

   * **Main implementation**: `/screens/tests/VisualOrganization.js`
   * **Choice rendering**: `/shared/ChoiceTask.js` — renders multiple-choice tasks with dynamic layouts.

---

## Run the frontend 
1. Installing dependencies. 
Go to the frontend directory:
```bash
npm install
```
2. Starting the server.
```bash
npx expo start

```
This command launches the Expo development server, allowing you to open the app in a web browser on localhost, or run it on a mobile simulator or physical device using the Expo Go app.

3. **Replace the API URL**

Make sure to update the API URL to point to your backend.
You need to replace the existing URL (for example, `http://192.168.0.12:5000/`) with the URL of your own backend, including the correct port. 