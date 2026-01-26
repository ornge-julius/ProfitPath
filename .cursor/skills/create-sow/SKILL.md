---
name: create-sow
description: Generate a Statement of Work (SOW) markdown file for a described feature or problem. Use when the user says "CMD MD" followed by a feature description, or asks to create/generate an SOW document.
---

# Create Statement of Work

Generate a comprehensive SOW markdown document that a developer or AI agent can use to implement a feature.

## Trigger

Activated by the keyword **"CMD MD"** followed by a feature description or problem statement.

## Workflow

### Phase 1: Understand the Request

1. **Parse the input** after "CMD MD" to extract:
   - Core feature/problem description
   - Any specific requirements mentioned
   - Technical constraints or preferences
   - Target files or components (if mentioned)

2. **Research the codebase** to understand:
   - Existing patterns and conventions
   - Related components or features
   - File structure and naming conventions
   - Technology stack (React, Tailwind, Supabase, etc.)

3. **Identify gaps** - if critical information is missing, ask clarifying questions before generating.

### Phase 2: Generate the SOW

Create a markdown file in `docs/` with SCREAMING_SNAKE_CASE naming (e.g., `FEATURE_NAME.md`).

**Required sections:**

```markdown
# [Feature Name]

## Overview
One-paragraph summary of the feature and its purpose.

## Problem Statement
Describe the current state, pain points, or gaps that this feature addresses.

## Requirements

### Functional Requirements
Numbered list of what the feature must do.

### Non-Functional Requirements
Performance, accessibility, responsiveness, security considerations.

## Technical Implementation
Specific guidance on how to build it:
- Recommended approach/pattern
- Code examples or pseudocode
- File locations and naming
- Dependencies or libraries to use

## Acceptance Criteria
Gherkin-format scenarios using **Given/When/Then**.

## Edge Cases
Numbered list of boundary conditions to handle.

## Testing Checklist
Checkbox list for manual verification.

## Related Resources (optional)
Links to documentation, libraries, or references.
```

### Phase 3: Output

1. Write the file to `docs/[FEATURE_NAME].md`
2. Confirm creation with a brief summary

## SOW Template

Use this structure for all generated SOWs:

```markdown
# [Feature Title]

## Overview

[Brief description of the feature and why it matters to users]

## Problem Statement

[Current state and the gap/pain point being addressed]

## Requirements

### Functional Requirements

1. **[Requirement Name]**: [Description of what must happen]
2. **[Requirement Name]**: [Description]
3. ...

### Non-Functional Requirements

1. **Performance**: [Performance expectations]
2. **Responsiveness**: [Viewport/device considerations]
3. **Accessibility**: [A11y requirements]
4. **Security**: [Security considerations if applicable]

## Technical Implementation

### Recommended Approach

[Description of the implementation strategy]

### Code Example

\`\`\`[language]
// Example code or pseudocode
\`\`\`

### File Structure

- `path/to/file.jsx` - [Purpose]
- `path/to/another.jsx` - [Purpose]

### Dependencies

- [Library name] - [Purpose]

## Acceptance Criteria

### Scenario 1: [Scenario Name]
- **Given** [precondition]
- **When** [action]
- **Then** [expected result]
- **And** [additional result]

### Scenario 2: [Scenario Name]
- **Given** [precondition]
- **When** [action]
- **Then** [expected result]

## Edge Cases

1. **[Edge Case Name]**: [Description and how to handle it]
2. **[Edge Case Name]**: [Description]
3. ...

## Testing Checklist

- [ ] [Test case 1]
- [ ] [Test case 2]
- [ ] [Test case 3]
- [ ] Works on Chrome, Firefox, Safari, Edge
- [ ] Works on mobile devices
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly

## Related Resources

- [Resource name](URL)
```

## Writing Guidelines

### Acceptance Criteria

Follow Gherkin format strictly. Bold the keywords:

```markdown
- **Given** the user is on the dashboard
- **When** they click the export button
- **Then** a CSV file downloads
- **And** it contains all visible trades
```

### Technical Implementation

Be specific enough that implementation is unambiguous:
- Include actual file paths when known
- Reference existing patterns in the codebase
- Provide code snippets for non-obvious implementations
- Specify library versions if relevant

### Edge Cases

Think through:
- Empty states
- Error states
- Boundary values (min/max)
- Concurrent operations
- Mobile/touch interactions
- Accessibility scenarios
- Network failures

### Testing Checklist

Cover:
- Happy path functionality
- Cross-browser compatibility
- Mobile/responsive behavior
- Keyboard navigation
- Screen reader compatibility
- Performance with large datasets

## File Naming

- Use SCREAMING_SNAKE_CASE: `FEATURE_NAME.md`
- Be descriptive: `USER_AUTHENTICATION_FLOW.md` not `AUTH.md`
- Match the feature name in the title

## Quality Checklist

Before finalizing, verify:

- [ ] Overview clearly explains the "why"
- [ ] All functional requirements are testable
- [ ] Technical implementation matches codebase patterns
- [ ] Acceptance criteria cover all requirements
- [ ] Edge cases are comprehensive
- [ ] Testing checklist is actionable
