'use strict';

var rmdir = require('rimraf');
var fs = require('fs-extra');
var path = require('path');

/**
 * This contains all the core commands that kalabox can run on every machine
 */

module.exports = function(kbox) {

  var events = kbox.core.events;

  kbox.whenApp(function(app) {

    kbox.tasks.add(function(task) {
      task.path = [app.name, 'uninstall'];
      task.description = 'Uninstall an installed kbox application';
      task.options.push({
        name: 'purge',
        alias: 'p',
        kind: 'boolean',
        description: 'Also removes data container and code directory.'
      });
      task.func = function(done) {
        // @todo: This needs to happen inside of uninstall as an option at some point
        // Do this even ONLY when uninstall is run
        // @todo: what would this do on the GUI?
        if (this.options.purge) {
          events.on('pre-uninstall', function(app, done) {
            var containerIdFile = path.join(app.config.appCidsRoot, 'data');
            var containerId;
            if (fs.existsSync(containerIdFile)) {
              containerId = fs.readFileSync(containerIdFile, 'utf8');
            }
            kbox.engine.remove(containerId, function() {
              fs.unlinkSync(containerIdFile);
              console.log('Removing the codez.');
              rmdir(app.config.codeRoot, function(err) {
                if (err) {
                  done(err);
                }
                else {
                  done();
                }
              });
            });
          });
        }

        // Actually do the uninstall
        kbox.app.uninstall(app, done);
      };
    });

  });

};
