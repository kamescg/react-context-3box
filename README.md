# React Context 3Box

[![Build Status](https://travis-ci.org/flexdinesh/npm-module-boilerplate.svg?branch=master)](https://travis-ci.org/flexdinesh/npm-module-boilerplate) [![dependencies Status](https://david-dm.org/flexdinesh/npm-module-boilerplate/status.svg)](https://david-dm.org/flexdinesh/npm-module-boilerplate) [![devDependencies Status](https://david-dm.org/flexdinesh/npm-module-boilerplate/dev-status.svg)](https://david-dm.org/flexdinesh/npm-module-boilerplate?type=dev) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

The `react-context-3box` module wraps core 3Box functionality like logging in/out as a decentralized identity, reading/writing to personal storage, and commenting on threads.

Additionally the `react-context-3box` module includes state management for profiles, spaces, threads, verifications and read/write requests. Data returned from requests are saved in the `context` state to avoid requesting the same data multiple times.

# Features
React state management for 3Box decentralized identity and storage.

### Read/Write Request Log
By default 3Box (3box.js) provides `get` and `set` methods that can be run without user consent or knowledge once a user has logged in. To inform users of reading/writing to personal storage, the request log tracks read and write requests. The requests include metadata like access type (public or private) and whether to access the primary profile or a space. 

[3Box Request Log Example](https://i.imgur.com/rZ4ACvI.png)

User's can review incoming requests and decide to either ignore, confirm or reject the requests.

#### Add Request (addRequest)
Add a new read or write request to the `request` log.

#### Confirm Request (confirmRequest)
Confirm a request in the `request` log.

#### Reject Request (rejectRequest)
Reject a request in the the `request` log.


### Append Data
The 3Box (3box.js) library includes `set` and `setMultiple` methods to write data to personal storage. An `append` method has been added to now more easily add data to existing fields, without overwriting the previous values. 


# Commands
- `npm run clean` - Remove `lib/` directory
- `npm test` - Run tests with linting and coverage results.
- `npm test:only` - Run tests without linting or coverage.
- `npm test:watch` - You can even re-run tests on file changes!
- `npm test:prod` - Run tests with minified code.
- `npm run test:examples` - Test written examples on pure JS for better understanding module usage.
- `npm run lint` - Run ESlint with airbnb-config
- `npm run cover` - Get coverage report for your code.
- `npm run build` - Babel will transpile ES6 => ES5 and minify the code.
- `npm run prepublish` - Hook for npm. Do all the checks before publishing your module.

# Installation
Just clone this repo and remove `.git` folder.


# License

MIT © Kames
