#!/usr/bin/env tsx

/**
 * Clean up GitHub Actions workflow runs that are not successful
 * This script removes all workflow runs with status other than 'success'
 * 
 * Usage: tsx scripts/git/cleanup-workflow-runs.ts [options]
 * Options:
 *   --dry-run       Show what would be deleted without actually deleting
 *   --keep-last     Keep the most recent run for each workflow regardless of status
 *   --verbose       Show detailed output
 *   --workflow      Filter by specific workflow name or ID
 *   --max-age       Only delete runs older than N days (e.g., --max-age 30)
 */

import { execSync } from 'child_process';

interface WorkflowRun {
  id: number;
  name: string;
  workflow_id: number;
  status: string;
  conclusion: string | null;
  created_at: string;
  updated_at: string;
  html_url: string;
  run_number: number;
  event: string;
}

interface Workflow {
  id: number;
  name: string;
  path: string;
  state: string;
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  dryRun: args.includes('--dry-run'),
  keepLast: args.includes('--keep-last'),
  verbose: args.includes('--verbose'),
  workflow: args.find((arg, i) => args[i - 1] === '--workflow') || null,
  maxAge: parseInt(args.find((arg, i) => args[i - 1] === '--max-age') || '0')
};

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

// Status emojis
const statusEmojis: Record<string, string> = {
  success: '✅',
  failure: '❌',
  cancelled: '🚫',
  skipped: '⏭️',
  timed_out: '⏱️',
  action_required: '⚠️',
  stale: '📅',
  neutral: '⚪',
  startup_failure: '🔥'
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function verbose(message: string) {
  if (options.verbose) {
    log(message, colors.gray);
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getDaysOld(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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

async function getWorkflows(): Promise<Workflow[]> {
  try {
    verbose('Fetching workflows...');
    const result = executeCommand(
      'gh api repos/josedacosta/mcp-jetbrains-code-inspections/actions/workflows --paginate'
    );
    const data = JSON.parse(result);
    return data.workflows || [];
  } catch (error) {
    log('Error fetching workflows', colors.red);
    throw error;
  }
}

async function getWorkflowRuns(workflowId?: string): Promise<WorkflowRun[]> {
  try {
    verbose(`Fetching workflow runs${workflowId ? ` for workflow ${workflowId}` : ''}...`);
    
    let endpoint = 'gh api repos/josedacosta/mcp-jetbrains-code-inspections/actions/runs';
    
    // Add workflow filter if specified
    if (workflowId) {
      // Check if it's a numeric ID or a name
      if (/^\d+$/.test(workflowId)) {
        endpoint = `gh api repos/josedacosta/mcp-jetbrains-code-inspections/actions/workflows/${workflowId}/runs`;
      } else {
        // For workflow names, we'll filter after fetching
        endpoint = 'gh api repos/josedacosta/mcp-jetbrains-code-inspections/actions/runs';
      }
    }
    
    endpoint += ' --paginate';
    
    const result = executeCommand(endpoint);
    const data = JSON.parse(result);
    let runs = data.workflow_runs || [];
    
    // Filter by workflow name if specified and not a numeric ID
    if (workflowId && !/^\d+$/.test(workflowId)) {
      runs = runs.filter((run: WorkflowRun) => 
        run.name.toLowerCase().includes(workflowId.toLowerCase())
      );
    }
    
    return runs;
  } catch (error) {
    log('Error fetching workflow runs', colors.red);
    throw error;
  }
}

async function deleteWorkflowRun(runId: number): Promise<boolean> {
  if (options.dryRun) {
    log(`  [DRY RUN] Would delete workflow run ${runId}`, colors.cyan);
    return true;
  }

  try {
    executeCommand(
      `gh api -X DELETE repos/josedacosta/mcp-jetbrains-code-inspections/actions/runs/${runId}`
    );
    return true;
  } catch (error) {
    log(`  Failed to delete workflow run ${runId}`, colors.red);
    verbose(`  Error: ${error}`);
    return false;
  }
}

async function main() {
  log('\n🧹 GitHub Actions Workflow Runs Cleanup Script', colors.bright);
  log('=' .repeat(50), colors.gray);
  
  if (options.dryRun) {
    log('🔍 Running in DRY RUN mode (no changes will be made)', colors.yellow);
  }
  
  if (options.workflow) {
    log(`📋 Filtering by workflow: ${options.workflow}`, colors.blue);
  }
  
  if (options.maxAge > 0) {
    log(`📅 Only deleting runs older than ${options.maxAge} days`, colors.blue);
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

    // Get all workflow runs
    const runs = await getWorkflowRuns(options.workflow || undefined);
    
    if (runs.length === 0) {
      log('\n✅ No workflow runs found', colors.green);
      return;
    }
    
    log(`\n📊 Found ${runs.length} workflow run(s)`, colors.blue);
    
    // Group runs by workflow for better organization
    const runsByWorkflow = runs.reduce((acc: Record<string, WorkflowRun[]>, run) => {
      if (!acc[run.name]) {
        acc[run.name] = [];
      }
      acc[run.name].push(run);
      return acc;
    }, {});
    
    // Statistics
    let successCount = 0;
    let deletedCount = 0;
    let failedCount = 0;
    let skippedCount = 0;
    let tooRecentCount = 0;
    
    // Process each workflow's runs
    for (const [workflowName, workflowRuns] of Object.entries(runsByWorkflow)) {
      // Sort runs by created_at descending (newest first)
      workflowRuns.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      log(`\n📁 ${colors.bright}${workflowName}${colors.reset} (${workflowRuns.length} runs)`, colors.blue);
      
      for (let i = 0; i < workflowRuns.length; i++) {
        const run = workflowRuns[i];
        const isLast = i === 0; // First in sorted array is the most recent
        const daysOld = getDaysOld(run.created_at);
        const emoji = statusEmojis[run.conclusion || 'neutral'] || '❓';
        
        verbose(`\nChecking run #${run.run_number} (ID: ${run.id})...`);
        
        // Skip the last run if keepLast option is set
        if (isLast && options.keepLast) {
          log(`  ${emoji} #${run.run_number} - ${colors.yellow}KEPT${colors.reset} (most recent) - ${run.conclusion || run.status}`, colors.gray);
          skippedCount++;
          continue;
        }
        
        // Skip if run is too recent based on max-age
        if (options.maxAge > 0 && daysOld < options.maxAge) {
          log(`  ${emoji} #${run.run_number} - ${colors.cyan}SKIPPED${colors.reset} (${daysOld} days old) - ${run.conclusion || run.status}`, colors.gray);
          tooRecentCount++;
          continue;
        }
        
        // Format run info
        const runInfo = `#${run.run_number} [${run.event}] - ${formatDate(run.created_at)} (${daysOld} days ago)`;
        
        if (run.conclusion === 'success') {
          log(`  ${emoji} ${runInfo} - ${colors.green}SUCCESS${colors.reset}`, colors.dim);
          successCount++;
        } else {
          const statusColor = run.conclusion === 'failure' ? colors.red : 
                             run.conclusion === 'cancelled' ? colors.yellow : 
                             colors.gray;
          
          log(`  ${emoji} ${runInfo} - ${statusColor}${(run.conclusion || run.status).toUpperCase()}${colors.reset}`);
          
          // Delete non-successful run
          const deleted = await deleteWorkflowRun(run.id);
          
          if (deleted) {
            if (!options.dryRun) {
              log(`     ✓ Deleted successfully`, colors.green);
            }
            deletedCount++;
          } else {
            failedCount++;
          }
        }
      }
    }
    
    // Print summary
    log('\n' + '=' .repeat(50), colors.gray);
    log('📈 Summary:', colors.bright);
    log(`  • Total workflow runs: ${runs.length}`, colors.blue);
    log(`  • Successful: ${successCount}`, colors.green);
    log(`  • Deleted: ${deletedCount}`, colors.yellow);
    
    if (failedCount > 0) {
      log(`  • Failed to delete: ${failedCount}`, colors.red);
    }
    
    if (skippedCount > 0) {
      log(`  • Kept (most recent): ${skippedCount}`, colors.cyan);
    }
    
    if (tooRecentCount > 0) {
      log(`  • Too recent: ${tooRecentCount}`, colors.cyan);
    }
    
    if (options.dryRun) {
      log('\n💡 This was a dry run. Run without --dry-run to actually delete workflow runs', colors.yellow);
    } else if (deletedCount > 0) {
      log('\n✨ Cleanup completed successfully!', colors.green);
    } else {
      log('\n✨ No workflow runs needed cleanup', colors.green);
    }
    
    // Show link to Actions page
    log(`\n🔗 View remaining runs: ${colors.cyan}https://github.com/josedacosta/mcp-jetbrains-code-inspections/actions${colors.reset}`);
    
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