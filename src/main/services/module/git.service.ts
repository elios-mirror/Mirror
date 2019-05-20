import {injectable} from "inversify";
import {IModuleRepository} from "./module.service";
import LocalModuleService from "./local.module.service";

const fs = require('fs');
const path = require('path');
let NodeGit: any = null;
if (process.env.NODE_ENV !== "testing") {
    NodeGit = require('nodegit');
}

@injectable()
export default class GitService {
    constructor(private localModuleService: LocalModuleService) {
    }

    /**
     * Checkout module version to commit hash
     *
     * @param repo
     * @param {string} commit
     * @returns {PromiseLike<T>}
     */
    checkOut(repo: any, commit: string) {
        return NodeGit.Reference
            .dwim(repo, 'refs/heads/master')
            .then(function (ref: any) {
                return ref.peel(NodeGit.Object.TYPE.COMMIT)
            })
            .then(function (ref: any) {
                return repo.getCommit(commit)
            })
            .then(function (commit: any) {
                return NodeGit.Checkout
                    .tree(repo, commit, {checkoutStrategy: NodeGit.Checkout.STRATEGY.SAFE})
                    .then(function () {
                        return repo.setHeadDetached(commit, repo.defaultSignature,
                            'Checkout: HEAD ' + commit.id())
                    })
            })
    }


    /**
     * Remove a module and clone this to update
     *
     * @param {IModuleRepository} module
     * @returns {Promise<any>}
     */
    pull(module: IModuleRepository) {
        return new Promise((resolve, reject) => {
            this.localModuleService.delete(module);
            this.clone(module).then(resolve).catch(reject);
        });
    }

    /**
     * Clone a module
     *
     * @param {IModuleRepository} module
     * @returns {Promise<any>}
     */
    clone(module: IModuleRepository) {
        this.localModuleService.delete(module);
        return new Promise((resolve, reject) => {
            NodeGit.Clone(module.repository, this.localModuleService.getLocal() + module.name + '-' + module.version).then((repository: any) => {
                console.log('Cloned ' + module.name + ' to ' + repository.workdir());
                if (module.commit) {
                    this.checkOut(repository, module.commit).then(() => {
                        repository.free();
                        resolve();
                    }).catch((err: any) => {
                        repository.free();
                        reject(err);
                    });
                } else {
                    repository.free();
                    resolve();
                }
            }).catch((err: any) => {
                reject(err);
            });
        });
    }
}