import gitConfig from 'git-config'
import objectPath from 'object-path'
import path from 'path'

import { getLernaDependencies } from '@platyplus/lerna'

import fs from '@platyplus/fs'
import { LernaPackage } from '@platyplus/lerna'

import { DEFAULT_ROOT_DIR } from '../settings'

import { PackageInformation, PackageJson } from './types'

const fromNpmPackage = (
  { name: packageName, platyplus, description }: PackageJson,
  location: string,
  rootDir = DEFAULT_ROOT_DIR
): PackageInformation => {
  const [directory, name] = location.replace(`${rootDir}/`, '').split('/')
  if (!platyplus) throw Error(`${packageName}: could not find package type`)
  const git = gitConfig.sync()
  return {
    type: platyplus?.type,
    directory,
    name,
    package: packageName,
    location,
    description,
    user: {
      name: objectPath.get(git, 'user.name'),
      email: objectPath.get(git, 'user.email'),
    },
    repository: objectPath.get(git, 'remote.origin.url'),
    dependencies: [],
  }
}

const fromLernaPackage = async (
  { location }: LernaPackage,
  rootDir = DEFAULT_ROOT_DIR
): Promise<PackageInformation> => {
  const packageJson = await fs.readJson(path.join(location, 'package.json'))
  return fromNpmPackage(packageJson, location, rootDir)
}

/**
 * Loads all the information about a platyplus-managed package
 * @param packageName lerna-managed package name as per defined in a package.json
 * @param rootDir
 */
export const loadPackageInformation = async (
  jsonPackageDir: string,
  rootDir = DEFAULT_ROOT_DIR
): Promise<PackageInformation> => {
  const packageJson = (await fs.readJson(
    path.join(jsonPackageDir, 'package.json')
  )) as PackageJson
  if (!packageJson.platyplus?.type)
    throw Error(`'platyplus.type' field not found in ${jsonPackageDir}.`)

  const result = fromNpmPackage(packageJson, jsonPackageDir, rootDir)
  result.type = packageJson.platyplus.type
  const dependencies = await getLernaDependencies(packageJson.name)
  for (const lernaDep of dependencies) {
    result.dependencies.push(await fromLernaPackage(lernaDep))
  }
  return result
}