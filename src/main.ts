import * as core from '@actions/core';
import { which } from '@actions/io';
import { exec, getExecOutput } from '@actions/exec';
import { evaluateTemplate } from './evaluation';

async function run(): Promise<void> {
  try {
    core.debug('debug');
    core.info('info');
    core.warning('warning');
    core.error('error');

    const azPath = await which('az', true);
    const armPath: string = core.getInput('templateLocation');
    const subscriptionId = core.getInput('subscriptionId');

    core.debug('Changing subscription context...');
    await exec(`"${azPath}" account set --subscription ${subscriptionId}`, [], { silent: true });

    core.debug('Fetching access token...');
    const output = await getExecOutput(`"${azPath}" account get-access-token --subscription ${subscriptionId}`);
    const token: string = JSON.parse(output.stdout).accessToken;

    core.debug('Evaluating ARM template...');
    await evaluateTemplate(armPath, token, subscriptionId);
  } catch (error: unknown) {
    const ex = error as Error;
    core.setFailed(ex.message);
  }
}

run();
