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

    core.info('Evaluating ARM template...');
    const results = await evaluateTemplate(armPath, token, subscriptionId);
    core.debug(JSON.stringify(results));

    if (results.evaluations.length > 0) {
      for (const evaluation of results.evaluations) {
        core.info(`The resource '${evaluation.resource}' has ${evaluation.evaluations?.length} policy violations`);
        if (evaluation.evaluations) {
          for (const policyEvaluation of evaluation.evaluations) {
            core.info(` - ${results.policies.get(policyEvaluation.policyInfo.policyDefinitionName)}`);
          }
        }
      }

      if (results.evaluations.filter(x => x.evaluations && x.evaluations.length > 0).length > 0) {
        core.setFailed('ARM template has policy violations!');
      }
    }
  } catch (error: unknown) {
    const ex = error as Error;
    core.setFailed(ex.message);
  }
}

run();
