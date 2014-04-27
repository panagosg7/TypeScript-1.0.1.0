**This is a fork of the [TypeScript](https://typescript.codeplex.com/) compiler, a Scalable JavaScript variant with types, classes and modules.**

It has been modified to work as a front-end to the [language-ecmascript](https://github.com/UCSD-PL/language-ecmascript) and [RefScript](https://github.com/UCSD-PL/RefScript).
More information as to how to use it for this purpose can be found [here](https://github.com/UCSD-PL/RefScript).

This repo was forked off commit: a5ffa4c199a13936a312b7fa86f787863ecbed73 from http://typescript.codeplex.com/.
The rest of the history has not been included in this repo.


## Install

  npm install -g typescript


## Usage

  tsc hello.ts
  

## Build

1.  Install Node if you haven't already (http://nodejs.org/)
2.  Install Jake, the tool we use to build our compiler (https://github.com/mde/jake). To do this, run "npm install -g jake".
3.  To use jake, run one of the following commands: 
    - jake local - This builds the compiler. The output is in built/local in the public directory 
    - jake clean - deletes the build compiler 
    - jake LKG - This replaces the LKG (last known good) version of the compiler with the built one.
        - This is a bootstrapping step to be executed whenever the built compiler reaches a stable state.
    - jake tests - This builds the test infrastructure, using the built compiler. 
    - jake runtests - This runs the tests, using the built compiler and built test infrastructure. 
        - You can also override the host or specify a test for this command. Use host=<hostName> or tests=<testPath>. 
    - jake baseline-accept - This replaces the baseline test results with the results obtained from jake runtests. 
    - jake tsc - This only builds the compiler (no services).
    - jake -T lists the above commands. 


## Adding New Diagnostics

1.	Just add them in the JSON file: `src/compiler/resources/diagnosticMessages.json`

2.	And then run the `generate.sh` script in the same folder. This will create these files:
	    - `diagnosticInformationMap.generated.ts`
	    - `diagnosticCode.generated.ts`

3.	Check the renaming of the string you added as a diagnostic to access the 
		relevant entry.




In the older version you would need to add diagnostic information in ALL the following:
    - diagnosticInformationMap.generated.ts
    - diagnosticMessages.json
    - diagnosticCode.generated.ts


## Projects that use TypeScript

0.	TypeScript Compiler

1.	TouchDevelop (link: https://www.touchdevelop.com/)

2.	jRIAppTS (link: https://github.com/BBGONE/jRIAppTS)

3.	LeapMotionTS (link: https://github.com/logotype/LeapMotionTS)

4.	Turbulenz (link: https://github.com/turbulenz/turbulenz_engine)

5.	GrindFest (link: https://github.com/GrindFest/GrindFest)


