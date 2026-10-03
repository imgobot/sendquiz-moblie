const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');
const webRoot = path.join(workspaceRoot, 'apps', 'web');
const webWorkspaceModule = path.join(workspaceRoot, 'node_modules', '@send', 'backend');

const config = getDefaultConfig(projectRoot);

function escapePathForRegex(filePath) {
  return filePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function blockPath(filePath) {
  return new RegExp(`${escapePathForRegex(filePath)}(?:[/\\\\].*)?$`);
}

config.watchFolders = config.watchFolders.filter((folder) => path.resolve(folder) !== webRoot);

const existingBlockList = config.resolver.blockList;
config.resolver.blockList = [
  ...(Array.isArray(existingBlockList) ? existingBlockList : existingBlockList ? [existingBlockList] : []),
  blockPath(webRoot),
  blockPath(webWorkspaceModule),
];

module.exports = config;
