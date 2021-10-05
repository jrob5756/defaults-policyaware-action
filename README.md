# Defaults Policy Check GitHub Action

Wouldn't it be great to know if you were going to run into policy or compliance issues before you've even merged your infrastructure code into the main branch? Troubleshooting deployment issues after a PR is completed and the code is merged can get messy. 

This repository contains the source code for a [GitHub Action](https://docs.github.com/en/actions) that will validate an [Azure Resource Manager (ARM)](https://docs.microsoft.com/en-us/azure/azure-resource-manager/) template against the [Azure Policy](https://docs.microsoft.com/en-us/azure/governance/policy/overview) configuration at a given subscription.

## Configuration

The action only has two (required parameters)

```
  subscriptionId:
    description: "The subscription to evaluate the ARM template against."
    required: true
  templateLocation:
    description: "Specify the path to the Azure Resource Manager (ARM) template."
    required: true
```

## Related Topics

If you're new to the template development, see:

- [Azure Resource Manager](https://docs.microsoft.com/en-us/azure/azure-resource-manager/)
- [Azure Policy](https://docs.microsoft.com/en-us/azure/governance/policy/overview)
- [GitHub Actions](https://docs.github.com/en/actions)

`Tags: Azure Policy, ARM templates`
