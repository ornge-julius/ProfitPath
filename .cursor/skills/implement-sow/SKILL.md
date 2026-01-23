---
name: implement-sow
description: Implement development changes from a tagged Statement of Work (SOW) markdown file. Use when the user tags a .md file and asks to implement it, build it, or make the changes described in the document.
---

# Implement Statement of Work

Implement changes from a tagged SOW markdown file by analyzing requirements, creating an actionable plan, then executing the implementation.

## Workflow

### Phase 1: Analysis

1. **Read the tagged file** completely
2. **Extract key sections**:
   - Overview/Problem Statement → understand the "why"
   - Requirements (Functional & Non-Functional) → the "what"
   - Technical Implementation → the "how"
   - Acceptance Criteria → success conditions
   - Edge Cases → boundary conditions to handle

3. **Identify the scope**:
   - Which files need to be created or modified?
   - What dependencies are involved?
   - Are there any blockers or prerequisites?

4. **Study existing patterns**: Before writing any code, examine similar features in the codebase:
   - Find components/modules that do similar things
   - Note naming conventions, folder structure, and file organization
   - Identify shared utilities, hooks, or helpers to reuse
   - Understand state management patterns in use
   - Check how styling is typically applied

### Phase 2: Planning

Create a todo list using Cursor's built-in todo system. Structure todos as:

1. **Setup/Prerequisites** (if any)
2. **Core Implementation** - break into logical units
3. **Edge Case Handling**
4. **Polish** (styling, UX refinements)

**Todo naming convention**: Use action verbs and be specific
- Good: "Add sticky positioning to first table column"
- Vague: "Update table"

**Granularity guideline**: Each todo should represent ~5-30 minutes of work. Break large items into subtasks.

### Phase 3: Implementation

For each todo:

1. Mark it `in_progress`
2. Read relevant existing files first
3. Make the changes
4. Mark it `completed`
5. Move to next todo

**Implementation principles**:
- **Follow existing design patterns**: Before implementing, study similar features in the codebase. Match naming conventions, file structure, component patterns, and coding style already established.
- **No breaking changes**: Ensure backward compatibility. Existing functionality must continue to work. If a breaking change is unavoidable, flag it and get explicit approval.
- **Performance awareness**: Consider render cycles, unnecessary re-renders, large bundle impacts, expensive operations in loops, and memory leaks. Avoid N+1 queries, excessive DOM manipulation, or blocking the main thread.
- **Security mindfulness**: Sanitize user inputs, avoid exposing sensitive data, use parameterized queries, validate on both client and server, and never trust client-side data alone.
- Prefer editing existing files over creating new ones
- Keep changes minimal and focused
- Handle edge cases identified in the SOW

### Phase 4: Summary

After completing all todos:
- Summarize what was implemented
- Note any deviations from the SOW (and why)
- List any remaining items for manual verification

## Important Constraints

- **No auto-commits**: Do not create git commits. The user handles version control.
- **No auto-validation**: Do not run linting or tests unless explicitly asked.
- **Stay in scope**: Only implement what's described in the SOW. Flag scope creep.

## Quality Gates

Before marking implementation complete, verify:

| Check | Question to Ask |
|-------|-----------------|
| **Pattern consistency** | Does this match how similar features are built in the codebase? |
| **Breaking changes** | Will existing functionality still work? Are APIs backward compatible? |
| **Performance** | Are there unnecessary re-renders, expensive operations, or memory concerns? |
| **Security** | Is user input sanitized? Is sensitive data protected? Are there injection risks? |
| **Reusability** | Am I duplicating code that already exists? Should this be extracted to a shared utility? |

## Example Todo Structure

For a "Sticky Table Column" SOW:

```
1. [in_progress] Add CSS for sticky first column positioning
2. [pending] Apply sticky styles to header cell
3. [pending] Add visual shadow separator
4. [pending] Handle alternating row background colors
5. [pending] Test horizontal scroll behavior
```

## Edge Cases

- **Incomplete SOW**: If the SOW lacks technical details, propose an approach and confirm before implementing.
- **Conflicting requirements**: Flag contradictions and ask for clarification.
- **Missing context**: If the SOW references files/components not found, ask the user for guidance.
- **Pattern mismatch**: If the SOW suggests an approach that conflicts with existing codebase patterns, flag it and recommend the pattern-consistent alternative.
- **Breaking change required**: If a requirement cannot be met without breaking existing functionality, stop and get explicit approval before proceeding.
- **Security concern**: If the SOW asks for something that introduces security risks (e.g., storing secrets in code, disabling validation), flag it immediately.
