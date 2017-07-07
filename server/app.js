'use strict';

const Path = require('path');
const Hapi = require('hapi');
const Hoek = require('hoek');

const ArchComponent = require('./model/archcomponent');



const server = new Hapi.Server({
  connections: {
    routes: {
      files: {
        relativeTo: Path.join(__dirname, 'dist')
      }
    }
  },
  debug: {
    log: ['error'],
    request: ['error']
  }
});

server.connection({ port: 3000, host: 'localhost' });

/*
  Register Plugins
*/
//Static Content Plugin
server.register(require('inert'), (err) =>{
  Hoek.assert(!err, err);
});
//Views Rendering Plugin + Configuration
server.register(require('vision'), (err) => {
  Hoek.assert(!err, err);
  server.views({
      engines: {
          hbs: require('handlebars')
      },
      relativeTo: __dirname,
      path: 'templates',
      layout: true,
      layoutPath: 'templates/layout',
  });
})
//ORM Dogwater/Waterline
const Dogwater = require('dogwater');
const SailsDisk = require('sails-disk');
server.register({
  register: Dogwater,
  options: {
    adapters: {
      disk: SailsDisk
    },
    connections: {
      primary: { adapter: 'disk' }
    },
    models: require('./model'),
  }
}, (err) => {
  Hoek.assert(!err, err);
  // Define a model using a connection declared above
});

/*
  Register routes
*/
var routes = require('./routes');
server.route(routes);


server.start((err) => {

    if (err) {
        throw err;
    }

    // const ComponentType = server.collections().componenttype;
    // ComponentType.create([
    //   {name: 'System'},
    //   {name: 'Data'}
    // ]).then(() => {
    //
    //         console.log(`Go find some dogs at ${server.info.uri}`);
    //     })
    //     .catch((err) => {
    //
    //         console.error(err);
    //     });

    console.log(`Server running at: ${server.info.uri}`);
});
