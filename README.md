A web application written for the UNSW CCRC (Climate Change Research Centre). Provides a simple interface through which one can manipulate inputs such as carbon dioxide emissions, methane, aerosols, solar variability (and more!) in order to calculate outputs including changes in surface temperature, deep ocean temperature, etc.

Written in HTML5/JavaScript utilising the following dependencies:
- Angular.js (https://angularjs.org/)
- Chartist.js (https://gionkunz.github.io/chartist-js/)

Milestones:
- Model Port [done]
- App Skeleton [done]
- Polished Basic/Intermediate Functionality [done]
- Advanced Features

Bugs list:
- fix year increments - caused by year endings that aren't quite right (see default scenario years range)

To-do list:
- chart axis labels, legend
- outputting results in savable data format
- ability to save/load global variables set, and make it clearer that global variables are global across scenarios? maybe rename them to 'Simulation variables' and allow them to be attached to scenarios (and thus vary between)
- validation of global variables when user modifies them
- revisit popup windows name detection once modifying scenarios is working
- resizing issues to do with page layout and graph display (including popups)
