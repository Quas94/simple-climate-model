A web application written for the UNSW CCRC (Climate Change Research Centre). Provides a simple interface through which one can manipulate inputs such as carbon dioxide emissions, methane, aerosols, solar variability (and more!) in order to calculate outputs including changes in surface temperature, deep ocean temperature, etc.

Written in HTML5/JavaScript utilising the following dependencies:
- Angular.js (https://angularjs.org/)
- Chartist.js (https://gionkunz.github.io/chartist-js/)

Milestones:
- Model Port [done]
- App Skeleton [done]
- Polished Basic/Intermediate Functionality [done]
- Advanced Features

Imminent TODO list:
- revisit method of fetching default scenarios when custom scenarios are possible: make sure defaults aren't modified
- temperatures for some scenarios are bugged, sometimes entire app's data gets messed up and bugged. something to do with
  the 'albedo increase' scenario?
- check if pH chart is bugged - always peaks really early and levels off

- adding additional years to scenario inputs
  -- should add year range to details panel
- create blank canvases for custom scenarios with no base: done but buggy. ISSUES:
  -- the last few years cut off? (eg. 2,000 -> 1,997) noticeable when editing input data
  -- some output graphs have no output at all (temperatures and a few others) - anything to do with rcphi?

Later TODO list:
- confirm which TSI and alb datasets to use, currently using 'defaults' (app.js -> createScenario, ~line 510)
- revisit popup windows name detection once modifying scenarios is working
- chart axis labels, legend
- resizing issues to do with page layout and graph display (including popups)
- ability to save/load global variables set, and make it clearer that global variables are global across scenarios? maybe rename them to 'Simulation variables' and allow them to be attached to scenarios (and thus vary between)
- validation of global variables when user modifies them
- outputting results in savable data format
