import { injectable } from "inversify";
const { exec } = require('child_process');
const yaml = require('js-yaml');
const fs = require('fs');

const organization = 'eliosmirror'

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
   * Run an application
   * @param name Application's name
   */
  checkContainerExistence(name: string) {
    return this._executeCommand(`docker ps -af "name=${name}" --format '{{.Names}}'`);
  }

  /**
   * Stop the application and delete related container
   * @param name Application's name
   */
  async stopAndDeleteAppContainer(name: string) {
    return this.checkContainerExistence(name).then((exist) => {
      if (exist != undefined) {
        return this._executeCommand(`docker stop ${name}`).then(() => {
          return this._executeCommand(`docker rm ${name}`).then(() => {
            console.log(`[${name}] Container deleted`);
          })
        })
      }
    })
  }

  /**
   * Delete an application image and container.
   * The application is stopped if running.
   * @param name Application's name
   */
  async deleteAppImage(name: string) {
    return this.stopAndDeleteAppContainer(name).then(async () => {
      return this._executeCommand(`docker rmi ${organization}/${name}:latest`).then(() => {
        console.log(`[${organization}/${name}] Image deleted`);
      })
    })
  }

  /**
   * Check if application exist then delete it's image and container
   * The application is stopped if running.
   * @param name Application's name
   */
  async checkAndDeleteAppImage(name: string) {
    return this._executeCommand(`docker images -q ${organization}/${name}:latest`).then((stdout) => {
      if (stdout) {
        console.log(`[${organization}/${name}] Image exist, deleting...`);
        return this.deleteAppImage(name).catch((err) => {
        });
      }
    })
  }

  /**
   * Build a docker image of an application
   * @param path Path of the application directory
   * @param name Name of the application
   */
  async buildAppImage(path: string, name: string) {
    return this.checkAndDeleteAppImage(name).then(async () => {
      let config = yaml.safeLoad(fs.readFileSync(path + '/mirror.yml', 'utf8'));
      let buildCmd = `docker build --tag ${organization}/${name}:latest -f dockerfiles/Dockerfile_${config['language']} ${path}`;

      console.log(`[${organization}/${name}] Start Building image`);
      return this._executeCommand(buildCmd).then(() => {
        console.log(`[${organization}/${name}] Image build finished`);
      })
    })
  }

  /**
   * Run an application
   * @param name Application's name
   */
  async runApp(name: string) {
    return this.checkContainerExistence(name).then(async (exist) => {
      if (exist == undefined) {
        let runCmd = `docker run -d --mount type=bind,source=/tmp/elios_mirror,target=/tmp/elios_mirror --name "${name}" ${organization}/${name}:latest`;
        return this._executeCommand(runCmd).then(() => {
          console.log(`[${name}] Running`);
        })
      } else {
        return this._executeCommand(`docker start ${name}`).then(() => {
          console.log(`[${name}] Started`);
        })
      }
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
   * Update docker image
   * @param name Name of the application
   */
  async installOrUpdateApp(name: string) {
    return this._executeCommand(`docker pull ${organization}/${name}:latest`);
  }

  /**
   * Stop a running application
   * @param name Name of the application
   */
  async stopApp(name: string) {
    return this._executeCommand(`docker stop ${name}`);
  }

  /**
   * Pause a running application
   * @param name 
   */
  async pauseApp(name: string) {
    return this._executeCommand(`docker pause ${name}`);
  }

  /**
   * Resume a previously paused application
   * @param name Name of the application
   */
  async resumeApp(name: string) {
    return this._executeCommand(`docker unpause ${name}`);
  }
}