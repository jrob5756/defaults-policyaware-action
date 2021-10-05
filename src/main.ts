import * as core from '@actions/core';
import { which } from '@actions/io';
import { exec, getExecOutput } from '@actions/exec';
import { evaluateTemplate } from './evaluation';

async function run(): Promise<void> {
  try {
    const azPath = await which('az', true);
    const armPath: string = core.getInput('templateLocation');
    const subscriptionId = core.getInput('subscriptionId');

    core.debug('Changing subscription context...');
    await exec(`"${azPath}" account set --subscription ${subscriptionId}`, [], { silent: true });

    core.debug('Fetching access token...');
    const output = await getExecOutput(`"${azPath}" account get-access-token --subscription ${subscriptionId}`);
    const token: string = JSON.parse(output.stdout).accessToken;

    core.debug('Evaluating ARM template...');
    const results = await evaluateTemplate(armPath, token, subscriptionId);
    if (results.evaluations.length > 0) {
      for (const evaluation of results.evaluations) {
        core.error(`The resource '${evaluation.resource}' has the following ${evaluation.evaluations?.length} policy violations`);
        if (evaluation.evaluations) {
          for (const policyEvaluation of evaluation.evaluations) {
            core.error(` - ${results.policies.get(policyEvaluation.policyInfo.policyDefinitionId)}`);
          }
        }
      }

      core.setFailed('ARM template has failed policy violations!');
    }
  } catch (error: unknown) {
    const ex = error as Error;
    core.setFailed(ex.message);
  }
}

run();
