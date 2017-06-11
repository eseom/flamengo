# overview
### :dancer: "*I just wanna QUERY*"

If you like `psql` and `terminal`, you should type same queries again and again, If you like `web` also, you could execute queries, explorer results conviniently with **Flamengo**.

[![npm version][npm-badge]][npm-url]

# components
* vuejs
* hapijs - [halis](https://github.com/eseom/hails)
* redis
* es7 babel
* webpack2
* sequelize

# usage
```
npm install -g flamengo
REDIS=redis://:dev@localhost:16379/9 PORT=8080 flamengo
```

# screenshot
```
# preparing
```

# devleopment process
```
npm install -g yarn

git clone https://github.com/eseom/flamengo
cd flamengo
yarn
cp settings.sample.js settings.js
# edit settings.js
yarn dev
open http://localhost:3000
```

[npm-url]: https://www.npmjs.com/package/flamengo
[npm-badge]: https://img.shields.io/npm/v/flamengo.svg