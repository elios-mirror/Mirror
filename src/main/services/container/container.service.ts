import {injectable} from "inversify";
const { exec } = require('child_process');
const yaml = require('js-yaml');
const fs = require('fs');

@injectable()
export default class ContainerService {
  /**
   * Execute a system command
   * @param command Command to execute
   */
  private _executeCommand(command: string) {
    return new Promise((resolve, reject) => {
      exec(command, (err: string, stdout: string, stderr: string) => {
        if (err) {
          reject(err)
          return;
        } else if (stdout) {
          resolve(stdout);
        }
        resolve(undefined);
      });
    });
  }

  /**
   * Stop the application and delete related container
   * @param name Application's name
   */
  async stopAndDeleteAppContainer(name: string) {
    return this._executeCommand(`docker stop ${name}`).then(async () => {
      return this._executeCommand(`docker rm ${name}`).then(() => {
        console.log(`[${name}] Container deleted`);
      }).catch((err) => {
        console.error(`[${name}] Container delete error -> ${err}`);
      });
    });
  }

  /**
   * Delete an application image and container.
   * The application is stopped if running.
   * @param name Application's name
   */
  async deleteAppImage(name: string) {
    return this.stopAndDeleteAppContainer(name).then(async () => {
      return this._executeCommand(`docker rmi application:${name}`).then(() => {
        console.log(`[${name}] Image deleted`);
      }).catch((err) => {
        console.error(`[${name}] Image delete error -> ${err}`);
      });
    });
  }

  /**
   * Check if application exist then delete it's image and container
   * The application is stopped if running.
   * @param name Application's name
   */
  async checkAndDeleteAppImage(name: string) {
    return this._executeCommand(`docker images -q application:${name}`).then((stdout) => {
      if (stdout) {
        console.log(`[${name}] Image exist, deleting...`);
        return this.deleteAppImage(name);
      }
    });
  }

  /**
   * Build a docker image of an application
   * @param path Path of the application directory
   * @param name Name of the application
   */
  async buildAppImage(path: string, name: string) {
    return this.checkAndDeleteAppImage(name).then(async () => {
      let config = yaml.safeLoad(fs.readFileSync(path + '/mirror.yml', 'utf8'));
      let buildCmd = `docker build --tag application:${name} -f dockerfiles/Dockerfile_${config['language']} ../applications/${name}`;

      console.log(`[${name}] Start Building image`);
      return this._executeCommand(buildCmd).then(() => {
        console.log(`[${name}] Image build finished`);
      }).catch((err) => {
        console.error(`[${name}] Image build error -> ${err}`);
      });
    }).catch((err) => {
      console.error(`[${name}] AppImage existence check error -> ${err}`);
    });
  }

  /**
   * Run an application
   * @param name Application's name
   */
  async runApp(name: string) {
    return this._executeCommand(`docker ps -af "name=${name}" --format '{{.Names}}'`).then(async (stdout) => {
      if (stdout == undefined) {
        let runCmd = `docker run -d --mount type=bind,source=/tmp/${name}_mirror,target=/tmp/elios_mirror --mount type=bind,source=/tmp/${name}_sdk,target=/tmp/elios_sdk --name "${name}" application:${name}`;
        return this._executeCommand(runCmd).then(() => {
          console.log(`[${name}] Running`);
        }).catch((err) => {
          console.error(`[${name}] ${err}`);
        });
      } else {
        return this._executeCommand(`docker start ${name}`).then(() => {
          console.log(`[${name}] Started`);
        }).catch((err) => {
          console.error(`[${name}] ${err}`);
        });
      }
    }).catch((err) => {
      console.error(`[${name}] ${err}`);
    });
  }

  /**
   * Build a docker image of an application and run it
   * @param path Path of the application directory
   * @param name Name of the application
   */
  async buildAppImageAndRun(path: string, name: string) {
    return this.buildAppImage(path, name).then(async () => {
      return this.runApp(name);
    });
  }

  /**
   * Stop a running application
   * @param name Name of the application
   */
  stopApp(name: string) {
    return this._executeCommand(`docker stop ${name}`);
  }

  /**
   * Pause a running application
   * @param name 
   */
  pauseApp(name: string) {
    return this._executeCommand(`docker pause ${name}`);
  }

  /**
   * Resume a previously paused application
   * @param name Name of the application
   */
  resumeApp(name: string) {
    return this._executeCommand(`docker unpause ${name}`);
  }
}