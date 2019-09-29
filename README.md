# Notes on Tic-Tac-Toe exercise

## Code Structure

I only created two files for the exercise, Game.jsx and Game.css. I didn't think the project needed any more 
complexity than that.

## Libraries

I used create-react-app to initialise the repository, including the git setup. I didn't use any extra React libraries; 
I considered at one stage using react-tooltip which I've used in the past but I decided I wanted all messages
to remain on screen.

## Design Decisions

There are only 3 component classes in the solution, `Game`, `GameBoard` and `GameCell`. 

`Game` contains all the logic regarding making moves and game state, `GameBoard` and `GameCell` serve 
only to extract the rendering code for the board itself. I did this to make changes to the layout more convenient, e.g.
a change from using a table to flex layout for the board.

In hindsight, the layout is somewhat old-fashioned; I put more time into the mechanics than the presentation.

# Create React App notes

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

