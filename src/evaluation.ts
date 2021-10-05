/* eslint-disable @typescript-eslint/no-explicit-any */

import * as fs from 'fs';
import * as core from '@actions/core';
import { RestClient } from 'typed-rest-client/RestClient';
import { EvaluationResponse, PolicyDefinition, ResourceEvaluationResult } from './models';

export async function evaluateTemplate(templatePath: string, accessToken: string, subscriptionId: string): Promise<{ evaluations: ResourceEvaluationResult[]; policies: Map<string, string> }> {
  core.debug(`Reading ARM template from ${templatePath}`);
  const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));

  core.debug(`Evaluating ${template.resources.length} resources`);
  const evaluations = await evaluateResources(template.resources, accessToken, subscriptionId);

  core.debug(`Recieved results for ${evaluations.length} noncompliant resources, retrieving policy definitions...`);

  let policyIds = evaluations
    .map(x => x.evaluations)
    .filter(notEmpty)
    .reduce((x, y) => x.concat(y), [])
    .map(x => x.policyInfo.policyDefinitionId);
  policyIds = [...new Set(policyIds)];

  const client = new RestClient('github', `https://management.azure.com/subscriptions/${subscriptionId}`);
  const policies = await Promise.all(
    // eslint-disable-next-line @typescript-eslint/promise-function-async
    policyIds.map(x =>
      client.get<PolicyDefinition>(`/providers/Microsoft.Authorization/policyDefinitions/${x}?api-version=2021-06-01`, {
        additionalHeaders: {
          Authorization: `bearer ${accessToken}`
        }
      })
    )
  );

  return {
    evaluations,
    policies: new Map<string, string>(policies.map(x => [x.result?.name, x.result?.properties.displayName] as [string, string]))
  };
}

async function evaluateResources(resources: any[], accessToken: string, subscriptionId: string): Promise<ResourceEvaluationResult[]> {
  const result: ResourceEvaluationResult[] = [];
  for (const resource of resources) {
    core.debug(`Evaluating resource ${resource.name} of type ${resource.type}`);
    result.push(await evaluateResource(resource, accessToken, subscriptionId));
  }
  return result;
}

async function evaluateResource(resource: any, accessToken: string, subscriptionId: string): Promise<ResourceEvaluationResult> {
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

  return { resource: resource.name, evaluations: resp.result?.contentEvaluationResult?.policyEvaluations };
}

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}
