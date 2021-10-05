/* eslint-disable @typescript-eslint/no-explicit-any */

import * as fs from 'fs';
import * as core from '@actions/core';
import { RestClient } from 'typed-rest-client/RestClient';

export async function evaluateTemplate(templatePath: string, accessToken: string, subscriptionId: string): Promise<void> {
  core.debug(`Reading template from ${templatePath}`);
  const rawdata = fs.readFileSync(templatePath, 'utf8');
  const template = JSON.parse(rawdata);
  await evaluateResources(template.resources, accessToken, subscriptionId);
}

async function evaluateResources(resources: any[], accessToken: string, subscriptionId: string): Promise<void> {
  for (const resource of resources) {
    core.debug(`Evaluating resource ${resource.name} of type ${resource.type}`);
    await evaluateResource(resource, accessToken, subscriptionId);
  }
}

async function evaluateResource(resource: any, accessToken: string, subscriptionId: string): Promise<void> {
  const url = `https://management.azure.com/subscriptions/${subscriptionId}/providers/Microsoft.PolicyInsights/checkPolicyRestrictions?api-version=2020-07-01`;
  const client = new RestClient('github');

  core.debug(`Calling check policy API at ${url}`);
  const resp = await client.create(
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
}
