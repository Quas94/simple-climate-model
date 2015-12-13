A web application written for the UNSW CCRC (Climate Change Research Centre). Provides a simple interface through which one can manipulate inputs such as carbon dioxide emissions, methane, aerosols, solar variability (and more!) in order to calculate outputs including changes in surface temperature, deep ocean temperature, etc.

Written in HTML5/JavaScript utilising the following dependencies:
- Angular.js (https://angularjs.org/)
- Chartist.js (https://gionkunz.github.io/chartist-js/)

Milestones:
- Model Port [done]
- App Skeleton [done]
- Polished Basic/Intermediate Functionality
- Advanced Features

Templates of interest:
- http://themicon.co/theme/angle/v3.2/backend-angular/#

Important TODO list:
- reduce chart plotting delay by using Worker thread to interpolate number of points
- revisit popup windows name detection once modifying scenarios is working
- ability to save/load global variables set, and make it clearer that global variables are global across scenarios? maybe rename them to 'Simulation variables' and allow them to be attached to scenarios (and thus vary between)
- revisit method of etching default scenarios when custom scenarios are possible: make sure defaults aren't modified
- validation of global variables when user modifies them
