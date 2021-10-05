/* eslint-disable @typescript-eslint/no-explicit-any */
export interface EvaluationResponse {
  fieldRestrictions: FieldRestriction[];
  contentEvaluationResult: ContentEvaluationResult;
}

export interface PolicyInfo {
  policyDefinitionId: string;
  policySetDefinitionId: string;
  policyDefinitionReferenceId: string;
  policySetDefinitionName: string;
  policySetDefinitionVersion: string;
  policyDefinitionName: string;
  policyDefinitionEffect: string;
  policyAssignmentId: string;
  policyAssignmentName: string;
  policyAssignmentScope: string;
}

export interface EvaluatedExpression {
  result: string;
  expressionKind: string;
  expression: string;
  path: string;
  expressionValue: string;
  targetValue: string;
  operator: string;
}

export interface EvaluationDetails {
  evaluatedExpressions: EvaluatedExpression[];
}

export interface PolicyEvaluation {
  policyInfo: PolicyInfo;
  evaluationResult: string;
  evaluationDetails: EvaluationDetails;
}

export interface ContentEvaluationResult {
  policyEvaluations: PolicyEvaluation[];
}

export interface FieldRestriction {
  field: string;
  restrictions: Restriction[];
}

export interface Restriction {
  result: string;
  values: string[];
  policy: PolicyInfo;
}

export interface PolicyDefinition {
  id: string;
  type: string;
  name: string;
  properties: PolicyDefinitionProperties;
}

export interface PolicyDefinitionProperties {
  displayName: string;
  description: string;
  policyType: string;
  mode: string;
  metadata: any;
  parameters: any;
  policyRule: any;
}

export interface ResourceEvaluationResult {
  resource: string;
  evaluations: PolicyEvaluation[] | undefined;
}
