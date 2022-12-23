const fs = require('node:fs');
const nodePath = require('node:path');
const readline = require('node:readline');
const currentPath = process.argv[2] || '.';

const consoleColors = {
  delete: '\x1b[32m',
  keys: '\x1b[33m',
  feedback: '\x1b[37m'
};

const findFolderRecursive = (path, result = []) => {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(file => {
      const currentPath = nodePath.join(path, file);
      if (file === 'node_modules') {
        result.push(currentPath);
      } else if (fs.lstatSync(currentPath).isDirectory()) {
        findFolderRecursive(currentPath, result);
      }
    });
  }
  return result;
};

const listenKeypressEvents = callbacks => {
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.on('keypress', (key, data) => {
    if (data.ctrl && data.name === 'c') {
      process.exit();
    } else {
      const callback = callbacks.find(callback => callback.keys.includes(data.name));
      if (callback) {
        callback.callback();
      }
    }
  });
};

const showNextDeleteMessage = () => {
  pathIndex += 1;
  if (pathIndex >= paths.length) {
    process.exit();
  } else {
    console.log(
      consoleColors.delete,
      `Do you want to delete ${nodePath.resolve(paths[pathIndex])}?`,
      consoleColors.keys,
      '[enter/y/n]'
    );
  }
};

listenKeypressEvents([
  {
    keys: ['y', 'Y', 'return'],
    callback: () => {
      console.log(consoleColors.feedback, `Deleting ${nodePath.resolve(paths[pathIndex])}`);
      fs.rmdirSync(paths[pathIndex], { recursive: true });
      showNextDeleteMessage();
    }
  },
  {
    keys: ['n', 'N'],
    callback: () => {
      showNextDeleteMessage();
    }
  },
  {
    keys: ['escape'],
    callback: () => {
      process.exit();
    }
  }
]);

console.log(`Searching node_modules in ${nodePath.resolve(currentPath)}`);

let pathIndex = -1;
const paths = findFolderRecursive(currentPath);

console.log(`Found ${paths.length} node_modules/ directories`);

showNextDeleteMessage();
