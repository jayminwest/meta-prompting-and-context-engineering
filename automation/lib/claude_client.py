"""
Wrapper around Claude Code SDK for programmatic command execution.
"""

import os
from typing import Iterator

# Note: This is a placeholder - actual Claude Code SDK may differ
# Adjust based on official SDK when available


class ClaudeError(Exception):
    """Base exception for Claude API errors."""
    pass


class ClaudeCodeClient:
    """
    Client for executing Claude Code commands programmatically.

    This wraps the official Claude Code SDK (when available) or uses
    the Anthropic API directly to simulate command execution.
    """

    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ClaudeError(
                "ANTHROPIC_API_KEY not found. "
                "Set it in your environment or .env file."
            )

    def stream_command(self, command: str, user_input: str) -> Iterator[str]:
        """
        Execute a Claude Code command and stream the output.

        Args:
            command: Command name (e.g., "issue", "plan", "implement")
            user_input: User's natural language input

        Yields:
            Chunks of text output from the command execution
        """
        # TODO: Replace with actual Claude Code SDK when available
        # For now, this is a placeholder showing the interface

        from anthropic import Anthropic

        client = Anthropic(api_key=self.api_key)

        # Load the command meta-prompt
        command_path = f".claude/commands/{command}.md"
        try:
            with open(command_path) as f:
                command_prompt = f.read()
        except FileNotFoundError:
            raise ClaudeError(f"Command not found: {command_path}")

        # Construct the full prompt
        full_prompt = f"{command_prompt}\n\nUser request: {user_input}"

        # Stream response
        with client.messages.stream(
            model="claude-sonnet-4-20250514",
            max_tokens=4000,
            messages=[{"role": "user", "content": full_prompt}],
        ) as stream:
            for text in stream.text_stream:
                yield text

    def run_command(self, command: str, user_input: str) -> str:
        """
        Execute a command and return the complete output.

        Args:
            command: Command name
            user_input: User's natural language input

        Returns:
            Complete output text
        """
        return "".join(self.stream_command(command, user_input))
