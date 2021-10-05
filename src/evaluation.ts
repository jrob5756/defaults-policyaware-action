/* eslint-disable @typescript-eslint/no-explicit-any */

import * as fs from 'fs';
import * as core from '@actions/core';
import { RestClient } from 'typed-rest-client/RestClient';
import { EvaluationResponse, PolicyEvaluation } from './models';

export async function evaluateTemplate(templatePath: string, accessToken: string, subscriptionId: string): Promise<void> {
  core.debug(`Reading template from ${templatePath}`);
  const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));

  core.debug(`Evaluating ${template.resources.length} resources`);
  const resp = await evaluateResources(template.resources, accessToken, subscriptionId);

  core.debug(`Recieved results for ${resp.length} policy violations, retrieving policy definitions...`);

  // const client = new RestClient('github', `https://management.azure.com/subscriptions/${subscriptionId}`);
  // // eslint-disable-next-line @typescript-eslint/promise-function-async
  // const policies = await Promise.all(resp.map(x => client.get<PolicyDefinition>(`/providers/Microsoft.Authorization/policyDefinitions/${x.policyInfo.policyDefinitionId}?api-version=2021-06-01`)));
  // return policies.map(x => x.result).filter(notEmpty);
}

async function evaluateResources(resources: any[], accessToken: string, subscriptionId: string): Promise<PolicyEvaluation[]> {
  let result: PolicyEvaluation[] = [];
  for (const resource of resources) {
    core.debug(`Evaluating resource ${resource.name} of type ${resource.type}`);
    const evaluations = await evaluateResource(resource, accessToken, subscriptionId);
    if (evaluations) {
      result = [...result, ...evaluations];
    }
  }
  return result;
}

async function evaluateResource(resource: any, accessToken: string, subscriptionId: string): Promise<PolicyEvaluation[] | undefined> {
  const url = `https://management.azure.com/subscriptions/${subscriptionId}/providers/Microsoft.PolicyInsights/checkPolicyRestrictions?api-version=2020-07-01`;
  const client = new RestClient('github');

  core.debug(`Calling check policy API at ${url}`);
  const resp = await client.create<EvaluationResponse>(
    url,
    {
      pendingFields: [],
      resourceDetails: {
        apiVersion: resource.apiVersion,
        resourceContent: resource
      }
    },
    {
      additionalHeaders: {
        Authorization: `bearer ${accessToken}`
      }
    }
  );

  core.debug(resp.statusCode.toString());
  core.debug(JSON.stringify(resp.result));

  return resp.result?.contentEvaluationResult?.policyEvaluations;
}

// function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
//   return value !== null && value !== undefined;
// }
