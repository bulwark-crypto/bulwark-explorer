# BlockEx
Simple block explorer system.

__Under active development and subject to rapid sudden change.__

## Reqiured
This repo uses `git`, `mongodb`, `node`, `yarn`, `vi` or `vim`, and should be installed globally before continuing or changed will be needed below using your best judgement.

## Install
`git clone https://github.com/dustinengle/blockex.git` - copy repo to local folder.

`cd blockex` - change into project directory.

`yarn install` - install packages used by the system.

## Configure
#### BlockEx API Configuration
`cp config.js.template config.js` - setup configuration using template.

`vi config.js` - replace with local values.

#### Database Configuration
`sudo mongod` - start mongodb, if not running.

`mongo` - connect using mongo client.

`use blockex` - to switch to database name.

`db.createUser( { user: "blockexuser", pwd: "Explorer!1", roles: [ "readWrite" ] } )` - create a user with the values stored in the `config.js` file from above.

#### Crontab
The following automated tasks are currently setup for BlockEx.  

`yarn run cron:block` - will sync blocks and transactions by storing them in the database.

`yarn run cron:coin` - will coin related information like price and supply from coinmarketcap.com.

`yarn run cron:masternode` - will update the masternodes list in the database.

`yarn run cron:peer` - gather the list of peers and their IP information.

__Note:__ it is recommended to run `yarn run cron:block >> ./tmp/block.log` the first time manually.  The initial run will download the whole blockchain and put it into the database.  This can possibly take anywhere from minutes to hours depending on the size of the blockchain and other factors like hardware, bandwidth, etc.

Before setting up the crontab please build the cron tasks by running `yarn run build:cron`.

To setup the crontab please see run `crontab -e` to edit the crontab and paste the following lines:
```
*/1 * * * * cd /path/to/blockex && /path/to/node ./dist/cron/block.js >> ./tmp/block.log
*/5 * * * * cd /path/to/blockex && /path/to/node ./dist/cron/coin.js >> ./tmp/coin.log
0 * * * * cd /path/to/blockex && /path/to/node ./dist/cron/peer.js >> ./tmp/peer.log
0 * * * * cd /path/to/blockex && /path/to/node ./dist/cron/masternode.js >> ./tmp/masternode.log
```

## Build
At this time only the client web interface needs to be built using webpack and this can be done by running `yarn run build:web`.  This will bundle the application and put it in the `/public` folder for delivery.

## Run
`sudo mongod` - start mongodb if not already running.

`yarn run start:api` - will start the api.

`yarn run start:web` - will start the web, open browser [http://localhost:8080](http://localhost:8080).

## Test
`yarn run test:client` - will run the client side tests.

`yarn run test:server` - will test the rpc connection, database connection, and api endpoints.

## TODO
- Tests!!! - write those tests!
- API endpoints - complete endpoints and add compatibility with `https://github.com/iquidus/explorer` endpoints.
- FE services - connect with api.
- FE UI - complete components and style.
- Install script that will setup `config.js`.
- Cluster support for api.
- Cron locking with `/tmp` folder.
