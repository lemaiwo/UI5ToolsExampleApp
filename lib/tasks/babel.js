const colors = require('colors');
const emoji = require('node-emoji');
const babel = require("@babel/core");
const resourceFactory = require("@ui5/fs").resourceFactory;
const fs = require('fs');
const path = require("path");
const icons = ["hatching_chick", "baby_chick", "hatched_chick", "bird"];
const baseLogTask = "info".green + " babel:".magenta;
/**
 * Custom task example
 *
 * @param {Object} parameters Parameters
 * @param {module:@ui5/fs.DuplexCollection} parameters.workspace DuplexCollection to read and write files
 * @param {module:@ui5/fs.AbstractReader} parameters.dependencies Reader or Collection to read dependency files
 * @param {Object} parameters.options Options
 * @param {string} parameters.options.projectName Project name
 * @param {string} [parameters.options.configuration] Task configuration if given in ui5.yaml
 * @returns {Promise<undefined>} Promise resolving with <code>undefined</code> once data has been written
 */
module.exports = async function ({
    workspace,
    dependencies,
    options
}) {
    const jsResources = await workspace.byGlob("**/*.js");
    
    console.info(baseLogTask + "Start tranformation".green + emoji.get('palm_tree'));
    const filteredResources = jsResources.filter(resource => {
        return (!resource.getPath().includes("/libs/"));
    });
    let iconIdx = 0;
    const transformCode = async resource => {
        var source = await resource.getString();
        console.info(baseLogTask + "Transforming:".blue + emoji.get(icons[iconIdx]) + resource.getPath());
        iconIdx = iconIdx >= (icons.length - 1) ? 0 : ++iconIdx;
        var {code,map,ast} = babel.transformSync(source, {
            presets: [
                ["@babel/preset-env"]
            ],
            plugins: ["@babel/plugin-proposal-object-rest-spread", ["@babel/plugin-transform-modules-commonjs", {
                "strictMode": false
            }]]
        });
        resource.setString(code);
        return resource;
    };
    const transformedResources = await Promise.all(filteredResources.map(resource => transformCode(resource)));
    console.info(baseLogTask + "Tranformation finished".green + emoji.get('palm_tree'));

    console.info(baseLogTask + "Start updating files".green);
    await Promise.all(transformedResources.map((resource) => {
        return workspace.write(resource);
    }));
    console.info(baseLogTask + "Updating files finished".green);

    console.info(baseLogTask + "Babel task finished" + emoji.get('white_check_mark'))
};
