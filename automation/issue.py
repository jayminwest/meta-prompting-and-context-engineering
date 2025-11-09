#!/usr/bin/env python3
"""
CLI tool to create GitHub issues using Claude Code meta-prompts.

Usage:
    uv run automation/issue.py "fix payment webhook not updating order status"
"""

import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Optional

import typer
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.panel import Panel
from rich.syntax import Syntax

from lib.claude_client import ClaudeCodeClient, ClaudeError

app = typer.Typer()
console = Console()


def extract_json_from_output(text: str) -> Optional[dict]:
    """Extract JSON from Claude's response (handles markdown code blocks)."""
    # Try to find JSON in code blocks
    if "```json" in text:
        start = text.find("```json") + 7
        end = text.find("```", start)
        json_str = text[start:end].strip()
    elif "```" in text:
        start = text.find("```") + 3
        end = text.find("```", start)
        json_str = text[start:end].strip()
    else:
        # Try to parse entire output
        json_str = text.strip()

    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
        return None


@app.command()
def create(description: str):
    """
    Create a GitHub issue using Claude Code's /issue meta-prompt.

    Args:
        description: Natural language description of the issue to create
    """
    console.print(f"\n[bold cyan]Creating issue:[/bold cyan] {description}\n")

    try:
        client = ClaudeCodeClient()

        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console,
        ) as progress:
            task = progress.add_task("Running /issue command...", total=None)

            # Stream Claude's research process
            output = ""
            console.print("[dim]--- Agent Output ---[/dim]")

            for chunk in client.stream_command("issue", description):
                print(chunk, end="", flush=True)  # Use regular print for streaming
                output += chunk

            console.print("\n[dim]--- End Output ---[/dim]\n")
            progress.update(task, completed=True)

        # Parse structured output
        result = extract_json_from_output(output)

        if not result:
            console.print("[bold red]✗ Failed to parse JSON output from agent[/bold red]")
            console.print("[dim]Raw output saved to .claude/state/last_error.txt[/dim]")
            Path(".claude/state/last_error.txt").write_text(output)
            sys.exit(1)

        # Save structured output for downstream commands
        state_dir = Path(".claude/state")
        state_dir.mkdir(parents=True, exist_ok=True)

        output_path = state_dir / "last_issue.json"
        output_path.write_text(json.dumps(result, indent=2))

        # Display results
        console.print(Panel.fit(
            f"[bold green]✓ Issue analysis complete[/bold green]\n\n"
            f"[bold]Title:[/bold] {result['title']}\n"
            f"[bold]Summary:[/bold] {result['summary']}\n"
            f"[bold]Affected Files:[/bold] {len(result.get('affected_files', []))} files",
            title="Success",
            border_style="green",
        ))

        console.print(f"\n[dim]Structured output saved to {output_path}[/dim]")

        # Optionally create GitHub issue
        create_github_issue = os.getenv("CREATE_GITHUB_ISSUES", "false").lower() == "true"

        if create_github_issue:
            console.print("\n[cyan]Creating GitHub issue...[/cyan]")
            try:
                # Create issue body from result
                issue_body = f"""## Summary

{result['summary']}

## Root Cause

{result['root_cause']}

## Affected Files

"""
                for file in result.get('affected_files', []):
                    line_range = file.get('line_range', 'N/A')
                    issue_body += f"- `{file['path']}` (lines {line_range}): {file['reason']}\n"

                issue_body += f"""

## Implementation Approach

{result.get('implementation_approach', 'N/A')}

## Test Strategy

{result.get('test_strategy', 'N/A')}
"""
                if result.get('constraints'):
                    issue_body += "\n## Constraints\n\n"
                    for constraint in result['constraints']:
                        issue_body += f"- {constraint}\n"

                # Write to temp file
                temp_body = Path(".claude/state/temp_issue_body.md")
                temp_body.write_text(issue_body)

                # Create issue with gh CLI
                gh_result = subprocess.run(
                    [
                        "gh", "issue", "create",
                        "--title", result['title'],
                        "--body-file", str(temp_body),
                        "--label", "bug"
                    ],
                    capture_output=True,
                    text=True
                )

                if gh_result.returncode == 0:
                    issue_url = gh_result.stdout.strip()
                    console.print(f"[bold green]✓ GitHub issue created:[/bold green] {issue_url}\n")
                else:
                    console.print(f"[bold yellow]⚠ Failed to create GitHub issue:[/bold yellow] {gh_result.stderr}")
                    console.print("[dim]You can create it manually using the JSON output above[/dim]\n")

            except FileNotFoundError:
                console.print("[bold yellow]⚠ GitHub CLI (gh) not found[/bold yellow]")
                console.print("[dim]Install it from: https://cli.github.com/[/dim]\n")
            except Exception as e:
                console.print(f"[bold yellow]⚠ Failed to create GitHub issue:[/bold yellow] {e}\n")
        else:
            console.print("\n[dim]GitHub issue creation disabled (set CREATE_GITHUB_ISSUES=true to enable)[/dim]\n")

    except ClaudeError as e:
        console.print(f"[bold red]✗ Claude API Error:[/bold red] {e}")
        sys.exit(1)
    except Exception as e:
        console.print(f"[bold red]✗ Unexpected Error:[/bold red] {e}")
        sys.exit(1)


if __name__ == "__main__":
    app()
