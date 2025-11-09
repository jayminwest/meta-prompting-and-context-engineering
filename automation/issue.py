#!/usr/bin/env python3
"""
CLI tool to create GitHub issues using Claude Code meta-prompts.

Usage:
    uv run automation/issue.py "fix payment webhook not updating order status"
"""

import json
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

        # Display results
        console.print(Panel.fit(
            f"[bold green]✓ Issue #{result['issue_number']} created[/bold green]\n\n"
            f"[bold]Title:[/bold] {result['title']}\n"
            f"[bold]Summary:[/bold] {result['summary']}\n"
            f"[bold]Affected Files:[/bold] {len(result.get('affected_files', []))} files",
            title="Success",
            border_style="green",
        ))

        # Save structured output for downstream commands
        state_dir = Path(".claude/state")
        state_dir.mkdir(parents=True, exist_ok=True)

        output_path = state_dir / "last_issue.json"
        output_path.write_text(json.dumps(result, indent=2))

        console.print(f"\n[dim]Structured output saved to {output_path}[/dim]")
        console.print(f"[dim]View issue: gh issue view {result['issue_number']}[/dim]\n")

    except ClaudeError as e:
        console.print(f"[bold red]✗ Claude API Error:[/bold red] {e}")
        sys.exit(1)
    except Exception as e:
        console.print(f"[bold red]✗ Unexpected Error:[/bold red] {e}")
        sys.exit(1)


if __name__ == "__main__":
    app()
