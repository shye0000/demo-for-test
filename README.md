QHS front app with react, redux, nodejs, webpack, babel, ESDoc, ESLint, docker
========================================================================================================

### [ Container Docker ]


Project deployment :

    $ docker-compose build
    $ docker-compose up -d
    $ docker exec -it qhs_front_dev bash

For ansible :

    $ docker-compose build --build-arg GITLAB_IP=82.225.240.34 react
    $ docker-compose up -d
    $ docker exec -it qhs_front_dev bash

### [ Manuelly install project dependencies ]

```
npm install
```

### [ Start development environment ]

```
npm run dev

Project url:                                localhost:8888
webpack-bundle-analyzer interface url:      localhost:8889
webpack-dev-server url:                     localhost:9000
```

### [ Run tests (coming soon, I hope...) ]

```
npm test
```

### [ Versionning project ]

```
npm run version-major
npm run version-minor
npm run version-patch
```

### [ Build project with production environment ]

```
npm run build-prod
npm run build-preprod
npm run build-demo
npm run build-test-prod
```

### [ Run node server for production ]

```
npm run start
```

### [ Generate documentations ]

```
npm run doc

// then open the index.html in your browser
google-chrome ./docs/index.html
```

### [ JavaScript inspections configurations ]

**First disable the default js inspections in PhpStorm:**

> File --> settings --> Inspections --> Javascript --> Uncheck all

**Then enable ESLint code quality tool:**

> File --> settings --> Languages & Frameworks --> JavaScript --> Code Quality Tools --> ESLint --> Enable

**For running ESLint check on JS files manually:**

```
./node_modules/.bin/eslint path/to/your/file.js

./node_modules/.bin/eslint ./src/**/*.js
```
([Learn more about ESLint command line interface](https://eslint.org/docs/user-guide/command-line-interface))

For more details of current ESLint configurations, check the file ".eslintrc.json".

### [ node server ]
port: 8888
### [ webpack BundleAnalyzerPlugin ]
port: 8999
### [ webpack-dev-server ]
port: 9000
    

Credits
-------

[Société WEBCENTRIC](http://wcentric.com)
