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
