#!/usr/bin/env tsx

/**
 * Clean up GitHub deployments that are not successful
 * This script removes all deployments with status other than 'success'
 * 
 * Usage: tsx scripts/git/cleanup-deployments.ts [options]
 * Options:
 *   --dry-run    Show what would be deleted without actually deleting
 *   --keep-last  Keep the most recent deployment regardless of status
 *   --verbose    Show detailed output
 */

import { execSync } from 'child_process';

interface Deployment {
  id: number;
  environment: string;
  created_at: string;
  updated_at: string;
}

interface DeploymentStatus {
  state: string;
  created_at: string;
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  dryRun: args.includes('--dry-run'),
  keepLast: args.includes('--keep-last'),
  verbose: args.includes('--verbose')
};

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function verbose(message: string) {
  if (options.verbose) {
    log(message, colors.gray);
  }
}

function executeCommand(command: string): string {
  try {
    return execSync(command, { encoding: 'utf-8' }).trim();
  } catch (error: any) {
    if (error.status !== 0) {
      throw new Error(`Command failed: ${command}\n${error.message}`);
    }
    return '';
  }
}

async function getDeployments(): Promise<Deployment[]> {
  try {
    verbose('Fetching deployments...');
    const result = executeCommand(
      'gh api repos/josedacosta/mcp-jetbrains-code-inspections/deployments --paginate'
    );
    return JSON.parse(result);
  } catch (error) {
    log('Error fetching deployments', colors.red);
    throw error;
  }
}

async function getDeploymentStatus(deploymentId: number): Promise<string> {
  try {
    const result = executeCommand(
      `gh api repos/josedacosta/mcp-jetbrains-code-inspections/deployments/${deploymentId}/statuses`
    );
    const statuses: DeploymentStatus[] = JSON.parse(result);
    
    // Return the most recent status or 'pending' if no status exists
    return statuses.length > 0 ? statuses[0].state : 'pending';
  } catch (error) {
    verbose(`Could not fetch status for deployment ${deploymentId}, assuming pending`);
    return 'pending';
  }
}

async function deleteDeployment(deploymentId: number): Promise<boolean> {
  if (options.dryRun) {
    log(`  [DRY RUN] Would delete deployment ${deploymentId}`, colors.cyan);
    return true;
  }

  try {
    executeCommand(
      `gh api -X DELETE repos/josedacosta/mcp-jetbrains-code-inspections/deployments/${deploymentId}`
    );
    return true;
  } catch (error) {
    log(`  Failed to delete deployment ${deploymentId}`, colors.red);
    verbose(`  Error: ${error}`);
    return false;
  }
}

async function main() {
  log('\n🧹 GitHub Deployments Cleanup Script', colors.bright);
  log('=' .repeat(40), colors.gray);
  
  if (options.dryRun) {
    log('🔍 Running in DRY RUN mode (no changes will be made)', colors.yellow);
  }
  
  try {
    // Check if gh CLI is installed and authenticated
    try {
      executeCommand('gh auth status');
    } catch (error) {
      log('\n❌ GitHub CLI is not authenticated', colors.red);
      log('   Run: gh auth login', colors.yellow);
      process.exit(1);
    }

    // Get all deployments
    const deployments = await getDeployments();
    
    if (deployments.length === 0) {
      log('\n✅ No deployments found', colors.green);
      return;
    }
    
    log(`\n📊 Found ${deployments.length} deployment(s)`, colors.blue);
    
    // Statistics
    let successCount = 0;
    let deletedCount = 0;
    let failedCount = 0;
    let skippedCount = 0;
    
    // Process each deployment
    for (let i = 0; i < deployments.length; i++) {
      const deployment = deployments[i];
      const isLast = i === 0; // Deployments are returned in reverse chronological order
      
      verbose(`\nChecking deployment ${deployment.id}...`);
      
      // Skip the last deployment if keepLast option is set
      if (isLast && options.keepLast) {
        log(`\n📌 Keeping last deployment ${deployment.id} (--keep-last option)`, colors.yellow);
        skippedCount++;
        continue;
      }
      
      // Get deployment status
      const status = await getDeploymentStatus(deployment.id);
      
      // Format deployment info
      const deploymentInfo = `Deployment ${deployment.id} [${deployment.environment}] - Status: ${status}`;
      
      if (status === 'success') {
        log(`\n✅ ${deploymentInfo}`, colors.green);
        successCount++;
      } else {
        log(`\n❌ ${deploymentInfo}`, colors.yellow);
        
        // Delete non-successful deployment
        const deleted = await deleteDeployment(deployment.id);
        
        if (deleted) {
          if (!options.dryRun) {
            log(`  ✓ Deleted successfully`, colors.green);
          }
          deletedCount++;
        } else {
          failedCount++;
        }
      }
    }
    
    // Print summary
    log('\n' + '=' .repeat(40), colors.gray);
    log('📈 Summary:', colors.bright);
    log(`  • Total deployments: ${deployments.length}`, colors.blue);
    log(`  • Successful: ${successCount}`, colors.green);
    log(`  • Deleted: ${deletedCount}`, colors.yellow);
    
    if (failedCount > 0) {
      log(`  • Failed to delete: ${failedCount}`, colors.red);
    }
    
    if (skippedCount > 0) {
      log(`  • Skipped: ${skippedCount}`, colors.cyan);
    }
    
    if (options.dryRun) {
      log('\n💡 This was a dry run. Run without --dry-run to actually delete deployments', colors.yellow);
    } else if (deletedCount > 0) {
      log('\n✨ Cleanup completed successfully!', colors.green);
    } else {
      log('\n✨ No deployments needed cleanup', colors.green);
    }
    
  } catch (error: any) {
    log('\n❌ An error occurred:', colors.red);
    log(error.message, colors.red);
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  log('Unexpected error:', colors.red);
  console.error(error);
  process.exit(1);
});