<h1 align="center">Welcome to meadowlark 👋</h1>
<p>
  <img src="https://img.shields.io/badge/version-0.0.1-blue.svg?cacheSeconds=2592000" />
  <a href="https://github.com/probhakarroy/meadowlark#readme">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" target="_blank" />
  </a>
  <a href="https://github.com/probhakarroy/meadowlark/graphs/commit-activity">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" target="_blank" />
  </a>
  <a href="https://github.com/probhakarroy/meadowlark/blob/master/LICENSE">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" target="_blank" />
  </a>
  <a href="https://travis-ci.com/probhakarroy/meadowlark">
    <img src="https://travis-ci.com/probhakarroy/meadowlark.svg?branch=master" alt="Build Status" >
  </a>
</p>

> site for meadowlark travel agency

### 🏠 [Homepage](https://probhakarroy.github.io/meadowlark/)

## Install

```sh
npm install
```

## Add Credentials

Create lib/credentials.js with :-
```sh
module.exports = {
    cookie_secret: 'Cookie Secret String',
    gmail : {
        user : 'Email Username',
        password : 'Password',
    },
    gcs : {
        project_id : 'Google Cloud Storage Project Id',
        key: 'path to your private key for your Google Cloud Storage',
    },
    mongo : {
        development : {
            connection_string: 'Connection String for your development MongoDb Atlas Database'
        },
        production : {
            connection_string: 'Connection String for your production MongoDb Atlas Database'
        },
    }
};
```

## Usage

```sh
npm run start
```

## Run tests

```sh
npm run test
```

## Author

👤 **Probhakar Roy**

* Github: [@probhakarroy](https://github.com/probhakarroy)

## 🤝 Contributing

Contributions, issues and feature requests are welcome !<br />Feel free to check [issues page](https://github.com/probhakarroy/meadowlark/issues).

## Show your support

Give a ⭐️ if this project helped you !

## 📝 License

Copyright © 2019 [Probhakar Roy](https://github.com/probhakarroy).<br />
This project is [MIT](https://github.com/probhakarroy/meadowlark/blob/master/LICENSE) licensed.

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_