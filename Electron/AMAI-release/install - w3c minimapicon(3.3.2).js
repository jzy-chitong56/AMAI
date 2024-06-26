const fs = require("fs");
const path = require("path");
const spawnSync = require("child_process").spawnSync;
const arrayOfFiles = [];


/** uncomment to debbug */
// const ls = spawnSync(
//   `ls`,
//   [`.\\resources`,],
//   { encoding : `utf8` }
// );
// process.send(ls.stdout);

const getAllFiles = (dirPath, arrayOfFiles) => {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "\\" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "\\" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "\\", file));
    }
  })

  return arrayOfFiles;
}

const installOnDirectory = async () => {
  const args = process.argv.slice(2);
  const installCommander = (args[1] == 'true');
  const response = args[0];
  const ver = args[2];
  const icon = (args[2] == "REFORGED")
  process.send(`#### Installing AMAI for ${ver} ####`);

  // TODO: change to receive array of maps
  if (fs.statSync(response).isDirectory()) {
    // on directory
    getAllFiles(response, arrayOfFiles);
  } else {
    // on single map
    arrayOfFiles.push(response);
  }

  if (!fs.existsSync(`Scripts\\${ver}\\common.ai`)) {
    process.send(`ERROR: Cannot find ${process.cwd()}\\Scripts\\${ver}\\common.ai`)
    return
  }
  if (!fs.existsSync(`MPQEditor.exe`)) {
    process.send(`ERROR: Cannot find ${process.cwd()}\\MPQEditor.exe`)
    return
  }
  if (installCommander && !fs.existsSync(`Scripts\\Blizzard_${ver}.j`)) {
    process.send(`ERROR: Cannot find ${process.cwd()}\\Scripts\\blizzard_${ver}.j`)
    return
  }

  if(arrayOfFiles) {
    for (const file of arrayOfFiles) {
      /** uncomment to debbug */
      // process.send(`path.extname(file): ${path.extname(file)}`);

      const ext = path.extname(file).toLowerCase();

      if(ext.indexOf(`w3m`) >= 0 || ext.indexOf(`w3x`) >= 0) {
        process.send(`#### Installing ${ver} into file: ${file} ####`);
      } else {
        process.send(`skip file: ${file}`);
        continue;
      }

      try {
        fs.accessSync(file, fs.constants.W_OK)
      } catch (e) {
        process.send(`WARN: ${file} does not have write permissions so unable to install`);
        continue;
      }

      try {
        // execute same way how InstallTFTtoDir.pl

        const mpqEditor = spawnSync(
          `MPQEditor.exe`,
          [`htsize`, file, `128`],
          { encoding : `utf8` }
        );

        /** uncomment to debbug */
       // console.log('mpqEditor', mpqEditor.error);

        // spawnSync(`echo`, [`running execuMPQEditor ${file}`]);
        if (mpqEditor.status == 5) {
          process.send(`WARN: ${file} Failed to run mpqeditor htsize, you may not have valid permissions or are blocked by windows UAC. Ensure map files are not in a UAC protected location`)
          continue;
        }
        mpqEditor.error ?
          process.send(mpqEditor.error.message)
            : process.send(`Resize map hashtable size ${file}`);

        const f1AddToMPQ =  spawnSync(
          `MPQEditor.exe`,
          [
            'a',
            file,
            `Scripts\\${ver}\\*.ai`,
            `Scripts`
          ],
          { encoding : `utf8` }
        );

        /** uncomment to debbug */
       // console.log('f1AddToMPQ', f1AddToMPQ.error);

        // spawnSync(`echo`, [`running AddToMPQ 1 ${file}`]);
        // process.send(`running AddToMPQ 1 ${file}`);
        if (f1AddToMPQ.status == 5) {
          process.send(`WARN: ${file} Failed to add ai scripts, you may not have valid permissions or are blocked by windows UAC. Ensure map files are not in a UAC protected location`)
          continue;
        } else if (f1AddToMPQ.status > 0) {
          process.send(`WARN: ${file} Possibly failed to add ai scripts, Unknown error occurred: ${f1AddToMPQ.status}`)
          continue;
        }
        f1AddToMPQ.error ?
          process.send(f1AddToMPQ.error.message)
            : process.send(`Add ai scripts ${file}`);

        if (installCommander) {

          const f2AddToMPQ =  spawnSync(
            `MPQEditor.exe`,
            [
              'a',
              file,
              `Scripts\\Blizzard_${ver}.j`,
              `Scripts\\Blizzard.j`,
            ],
            { encoding : `utf8` }
          );

          /** uncomment to debbug */
          // console.log('f2AddToMPQ', f2AddToMPQ.error);

          // spawnSync(`echo`, [`running AddToMPQ 2 ${file}`]);
          if (f2AddToMPQ.status == 5) {
            process.send(`WARN: ${file} Failed to add blizzard.j script, you may not have valid permissions or are blocked by windows UAC. Ensure map files are not in a UAC protected location`)
            continue;
          } else if (f2AddToMPQ.status > 0) {
            process.send(`WARN: ${file} Possibly failed to add blizzard.j script, Unknown error occurred: ${f2AddToMPQ.status}`)
            continue;
          }
          f2AddToMPQ.error ?
            process.send(f2AddToMPQ.error.message)
              : process.send(`Add commander script ${file}`);

          if (icon) {
            const f3AddToMPQ =  spawnSync(
              `MPQEditor.exe`,
              [
                'a',
                file,
                `Icons\\Reforged\\MiniMap\\`,
                `UI\\MiniMap`,
              ],
            );
            if (f3AddToMPQ.status == 5) {
              process.send(`WARN: ${file} Failed to add minimap icon, you may not have valid permissions or are blocked by windows UAC. Ensure map files are not in a UAC protected location`)
              continue;
            } else if (f3AddToMPQ.status > 0) {
              process.send(`WARN: ${file} Possibly failed to add minimap icon, Unknown error occurred: ${f3AddToMPQ.status}`)
              continue;
            }
            f3AddToMPQ.error ?
              process.send(f3AddToMPQ.error.message)
                : process.send(`Add minimap icon ${file}`);
          }

          if (icon) {
            const f4AddToMPQ =  spawnSync(
              `MPQEditor.exe`,
              [
                'a',
                file,
                `Icons\\Reforged\\CommandButtons\\*.dds`,
                `ReplaceableTextures\\CommandButtons`,
              ],
            );
            if (f4AddToMPQ.status == 5) {
              process.send(`WARN: ${file} Failed to add Reforged item icon, you may not have valid permissions or are blocked by windows UAC. Ensure map files are not in a UAC protected location`)
              continue;
            } else if (f4AddToMPQ.status > 0) {
              process.send(`WARN: ${file} Possibly failed to add Reforged item icon, Unknown error occurred: ${f4AddToMPQ.status}`)
              continue;
            }
            f4AddToMPQ.error ?
            process.send(f4AddToMPQ.error.message)
              : process.send(`Add Reforged item icon ${file}`);
          }else {
            const f4AddToMPQ =  spawnSync(
                `MPQEditor.exe`,
                [
                  'a',
                  file,
                  `Icons\\Class\\CommandButtons\\*.blp`,
                  `ReplaceableTextures\\CommandButtons`,
                ],
            );
            if (f4AddToMPQ.status == 5) {
              process.send(`WARN: ${file} Failed to add Class item icon, you may not have valid permissions or are blocked by windows UAC. Ensure map files are not in a UAC protected location`)
              continue;
            } else if (f4AddToMPQ.status > 0) {
              process.send(`WARN: ${file} Possibly failed to add Class item icon, Unknown error occurred: ${f4AddToMPQ.status}`)
              continue;
            }
            f4AddToMPQ.error ?
            process.send(f4AddToMPQ.error.message)
              : process.send(`Add Class item icon ${file}`);
          }

          if (icon) {
            const f5AddToMPQ =  spawnSync(
              `MPQEditor.exe`,
              [
                'a',
                file,
                `Icons\\Reforged\\CommandButtonsDisabled\\*.dds`,
                `ReplaceableTextures\\CommandButtonsDisabled`,
              ],
            );
            if (f5AddToMPQ.status == 5) {
              process.send(`WARN: ${file} Failed to add Reforged item disabled icon, you may not have valid permissions or are blocked by windows UAC. Ensure map files are not in a UAC protected location`)
              continue;
            } else if (f5AddToMPQ.status > 0) {
              process.send(`WARN: ${file} Possibly failed to add Reforged item disabled icon, Unknown error occurred: ${f5AddToMPQ.status}`)
              continue;
            }
            f5AddToMPQ.error ?
            process.send(f5AddToMPQ.error.message)
              : process.send(`Add Reforged item disabled icon ${file}`);
          }else {
            const f5AddToMPQ =  spawnSync(
              `MPQEditor.exe`,
              [
                'a',
                file,
                `Icons\\Class\\CommandButtonsDisabled\\*.blp`,
                `ReplaceableTextures\\CommandButtonsDisabled`,
              ],
            );
            if (f5AddToMPQ.status == 5) {
              process.send(`WARN: ${file} Failed to add Class item disabled icon, you may not have valid permissions or are blocked by windows UAC. Ensure map files are not in a UAC protected location`)
              continue;
            } else if (f5AddToMPQ.status > 0) {
              process.send(`WARN: ${file} Possibly failed to add Class item disabled icon, Unknown error occurred: ${f5AddToMPQ.status}`)
              continue;
            }
            f5AddToMPQ.error ?
            process.send(f5AddToMPQ.error.message)
              : process.send(`Add Class item disabled icon ${file}`);
          }

          if (icon) {
            const f6AddToMPQ =  spawnSync(
              `MPQEditor.exe`,
              [
                'a',
                file,
                `Icons\\Reforged\\war3map.imp`,
                `war3map.imp`,
              ],
              { encoding : `utf8` }
            );
            if (f6AddToMPQ.status == 5) {
              process.send(`WARN: ${file} Failed to add Reforged icon list file, you may not have valid permissions or are blocked by windows UAC. Ensure map files are not in a UAC protected location`)
              continue;
            } else if (f6AddToMPQ.status > 0) {
              process.send(`WARN: ${file} Possibly failed to add Reforged icon list file, Unknown error occurred: ${f6AddToMPQ.status}`)
              continue;
            }
            f6AddToMPQ.error ?
              process.send(f6AddToMPQ.error.message)
                : process.send(`Add Reforged icon list file ${file}`);
          }else {
            const f6AddToMPQ =  spawnSync(
              `MPQEditor.exe`,
              [
                'a',
                file,
                `Icons\\Class\\war3map.imp`,
                `war3map.imp`,
              ],
              { encoding : `utf8` }
            );
            if (f6AddToMPQ.status == 5) {
              process.send(`WARN: ${file} Failed to add Class icon list file, you may not have valid permissions or are blocked by windows UAC. Ensure map files are not in a UAC protected location`)
              continue;
            } else if (f6AddToMPQ.status > 0) {
              process.send(`WARN: ${file} Possibly failed to add Class icon list file, Unknown error occurred: ${f6AddToMPQ.status}`)
              continue;
            }
            f6AddToMPQ.error ?
              process.send(f6AddToMPQ.error.message)
                : process.send(`Add Class icon list file ${file}`);
          }

          if (icon) {
            const f7AddToMPQ =  spawnSync(
              `MPQEditor.exe`,
              [
                'a',
                file,
                `Icons\\Reforged\\war3map.w3t`,
                `war3map.w3t`,
              ],
              { encoding : `utf8` }
            );
            if (f7AddToMPQ.status == 5) {
              process.send(`WARN: ${file} Failed to add Reforged item index file, you may not have valid permissions or are blocked by windows UAC. Ensure map files are not in a UAC protected location`)
              continue;
            } else if (f7AddToMPQ.status > 0) {
              process.send(`WARN: ${file} Possibly failed to add Reforged item index file, Unknown error occurred: ${f7AddToMPQ.status}`)
              continue;
            }
            f7AddToMPQ.error ?
              process.send(f7AddToMPQ.error.message)
                : process.send(`Add Reforged item index file ${file}`);
          }else {
            const f7AddToMPQ =  spawnSync(
              `MPQEditor.exe`,
              [
                'a',
                file,
                `Icons\\Class\\war3map.w3t`,
                `war3map.w3t`,
              ],
              { encoding : `utf8` }
            );
            if (f7AddToMPQ.status == 5) {
              process.send(`WARN: ${file} Failed to add Class item index file, you may not have valid permissions or are blocked by windows UAC. Ensure map files are not in a UAC protected location`)
              continue;
            } else if (f7AddToMPQ.status > 0) {
              process.send(`WARN: ${file} Possibly failed to add Class item index file, Unknown error occurred: ${f7AddToMPQ.status}`)
              continue;
            }
            f7AddToMPQ.error ?
              process.send(f7AddToMPQ.error.message)
                : process.send(`Add Class item index file ${file}`);
            }

        }

        const f8AddToMPQ =  spawnSync(
          `MPQEditor.exe`,
          [
            'f',
            file
          ],
          { encoding : `utf8` }
        );

        /** uncomment to debbug */
       // console.log('f8AddToMPQ', f8AddToMPQ.error);

        // spawnSync(`echo`, [`running AddToMPQ 3 ${file}`]);
        if (f8AddToMPQ.status == 5) {
          process.send(`WARN: ${file} Failed to flush scripts, you may not have valid permissions or are blocked by windows UAC. Ensure map files are not in a UAC protected location`)
          continue;
        } else if (f8AddToMPQ.status > 0) {
            process.send(`WARN: ${file} Possibly failed to flush scripts, Unknown error occurred: ${f8AddToMPQ.status}`)
            continue;
        }
        f8AddToMPQ.error ?
          process.send(f8AddToMPQ.error.message)
            : process.send(`Optimize map MPQ ${file}`);
      } catch(error) {
        console.log(error);
        process.send(`Install failed with error: ${error}`);
      }
    }
  }

  // spawnSync(`echo`, [`finish install processing into folder ${dirPath}`]);
}

installOnDirectory();
